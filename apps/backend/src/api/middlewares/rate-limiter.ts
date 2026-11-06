import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { getRedisClient } from '../../utils/redis-client'

export interface RateLimiterOptions {
  action: string
  limit: number
  windowSeconds: number
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory fallback map if distributed Redis cache is temporarily unreachable
const inMemoryStore = new Map<string, RateLimitRecord>()

// Helper for testing to clear in-memory state
export function clearInMemoryRateLimiter(): void {
  inMemoryStore.clear()
}

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
 * Creates a rate-limiting middleware that uses shared Redis (via getRedisClient)
 * with atomic INCR + EXPIRE across all PM2 cluster worker processes,
 * falling back seamlessly to an in-memory Map when Redis is unreachable.
 */
export function createRateLimiter(options: {
  action: string
  limit: number
  windowSeconds: number
}) {
  const { action, limit, windowSeconds } = options

  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    // Resolve client IP / identifier
    const forwarded = req.headers['x-forwarded-for']
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : undefined) ||
      req.ip ||
      req.socket?.remoteAddress ||
      '127.0.0.1'

    const now = Date.now()
    const redis = getRedisClient()

    // 1. Try distributed Redis rate limiting (shared across all PM2 workers)
    if (redis) {
      try {
        const windowIndex = Math.floor(now / (windowSeconds * 1000))
        const redisKey = `glorov:ratelimit:${action}:${clientIp}:${windowIndex}`
        const resetTime = (windowIndex + 1) * windowSeconds * 1000

        const count = await redis.incr(redisKey)
        if (count === 1) {
          // Set key expiry to ensure cleanup after window elapses
          await redis.expire(redisKey, windowSeconds * 2)
        }

        const remaining = Math.max(0, limit - count)
        const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000))

        res.setHeader('X-RateLimit-Limit', String(limit))
        res.setHeader('X-RateLimit-Remaining', String(remaining))
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)))

        if (count > limit) {
          res.setHeader('Retry-After', String(retryAfter))
          res.status(429).json({
            message: 'Too many requests. Please slow down and try again later.',
            retry_after: retryAfter,
          })
          return
        }

        return next()
      } catch {
        // If Redis command fails, fall through to in-memory store
      }
    }

    // 2. In-memory fallback store (when Redis is disabled or unreachable)
    const cacheKey = `rate_limit:${action}:${clientIp}`
    let record = inMemoryStore.get(cacheKey)

    if (!record || now >= record.resetTime) {
      // First request in new window
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + windowSeconds * 1000,
      }

      inMemoryStore.set(cacheKey, newRecord)

      res.setHeader('X-RateLimit-Limit', String(limit))
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - 1)))
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(newRecord.resetTime / 1000)))

      return next()
    }

    // Increment request count in memory
    record.count += 1
    inMemoryStore.set(cacheKey, record)

    const remaining = Math.max(0, limit - record.count)
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000))

    res.setHeader('X-RateLimit-Limit', String(limit))
    res.setHeader('X-RateLimit-Remaining', String(remaining))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)))

    if (record.count > limit) {
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

