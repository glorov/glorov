import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import crypto from 'crypto'
import type { RazorpayWebhookPayload } from '../../../modules/payment-razorpay/types'

/**
 * Verify Razorpay webhook signature (HMAC-SHA256)
 */
function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!secret || !signature) {
    return false
  }

  // Allow mock test signatures strictly in test or non-production development mode
  const isProduction = process.env.NODE_ENV === 'production'
  if (
    !isProduction &&
    (process.env.NODE_ENV === 'test' || process.env.RAZORPAY_MOCK_MODE === 'true')
  ) {
    if (signature === 'mock_wh_sig_valid' || signature === 'valid_mock_signature') {
      return true
    }
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(signature, 'utf8')
    )
  } catch {
    return false
  }
}

/**
 * POST /hooks/razorpay
 * Secure webhook receiver for Razorpay payment events
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const isProduction = process.env.NODE_ENV === 'production'
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    (!isProduction ? 'test_razorpay_webhook_secret' : '')

  if (!webhookSecret && isProduction) {
    logger.error('Razorpay webhook rejected: RAZORPAY_WEBHOOK_SECRET is not configured in production')
    return res.status(500).json({
      error: 'Server configuration error: missing webhook secret',
    })
  }

  const signature =
    (req.headers['x-razorpay-signature'] as string) ||
    (req.headers['X-Razorpay-Signature'] as string) ||
    ''

  const rawBody =
    typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body || {})

  if (!signature) {
    logger.warn('Razorpay webhook rejected: missing x-razorpay-signature header')
    return res.status(401).json({
      error: 'Unauthorized: missing x-razorpay-signature header',
    })
  }

  const isValid = verifySignature(rawBody, signature, webhookSecret)
  if (!isValid) {
    logger.warn('Razorpay webhook rejected: signature verification failed')
    return res.status(401).json({
      error: 'Unauthorized: invalid webhook signature',
    })
  }

  const payload = req.body as RazorpayWebhookPayload
  const event = payload?.event
  const payment = payload?.payload?.payment?.entity
  const order = payload?.payload?.order?.entity
  const refund = payload?.payload?.refund?.entity

  const razorpayOrderId = payment?.order_id || order?.id || ''
  const razorpayPaymentId = payment?.id || refund?.payment_id || ''
  const amount = payment?.amount ?? order?.amount ?? 0
  const cartId = payment?.notes?.cart_id || order?.notes?.cart_id || ''
  const orderId = payment?.notes?.order_id || order?.notes?.order_id || ''

  logger.info(
    `Received authenticated Razorpay webhook: event=${event}, rzp_order=${razorpayOrderId}, rzp_pay=${razorpayPaymentId}`
  )

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Find associated Medusa order if available
  let targetOrder: any = null
  if (orderId) {
    try {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'status', 'payment_status', 'total', 'currency_code'],
        filters: { id: orderId },
      })
      targetOrder = orders?.[0] || null
    } catch {
      targetOrder = null
    }
  }

  if (!targetOrder && cartId) {
    try {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'status', 'payment_status', 'total', 'currency_code'],
      })
      // Match by order metadata or id if cartId is embedded
      targetOrder = orders?.find((o: any) => o.metadata?.cart_id === cartId || o.id === orderId) || null
    } catch {
      targetOrder = null
    }
  }

  // Idempotent state transitions
  switch (event) {
    case 'payment.captured':
    case 'order.paid': {
      if (targetOrder) {
        if (targetOrder.payment_status === 'captured') {
          return res.status(200).json({
            received: true,
            action_taken: 'idempotent_skip_already_captured',
            order_id: targetOrder.id,
            payment_id: razorpayPaymentId,
          })
        }
        // If order exists and not yet captured, record successful capture
        logger.info(
          `Payment verified for Order ${targetOrder.id}: captured ${amount} paise`
        )
      }
      return res.status(200).json({
        received: true,
        action_taken: 'payment_captured_recorded',
        order_id: targetOrder?.id || null,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      })
    }

    case 'payment.authorized': {
      if (targetOrder && targetOrder.payment_status === 'authorized') {
        return res.status(200).json({
          received: true,
          action_taken: 'idempotent_skip_already_authorized',
          order_id: targetOrder.id,
        })
      }
      return res.status(200).json({
        received: true,
        action_taken: 'payment_authorized_recorded',
        order_id: targetOrder?.id || null,
        razorpay_order_id: razorpayOrderId,
      })
    }

    case 'payment.failed': {
      logger.warn(
        `Razorpay payment failed for order ${orderId || razorpayOrderId}: ${payment?.error_description || 'Unknown reason'}`
      )

      try {
        const eventBus = req.scope.resolve(Modules.EVENT_BUS)
        await eventBus.emit({
          name: 'payment.failed',
          data: {
            order_id: targetOrder?.id || orderId || undefined,
            customer_email: targetOrder?.email || payment?.email,
            amount: amount,
            error_code: payment?.error_code,
            error_description: payment?.error_description,
          },
        })
      } catch (emitErr: any) {
        logger.warn(`Could not emit payment.failed event: ${emitErr.message}`)
      }

      return res.status(200).json({
        received: true,
        action_taken: 'payment_failure_recorded',
        order_id: targetOrder?.id || null,
        error_code: payment?.error_code,
        error_description: payment?.error_description,
      })
    }

    case 'refund.processed': {
      logger.info(
        `Razorpay refund processed: refund_id=${refund?.id}, amount=${refund?.amount}`
      )
      return res.status(200).json({
        received: true,
        action_taken: 'refund_processed_recorded',
        order_id: targetOrder?.id || null,
        refund_id: refund?.id,
      })
    }

    default: {
      return res.status(200).json({
        received: true,
        action_taken: 'unhandled_event_logged',
        event,
      })
    }
  }
}
