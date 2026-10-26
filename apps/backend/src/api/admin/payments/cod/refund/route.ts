import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { refundPaymentWorkflow } from '@medusajs/medusa/core-flows'
import { adminCodRefundSchema } from '@glorov/types'
import { sendSanitizedError } from '../../../../../utils/error-handler'

/**
 * POST /admin/payments/cod/refund
 * Explicitly designed Cash on Delivery (COD) refund workflow.
 *
 * Physical cash cannot be refunded automatically via card gateways.
 * A genuine COD refund requires direct bank transfer (NEFT/IMPS) with verified
 * customer account details and bank UTR reconciliation.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const parseResult = adminCodRefundSchema.safeParse(req.body)
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid COD refund data'
    res.status(400).json({ message: firstError })
    return
  }

  const {
    order_id,
    amount_inr,
    bank_account_number,
    bank_ifsc,
    account_holder_name,
    bank_name,
    bank_utr,
    payout_date,
    reason,
  } = parseResult.data

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'status',
        'total',
        'payment_status',
        'currency_code',
        'payment_collections.*',
        'payment_collections.payments.*',
        'payment_collections.payments.captures.*',
        'payment_collections.payments.refunds.*',
        'metadata',
      ],
      filters: { id: order_id },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${order_id} was not found` })
      return
    }

    // 1. Verify this is a COD order
    const isCod =
      String((order as any).metadata?.payment_method || '').toLowerCase() === 'cod' ||
      Boolean((order as any).metadata?.is_cod) ||
      (order as any).payment_collections?.some((pc: any) =>
        pc.payments?.some((p: any) => p.provider_id?.includes('cod'))
      )

    if (!isCod) {
      res.status(422).json({
        success: false,
        message: 'This order was not placed via Cash on Delivery (COD). Use the standard refund route for online prepaid orders.',
      })
      return
    }

    // 2. Resolve COD Payment
    const paymentCollections = ((order as any).payment_collections || []) as any[]
    const allPayments = paymentCollections.flatMap((pc) => pc.payments || [])
    const codPayment =
      allPayments.find((p) => p.provider_id?.includes('cod')) || allPayments[0]

    if (!codPayment) {
      res.status(422).json({
        success: false,
        message: 'No COD payment session found on this order.',
      })
      return
    }

    // 3. Verify COD payment is captured (cash collected and remitted to merchant bank)
    const isCaptured =
      codPayment.status === 'captured' ||
      (order as any).payment_status === 'captured' ||
      Boolean((order as any).metadata?.payment_settled) ||
      Boolean((order as any).metadata?.cod_settlement)

    if (!isCaptured) {
      res.status(422).json({
        success: false,
        message:
          'Cannot process COD refund for an uncaptured order. Cash was never reconciled or remitted to GLOROV bank accounts.',
      })
      return
    }

    // 4. Validate refund amount bounds
    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    const codRefunds = ((existingMeta.cod_refunds || []) as any[])
    const alreadyRefundedInr = codRefunds.reduce(
      (sum: number, r: any) => sum + Number(r.amount_inr || 0),
      0
    )

    const orderTotalInr = (order.total || 0) / 100
    const eligibleRefundInr = Math.max(0, orderTotalInr - alreadyRefundedInr)

    if (amount_inr > eligibleRefundInr) {
      res.status(422).json({
        success: false,
        message: `Refund of ₹${amount_inr} exceeds remaining eligible amount of ₹${eligibleRefundInr.toFixed(2)} (Order total: ₹${orderTotalInr.toFixed(2)}, Already refunded: ₹${alreadyRefundedInr.toFixed(2)}).`,
      })
      return
    }

    // 5. Prevent duplicate UTR across all orders
    const { data: allOrdersWithCod } = await query.graph({
      entity: 'order',
      fields: ['id', 'display_id', 'metadata'],
    })

    for (const ord of (allOrdersWithCod || []) as any[]) {
      const ordMeta = (ord.metadata || {}) as Record<string, any>
      const ordRefunds = (ordMeta.cod_refunds || []) as any[]
      const dup = ordRefunds.find((r: any) => r.bank_utr === bank_utr)
      if (dup) {
        const orderIdentifier =
          ord.id === order.id ? 'this order' : `Order #${ord.display_id || ord.id}`
        res.status(409).json({
          success: false,
          message: `Bank UTR reference "${bank_utr}" was already recorded for a payout on ${orderIdentifier}. Duplicate payout rejected.`,
          existing_order_id: ord.id,
        })
        return
      }
    }

    // 6. Execute native Medusa refundPaymentWorkflow
    const requestedPaise = Math.round(amount_inr * 100)
    const idempotencyKey = `cod_refund_${order.id}_${bank_utr}`

    logger.info(
      `Processing verified COD bank payout for Order #${order.display_id || order.id} (UTR: ${bank_utr}, Amount: ₹${amount_inr})...`
    )

    // Pass bank_utr in context so CodPaymentProviderService validates and records it
    await refundPaymentWorkflow(req.scope).run({
      input: {
        payment_id: codPayment.id,
        amount: requestedPaise,
        note: `COD Bank Payout UTR: ${bank_utr} (Account: ...${bank_account_number.slice(-4)}, IFSC: ${bank_ifsc}) - ${reason}`,
        idempotency_key: idempotencyKey,
      },
    })

    // 7. Record immutable COD bank settlement record in metadata
    const actorId =
      (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
        ?.actor_id || 'admin'

    const maskedAccount = `XXXXXX${bank_account_number.slice(-4)}`
    const codRefundRecord = {
      payout_id: `cod_ref_${Date.now()}`,
      amount_inr,
      bank_account_masked: maskedAccount,
      bank_ifsc,
      account_holder_name,
      bank_name: bank_name || null,
      bank_utr,
      payout_date: payout_date || new Date().toISOString(),
      reconciled_at: new Date().toISOString(),
      reconciled_by: actorId,
      reason,
    }

    // Update return requests if any approved request was awaiting refund
    const returnRequests = ((existingMeta.return_requests || []) as any[])
    const updatedReturnRequests = returnRequests.map((rr) => {
      if (rr.status === 'approved' && rr.refund_status === 'pending') {
        return {
          ...rr,
          refund_status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_amount_inr: amount_inr,
          bank_utr,
        }
      }
      return rr
    })

    const orderModule = req.scope.resolve(Modules.ORDER)
    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...existingMeta,
          cod_refunds: [...codRefunds, codRefundRecord],
          return_requests: updatedReturnRequests,
        },
      },
    ])

    logger.info(
      `COD refund for Order #${order.display_id || order.id} successfully recorded with UTR ${bank_utr}.`
    )

    res.status(200).json({
      success: true,
      message: `Cash on Delivery refund of ₹${amount_inr.toFixed(2)} recorded with confirmed bank UTR ${bank_utr}.`,
      order_id: order.id,
      cod_refund: codRefundRecord,
      remaining_eligible_inr: eligibleRefundInr - amount_inr,
    })
  } catch (error: unknown) {
    logger.error(`Error processing COD refund for Order ${order_id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    sendSanitizedError(res, error, 500, { order_id })
  }
}
