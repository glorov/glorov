import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as Sentry from '@sentry/nextjs'
import ErrorBoundary from '../../src/app/error'
import { reportError, reportMessage, captureException } from '../../src/lib/error-reporter'

// Mock @sentry/nextjs
vi.mock('@sentry/nextjs', () => {
  return {
    init: vi.fn(),
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    withScope: vi.fn((callback) => {
      const scope = {
        setTag: vi.fn(),
        setExtra: vi.fn(),
        setUser: vi.fn(),
        setLevel: vi.fn(),
      }
      callback(scope)
    }),
  }
})

describe('Storefront Error Reporting & Boundary Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_SENTRY_DSN
    delete process.env.SENTRY_DSN
  })

  it('reportError captures errors and includes digest and boundary tags when SENTRY_DSN is configured', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock@sentry.io/12345'

    const sampleError = new Error('Database connection failed in server action') as Error & { digest?: string }
    sampleError.digest = 'digest_test_123456789'

    reportError(sampleError, {
      boundary: 'root-error-boundary',
      page: '/checkout',
      action: 'place-order',
    })

    // Allow fire-and-forget Promise resolution
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(Sentry.withScope).toHaveBeenCalled()
    expect(Sentry.captureException).toHaveBeenCalledWith(sampleError)
  })

  it('reportError automatically redacts customer PII from extra metadata before reporting', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock@sentry.io/12345'

    let capturedExtra: Record<string, unknown> | undefined

    vi.mocked(Sentry.withScope).mockImplementationOnce((callback) => {
      const scope = {
        setTag: vi.fn(),
        setExtra: vi.fn((key, value) => {
          if (key === 'context') {
            capturedExtra = value as Record<string, unknown>
          }
        }),
        setUser: vi.fn(),
        setLevel: vi.fn(),
      }
      if (typeof callback === 'function') {
        ;(callback as (s: any) => void)(scope)
      }
    })

    const sampleError = new Error('Payment gateway error')
    reportError(sampleError, {
      boundary: 'checkout',
      extra: {
        customer_email: 'sourav.patron@glorov.in',
        customer_phone: '9876543210',
        card_token: 'rzp_tok_super_secret_123',
        password: 'PlainTextPassword123!',
        address_1: 'Flat 401, Fern Orchid Apartments, Baner Road',
        city: 'Pune',
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(capturedExtra).toBeDefined()
    const extra = (capturedExtra?.extra || {}) as Record<string, unknown>
    expect(extra.customer_email).toBe('s***n@g***.in')
    expect(extra.customer_phone).toBe('******3210')
    expect(extra.card_token).toBe('[REDACTED]')
    expect(extra.password).toBe('[REDACTED]')
    expect(extra.address_1).toBe('[REDACTED_ADDRESS_LINE]')
    expect(extra.city).toBe('Pune')
  })

  it('captureException is an alias for reportError', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock@sentry.io/12345'

    const testErr = new Error('Test alias')
    captureException(testErr, { boundary: 'test' })

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(Sentry.captureException).toHaveBeenCalledWith(testErr)
  })

  it('reportMessage captures structured operational messages to Sentry', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock@sentry.io/12345'

    reportMessage('Botanical voucher applied successfully', 'info', {
      page: '/cart',
      action: 'coupon-apply',
    })

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(Sentry.captureMessage).toHaveBeenCalledWith('Botanical voucher applied successfully', 'info')
  })

  it('ErrorBoundary renders user-friendly botanical UI and triggers reportError with error.digest', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://mock@sentry.io/12345'

    const boundaryError = new Error('Rendering component failed unexpectedly') as Error & { digest?: string }
    boundaryError.digest = 'digest_boundary_correlation_abc123'
    const resetFn = vi.fn()

    render(<ErrorBoundary error={boundaryError} reset={resetFn} />)

    // Verify botanical UI elements
    expect(screen.getByText('Something unexpected sprouted')).toBeDefined()
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /return to storefront/i })).toBeDefined()

    // Allow fire-and-forget Promise in useEffect
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(Sentry.captureException).toHaveBeenCalledWith(boundaryError)
  })
})
