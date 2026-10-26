import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: shipment.created
 * Dispatches shipment dispatch and tracking notification with live plant transit advice.
 */
export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; order_id?: string; no_notification?: boolean }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (data?.no_notification) {
    logger.info(`[ShipmentCreatedSubscriber] Skipping: no_notification is requested for fulfillment ${data?.id}`)
    return
  }

  const fulfillmentId = data?.id
  const orderId = data?.order_id

  if (!fulfillmentId && !orderId) {
    logger.warn('[ShipmentCreatedSubscriber] Skipping: missing fulfillment/order id in event payload')
    return
  }

  try {
    let targetOrder: any = null
    let targetFulfillment: any = null

    if (orderId) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: [
          'id',
          'display_id',
          'email',
          'shipping_address.*',
          'items.*',
          'fulfillments.*',
          'fulfillments.items.*',
          'fulfillments.labels.*',
        ],
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
          fields: [
            'id',
            'display_id',
            'email',
            'shipping_address.*',
            'items.*',
            'fulfillments.*',
            'fulfillments.items.*',
            'fulfillments.labels.*',
          ],
          filters: {
            fulfillments: { id: fulfillmentId },
          } as any,

        })
        orders = res.data || []
      } catch {
        const res = await query.graph({
          entity: 'order',
          fields: [
            'id',
            'display_id',
            'email',
            'shipping_address.*',
            'items.*',
            'fulfillments.*',
            'fulfillments.items.*',
            'fulfillments.labels.*',
          ],
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
        `[ShipmentCreatedSubscriber] Order or email not found for fulfillment ${fulfillmentId}`
      )
      return
    }

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[ShipmentCreatedSubscriber] Notification module not available')
      return
    }

    const label = targetFulfillment?.labels?.[0]
    const trackingNumber =
      label?.tracking_number ||
      targetFulfillment?.data?.awb_code ||
      targetFulfillment?.data?.tracking_number ||
      ''

    // Safe public tracking link: strictly without sensitive authentication tokens or credentials
    const trackingUrl =
      label?.tracking_url ||
      (trackingNumber
        ? `https://shiprocket.co/tracking/${encodeURIComponent(trackingNumber)}`
        : 'https://shiprocket.co/tracking')

    const carrier =
      targetFulfillment?.data?.courier_name ||
      targetFulfillment?.data?.carrier ||
      'Shiprocket Express'

    const shipmentItems = (targetFulfillment?.items?.length ? targetFulfillment.items : targetOrder.items || []).map((it: any) => ({
      title: it.title || it.line_item?.title || 'Botanical product',
      variant_title: it.variant_title || it.line_item?.variant_title || '',
      quantity: Number(it.quantity) || 1,
    }))

    const idempotencyKey = `notif:shipment-created:${targetOrder.id}:${fulfillmentId || trackingNumber || 'shipment'}`


    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: targetOrder.email,
          channel: 'email',
          template: 'shipment-created',
          data: {
            order_id: targetOrder.id,
            display_id: targetOrder.display_id,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            carrier,
            customer_name: targetOrder.shipping_address?.first_name
              ? `${targetOrder.shipping_address.first_name} ${targetOrder.shipping_address.last_name || ''}`.trim()
              : undefined,
            shipment: {
              id: fulfillmentId || 'shipment',
              tracking_number: trackingNumber,
              tracking_url: trackingUrl,
              carrier,
              items: shipmentItems,
              order: {
                id: targetOrder.id,
                display_id: targetOrder.display_id,
              },
            },
          },
          trigger_type: 'shipment.created',
          resource_id: targetOrder.id,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'ShipmentCreatedSubscriber',
        eventName: 'shipment.created',
        resourceId: targetOrder.id,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[ShipmentCreatedSubscriber] Queued shipment notification for ${maskEmail(targetOrder.email)} (Order: #${targetOrder.display_id || targetOrder.id}, AWB: ${trackingNumber || 'N/A'})`
      )
    } else {
      logger.error(
        `[ShipmentCreatedSubscriber] Failed to dispatch shipment email: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[ShipmentCreatedSubscriber] Failed to dispatch shipment email: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'shipment.created',
  context: {
    subscriberId: 'shipment-created-notification',
  },
}
