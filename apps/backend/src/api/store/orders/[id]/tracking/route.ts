import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { ShiprocketClient } from '../../../../../modules/fulfillment-shiprocket/client'
import { sendSanitizedError } from '../../../../../utils/error-handler'

interface SafeTrackingScan {
  date: string
  activity: string
  location: string
}

/**
 * GET /store/orders/:id/tracking
 * Provides authenticated customers and validated guest order holders with
 * real-time, sanitized tracking progress, AWB details, and botanical moisture-shield status.
 *
 * Enforces strict order ownership via middleware to prevent horizontal privilege escalation.
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
        'fulfillment_status',
        'created_at',
        'shipping_address.city',
        'shipping_address.province',
        'shipping_address.postal_code',
        'items.title',
        'items.sku',
        'fulfillments.*',
        'fulfillments.labels.*',
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
    const activeFulfillment =
      fulfillments.find(
        (f: any) =>
          Boolean(f.data?.awb_code) ||
          Boolean(f.data?.shiprocket_order_id) ||
          Boolean(f.shipped_at) ||
          Boolean(f.labels && f.labels.length > 0)
      ) || (fulfillments.length > 0 ? fulfillments[0] : null)

    const isPerishable = ((order as any).items || []).some(
      (it: any) =>
        it.title?.toLowerCase().includes('plant') ||
        it.sku?.toLowerCase().includes('pot')
    )

    const orderAny = order as any
    const shippingAddress = (order.shipping_address || {}) as Record<string, any>

    // If order has not yet been dispatched by seller
    if (!activeFulfillment) {
      res.status(200).json({
        order_id: order.id,
        display_id: order.display_id,
        fulfillment_status: orderAny.fulfillment_status,
        shipping_status: 'processing',
        awb: null,
        courier_name: null,
        tracking_url: null,
        origin: 'Pune Central Nursery Hub (PIN 411001)',
        destination_city: shippingAddress.city || '',
        destination_state: shippingAddress.province || '',
        destination_pincode: shippingAddress.postal_code || '',
        is_perishable: isPerishable,
        moisture_shield_status: isPerishable
          ? 'Live plant undergoing hydration & moisture-shield packaging at Pune Hub'
          : 'Seed varieties scheduled for dispatch in climate-sealed pack',
        message:
          'Your botanical order is currently being prepared and packed at our Pune nursery hub. Tracking details will appear once courier dispatch is confirmed.',
        scans: [
          {
            date: String(order.created_at),
            activity: 'Order confirmed and registered at Pune Central Nursery Hub',
            location: 'Pune, Maharashtra',
          },
        ],
      })
      return
    }

    const awb =
      activeFulfillment.labels?.[0]?.tracking_number ||
      activeFulfillment.data?.awb_code ||
      null

    const courierName =
      activeFulfillment.data?.courier_name || 'Delhivery Air Botanical Express'

    const trackingUrl =
      activeFulfillment.data?.tracking_url ||
      (awb ? `https://shiprocket.co/tracking/${awb}` : null)

    // Determine normalized tracking status for customer view
    let customerShippingStatus:
      | 'dispatched'
      | 'in_transit'
      | 'out_for_delivery'
      | 'delivered'
      | 'rto'
      | 'exception' = 'dispatched'

    if (activeFulfillment.delivered_at) {
      customerShippingStatus = 'delivered'
    } else if (activeFulfillment.shipped_at) {
      customerShippingStatus = 'in_transit'
    }

    let scans: SafeTrackingScan[] = []

    // Fetch live scan history if AWB exists
    if (awb) {
      try {
        const client = new ShiprocketClient()
        const trackingRes = await client.trackAwb(awb)
        const trackData = trackingRes.tracking_data?.shipment_track?.[0]

        if (trackData?.current_status) {
          const raw = trackData.current_status.toUpperCase()
          if (raw === 'DELIVERED') customerShippingStatus = 'delivered'
          else if (raw === 'OUT_FOR_DELIVERY' || raw === 'OUT FOR DELIVERY') customerShippingStatus = 'out_for_delivery'
          else if (raw.includes('RTO')) customerShippingStatus = 'rto'
          else if (raw.includes('UNDELIVERED') || raw.includes('EXCEPTION')) customerShippingStatus = 'exception'
          else customerShippingStatus = 'in_transit'
        }

        if (trackData?.scans && trackData.scans.length > 0) {
          scans = trackData.scans.map((s) => ({
            date: s.date,
            activity: s.activity,
            location: s.location,
          }))
        }
      } catch {
        // Fallback to local scans if Shiprocket API is unreachable
      }
    }

    if (scans.length === 0) {
      scans = [
        {
          date: String(activeFulfillment.data?.dispatched_at || order.created_at),
          activity: `Air Waybill allocated via ${courierName}. Ready for handover at Pune Hub.`,
          location: 'Pune Central Nursery Hub',
        },
      ]
    }

    res.status(200).json({
      order_id: order.id,
      display_id: order.display_id,
      fulfillment_status: orderAny.fulfillment_status,
      shipping_status: customerShippingStatus,
      awb,
      courier_name: courierName,
      tracking_url: trackingUrl,
      origin: 'Pune Central Nursery Hub (PIN 411001)',
      destination_city: shippingAddress.city || '',
      destination_state: shippingAddress.province || '',
      destination_pincode: shippingAddress.postal_code || '',
      is_perishable: isPerishable,
      moisture_shield_status: isPerishable
        ? 'Protected with moisture-retaining sphagnum wrap & breathable air ventilation'
        : 'Protected in airtight moisture-barrier botanical foil pouch',
      scans,
    })
  } catch (error: unknown) {
    sendSanitizedError(res, error, 500, { order_id: orderId })
  }
}
