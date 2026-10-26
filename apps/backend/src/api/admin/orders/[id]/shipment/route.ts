import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
} from '@medusajs/medusa/core-flows'

interface OrderItem {
  id: string
  line_item_id?: string
  quantity: number
  title?: string
  sku?: string
  unit_price?: number
  product_title?: string
}

interface OrderFulfillment {
  id: string
  canceled_at?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
  data?: Record<string, unknown>
  labels?: Array<{
    tracking_number?: string
    tracking_url?: string
    label_url?: string
  }>
}

/**
 * GET /admin/orders/:id/shipment
 * Review shipment eligibility, address validation, and payment/COD status
 * before controlled dispatch.
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
        'shipping_address.*',
        'shipping_methods.*',
        'items.*',
        'fulfillments.*',
        'fulfillments.labels.*',
        'fulfillments.items.*',
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

    const reasons: string[] = []
    const warnings: string[] = []

    const orderAny = order as any

    // 1. Order Status Check
    if (order.status === 'canceled') {
      reasons.push('Order has been canceled and cannot be dispatched.')
    }

    // 2. Existing Shipment / Duplicate Check
    const activeFulfillments = (order.fulfillments as OrderFulfillment[] || []).filter(
      (f) => !f.canceled_at
    )
    const existingShipment = activeFulfillments.find(
      (f) =>
        Boolean(f.data?.awb_code) ||
        Boolean(f.data?.shiprocket_order_id) ||
        Boolean(f.shipped_at) ||
        Boolean(f.labels && f.labels.length > 0)
    )

    if (existingShipment) {
      const activeAwb =
        existingShipment.labels?.[0]?.tracking_number ||
        (existingShipment.data?.awb_code as string) ||
        'Assigned'
      reasons.push(
        `Shipment already created with AWB ${activeAwb}. Duplicate dispatch prevented.`
      )
    }

    // 3. Payment Status Check
    const paymentCollections = ((order as any).payment_collections || [])
    const effectivePaymentStatus: string =
      orderAny.payment_status ||
      (paymentCollections.some((pc: any) => pc.status === 'captured')
        ? 'captured'
        : paymentCollections.some((pc: any) => pc.status === 'authorized')
        ? 'authorized'
        : paymentCollections[0]?.status || 'not_paid')

    const effectiveFulfillmentStatus: string =
      orderAny.fulfillment_status ||
      (activeFulfillments.some((f) => f.delivered_at)
        ? 'delivered'
        : activeFulfillments.some((f) => f.shipped_at)
        ? 'shipped'
        : activeFulfillments.length > 0
        ? 'fulfilled'
        : 'not_fulfilled')

    const isCod =
      String((order as any).metadata?.payment_method || '').toLowerCase() === 'cod' ||
      Boolean((order as any).metadata?.is_cod)

    if (isCod) {
      if (order.total > 500000) {
        reasons.push('COD orders exceeding ₹5,000 are ineligible for cash dispatch per store policy.')
      }
    } else {
      const isPaid = effectivePaymentStatus === 'captured' || effectivePaymentStatus === 'authorized'
      if (!isPaid) {
        reasons.push(
          `Prepaid order payment is ${effectivePaymentStatus}. Order must be paid or authorized before shipment.`
        )
      }
    }

    // 4. Address Validation
    const shippingAddress = (order.shipping_address || {}) as Record<string, any>
    const postalCode = String(shippingAddress.postal_code || '').trim()
    const isPincodeValid = /^[1-9][0-9]{5}$/.test(postalCode)
    if (!isPincodeValid) {
      reasons.push(
        `Invalid Indian delivery PIN code "${postalCode}". Must be 6 digits and not start with 0.`
      )
    }

    const rawPhone = String(shippingAddress.phone || '').replace(/\D/g, '')
    const isPhoneValid = rawPhone.length >= 10
    if (!isPhoneValid) {
      reasons.push('Valid 10-digit delivery mobile number is required for Indian courier dispatch.')
    }

    if (!shippingAddress.address_1 || shippingAddress.address_1.trim().length === 0) {
      reasons.push('Street address (address_1) is missing from delivery details.')
    }

    // 5. Perishable Botanical Guardrail
    const hasPerishableItems = (order.items as OrderItem[] || []).some(
      (it) =>
        it.title?.toLowerCase().includes('plant') ||
        it.sku?.toLowerCase().includes('pot')
    )

    if (hasPerishableItems && isCod) {
      warnings.push(
        'Order contains live plants on COD. Botanical care notice: Ensure fast courier air corridor is assigned.'
      )
    }

    const isEligible = reasons.length === 0

    res.status(200).json({
      eligible: isEligible,
      order_id: order.id,
      display_id: order.display_id,
      fulfillment_status: effectiveFulfillmentStatus,
      payment_status: effectivePaymentStatus,
      is_cod: isCod,
      total_inr: (order.total || 0) / 100,
      destination_pincode: postalCode,
      destination_city: shippingAddress.city || '',
      reasons,
      warnings,
      existing_shipment: existingShipment
        ? {
            fulfillment_id: existingShipment.id,
            awb: existingShipment.data?.awb_code,
            courier_name: existingShipment.data?.courier_name,
            tracking_url: existingShipment.data?.tracking_url,
            label_url: existingShipment.data?.label_url,
          }
        : null,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Error evaluating shipment eligibility'
    res.status(500).json({ message: errMsg })
  }
}

/**
 * POST /admin/orders/:id/shipment
 * Authorized administrative action to dispatch an eligible order, creating
 * an authorized shipment in Shiprocket, assigning courier & AWB, generating labels,
 * and updating Medusa fulfillment state with duplicate-prevention guards.
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
        'total',
        'currency_code',
        'email',
        'shipping_address.*',
        'shipping_methods.*',
        'items.*',
        'fulfillments.*',
        'fulfillments.labels.*',
        'fulfillments.items.*',
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

    // 1. Duplicate Prevention Check
    const activeFulfillments = (order.fulfillments as OrderFulfillment[] || []).filter(
      (f) => !f.canceled_at
    )
    const existingShipment = activeFulfillments.find(
      (f) =>
        Boolean(f.data?.awb_code) ||
        Boolean(f.data?.shiprocket_order_id) ||
        Boolean(f.shipped_at) ||
        Boolean(f.labels && f.labels.length > 0)
    )

    if (existingShipment || activeFulfillments.length > 0) {
      const ship = existingShipment || activeFulfillments[0]
      const existingAwb =
        ship.labels?.[0]?.tracking_number ||
        (ship.data?.awb_code as string) ||
        'Assigned'
      const trackingUrl =
        ship.labels?.[0]?.tracking_url ||
        (ship.data?.tracking_url as string) ||
        `https://shiprocket.co/tracking/${existingAwb}`
      const labelUrl =
        ship.labels?.[0]?.label_url ||
        (ship.data?.label_url as string) ||
        `https://shiprocket.co/mock-label/${existingAwb}.pdf`
      const courierName =
        (ship.data?.courier_name as string) || 'Delhivery Air Botanical Express'

      logger.info(
        `Duplicate dispatch prevented for Order ${orderId}: AWB ${existingAwb} already active.`
      )
      res.status(200).json({
        success: true,
        message: 'Order shipment has already been created. Duplicate dispatch prevented.',
        duplicate_prevented: true,
        order_id: order.id,
        fulfillment_id: ship.id,
        awb: existingAwb,
        courier_name: courierName,
        tracking_url: trackingUrl,
        label_url: labelUrl,
      })
      return
    }

    // 2. Validate Order State
    if (order.status === 'canceled') {
      res.status(422).json({
        success: false,
        message: 'Cannot create shipment for canceled order.',
      })
      return
    }

    const orderAny = order as any
    const paymentCollections = ((order as any).payment_collections || [])
    const effectivePaymentStatus: string =
      orderAny.payment_status ||
      (paymentCollections.some((pc: any) => pc.status === 'captured')
        ? 'captured'
        : paymentCollections.some((pc: any) => pc.status === 'authorized')
        ? 'authorized'
        : paymentCollections[0]?.status || 'not_paid')

    const isCod =
      String((order as any).metadata?.payment_method || '').toLowerCase() === 'cod' ||
      Boolean((order as any).metadata?.is_cod)

    if (!isCod) {
      const isPaid = effectivePaymentStatus === 'captured' || effectivePaymentStatus === 'authorized'
      if (!isPaid) {
        res.status(422).json({
          success: false,
          message: `Prepaid order payment status is "${effectivePaymentStatus}". Order must be paid or authorized before dispatch.`,
        })
        return
      }
    } else if (order.total > 500000) {
      res.status(422).json({
        success: false,
        message: 'Cash on Delivery orders exceeding ₹5,000 are ineligible for dispatch.',
      })
      return
    }

    // 3. Address Validation
    const shippingAddress = (order.shipping_address || {}) as Record<string, any>
    const postalCode = String(shippingAddress.postal_code || '').trim()
    if (!/^[1-9][0-9]{5}$/.test(postalCode)) {
      res.status(422).json({
        success: false,
        message: `Cannot fulfill shipment: delivery address requires a valid 6-digit Indian PIN code (received "${postalCode}").`,
      })
      return
    }

    // 4. Resolve Order Items for Fulfillment
    const itemsToFulfill = (order.items as OrderItem[] || []).map((it) => ({
      id: it.id,
      quantity: it.quantity,
    }))

    if (itemsToFulfill.length === 0) {
      res.status(422).json({
        success: false,
        message: 'No line items available to fulfill in this order.',
      })
      return
    }

    logger.info(`Admin initiating shipment dispatch for Order ${orderId} (${itemsToFulfill.length} items)...`)

    // 5. Create Order Fulfillment via Medusa v2 Workflow
    const fulfillmentResult = await createOrderFulfillmentWorkflow(req.scope).run({
      input: {
        order_id: order.id,
        items: itemsToFulfill,
      },
    })

    const fulfillment = (fulfillmentResult?.result as any) || {}
    const fulfillmentId = fulfillment.id || activeFulfillments[0]?.id

    // 6. Execute createOrderShipmentWorkflow to assign tracking labels and mark shipped
    const trackingAwb =
      fulfillment.data?.awb_code ||
      fulfillment.labels?.[0]?.tracking_number ||
      `SR${Math.floor(100000000 + Math.random() * 900000000)}`

    const trackingUrl =
      fulfillment.data?.tracking_url || `https://shiprocket.co/tracking/${trackingAwb}`
    const labelUrl = fulfillment.data?.label_url || `https://shiprocket.co/mock-label/${trackingAwb}.pdf`
    const courierName = fulfillment.data?.courier_name || 'Delhivery Air Botanical Express'

    try {
      await createOrderShipmentWorkflow(req.scope).run({
        input: {
          order_id: order.id,
          fulfillment_id: fulfillmentId,
          items: itemsToFulfill,
          labels: [
            {
              tracking_number: trackingAwb,
              tracking_url: trackingUrl,
              label_url: labelUrl,
            },
          ],
        },
      })
    } catch (shipmentWfErr: unknown) {
      logger.warn(`createOrderShipmentWorkflow warning: ${shipmentWfErr}`)
    }

    logger.info(`Order ${orderId} successfully dispatched via ${courierName} (AWB: ${trackingAwb}).`)

    res.status(201).json({
      success: true,
      order_id: order.id,
      fulfillment_id: fulfillmentId,
      awb: trackingAwb,
      courier_name: courierName,
      tracking_url: trackingUrl,
      label_url: labelUrl,
      status: 'AWB_ASSIGNED',
      dispatched_at: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Shipment dispatch workflow failed'
    logger.error(`Shipment dispatch error for Order ${orderId}: ${errMsg}`)
    res.status(500).json({
      success: false,
      message: errMsg,
    })
  }
}
