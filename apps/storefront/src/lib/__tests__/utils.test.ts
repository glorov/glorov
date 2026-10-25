import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, formatINR } from '../utils'
import { medusaClient, MEDUSA_BACKEND_URL, checkBackendHealth } from '../medusa-client'
import { getClientCartId, setClientCartId, clearClientCartId } from '../cart-session'
import {
  indianPincodeSchema,
  indianPhoneSchema,
  indianAddressSchema,
} from '@glorov/types'

describe('Storefront Utils & Foundations', () => {
  describe('cn (Tailwind class merging)', () => {
    it('merges class names cleanly', () => {
      expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500')
    })

    it('resolves conflicting tailwind classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
    })
  })

  describe('formatINR (Indian Rupee formatting)', () => {
    it('formats amount in paise to full rupees by default', () => {
      const formatted = formatINR(4900) // ₹49
      expect(formatted).toContain('49')
      expect(formatted).toMatch(/₹|INR/)
    })

    it('formats zero correctly', () => {
      const formatted = formatINR(0)
      expect(formatted).toContain('0')
    })

    it('formats amount in full rupees when isPaise is false', () => {
      const formatted = formatINR(249, false)
      expect(formatted).toContain('249')
    })

    it('formats large multi-lakh amounts according to Indian numbering system', () => {
      const formatted = formatINR(10000000, true) // ₹1,00,000
      expect(formatted).toContain('1,00,000')
    })
  })

  describe('Cart Session Cookie Helpers', () => {
    let mockCookie = ''

    beforeEach(() => {
      mockCookie = ''
      vi.stubGlobal('document', {
        get cookie() {
          return mockCookie
        },
        set cookie(val: string) {
          if (val.includes('max-age=0')) {
            mockCookie = ''
          } else {
            mockCookie = val.split(';')[0]
          }
        },
      })
      vi.stubGlobal('window', {
        location: { protocol: 'http:' },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('reads null when no cart cookie is set', () => {
      expect(getClientCartId()).toBeNull()
    })

    it('writes and retrieves cart cookie accurately', () => {
      setClientCartId('cart_test_12345')
      expect(getClientCartId()).toBe('cart_test_12345')
    })

    it('clears cart cookie properly', () => {
      setClientCartId('cart_test_12345')
      clearClientCartId()
      expect(getClientCartId()).toBeNull()
    })
  })

  describe('Medusa Client Configuration & Health Check', () => {
    it('initializes with configured backend URL', () => {
      expect(MEDUSA_BACKEND_URL).toBeDefined()
      expect(medusaClient).toBeDefined()
    })

    it('performs health check query successfully', async () => {
      const health = await checkBackendHealth(2000)
      expect(health).toHaveProperty('healthy')
      expect(health).toHaveProperty('message')
      // If server is online, healthy is true; if not, healthy is false, but method never throws unhandled exception
      expect(typeof health.healthy).toBe('boolean')
    })
  })

  describe('Zod Validation Schemas (@glorov/types)', () => {
    it('validates authentic Indian 6-digit PIN codes and rejects invalid formats', () => {
      expect(indianPincodeSchema.safeParse('411001').success).toBe(true)
      expect(indianPincodeSchema.safeParse('560001').success).toBe(true)
      expect(indianPincodeSchema.safeParse('110001').success).toBe(true)

      // Invalid: starts with 0
      expect(indianPincodeSchema.safeParse('011001').success).toBe(false)
      // Invalid: 5 digits
      expect(indianPincodeSchema.safeParse('41100').success).toBe(false)
      // Invalid: 7 digits
      expect(indianPincodeSchema.safeParse('4110019').success).toBe(false)
      // Invalid: alphanumeric
      expect(indianPincodeSchema.safeParse('PUNE01').success).toBe(false)
    })

    it('validates authentic Indian 10-digit mobile phone numbers', () => {
      expect(indianPhoneSchema.safeParse('9876543210').success).toBe(true)
      expect(indianPhoneSchema.safeParse('8765432109').success).toBe(true)
      expect(indianPhoneSchema.safeParse('7654321098').success).toBe(true)
      expect(indianPhoneSchema.safeParse('6543210987').success).toBe(true)

      // Invalid: starts with 1-5
      expect(indianPhoneSchema.safeParse('1234567890').success).toBe(false)
      // Invalid: 9 digits
      expect(indianPhoneSchema.safeParse('987654321').success).toBe(false)
    })

    it('validates a complete Indian delivery address object', () => {
      const validAddress = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        address_1: 'Plot 42, Green Park Avenue',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411001',
        phone: '9876543210',
        country_code: 'in' as const,
      }
      expect(indianAddressSchema.safeParse(validAddress).success).toBe(true)

      const invalidAddress = {
        ...validAddress,
        postal_code: 'INVALID',
      }
      expect(indianAddressSchema.safeParse(invalidAddress).success).toBe(false)
    })
  })
})
