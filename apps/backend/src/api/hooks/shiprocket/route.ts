import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import crypto from 'crypto'
import {
  markOrderFulfillmentAsDeliveredWorkflow,
  createOrderShipmentWorkflow,
  cancelOrderFulfillmentWorkflow,
} from '@medusajs/medusa/core-flows'
import type { ShiprocketWebhookPayload } from '../../../modules/fulfillment-shiprocket/types'

/**
 * Constant-time token comparison to prevent side-channel timing attacks.
 */
function safeCompareTokens(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Normalize incoming status from Shiprocket payloads.
 */
function normalizeShiprocketStatus(payload: ShiprocketWebhookPayload): {
  normalized: 'DELIVERED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'RTO' | 'CANCELLED' | 'UNKNOWN'
  rawStatus: string
} {
  const raw = String(
    payload.current_status ||
      payload.shipment_status ||
      (payload.current_status_id === 7 ? 'DELIVERED' : '') ||
      ''
  )
    .trim()
    .toUpperCase()

  const id = Number(payload.current_status_id ?? payload.shipment_status_id)

  if (raw === 'DELIVERED' || id === 7) {
    return { normalized: 'DELIVERED', rawStatus: raw || 'DELIVERED' }
  }
  if (
    raw === 'SHIPPED' ||
    raw === 'IN_TRANSIT' ||
    raw === 'IN TRANSIT' ||
    raw === 'PICKED_UP' ||
    raw === 'PICKED UP' ||
    id === 6 ||
    id === 18 ||
    id === 20
  ) {
    return { normalized: 'SHIPPED', rawStatus: raw || 'IN_TRANSIT' }
  }
  if (raw === 'OUT_FOR_DELIVERY' || raw === 'OUT FOR DELIVERY' || id === 17) {
    return { normalized: 'OUT_FOR_DELIVERY', rawStatus: raw || 'OUT_FOR_DELIVERY' }
  }
  if (
    raw.includes('RTO') ||
    raw.includes('UNDELIVERED') ||
    raw.includes('RETURN') ||
    id === 9 ||
    id === 10 ||
    id === 15 ||
    id === 16
  ) {
    return { normalized: 'RTO', rawStatus: raw || 'RTO' }
  }
  if (raw === 'CANCELLED' || raw === 'CANCELED' || id === 8) {
    return { normalized: 'CANCELLED', rawStatus: raw || 'CANCELLED' }
  }

  return { normalized: 'UNKNOWN', rawStatus: raw || 'UNKNOWN' }
}

/**
 * POST /hooks/shiprocket
 * Inbound webhook receiver for Shiprocket tracking status updates, AWB progress,
 * and delivery exceptions (NDR / RTO).
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // 1. Webhook Authenticity Verification (Fail-closed in production, constant-time compare)
  const isProduction = process.env.NODE_ENV === 'production'
  const configuredToken =
    process.env.SHIPROCKET_WEBHOOK_TOKEN ||
    process.env.SHIPROCKET_WEBHOOK_SECRET

  if (!configuredToken) {
    if (isProduction) {
      logger.error('Shiprocket webhook rejected: SHIPROCKET_WEBHOOK_TOKEN is not configured in production')
      res.status(500).json({ message: 'Server configuration error' })
      return
    }
  } else {
    // In production, reject tokens passed in query parameters to prevent access-log leakage
    const receivedToken =
      (req.headers['x-api-key'] as string) ||
      (req.headers['x-shiprocket-token'] as string) ||
      (!isProduction ? (req.query?.token as string) : undefined)

    if (!receivedToken || !safeCompareTokens(receivedToken, configuredToken)) {
      logger.warn('Unauthorized Shiprocket webhook attempt rejected: invalid or missing token')
      res.status(401).json({
        message: 'Unauthorized: Invalid Shiprocket webhook token or signature',
      })
      return
    }
  }

  // 2. Validate Incoming Payload Structure
  const payload = req.body as ShiprocketWebhookPayload
  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ message: 'Invalid payload: request body must be a JSON object' })
    return
  }

  const awb = payload.awb || payload.awb_code
  const orderId = payload.order_id ? String(payload.order_id) : undefined
  const { normalized, rawStatus } = normalizeShiprocketStatus(payload)

  if (!awb && !orderId && normalized === 'UNKNOWN') {
    res.status(400).json({
      message: 'Invalid payload: missing AWB, order ID, or tracking status reference',
    })
    return
  }

  logger.info(
    `Received Shiprocket webhook for Order: ${orderId || 'N/A'}, AWB: ${awb || 'N/A'}, Status: ${normalized} (${rawStatus})`
  )

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // 3. Locate Target Order and Target Fulfillment in Medusa Database efficiently
    let targetOrder: any = null
    let targetFulfillment: any = null
    const srOrderId = payload.sr_order_id ? String(payload.sr_order_id) : undefined
    const shipmentId = (payload as any).shipment_id ? String((payload as any).shipment_id) : undefined

    // 3a. Direct order lookup using indexed ID filter if orderId is provided
    if (orderId) {
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: [
          'id',
          'display_id',
          'status',
          'fulfillment_status',
          'items.id',
          'items.quantity',
          'fulfillments.*',
          'fulfillments.items.*',
          'fulfillments.labels.*',
        ],
        filters: { id: orderId },
      })
      targetOrder = orders?.[0] || null
    }

    // 3b. If order is resolved directly, match target fulfillment from order.fulfillments
    if (targetOrder && targetOrder.fulfillments?.length > 0) {
      if (awb || srOrderId || shipmentId) {
        targetFulfillment =
          targetOrder.fulfillments.find((f: any) => {
            const matchesAwb =
              awb &&
              (f.data?.awb_code === awb ||
                f.labels?.some((l: any) => l.tracking_number === awb))
            const matchesSrOrder =
              (orderId && String(f.data?.shiprocket_order_id) === orderId) ||
              (srOrderId && String(f.data?.shiprocket_order_id) === srOrderId)
            const matchesShipment =
              shipmentId && String(f.data?.shiprocket_shipment_id) === shipmentId

            return matchesAwb || matchesSrOrder || matchesShipment
          }) || targetOrder.fulfillments[0]
      } else {
        targetFulfillment = targetOrder.fulfillments[0]
      }
    }

    // 3c. If fulfillment not resolved yet, search fulfillment using indexed AWB filter or bounded pagination
    if (!targetFulfillment) {
      let matchedFulfillments: any[] = []

      if (awb) {
        try {
          const res = await query.graph({
            entity: 'fulfillment',
            fields: [
              'id',
              'data',
              'labels.*',
              'items.*',
              'shipped_at',
              'delivered_at',
              'canceled_at',
            ],
            filters: {
              labels: {
                tracking_number: awb,
              },
            } as any,
          })
          matchedFulfillments = res.data || []
        } catch {
          // If relation filter is not supported by backend driver, continue
        }
      }

      // If not found by tracking_number relation filter, query with strictly bounded pagination (limit 50)
      if (!matchedFulfillments.length) {
        const { data: fulfillments } = await query.graph({
          entity: 'fulfillment',
          fields: [
            'id',
            'data',
            'labels.*',
            'items.*',
            'shipped_at',
            'delivered_at',
            'canceled_at',
          ],
          pagination: {
            take: 50,
          },
        })
        matchedFulfillments = fulfillments || []
      }

      targetFulfillment = matchedFulfillments.find((f: any) => {
        const matchesAwb =
          awb &&
          (f.data?.awb_code === awb ||
            f.labels?.some((l: any) => l.tracking_number === awb))
        const matchesSrOrder =
          (orderId && String(f.data?.shiprocket_order_id) === orderId) ||
          (srOrderId && String(f.data?.shiprocket_order_id) === srOrderId)
        const matchesShipment =
          shipmentId && String(f.data?.shiprocket_shipment_id) === shipmentId

        return matchesAwb || matchesSrOrder || matchesShipment
      })
    }

    // 3d. If targetOrder not resolved yet but targetFulfillment is found, locate owning order
    if (!targetOrder && targetFulfillment) {
      try {
        const { data: orders } = await query.graph({
          entity: 'order',
          fields: [
            'id',
            'display_id',
            'status',
            'fulfillment_status',
            'items.id',
            'items.quantity',
            'fulfillments.*',
            'fulfillments.items.*',
            'fulfillments.labels.*',
          ],
          filters: {
            fulfillments: { id: targetFulfillment.id },
          } as any,
        })
        targetOrder = orders?.[0] || null
      } catch {
        // Fallback with strictly bounded pagination
        const { data: orders } = await query.graph({
          entity: 'order',
          fields: [
            'id',
            'display_id',
            'status',
            'fulfillment_status',
            'items.id',
            'items.quantity',
            'fulfillments.*',
            'fulfillments.items.*',
            'fulfillments.labels.*',
          ],
          pagination: {
            take: 50,
          },
        })
        targetOrder =
          orders?.find((ord: any) =>
            ord.fulfillments?.some((f: any) => f.id === targetFulfillment.id)
          ) || null
      }
    }

    // 4. Idempotent Processing based on Normalized Status
    let actionTaken = 'recorded_log'

    if (targetOrder && targetFulfillment) {
      if (normalized === 'DELIVERED') {
        if (targetFulfillment.delivered_at) {
          actionTaken = 'idempotent_skip_already_delivered'
        } else {
          try {
            await markOrderFulfillmentAsDeliveredWorkflow(req.scope).run({
              input: {
                orderId: targetOrder.id,
                fulfillmentId: targetFulfillment.id,
              },
            })
            actionTaken = 'marked_order_fulfillment_delivered'
          } catch (wfErr: unknown) {
            logger.warn(`Failed to execute mark as delivered workflow: ${wfErr}`)
            actionTaken = 'mark_delivered_error'
          }
        }
      } else if (normalized === 'CANCELLED') {
        if (targetFulfillment.canceled_at) {
          actionTaken = 'idempotent_skip_already_cancelled'
        } else {
          try {
            await cancelOrderFulfillmentWorkflow(req.scope).run({
              input: {
                order_id: targetOrder.id,
                fulfillment_id: targetFulfillment.id,
              },
            })
            actionTaken = 'cancelled_order_fulfillment'
          } catch (wfErr: unknown) {
            logger.warn(`Failed to execute cancel order fulfillment workflow: ${wfErr}`)
            actionTaken = 'cancel_fulfillment_error'
          }
        }
      } else if (normalized === 'SHIPPED') {
        if (targetFulfillment.shipped_at) {
          actionTaken = 'idempotent_skip_already_shipped'
        } else {
          try {
            const shipmentItems = (
              (targetFulfillment.items?.length
                ? targetFulfillment.items
                : targetOrder.items) || []
            ).map((it: any) => ({
              id: it.line_item_id || it.id,
              quantity: Number(it.quantity) || 1,
            }))

            await createOrderShipmentWorkflow(req.scope).run({
              input: {
                order_id: targetOrder.id,
                fulfillment_id: targetFulfillment.id,
                items: shipmentItems,
                labels: [
                  {
                    tracking_number:
                      awb || targetFulfillment.labels?.[0]?.tracking_number || '',
                    tracking_url: `https://shiprocket.co/tracking/${awb || ''}`,
                    label_url: targetFulfillment.labels?.[0]?.label_url || '',
                  },
                ],
              },
            })
            actionTaken = 'created_order_shipment'
          } catch (wfErr: unknown) {
            logger.warn(`Failed to execute create order shipment workflow: ${wfErr}`)
            actionTaken = 'create_shipment_error'
          }
        }
      } else if (normalized === 'RTO') {
        actionTaken = 'rto_processed'
        logger.warn(
          `⚠️ Shiprocket RTO reported for Order ${targetOrder.id}, AWB ${awb || 'N/A'}. Requires seller botanical inventory inspection.`
        )
        try {
          const eventBus = req.scope.resolve(Modules.EVENT_BUS)
          await eventBus.emit({
            name: 'fulfillment.rto',
            data: {
              order_id: targetOrder.id,
              fulfillment_id: targetFulfillment.id,
              awb:
                awb ||
                targetFulfillment.data?.awb_code ||
                targetFulfillment.labels?.[0]?.tracking_number ||
                null,
              raw_status: rawStatus,
              reason:
                (payload as any).activity ||
                payload.current_status ||
                (payload as any).reason ||
                'Return to Origin',
              timestamp: new Date().toISOString(),
            },
          })
          logger.info(
            `Dispatched fulfillment.rto event for Order ${targetOrder.id} (AWB: ${awb || 'N/A'})`
          )
        } catch (emitErr: any) {
          logger.warn(`Could not emit fulfillment.rto event: ${emitErr?.message || emitErr}`)
        }
      } else if (normalized === 'OUT_FOR_DELIVERY') {
        actionTaken = 'out_for_delivery_logged'
      }
    }

    res.status(200).json({
      success: true,
      received: true,
      order_id: targetOrder?.id || orderId || null,
      fulfillment_id: targetFulfillment?.id || null,
      awb: awb || null,
      status: normalized,
      action_taken: actionTaken,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown webhook error'
    logger.error(`Error handling Shiprocket webhook: ${errMsg}`)
    res.status(500).json({
      success: false,
      error: errMsg,
    })
  }
}
