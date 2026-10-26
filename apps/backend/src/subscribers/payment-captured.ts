import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: payment.captured
 * Dispatches payment receipt confirmation email to the customer upon verified payment capture.
 */
export default async function paymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; order_id?: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const paymentId = data?.id
  const orderId = data?.order_id

  if (!paymentId && !orderId) {
    logger.warn('[PaymentCapturedSubscriber] Skipping: missing payment/order id in event payload')
    return
  }

  try {
    let targetOrder: any = null
    let targetPayment: any = null

    if (orderId) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'email', 'total', 'currency_code', 'payment_collections.payments.*'],
        filters: { id: orderId },
      })
      targetOrder = orders?.[0]
      if (targetOrder?.payment_collections) {
        for (const col of targetOrder.payment_collections) {
          const match = col.payments?.find((p: any) => p.id === paymentId)
          if (match) {
            targetPayment = match
            break
          }
        }
      }
    } else if (paymentId) {
      // Find order owning this payment via targeted relation filter
      let orders: any[] = []
      try {
        const res = await query.graph({
          entity: 'order',
          fields: ['id', 'display_id', 'email', 'total', 'currency_code', 'payment_collections.payments.*'],
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
          fields: ['id', 'display_id', 'email', 'total', 'currency_code', 'payment_collections.payments.*'],
          pagination: { take: 50 },
        })
        orders = res.data || []
      }
      targetOrder = orders?.find((ord: any) =>
        ord.payment_collections?.some((col: any) =>
          col.payments?.some((p: any) => p.id === paymentId)
        )
      )
      if (targetOrder) {
        for (const col of targetOrder.payment_collections || []) {
          const match = col.payments?.find((p: any) => p.id === paymentId)
          if (match) {
            targetPayment = match
            break
          }
        }
      }
    }


    if (!targetOrder || !targetOrder.email) {
      logger.warn(
        `[PaymentCapturedSubscriber] Order or customer email not found for payment ${paymentId || orderId}`
      )
      return
    }

    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[PaymentCapturedSubscriber] Notification module not available')
      return
    }

    const idempotencyKey = `notif:payment-captured:${targetOrder.id}:${paymentId || 'captured'}`

    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: targetOrder.email,
          channel: 'email',
          template: 'payment-captured',
          data: {
            order_id: targetOrder.id,
            display_id: targetOrder.display_id,
            amount: targetPayment?.amount || targetOrder.total,
            payment: {
              id: paymentId || 'captured_payment',
              amount: targetPayment?.amount || targetOrder.total,
              provider_id: targetPayment?.provider_id || 'razorpay',
              order: {
                id: targetOrder.id,
                display_id: targetOrder.display_id,
                total: targetOrder.total,
              },
            },
          },
          trigger_type: 'payment.captured',
          resource_id: targetOrder.id,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'PaymentCapturedSubscriber',
        eventName: 'payment.captured',
        resourceId: targetOrder.id,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[PaymentCapturedSubscriber] Queued payment confirmation for ${maskEmail(targetOrder.email)} (Order: #${targetOrder.display_id || targetOrder.id})`
      )
    } else {
      logger.error(
        `[PaymentCapturedSubscriber] Failed to dispatch payment receipt for payment ${paymentId}: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[PaymentCapturedSubscriber] Failed to dispatch payment receipt for payment ${paymentId}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'payment.captured',
  context: {
    subscriberId: 'payment-captured-notification',
  },
}
