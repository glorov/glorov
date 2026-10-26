import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: order.placed
 * Dispatches an itemized order confirmation email to the customer upon verified order placement.
 * Uses Medusa Query Graph for verified order data and enforces non-blocking failure isolation.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const orderId = data?.id
  if (!orderId) {
    logger.warn('[OrderPlacedSubscriber] Skipping: missing order id in event payload')
    return
  }

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'email',
        'currency_code',
        'total',
        'subtotal',
        'shipping_total',
        'tax_total',
        'discount_total',
        'items.*',
        'shipping_address.*',
        'created_at',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[OrderPlacedSubscriber] Order ${orderId} not found in query graph`)
      return
    }

    if (!order.email) {
      logger.warn(`[OrderPlacedSubscriber] Order ${orderId} has no recipient email address`)
      return
    }

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[OrderPlacedSubscriber] Notification module not resolved from container')
      return
    }

    const idempotencyKey = `notif:order-placed:${order.id}`

    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: order.email,
          channel: 'email',
          template: 'order-placed',
          data: {
            order: {
              id: order.id,
              display_id: order.display_id,
              email: order.email,
              currency_code: order.currency_code,
              total: order.total,
              subtotal: order.subtotal,
              shipping_total: order.shipping_total,
              tax_total: order.tax_total,
              discount_total: order.discount_total,
              items: order.items,
              shipping_address: order.shipping_address,
              created_at: order.created_at,
            },
          },
          trigger_type: 'order.placed',
          resource_id: order.id,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'OrderPlacedSubscriber',
        eventName: 'order.placed',
        resourceId: order.id,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[OrderPlacedSubscriber] Successfully queued order confirmation for ${maskEmail(order.email)} (Order: #${order.display_id || order.id})`
      )
    } else {
      logger.error(
        `[OrderPlacedSubscriber] Failed to dispatch order confirmation for order ${orderId}: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[OrderPlacedSubscriber] Failed to dispatch order confirmation for order ${orderId}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
  context: {
    subscriberId: 'order-placed-notification',
  },
}
