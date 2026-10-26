import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/**
 * GET /admin/orders/:id/return-requests
 * Retrieve all return requests submitted by customer for this order,
 * including administrative decisions and refund progress.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const orderId = req.params.id
  if (!orderId) {
    res.status(400).json({ message: 'Order ID is required' })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'status',
        'total',
        'currency_code',
        'email',
        'payment_status',
        'fulfillment_status',
        'metadata',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    const meta = (order.metadata || {}) as Record<string, unknown>
    const returnRequests = meta.return_requests || []

    res.status(200).json({
      order_id: order.id,
      display_id: order.display_id,
      total_inr: (order.total || 0) / 100,
      payment_status: (order as any).payment_status || 'pending',
      fulfillment_status: (order as any).fulfillment_status || 'not_fulfilled',
      return_requests: returnRequests,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to retrieve return requests'
    res.status(500).json({ message: errMsg })
  }
}
