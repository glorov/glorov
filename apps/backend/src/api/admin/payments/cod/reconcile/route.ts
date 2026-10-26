import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { capturePaymentWorkflow } from '@medusajs/medusa/core-flows'

interface CodReconciliationPayload {
  order_id: string
  remittance_ref: string
  amount_collected_inr: number
  bank_utr?: string
  remittance_date?: string
  courier_deductions_inr?: number
}

/**
 * POST /admin/payments/cod/reconcile
 * Reconciles cash remittances from courier aggregators (Shiprocket / Delhivery)
 * to GLOROV's bank account for delivered Cash on Delivery (COD) orders.
 *
 * Enforces strict separation between delivery confirmation and financial settlement:
 * Delivering a COD shipment confirms receipt, but payment remains uncaptured until
 * courier remittance is formally recorded and reconciled here.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const {
    order_id,
    remittance_ref,
    amount_collected_inr,
    bank_utr,
    remittance_date,
    courier_deductions_inr = 0,
  } = (req.body || {}) as CodReconciliationPayload

  if (!order_id || !remittance_ref || typeof amount_collected_inr !== 'number') {
    res.status(400).json({
      message:
        'Missing required fields: order_id, remittance_ref, and amount_collected_inr are required.',
    })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'total',
        'payment_status',
        'fulfillment_status',
        'payment_collections.*',
        'payment_collections.payments.*',
        'metadata',
      ],
      filters: { id: order_id },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${order_id} was not found` })
      return
    }

    const orderAny = order as any
    const orderTotalINR = (order.total || 0) / 100

    // Validate that amount collected corresponds to order amount
    if (Math.abs(amount_collected_inr - orderTotalINR) > 1.0) {
      res.status(422).json({
        success: false,
        message: `Remittance amount mismatch: expected ₹${orderTotalINR}, received ₹${amount_collected_inr}.`,
      })
      return
    }

    // Check existing payment status
    if (orderAny.payment_status === 'captured') {
      res.status(200).json({
        success: true,
        message: 'Order COD payment is already reconciled and captured.',
        order_id: order.id,
        payment_status: 'captured',
        already_reconciled: true,
      })
      return
    }

    // Find the COD payment session / payment in payment collection
    const paymentCollections = (order as any).payment_collections || []
    const payments = paymentCollections.flatMap((pc: any) => pc.payments || [])
    const codPayment =
      payments.find((p: any) =>
        p.provider_id?.includes('cod') ||
        p.provider_id === 'cash-on-delivery' ||
        p.provider_id === 'system_default'
      ) || payments[0]

    let paymentCaptured = false

    if (codPayment?.id) {
      try {
        await capturePaymentWorkflow(req.scope).run({
          input: {
            payment_id: codPayment.id,
            captured_by: (req as any).auth_context?.actor_id || 'admin',
          },
        })
        paymentCaptured = true
      } catch (captureErr: unknown) {
        logger.warn(`Could not run capturePaymentWorkflow for payment ${codPayment.id}: ${captureErr}`)
      }
    }

    // Update order metadata with immutable settlement audit trail
    const orderModule = req.scope.resolve(Modules.ORDER)
    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    const settlementAudit = {
      remittance_ref,
      bank_utr: bank_utr || null,
      remitted_amount_inr: amount_collected_inr,
      courier_deductions_inr,
      net_settled_inr: amount_collected_inr - courier_deductions_inr,
      remittance_date: remittance_date || new Date().toISOString(),
      reconciled_at: new Date().toISOString(),
      reconciled_by: (req as any).auth_context?.actor_id || 'admin',
    }

    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...existingMeta,
          cod_settlement: settlementAudit,
          payment_settled: true,
        },
      },
    ])

    logger.info(
      `COD remittance reconciled for Order ${order_id} (Ref: ${remittance_ref}, Amount: ₹${amount_collected_inr}).`
    )

    res.status(200).json({
      success: true,
      message: 'COD remittance successfully reconciled and settled into store accounts.',
      order_id: order.id,
      amount_settled_inr: amount_collected_inr,
      remittance_ref,
      payment_captured: paymentCaptured,
      settlement_record: settlementAudit,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'COD reconciliation failed'
    logger.error(`Error in COD reconciliation for Order ${order_id}: ${errMsg}`)
    res.status(500).json({ message: errMsg })
  }
}
