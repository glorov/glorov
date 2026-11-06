import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  middleware,
  validateAuthToken,
  decodeJwtPayload,
  config,
} from '../../src/middleware'
import { AUTH_COOKIE_NAME, CART_COOKIE_NAME } from '../../src/lib/constants'

/**
 * Creates a helper JWT string with base64url encoded header and payload.
 */
function createTestJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = 'test_mock_sig'
  return `${header}.${body}.${signature}`
}

/**
 * Helper to construct a NextRequest with arbitrary cookies.
 */
function createRequest(path: string, cookies: Record<string, string> = {}): NextRequest {
  const url = new URL(path, 'http://localhost:3000')
  const req = new NextRequest(url)
  for (const [key, val] of Object.entries(cookies)) {
    req.cookies.set(key, val)
  }
  return req
}

describe('Next.js Storefront Middleware (src/middleware.ts)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('JWT and Token Helper Utilities', () => {
    it('decodeJwtPayload decodes standard 3-part base64url JWT payload', () => {
      const payload = { sub: 'cust_123', email: 'aarav@glorov.in', exp: 2000000000 }
      const token = createTestJwt(payload)
      const decoded = decodeJwtPayload(token)
      expect(decoded).toEqual(payload)
    })

    it('decodeJwtPayload returns null for non-JWT strings', () => {
      expect(decodeJwtPayload('invalid-token')).toBeNull()
      expect(decodeJwtPayload('part1.part2')).toBeNull()
      expect(decodeJwtPayload('')).toBeNull()
    })

    it('validateAuthToken validates unexpired JWT tokens', () => {
      const futureEpoch = Math.floor(Date.now() / 1000) + 3600 // +1 hour
      const validToken = createTestJwt({ sub: 'cust_123', exp: futureEpoch })
      const result = validateAuthToken(validToken)
      expect(result.isValid).toBe(true)
      expect(result.isExpired).toBe(false)
    })

    it('validateAuthToken detects expired JWT tokens', () => {
      const pastEpoch = Math.floor(Date.now() / 1000) - 3600 // -1 hour
      const expiredToken = createTestJwt({ sub: 'cust_123', exp: pastEpoch })
      const result = validateAuthToken(expiredToken)
      expect(result.isValid).toBe(false)
      expect(result.isExpired).toBe(true)
      expect(result.error).toContain('expired')
    })

    it('validateAuthToken supports valid GLOROV demo session tokens', () => {
      const freshDemoToken = `jwt_demo_session_${Date.now()}`
      const result = validateAuthToken(freshDemoToken)
      expect(result.isValid).toBe(true)
      expect(result.isExpired).toBe(false)
    })

    it('validateAuthToken detects expired GLOROV demo session tokens (> 7 days)', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
      const oldDemoToken = `jwt_demo_session_${eightDaysAgo}`
      const result = validateAuthToken(oldDemoToken)
      expect(result.isValid).toBe(false)
      expect(result.isExpired).toBe(true)
    })

    it('validateAuthToken flags malformed tokens as invalid/expired', () => {
      const result = validateAuthToken('completely-random-gibberish')
      expect(result.isValid).toBe(false)
      expect(result.isExpired).toBe(true)
    })

    it('validateAuthToken returns false/false for empty or missing tokens', () => {
      expect(validateAuthToken(null)).toEqual({ isValid: false, isExpired: false })
      expect(validateAuthToken(undefined)).toEqual({ isValid: false, isExpired: false })
      expect(validateAuthToken('')).toEqual({ isValid: false, isExpired: false })
    })
  })

  describe('GLOROV-AUTH-003: /account/* Server-Side Route Protection', () => {
    it('redirects unauthenticated visitor from /account to /auth/login?redirect=/account', () => {
      const req = createRequest('/account')
      const res = middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')
      expect(location).toBeDefined()
      const redirectUrl = new URL(location!)
      expect(redirectUrl.pathname).toBe('/auth/login')
      expect(redirectUrl.searchParams.get('redirect')).toBe('/account')
      expect(redirectUrl.searchParams.get('reason')).toBeNull()
    })

    it('redirects unauthenticated visitor from /account/orders to /auth/login with original path and params', () => {
      const req = createRequest('/account/orders?status=active&sort=desc')
      const res = middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')
      const redirectUrl = new URL(location!)
      expect(redirectUrl.pathname).toBe('/auth/login')
      expect(redirectUrl.searchParams.get('redirect')).toBe('/account/orders?status=active&sort=desc')
    })

    it('redirects expired JWT visitor to /auth/login with session expired reason and clears cookie', () => {
      const pastEpoch = Math.floor(Date.now() / 1000) - 7200
      const expiredToken = createTestJwt({ sub: 'cust_expired', exp: pastEpoch })

      const req = createRequest('/account/profile', {
        [AUTH_COOKIE_NAME]: expiredToken,
      })
      const res = middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')
      const redirectUrl = new URL(location!)
      expect(redirectUrl.pathname).toBe('/auth/login')
      expect(redirectUrl.searchParams.get('redirect')).toBe('/account/profile')
      expect(redirectUrl.searchParams.get('reason')).toBe('Your session has expired. Please log in again.')

      // Stale cookie must be cleared on redirect
      const setCookie = res.headers.get('set-cookie')
      expect(setCookie).toBeDefined()
      expect(setCookie).toContain(`${AUTH_COOKIE_NAME}=`)
    })

    it('allows access to /account/addresses when a valid JWT token cookie is present', () => {
      const futureEpoch = Math.floor(Date.now() / 1000) + 3600
      const validToken = createTestJwt({ sub: 'cust_valid', exp: futureEpoch })

      const req = createRequest('/account/addresses', {
        [AUTH_COOKIE_NAME]: validToken,
      })
      const res = middleware(req)

      // Allowed routes return Next response without 307 redirect
      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })

    it('allows access to /account/orders when a valid demo session token cookie is present', () => {
      const demoToken = `jwt_demo_session_${Date.now()}`

      const req = createRequest('/account/orders', {
        [AUTH_COOKIE_NAME]: demoToken,
      })
      const res = middleware(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('GLOROV-DEV-001: /dev/* Route Gating in Production', () => {
    it('blocks /dev/design-system and redirects to / in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const req = createRequest('/dev/design-system')
      const res = middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')
      const redirectUrl = new URL(location!)
      expect(redirectUrl.pathname).toBe('/')
    })

    it('blocks /dev/shared-components and redirects to / in production', () => {
      vi.stubEnv('NODE_ENV', 'production')

      const req = createRequest('/dev/shared-components')
      const res = middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')
      const redirectUrl = new URL(location!)
      expect(redirectUrl.pathname).toBe('/')
    })

    it('allows /dev/design-system in development mode', () => {
      vi.stubEnv('NODE_ENV', 'development')

      const req = createRequest('/dev/design-system')
      const res = middleware(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('Cart Guard: /checkout Route Protection', () => {
    it('redirects to /cart if visiting /checkout without a cart cookie', () => {
      const req = createRequest('/checkout')
      const res = middleware(req)

      expect(res.status).toBe(307)
      const location = res.headers.get('location')
      const redirectUrl = new URL(location!)
      expect(redirectUrl.pathname).toBe('/cart')
    })

    it('allows access to /checkout when cart_id cookie exists', () => {
      const req = createRequest('/checkout', {
        [CART_COOKIE_NAME]: 'cart_test_12345',
      })
      const res = middleware(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })

    it('allows access to /checkout when fallback glorov_cart_id cookie exists', () => {
      const req = createRequest('/checkout', {
        glorov_cart_id: 'cart_test_67890',
      })
      const res = middleware(req)

      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })
  })

  describe('Public Routes, Static Assets, and API Routes Pass-Through', () => {
    it('does not block public homepage', () => {
      const req = createRequest('/')
      const res = middleware(req)
      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })

    it('does not block public product pages', () => {
      const req = createRequest('/products/green-chilli-seeds')
      const res = middleware(req)
      expect(res.status).toBe(200)
    })

    it('does not block public categories or search', () => {
      const reqCat = createRequest('/categories/seeds')
      expect(middleware(reqCat).status).toBe(200)

      const reqSearch = createRequest('/search?q=hibiscus')
      expect(middleware(reqSearch).status).toBe(200)
    })

    it('does not block auth login and signup pages', () => {
      const reqLogin = createRequest('/auth/login')
      expect(middleware(reqLogin).status).toBe(200)

      const reqSignup = createRequest('/auth/signup')
      expect(middleware(reqSignup).status).toBe(200)
    })

    it('does not block API routes or Next.js static assets', () => {
      const reqApi = createRequest('/api/health')
      expect(middleware(reqApi).status).toBe(200)

      const reqStatic = createRequest('/_next/static/chunks/main.js')
      expect(middleware(reqStatic).status).toBe(200)
    })

    it('config matcher covers relevant paths', () => {
      expect(config.matcher).toContain('/account/:path*')
      expect(config.matcher).toContain('/account')
      expect(config.matcher).toContain('/dev/:path*')
      expect(config.matcher).toContain('/dev')
      expect(config.matcher).toContain('/checkout/:path*')
      expect(config.matcher).toContain('/checkout')
    })
  })
})
