import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: order.canceled
 * Dispatches order cancellation and refund timeline email to customer upon cancellation.
 */
export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const orderId = data?.id
  if (!orderId) {
    logger.warn('[OrderCanceledSubscriber] Skipping: missing order id in event payload')
    return
  }

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: ['id', 'display_id', 'email', 'total', 'currency_code', 'status', 'shipping_address.*'],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order || !order.email) {
      logger.warn(`[OrderCanceledSubscriber] Order ${orderId} or customer email not found`)
      return
    }

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[OrderCanceledSubscriber] Notification module not available')
      return
    }

    const idempotencyKey = `notif:order-canceled:${order.id}`

    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: order.email,
          channel: 'email',
          template: 'order-canceled',
          data: {
            order: {
              id: order.id,
              display_id: order.display_id,
              total: order.total,
            },
            order_id: order.id,
            display_id: order.display_id,
            customer_name: order.shipping_address?.first_name
              ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
              : undefined,
          },
          trigger_type: 'order.canceled',
          resource_id: order.id,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'OrderCanceledSubscriber',
        eventName: 'order.canceled',
        resourceId: order.id,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[OrderCanceledSubscriber] Queued cancellation notification for ${maskEmail(order.email)} (Order: #${order.display_id || order.id})`
      )
    } else {
      logger.error(
        `[OrderCanceledSubscriber] Failed to dispatch order cancellation email for ${orderId}: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[OrderCanceledSubscriber] Failed to dispatch order cancellation email for ${orderId}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'order.canceled',
  context: {
    subscriberId: 'order-canceled-notification',
  },
}
