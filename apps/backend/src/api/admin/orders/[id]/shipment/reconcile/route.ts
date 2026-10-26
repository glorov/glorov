import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import {
  markOrderFulfillmentAsDeliveredWorkflow,
  cancelOrderFulfillmentWorkflow,
} from '@medusajs/medusa/core-flows'
import { ShiprocketClient } from '../../../../../../modules/fulfillment-shiprocket/client'

/**
 * POST /admin/orders/:id/shipment/reconcile
 * Queries Shiprocket tracking API for latest carrier status and reconciles
 * Medusa fulfillment state (delivered, in-transit, out-for-delivery, RTO, canceled).
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
        'fulfillments.*',
        'fulfillments.labels.*',
        'fulfillments.items.*',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    const fulfillments = ((order as any).fulfillments || []).filter(
      (f: any) => !f.canceled_at
    )
    const targetFulfillment =
      fulfillments.find(
        (f: any) =>
          Boolean(f.data?.awb_code) ||
          Boolean(f.data?.shiprocket_order_id) ||
          Boolean(f.shipped_at) ||
          Boolean(f.labels && f.labels.length > 0)
      ) || fulfillments[0]

    if (!targetFulfillment) {
      res.status(404).json({
        success: false,
        message: 'No active shipment found to reconcile for this order.',
      })
      return
    }

    const awb =
      targetFulfillment.labels?.[0]?.tracking_number ||
      targetFulfillment.data?.awb_code

    if (!awb) {
      res.status(422).json({
        success: false,
        message: 'Active fulfillment is missing AWB tracking reference.',
      })
      return
    }

    const client = new ShiprocketClient()
    const trackingRes = await client.trackAwb(awb)

    const trackData = trackingRes.tracking_data
    const currentTrack = trackData?.shipment_track?.[0]
    const rawStatus = (currentTrack?.current_status || '').toUpperCase()

    let actionTaken = 'scans_updated'

    if (rawStatus === 'DELIVERED') {
      if (targetFulfillment.delivered_at) {
        actionTaken = 'idempotent_skip_already_delivered'
      } else {
        try {
          await markOrderFulfillmentAsDeliveredWorkflow(req.scope).run({
            input: {
              orderId: order.id,
              fulfillmentId: targetFulfillment.id,
            },
          })
          actionTaken = 'reconciled_marked_delivered'
        } catch (err: unknown) {
          logger.warn(`Reconcile mark as delivered workflow warning: ${err}`)
          actionTaken = 'mark_delivered_error'
        }
      }
    } else if (rawStatus === 'CANCELLED' || rawStatus === 'CANCELED') {
      if (targetFulfillment.canceled_at) {
        actionTaken = 'idempotent_skip_already_cancelled'
      } else {
        try {
          await cancelOrderFulfillmentWorkflow(req.scope).run({
            input: {
              order_id: order.id,
              fulfillment_id: targetFulfillment.id,
            },
          })
          actionTaken = 'reconciled_marked_cancelled'
        } catch (err: unknown) {
          logger.warn(`Reconcile cancel fulfillment workflow warning: ${err}`)
          actionTaken = 'cancel_fulfillment_error'
        }
      }
    }

    res.status(200).json({
      success: true,
      order_id: order.id,
      fulfillment_id: targetFulfillment.id,
      awb,
      current_status: rawStatus || 'IN_TRANSIT',
      action_taken: actionTaken,
      scans: currentTrack?.scans || [],
      reconciled_at: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Shipment reconciliation failed'
    logger.error(`Reconciliation error for Order ${orderId}: ${errMsg}`)
    res.status(500).json({ message: errMsg })
  }
}
