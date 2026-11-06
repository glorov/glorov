import { ContainerRegistrationKeys, MedusaError, Modules } from '@medusajs/framework/utils'
import { classifyError, extractOrGenerateCorrelationId } from '@glorov/types'
import { getStructuredLogger } from './structured-logger'
import { metricsCollector } from './metrics-collector'
import { reportDeadLetter } from './error-reporter'
import { getRedisClient } from './redis-client'

export interface AsyncJobOptions {
  subscriberName: string
  eventName: string
  resourceId?: string
  resourceType?: string
  maxRetries?: number
  baseDelayMs?: number
  container?: any
  correlationId?: string
}

export interface AsyncRetryResult<T> {
  success: boolean
  result?: T
  attempts: number
  error?: Error
  deadLetterRecorded?: boolean
}

export interface DeadLetterRecord {
  job_id: string
  subscriber_name: string
  event_name: string
  resource_id?: string
  resource_type?: string
  failed_at: string
  attempts: number
  error_code: string
  error_message: string
  correlation_id: string
}

export class NonRetryableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NonRetryableError'
  }
}

const inMemoryDeadLetters: DeadLetterRecord[] = []

export function getDeadLetterRecords(): DeadLetterRecord[] {
  return [...inMemoryDeadLetters]
}

export function clearDeadLetterRecords(): void {
  inMemoryDeadLetters.length = 0
  try {
    const redis = getRedisClient()
    if (redis) {
      void redis.del('glorov:dead_letter:records').catch(() => {})
    }
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Loads dead-letter failure audit records from Redis list on process startup.
 */
export async function loadDeadLettersFromRedis(): Promise<DeadLetterRecord[]> {
  try {
    const redis = getRedisClient()
    if (!redis) return []

    const items = await redis.lrange('glorov:dead_letter:records', 0, -1)
    if (!items || items.length === 0) return []

    const existingIds = new Set(inMemoryDeadLetters.map((r) => r.job_id))
    const loaded: DeadLetterRecord[] = []

    for (const raw of items) {
      try {
        const parsed = JSON.parse(raw) as DeadLetterRecord
        if (parsed.job_id && !existingIds.has(parsed.job_id)) {
          inMemoryDeadLetters.push(parsed)
          existingIds.add(parsed.job_id)
          loaded.push(parsed)
        }
      } catch {
        // Skip malformed records
      }
    }
    return loaded
  } catch {
    return []
  }
}

if (process.env.NODE_ENV !== 'test') {
  void loadDeadLettersFromRedis().catch(() => {})
}

/**
 * Determines whether an error is permanently fatal and must NOT be retried.
 */
function isNonRetryableError(error: unknown): boolean {
  if (error instanceof NonRetryableError) {
    return true
  }
  if (error instanceof MedusaError) {
    if (
      error.type === MedusaError.Types.INVALID_DATA ||
      error.type === MedusaError.Types.NOT_FOUND ||
      error.type === MedusaError.Types.NOT_ALLOWED
    ) {
      return true
    }
  }
  const msg = error instanceof Error ? error.message : String(error)
  if (
    /invalid\s+recipient|invalid\s+email|missing\s+order\s+id|missing\s+recipient|unsupported\s+template/i.test(
      msg
    )
  ) {
    return true
  }
  return false
}

/**
 * Executes an asynchronous task with bounded retries, exponential backoff,
 * structured logging, and dead-letter failure audit recording.
 */
export async function withBoundedRetry<T>(
  action: (attempt: number) => Promise<T>,
  options: AsyncJobOptions
): Promise<AsyncRetryResult<T>> {
  const defaultRetries = process.env.NODE_ENV === 'test' ? 1 : 3
  const maxRetries = options.maxRetries ?? (Number(process.env.ASYNC_JOB_MAX_RETRIES) || defaultRetries)
  const baseDelayMs = options.baseDelayMs ?? 300
  const correlationId = options.correlationId || extractOrGenerateCorrelationId()
  const logger = getStructuredLogger(options.container, correlationId)

  let lastError: Error | undefined
  let lastAttempt = 1

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    lastAttempt = attempt
    try {
      const result = await action(attempt)

      if (attempt > 1) {
        logger.info(
          options.subscriberName,
          `[${options.subscriberName}] Succeeded on retry attempt ${attempt}/${maxRetries} for ${options.eventName} (${options.resourceId || 'N/A'})`,
          {
            correlationId,
            operation: options.subscriberName,
            attempt,
            maxRetries,
            resourceId: options.resourceId,
          }
        )
      }

      return {
        success: true,
        result,
        attempts: attempt,
        deadLetterRecorded: false,
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const isFatal = isNonRetryableError(err)
      const classified = classifyError(err)

      if (isFatal) {
        logger.warn(
          options.subscriberName,
          `[${options.subscriberName}] Non-retryable error on attempt ${attempt}: ${lastError.message}. Halting retries.`,
          {
            correlationId,
            operation: options.subscriberName,
            attempt,
            errorCode: classified.code,
            resourceId: options.resourceId,
            fatal: true,
          }
        )
        break
      }

      if (attempt < maxRetries) {
        const jitter = Math.floor(Math.random() * 100)
        const delay = Math.min(3000, baseDelayMs * Math.pow(2, attempt - 1) + jitter)

        logger.warn(
          options.subscriberName,
          `[${options.subscriberName}] Transient failure on attempt ${attempt}/${maxRetries} for ${options.eventName} (${options.resourceId || 'N/A'}). Retrying in ${delay}ms... Error: ${lastError.message}`,
          {
            correlationId,
            operation: options.subscriberName,
            attempt,
            maxRetries,
            delayMs: delay,
            errorCode: classified.code,
            resourceId: options.resourceId,
          }
        )

        // Non-blocking wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // If all bounded retries are exhausted, record Dead-Letter failure
  const classified = classifyError(lastError)
  const deadLetterId = `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const deadLetterRecord: DeadLetterRecord = {
    job_id: deadLetterId,
    subscriber_name: options.subscriberName,
    event_name: options.eventName,
    resource_id: options.resourceId,
    resource_type: options.resourceType || 'order',
    failed_at: new Date().toISOString(),
    attempts: lastAttempt,
    error_code: classified.code,
    error_message: lastError?.message || 'Unknown error',
    correlation_id: correlationId,
  }

  // Push to in-memory audit store
  inMemoryDeadLetters.push(deadLetterRecord)

  // Push to Redis list for restart durability
  try {
    const redis = getRedisClient()
    if (redis) {
      void redis.rpush('glorov:dead_letter:records', JSON.stringify(deadLetterRecord)).catch(() => {})
    }
  } catch {
    // Non-blocking fallback
  }

  // Update operational metrics
  metricsCollector.recordNotificationFailure(options.eventName, classified.code)

  // Report dead-letter event to external error reporting (Sentry) — non-blocking fire-and-forget
  reportDeadLetter(deadLetterRecord, lastError)

  // Log high-visibility structured dead letter entry
  logger.error(
    options.subscriberName,
    `[${options.subscriberName}] Permanently failed after bounded retries for ${options.eventName} (${options.resourceId || 'N/A'}): ${lastError?.message || 'Unknown error'}`,
    lastError,
    {
      correlationId,
      operation: options.subscriberName,
      status: 'PERMANENT_ASYNC_FAILURE',
      dead_letter_id: deadLetterId,
      dead_letter_record: deadLetterRecord,
      resourceId: options.resourceId,
    }
  )

  // If an order ID and Medusa container are provided, record dead-letter audit in metadata
  if (options.container && options.resourceId && options.resourceType === 'order') {
    try {
      const orderModule = options.container.resolve(Modules.ORDER)
      const query = options.container.resolve(ContainerRegistrationKeys.QUERY)
      if (orderModule && query) {
        const { data: orders } = await query.graph({
          entity: 'order',
          fields: ['id', 'metadata'],
          filters: { id: options.resourceId },
        })
        const order = orders?.[0]
        if (order) {
          const existingMeta = (order.metadata || {}) as Record<string, unknown>
          const failedJobs = ((existingMeta.failed_async_jobs || []) as DeadLetterRecord[])
          await orderModule.updateOrders([
            {
              id: order.id,
              metadata: {
                ...existingMeta,
                failed_async_jobs: [...failedJobs, deadLetterRecord],
              },
            },
          ])
        }
      }
    } catch (auditErr: unknown) {
      logger.warn(
        options.subscriberName,
        `Could not persist dead-letter metadata to order: ${auditErr instanceof Error ? auditErr.message : String(auditErr)}`,
        { correlationId }
      )
    }
  }

  return {
    success: false,
    attempts: lastAttempt,
    error: lastError,
    deadLetterRecorded: true,
  }
}
