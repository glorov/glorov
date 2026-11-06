import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import nextConfig from '../../next.config'

describe('Storefront Security Configuration Unit Tests', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('GLOROV-SEC-002: Medusa Publishable API Key Env Resolution', () => {
    it('returns the configured publishable key when env var is present', async () => {
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = 'pk_live_custom_storefront_key_9988'
      const { MEDUSA_PUBLISHABLE_KEY } = await import('../../src/lib/constants')
      expect(MEDUSA_PUBLISHABLE_KEY).toBe('pk_live_custom_storefront_key_9988')
    })

    it('throws a clear error when NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing', async () => {
      delete process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      await expect(import('../../src/lib/constants')).rejects.toThrow(
        /Missing required environment variable: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY/
      )
    })
  })

  describe('GLOROV-SEC-003: Next.js Security Headers & Technology Masking', () => {
    it('disables poweredByHeader to prevent technology fingerprinting', () => {
      expect(nextConfig.poweredByHeader).toBe(false)
    })

    it('defines all 6 defense-in-depth security headers on all routes', async () => {
      expect(typeof nextConfig.headers).toBe('function')
      const headersConfig = await nextConfig.headers!()
      expect(headersConfig).toHaveLength(1)

      const globalRoute = headersConfig[0]
      expect(globalRoute.source).toBe('/:path*')

      const headerMap = new Map<string, string>()
      for (const h of globalRoute.headers) {
        headerMap.set(h.key, h.value)
      }

      // 1. Strict-Transport-Security (HSTS)
      expect(headerMap.has('Strict-Transport-Security')).toBe(true)
      expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=63072000')
      expect(headerMap.get('Strict-Transport-Security')).toContain('includeSubDomains')
      expect(headerMap.get('Strict-Transport-Security')).toContain('preload')

      // 2. X-Content-Type-Options
      expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff')

      // 3. X-Frame-Options
      expect(headerMap.get('X-Frame-Options')).toBe('SAMEORIGIN')

      // 4. Referrer-Policy
      expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')

      // 5. Permissions-Policy
      expect(headerMap.has('Permissions-Policy')).toBe(true)
      expect(headerMap.get('Permissions-Policy')).toContain('camera=()')
      expect(headerMap.get('Permissions-Policy')).toContain('microphone=()')

      // 6. Content-Security-Policy (CSP)
      expect(headerMap.has('Content-Security-Policy')).toBe(true)
      const csp = headerMap.get('Content-Security-Policy')!
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain('https://checkout.razorpay.com')
      expect(csp).toContain('https://res.cloudinary.com')
      expect(csp).toContain("object-src 'none'")
    })
  })

  describe('GLOROV-PROXY-001: Restricted /medusa Storefront Proxy', () => {
    it('restricts /medusa proxying exclusively to public store endpoints', async () => {
      expect(typeof nextConfig.rewrites).toBe('function')
      const rewrites = (await nextConfig.rewrites!()) as any[]
      expect(rewrites).toBeInstanceOf(Array)

      // Must have rewrite for /medusa/store/:path*
      const storeRewrite = rewrites.find((r) => r.source === '/medusa/store/:path*')
      expect(storeRewrite).toBeDefined()
      expect(storeRewrite.destination).toContain('/store/:path*')

      // Unrestricted /medusa/:path* must NOT exist
      const unrestrictedRewrite = rewrites.find((r) => r.source === '/medusa/:path*')
      expect(unrestrictedRewrite).toBeUndefined()

      // Admin paths must NOT have a rewrite rule
      const adminRewrite = rewrites.find((r) => r.source.includes('admin'))
      expect(adminRewrite).toBeUndefined()
    })
  })
})
