import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../constants'
import type {
  CustomerOrder,
  CustomerAddress,
  OrderTrackingInfo,
  ReturnRequestRecord,
  OrderFulfillment,
  MedusaRawAddress,
  MedusaRawOrderItem,
  MedusaRawOrder,
} from '../../types/account'
import type { CartItem } from '../../types/cart'

export type { MedusaRawAddress, MedusaRawOrderItem, MedusaRawOrder }

/**
 * Normalizes image URLs from Medusa backend / Cloudinary / assets
 */
function resolveOrderImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '/og-image.jpg'
  const trimmed = rawUrl.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  const cleanBase = MEDUSA_BACKEND_URL.replace(/\/$/, '')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${cleanBase}${cleanPath}`
}

/**
 * Formats date into standard readable Indian localized string
 */
export function formatOrderDate(dateString?: string | null): string {
  if (!dateString) return 'Recent'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return String(dateString)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(dateString)
  }
}

/**
 * Transforms a raw Medusa Order payload into typed CustomerOrder
 */
export function transformMedusaOrder(raw: MedusaRawOrder): CustomerOrder {
  if (!raw) {
    throw new Error('Cannot transform null or undefined Medusa order')
  }

  // Display ID normalization (e.g. GLR-1001 or raw display_id)
  let displayId = ''
  if (raw.display_id !== undefined && raw.display_id !== null) {
    displayId = String(raw.display_id).startsWith('GLR-')
      ? String(raw.display_id)
      : `GLR-${raw.display_id}`
  } else if (raw.id) {
    displayId = `GLR-${String(raw.id).slice(-6).toUpperCase()}`
  } else {
    displayId = 'GLR-ORDER'
  }

  // Currency amounts: Medusa v2 stores monetary figures in paise (minor units)
  const rawTotal = typeof raw.total === 'number' ? raw.total : 0
  const totalAmount = rawTotal > 500 ? Math.round(rawTotal / 100) : rawTotal

  const rawSubtotal = typeof raw.subtotal === 'number' ? raw.subtotal : (raw.item_subtotal ?? rawTotal)
  const subtotal = rawSubtotal > 500 ? Math.round(rawSubtotal / 100) : rawSubtotal

  const rawDiscount = typeof raw.discount_total === 'number' ? raw.discount_total : 0
  const discountAmount = rawDiscount > 500 ? Math.round(rawDiscount / 100) : rawDiscount

  const rawShipping = typeof raw.shipping_total === 'number' ? raw.shipping_total : 0
  const shippingAmount = rawShipping > 500 ? Math.round(rawShipping / 100) : rawShipping

  // Items
  const items: CartItem[] = Array.isArray(raw.items)
    ? raw.items.map((it: MedusaRawOrderItem) => {
        const rawPrice = typeof it.unit_price === 'number' ? it.unit_price : 0
        const price = rawPrice > 500 ? Math.round(rawPrice / 100) : rawPrice
        const image = resolveOrderImageUrl(
          (it.thumbnail as string) || (it.variant?.product?.thumbnail as string) || (it.metadata?.image as string)
        )

        return {
          id: it.id,
          productId: it.product_id || it.variant?.product_id || (it.metadata?.productId as string) || '',
          variantId: it.variant_id || it.variant?.id,
          title: it.title || it.product_title || 'Botanical Item',
          variantName: it.variant_title || it.subtitle || undefined,
          category: (it.metadata?.category as string) || 'Plants & Seeds',
          price,
          quantity: it.quantity || 1,
          image,
          inStock: true,
          sku: it.variant_sku || it.sku || it.variant?.sku,
        }
      })
    : []

  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0)

  // Shipping Address
  const rawAddr = raw.shipping_address || {}
  const fullName =
    [rawAddr.first_name, rawAddr.last_name].filter(Boolean).join(' ') ||
    raw.email ||
    'Customer'

  const shippingAddress: CustomerAddress = {
    id: rawAddr.id || `addr_${raw.id}`,
    name: (rawAddr.address_name as string) || (rawAddr.metadata?.name as string) || 'Delivery Address',
    fullName,
    phoneNumber: rawAddr.phone || '',
    addressLine1: rawAddr.address_1 || 'Botanical Sanctuary',
    addressLine2: rawAddr.address_2 || undefined,
    city: rawAddr.city || '',
    state: rawAddr.province || '',
    pincode: rawAddr.postal_code || '',
    countryCode: (rawAddr.country_code || 'in').toLowerCase(),
    isDefault: false,
  }

  // Active Fulfillment & Tracking info
  const fulfillments = Array.isArray(raw.fulfillments) ? raw.fulfillments : []
  const activeFulfillment =
    fulfillments.find((f: OrderFulfillment) => !f.canceled_at) ||
    fulfillments[0]

  let trackingCode: string | undefined = undefined
  let carrierName: string | undefined = undefined
  let trackingUrl: string | undefined = undefined
  let estimatedDeliveryDate: string | undefined = undefined

  if (activeFulfillment) {
    trackingCode =
      (activeFulfillment.labels?.[0]?.tracking_number as string) ||
      (activeFulfillment.data?.awb_code as string) ||
      undefined

    carrierName =
      (activeFulfillment.data?.courier_name as string) ||
      (trackingCode ? 'Shiprocket Botanical Cold-Chain' : undefined)

    trackingUrl =
      (activeFulfillment.labels?.[0]?.tracking_url as string) ||
      (activeFulfillment.data?.tracking_url as string) ||
      (trackingCode ? `https://shiprocket.co/tracking/${trackingCode}` : undefined)

    if (activeFulfillment.data?.estimated_delivery) {
      estimatedDeliveryDate = String(activeFulfillment.data.estimated_delivery)
    } else if (activeFulfillment.shipped_at) {
      estimatedDeliveryDate = 'Within 2-3 Days'
    }
  }

  return {
    id: raw.id || 'ord_unknown',
    displayId,
    createdAt: formatOrderDate(raw.created_at),
    status: raw.status || 'pending',
    paymentStatus: raw.payment_status || 'authorized',
    fulfillmentStatus: raw.fulfillment_status || 'not_fulfilled',
    totalAmount,
    itemCount,
    items,
    shippingAddress,
    trackingCode,
    carrierName,
    trackingUrl,
    estimatedDeliveryDate,
    email: raw.email || undefined,
    subtotal,
    discountAmount,
    shippingAmount,
    currencyCode: (raw.currency_code || 'inr').toUpperCase(),
    fulfillments,
    metadata: raw.metadata || {},
  }
}

/**
 * Fetches authenticated customer's order history from Medusa v2 backend
 */
export async function fetchCustomerOrders(
  authToken?: string
): Promise<{ success: boolean; orders: CustomerOrder[]; error?: string }> {
  try {
    // 1. First attempt Next.js API route which forwards session cookies automatically
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const localRes = await fetch('/api/orders', {
      method: 'GET',
      headers,
      credentials: 'include',
    }).catch(() => null)

    if (localRes && localRes.ok) {
      const data = await localRes.json()
      if (Array.isArray(data.orders)) {
        const orders = data.orders.map((o: CustomerOrder | MedusaRawOrder) =>
          o && 'displayId' in o ? (o as CustomerOrder) : transformMedusaOrder(o as MedusaRawOrder)
        )
        return { success: true, orders }
      }
    }

    // 2. Direct backend fallback if running server-side or if direct token available
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders?fields=*items,*shipping_address,*shipping_methods,*fulfillments,*fulfillments.labels,*payment_collections`,
      {
        method: 'GET',
        headers: directHeaders,
      }
    )

    if (!medusaRes.ok) {
      const errData = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        orders: [],
        error: errData.message || `Failed to fetch orders (${medusaRes.status})`,
      }
    }

    const data = await medusaRes.json()
    const rawList = Array.isArray(data.orders) ? data.orders : []
    const orders = rawList.map(transformMedusaOrder)

    return { success: true, orders }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to load orders'
    return { success: false, orders: [], error }
  }
}

/**
 * Fetches order details by ID from Medusa v2 backend
 * Supports authenticated customers and verified guest order lookups
 */
export async function fetchOrderById(
  id: string,
  authToken?: string,
  guestEmail?: string
): Promise<{
  success: boolean
  order?: CustomerOrder
  rawOrder?: MedusaRawOrder
  error?: string
  status?: number
}> {
  if (!id) {
    return { success: false, error: 'Order ID is required', status: 400 }
  }

  try {
    // 1. Try local Next.js proxy route first
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    if (guestEmail) {
      headers['x-order-email'] = guestEmail.trim().toLowerCase()
    }

    const query = guestEmail ? `?email=${encodeURIComponent(guestEmail.trim().toLowerCase())}` : ''
    const localRes = await fetch(`/api/orders/${encodeURIComponent(id)}${query}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    }).catch(() => null)

    if (localRes) {
      const data = await localRes.json().catch(() => ({}))
      if (localRes.ok && data.order) {
        return {
          success: true,
          order: data.order,
          rawOrder: data.rawOrder,
        }
      }
      if (!localRes.ok && data.message) {
        return {
          success: false,
          error: data.message,
          status: localRes.status,
        }
      }
    }

    // 2. Direct backend fallback
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }
    if (guestEmail) {
      directHeaders['x-order-email'] = guestEmail.trim().toLowerCase()
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders/${encodeURIComponent(id)}?fields=*items,*shipping_address,*shipping_methods,*fulfillments,*fulfillments.labels,*payment_collections`,
      {
        method: 'GET',
        headers: directHeaders,
      }
    )

    const data = await medusaRes.json().catch(() => ({}))
    if (!medusaRes.ok) {
      return {
        success: false,
        error: data.message || `Order not found (${medusaRes.status})`,
        status: medusaRes.status,
      }
    }

    if (!data.order) {
      return { success: false, error: 'Order not found', status: 404 }
    }

    // Guest verification safety check
    if (guestEmail && data.order.email) {
      if (data.order.email.trim().toLowerCase() !== guestEmail.trim().toLowerCase()) {
        return {
          success: false,
          error: 'The email address provided does not match the email associated with this order.',
          status: 403,
        }
      }
    }

    const order = transformMedusaOrder(data.order)
    return { success: true, order, rawOrder: data.order }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to retrieve order details'
    return { success: false, error, status: 500 }
  }
}

/**
 * Fetches real-time botanical tracking information from GET /store/orders/:id/tracking
 */
export async function fetchOrderTracking(
  id: string,
  authToken?: string,
  guestEmail?: string
): Promise<{ success: boolean; tracking?: OrderTrackingInfo; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    if (guestEmail) {
      headers['x-order-email'] = guestEmail.trim().toLowerCase()
    }

    const query = guestEmail ? `?email=${encodeURIComponent(guestEmail.trim().toLowerCase())}` : ''
    const localRes = await fetch(`/api/orders/${encodeURIComponent(id)}/tracking${query}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    }).catch(() => null)

    if (localRes && localRes.ok) {
      const data = await localRes.json()
      if (data.tracking) {
        return { success: true, tracking: data.tracking }
      }
      return { success: true, tracking: data }
    }

    // Direct Medusa fallback
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }
    if (guestEmail) {
      directHeaders['x-order-email'] = guestEmail.trim().toLowerCase()
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders/${encodeURIComponent(id)}/tracking`,
      {
        method: 'GET',
        headers: directHeaders,
      }
    )

    if (!medusaRes.ok) {
      const errData = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        error: errData.message || 'Tracking information unavailable',
      }
    }

    const tracking = await medusaRes.json()
    return { success: true, tracking }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to retrieve tracking information'
    return { success: false, error }
  }
}

/**
 * Cancels an un-dispatched order via POST /store/orders/:id/cancel
 */
export async function cancelOrder(
  id: string,
  payload: {
    reason: string
    customer_note?: string
    email?: string
    order_email?: string
  },
  authToken?: string
): Promise<{ success: boolean; message: string; status?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    const emailToUse = payload.order_email || payload.email
    if (emailToUse) {
      headers['x-order-email'] = emailToUse.trim().toLowerCase()
    }

    const localRes = await fetch(`/api/orders/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (localRes) {
      const data = await localRes.json().catch(() => ({}))
      if (localRes.ok && data.success !== false) {
        return {
          success: true,
          message: data.message || 'Order canceled successfully.',
          status: data.status || 'canceled',
        }
      }
      return {
        success: false,
        message: data.message || 'Failed to cancel order.',
      }
    }

    // Direct Medusa fallback
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }
    if (emailToUse) {
      directHeaders['x-order-email'] = emailToUse.trim().toLowerCase()
    }

    const medusaRes = await fetch(`${baseUrl}/store/orders/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: directHeaders,
      body: JSON.stringify(payload),
    })

    const data = await medusaRes.json().catch(() => ({}))
    if (!medusaRes.ok || data.success === false) {
      return {
        success: false,
        message: data.message || `Failed to cancel order (${medusaRes.status})`,
      }
    }

    return {
      success: true,
      message: data.message || 'Order canceled successfully.',
      status: data.status || 'canceled',
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to complete order cancellation'
    return { success: false, message }
  }
}

/**
 * Submits an item return request via POST /store/orders/:id/return-request
 */
export async function submitReturnRequest(
  id: string,
  payload: {
    items: Array<{
      line_item_id: string
      quantity: number
      reason: string
      customer_note?: string
    }>
    customer_notes?: string
    email?: string
    order_email?: string
  },
  authToken?: string
): Promise<{ success: boolean; message: string; return_request?: ReturnRequestRecord | Record<string, unknown> }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    const emailToUse = payload.order_email || payload.email
    if (emailToUse) {
      headers['x-order-email'] = emailToUse.trim().toLowerCase()
    }

    const localRes = await fetch(`/api/orders/${encodeURIComponent(id)}/return-request`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (localRes) {
      const data = await localRes.json().catch(() => ({}))
      if (localRes.ok && data.success !== false) {
        return {
          success: true,
          message: data.message || 'Return request submitted successfully.',
          return_request: data.return_request,
        }
      }
      return {
        success: false,
        message: data.message || 'Failed to submit return request.',
      }
    }

    // Direct Medusa fallback
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }
    if (emailToUse) {
      directHeaders['x-order-email'] = emailToUse.trim().toLowerCase()
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders/${encodeURIComponent(id)}/return-request`,
      {
        method: 'POST',
        headers: directHeaders,
        body: JSON.stringify(payload),
      }
    )

    const data = await medusaRes.json().catch(() => ({}))
    if (!medusaRes.ok || data.success === false) {
      return {
        success: false,
        message: data.message || `Failed to submit return request (${medusaRes.status})`,
      }
    }

    return {
      success: true,
      message: data.message || 'Return request submitted successfully.',
      return_request: data.return_request,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to submit return request'
    return { success: false, message }
  }
}

/**
 * Fetches submitted return requests for an order via GET /store/orders/:id/return-request
 */
export async function fetchOrderReturnRequests(
  id: string,
  authToken?: string,
  guestEmail?: string
): Promise<{ success: boolean; return_requests: ReturnRequestRecord[]; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    if (guestEmail) {
      headers['x-order-email'] = guestEmail.trim().toLowerCase()
    }

    const query = guestEmail ? `?email=${encodeURIComponent(guestEmail.trim().toLowerCase())}` : ''
    const localRes = await fetch(`/api/orders/${encodeURIComponent(id)}/return-request${query}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    }).catch(() => null)

    if (localRes && localRes.ok) {
      const data = await localRes.json()
      return {
        success: true,
        return_requests: Array.isArray(data.return_requests) ? data.return_requests : [],
      }
    }

    // Direct Medusa fallback
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }
    if (guestEmail) {
      directHeaders['x-order-email'] = guestEmail.trim().toLowerCase()
    }

    const medusaRes = await fetch(
      `${baseUrl}/store/orders/${encodeURIComponent(id)}/return-request`,
      {
        method: 'GET',
        headers: directHeaders,
      }
    )

    if (!medusaRes.ok) {
      const errData = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        return_requests: [],
        error: errData.message || 'Failed to fetch return requests',
      }
    }

    const data = await medusaRes.json()
    return {
      success: true,
      return_requests: Array.isArray(data.return_requests) ? data.return_requests : [],
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to load return requests'
    return { success: false, return_requests: [], error }
  }
}
