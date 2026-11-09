import {
  MEDUSA_BACKEND_URL,
  MEDUSA_PUBLISHABLE_KEY,
  COD_MAX_AMOUNT_PAISE,
  COD_MAX_AMOUNT_RUPEES,
  isCodAmountEligible,
} from '../constants'
import type { CartItem } from '../../types/cart'
import type {
  DeliveryAddress,
  PlacedOrderReceipt,
  RazorpayVerificationRequest,
  RazorpayVerificationResponse,
} from '../../types/checkout'
import type { MedusaPaymentSession } from '../../types/razorpay'
import type { MedusaRawOrder, MedusaRawOrderItem } from '../../types/account'

export { COD_MAX_AMOUNT_PAISE, COD_MAX_AMOUNT_RUPEES, isCodAmountEligible }

function getCleanBaseUrl(baseUrl?: string): string {
  return (baseUrl || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(publishableKey?: string): string {
  return publishableKey || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

function getHeaders(authToken?: string | null, customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...customHeaders,
  }
  const pk = getPublishableKey()
  if (pk) {
    headers['x-publishable-api-key'] = pk
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

/**
 * Resolves a Medusa variant ID for a product or variant.
 * If the variant ID is already a Medusa variant (e.g. variant_...), returns it.
 * Otherwise, queries the Medusa catalog to find a valid variant ID.
 */
export async function resolveMedusaVariantId(
  productId: string,
  variantId?: string,
  productTitle?: string
): Promise<string> {
  if (variantId && variantId.startsWith('variant_')) {
    return variantId
  }

  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders()

  // 1. Try fetching product by ID
  try {
    const res = await fetch(`${baseUrl}/store/products/${productId}?fields=*variants`, {
      headers,
    })
    if (res.ok) {
      const data = await res.json()
      if (data.product?.variants?.length > 0) {
        return data.product.variants[0].id
      }
    }
  } catch {
    // Continue to next lookup
  }

  // 2. Try fetching by handle / title search
  try {
    const searchTerm = productTitle || productId
    const res = await fetch(
      `${baseUrl}/store/products?q=${encodeURIComponent(searchTerm)}&limit=1&fields=*variants`,
      { headers }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.products?.[0]?.variants?.length > 0) {
        return data.products[0].variants[0].id
      }
    }
  } catch {
    // Continue to fallback
  }

  // 3. Fallback: get the first available product in the catalog
  try {
    const res = await fetch(`${baseUrl}/store/products?limit=1&fields=*variants`, {
      headers,
    })
    if (res.ok) {
      const data = await res.json()
      if (data.products?.[0]?.variants?.length > 0) {
        return data.products[0].variants[0].id
      }
    }
  } catch {
    // Fallback failed
  }

  return variantId || productId
}

export interface CreateMedusaCartParams {
  items: CartItem[]
  address: DeliveryAddress
  couponCode?: string | null
  authToken?: string | null
  existingCartId?: string | null
}

/**
 * Creates, reuses, and initializes a real Medusa v2 cart with line items, delivery address, and promotions.
 * If existingCartId is provided and active, reuses it to eliminate redundant line-item creation delays.
 */
export async function createMedusaCart({
  items,
  address,
  couponCode,
  authToken,
  existingCartId,
}: CreateMedusaCartParams): Promise<{ id: string; [key: string]: unknown }> {
  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders(authToken)

  if (!items || items.length === 0) {
    throw new Error('Your cart is empty. Add botanical items before checkout.')
  }

  let cartId: string | null = null
  let cart: { id: string; items?: Array<{ variant_id?: string; quantity?: number }>; [key: string]: unknown } | null = null
  let needToAddItems = true

  // Fast path: Reuse existing active Medusa cart from user session
  if (existingCartId) {
    try {
      const existingRes = await fetch(`${baseUrl}/store/carts/${existingCartId}`, {
        headers,
      })
      if (existingRes.ok) {
        const data = await existingRes.json()
        if (data.cart && !data.cart.completed_at) {
          cart = data.cart
          cartId = data.cart.id
          // Check if cart already has line items
          if (Array.isArray(data.cart.items) && data.cart.items.length > 0) {
            needToAddItems = false
          }
        }
      }
    } catch {
      // Fall through to fresh cart creation
    }
  }

  // 1. POST /store/carts - Create Cart if not reusing existing
  if (!cartId) {
    const cartRes = await fetch(`${baseUrl}/store/carts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ currency_code: 'inr' }),
    })

    if (!cartRes.ok) {
      const err = await cartRes.json().catch(() => ({}))
      throw new Error(err.message || `Failed to create Medusa cart (${cartRes.status}).`)
    }

    const createdData = await cartRes.json()
    cart = createdData.cart
    cartId = createdData.cart.id
    needToAddItems = true
  }

  if (!cartId) {
    throw new Error('Failed to obtain a valid Medusa cart session.')
  }

  // 2. Add Line Items (concurrently via Promise.all when creating new cart)
  if (needToAddItems) {
    const lineItemPromises = items.map(async (item) => {
      const resolvedVariantId = await resolveMedusaVariantId(
        item.productId,
        item.variantId,
        item.title
      )
      const lineRes = await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          variant_id: resolvedVariantId,
          quantity: item.quantity,
        }),
      })

      if (!lineRes.ok) {
        const lineErr = await lineRes.json().catch(() => ({}))
        throw new Error(
          lineErr.message || `Unable to add "${item.title}" to cart. It may be out of stock.`
        )
      }
    })

    await Promise.all(lineItemPromises)
  }

  // 3. POST /store/carts/:id - Update Email and Addresses
  const nameParts = (address.fullName || '').trim().split(/\s+/)
  const firstName = nameParts[0] || 'Valued'
  const lastName = nameParts.slice(1).join(' ') || 'Customer'

  const addressPayload = {
    first_name: firstName,
    last_name: lastName,
    address_1: address.addressLine1,
    address_2: address.addressLine2 || address.landmark || '',
    city: address.city,
    province: address.state,
    postal_code: address.pincode,
    country_code: (address.countryCode || 'in').toLowerCase(),
    phone: address.phoneNumber,
  }

  const updateRes = await fetch(`${baseUrl}/store/carts/${cartId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: address.email,
      shipping_address: addressPayload,
      billing_address: addressPayload,
    }),
  })

  if (!updateRes.ok) {
    const updateErr = await updateRes.json().catch(() => ({}))
    throw new Error(updateErr.message || 'Failed to attach delivery address to cart.')
  }

  const updateData = await updateRes.json().catch(() => ({}))
  if (updateData.cart) {
    cart = updateData.cart
  }

  // 4. POST /store/carts/:id/promotions - Apply Promo Code if present
  if (couponCode && couponCode.trim()) {
    try {
      await fetch(`${baseUrl}/store/carts/${cartId}/promotions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ promo_codes: [couponCode.trim().toUpperCase()] }),
      })
    } catch {
      // Non-blocking if promo code cannot be applied
    }
  }

  return cart || { id: cartId }
}

/**
 * Directly updates cart shipping & billing address in Medusa v2.
 * Used for optimistic / background checkout address synchronization.
 */
export async function updateMedusaCartAddress(
  cartId: string,
  address: DeliveryAddress,
  authToken?: string | null
): Promise<Record<string, unknown>> {
  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders(authToken)

  const nameParts = (address.fullName || '').trim().split(/\s+/)
  const firstName = nameParts[0] || 'Valued'
  const lastName = nameParts.slice(1).join(' ') || 'Customer'

  const addressPayload = {
    first_name: firstName,
    last_name: lastName,
    address_1: address.addressLine1,
    address_2: address.addressLine2 || address.landmark || '',
    city: address.city,
    province: address.state,
    postal_code: address.pincode,
    country_code: (address.countryCode || 'in').toLowerCase(),
    phone: address.phoneNumber,
  }

  const updateRes = await fetch(`${baseUrl}/store/carts/${cartId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: address.email,
      shipping_address: addressPayload,
      billing_address: addressPayload,
    }),
  })

  if (!updateRes.ok) {
    const updateErr = await updateRes.json().catch(() => ({}))
    throw new Error(updateErr.message || 'Failed to update delivery address on cart.')
  }

  return updateRes.json()
}

/**
 * Step 3a: Fetches shipping options and sets shipping method on the cart.
 * POST /store/carts/:id/shipping-methods
 */
export async function setMedusaShippingMethod(
  cartId: string,
  isExpress: boolean = false,
  authToken?: string | null
): Promise<Record<string, unknown>> {
  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders(authToken)

  // 1. GET /store/shipping-options?cart_id=:id
  const optRes = await fetch(`${baseUrl}/store/shipping-options?cart_id=${cartId}`, {
    headers,
  })

  if (!optRes.ok) {
    const err = await optRes.json().catch(() => ({}))
    throw new Error(err.message || 'Unable to retrieve delivery shipping options from backend.')
  }

  const { shipping_options } = await optRes.json()
  if (!Array.isArray(shipping_options) || shipping_options.length === 0) {
    throw new Error('No delivery options available for this delivery pincode.')
  }

  // Find express vs standard option
  let selectedOption = shipping_options.find((o: { name?: string; id?: string; [key: string]: unknown }) =>
    isExpress
      ? o.name?.toLowerCase().includes('express') || o.name?.toLowerCase().includes('air')
      : !o.name?.toLowerCase().includes('express') && !o.name?.toLowerCase().includes('air')
  )

  if (!selectedOption) {
    selectedOption = shipping_options[0]
  }

  // 2. POST /store/carts/:id/shipping-methods
  const smRes = await fetch(`${baseUrl}/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ option_id: selectedOption.id }),
  })

  if (!smRes.ok) {
    const err = await smRes.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to assign shipping method to cart.')
  }

  return smRes.json()
}

/**
 * Step 3b: Initializes payment collection and payment session via Medusa payment API.
 * 1. POST /store/payment-collections
 * 2. POST /store/payment-collections/:id/payment-sessions
 */
export async function initMedusaPaymentSession(
  cartId: string,
  providerId: 'pp_cod_cod' | 'pp_razorpay_razorpay',
  authToken?: string | null
): Promise<{
  paymentCollectionId: string
  session: MedusaPaymentSession | Record<string, unknown>
  razorpayOrderId?: string
}> {
  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders(authToken)

  // 1. POST /store/payment-collections - create payment collection for cart
  const pcRes = await fetch(`${baseUrl}/store/payment-collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cart_id: cartId }),
  })

  if (!pcRes.ok) {
    const pcErr = await pcRes.json().catch(() => ({}))
    throw new Error(pcErr.message || 'Failed to initialize payment collection on backend.')
  }

  const { payment_collection } = await pcRes.json()
  if (!payment_collection?.id) {
    throw new Error('Payment collection response missing identifier.')
  }

  // 2. POST /store/payment-collections/:id/payment-sessions
  const psRes = await fetch(
    `${baseUrl}/store/payment-collections/${payment_collection.id}/payment-sessions`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider_id: providerId }),
    }
  )

  if (!psRes.ok) {
    const psErr = await psRes.json().catch(() => ({}))
    throw new Error(
      psErr.message ||
        (providerId === 'pp_cod_cod'
          ? 'Cash on Delivery is unavailable for this order (orders must be ₹5,000 or below).'
          : 'Failed to initialize payment session with payment provider.')
    )
  }

  const psData = await psRes.json()
  const sessions: MedusaPaymentSession[] = psData?.payment_collection?.payment_sessions || []
  const session =
    sessions.find((s: MedusaPaymentSession) => s.provider_id === providerId) ||
    sessions[0]

  if (!session) {
    throw new Error('No payment session returned from Medusa backend.')
  }

  const sessionData = typeof session.data === 'object' && session.data !== null ? session.data : undefined
  const razorpayOrderId =
    sessionData?.razorpay_order_id ||
    sessionData?.id ||
    (typeof session.data === 'string' ? session.data : undefined)

  return {
    paymentCollectionId: payment_collection.id,
    session,
    razorpayOrderId,
  }
}

/**
 * Step 3c (Verification): Cryptographically verifies Razorpay payment on Medusa backend.
 * POST /store/payment/razorpay/verify
 */
export async function verifyRazorpayPayment(
  payload: RazorpayVerificationRequest,
  authToken?: string | null
): Promise<RazorpayVerificationResponse> {
  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders(authToken)

  const res = await fetch(`${baseUrl}/store/payment/razorpay/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Razorpay payment signature verification failed.')
  }

  return data
}

/**
 * Step 3e: Finalizes the order and triggers Medusa inventory deduction.
 * POST /store/carts/:id/complete
 */
export async function completeMedusaCart(
  cartId: string,
  authToken?: string | null
): Promise<{ type: string; order: MedusaRawOrder | Record<string, unknown> }> {
  const baseUrl = getCleanBaseUrl()
  const headers = getHeaders(authToken)

  const completeRes = await fetch(`${baseUrl}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers,
  })

  const data = await completeRes.json().catch(() => ({}))

  if (!completeRes.ok) {
    throw new Error(
      data.message || data.error || `Order finalization failed (${completeRes.status}).`
    )
  }

  if (data.type !== 'order' || !data.order) {
    throw new Error('Medusa cart completion did not return an authoritative order object.')
  }

  return data
}

/**
 * Transforms a raw Medusa v2 Order into the storefront PlacedOrderReceipt structure.
 */
export function transformMedusaOrderToReceipt(
  order: MedusaRawOrder,
  fallbackDetails?: Partial<PlacedOrderReceipt>
): PlacedOrderReceipt {
  if (!order || !order.id) {
    throw new Error('Invalid Medusa order object: missing order.id')
  }

  const rawTotal = typeof order.total === 'number' ? order.total : 0
  const totalAmount = rawTotal > 500 ? Math.round(rawTotal / 100) : rawTotal

  const rawSubtotal = typeof order.item_subtotal === 'number' ? order.item_subtotal : (order.subtotal || rawTotal)
  const subtotal = rawSubtotal > 500 ? Math.round(rawSubtotal / 100) : rawSubtotal

  const rawDiscount = typeof order.discount_total === 'number' ? order.discount_total : 0
  const discountAmount = rawDiscount > 500 ? Math.round(rawDiscount / 100) : rawDiscount

  const rawShipping = typeof order.shipping_total === 'number' ? order.shipping_total : 0
  const shippingAmount = rawShipping > 500 ? Math.round(rawShipping / 100) : rawShipping

  const shippingAddr = (order.shipping_address || {}) as MedusaRawOrder['shipping_address']
  const fullName =
    [shippingAddr?.first_name, shippingAddr?.last_name].filter(Boolean).join(' ') ||
    fallbackDetails?.customerName ||
    fallbackDetails?.shippingAddress?.fullName ||
    'Valued Botanical Grower'

  const deliveryAddress: DeliveryAddress = {
    fullName,
    phoneNumber: shippingAddr?.phone || fallbackDetails?.shippingAddress?.phoneNumber || '',
    email: order.email || fallbackDetails?.shippingAddress?.email || '',
    addressLine1: shippingAddr?.address_1 || fallbackDetails?.shippingAddress?.addressLine1 || '',
    addressLine2: shippingAddr?.address_2 || fallbackDetails?.shippingAddress?.addressLine2,
    landmark: (shippingAddr?.metadata?.landmark as string) || fallbackDetails?.shippingAddress?.landmark,
    city: shippingAddr?.city || fallbackDetails?.shippingAddress?.city || '',
    state: shippingAddr?.province || fallbackDetails?.shippingAddress?.state || '',
    pincode: shippingAddr?.postal_code || fallbackDetails?.shippingAddress?.pincode || '',
    countryCode: (shippingAddr?.country_code || 'in').toLowerCase(),
  }

  const items: CartItem[] = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((it: MedusaRawOrderItem) => {
        const rawItemPrice = typeof it.unit_price === 'number' ? it.unit_price : 0
        const price = rawItemPrice > 500 ? Math.round(rawItemPrice / 100) : rawItemPrice

        return {
          id: it.id,
          productId: it.product_id || it.variant?.product_id || it.id,
          variantId: it.variant_id || it.variant?.id,
          title: it.title || it.product_title || 'Botanical Item',
          variantName: it.variant_title || it.subtitle || undefined,
          category:
            typeof it.metadata?.category === 'string'
              ? it.metadata.category
              : 'Plants & Seeds',
          price,
          quantity: it.quantity || 1,
          image: it.thumbnail || it.variant?.product?.thumbnail || '',
          inStock: true,
          sku: it.variant_sku || it.sku,
        }
      })
    : fallbackDetails?.items || []

  // Display ID formatting
  let displayId = ''
  if (order.display_id !== undefined && order.display_id !== null) {
    displayId = String(order.display_id).startsWith('GLR-')
      ? String(order.display_id)
      : `GLR-${order.display_id}`
  } else if (order.id) {
    displayId = `GLR-${String(order.id).slice(-6).toUpperCase()}`
  } else {
    displayId = fallbackDetails?.displayId || 'GLR-ORDER'
  }

  const shippingMethods = Array.isArray(order.shipping_methods) ? order.shipping_methods : []
  const shippingOptionName =
    shippingMethods[0]?.name ||
    fallbackDetails?.shippingMethodName ||
    'Standard Botanical Delivery'

  const isExpress = shippingOptionName.toLowerCase().includes('express') || shippingOptionName.toLowerCase().includes('air')
  const estimatedDeliveryDate = isExpress
    ? 'Within 1 — 2 Business Days'
    : 'Within 3 — 5 Business Days'

  // Payment status & method title
  const providerId =
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ||
    order.payment_status

  const paymentTitle =
    providerId === 'pp_cod_cod' || fallbackDetails?.paymentMethodTitle?.includes('COD')
      ? 'Cash on Delivery (COD)'
      : 'Razorpay Online (UPI, Cards & NetBanking)'

  return {
    id: order.id,
    displayId,
    createdAt: order.created_at || new Date().toISOString(),
    email: order.email || deliveryAddress.email,
    customerName: fullName,
    shippingAddress: deliveryAddress,
    shippingMethodName: shippingOptionName,
    paymentMethodTitle: paymentTitle,
    items,
    subtotal: subtotal || fallbackDetails?.subtotal || 0,
    discountAmount: discountAmount || fallbackDetails?.discountAmount || 0,
    shippingAmount: shippingAmount || fallbackDetails?.shippingAmount || 0,
    totalAmount: totalAmount || fallbackDetails?.totalAmount || 0,
    currency: (order.currency_code || 'inr').toUpperCase(),
    estimatedDeliveryDate,
    paymentStatus: (order.payment_status === 'captured'
      ? 'captured'
      : order.payment_status === 'pending'
      ? 'pending'
      : 'authorized') as 'authorized' | 'captured' | 'pending',
    fulfillmentStatus: (order.fulfillment_status === 'processing'
      ? 'processing'
      : 'not_fulfilled') as 'not_fulfilled' | 'processing',
  }
}

/**
 * Fetches real order data directly from Medusa v2 store order endpoint.
 * GET /store/orders/:id
 */
export async function fetchMedusaOrder(
  orderId: string,
  authToken?: string | null
): Promise<PlacedOrderReceipt | null> {
  if (!orderId) return null

  try {
    const baseUrl = getCleanBaseUrl()
    const headers = getHeaders(authToken)

    const res = await fetch(
      `${baseUrl}/store/orders/${orderId}?fields=*items,*shipping_address,*shipping_methods,*payment_collections,*payment_collections.payment_sessions`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    if (data.order) {
      return transformMedusaOrderToReceipt(data.order)
    }
  } catch {
    // Return null on network or parse error
  }

  return null
}
