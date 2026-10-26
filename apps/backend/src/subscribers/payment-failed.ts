import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { maskEmail } from '../modules/notification-email/utils/email-validator'
import { withBoundedRetry } from '../utils/async-retry'

/**
 * Subscriber: payment.failed
 * Dispatches helpful, non-accusatory payment retry instructions when an online payment fails.
 */
export default async function paymentFailedHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  order_id?: string
  customer_email?: string
  amount?: number
  error_code?: string
  error_description?: string
}>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const orderId = data?.order_id
  let recipientEmail = data?.customer_email
  let displayId: string | number | undefined
  let amount = data?.amount

  if (orderId) {
    try {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'email', 'total'],
        filters: { id: orderId },
      })
      const order = orders?.[0]
      if (order) {
        recipientEmail = recipientEmail || (order.email ?? undefined)
        displayId = order.display_id ?? undefined
        amount = amount || (order.total ?? undefined)
      }
    } catch (e: any) {
      logger.warn(`[PaymentFailedSubscriber] Could not resolve order details: ${e.message}`)
    }
  }

  if (!recipientEmail) {
    logger.warn('[PaymentFailedSubscriber] Skipping: no recipient email available')
    return
  }

  try {
    let notificationModule: any
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[PaymentFailedSubscriber] Notification module not available')
      return
    }

    const errorSuffix = data?.error_code ? `:${data.error_code}` : ''
    const idempotencyKey = orderId
      ? `notif:payment-failed:${orderId}${errorSuffix}`
      : `notif:payment-failed:${recipientEmail}:${amount || 'na'}${errorSuffix}`

    const retryResult = await withBoundedRetry(
      async () => {
        return await notificationModule.createNotifications({
          to: recipientEmail,
          channel: 'email',
          template: 'payment-failed',
          data: {
            order_id: orderId,
            display_id: displayId,
            amount: amount,
            error_code: data?.error_code,
            error_description: data?.error_description,
          },
          trigger_type: 'payment.failed',
          resource_id: orderId || null,
          resource_type: 'order',
          idempotency_key: idempotencyKey,
        })
      },
      {
        subscriberName: 'PaymentFailedSubscriber',
        eventName: 'payment.failed',
        resourceId: orderId || recipientEmail,
        resourceType: 'order',
        container,
      }
    )

    if (retryResult.success) {
      logger.info(
        `[PaymentFailedSubscriber] Queued payment failure notification for ${maskEmail(recipientEmail)}`
      )
    } else {
      logger.error(
        `[PaymentFailedSubscriber] Failed to dispatch payment failure alert: ${retryResult.error?.message || 'Delivery failed'}`
      )
    }
  } catch (error: any) {
    logger.error(
      `[PaymentFailedSubscriber] Failed to dispatch payment failure alert: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'payment.failed',
  context: {
    subscriberId: 'payment-failed-notification',
  },
}
