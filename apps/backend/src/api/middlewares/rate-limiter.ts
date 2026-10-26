import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'

export interface RateLimiterOptions {
  action: string
  limit: number
  windowSeconds: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory fallback map if distributed cache is temporarily unreachable
const inMemoryStore = new Map<string, RateLimitRecord>()

// Periodic cleanup of stale in-memory entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of inMemoryStore.entries()) {
      if (now > value.resetTime) {
        inMemoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000).unref?.()
}

/**
 * Creates a rate-limiting middleware that uses Medusa's distributed cache (Redis in production)
 * with an in-memory fallback to prevent abuse of expensive or sensitive endpoints.
 */
export function createRateLimiter(options: {
  action: string
  limit: number
  windowSeconds: number
}) {
  const { action, limit, windowSeconds } = options

  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    // Resolve client IP
    const forwarded = req.headers['x-forwarded-for']
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : undefined) ||
      req.ip ||
      req.socket?.remoteAddress ||
      '127.0.0.1'

    const cacheKey = `rate_limit:${action}:${clientIp}`
    const now = Date.now()

    let record: RateLimitRecord | null = null
    let cacheService: any = null

    try {
      cacheService = req.scope.resolve(Modules.CACHE, { allowUnregistered: true })
      if (cacheService && typeof cacheService.get === 'function') {
        record = (await cacheService.get(cacheKey)) as RateLimitRecord | null
      }
    } catch {
      cacheService = null
    }

    // Fall back to in-memory store if cache service is unavailable
    if (!record) {
      const memoryRecord = inMemoryStore.get(cacheKey)
      if (memoryRecord && now < memoryRecord.resetTime) {
        record = memoryRecord
      }
    }

    if (!record || now >= record.resetTime) {
      // First request in new window
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + windowSeconds * 1000,
      }

      inMemoryStore.set(cacheKey, newRecord)

      if (cacheService && typeof cacheService.set === 'function') {
        try {
          await cacheService.set(cacheKey, newRecord, windowSeconds)
        } catch {
          // Non-blocking fallback
        }
      }

      res.setHeader('X-RateLimit-Limit', String(limit))
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - 1)))
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(newRecord.resetTime / 1000)))

      return next()
    }

    // Increment request count
    record.count += 1
    inMemoryStore.set(cacheKey, record)

    if (cacheService && typeof cacheService.set === 'function') {
      try {
        const remainingTtl = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
        await cacheService.set(cacheKey, record, remainingTtl)
      } catch {
        // Non-blocking fallback
      }
    }

    const remaining = Math.max(0, limit - record.count)
    res.setHeader('X-RateLimit-Limit', String(limit))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)))

    if (record.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
      res.setHeader('Retry-After', String(retryAfter))
      res.status(429).json({
        message: 'Too many requests. Please slow down and try again later.',
        retry_after: retryAfter,
      })
      return
    }

    return next()
  }
}
