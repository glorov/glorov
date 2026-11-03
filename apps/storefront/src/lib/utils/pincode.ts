/**
 * Validates an Indian PIN code string.
 * Indian PIN codes are 6-digit numbers where the first digit is 1-9.
 *
 * @param pincode - String or number to test.
 * @returns True if valid 6-digit Indian PIN code.
 */
export function isValidPincode(pincode: string): boolean {
  const cleaned = pincode.trim()
  return /^[1-9][0-9]{5}$/.test(cleaned)
}

/**
 * Normalises a user-entered PIN code, trimming spaces and keeping digits.
 *
 * @param input - Raw input from form or query param.
 * @returns Sanitized 6-digit string or empty string if invalid.
 */
export function sanitizePincode(input: string): string {
  const digitsOnly = input.replace(/\D/g, '')
  return digitsOnly.slice(0, 6)
}
