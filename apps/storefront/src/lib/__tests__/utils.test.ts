import { describe, it, expect } from 'vitest'
import { cn, formatINR } from '../utils'
import { medusaClient, MEDUSA_BACKEND_URL } from '../medusa'

describe('Storefront Utils', () => {
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
  })

  describe('Medusa Client Configuration', () => {
    it('initializes with configured backend URL', () => {
      expect(MEDUSA_BACKEND_URL).toBeDefined()
      expect(medusaClient).toBeDefined()
    })
  })
})
