import { describe, it, expect } from 'vitest'
import { getSafeRedirectUrl } from '../security'

describe('Storefront Security Utilities - Open Redirect Protection', () => {
  it('allows safe relative paths', () => {
    expect(getSafeRedirectUrl('/account')).toBe('/account')
    expect(getSafeRedirectUrl('/checkout')).toBe('/checkout')
    expect(getSafeRedirectUrl('/store?category=seeds')).toBe('/store?category=seeds')
    expect(getSafeRedirectUrl('/account/orders/order_12345')).toBe('/account/orders/order_12345')
  })

  it('falls back to defaultUrl for null, undefined, or empty values', () => {
    expect(getSafeRedirectUrl(null)).toBe('/account')
    expect(getSafeRedirectUrl(undefined)).toBe('/account')
    expect(getSafeRedirectUrl('')).toBe('/account')
    expect(getSafeRedirectUrl('   ', '/custom-fallback')).toBe('/custom-fallback')
  })

  it('rejects external URLs (http / https)', () => {
    expect(getSafeRedirectUrl('https://evil.com')).toBe('/account')
    expect(getSafeRedirectUrl('http://attacker.com/steal-creds')).toBe('/account')
    expect(getSafeRedirectUrl('https://glorov.in.attacker.com')).toBe('/account')
  })

  it('rejects protocol-relative URLs (//)', () => {
    expect(getSafeRedirectUrl('//evil.com')).toBe('/account')
    expect(getSafeRedirectUrl('//evil.com/phishing')).toBe('/account')
    expect(getSafeRedirectUrl('///evil.com')).toBe('/account')
  })

  it('rejects backslash evasions (/\\ and \\)', () => {
    expect(getSafeRedirectUrl('/\\evil.com')).toBe('/account')
    expect(getSafeRedirectUrl('/\\/evil.com')).toBe('/account')
    expect(getSafeRedirectUrl('\\evil.com')).toBe('/account')
  })

  it('rejects dangerous URI schemes (javascript:, data:)', () => {
    expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('/account')
    expect(getSafeRedirectUrl('data:text/html;base64,...')).toBe('/account')
    expect(getSafeRedirectUrl('vbscript:msgbox(1)')).toBe('/account')
  })

  it('rejects CRLF and whitespace control characters', () => {
    expect(getSafeRedirectUrl('/account\r\nSet-Cookie: evil=1')).toBe('/account')
    expect(getSafeRedirectUrl('/account\thttps://evil.com')).toBe('/account')
  })
})
