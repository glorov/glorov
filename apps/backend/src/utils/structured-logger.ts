import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import {
  LogLevel,
  SafeErrorClassification,
  StructuredLogEntry,
  classifyError,
  extractOrGenerateCorrelationId,
  redactSensitiveData,
} from '@glorov/types'

export interface LogContext {
  correlationId?: string
  operation?: string
  service?: string
  durationMs?: number
  errorCode?: SafeErrorClassification
  [key: string]: unknown
}

const SERVICE_NAME = 'glorov-backend'

export class StructuredLogger {
  private baseLogger?: any
  private service: string
  private defaultCorrelationId?: string

  constructor(baseLogger?: any, service: string = SERVICE_NAME, correlationId?: string) {
    this.baseLogger = baseLogger
    this.service = service
    this.defaultCorrelationId = correlationId
  }

  public withContext(context: { correlationId?: string; service?: string }): StructuredLogger {
    return new StructuredLogger(
      this.baseLogger,
      context.service || this.service,
      context.correlationId || this.defaultCorrelationId
    )
  }

  private buildEntry(
    severity: LogLevel,
    operation: string,
    message: string,
    context?: LogContext,
    error?: unknown
  ): StructuredLogEntry {
    const correlationId =
      context?.correlationId ||
      this.defaultCorrelationId ||
      extractOrGenerateCorrelationId()

    let errorCode = context?.errorCode
    if (error && !errorCode) {
      errorCode = classifyError(error).code
    }

    const sanitizedContext = context
      ? (redactSensitiveData(context) as Record<string, unknown>)
      : undefined

    const durationMs =
      typeof context?.durationMs === 'number'
        ? context.durationMs
        : typeof context?.duration_ms === 'number'
        ? (context.duration_ms as number)
        : undefined

    return {
      timestamp: new Date().toISOString(),
      severity,
      service: context?.service || this.service,
      environment: process.env.NODE_ENV || 'development',
      correlation_id: correlationId,
      operation,
      duration_ms: durationMs,
      error_code: errorCode,
      message,
      metadata: sanitizedContext,
    }
  }

  private emit(entry: StructuredLogEntry, rawMessage: string, rawMeta?: Record<string, unknown>) {
    const isProduction = process.env.NODE_ENV === 'production'
    const isJsonFormat = process.env.LOG_FORMAT === 'json' || isProduction

    // When structured JSON is requested (or in production), log serializable JSON
    if (isJsonFormat && typeof process !== 'undefined' && process.stdout) {
      const jsonLine = JSON.stringify(entry)
      if (entry.severity === 'error' && process.stderr) {
        process.stderr.write(`${jsonLine}\n`)
      } else {
        process.stdout.write(`${jsonLine}\n`)
      }
    }

    // Always delegate to baseLogger (Medusa logger or mockLogger in Jest)
    if (this.baseLogger) {
      const method = entry.severity in this.baseLogger ? entry.severity : 'info'
      if (typeof this.baseLogger[method] === 'function') {
        // Pass human message first to satisfy existing test stringContaining assertions,
        // and structured entry as second argument for structured log consumers
        this.baseLogger[method](rawMessage, entry)
        return
      }
    }

    if (!isJsonFormat) {
      const prefix = `[${entry.timestamp}] [${entry.severity.toUpperCase()}] [${entry.service}] [${entry.operation}] [CID:${entry.correlation_id || 'none'}]`
      const consoleMethod =
        entry.severity === 'error'
          ? console.error
          : entry.severity === 'warn'
          ? console.warn
          : entry.severity === 'debug'
          ? console.debug
          : console.log

      consoleMethod(`${prefix} ${rawMessage}`)
    }
  }

  public info(operation: string, message: string, context?: LogContext): StructuredLogEntry {
    const entry = this.buildEntry('info', operation, message, context)
    this.emit(entry, message, context)
    return entry
  }

  public warn(operation: string, message: string, context?: LogContext): StructuredLogEntry {
    const entry = this.buildEntry('warn', operation, message, context)
    this.emit(entry, message, context)
    return entry
  }

  public error(
    operation: string,
    message: string,
    error?: unknown,
    context?: LogContext
  ): StructuredLogEntry {
    const safeErrorMeta = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        }
      : error
      ? { raw_error: String(error) }
      : undefined

    const mergedContext = {
      ...context,
      ...(safeErrorMeta ? { error_details: safeErrorMeta } : {}),
    }

    const entry = this.buildEntry('error', operation, message, mergedContext, error)
    this.emit(entry, message, mergedContext)
    return entry
  }

  public debug(operation: string, message: string, context?: LogContext): StructuredLogEntry {
    const entry = this.buildEntry('debug', operation, message, context)
    this.emit(entry, message, context)
    return entry
  }

  /**
   * Helper to measure processing duration of an asynchronous operation
   */
  public async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const startTime = Date.now()
    try {
      const result = await fn()
      const durationMs = Date.now() - startTime
      this.info(operation, `${operation} completed in ${durationMs}ms`, {
        ...context,
        durationMs,
      })
      return result
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime
      this.error(operation, `${operation} failed after ${durationMs}ms: ${err instanceof Error ? err.message : String(err)}`, err, {
        ...context,
        durationMs,
      })
      throw err
    }
  }
}

/**
 * Singleton or scoped structured logger creator.
 */
export function getStructuredLogger(containerOrLogger?: any, correlationId?: string): StructuredLogger {
  if (!containerOrLogger) {
    return new StructuredLogger(undefined, SERVICE_NAME, correlationId)
  }
  // If a Medusa container is passed, resolve LOGGER if available
  let baseLogger = containerOrLogger
  if (typeof containerOrLogger.resolve === 'function') {
    try {
      baseLogger = containerOrLogger.resolve(ContainerRegistrationKeys.LOGGER)
    } catch {
      baseLogger = undefined
    }
  }
  return new StructuredLogger(baseLogger, SERVICE_NAME, correlationId)
}
