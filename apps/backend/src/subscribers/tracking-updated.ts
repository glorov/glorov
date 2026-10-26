import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: tracking.updated
 * Dispatches active tracking link and courier details upon tracking information availability.
 * Follows non-blocking failure isolation, respects no_notification flag, and uses deterministic idempotency.
 */
export default async function trackingUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  id?: string
  fulfillment_id?: string
  order_id?: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  no_notification?: boolean
}>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (data?.no_notification) {
    logger.info('[TrackingUpdatedSubscriber] Skipping: no_notification is requested')
    return
  }

  const fulfillmentId = data?.fulfillment_id || data?.id
  const orderId = data?.order_id
  const directTrackingNumber = data?.tracking_number

  if (!fulfillmentId && !orderId && !directTrackingNumber) {
    logger.warn('[TrackingUpdatedSubscriber] Skipping: missing fulfillment/order id in payload')
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
          'fulfillments.labels.*',
        ],
        filters: { id: orderId },
      })
      targetOrder = orders?.[0]
      if (targetOrder?.fulfillments) {
        targetFulfillment =
          targetOrder.fulfillments.find((f: any) => f.id === fulfillmentId) ||
          targetOrder.fulfillments[0]
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
        `[TrackingUpdatedSubscriber] Order or email not found for tracking update (order: ${orderId}, fulfillment: ${fulfillmentId})`
      )
      return
    }

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[TrackingUpdatedSubscriber] Notification module not available')
      return
    }

    const label = targetFulfillment?.labels?.[0]
    const trackingNumber =
      directTrackingNumber ||
      label?.tracking_number ||
      targetFulfillment?.data?.awb_code ||
      targetFulfillment?.data?.tracking_number ||
      ''

    // Safe public tracking link: strictly without sensitive authentication tokens or credentials
    const trackingUrl =
      data?.tracking_url ||
      label?.tracking_url ||
      (trackingNumber
        ? `https://shiprocket.co/tracking/${encodeURIComponent(trackingNumber)}`
        : 'https://shiprocket.co/tracking')

    const carrier =
      data?.carrier ||
      targetFulfillment?.data?.courier_name ||
      targetFulfillment?.data?.carrier ||
      'Shiprocket Express'

    // Deterministic idempotency key
    const idempotencyKey = `notif:tracking-updated:${targetOrder.id}:${trackingNumber || fulfillmentId || 'active'}`

    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: targetOrder.email,
          channel: 'email',
          template: 'tracking-updated',
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
              order: {
                id: targetOrder.id,
                display_id: targetOrder.display_id,
              },
            },
          },
          trigger_type: 'tracking.updated',
          resource_id: targetOrder.id,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'TrackingUpdatedSubscriber',
        eventName: 'tracking.updated',
        resourceId: targetOrder.id,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[TrackingUpdatedSubscriber] Queued tracking update for ${maskEmail(targetOrder.email)} (Order: #${targetOrder.display_id || targetOrder.id}, AWB: ${trackingNumber || 'N/A'})`
      )
    } else {
      logger.error(
        `[TrackingUpdatedSubscriber] Failed to dispatch tracking update email: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[TrackingUpdatedSubscriber] Failed to dispatch tracking update email: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'tracking.updated',
  context: {
    subscriberId: 'tracking-updated-notification',
  },
}
