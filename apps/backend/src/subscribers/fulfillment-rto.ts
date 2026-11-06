import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { refundPaymentWorkflow } from '@medusajs/medusa/core-flows'

/**
 * Subscriber: fulfillment.rto
 * Triggered when a shipment is marked as Return to Origin (RTO) by logistics aggregators (Shiprocket).
 *
 * Responsibilities:
 * 1. Prominently logs RTO event with botanical triage alert.
 * 2. Updates order metadata with RTO audit history and status.
 * 3. Sends urgent admin notification email to trigger botanical stock triage.
 * 4. Automatically initiates refund workflow for prepaid captured orders.
 */
export default async function fulfillmentRtoHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  order_id: string
  fulfillment_id?: string
  awb?: string
  raw_status?: string
  reason?: string
  timestamp?: string
}>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const orderId = data?.order_id
  const awb = data?.awb || 'N/A'
  const reason = data?.reason || 'Return to Origin'

  if (!orderId) {
    logger.warn('[FulfillmentRTOSubscriber] Skipping: missing order_id in event payload')
    return
  }

  // 1. Prominent Log Alert
  logger.error(
    `🚨 [FulfillmentRTOSubscriber] RETURN TO ORIGIN (RTO) DETECTED for Order ${orderId}! AWB: ${awb}. Reason: ${reason}. Requires seller botanical inventory inspection and triage.`
  )

  try {
    // 2. Fetch Order Details
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'email',
        'total',
        'payment_status',
        'status',
        'shipping_address.*',
        'items.*',
        'payment_collections.*',
        'payment_collections.payments.*',
        'payment_collections.payments.captures.*',
        'payment_collections.payments.refunds.*',
        'metadata',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      logger.warn(`[FulfillmentRTOSubscriber] Order ${orderId} not found in database`)
      return
    }

    // 3. Update Order Metadata
    let orderModule: any = null
    try {
      orderModule = container.resolve(Modules.ORDER)
    } catch {
      logger.warn('[FulfillmentRTOSubscriber] Order module not available')
    }

    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    const existingRtoEvents = Array.isArray(existingMeta.rto_events)
      ? (existingMeta.rto_events as any[])
      : []

    const rtoEntry = {
      awb,
      fulfillment_id: data?.fulfillment_id || null,
      raw_status: data?.raw_status || 'RTO',
      reason,
      detected_at: data?.timestamp || new Date().toISOString(),
    }

    if (orderModule?.updateOrders) {
      await orderModule.updateOrders([
        {
          id: order.id,
          metadata: {
            ...existingMeta,
            rto_status: 'RECEIVED',
            rto_detected_at: new Date().toISOString(),
            rto_awb: awb,
            rto_reason: reason,
            rto_events: [...existingRtoEvents, rtoEntry],
          },
        },
      ])
      logger.info(
        `[FulfillmentRTOSubscriber] Updated metadata on Order #${order.display_id || order.id} with RTO audit event`
      )
    }

    // 4. Auto-Initiate Refund Workflow for Prepaid Orders
    const payments = (order.payment_collections || []).flatMap(
      (col: any) => col.payments || []
    )

    let isPrepaid = false
    let autoRefundInitiated = false

    for (const payment of payments) {
      const isCod =
        payment.provider_id === 'payment-cod' ||
        payment.provider_id === 'pp_system_default'
      if (isCod) continue

      isPrepaid = true

      const capturedPaise =
        (payment.captures || []).reduce(
          (sum: number, c: any) => sum + Number(c.amount || 0),
          0
        ) ||
        (payment.captured_at || (order as any).payment_status === 'captured'
          ? Number(payment.amount || 0)
          : 0)

      const refundedPaise = (payment.refunds || []).reduce(
        (sum: number, r: any) => sum + Number(r.amount || 0),
        0
      )

      const refundablePaise = capturedPaise - refundedPaise

      if (refundablePaise > 0) {
        try {
          const idempotencyKey = `rto_refund_${order.id}_${payment.id}_${awb || Date.now()}`
          await refundPaymentWorkflow(container).run({
            input: {
              payment_id: payment.id,
              amount: refundablePaise,
              note: `Automated refund for RTO shipment (AWB: ${awb}, reason: ${reason})`,
              idempotency_key: idempotencyKey,
            },
          })
          autoRefundInitiated = true
          logger.info(
            `[FulfillmentRTOSubscriber] Auto-initiated refund of ₹${refundablePaise / 100} for prepaid RTO Order #${order.display_id || order.id}`
          )
        } catch (refundErr: any) {
          logger.error(
            `[FulfillmentRTOSubscriber] Failed to auto-initiate refund for Order ${order.id}: ${refundErr?.message || refundErr}`
          )
        }
      }
    }

    // 5. Send Admin Notification Email
    let notificationModule: any = null
    try {
      notificationModule = container.resolve(Modules.NOTIFICATION)
    } catch {
      logger.warn('[FulfillmentRTOSubscriber] Notification module not available')
    }

    if (notificationModule?.createNotifications) {
      try {
        const adminEmail =
          process.env.ADMIN_NOTIFICATION_EMAIL ||
          process.env.ADMIN_EMAIL ||
          'admin@glorov.in'

        const customerName = order.shipping_address?.first_name
          ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
          : 'Valued Customer'

        await notificationModule.createNotifications({
          to: adminEmail,
          channel: 'email',
          template: 'rto-notification',
          data: {
            order_id: order.id,
            display_id: order.display_id,
            awb,
            reason,
            customer_name: customerName,
            customer_email: order.email,
            order_total: order.total,
            is_prepaid: isPrepaid,
            refund_status: autoRefundInitiated
              ? 'Initiated'
              : isPrepaid
                ? 'Pending Manual Review'
                : 'COD - No Refund Needed',
            subject: `[ALERT] Return to Origin (RTO) for Order #${order.display_id || order.id} (AWB: ${awb})`,
          },
          trigger_type: 'fulfillment.rto',
          resource_id: order.id,
          resource_type: 'order',
          idempotency_key: `notif:rto:${order.id}:${awb || Date.now()}`,
        })

        logger.info(
          `[FulfillmentRTOSubscriber] Dispatched RTO alert email to admin (${adminEmail}) for Order #${order.display_id || order.id}`
        )
      } catch (emailErr: any) {
        logger.error(
          `[FulfillmentRTOSubscriber] Failed to dispatch admin email for Order ${orderId}: ${emailErr?.message || emailErr}`
        )
      }
    }
  } catch (error: any) {
    logger.error(
      `[FulfillmentRTOSubscriber] Error processing RTO event for order ${orderId}: ${error?.message || error}`
    )
  }
}

export const config: SubscriberConfig = {
  event: 'fulfillment.rto',
  context: {
    subscriberId: 'fulfillment-rto-handler',
  },
}
