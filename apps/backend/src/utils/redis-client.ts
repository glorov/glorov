import Redis from 'ioredis'

let redisClient: Redis | null = null

/**
 * Returns a singleton ioredis client instance configured with resilient error handling.
 * Falls back to null when Redis is unreachable or during non-Redis unit test runs.
 */
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient
  }

  // In test environment without explicit REDIS_URL, don't attempt connection
  if (process.env.NODE_ENV === 'test' && !process.env.REDIS_URL) {
    return null
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 100, 2000)
      },
    })

    client.on('error', (err) => {
      // Suppress connection error logging in background to avoid spamming console
      if (process.env.NODE_ENV !== 'test') {
        // Silently caught; callers gracefully fall back to in-memory store
      }
    })

    redisClient = client
    return redisClient
  } catch {
    return null
  }
}

/**
 * Sets a mock or custom Redis client for testing purposes.
 */
export function setRedisClientForTesting(client: Redis | null): void {
  redisClient = client
}

/**
 * Closes the active Redis client connection (useful for test tear-downs).
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit()
    } catch {
      redisClient.disconnect()
    } finally {
      redisClient = null
    }
  }
}
