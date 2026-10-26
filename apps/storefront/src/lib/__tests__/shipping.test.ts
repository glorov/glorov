import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  cleanPincode,
  isValidIndianPincode,
  getStoredPincode,
  setStoredPincode,
  checkPincodeServiceability,
} from '../shipping'

describe('Storefront Shipping Utility Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  describe('cleanPincode()', () => {
    it('1. Strips non-numeric characters and limits to 6 digits', () => {
      expect(cleanPincode('411 001')).toBe('411001')
      expect(cleanPincode('PIN: 411-001')).toBe('411001')
      expect(cleanPincode('5600019999')).toBe('560001')
      expect(cleanPincode('')).toBe('')
      expect(cleanPincode(null as unknown as string)).toBe('')
    })
  })

  describe('isValidIndianPincode()', () => {
    it('2. Accepts valid 6-digit Indian PIN codes', () => {
      expect(isValidIndianPincode('411001')).toBe(true)
      expect(isValidIndianPincode('110001')).toBe(true)
      expect(isValidIndianPincode('560001')).toBe(true)
      expect(isValidIndianPincode('700001')).toBe(true)
      expect(isValidIndianPincode('790001')).toBe(true)
    })

    it('3. Rejects invalid formats (starting with 0, short, long, non-numeric)', () => {
      expect(isValidIndianPincode('012345')).toBe(false)
      expect(isValidIndianPincode('41100')).toBe(false)
      expect(isValidIndianPincode('4110011')).toBe(false)
      expect(isValidIndianPincode('abc123')).toBe(false)
      expect(isValidIndianPincode('')).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('4. Stores and retrieves validated PIN codes', () => {
      expect(getStoredPincode()).toBeNull()

      setStoredPincode('411001')
      expect(getStoredPincode()).toBe('411001')

      // Does not store invalid PIN codes
      setStoredPincode('012345')
      expect(getStoredPincode()).toBe('411001') // unchanged
    })
  })

  describe('checkPincodeServiceability()', () => {
    it('5. Returns immediate rejection without fetch for invalid PIN format', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const result = await checkPincodeServiceability({ pincode: '012345' })

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(result.serviceable).toBe(false)
      expect(result.status).toBe('rejected')
      expect(result.cod_restriction_reason).toBe('invalid_format')
    })

    it('6. Fetches route handler and parses successful serviceability', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          pincode: '411001',
          serviceable: true,
          status: 'confirmed',
          city: 'Pune',
          state: 'Maharashtra',
          prepaid_eligible: true,
          cod_available: true,
          cod_eligible: true,
          estimated_days: 2,
          courier_name: 'Delhivery Air Botanical Express',
          rate_inr: 49,
          rate_source: 'configured_estimate',
        }),
      } as unknown as Response)

      const res = await checkPincodeServiceability({
        pincode: '411001',
        is_perishable: true,
      })

      expect(res.serviceable).toBe(true)
      expect(res.status).toBe('confirmed')
      expect(res.city).toBe('Pune')
      expect(res.cod_eligible).toBe(true)
      expect(res.estimated_days).toBe(2)
      expect(res.rate_inr).toBe(49)
    })

    it('7. Handles 400 rejection from gateway cleanly', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          pincode: '999999',
          serviceable: false,
          status: 'rejected',
          message: 'Delivery is currently unavailable to this PIN code region.',
        }),
      } as unknown as Response)

      const res = await checkPincodeServiceability({ pincode: '999999' })
      expect(res.serviceable).toBe(false)
      expect(res.status).toBe('rejected')
    })

    it('8. Handles 503 / gateway outage and network failure with "undetermined" status', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('Failed to fetch from shipping gateway')
      )

      const res = await checkPincodeServiceability({ pincode: '411001' })
      expect(res.serviceable).toBe(false)
      expect(res.status).toBe('undetermined')
      expect(res.message).toContain('temporarily unreachable')
    })
  })
})
