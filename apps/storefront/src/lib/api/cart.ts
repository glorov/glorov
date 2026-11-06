import { apiFetch } from './client'
import type { CartItem, MedusaCart, MedusaLineItem } from '../../types/cart'
import type { ApiResult } from '../../types/api'

export const CART_COOKIE_NAME = 'cart_id'
export const FALLBACK_CART_STORAGE_KEY = 'glorov_cart_id'

/**
 * Retrieve cart_id from cookie or localStorage fallback in browser environments
 */
export function getCartIdCookie(): string | null {
  if (typeof document === 'undefined') return null

  try {
    // 1. Try reading standard cart_id cookie
    const cookies = document.cookie.split(';')
    for (const c of cookies) {
      const trimmed = c.trim()
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > -1) {
        const name = trimmed.substring(0, equalIndex).trim()
        const value = trimmed.substring(equalIndex + 1).trim()
        if (name === CART_COOKIE_NAME || name === 'glorov_cart_id') {
          const decoded = decodeURIComponent(value)
          if (decoded && decoded !== 'null' && decoded !== 'undefined') {
            return decoded
          }
        }
      }
    }

    // 2. Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(FALLBACK_CART_STORAGE_KEY)
      if (stored && stored !== 'null' && stored !== 'undefined') {
        return stored
      }
    }
  } catch {
    // Ignore storage read exceptions
  }

  return null
}

/**
 * Persist cart_id into cookie (30 days TTL) and localStorage fallback
 */
export function setCartIdCookie(cartId: string): void {
  if (typeof document === 'undefined') return

  try {
    const maxAge = 60 * 60 * 24 * 30 // 30 days in seconds
    document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(cartId)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FALLBACK_CART_STORAGE_KEY, cartId)
    }
  } catch {
    // Ignore cookie write exceptions
  }
}

/**
 * Clear cart_id from cookie and localStorage
 */
export function clearCartIdCookie(): void {
  if (typeof document === 'undefined') return

  try {
    document.cookie = `${CART_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
    document.cookie = `glorov_cart_id=; Path=/; Max-Age=0; SameSite=Lax`

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(FALLBACK_CART_STORAGE_KEY)
      localStorage.removeItem('glorov_cart_items')
    }
  } catch {
    // Ignore cookie delete exceptions
  }
}

/**
 * Transforms a Medusa v2 raw line item into a typed GLOROV CartItem
 */
export function transformMedusaLineItem(item: MedusaLineItem): CartItem {
  const meta = (item.metadata || {}) as Record<string, unknown>
  const prod = item.product || item.variant?.product
  const category =
    prod?.categories?.[0]?.name ||
    (meta.category as string) ||
    'Seeds'

  // Medusa v2 stores monetary values in minor units (paise) for INR
  const rawUnitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0
  const unitPrice = rawUnitPrice > 500 ? Math.round(rawUnitPrice / 100) : rawUnitPrice

  let originalPrice: number | undefined = undefined
  if (typeof item.compare_at_unit_price === 'number' && item.compare_at_unit_price > 0) {
    originalPrice =
      item.compare_at_unit_price > 500
        ? Math.round(item.compare_at_unit_price / 100)
        : item.compare_at_unit_price
  } else if (meta.originalPrice) {
    const p = Number(meta.originalPrice)
    if (!isNaN(p) && p > unitPrice) {
      originalPrice = p
    }
  }

  const image =
    item.thumbnail ||
    prod?.thumbnail ||
    (meta.image as string) ||
    '/og-image.jpg'

  return {
    id: item.id,
    productId: item.product_id || item.variant?.product_id || (meta.productId as string) || '',
    variantId: item.variant_id || item.variant?.id,
    title: item.product_title || prod?.title || item.title || 'Botanical Product',
    variantName: item.variant_title || item.variant?.title || item.subtitle || undefined,
    category,
    price: unitPrice,
    originalPrice,
    quantity: item.quantity,
    image,
    inStock: true,
    sku: item.variant_sku || item.variant?.sku,
  }
}

/**
 * Extracts normalized cart calculations and transformed line items from a MedusaCart object
 */
export function transformMedusaCart(cart: MedusaCart) {
  const items: CartItem[] = Array.isArray(cart.items)
    ? cart.items.map(transformMedusaLineItem)
    : []

  const cartCount = items.reduce((sum, it) => sum + it.quantity, 0)

  // Medusa v2 minor units conversion (paise -> INR)
  const rawSubtotal = cart.item_subtotal ?? cart.subtotal ?? 0
  const cartSubtotal = rawSubtotal > 500 ? Math.round(rawSubtotal / 100) : rawSubtotal

  const rawDiscount = cart.discount_total ?? cart.discount_subtotal ?? 0
  const discountAmount = rawDiscount > 500 ? Math.round(rawDiscount / 100) : rawDiscount

  const rawShipping = cart.shipping_total ?? cart.shipping_subtotal ?? 0
  const shippingAmount = rawShipping > 500 ? Math.round(rawShipping / 100) : rawShipping

  const rawTotal = cart.total ?? 0
  let cartTotal = rawTotal > 500 ? Math.round(rawTotal / 100) : rawTotal

  // If shipping is not yet chosen on Medusa cart, compute estimated total with standard threshold
  if (shippingAmount === 0 && items.length > 0 && cartTotal === cartSubtotal - discountAmount) {
    const estimatedShipping = cartSubtotal >= 499 ? 0 : 99
    cartTotal = Math.max(0, cartSubtotal - discountAmount + estimatedShipping)
  }

  const itemCompareTotal = items.reduce(
    (sum, it) => sum + (it.originalPrice || it.price) * it.quantity,
    0
  )

  const rawOriginal = cart.original_item_total ?? cart.original_total ?? 0
  const compareSubtotal =
    itemCompareTotal > cartSubtotal
      ? itemCompareTotal
      : rawOriginal > 0
      ? (rawOriginal > 500 ? Math.round(rawOriginal / 100) : rawOriginal)
      : cartSubtotal

  const overallDiscountPercent =
    compareSubtotal > cartSubtotal && compareSubtotal > 0
      ? Math.round(((compareSubtotal - cartSubtotal) / compareSubtotal) * 100)
      : 0

  const appliedCoupon =
    Array.isArray(cart.promotions) && cart.promotions.length > 0
      ? cart.promotions[0].code
      : null

  return {
    cartItems: items,
    cartCount,
    cartSubtotal,
    compareSubtotal,
    discountAmount,
    shippingAmount,
    cartTotal,
    overallDiscountPercent,
    appliedCoupon,
  }
}

/**
 * POST /store/carts
 * Creates a new Medusa v2 server-side cart
 */
export async function createMedusaCart(token?: string): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>('/store/carts', {
    method: 'POST',
    body: {},
    authToken: token,
  })
}

/**
 * GET /store/carts/:id
 * Retrieves existing cart with line items, variants and products
 */
export async function getMedusaCart(
  cartId: string,
  token?: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`, {
    method: 'GET',
    params: {
      fields: '*items,*items.variant,*items.variant.product,*promotions',
    },
    authToken: token,
  })
}

/**
 * POST /store/carts/:id/line-items
 * Adds a product variant line item to the Medusa cart
 */
export async function addMedusaLineItem(
  cartId: string,
  variantId: string,
  quantity: number = 1,
  token?: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}/line-items`, {
    method: 'POST',
    body: {
      variant_id: variantId,
      quantity,
    },
    authToken: token,
  })
}

/**
 * POST /store/carts/:id/line-items/:line_id
 * Updates line item quantity
 */
export async function updateMedusaLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number,
  token?: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: 'POST',
      body: {
        quantity,
      },
      authToken: token,
    }
  )
}

/**
 * DELETE /store/carts/:id/line-items/:line_id
 * Removes a line item from the Medusa cart
 */
export async function deleteMedusaLineItem(
  cartId: string,
  lineItemId: string,
  token?: string
): Promise<ApiResult<{ id: string; object: string; deleted: boolean; parent?: MedusaCart } | { cart?: MedusaCart }>> {
  return apiFetch(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: 'DELETE',
      authToken: token,
    }
  )
}

/**
 * POST /store/carts/:id/customer
 * Merges / transfers guest cart to authenticated customer
 */
export async function transferMedusaCartCustomer(
  cartId: string,
  token: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}/customer`, {
    method: 'POST',
    body: {},
    authToken: token,
  })
}

/**
 * POST /store/carts/:id
 * Updates general cart fields (such as email)
 */
export async function updateMedusaCart(
  cartId: string,
  payload: Record<string, unknown>,
  token?: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`, {
    method: 'POST',
    body: payload,
    authToken: token,
  })
}

/**
 * POST /store/carts/:id/promotions
 * Applies promo codes to the cart
 */
export async function applyMedusaPromotion(
  cartId: string,
  promoCode: string,
  token?: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}/promotions`, {
    method: 'POST',
    body: {
      promo_codes: [promoCode],
    },
    authToken: token,
  })
}

/**
 * DELETE /store/carts/:id/promotions
 * Removes a promo code from the cart
 */
export async function removeMedusaPromotion(
  cartId: string,
  promoCode: string,
  token?: string
): Promise<ApiResult<{ cart: MedusaCart }>> {
  return apiFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}/promotions`, {
    method: 'DELETE',
    body: {
      promo_codes: [promoCode],
    },
    authToken: token,
  })
}
