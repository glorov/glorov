import { medusaClient } from './medusa-client'
import type { IndianAddressInput } from '@glorov/types'

export type StoreCart = Awaited<
  ReturnType<typeof medusaClient.store.cart.retrieve>
>['cart']

export type StoreCartItem = NonNullable<StoreCart['items']>[number]

export type StoreShippingOption = Awaited<
  ReturnType<typeof medusaClient.store.fulfillment.listCartOptions>
>['shipping_options'][number]

export type StoreOrder = Awaited<
  ReturnType<typeof medusaClient.store.order.retrieve>
>['order']

export interface CartOperationResult<T = StoreCart> {
  success: boolean
  data?: T
  error?: string
}

export interface CompleteOrderResult {
  success: boolean
  type?: 'order' | 'cart'
  order?: StoreOrder
  cart?: StoreCart
  error?: string
}

const DEFAULT_CART_FIELDS =
  '*items,*items.variant,*shipping_methods,*shipping_address,*billing_address,*region,*payment_collection,*payment_collection.payment_sessions'

/**
 * Retrieve cart by ID with full fields
 */
export async function getCart(cartId: string): Promise<CartOperationResult<StoreCart>> {
  try {
    const res = await medusaClient.store.cart.retrieve(cartId, {
      fields: DEFAULT_CART_FIELDS,
    })
    return { success: true, data: res.cart }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve cart'
    return { success: false, error: message }
  }
}

/**
 * Create a new cart. If regionId is not provided, Medusa defaults to the sales channel's region (India).
 */
export async function createCart(regionId?: string): Promise<CartOperationResult<StoreCart>> {
  try {
    const res = await medusaClient.store.cart.create(
      regionId ? { region_id: regionId } : {}
    )
    return { success: true, data: res.cart }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create cart'
    return { success: false, error: message }
  }
}

/**
 * Add a product variant to the cart.
 * Backend verifies stock availability and prices; never trust browser prices.
 */
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<CartOperationResult<StoreCart>> {
  if (quantity < 1) {
    return { success: false, error: 'Quantity must be at least 1' }
  }
  try {
    const res = await medusaClient.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })
    return { success: true, data: res.cart }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add item to cart'
    return { success: false, error: message }
  }
}

/**
 * Update the quantity of a line item.
 * If quantity is 0 or less, removes the item.
 */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<CartOperationResult<StoreCart>> {
  if (quantity <= 0) {
    return removeLineItem(cartId, lineItemId)
  }
  try {
    const res = await medusaClient.store.cart.updateLineItem(cartId, lineItemId, {
      quantity,
    })
    return { success: true, data: res.cart }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update item quantity'
    return { success: false, error: message }
  }
}

/**
 * Remove a line item from the cart.
 */
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<CartOperationResult<StoreCart>> {
  try {
    const res = await medusaClient.store.cart.deleteLineItem(cartId, lineItemId)
    return { success: true, data: res.parent }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to remove item from cart'
    return { success: false, error: message }
  }
}

/**
 * Fetch available shipping options for the cart.
 */
export async function getCartShippingOptions(
  cartId: string
): Promise<{ success: boolean; options: StoreShippingOption[]; error?: string }> {
  try {
    const res = await medusaClient.store.fulfillment.listCartOptions({ cart_id: cartId })
    return { success: true, options: res.shipping_options || [] }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve shipping options'
    return { success: false, options: [], error: message }
  }
}

/**
 * Select a shipping method on the cart.
 */
export async function selectShippingMethod(
  cartId: string,
  optionId: string
): Promise<CartOperationResult<StoreCart>> {
  try {
    const res = await medusaClient.store.cart.addShippingMethod(cartId, {
      option_id: optionId,
    })
    return { success: true, data: res.cart }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to set shipping method'
    return { success: false, error: message }
  }
}

/**
 * Set customer contact email and Indian shipping/billing address on the cart.
 */
export async function updateCartCustomerAndAddress(
  cartId: string,
  input: {
    email: string
    shippingAddress: IndianAddressInput
  }
): Promise<CartOperationResult<StoreCart>> {
  try {
    const res = await medusaClient.store.cart.update(cartId, {
      email: input.email.trim().toLowerCase(),
      shipping_address: {
        first_name: input.shippingAddress.first_name.trim(),
        last_name: input.shippingAddress.last_name.trim(),
        address_1: input.shippingAddress.address_1.trim(),
        address_2: input.shippingAddress.address_2?.trim() || undefined,
        city: input.shippingAddress.city.trim(),
        province: input.shippingAddress.province.trim(),
        postal_code: input.shippingAddress.postal_code.trim(),
        phone: input.shippingAddress.phone.trim(),
        country_code: 'in',
      },
      billing_address: {
        first_name: input.shippingAddress.first_name.trim(),
        last_name: input.shippingAddress.last_name.trim(),
        address_1: input.shippingAddress.address_1.trim(),
        address_2: input.shippingAddress.address_2?.trim() || undefined,
        city: input.shippingAddress.city.trim(),
        province: input.shippingAddress.province.trim(),
        postal_code: input.shippingAddress.postal_code.trim(),
        phone: input.shippingAddress.phone.trim(),
        country_code: 'in',
      },
    })
    return { success: true, data: res.cart }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update customer and address'
    return { success: false, error: message }
  }
}

/**
 * Initiate payment session (defaulting to system provider) and complete the cart.
 * Completing an already completed cart returns the existing order idempotently.
 */
export async function completeCartCheckout(
  cartId: string,
  providerId: string = 'pp_system_default',
  token?: string | null
): Promise<CompleteOrderResult> {
  try {
    const customHeaders: Record<string, string> = {}
    if (token) {
      customHeaders['Authorization'] = `Bearer ${token}`
    }
    const headers = Object.keys(customHeaders).length > 0 ? customHeaders : undefined

    // 1. Retrieve latest cart state
    const cartRes = await getCart(cartId)
    if (!cartRes.success || !cartRes.data) {
      return { success: false, error: cartRes.error || 'Cart not found' }
    }
    const cart = cartRes.data

    // If cart is already completed, Medusa v2 complete() returns the order idempotently
    if (cart.completed_at) {
      const completeRes = headers
        ? await medusaClient.store.cart.complete(cartId, undefined, headers)
        : await medusaClient.store.cart.complete(cartId)
      if (completeRes.type === 'order') {
        return {
          success: true,
          type: 'order',
          order: completeRes.order,
        }
      }
    }

    if (!cart.items || cart.items.length === 0) {
      return { success: false, error: 'Cannot checkout with an empty cart' }
    }

    if (!cart.shipping_address) {
      return { success: false, error: 'Shipping address is required' }
    }

    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      return { success: false, error: 'Please select a shipping method before checkout' }
    }

    // 2. Initiate payment session
    if (headers) {
      await medusaClient.store.payment.initiatePaymentSession(
        cart,
        {
          provider_id: providerId,
        },
        undefined,
        headers
      )
    } else {
      await medusaClient.store.payment.initiatePaymentSession(cart, {
        provider_id: providerId,
      })
    }

    // 3. Complete cart checkout
    const completeRes = headers
      ? await medusaClient.store.cart.complete(cartId, undefined, headers)
      : await medusaClient.store.cart.complete(cartId)

    if (completeRes.type === 'order') {
      return {
        success: true,
        type: 'order',
        order: completeRes.order,
      }
    } else {
      return {
        success: false,
        type: 'cart',
        cart: completeRes.cart,
        error: 'Order could not be finalized. Please review your cart.',
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete checkout'
    return { success: false, error: message }
  }
}

/**
 * Server-side cryptographic signature verification for Razorpay checkout success.
 */
export async function verifyRazorpayPayment(
  cartId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STORE_PUBLISHABLE_KEY ||
      ''
    const res = await fetch(`${backendUrl}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey,
      },
      body: JSON.stringify({
        cart_id: cartId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { success: false, error: data.error || 'Payment signature verification failed' }
    }
    return { success: true }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error verifying payment',
    }
  }
}

/**
 * Retrieve placed order by ID for the confirmation page.
 * Passes customer auth token if provided to authenticate ownership.
 */
export async function getOrder(
  orderId: string,
  token?: string | null
): Promise<{ success: boolean; order?: StoreOrder; error?: string }> {
  try {
    const customHeaders: Record<string, string> = {}
    if (token) {
      customHeaders['Authorization'] = `Bearer ${token}`
    }
    const headers = Object.keys(customHeaders).length > 0 ? customHeaders : undefined

    const res = headers
      ? await medusaClient.store.order.retrieve(
          orderId,
          {
            fields:
              '*items,*items.variant,*shipping_address,*shipping_methods,*summary,*payment_collections',
          },
          headers
        )
      : await medusaClient.store.order.retrieve(orderId, {
          fields:
            '*items,*items.variant,*shipping_address,*shipping_methods,*summary,*payment_collections',
        })
    return { success: true, order: res.order }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve order'
    return { success: false, error: message }
  }
}
