import * as Sentry from '@sentry/nextjs'
import { redactSensitiveData } from '@glorov/types'

export interface ErrorReportContext {
  digest?: string
  boundary?: string
  page?: string
  action?: string
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  user?: {
    id?: string
    email?: string
    username?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

let isInitialized = false

/**
 * Initialize Sentry client/server error reporting if DSN is available.
 * Safe to call idempotently.
 */
export function initErrorReporting(): boolean {
  if (isInitialized) {
    return true
  }

  const dsn =
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    process.env.SENTRY_DSN ||
    (typeof window !== 'undefined'
      ? (window as unknown as { __GLOROV_SENTRY_DSN__?: string }).__GLOROV_SENTRY_DSN__
      : undefined)

  if (!dsn) {
    return false
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Redact any customer PII before sending payload to Sentry
        if (event.extra) {
          event.extra = redactSensitiveData(event.extra) as Record<string, unknown>
        }
        if (event.user) {
          event.user = redactSensitiveData(event.user) as Record<string, unknown>
        }
        return event
      },
    })
    isInitialized = true
    return true
  } catch (err) {
    // Non-blocking initialization failure
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to initialize storefront Sentry error reporter:', err)
    }
    return false
  }
}

/**
 * Reports an exception to Sentry and/or structured error collector.
 * Non-blocking (fire-and-forget), PII-redacted, and captures error.digest for Next.js correlation.
 */
export function reportError(
  error: unknown,
  context?: ErrorReportContext
): void {
  if (!error) return

  // Fire-and-forget asynchronously without interrupting user flow or rendering
  Promise.resolve().then(() => {
    try {
      initErrorReporting()

      // Redact all context metadata with GLOROV PII masking
      const sanitizedContext = context
        ? (redactSensitiveData(context) as Record<string, unknown>)
        : {}

      const digest =
        context?.digest ||
        (error as { digest?: string })?.digest ||
        undefined

      const boundary = context?.boundary || 'unspecified'
      const page =
        context?.page ||
        (typeof window !== 'undefined' ? window.location.pathname : undefined)
      const action = context?.action

      const hasDsn = Boolean(
        process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
      )

      if (hasDsn) {
        Sentry.withScope((scope) => {
          scope.setTag('boundary', boundary)
          if (digest) {
            scope.setTag('digest', digest)
            scope.setExtra('digest', digest)
          }
          if (page) {
            scope.setTag('page', page)
          }
          if (action) {
            scope.setTag('action', action)
          }

          if (context?.tags) {
            for (const [k, v] of Object.entries(context.tags)) {
              scope.setTag(k, v)
            }
          }

          if (context?.user) {
            scope.setUser(redactSensitiveData(context.user) as Record<string, unknown>)
          }

          scope.setExtra('context', sanitizedContext)

          if (error instanceof Error) {
            Sentry.captureException(error)
          } else {
            Sentry.captureMessage(
              typeof error === 'string' ? error : JSON.stringify(error),
              'error'
            )
          }
        })
      } else {
        // Fallback when Sentry DSN is not configured (e.g. local dev / tests)
        const timestamp = new Date().toISOString()
        const errorMsg = error instanceof Error ? error.message : String(error)
        const safeSummary = {
          timestamp,
          boundary,
          digest: digest || 'none',
          page: page || 'server',
          action: action || 'none',
          error: errorMsg,
          context: sanitizedContext,
        }

        if (process.env.NODE_ENV !== 'test') {
          console.error(
            `[GLOROV_ERROR_REPORTER] [${boundary}] [DIGEST:${digest || 'none'}] ${errorMsg}`,
            safeSummary
          )
        }
      }
    } catch (reportErr) {
      if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
        console.warn('Storefront error reporter dispatch failed:', reportErr)
      }
    }
  }).catch(() => {})
}

/**
 * Alias for reportError matching standard Sentry API convention.
 */
export const captureException = reportError

/**
 * Reports a non-exception structured message (warning, error, or operational event).
 */
export function reportMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorReportContext
): void {
  Promise.resolve().then(() => {
    try {
      initErrorReporting()

      const sanitizedContext = context
        ? (redactSensitiveData(context) as Record<string, unknown>)
        : {}

      const hasDsn = Boolean(
        process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
      )

      if (hasDsn) {
        Sentry.withScope((scope) => {
          scope.setLevel(level)
          if (context?.page) scope.setTag('page', context.page)
          if (context?.action) scope.setTag('action', context.action)
          if (context?.digest) scope.setTag('digest', context.digest)
          scope.setExtra('context', sanitizedContext)

          Sentry.captureMessage(message, level)
        })
      }
    } catch {}
  }).catch(() => {})
}
