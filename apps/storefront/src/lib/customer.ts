import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from './medusa-client'
import { getCustomerToken } from './auth-session'
import type {
  CustomerRegistrationInput,
  CustomerLoginInput,
  CustomerProfileUpdateInput,
  CustomerAddressInput,
  OrderReturnRequestInput,
} from '@glorov/types'
import type { StoreOrder } from './cart'

export interface StoreCustomerAddress {
  id: string
  address_name?: string | null
  first_name: string
  last_name: string
  address_1: string
  address_2?: string | null
  city: string
  province: string
  postal_code: string
  phone?: string | null
  company?: string | null
  country_code: string
  is_default_shipping: boolean
  is_default_billing: boolean
  customer_id?: string
  created_at?: string
  updated_at?: string
}

export interface StoreCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string | null
  company_name?: string | null
  has_account: boolean
  addresses: StoreCustomerAddress[]
  created_at?: string
  updated_at?: string
}

export interface CustomerAuthResult {
  success: boolean
  token?: string
  customer?: StoreCustomer
  error?: string
}

export interface CustomerOperationResult<T = StoreCustomer> {
  success: boolean
  data?: T
  error?: string
  status?: number
}

/**
 * Common headers for Store API calls
 */
function getStoreHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = MEDUSA_PUBLISHABLE_KEY
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Register a new customer via Medusa v2 Auth and Store API.
 * 1. Creates authentication identity under emailpass provider.
 * 2. Creates the customer profile in Medusa linked to the auth identity.
 * 3. Authenticates to return a persistent customer session token.
 */
export async function registerCustomer(
  input: CustomerRegistrationInput
): Promise<CustomerAuthResult> {
  try {
    const email = input.email.trim().toLowerCase()
    const password = input.password

    // 1. Register with emailpass provider
    const regRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    if (!regRes.ok) {
      const errData = await regRes.json().catch(() => ({}))
      const msg =
        errData.message ||
        (regRes.status === 400 || regRes.status === 409
          ? 'An account with this email already exists'
          : 'Registration failed. Please check your details.')
      return { success: false, error: msg }
    }

    const regData = await regRes.json()
    const identityToken = regData.token
    if (!identityToken) {
      return { success: false, error: 'Registration did not return an auth token' }
    }

    // 2. Create customer record linked to auth identity
    const custRes = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
      method: 'POST',
      headers: getStoreHeaders(identityToken),
      body: JSON.stringify({
        email,
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        phone: input.phone ? input.phone.trim() : undefined,
      }),
      cache: 'no-store',
    })

    if (!custRes.ok) {
      const errData = await custRes.json().catch(() => ({}))
      return {
        success: false,
        error: errData.message || 'Failed to create customer profile',
      }
    }

    // 3. Log in with the newly registered credentials to obtain actor-scoped session token
    const loginRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    if (!loginRes.ok) {
      return {
        success: false,
        error: 'Account created, but initial sign in failed. Please log in.',
      }
    }

    const loginData = await loginRes.json()
    const sessionToken = loginData.token

    // Retrieve fresh customer profile
    const profileRes = await getCurrentCustomer(sessionToken)
    return {
      success: true,
      token: sessionToken,
      customer: profileRes.data,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration network error'
    return { success: false, error: message }
  }
}

/**
 * Log in customer via Medusa v2 emailpass authentication.
 */
export async function loginCustomer(
  input: CustomerLoginInput
): Promise<CustomerAuthResult> {
  try {
    const email = input.email.trim().toLowerCase()
    const password = input.password

    const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return {
        success: false,
        error:
          errData.message === 'Invalid email or password'
            ? 'Invalid email or password'
            : errData.message || 'Authentication failed. Please check your credentials.',
      }
    }

    const data = await res.json()
    const sessionToken = data.token

    const profileRes = await getCurrentCustomer(sessionToken)
    return {
      success: true,
      token: sessionToken,
      customer: profileRes.data,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login network error'
    return { success: false, error: message }
  }
}

/**
 * Retrieve current customer profile with addresses.
 * Uses provided token or resolves from secure session cookie.
 */
export async function getCurrentCustomer(
  token?: string | null
): Promise<CustomerOperationResult<StoreCustomer>> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, error: 'No active customer session' }
    }

    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/customers/me?fields=*addresses`,
      {
        headers: getStoreHeaders(activeToken),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, status: 401, error: 'Session expired. Please log in again.' }
      }
      const errData = await res.json().catch(() => ({}))
      return { success: false, status: res.status, error: errData.message || 'Failed to fetch customer profile' }
    }

    const data = await res.json()
    return { success: true, status: 200, data: data.customer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching customer profile'
    return { success: false, error: message }
  }
}

/**
 * Update authenticated customer profile.
 */
export async function updateCustomerProfile(
  input: CustomerProfileUpdateInput,
  token?: string | null
): Promise<CustomerOperationResult<StoreCustomer>> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
      method: 'POST',
      headers: getStoreHeaders(activeToken),
      body: JSON.stringify({
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        phone: input.phone ? input.phone.trim() : undefined,
        company_name: input.company_name ? input.company_name.trim() : undefined,
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.message || 'Failed to update profile' }
    }

    const data = await res.json()
    return { success: true, data: data.customer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating profile'
    return { success: false, error: message }
  }
}

/**
 * Add delivery address to customer profile.
 */
export async function addCustomerAddress(
  input: CustomerAddressInput,
  token?: string | null
): Promise<CustomerOperationResult<StoreCustomer>> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me/addresses`, {
      method: 'POST',
      headers: getStoreHeaders(activeToken),
      body: JSON.stringify({
        address_name: input.address_name ? input.address_name.trim() : undefined,
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        address_1: input.address_1.trim(),
        address_2: input.address_2 ? input.address_2.trim() : undefined,
        city: input.city.trim(),
        province: input.province.trim(),
        postal_code: input.postal_code.trim(),
        phone: input.phone.trim(),
        country_code: 'in',
        is_default_shipping: Boolean(input.is_default_shipping),
        is_default_billing: Boolean(input.is_default_billing),
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.message || 'Failed to add address' }
    }

    const data = await res.json()
    return { success: true, data: data.customer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error adding address'
    return { success: false, error: message }
  }
}

/**
 * Update existing customer delivery address.
 */
export async function updateCustomerAddress(
  addressId: string,
  input: Partial<CustomerAddressInput>,
  token?: string | null
): Promise<CustomerOperationResult<StoreCustomer>> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, error: 'Not authenticated' }
    }

    const body: Record<string, unknown> = {}
    if (input.address_name !== undefined) body.address_name = input.address_name?.trim() || null
    if (input.first_name !== undefined) body.first_name = input.first_name.trim()
    if (input.last_name !== undefined) body.last_name = input.last_name.trim()
    if (input.address_1 !== undefined) body.address_1 = input.address_1.trim()
    if (input.address_2 !== undefined) body.address_2 = input.address_2?.trim() || null
    if (input.city !== undefined) body.city = input.city.trim()
    if (input.province !== undefined) body.province = input.province.trim()
    if (input.postal_code !== undefined) body.postal_code = input.postal_code.trim()
    if (input.phone !== undefined) body.phone = input.phone.trim()
    if (input.is_default_shipping !== undefined) body.is_default_shipping = input.is_default_shipping
    if (input.is_default_billing !== undefined) body.is_default_billing = input.is_default_billing

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
      method: 'POST',
      headers: getStoreHeaders(activeToken),
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.message || 'Failed to update address' }
    }

    const data = await res.json()
    return { success: true, data: data.customer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating address'
    return { success: false, error: message }
  }
}

/**
 * Delete a saved delivery address.
 */
export async function deleteCustomerAddress(
  addressId: string,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getStoreHeaders(activeToken),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.message || 'Failed to delete address' }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting address'
    return { success: false, error: message }
  }
}

/**
 * Fetch customer orders list.
 */
export async function getCustomerOrders(
  token?: string | null
): Promise<{ success: boolean; orders: StoreOrder[]; count: number; error?: string }> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, orders: [], count: 0, error: 'Not authenticated' }
    }

    const fields =
      '*items,*items.variant,*shipping_address,*shipping_methods,*summary,*payment_collections'
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders?fields=${encodeURIComponent(fields)}`, {
      headers: getStoreHeaders(activeToken),
      cache: 'no-store',
    })

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, orders: [], count: 0, error: 'Session expired' }
      }
      const errData = await res.json().catch(() => ({}))
      return { success: false, orders: [], count: 0, error: errData.message || 'Failed to fetch orders' }
    }

    const data = await res.json()
    return { success: true, orders: data.orders || [], count: data.count || 0 }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving orders'
    return { success: false, orders: [], count: 0, error: message }
  }
}

/**
 * Fetch single order with ownership validation.
 */
export async function getCustomerOrder(
  orderId: string,
  token?: string | null
): Promise<{ success: boolean; order?: StoreOrder; error?: string; status?: number }> {
  try {
    const activeToken = token || (await getCustomerToken())
    const fields =
      '*items,*items.variant,*shipping_address,*shipping_methods,*summary,*payment_collections'
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/orders/${orderId}?fields=${encodeURIComponent(fields)}`,
      {
        headers: getStoreHeaders(activeToken),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return {
        success: false,
        status: res.status,
        error:
          res.status === 403
            ? 'You do not have permission to access this order'
            : res.status === 401
            ? 'Authentication required to view this order'
            : errData.message || 'Failed to retrieve order',
      }
    }

    const data = await res.json()
    return { success: true, order: data.order }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving order details'
    return { success: false, error: message }
  }
}

/**
 * Associate active cart with the authenticated customer.
 * Preserves existing cart items without duplicating or dropping them.
 */
export async function associateCartWithCustomer(
  cartId: string,
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      method: 'POST',
      headers: getStoreHeaders(token),
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.message || 'Failed to associate cart' }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cart association error'
    return { success: false, error: message }
  }
}

/**
 * Request password reset token / email.
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const trimmedEmail = email.trim().toLowerCase()
    const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: trimmedEmail }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, message: '', error: errData.message || 'Password reset request failed' }
    }

    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error during password reset'
    return { success: false, message: '', error: message }
  }
}

/**
 * Update authenticated customer password via Medusa v2 emailpass provider.
 */
export async function updateCustomerPassword(
  newPassword: string,
  token?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const activeToken = token || (await getCustomerToken())
    if (!activeToken) {
      return { success: false, error: 'Not authenticated' }
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me/password`, {
      method: 'POST',
      headers: getStoreHeaders(activeToken),
      body: JSON.stringify({ password: newPassword }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.message || 'Failed to update password' }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating password'
    return { success: false, error: message }
  }
}

/**
 * Reset customer password using recovery token issued by Medusa v2.
 */
export async function resetCustomerPassword(
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedToken = resetToken.trim()
    if (!trimmedToken) {
      return { success: false, error: 'Reset token is required' }
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedToken}`,
      },
      body: JSON.stringify({ password: newPassword }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return {
        success: false,
        error:
          res.status === 401
            ? 'Password reset token is invalid or has expired. Please request a new link.'
            : errData.message || 'Failed to reset password',
      }
    }

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error resetting password'
    return { success: false, error: message }
  }
}

export interface CustomerReturnRequest {
  id: string
  created_at: string
  status: 'pending_review' | 'approved' | 'rejected'
  items: Array<{
    line_item_id: string
    title: string
    variant_title?: string
    sku?: string
    quantity: number
    reason: string
  }>
  customer_notes?: string | null
  seller_decision?: {
    decision: 'approved' | 'rejected'
    decided_at: string
    customer_note?: string | null
    decision_notes?: string | null
    return_action?: string | null
    return_shipping_required?: boolean
  } | null
  refund_status: 'not_applicable' | 'pending' | 'refunded' | 'rejected'
  refund_amount_inr?: number | null
}

/**
 * Cancel an eligible customer order.
 */
export async function cancelOrder(
  orderId: string,
  token?: string | null,
  reason?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const activeToken = token || (await getCustomerToken())
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getStoreHeaders(activeToken),
      body: JSON.stringify({ reason: reason || 'Customer requested cancellation' }),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to cancel order' }
    }

    return { success: true, message: data.message }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error cancelling order'
    return { success: false, error: message }
  }
}

/**
 * Submit a return request for eligible items in an order.
 */
export async function submitReturnRequest(
  orderId: string,
  data: OrderReturnRequestInput,
  token?: string | null
): Promise<{ success: boolean; return_request?: CustomerReturnRequest; message?: string; error?: string }> {
  try {
    const activeToken = token || (await getCustomerToken())
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}/return-request`, {
      method: 'POST',
      headers: getStoreHeaders(activeToken),
      body: JSON.stringify(data),
      cache: 'no-store',
    })

    const resData = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, error: resData.message || 'Failed to submit return request' }
    }

    return { success: true, return_request: resData.return_request, message: resData.message }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error submitting return request'
    return { success: false, error: message }
  }
}

/**
 * Retrieve customer return requests for an order.
 */
export async function getOrderReturnRequests(
  orderId: string,
  token?: string | null
): Promise<{ success: boolean; return_requests: CustomerReturnRequest[]; error?: string }> {
  try {
    const activeToken = token || (await getCustomerToken())
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}/return-request`, {
      headers: getStoreHeaders(activeToken),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { success: false, return_requests: [], error: data.message || 'Failed to fetch return requests' }
    }

    return { success: true, return_requests: data.return_requests || [] }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error retrieving return requests'
    return { success: false, return_requests: [], error: message }
  }
}


