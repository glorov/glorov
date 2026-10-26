import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { extractOrGenerateCorrelationId } from '@glorov/types'
import { metricsCollector } from '../../utils/metrics-collector'
import { getStructuredLogger } from '../../utils/structured-logger'

declare module '@medusajs/framework/http' {
  interface MedusaRequest {
    correlationId?: string
    startTime?: number
  }
}

/**
 * Global Request Correlation and Operational Telemetry Middleware.
 * 1. Validates and enforces trusted request/correlation IDs on all inbound requests.
 * 2. Echoes correlation ID in response headers for client-side tracing.
 * 3. Measures duration and streams structured telemetry without logging sensitive payloads.
 */
export const requestCorrelationMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
): void => {
  const incomingId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    undefined

  const correlationId = extractOrGenerateCorrelationId(incomingId)
  req.correlationId = correlationId
  req.startTime = Date.now()

  // Echo correlation ID back to the client
  res.setHeader('x-correlation-id', correlationId)

  // Track response completion
  res.on('finish', () => {
    const durationMs = req.startTime ? Date.now() - req.startTime : 0
    metricsCollector.recordRequest(res.statusCode, durationMs)

    // Log structured entry on error statuses or slow requests
    if (res.statusCode >= 400 || durationMs > 1000) {
      const logger = getStructuredLogger(req.scope, correlationId)
      const severity = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
      const operation = `${req.method} ${req.baseUrl || ''}${req.path || ''}`

      logger[severity](
        operation,
        `HTTP ${req.method} ${req.path || ''} responded with ${res.statusCode} (${durationMs}ms)`,
        {
          correlationId,
          operation,
          statusCode: res.statusCode,
          durationMs,
          method: req.method,
          path: req.path,
        }
      )
    }
  })

  return next()
}
