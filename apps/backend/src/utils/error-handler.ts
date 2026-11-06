import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import {
  SafeErrorClassification,
  classifyError,
  createSanitizedErrorPayload,
  extractOrGenerateCorrelationId,
} from '@glorov/types'
import { getStructuredLogger } from './structured-logger'
import { metricsCollector } from './metrics-collector'
import { reportBackendError } from './error-reporter'

export interface ErrorResponseOptions {
  req?: MedusaRequest
  operation?: string
  statusCode?: number
  userMessage?: string
  errorCode?: SafeErrorClassification
  extraMetadata?: Record<string, unknown>
}

/**
 * Standardized, safe error response handler.
 * Guarantees that sensitive database errors, stack traces, and internal infrastructure
 * details are logged for diagnostics, while delivering safe, actionable responses to clients.
 */
export function sendSanitizedError(
  res: MedusaResponse,
  error: unknown,
  optionsOrStatus: ErrorResponseOptions | number = {},
  extraContext?: Record<string, unknown>
): void {
  const options: ErrorResponseOptions =
    typeof optionsOrStatus === 'number'
      ? { statusCode: optionsOrStatus, extraMetadata: extraContext }
      : optionsOrStatus || {}

  const req = options.req
  const correlationId =
    (req as any)?.correlationId ||
    extractOrGenerateCorrelationId(req?.headers?.['x-correlation-id'] || req?.headers?.['x-request-id'])

  res.setHeader('x-correlation-id', correlationId)

  const classified = classifyError(error)
  const operation =
    options.operation ||
    (options.extraMetadata?.operation as string) ||
    (req ? `${req.method} ${req.url}` : 'operation.unknown')

  // Resolve appropriate HTTP status code
  let statusCode = options.statusCode
  if (!statusCode) {
    if (error instanceof MedusaError) {
      switch (error.type) {
        case MedusaError.Types.INVALID_DATA:
          statusCode = 400
          break
        case MedusaError.Types.NOT_FOUND:
          statusCode = 404
          break
        case MedusaError.Types.NOT_ALLOWED:
          statusCode = 400
          break
        case MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR:
          statusCode = 400
          break
        case MedusaError.Types.CONFLICT:
          statusCode = 409
          break
        case MedusaError.Types.UNEXPECTED_STATE:
        default:
          statusCode = 500
          break
      }
    } else if (typeof (error as any)?.statusCode === 'number') {
      statusCode = (error as any).statusCode
    } else if (typeof (error as any)?.status === 'number') {
      statusCode = (error as any).status
    } else {
      statusCode = classified.statusCode
    }
  }

  const finalStatusCode: number = statusCode ?? classified.statusCode ?? 500

  // Determine safe user message
  let userMessage = options.userMessage
  if (!userMessage) {
    if (finalStatusCode < 500 && error instanceof Error && error.message.length < 200) {
      userMessage = error.message
    } else {
      userMessage = classified.clientMessage
    }
  }

  // Record operational metric
  metricsCollector.recordHttpError(finalStatusCode, classified.code)
  if (classified.code.startsWith('PAYMENT_')) {
    metricsCollector.recordPaymentFailure(classified.code)
  }

  // Log internal diagnostic error with structured attributes
  const logger = getStructuredLogger(req?.scope, correlationId)
  logger.error(operation, `Request failed with ${finalStatusCode}: ${userMessage}`, error, {
    correlationId,
    operation,
    statusCode: finalStatusCode,
    errorCode: options.errorCode || classified.code,
    ...(options.extraMetadata || {}),
  })

  // Report internal 5xx errors to Sentry / external error reporter (4xx client errors are omitted)
  if (finalStatusCode >= 500) {
    reportBackendError(error, {
      correlationId,
      operation,
      statusCode: finalStatusCode,
      errorCode: options.errorCode || classified.code,
      ...(options.extraMetadata || {}),
      extraMetadata: options.extraMetadata,
      method: req?.method,
      url: req?.url,
    })
  }

  const payload = createSanitizedErrorPayload(error, correlationId, userMessage)
  if (options.errorCode) {
    payload.code = options.errorCode
  }

  res.status(finalStatusCode).json(payload)
}
