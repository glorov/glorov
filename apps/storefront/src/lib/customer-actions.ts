'use server'

import { cookies } from 'next/headers'
import {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  updateCustomerProfile,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  getCustomerOrders,
  getCustomerOrder,
  associateCartWithCustomer,
  requestPasswordReset,
  updateCustomerPassword,
  resetCustomerPassword,
  cancelOrder,
  submitReturnRequest,
  getOrderReturnRequests,
  type StoreCustomer,
  type CustomerReturnRequest,
} from './customer'
import {
  setCustomerTokenCookie,
  clearCustomerTokenCookie,
  getCustomerToken,
} from './auth-session'
import { clearCartIdCookie } from './cart-actions'
import { CART_COOKIE_NAME } from './constants'
import {
  customerRegistrationSchema,
  customerLoginSchema,
  customerProfileUpdateSchema,
  customerAddressInputSchema,
  customerPasswordUpdateSchema,
  customerPasswordResetSchema,
  orderCancellationSchema,
  orderReturnRequestSchema,
  type CustomerRegistrationInput,
  type CustomerLoginInput,
  type CustomerProfileUpdateInput,
  type CustomerAddressInput,
  type CustomerPasswordUpdateInput,
  type CustomerPasswordResetInput,
  type OrderCancellationInput,
  type OrderReturnRequestInput,
} from '@glorov/types'
import type { StoreOrder } from './cart'

/**
 * Server-side helper to read cart ID cookie
 */
async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(CART_COOKIE_NAME)
  return cookie?.value || null
}

/**
 * Register a new customer account.
 * Persists session token in HTTP-only cookie and attaches active guest cart if present.
 */
export async function registerCustomerAction(
  input: CustomerRegistrationInput
): Promise<{ success: boolean; customer?: StoreCustomer; error?: string }> {
  try {
    const parseResult = customerRegistrationSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid registration data'
      return { success: false, error: firstError }
    }

    const regResult = await registerCustomer(parseResult.data)
    if (!regResult.success || !regResult.token) {
      return { success: false, error: regResult.error || 'Registration failed' }
    }

    // Set secure HTTP-only cookie
    await setCustomerTokenCookie(regResult.token)

    // Associate existing cart if one exists
    const cartId = await getCartIdFromCookie()
    if (cartId && regResult.customer?.email) {
      await associateCartWithCustomer(cartId, regResult.customer.email, regResult.token)
    }

    return { success: true, customer: regResult.customer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return { success: false, error: message }
  }
}

/**
 * Log in customer with email and password.
 * Restores session token in HTTP-only cookie and attaches active guest cart.
 */
export async function loginCustomerAction(
  input: CustomerLoginInput
): Promise<{ success: boolean; customer?: StoreCustomer; error?: string }> {
  try {
    const parseResult = customerLoginSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid credentials'
      return { success: false, error: firstError }
    }

    const loginResult = await loginCustomer(parseResult.data)
    if (!loginResult.success || !loginResult.token) {
      return { success: false, error: loginResult.error || 'Authentication failed' }
    }

    // Set secure HTTP-only cookie
    await setCustomerTokenCookie(loginResult.token)

    // Associate existing cart if one exists
    const cartId = await getCartIdFromCookie()
    if (cartId && loginResult.customer?.email) {
      await associateCartWithCustomer(cartId, loginResult.customer.email, loginResult.token)
    }

    return { success: true, customer: loginResult.customer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return { success: false, error: message }
  }
}

/**
 * Log out customer by clearing session cookie.
 */
export async function logoutCustomerAction(): Promise<{ success: boolean }> {
  await clearCustomerTokenCookie()
  await clearCartIdCookie()
  return { success: true }
}

/**
 * Get current customer profile.
 * Automatically clears session cookie if session is expired.
 */
export async function getCurrentCustomerAction(): Promise<{
  success: boolean
  customer?: StoreCustomer
  error?: string
}> {
  try {
    const token = await getCustomerToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await getCurrentCustomer(token)
    if (!res.success) {
      // Clear cookie only on expired or invalid session (401), preserving session on transient server errors
      if (res.status === 401 || res.error?.includes('Session expired')) {
        await clearCustomerTokenCookie()
      }
      return { success: false, error: res.error }
    }

    return { success: true, customer: res.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve profile'
    return { success: false, error: message }
  }
}

/**
 * Update profile information for authenticated customer.
 */
export async function updateCustomerProfileAction(
  input: CustomerProfileUpdateInput
): Promise<{ success: boolean; customer?: StoreCustomer; error?: string }> {
  try {
    const parseResult = customerProfileUpdateSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid profile data'
      return { success: false, error: firstError }
    }

    const token = await getCustomerToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await updateCustomerProfile(parseResult.data, token)
    if (!res.success) {
      return { success: false, error: res.error }
    }

    return { success: true, customer: res.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: message }
  }
}

/**
 * Add a new saved address.
 */
export async function addCustomerAddressAction(
  input: CustomerAddressInput
): Promise<{ success: boolean; customer?: StoreCustomer; error?: string }> {
  try {
    const parseResult = customerAddressInputSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid address data'
      return { success: false, error: firstError }
    }

    const token = await getCustomerToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await addCustomerAddress(parseResult.data, token)
    if (!res.success) {
      return { success: false, error: res.error }
    }

    return { success: true, customer: res.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add address'
    return { success: false, error: message }
  }
}

/**
 * Update an existing saved address.
 */
export async function updateCustomerAddressAction(
  addressId: string,
  input: Partial<CustomerAddressInput>
): Promise<{ success: boolean; customer?: StoreCustomer; error?: string }> {
  try {
    const token = await getCustomerToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await updateCustomerAddress(addressId, input, token)
    if (!res.success) {
      return { success: false, error: res.error }
    }

    return { success: true, customer: res.data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update address'
    return { success: false, error: message }
  }
}

/**
 * Delete a saved address.
 */
export async function deleteCustomerAddressAction(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getCustomerToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    return await deleteCustomerAddress(addressId, token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete address'
    return { success: false, error: message }
  }
}

/**
 * Get customer orders.
 */
export async function getCustomerOrdersAction(): Promise<{
  success: boolean
  orders: StoreOrder[]
  count: number
  error?: string
}> {
  try {
    const token = await getCustomerToken()
    if (!token) {
      return { success: false, orders: [], count: 0, error: 'Not authenticated' }
    }

    return await getCustomerOrders(token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve orders'
    return { success: false, orders: [], count: 0, error: message }
  }
}

/**
 * Get single order with server-side ownership enforcement.
 */
export async function getCustomerOrderAction(
  orderId: string
): Promise<{
  success: boolean
  order?: StoreOrder
  error?: string
  status?: number
}> {
  try {
    const token = await getCustomerToken()
    return await getCustomerOrder(orderId, token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve order'
    return { success: false, error: message }
  }
}

/**
 * Request password recovery instructions.
 */
export async function requestPasswordResetAction(
  email: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, message: '', error: 'Enter a valid email address' }
    }
    return await requestPasswordReset(email)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Password reset failed'
    return { success: false, message: '', error: message }
  }
}

/**
 * Update authenticated customer's password.
 */
export async function updateCustomerPasswordAction(
  input: CustomerPasswordUpdateInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parseResult = customerPasswordUpdateSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid password data'
      return { success: false, error: firstError }
    }

    const token = await getCustomerToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    return await updateCustomerPassword(parseResult.data.password, token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update password'
    return { success: false, error: message }
  }
}

/**
 * Reset password using token received via email/notification.
 */
export async function resetCustomerPasswordAction(
  input: CustomerPasswordResetInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parseResult = customerPasswordResetSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid password reset data'
      return { success: false, error: firstError }
    }

    return await resetCustomerPassword(parseResult.data.token, parseResult.data.password)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Password reset failed'
    return { success: false, error: message }
  }
}

/**
 * Cancel an eligible customer order.
 */
export async function cancelCustomerOrderAction(
  orderId: string,
  input?: OrderCancellationInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const token = await getCustomerToken()
    const parsed = orderCancellationSchema.safeParse(input || {})
    const reason = parsed.success ? parsed.data.reason : undefined
    return await cancelOrder(orderId, token, reason)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cancellation failed'
    return { success: false, error: message }
  }
}

/**
 * Submit return request for eligible items in an order.
 */
export async function submitReturnRequestAction(
  orderId: string,
  input: OrderReturnRequestInput
): Promise<{
  success: boolean
  return_request?: CustomerReturnRequest
  message?: string
  error?: string
}> {
  try {
    const token = await getCustomerToken()
    const parseResult = orderReturnRequestSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid return request data'
      return { success: false, error: firstError }
    }

    return await submitReturnRequest(orderId, parseResult.data, token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Return request submission failed'
    return { success: false, error: message }
  }
}

/**
 * Get return requests submitted for an order.
 */
export async function getOrderReturnRequestsAction(
  orderId: string
): Promise<{
  success: boolean
  return_requests: CustomerReturnRequest[]
  error?: string
}> {
  try {
    const token = await getCustomerToken()
    return await getOrderReturnRequests(orderId, token)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch return requests'
    return { success: false, return_requests: [], error: message }
  }
}


