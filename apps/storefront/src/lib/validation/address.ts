/**
 * Indian Address Validation and Constants
 * Conforms to GLOROV-ADDR-001 specification:
 * - 6-digit Indian PIN code (regex: /^[1-9][0-9]{5}$/)
 * - 10-digit Indian mobile number
 * - Official 36 Indian States and Union Territories
 */

export const INDIAN_STATES: readonly string[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

/**
 * Validates Indian 6-digit postal code (PIN).
 * PIN code cannot start with 0. Format: /^[1-9][0-9]{5}$/
 */
export const PIN_CODE_REGEX = /^[1-9][0-9]{5}$/

export function isValidPinCode(pincode: string | undefined | null): boolean {
  if (!pincode) return false
  const clean = pincode.trim().replace(/\D/g, '')
  return PIN_CODE_REGEX.test(clean)
}

/**
 * Validates Indian 10-digit mobile number.
 * Standard Indian mobile numbers start with 6, 7, 8, 9 and are 10 digits long.
 */
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/

export function isValidIndianPhone(phone: string | undefined | null): boolean {
  if (!phone) return false
  const clean = phone.trim().replace(/\D/g, '')
  const normalized = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean
  return normalized.length === 10 && (/^[6-9]\d{9}$/.test(normalized) || /^\d{10}$/.test(normalized))
}

/**
 * Validates whether the state matches a recognized Indian State or Union Territory.
 */
export function isValidIndianState(state: string | undefined | null): boolean {
  if (!state || typeof state !== 'string') return false
  const normalized = state.trim().toLowerCase()
  return INDIAN_STATES.some((s) => s.toLowerCase() === normalized)
}

export interface AddressValidationResult {
  isValid: boolean
  errors: {
    fullName?: string
    phoneNumber?: string
    email?: string
    addressLine1?: string
    city?: string
    state?: string
    pincode?: string
    general?: string
  }
}

export function validateIndianAddress(data: {
  fullName?: string
  phoneNumber?: string
  email?: string
  addressLine1?: string
  city?: string
  state?: string
  pincode?: string
  requireEmail?: boolean
}): AddressValidationResult {
  const errors: AddressValidationResult['errors'] = {}

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters)'
  }

  if (!data.phoneNumber || !isValidIndianPhone(data.phoneNumber)) {
    errors.phoneNumber = 'Enter a valid 10-digit Indian mobile number'
  }

  if (data.requireEmail) {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Enter a valid email address for order notifications'
    }
  }

  if (!data.addressLine1 || data.addressLine1.trim().length < 5) {
    errors.addressLine1 = 'Enter house/flat no., building and street address (min 5 characters)'
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'Enter city or district'
  }

  if (!data.state || !isValidIndianState(data.state)) {
    errors.state = 'Please select a valid Indian State or Union Territory'
  }

  if (!data.pincode || !isValidPinCode(data.pincode)) {
    errors.pincode = 'Enter a valid 6-digit Indian PIN code (cannot start with 0)'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
