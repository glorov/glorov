import { describe, it, expect } from 'vitest'
import { formatINR, calculateDiscountPercent } from '../../src/lib/utils/currency'
import { isValidPincode, sanitizePincode } from '../../src/lib/utils/pincode'
import { getOptimizedImageUrl } from '../../src/lib/utils/image'

describe('formatINR', () => {
  it('formats whole rupees correctly from paise', () => {
    expect(formatINR(4900)).toBe('₹49')
    expect(formatINR(149900)).toBe('₹1,499')
    expect(formatINR(0)).toBe('₹0')
  })

  it('formats fractional paise correctly', () => {
    expect(formatINR(4950)).toBe('₹49.50')
  })

  it('handles invalid inputs safely without throwing', () => {
    expect(formatINR(NaN)).toBe('₹0')
    expect(formatINR(Infinity)).toBe('₹0')
  })
})

describe('calculateDiscountPercent', () => {
  it('calculates correct integer percentage', () => {
    expect(calculateDiscountPercent(10000, 8000)).toBe(20)
    expect(calculateDiscountPercent(50000, 25000)).toBe(50)
  })

  it('returns 0 if current price is equal or higher than original', () => {
    expect(calculateDiscountPercent(10000, 10000)).toBe(0)
    expect(calculateDiscountPercent(10000, 12000)).toBe(0)
  })
})

describe('isValidPincode & sanitizePincode', () => {
  it('validates 6-digit Indian PIN codes', () => {
    expect(isValidPincode('411001')).toBe(true)
    expect(isValidPincode('110001')).toBe(true)
    expect(isValidPincode('011001')).toBe(false) // Leading zero is invalid in India
    expect(isValidPincode('41100')).toBe(false)  // 5 digits
    expect(isValidPincode('4110011')).toBe(false) // 7 digits
    expect(isValidPincode('ABCD41')).toBe(false)
  })

  it('sanitizes input safely', () => {
    expect(sanitizePincode(' 411 001 ')).toBe('411001')
    expect(sanitizePincode('411001-99')).toBe('411001')
  })
})

describe('getOptimizedImageUrl', () => {
  it('returns default logo when url is falsy', () => {
    expect(getOptimizedImageUrl(null)).toBe('/logo/glorov-logo.svg')
    expect(getOptimizedImageUrl(undefined)).toBe('/logo/glorov-logo.svg')
  })

  it('applies Cloudinary transforms to cloudinary URLs', () => {
    const raw = 'https://res.cloudinary.com/naodmm8w/image/upload/v1/glorov/seeds/basil.jpg'
    const transformed = getOptimizedImageUrl(raw, { width: 400, height: 400, crop: 'fill' })
    expect(transformed).toContain('w_400,h_400,c_fill')
  })
})
