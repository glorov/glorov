import type {
  PincodeServiceabilityRequest,
  PincodeServiceabilityResponse,
  ServiceabilityStatus,
  ShippingRateSource,
} from '@glorov/types'
import { PINCODE_STORAGE_KEY } from './constants'

export type {
  PincodeServiceabilityRequest,
  PincodeServiceabilityResponse,
  ServiceabilityStatus,
  ShippingRateSource,
}

/**
 * Strips whitespace and non-numeric characters from a pincode string.
 */
export function cleanPincode(pincode: string): string {
  if (!pincode || typeof pincode !== 'string') return ''
  return pincode.trim().replace(/\D/g, '').slice(0, 6)
}

/**
 * Validates strict Indian Postal Index Number (PIN):
 * - Exactly 6 digits
 * - Cannot start with 0
 */
export function isValidIndianPincode(pincode: string): boolean {
  if (!pincode || typeof pincode !== 'string') return false
  const stripped = pincode.trim().replace(/\s+/g, '')
  return /^[1-9][0-9]{5}$/.test(stripped)
}

/**
 * Safe client-side retrieval of last checked pincode from localStorage.
 */
export function getStoredPincode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(PINCODE_STORAGE_KEY)
    if (stored && isValidIndianPincode(stored)) {
      return stored
    }
  } catch {
    // Gracefully handle storage disabled/quota errors
  }
  return null
}

/**
 * Safe client-side persistence of validated pincode.
 */
export function setStoredPincode(pincode: string): void {
  if (typeof window === 'undefined') return
  try {
    const clean = cleanPincode(pincode)
    if (isValidIndianPincode(clean)) {
      window.localStorage.setItem(PINCODE_STORAGE_KEY, clean)
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Server/Client service to check Indian pincode serviceability, delivery timeline,
 * dynamic rate estimation, and COD eligibility.
 */
export async function checkPincodeServiceability(
  params: PincodeServiceabilityRequest
): Promise<PincodeServiceabilityResponse> {
  const cleanPin = cleanPincode(params.pincode)

  if (!isValidIndianPincode(cleanPin)) {
    return {
      pincode: cleanPin,
      serviceable: false,
      status: 'rejected',
      prepaid_eligible: false,
      cod_available: false,
      cod_eligible: false,
      cod_restriction_reason: 'invalid_format',
      message: 'Invalid 6-digit Indian PIN code format. Must be 6 digits and cannot start with 0.',
    }
  }

  const query = new URLSearchParams({ pincode: cleanPin })
  if (params.is_perishable) query.set('is_perishable', 'true')
  if (params.weight_kg) query.set('weight', params.weight_kg.toString())
  if (params.cod !== undefined) query.set('cod', params.cod ? 'true' : 'false')
  if (params.declared_value_inr) query.set('declared_value', params.declared_value_inr.toString())

  try {
    // When executing in browser, call Next.js API route handler to preserve backend secrets
    const endpoint = `/api/shipping/pincode-check?${query.toString()}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        pincode: cleanPin,
        serviceable: false,
        status: data.status || (response.status >= 500 ? 'undetermined' : 'rejected'),
        prepaid_eligible: false,
        cod_available: false,
        cod_eligible: false,
        message: data.message || 'Serviceability check failed',
      }
    }

    return {
      pincode: data.pincode || cleanPin,
      serviceable: Boolean(data.serviceable),
      status: data.status || (data.serviceable ? 'confirmed' : 'rejected'),
      city: data.city,
      state: data.state,
      prepaid_eligible: Boolean(data.prepaid_eligible),
      cod_available: Boolean(data.cod_available),
      cod_eligible: Boolean(data.cod_eligible ?? data.cod_available),
      cod_restriction_reason: data.cod_restriction_reason,
      estimated_days: data.estimated_days,
      courier_name: data.courier_name,
      rate_inr: data.rate_inr,
      rate_source: data.rate_source,
      message: data.message,
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Network error during pincode check'
    return {
      pincode: cleanPin,
      serviceable: false,
      status: 'undetermined',
      prepaid_eligible: false,
      cod_available: false,
      cod_eligible: false,
      message: `Logistics service temporarily unreachable: ${errMsg}. Please try again.`,
    }
  }
}
