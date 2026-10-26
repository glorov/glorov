import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { adminReturnReviewSchema } from '@glorov/types'

/**
 * POST /admin/orders/:id/return-requests/:request_id/review
 * Review, approve, or reject a customer return request with recorded seller decision,
 * action plan (refund/exchange), and reverse shipping requirement.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const orderId = req.params.id
  const requestId = req.params.request_id

  if (!orderId || !requestId) {
    res.status(400).json({ message: 'Order ID and Request ID are required' })
    return
  }

  const parseResult = adminReturnReviewSchema.safeParse(req.body)
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid review data'
    res.status(400).json({ message: firstError })
    return
  }

  const {
    decision,
    decision_notes,
    customer_note,
    return_action,
    refund_amount_inr,
    return_shipping_required,
  } = parseResult.data

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: ['id', 'display_id', 'total', 'metadata'],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    const meta = (order.metadata || {}) as Record<string, unknown>
    const returnRequests = ((meta.return_requests || []) as any[])

    const requestIndex = returnRequests.findIndex((r) => r.id === requestId)
    if (requestIndex === -1) {
      res.status(404).json({
        message: `Return request ${requestId} not found on order #${order.display_id || order.id}`,
      })
      return
    }

    const existingReq = returnRequests[requestIndex]
    const actorId =
      (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
        ?.actor_id || 'admin'

    const updatedDecision = {
      decision,
      decided_at: new Date().toISOString(),
      decided_by: actorId,
      decision_notes,
      customer_note: customer_note || null,
      return_action: decision === 'approved' ? return_action : 'reject',
      return_shipping_required: decision === 'approved' ? Boolean(return_shipping_required) : false,
    }

    let refundStatus = existingReq.refund_status
    if (decision === 'approved') {
      if (return_action === 'approve_with_refund') {
        refundStatus = 'pending'
      } else {
        refundStatus = 'not_applicable'
      }
    } else {
      refundStatus = 'rejected'
    }

    const updatedRequest = {
      ...existingReq,
      status: decision,
      seller_decision: updatedDecision,
      refund_status: refundStatus,
      refund_amount_inr: refund_amount_inr ?? existingReq.refund_amount_inr ?? null,
    }

    returnRequests[requestIndex] = updatedRequest

    const orderModule = req.scope.resolve(Modules.ORDER)
    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...meta,
          return_requests: returnRequests,
        },
      },
    ])

    logger.info(
      `Return request ${requestId} on Order #${order.display_id || order.id} reviewed by ${actorId}: ${decision.toUpperCase()}.`
    )

    res.status(200).json({
      success: true,
      message: `Return request ${requestId} has been marked as ${decision}.`,
      return_request: updatedRequest,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to review return request'
    logger.error(`Error reviewing return request ${requestId}: ${errMsg}`)
    res.status(500).json({ message: errMsg })
  }
}
