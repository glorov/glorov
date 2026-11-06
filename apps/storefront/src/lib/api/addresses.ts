import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../constants'
import type { CustomerAddress } from '../../types/account'
import { DEMO_ACCOUNT_ADDRESSES } from '../../context/CustomerAuthContext'

/**
 * Raw Medusa Address response object
 */
export interface MedusaAddressResponse {
  id?: string
  address_name?: string
  metadata?: { name?: string; [key: string]: unknown }
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

/**
 * Transforms raw Medusa Address response into typed CustomerAddress
 */
export function mapMedusaAddress(addr: MedusaAddressResponse): CustomerAddress {
  const firstName = addr.first_name || ''
  const lastName = addr.last_name || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Customer'

  return {
    id: addr.id || `addr_${Date.now()}`,
    name: addr.address_name || addr.metadata?.name || 'Home',
    fullName,
    phoneNumber: addr.phone || '',
    addressLine1: addr.address_1 || '',
    addressLine2: addr.address_2 || undefined,
    city: addr.city || '',
    state: addr.province || '',
    pincode: addr.postal_code || '',
    countryCode: (addr.country_code || 'in').toLowerCase(),
    isDefault: Boolean(addr.is_default_shipping),
  }
}

/**
 * Converts a storefront CustomerAddress into a Medusa address payload
 */
export function toMedusaAddressPayload(addr: Partial<CustomerAddress>) {
  let first_name: string | undefined
  let last_name: string | undefined

  if (addr.fullName !== undefined) {
    const parts = addr.fullName.trim().split(/\s+/)
    first_name = parts[0] || 'Customer'
    last_name = parts.slice(1).join(' ') || ''
  }

  return {
    address_name: addr.name !== undefined ? addr.name : undefined,
    first_name,
    last_name,
    phone: addr.phoneNumber !== undefined ? addr.phoneNumber : undefined,
    address_1: addr.addressLine1 !== undefined ? addr.addressLine1 : undefined,
    address_2: addr.addressLine2 !== undefined ? addr.addressLine2 : undefined,
    city: addr.city !== undefined ? addr.city : undefined,
    province: addr.state !== undefined ? addr.state : undefined,
    postal_code: addr.pincode !== undefined ? addr.pincode : undefined,
    country_code: addr.countryCode ? addr.countryCode.toLowerCase() : 'in',
    is_default_shipping: addr.isDefault !== undefined ? Boolean(addr.isDefault) : undefined,
  }
}

/**
 * Lists addresses for authenticated customer via GET /store/customers/me
 */
export async function fetchCustomerAddresses(
  authToken?: string
): Promise<{ success: boolean; addresses: CustomerAddress[]; error?: string }> {
  try {
    // 1. In browser environments, call Next.js API route with httpOnly cookie
    if (typeof window !== 'undefined') {
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const res = await fetch('/api/customer/addresses', {
        method: 'GET',
        headers,
        credentials: 'include',
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.addresses)) {
          return { success: true, addresses: data.addresses }
        }
      }
    }

    // 2. Direct Medusa backend fallback (server-side or test environments)
    if (authToken && authToken.startsWith('jwt_demo_session_')) {
      return { success: true, addresses: DEMO_ACCOUNT_ADDRESSES }
    }

    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const medusaRes = await fetch(`${baseUrl}/store/customers/me?fields=*addresses`, {
      method: 'GET',
      headers: directHeaders,
      cache: 'no-store',
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        addresses: [],
        error: err.message || `Failed to fetch customer addresses (${medusaRes.status})`,
      }
    }

    const data = await medusaRes.json()
    const rawList = Array.isArray(data.customer?.addresses) ? data.customer.addresses : []
    const addresses = rawList.map(mapMedusaAddress)

    return { success: true, addresses }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to load customer addresses'
    return { success: false, addresses: [], error }
  }
}

/**
 * Adds new customer address via POST /store/customers/me/addresses
 */
export async function addCustomerAddress(
  addr: Omit<CustomerAddress, 'id'>,
  authToken?: string
): Promise<{ success: boolean; address?: CustomerAddress; addresses?: CustomerAddress[]; error?: string }> {
  try {
    // 1. Next.js API route call (client-side)
    if (typeof window !== 'undefined') {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(addr),
      }).catch(() => null)

      if (res) {
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.success) {
          return {
            success: true,
            address: data.address,
            addresses: data.addresses,
          }
        }
        if (!res.ok) {
          return { success: false, error: data.error || 'Failed to add address' }
        }
      }
    }

    // 2. Direct Medusa backend fallback
    if (authToken && authToken.startsWith('jwt_demo_session_')) {
      const mockAddr: CustomerAddress = {
        ...addr,
        id: `addr_demo_${Date.now()}`,
      }
      return { success: true, address: mockAddr }
    }

    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const payload = toMedusaAddressPayload(addr)

    const medusaRes = await fetch(`${baseUrl}/store/customers/me/addresses`, {
      method: 'POST',
      headers: directHeaders,
      body: JSON.stringify(payload),
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        error: err.message || `Failed to create address (${medusaRes.status})`,
      }
    }

    const data = await medusaRes.json()
    let createdAddr: CustomerAddress | undefined
    let allAddresses: CustomerAddress[] | undefined

    if (Array.isArray(data.customer?.addresses)) {
      const mapped = data.customer.addresses.map(mapMedusaAddress)
      allAddresses = mapped
      createdAddr = mapped[mapped.length - 1]
    } else if (data.address) {
      createdAddr = mapMedusaAddress(data.address)
    }

    return {
      success: true,
      address: createdAddr || { ...addr, id: `addr_${Date.now()}` },
      addresses: allAddresses,
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to create customer address'
    return { success: false, error }
  }
}

/**
 * Updates customer address via POST /store/customers/me/addresses/:id
 */
export async function updateCustomerAddress(
  id: string,
  addr: Partial<CustomerAddress>,
  authToken?: string
): Promise<{ success: boolean; address?: CustomerAddress; addresses?: CustomerAddress[]; error?: string }> {
  try {
    // 1. Next.js API route call (client-side)
    if (typeof window !== 'undefined') {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(addr),
      }).catch(() => null)

      if (res) {
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.success) {
          return {
            success: true,
            address: data.address,
            addresses: data.addresses,
          }
        }
        if (!res.ok) {
          return { success: false, error: data.error || 'Failed to update address' }
        }
      }
    }

    // 2. Direct Medusa backend fallback
    if (authToken && authToken.startsWith('jwt_demo_session_')) {
      return { success: true }
    }

    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const payload = toMedusaAddressPayload(addr)

    const medusaRes = await fetch(`${baseUrl}/store/customers/me/addresses/${id}`, {
      method: 'POST',
      headers: directHeaders,
      body: JSON.stringify(payload),
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        error: err.message || `Failed to update address (${medusaRes.status})`,
      }
    }

    const data = await medusaRes.json()
    let updatedAddr: CustomerAddress | undefined
    let allAddresses: CustomerAddress[] | undefined

    if (Array.isArray(data.customer?.addresses)) {
      const mapped = data.customer.addresses.map(mapMedusaAddress)
      allAddresses = mapped
      updatedAddr = mapped.find((a: CustomerAddress) => a.id === id)
    } else if (data.address) {
      updatedAddr = mapMedusaAddress(data.address)
    }

    return {
      success: true,
      address: updatedAddr,
      addresses: allAddresses,
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to update customer address'
    return { success: false, error }
  }
}

/**
 * Deletes customer address via DELETE /store/customers/me/addresses/:id
 */
export async function deleteCustomerAddress(
  id: string,
  authToken?: string
): Promise<{ success: boolean; deleted?: boolean; error?: string }> {
  try {
    // 1. Next.js API route call (client-side)
    if (typeof window !== 'undefined') {
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      }).catch(() => null)

      if (res) {
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.success) {
          return { success: true, deleted: true }
        }
        if (!res.ok) {
          return { success: false, error: data.error || 'Failed to delete address' }
        }
      }
    }

    // 2. Direct Medusa backend fallback
    if (authToken && authToken.startsWith('jwt_demo_session_')) {
      return { success: true, deleted: true }
    }

    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const directHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
    }
    if (authToken) {
      directHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const medusaRes = await fetch(`${baseUrl}/store/customers/me/addresses/${id}`, {
      method: 'DELETE',
      headers: directHeaders,
    })

    if (!medusaRes.ok) {
      const err = await medusaRes.json().catch(() => ({}))
      return {
        success: false,
        error: err.message || `Failed to delete address (${medusaRes.status})`,
      }
    }

    return { success: true, deleted: true }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unable to delete customer address'
    return { success: false, error }
  }
}

/**
 * Sets customer address as default via POST /store/customers/me/addresses/:id
 */
export async function setDefaultCustomerAddress(
  id: string,
  authToken?: string
): Promise<{ success: boolean; address?: CustomerAddress; error?: string }> {
  return updateCustomerAddress(id, { isDefault: true }, authToken)
}
