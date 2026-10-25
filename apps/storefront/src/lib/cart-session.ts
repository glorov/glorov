import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE } from './constants'

/**
 * Client-safe helper to retrieve the cart ID from document.cookie
 */
export function getClientCartId(): string | null {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${CART_COOKIE_NAME})=([^;]*)`))
  return match ? decodeURIComponent(match[3]) : null
}

/**
 * Client-safe helper to set the cart ID in cookies
 */
export function setClientCartId(cartId: string): void {
  if (typeof document === 'undefined') {
    return
  }
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(cartId)}; path=/; max-age=${CART_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

/**
 * Client-safe helper to clear the cart ID cookie
 */
export function clearClientCartId(): void {
  if (typeof document === 'undefined') {
    return
  }
  document.cookie = `${CART_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}
