import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'

/**
 * Subscriber: delivery.created
 * Dispatches delivery confirmation and botanical unboxing guide to the customer upon verified delivery.
 */
export default async function deliveryCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; order_id?: string; no_notification?: boolean }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (data?.no_notification) {
    logger.info(`[DeliveryCreatedSubscriber] Skipping: no_notification is requested for fulfillment ${data?.id}`)
    return
  }

  const fulfillmentId = data?.id
  const orderId = data?.order_id

  if (!fulfillmentId && !orderId) {
    logger.warn('[DeliveryCreatedSubscriber] Skipping: missing fulfillment/order id in event payload')
    return
  }

  try {
    let targetOrder: any = null
    let targetFulfillment: any = null

    if (orderId) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'email', 'shipping_address.*', 'fulfillments.*'],
        filters: { id: orderId },
      })
      targetOrder = orders?.[0]
      if (targetOrder?.fulfillments) {
        targetFulfillment = targetOrder.fulfillments.find((f: any) => f.id === fulfillmentId) || targetOrder.fulfillments[0]
      }
    } else if (fulfillmentId) {
      let orders: any[] = []
      try {
        const res = await query.graph({
          entity: 'order',
          fields: ['id', 'display_id', 'email', 'shipping_address.*', 'fulfillments.*'],
          filters: {
            fulfillments: { id: fulfillmentId },
          } as any,

        })
        orders = res.data || []
      } catch {
        const res = await query.graph({
          entity: 'order',
          fields: ['id', 'display_id', 'email', 'shipping_address.*', 'fulfillments.*'],
          pagination: { take: 50 },
        })
        orders = res.data || []
      }
      targetOrder = orders?.find((ord: any) =>
        ord.fulfillments?.some((f: any) => f.id === fulfillmentId)
      )
      if (targetOrder) {
        targetFulfillment = targetOrder.fulfillments?.find((f: any) => f.id === fulfillmentId)
      }
    }


    if (!targetOrder || !targetOrder.email) {
      logger.warn(
        `[DeliveryCreatedSubscriber] Order or email not found for fulfillment ${fulfillmentId}`
      )
      return
    }

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[DeliveryCreatedSubscriber] Notification module not available')
      return
    }

    const idempotencyKey = `notif:delivery-created:${targetOrder.id}:${fulfillmentId || 'delivered'}`

    await notificationModule.createNotifications({
      to: targetOrder.email,
      channel: 'email',
      template: 'delivery-completed',
      data: {
        order_id: targetOrder.id,
        display_id: targetOrder.display_id,
        delivered_at: targetFulfillment?.delivered_at || new Date(),
        customer_name: targetOrder.shipping_address?.first_name
          ? `${targetOrder.shipping_address.first_name} ${targetOrder.shipping_address.last_name || ''}`.trim()
          : undefined,
        delivery: {
          id: fulfillmentId || 'delivery',
          delivered_at: targetFulfillment?.delivered_at || new Date(),
          order: {
            id: targetOrder.id,
            display_id: targetOrder.display_id,
          },
        },
      },
      trigger_type: 'delivery.created',
      resource_id: targetOrder.id,
      resource_type: 'order',
      idempotency_key: idempotencyKey,
    })

    logger.info(
      `[DeliveryCreatedSubscriber] Queued delivery confirmation for ${maskEmail(targetOrder.email)} (Order: #${targetOrder.display_id || targetOrder.id})`
    )
  } catch (error: any) {
    logger.error(
      `[DeliveryCreatedSubscriber] Failed to dispatch delivery notification: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'delivery.created',
  context: {
    subscriberId: 'delivery-created-notification',
  },
}
