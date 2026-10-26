import { describe, it, expect } from 'vitest'
import { validateStorefrontEnv } from '../env'

describe('Storefront Production Environment Validation', () => {
  it('allows valid development environment with default fallbacks', () => {
    const result = validateStorefrontEnv({
      NODE_ENV: 'development',
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.config.backendUrl).toBe('http://localhost:9000')
  })

  it('rejects public environment variables containing private secrets', () => {
    const result = validateStorefrontEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_RAZORPAY_KEY_SECRET: 'secret_leak_123',
      NEXT_PUBLIC_ADMIN_JWT_TOKEN: 'jwt_leak_456',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
    expect(result.errors[0]).toContain('Security Violation')
  })

  it('flags non-HTTPS backend URL in production', () => {
    const result = validateStorefrontEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'http://api.glorov.in',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_prod_1234567890abcdef',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('must use HTTPS'))).toBe(true)
  })

  it('flags placeholder publishable key in production', () => {
    const result = validateStorefrontEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://api.glorov.in',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_test_replace_with_actual_key',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('must not be a placeholder'))).toBe(true)
  })

  it('passes cleanly in production with valid HTTPS config and real key', () => {
    const result = validateStorefrontEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_MEDUSA_BACKEND_URL: 'https://api.glorov.in',
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: 'pk_prod_1234567890abcdef',
      NEXT_PUBLIC_BASE_URL: 'https://glorov.in',
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
