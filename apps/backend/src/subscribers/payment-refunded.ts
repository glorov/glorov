import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: payment.refunded
 * Dispatches refund status email to the customer with banking clearance timelines.
 */
export default async function paymentRefundedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; refund_id?: string; amount?: number; order_id?: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const paymentId = data?.id
  const orderId = data?.order_id
  const refundId = data?.refund_id
  const refundAmount = data?.amount


  try {
    let targetOrder: any = null

    if (orderId) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: [
          'id',
          'display_id',
          'email',
          'total',
          'shipping_address.*',
          'payment_collections.payments.*',
          'payment_collections.payments.refunds.*',
        ],
        filters: { id: orderId },
      })
      targetOrder = orders?.[0]
    } else if (paymentId) {
      let orders: any[] = []
      try {
        const res = await query.graph({
          entity: 'order',
          fields: [
            'id',
            'display_id',
            'email',
            'total',
            'shipping_address.*',
            'payment_collections.payments.*',
            'payment_collections.payments.refunds.*',
          ],
          filters: {
            payment_collections: {
              payments: { id: paymentId },
            },
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
            'total',
            'shipping_address.*',
            'payment_collections.payments.*',
            'payment_collections.payments.refunds.*',
          ],
          pagination: { take: 50 },
        })
        orders = res.data || []
      }
      targetOrder = orders?.find((ord: any) =>
        ord.payment_collections?.some((col: any) =>
          col.payments?.some((p: any) => p.id === paymentId)
        )
      )
    }

    if (!targetOrder || !targetOrder.email) {
      logger.warn(
        `[PaymentRefundedSubscriber] Could not resolve order or customer email for refund on payment ${paymentId}`
      )
      return
    }

    // Resolve accurate refund details from payment collections if not in event payload
    let resolvedRefundAmount = refundAmount
    let resolvedRefundId = refundId
    let resolvedReason: string | undefined

    if (targetOrder.payment_collections) {
      for (const col of targetOrder.payment_collections) {
        for (const p of col.payments || []) {
          if (!paymentId || p.id === paymentId) {
            const refunds = p.refunds || []
            if (refunds.length > 0) {
              const latest = refunds[refunds.length - 1]
              resolvedRefundId = resolvedRefundId || latest.id
              if (!resolvedRefundAmount) {
                resolvedRefundAmount = latest.amount ?? latest.raw_amount
              }
              resolvedReason = latest.refund_reason?.label || latest.note
            }
          }
        }
      }
    }

    const finalRefundAmount = resolvedRefundAmount || targetOrder.total
    const finalRefundId = resolvedRefundId || paymentId || 'refund'

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[PaymentRefundedSubscriber] Notification module not available')
      return
    }

    const idempotencyKey = `notif:payment-refunded:${targetOrder.id}:${finalRefundId}`

    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: targetOrder.email,
          channel: 'email',
          template: 'refund-processed',
          data: {
            order_id: targetOrder.id,
            display_id: targetOrder.display_id,
            amount: finalRefundAmount,
            refund_id: finalRefundId,
            reason: resolvedReason,
            customer_name: targetOrder.shipping_address?.first_name
              ? `${targetOrder.shipping_address.first_name} ${targetOrder.shipping_address.last_name || ''}`.trim()
              : undefined,
            refund: {
              id: finalRefundId,
              amount: finalRefundAmount,
              reason: resolvedReason,
              order: {
                id: targetOrder.id,
                display_id: targetOrder.display_id,
              },
            },
          },
          trigger_type: 'payment.refunded',
          resource_id: targetOrder.id,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'PaymentRefundedSubscriber',
        eventName: 'payment.refunded',
        resourceId: targetOrder.id,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[PaymentRefundedSubscriber] Queued refund notification for ${maskEmail(targetOrder.email)} (Order: #${targetOrder.display_id || targetOrder.id})`
      )
    } else {
      logger.error(
        `[PaymentRefundedSubscriber] Failed to dispatch refund notification: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[PaymentRefundedSubscriber] Failed to dispatch refund notification: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'payment.refunded',
  context: {
    subscriberId: 'payment-refunded-notification',
  },
}
