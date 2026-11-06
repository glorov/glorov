import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, CART_COOKIE_NAME } from './lib/constants'

/**
 * GLOROV Storefront Next.js Server-Side Middleware
 *
 * Implements server-side route protection and request gating:
 * - GLOROV-AUTH-003: Guard /account/* routes against unauthenticated or expired sessions.
 * - GLOROV-ROUTE-002: Establish authoritative Next.js middleware guard layer.
 * - GLOROV-DEV-001: Block access to /dev/* routes in production builds.
 * - Optional guard on /checkout requiring an active cart session.
 *
 * NOTE: Middleware executes in the Next.js Edge Runtime. It does NOT make Medusa backend
 * network calls to avoid latency; it validates cookie presence and inspects JWT expiry.
 */

export interface TokenValidationResult {
  isValid: boolean
  isExpired: boolean
  error?: string
}

/**
 * Safely decodes base64url-encoded JWT payload without cryptographic signature verification.
 * Works universally across Edge runtime (atob) and Node (Buffer).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) {
      base64 += '='
    }

    let jsonStr: string
    if (typeof atob === 'function') {
      jsonStr = atob(base64)
    } else if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(base64, 'base64').toString('utf8')
    } else {
      return null
    }

    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

/**
 * Evaluates whether an auth token is present, structurally valid, and unexpired.
 * Supports both Medusa v2 JWTs and GLOROV demo session tokens.
 */
export function validateAuthToken(token: string | undefined | null): TokenValidationResult {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { isValid: false, isExpired: false }
  }

  const trimmed = token.trim()

  // 1. Support GLOROV demo customer session tokens (jwt_demo_session_<timestamp>)
  if (trimmed.startsWith('jwt_demo_session_')) {
    const tsStr = trimmed.slice('jwt_demo_session_'.length)
    const timestamp = parseInt(tsStr, 10)
    if (isNaN(timestamp) || timestamp <= 0) {
      return { isValid: false, isExpired: true, error: 'Malformed demo token timestamp' }
    }
    // 7 days TTL matching cookie maxAge
    const DEMO_TTL_MS = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - timestamp > DEMO_TTL_MS) {
      return { isValid: false, isExpired: true, error: 'Demo session has expired' }
    }
    return { isValid: true, isExpired: false }
  }

  // 2. Standard JWT payload decode and expiry inspection
  const payload = decodeJwtPayload(trimmed)
  if (!payload) {
    return { isValid: false, isExpired: true, error: 'Malformed token structure' }
  }

  if (typeof payload.exp === 'number') {
    // Normalise millisecond timestamps if encountered
    const expEpochSeconds = payload.exp > 1e11 ? Math.floor(payload.exp / 1000) : payload.exp
    const currentEpochSeconds = Math.floor(Date.now() / 1000)

    if (expEpochSeconds <= currentEpochSeconds) {
      return { isValid: false, isExpired: true, error: 'JWT token has expired' }
    }
  }

  return { isValid: true, isExpired: false }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // 1. Never intercept internal assets, static files, or API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. GLOROV-DEV-001: Block /dev/* routes in production builds
  if (pathname === '/dev' || pathname.startsWith('/dev/')) {
    if (process.env.NODE_ENV === 'production') {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
    return NextResponse.next()
  }

  // 3. GLOROV-AUTH-003: Route protection for /account and /account/* pages
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const { isValid, isExpired } = validateAuthToken(authCookie)
    const originalPath = pathname + search

    // Case 3a: No token provided at all -> redirect to login with original destination
    if (!authCookie || (!isValid && !isExpired)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', originalPath)
      return NextResponse.redirect(loginUrl)
    }

    // Case 3b: Token exists but is expired or malformed -> redirect with expiry notice and clear stale cookie
    if (isExpired || !isValid) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', originalPath)
      loginUrl.searchParams.set('reason', 'Your session has expired. Please log in again.')
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(AUTH_COOKIE_NAME)
      return response
    }

    return NextResponse.next()
  }

  // 4. Cart Guard for /checkout: Optionally require active cart_id cookie
  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
    const cartId =
      request.cookies.get(CART_COOKIE_NAME)?.value ||
      request.cookies.get('glorov_cart_id')?.value

    if (!cartId || cartId.trim() === '') {
      const cartUrl = new URL('/cart', request.url)
      return NextResponse.redirect(cartUrl)
    }

    return NextResponse.next()
  }

  // 5. Allowed public pages (/, /products/*, /categories/*, /search, /auth/*, etc.)
  return NextResponse.next()
}

/**
 * Configure matcher to only execute middleware on relevant route hierarchies,
 * avoiding unnecessary invocations for public pages and static content.
 */
export const config = {
  matcher: [
    '/account/:path*',
    '/account',
    '/dev/:path*',
    '/dev',
    '/checkout/:path*',
    '/checkout',
  ],
}
