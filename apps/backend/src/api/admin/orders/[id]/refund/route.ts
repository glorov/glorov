import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { refundPaymentWorkflow } from '@medusajs/medusa/core-flows'
import { adminRefundSchema } from '@glorov/types'

/**
 * POST /admin/orders/:id/refund
 * Initiates an authorized refund via Medusa's native refundPaymentWorkflow.
 *
 * Enforces:
 * 1. Verified capture status (cannot refund uncaptured payments).
 * 2. Strict amount verification (cannot exceed captured - already refunded).
 * 3. Duplicate prevention via idempotency keys.
 * 4. Separate handling for COD (rejects fake COD gateway refunds; instructs to use COD UTR workflow).
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const orderId = req.params.id
  if (!orderId) {
    res.status(400).json({ message: 'Order ID is required' })
    return
  }

  const parseResult = adminRefundSchema.safeParse(req.body)
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid refund data'
    res.status(400).json({ message: firstError })
    return
  }

  const { amount_inr, payment_id, reason, note, idempotency_key } = parseResult.data
  const requestedPaise = Math.round(amount_inr * 100)

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
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    // 1. Resolve payments in order
    const paymentCollections = ((order as any).payment_collections || []) as any[]
    const allPayments = paymentCollections.flatMap((pc) => pc.payments || [])

    if (allPayments.length === 0) {
      res.status(422).json({
        success: false,
        message: 'No payments found on this order to refund.',
      })
      return
    }

    const targetPayment = payment_id
      ? allPayments.find((p) => p.id === payment_id)
      : allPayments.find((p) => p.captures && p.captures.length > 0) || allPayments[0]

    if (!targetPayment) {
      res.status(404).json({
        message: `Payment ${payment_id} not found on order #${order.display_id || order.id}`,
      })
      return
    }

    // 2. COD Guardrail: Reject fake gateway refund on COD payments
    const isCodPayment =
      targetPayment.provider_id?.includes('cod') ||
      targetPayment.provider_id === 'cash-on-delivery'

    if (isCodPayment) {
      res.status(422).json({
        success: false,
        message:
          'Cannot process automatic gateway refund for Cash on Delivery (COD) order. COD refunds require the verified bank transfer payout workflow (POST /admin/payments/cod/refund) with customer account details and bank UTR.',
      })
      return
    }

    // 3. Verify payment is actually captured
    const captures = targetPayment.captures || []
    const isCaptured =
      captures.length > 0 ||
      targetPayment.status === 'captured' ||
      (order as any).payment_status === 'captured'

    if (!isCaptured) {
      res.status(422).json({
        success: false,
        message: `Payment ${targetPayment.id} has not been captured (current status: ${targetPayment.status || (order as any).payment_status || 'not_captured'}). Only captured payments are eligible for refund.`,
      })
      return
    }

    // 4. Calculate amount eligible for refund
    const capturedPaise = captures.reduce(
      (sum: number, cap: any) => sum + Number(cap.amount || cap.raw_amount || 0),
      0
    ) || Number(targetPayment.amount || order.total || 0)

    const existingRefunds = targetPayment.refunds || []
    const alreadyRefundedPaise = existingRefunds.reduce(
      (sum: number, ref: any) => sum + Number(ref.amount || ref.raw_amount || 0),
      0
    )

    const eligiblePaise = Math.max(0, capturedPaise - alreadyRefundedPaise)

    if (requestedPaise > eligiblePaise) {
      res.status(422).json({
        success: false,
        message: `Requested refund of ₹${amount_inr} exceeds maximum eligible amount of ₹${(eligiblePaise / 100).toFixed(2)} (Captured: ₹${(capturedPaise / 100).toFixed(2)}, Already refunded: ₹${(alreadyRefundedPaise / 100).toFixed(2)}).`,
        eligible_amount_inr: eligiblePaise / 100,
        captured_amount_inr: capturedPaise / 100,
        already_refunded_inr: alreadyRefundedPaise / 100,
      })
      return
    }

    // 5. Duplicate Prevention / Idempotency check
    if (idempotency_key) {
      const isDuplicateKey = existingRefunds.some(
        (r: any) => r.idempotency_key === idempotency_key
      )
      if (isDuplicateKey) {
        res.status(409).json({
          success: false,
          message: `A refund with idempotency key "${idempotency_key}" was already recorded. Duplicate refund prevented.`,
          idempotency_key,
        })
        return
      }
    } else {
      // Rapid double-click protection (within 5 seconds) for identical amount on the same payment
      const isRapidDuplicate = existingRefunds.some(
        (r: any) =>
          Number(r.amount) === requestedPaise &&
          Date.now() - new Date(r.created_at || 0).getTime() < 5000
      )
      if (isRapidDuplicate) {
        res.status(409).json({
          success: false,
          message: 'An identical refund was submitted seconds ago. Duplicate submission prevented.',
        })
        return
      }
    }

    const resolvedIdempotencyKey =
      idempotency_key ||
      `ref_${order.id}_${targetPayment.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // 6. Run native Medusa refundPaymentWorkflow
    logger.info(
      `Executing refundPaymentWorkflow for Payment ${targetPayment.id} (Order #${order.display_id || order.id}, Amount: ₹${amount_inr})...`
    )

    await refundPaymentWorkflow(req.scope).run({
      input: {
        payment_id: targetPayment.id,
        amount: requestedPaise,
        note: note || reason,
        idempotency_key: resolvedIdempotencyKey,
      },
    })

    // 7. Update return requests if any approved request was awaiting refund
    const orderModule = req.scope.resolve(Modules.ORDER)
    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    const returnRequests = ((existingMeta.return_requests || []) as any[])
    let returnRequestUpdated = false

    const updatedRequests = returnRequests.map((rr) => {
      if (rr.status === 'approved' && rr.refund_status === 'pending') {
        returnRequestUpdated = true
        return {
          ...rr,
          refund_status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_amount_inr: amount_inr,
        }
      }
      return rr
    })

    const refundAuditEntry = {
      payment_id: targetPayment.id,
      amount_inr,
      reason,
      idempotency_key: resolvedIdempotencyKey,
      refunded_at: new Date().toISOString(),
      refunded_by:
        (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
          ?.actor_id || 'admin',
    }

    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...existingMeta,
          return_requests: updatedRequests,
          refund_audit: [
            ...((existingMeta.refund_audit as any[]) || []),
            refundAuditEntry,
          ],
        },
      },
    ])

    const remainingEligiblePaise = eligiblePaise - requestedPaise
    const newPaymentStatus =
      remainingEligiblePaise === 0 ? 'refunded' : 'partially_refunded'

    logger.info(
      `Refund of ₹${amount_inr} successfully completed for Order #${order.display_id || order.id}.`
    )

    res.status(200).json({
      success: true,
      message: `Refund of ₹${amount_inr.toFixed(2)} has been successfully processed.`,
      order_id: order.id,
      payment_id: targetPayment.id,
      refunded_amount_inr: amount_inr,
      remaining_eligible_inr: remainingEligiblePaise / 100,
      payment_status: newPaymentStatus,
      return_request_settled: returnRequestUpdated,
      audit: refundAuditEntry,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Refund execution failed'
    logger.error(`Error processing refund for Order ${orderId}: ${errMsg}`)
    res.status(500).json({
      success: false,
      message: errMsg,
    })
  }
}
