'use server'

import { cookies } from 'next/headers'
import {
  getCart,
  createCart,
  addLineItem,
  updateLineItem,
  removeLineItem,
  getCartShippingOptions,
  selectShippingMethod,
  updateCartCustomerAndAddress,
  completeCartCheckout,
  type StoreCart,
  type StoreShippingOption,
  type StoreOrder,
} from './cart'
import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE } from './constants'
import { indianAddressSchema, type IndianAddressInput } from '@glorov/types'

/**
 * Server-side helper to read the cart ID cookie
 */
async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(CART_COOKIE_NAME)
  return cookie?.value || null
}

/**
 * Server-side helper to store the cart ID cookie
 */
async function setCartIdCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, cartId, {
    maxAge: CART_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: false, // Accessible to client components for session recovery
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

/**
 * Server-side helper to clear the cart ID cookie
 */
async function clearCartIdCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE_NAME)
}

/**
 * Get the current active cart or create a new one.
 */
export async function getOrInitializeCartAction(): Promise<{
  success: boolean
  cart?: StoreCart
  error?: string
}> {
  try {
    const existingId = await getCartIdFromCookie()
    if (existingId) {
      const res = await getCart(existingId)
      if (res.success && res.data && !res.data.completed_at) {
        return { success: true, cart: res.data }
      }
    }

    // Create a new cart for Indian region
    const createRes = await createCart()
    if (!createRes.success || !createRes.data) {
      return { success: false, error: createRes.error || 'Failed to create cart' }
    }

    await setCartIdCookie(createRes.data.id)
    return { success: true, cart: createRes.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cart initialization failed'
    return { success: false, error: message }
  }
}

/**
 * Add an item to the current cart.
 */
export async function addToCartAction(
  variantId: string,
  quantity: number = 1
): Promise<{
  success: boolean
  cart?: StoreCart
  error?: string
}> {
  try {
    const cartRes = await getOrInitializeCartAction()
    if (!cartRes.success || !cartRes.cart) {
      return { success: false, error: cartRes.error || 'Could not retrieve cart' }
    }

    const addRes = await addLineItem(cartRes.cart.id, variantId, quantity)
    if (!addRes.success || !addRes.data) {
      return { success: false, error: addRes.error || 'Could not add item to cart' }
    }

    // Refresh cart with full relations
    const refreshed = await getCart(cartRes.cart.id)
    return { success: true, cart: refreshed.data || addRes.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error adding to cart'
    return { success: false, error: message }
  }
}

/**
 * Update quantity for a cart line item.
 */
export async function updateCartItemAction(
  lineItemId: string,
  quantity: number
): Promise<{
  success: boolean
  cart?: StoreCart
  error?: string
}> {
  try {
    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return { success: false, error: 'No active cart found' }
    }

    const updateRes = await updateLineItem(cartId, lineItemId, quantity)
    if (!updateRes.success) {
      return { success: false, error: updateRes.error }
    }

    const refreshed = await getCart(cartId)
    return { success: true, cart: refreshed.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating item quantity'
    return { success: false, error: message }
  }
}

/**
 * Remove an item from the cart.
 */
export async function removeFromCartAction(
  lineItemId: string
): Promise<{
  success: boolean
  cart?: StoreCart
  error?: string
}> {
  try {
    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return { success: false, error: 'No active cart found' }
    }

    const delRes = await removeLineItem(cartId, lineItemId)
    if (!delRes.success) {
      return { success: false, error: delRes.error }
    }

    const refreshed = await getCart(cartId)
    return { success: true, cart: refreshed.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error removing item from cart'
    return { success: false, error: message }
  }
}

/**
 * Get available shipping options for the active cart.
 */
export async function getCartShippingOptionsAction(): Promise<{
  success: boolean
  options: StoreShippingOption[]
  error?: string
}> {
  try {
    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return { success: false, options: [], error: 'No active cart found' }
    }
    return await getCartShippingOptions(cartId)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving shipping options'
    return { success: false, options: [], error: message }
  }
}

/**
 * Select a shipping method on the active cart.
 */
export async function selectShippingMethodAction(
  optionId: string
): Promise<{
  success: boolean
  cart?: StoreCart
  error?: string
}> {
  try {
    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return { success: false, error: 'No active cart found' }
    }

    const res = await selectShippingMethod(cartId, optionId)
    if (!res.success) {
      return { success: false, error: res.error }
    }

    const refreshed = await getCart(cartId)
    return { success: true, cart: refreshed.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error setting shipping method'
    return { success: false, error: message }
  }
}

/**
 * Validate and update customer delivery address and contact email on the active cart.
 */
export async function updateDeliveryAddressAction(input: {
  email: string
  shippingAddress: IndianAddressInput
}): Promise<{
  success: boolean
  cart?: StoreCart
  error?: string
}> {
  try {
    // 1. Validate email format
    const trimmedEmail = input.email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Enter a valid email address for order notifications' }
    }

    // 2. Validate Indian address schema
    const validationResult = indianAddressSchema.safeParse(input.shippingAddress)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid address data'
      return { success: false, error: firstError }
    }

    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return { success: false, error: 'No active cart found' }
    }

    const updateRes = await updateCartCustomerAndAddress(cartId, {
      email: trimmedEmail,
      shippingAddress: validationResult.data,
    })

    if (!updateRes.success) {
      return { success: false, error: updateRes.error }
    }

    const refreshed = await getCart(cartId)
    return { success: true, cart: refreshed.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error saving address'
    return { success: false, error: message }
  }
}

/**
 * Place the order by completing the active cart.
 * Clears the active cart cookie upon successful placement.
 */
export async function completeOrderAction(
  providerId: string = 'pp_system_default'
): Promise<{
  success: boolean
  orderId?: string
  order?: StoreOrder
  error?: string
}> {
  try {
    const cartId = await getCartIdFromCookie()
    if (!cartId) {
      return { success: false, error: 'No active cart found to complete' }
    }

    const completeRes = await completeCartCheckout(cartId, providerId)
    if (!completeRes.success || !completeRes.order) {
      return {
        success: false,
        error: completeRes.error || 'Could not complete order. Please review your cart.',
      }
    }

    // Clear cart cookie so subsequent actions start fresh
    await clearCartIdCookie()

    return {
      success: true,
      orderId: completeRes.order.id,
      order: completeRes.order,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Order checkout failed'
    return { success: false, error: message }
  }
}
