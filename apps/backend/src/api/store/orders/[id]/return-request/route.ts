import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { orderReturnRequestSchema } from '@glorov/types'

interface OrderItem {
  id: string
  title?: string
  subtitle?: string
  quantity: number
  unit_price?: number
  variant_sku?: string
  variant_title?: string
  product_title?: string
  metadata?: Record<string, unknown>
}

interface ReturnRequestItemRecord {
  line_item_id: string
  title: string
  variant_title?: string
  sku?: string
  quantity: number
  unit_price: number
  reason: string
  customer_note?: string
}

interface ReturnRequestRecord {
  id: string
  created_at: string
  status: 'pending_review' | 'approved' | 'rejected'
  items: ReturnRequestItemRecord[]
  customer_notes?: string
  seller_decision?: {
    decision: 'approved' | 'rejected'
    decided_at: string
    decided_by?: string
    decision_notes?: string
    return_action?: string
    return_shipping_required?: boolean
  } | null
  refund_status: 'not_applicable' | 'pending' | 'refunded' | 'rejected'
  refund_amount_inr?: number
  tracking_number?: string
}

/**
 * GET /store/orders/:id/return-request
 * Retrieve return requests submitted for this order.
 * Sanitizes administrative notes and internal provider credentials.
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
      fields: ['id', 'display_id', 'status', 'metadata'],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    const meta = (order.metadata || {}) as Record<string, unknown>
    const returnRequests = ((meta.return_requests || []) as ReturnRequestRecord[]).map(
      (rr) => ({
        id: rr.id,
        created_at: rr.created_at,
        status: rr.status,
        items: rr.items.map((it) => ({
          line_item_id: it.line_item_id,
          title: it.title,
          variant_title: it.variant_title,
          sku: it.sku,
          quantity: it.quantity,
          reason: it.reason,
        })),
        customer_notes: rr.customer_notes || null,
        seller_decision: rr.seller_decision
          ? {
              decision: rr.seller_decision.decision,
              decided_at: rr.seller_decision.decided_at,
              customer_note: (rr.seller_decision as any).customer_note || null,
              return_action: rr.seller_decision.return_action || null,
              return_shipping_required: Boolean(rr.seller_decision.return_shipping_required),
            }
          : null,
        refund_status: rr.refund_status,
        refund_amount_inr: rr.refund_amount_inr || null,
      })
    )

    res.status(200).json({
      order_id: order.id,
      display_id: order.display_id,
      return_requests: returnRequests,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to retrieve return requests'
    res.status(500).json({ message: errMsg })
  }
}

/**
 * POST /store/orders/:id/return-request
 * Submit a return request for eligible delivered items in an order.
 * Validates item ownership, quantities, and order fulfillment state.
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

  const parseResult = orderReturnRequestSchema.safeParse(req.body)
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid return request data'
    res.status(400).json({ message: firstError })
    return
  }

  const { items: requestedItems, customer_notes } = parseResult.data

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'status',
        'fulfillment_status',
        'items.*',
        'fulfillments.*',
        'metadata',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    // 1. Order cannot be canceled
    if (order.status === 'canceled') {
      res.status(400).json({
        success: false,
        message: 'Cannot request a return for a canceled order.',
      })
      return
    }

    // 2. Order must be fulfilled, shipped, or delivered
    const fulfillments = ((order as any).fulfillments || []) as Array<{
      shipped_at?: string | null
      delivered_at?: string | null
      canceled_at?: string | null
    }>
    const activeFulfillments = fulfillments.filter((f) => !f.canceled_at)
    const hasShippedOrDeliveredFulfillments = activeFulfillments.some(
      (f) => Boolean(f.shipped_at) || Boolean(f.delivered_at)
    )
    const orderAny = order as any
    const isDispatched =
      activeFulfillments.length > 0 ||
      hasShippedOrDeliveredFulfillments ||
      orderAny.fulfillment_status === 'fulfilled' ||
      orderAny.fulfillment_status === 'partially_fulfilled' ||
      orderAny.fulfillment_status === 'shipped' ||
      orderAny.fulfillment_status === 'partially_shipped' ||
      orderAny.fulfillment_status === 'delivered'

    if (!isDispatched) {
      res.status(400).json({
        success: false,
        message:
          'Return requests can only be submitted for orders that have been dispatched or delivered. To cancel an unfulfilled order, please use the cancellation option.',
      })
      return
    }

    // 3. Validate line items and quantities against ordered and already requested quantities
    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    const existingRequests = (existingMeta.return_requests || []) as ReturnRequestRecord[]

    // Calculate previously requested return quantities across active return requests
    const previouslyRequestedMap = new Map<string, number>()
    for (const er of existingRequests) {
      if (er.status !== 'rejected') {
        for (const it of er.items || []) {
          const prev = previouslyRequestedMap.get(it.line_item_id) || 0
          previouslyRequestedMap.set(it.line_item_id, prev + it.quantity)
        }
      }
    }

    const orderItems = (order.items || []) as OrderItem[]
    const orderItemMap = new Map<string, OrderItem>()
    for (const oi of orderItems) {
      orderItemMap.set(oi.id, oi)
    }

    const validatedItems: ReturnRequestItemRecord[] = []
    for (const reqItem of requestedItems) {
      const matched = orderItemMap.get(reqItem.line_item_id)
      if (!matched) {
        res.status(400).json({
          success: false,
          message: `Item with id ${reqItem.line_item_id} does not belong to order #${order.display_id || order.id}.`,
        })
        return
      }

      const alreadyRequested = previouslyRequestedMap.get(reqItem.line_item_id) || 0
      const remainingEligible = Math.max(0, matched.quantity - alreadyRequested)

      if (remainingEligible === 0) {
        res.status(400).json({
          success: false,
          message: `All ordered units (${matched.quantity}) of "${matched.title || 'item'}" have already been submitted for return in previous requests.`,
        })
        return
      }

      if (reqItem.quantity > remainingEligible) {
        res.status(400).json({
          success: false,
          message: `Requested return quantity (${reqItem.quantity}) for "${matched.title || 'item'}" exceeds remaining eligible unreturned quantity (${remainingEligible} of ${matched.quantity}).`,
        })
        return
      }

      // Track within this batch to prevent duplicate line item ids in the same request payload
      previouslyRequestedMap.set(reqItem.line_item_id, alreadyRequested + reqItem.quantity)

      validatedItems.push({
        line_item_id: matched.id,
        title: matched.title || 'Botanical Item',
        variant_title: matched.variant_title,
        sku: matched.variant_sku,
        quantity: reqItem.quantity,
        unit_price: matched.unit_price || 0,
        reason: reqItem.reason,
        customer_note: reqItem.customer_note || undefined,
      })
    }

    // 4. Construct return request record
    const requestId = `retreq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const newReturnRequest: ReturnRequestRecord = {
      id: requestId,
      created_at: new Date().toISOString(),
      status: 'pending_review',
      items: validatedItems,
      customer_notes: customer_notes || undefined,
      seller_decision: null,
      refund_status: 'not_applicable',
    }

    // 5. Append to order metadata
    const orderModule = req.scope.resolve(Modules.ORDER)
    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...existingMeta,
          return_requests: [...existingRequests, newReturnRequest],
        },
      },
    ])

    logger.info(
      `Return request ${requestId} created for Order #${order.display_id || order.id} with ${validatedItems.length} items.`
    )

    res.status(201).json({
      success: true,
      message:
        'Your return request has been submitted successfully and is pending seller review. You will receive an email once the request has been reviewed.',
      return_request: {
        id: newReturnRequest.id,
        created_at: newReturnRequest.created_at,
        status: newReturnRequest.status,
        items: newReturnRequest.items,
        customer_notes: newReturnRequest.customer_notes || null,
        refund_status: newReturnRequest.refund_status,
      },
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Failed to submit return request'
    logger.error(`Error submitting return request for Order ${orderId}: ${errMsg}`)
    res.status(500).json({
      success: false,
      message: errMsg,
    })
  }
}
