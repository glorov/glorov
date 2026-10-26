import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  cancelOrderWorkflow,
  cancelOrderFulfillmentWorkflow,
} from '@medusajs/medusa/core-flows'
import { orderCancellationSchema } from '@glorov/types'
import { sendSanitizedError } from '../../../../../utils/error-handler'

interface OrderFulfillment {
  id: string
  canceled_at?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
  data?: Record<string, unknown>
  labels?: Array<{ tracking_number?: string }>
}

/**
 * POST /store/orders/:id/cancel
 * Customer-facing cancellation route with strict eligibility checks,
 * courier fulfillment coordination, and inventory restoration.
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

  // Parse and validate body
  const parseResult = orderCancellationSchema.safeParse(req.body || {})
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid cancellation data'
    res.status(400).json({ success: false, message: firstError })
    return
  }
  const cancellationData = parseResult.data

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
        'customer_id',
        'email',
        'total',
        'items.*',
        'fulfillments.*',
        'fulfillments.labels.*',
        'payment_collections.*',
        'payment_collections.payments.*',
        'metadata',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    // 1. Check if already canceled
    if (order.status === 'canceled') {
      res.status(400).json({
        success: false,
        message: `Order #${order.display_id || order.id} is already canceled.`,
        order_id: order.id,
        status: order.status,
      })
      return
    }

    // 2. Check if order is completed
    if (order.status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Completed orders cannot be canceled. Please use the return request workflow.',
        order_id: order.id,
        status: order.status,
      })
      return
    }

    const fulfillments = (order.fulfillments || []) as OrderFulfillment[]
    const activeFulfillments = fulfillments.filter((f) => !f.canceled_at)

    // 3. Prevent cancellation if order has already shipped or delivered
    const hasShippedFulfillments = activeFulfillments.some(
      (f) => Boolean(f.shipped_at) || Boolean(f.delivered_at)
    )
    const orderFulfillmentStatus = (order as any).fulfillment_status
    const alreadyShipped =
      hasShippedFulfillments ||
      orderFulfillmentStatus === 'shipped' ||
      orderFulfillmentStatus === 'partially_shipped' ||
      orderFulfillmentStatus === 'delivered'

    if (alreadyShipped) {
      res.status(422).json({
        success: false,
        message:
          'Order has already been shipped and cannot be canceled in transit. You may request a return or botanical replacement claim once the package is delivered.',
        order_id: order.id,
        status: order.status,
      })
      return
    }

    // 4. Coordinate with existing fulfillment / Shiprocket integration
    // If fulfillments were created but not yet shipped, cancel them first.
    // Provider cancellation errors are NOT swallowed — if courier cancellation fails,
    // order cancellation aborts cleanly without falsely marking shipment as cancelled.
    for (const ful of activeFulfillments) {
      try {
        logger.info(
          `Cancelling active fulfillment ${ful.id} for Order ${orderId} before order cancellation...`
        )
        await cancelOrderFulfillmentWorkflow(req.scope).run({
          input: {
            order_id: order.id,
            fulfillment_id: ful.id,
          },
        })
      } catch (fulErr: unknown) {
        const errMsg =
          fulErr instanceof Error ? fulErr.message : 'Courier cancellation failed'
        logger.error(
          `Failed to cancel fulfillment ${ful.id} for Order ${orderId}: ${errMsg}`
        )
        res.status(502).json({
          success: false,
          message: `Unable to cancel order: logistics provider could not cancel shipment (${errMsg}). Please contact GLOROV support.`,
        })
        return
      }
    }

    // 5. Run native Medusa cancelOrderWorkflow
    // Automatically releases inventory reservations, cancels uncaptured payments,
    // refunds captured payments, and emits order.canceled event.
    const actorId =
      (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
        ?.actor_id || 'customer'

    await cancelOrderWorkflow(req.scope).run({
      input: {
        order_id: order.id,
        canceled_by: actorId,
      },
    })

    // 6. Record cancellation audit metadata
    const orderModule = req.scope.resolve(Modules.ORDER)
    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...existingMeta,
          cancellation: {
            canceled_at: new Date().toISOString(),
            canceled_by: actorId,
            reason: cancellationData.reason,
            customer_note: cancellationData.customer_note || null,
          },
        },
      },
    ])

    logger.info(
      `Order ${orderId} successfully canceled by ${actorId}. Reason: "${cancellationData.reason}".`
    )

    res.status(200).json({
      success: true,
      message: `Order #${order.display_id || order.id} has been successfully canceled.`,
      order_id: order.id,
      status: 'canceled',
    })
  } catch (error: unknown) {
    logger.error(`Error cancelling Order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    sendSanitizedError(res, error, 500, { order_id: orderId })
  }
}
