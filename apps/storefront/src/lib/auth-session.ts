import { cookies } from 'next/headers'
import { CUSTOMER_COOKIE_NAME, CUSTOMER_COOKIE_MAX_AGE } from './constants'

/**
 * Server-side helper to read the customer JWT authentication token from secure cookies.
 */
export async function getCustomerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(CUSTOMER_COOKIE_NAME)
    return cookie?.value || null
  } catch {
    return null
  }
}

/**
 * Server-side helper to store the customer JWT authentication token in a secure, HTTP-only cookie.
 * Ensures credentials never leak into client scripts or browser logs.
 */
export async function setCustomerTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    maxAge: CUSTOMER_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

/**
 * Server-side helper to clear the customer authentication session cookie upon logout or expiration.
 */
export async function clearCustomerTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_COOKIE_NAME)
}
