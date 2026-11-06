import { describe, it, expect } from 'vitest'
import {
  formatINR as formatINRPaise,
  calculateDiscountPercent,
} from '../lib/utils/currency'
import { formatINR as formatINRAmount } from '../components/product/ProductPrice'

describe('Price Formatting and Paise Conversion Unit Tests (price-formatting.test.ts)', () => {
  describe('formatINR from Paise (lib/utils/currency.ts)', () => {
    it('formats exact paise values into clean rupee strings without decimal places', () => {
      // 4900 paise = ₹49
      expect(formatINRPaise(4900)).toBe('₹49')
      // 9900 paise = ₹99
      expect(formatINRPaise(9900)).toBe('₹99')
      // 14900 paise = ₹149
      expect(formatINRPaise(14900)).toBe('₹149')
      // 59900 paise = ₹599
      expect(formatINRPaise(59900)).toBe('₹599')
    })

    it('formats fractional paise values with 2 decimal places', () => {
      // 4950 paise = ₹49.50
      expect(formatINRPaise(4950)).toBe('₹49.50')
      // 9925 paise = ₹99.25
      expect(formatINRPaise(9925)).toBe('₹99.25')
      // 1005 paise = ₹10.05
      expect(formatINRPaise(1005)).toBe('₹10.05')
    })

    it('forces 2 decimal places when includeDecimals is true', () => {
      expect(formatINRPaise(4900, true)).toBe('₹49.00')
      expect(formatINRPaise(10000, true)).toBe('₹100.00')
      expect(formatINRPaise(0, true)).toBe('₹0.00')
    })

    it('formats large numbers conforming to Indian grouping system (Lakhs and Crores)', () => {
      // ₹1,499 (149900 paise)
      expect(formatINRPaise(149900)).toBe('₹1,499')
      // ₹12,345 (1234500 paise)
      expect(formatINRPaise(1234500)).toBe('₹12,345')
      // ₹1,23,456 (12345600 paise)
      expect(formatINRPaise(12345600)).toBe('₹1,23,456')
    })

    it('handles zero, negative, and non-finite inputs gracefully', () => {
      expect(formatINRPaise(0)).toBe('₹0')
      expect(formatINRPaise(NaN)).toBe('₹0')
      expect(formatINRPaise(Infinity)).toBe('₹0')
      expect(formatINRPaise(-Infinity)).toBe('₹0')
    })
  })

  describe('Paise / Rupee Conversion Logic', () => {
    it('converts Medusa minor units (paise) to integer rupees safely', () => {
      const paiseToInr = (paise: number) => Math.round(paise / 100)
      const inrToPaise = (inr: number) => Math.round(inr * 100)

      expect(paiseToInr(4900)).toBe(49)
      expect(paiseToInr(149900)).toBe(1499)
      expect(paiseToInr(9950)).toBe(100) // Rounded

      expect(inrToPaise(49)).toBe(4900)
      expect(inrToPaise(1499)).toBe(149900)
      expect(inrToPaise(99.5)).toBe(9950)
    })

    it('correctly splits paise into whole rupees and remainder paise subunits', () => {
      const splitPaise = (paise: number) => ({
        rupees: Math.floor(paise / 100),
        paiseRemainder: paise % 100,
      })

      expect(splitPaise(4950)).toEqual({ rupees: 49, paiseRemainder: 50 })
      expect(splitPaise(9900)).toEqual({ rupees: 99, paiseRemainder: 0 })
      expect(splitPaise(75)).toEqual({ rupees: 0, paiseRemainder: 75 })
    })
  })

  describe('calculateDiscountPercent (lib/utils/currency.ts)', () => {
    it('calculates integer discount percentage between original and sale paise', () => {
      // Original: 20000 paise (₹200), Current: 15000 paise (₹150) -> 25% off
      expect(calculateDiscountPercent(20000, 15000)).toBe(25)

      // Original: 14900 paise (₹149), Current: 9900 paise (₹99) -> ~34% off
      expect(calculateDiscountPercent(14900, 9900)).toBe(34)

      // Original: 10000 paise (₹100), Current: 5000 paise (₹50) -> 50% off
      expect(calculateDiscountPercent(10000, 5000)).toBe(50)
    })

    it('returns 0 when sale price is equal to or greater than original price', () => {
      expect(calculateDiscountPercent(10000, 10000)).toBe(0)
      expect(calculateDiscountPercent(10000, 12000)).toBe(0)
    })

    it('returns 0 for non-positive original prices', () => {
      expect(calculateDiscountPercent(0, 5000)).toBe(0)
      expect(calculateDiscountPercent(-1000, 5000)).toBe(0)
    })
  })

  describe('formatINR from Rupee Amount (components/product/ProductPrice.tsx)', () => {
    it('formats direct rupee amounts into standard Indian currency strings', () => {
      expect(formatINRAmount(49)).toBe('₹49')
      expect(formatINRAmount(1499)).toBe('₹1,499')
      expect(formatINRAmount(25000)).toBe('₹25,000')
      expect(formatINRAmount(125000)).toBe('₹1,25,000')
    })
  })
})
