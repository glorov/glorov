import * as Sentry from '@sentry/node'
import {
  redactSensitiveData,
  SafeErrorClassification,
} from '@glorov/types'
import type { DeadLetterRecord } from './async-retry'

export interface BackendErrorContext {
  correlationId?: string
  operation?: string
  statusCode?: number
  errorCode?: SafeErrorClassification | string
  extraMetadata?: Record<string, unknown>
  method?: string
  url?: string
  [key: string]: unknown
}

export type ErrorReportingListener = (event: {
  type: 'backend_error' | 'dead_letter'
  error: unknown
  context?: BackendErrorContext
  deadLetterRecord?: Record<string, unknown>
}) => void

let testListener: ErrorReportingListener | null = null

export function setErrorReportingListenerForTesting(listener: ErrorReportingListener | null): void {
  testListener = listener
}

let isInitialized = false

/**
 * Initialize Sentry error reporting for the Medusa backend.
 * Reads SENTRY_DSN from environment variables.
 * Safe to call multiple times (idempotent).
 */
export function initBackendErrorReporting(): boolean {
  if (isInitialized) {
    return true
  }

  const dsn = process.env.SENTRY_DSN
  if (!dsn) {
    return false
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '0.1.0',
      sampleRate: 1.0,
      beforeSend(event) {
        // Redact any PII before transmitting to Sentry
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
  } catch (initErr) {
    // Non-blocking fallback if initialization fails
    console.error('Failed to initialize Sentry backend error reporting:', initErr)
    return false
  }
}

/**
 * Report a 5xx backend server error or unhandled exception to Sentry / external reporter.
 * Guaranteed non-blocking (fire and forget).
 * All context metadata and PII are redacted before reporting.
 */
export function reportBackendError(
  error: unknown,
  context?: BackendErrorContext
): void {
  if (!error) return

  // Fire-and-forget: execute asynchronously without blocking request pipeline
  Promise.resolve().then(() => {
    try {
      // Ensure reporter is initialized if DSN is set
      initBackendErrorReporting()

      // Redact context to ensure no PII leaks to external observability
      const sanitizedContext = context
        ? (redactSensitiveData(context) as Record<string, unknown>)
        : {}

      if (testListener) {
        testListener({ type: 'backend_error', error, context: sanitizedContext as BackendErrorContext })
      }

      const correlationId = (context?.correlationId as string) || undefined
      const errorCode = (context?.errorCode as string) || undefined
      const statusCode = context?.statusCode ? String(context.statusCode) : undefined
      const operation = context?.operation || 'backend.operation'

      if (process.env.SENTRY_DSN) {
        Sentry.withScope((scope) => {
          if (correlationId) {
            scope.setTag('correlation_id', correlationId)
          }
          if (errorCode) {
            scope.setTag('error_code', errorCode)
          }
          if (statusCode) {
            scope.setTag('status_code', statusCode)
          }
          scope.setTag('operation', operation)
          scope.setExtra('context', sanitizedContext)

          if (error instanceof Error) {
            Sentry.captureException(error)
          } else {
            Sentry.captureMessage(typeof error === 'string' ? error : JSON.stringify(error), 'error')
          }
        })
      }
    } catch (reportErr) {
      // Non-blocking: never crash backend error handling if reporting fails
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Error reporting dispatch failed:', reportErr)
      }
    }
  }).catch(() => {
    // Silently suppress unhandled promise rejection in fire-and-forget
  })
}

/**
 * Report an async job dead-letter failure to Sentry.
 * Triggered when bounded retries are exhausted or a non-retryable error occurs.
 */
export function reportDeadLetter(
  record: DeadLetterRecord,
  originalError?: unknown
): void {
  Promise.resolve().then(() => {
    try {
      initBackendErrorReporting()

      const sanitizedRecord = redactSensitiveData(record) as Record<string, unknown>
      const err = originalError instanceof Error
        ? originalError
        : new Error(record.error_message || 'Async job dead-letter failure')

      if (testListener) {
        testListener({ type: 'dead_letter', error: err, deadLetterRecord: sanitizedRecord })
      }

      if (process.env.SENTRY_DSN) {
        Sentry.withScope((scope) => {
          scope.setLevel('error')
          scope.setTag('dead_letter', 'true')
          scope.setTag('subscriber_name', record.subscriber_name)
          scope.setTag('event_name', record.event_name)
          if (record.resource_type) {
            scope.setTag('resource_type', record.resource_type)
          }
          if (record.correlation_id) {
            scope.setTag('correlation_id', record.correlation_id)
          }
          scope.setTag('error_code', record.error_code)
          scope.setExtra('dead_letter_record', sanitizedRecord)

          Sentry.captureException(err)
        })
      }
    } catch (reportErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Dead-letter error reporting dispatch failed:', reportErr)
      }
    }
  }).catch(() => {})
}
