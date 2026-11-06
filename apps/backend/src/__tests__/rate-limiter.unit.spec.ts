import { createRateLimiter, clearInMemoryRateLimiter } from '../api/middlewares/rate-limiter'
import { setRedisClientForTesting } from '../utils/redis-client'

describe('Rate Limiter Middleware Unit Tests (GLOROV-ERR-006)', () => {
  let mockReq: any
  let mockRes: any
  let mockNext: any
  let headers: Record<string, string>

  beforeEach(() => {
    clearInMemoryRateLimiter()
    setRedisClientForTesting(null)
    headers = {}

    mockReq = {
      headers: {
        'x-forwarded-for': '203.0.113.195',
      },
      ip: '203.0.113.195',
      socket: { remoteAddress: '203.0.113.195' },
    }

    mockRes = {
      setHeader: jest.fn((key: string, val: string) => {
        headers[key] = val
      }),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }

    mockNext = jest.fn()
  })

  afterEach(() => {
    setRedisClientForTesting(null)
    clearInMemoryRateLimiter()
    jest.clearAllMocks()
  })

  describe('In-Memory Fallback Rate Limiting', () => {
    it('1. Allows requests within the specified limit and sets rate limit headers', async () => {
      const limiter = createRateLimiter({
        action: 'test_action',
        limit: 3,
        windowSeconds: 60,
      })

      // Request 1
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(headers['X-RateLimit-Limit']).toBe('3')
      expect(headers['X-RateLimit-Remaining']).toBe('2')
      expect(headers['X-RateLimit-Reset']).toBeDefined()

      // Request 2
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)
      expect(headers['X-RateLimit-Remaining']).toBe('1')

      // Request 3 (exact limit boundary)
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(3)
      expect(headers['X-RateLimit-Remaining']).toBe('0')
    })

    it('2. Blocks requests exceeding the limit with 429 and Retry-After header', async () => {
      const limiter = createRateLimiter({
        action: 'test_action',
        limit: 2,
        windowSeconds: 30,
      })

      // Request 1
      await limiter(mockReq, mockRes, mockNext)
      // Request 2
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)

      // Request 3 (exceeds limit of 2)
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2) // next() not called on 429
      expect(mockRes.status).toHaveBeenCalledWith(429)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/too many requests/i),
          retry_after: expect.any(Number),
        })
      )
      expect(headers['Retry-After']).toBeDefined()
    })
  })

  describe('Redis-Backed Rate Limiting (Multi-Process PM2 Cluster Sharing)', () => {
    let mockRedisStore: Map<string, { value: number; ttl: number }>
    let mockRedisClient: any

    beforeEach(() => {
      mockRedisStore = new Map()

      mockRedisClient = {
        incr: jest.fn().mockImplementation(async (key: string) => {
          const entry = mockRedisStore.get(key) || { value: 0, ttl: -1 }
          entry.value += 1
          mockRedisStore.set(key, entry)
          return entry.value
        }),
        expire: jest.fn().mockImplementation(async (key: string, seconds: number) => {
          const entry = mockRedisStore.get(key)
          if (entry) {
            entry.ttl = seconds
          }
          return 1
        }),
      }

      setRedisClientForTesting(mockRedisClient)
    })

    it('3. Uses Redis atomic INCR and EXPIRE for distributed rate limiting across PM2 processes', async () => {
      const limiter = createRateLimiter({
        action: 'checkout_submit',
        limit: 5,
        windowSeconds: 60,
      })

      // Request 1: triggers incr and expire
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockRedisClient.incr).toHaveBeenCalledWith(
        expect.stringMatching(/^glorov:ratelimit:checkout_submit:203\.0\.113\.195:\d+$/)
      )
      expect(mockRedisClient.expire).toHaveBeenCalledWith(expect.any(String), 120) // 2x window
      expect(headers['X-RateLimit-Limit']).toBe('5')
      expect(headers['X-RateLimit-Remaining']).toBe('4')

      // Request 2: increments existing key without resetting expire
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)
      expect(mockRedisClient.expire).toHaveBeenCalledTimes(1) // only on count === 1
      expect(headers['X-RateLimit-Remaining']).toBe('3')
    })

    it('4. Rejects with 429 when Redis counter exceeds limit across PM2 workers', async () => {
      const limiter = createRateLimiter({
        action: 'pincode_check',
        limit: 2,
        windowSeconds: 60,
      })

      // Worker 1: Req 1
      await limiter(mockReq, mockRes, mockNext)
      // Worker 2: Req 2 (simulating shared state)
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)

      // Worker 3: Req 3 (exceeds limit)
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)
      expect(mockRes.status).toHaveBeenCalledWith(429)
      expect(headers['Retry-After']).toBeDefined()
    })

    it('5. Gracefully falls back to in-memory store if Redis command throws error', async () => {
      mockRedisClient.incr.mockRejectedValueOnce(new Error('Redis connection timed out'))

      const limiter = createRateLimiter({
        action: 'resilient_action',
        limit: 2,
        windowSeconds: 60,
      })

      // Request 1: Redis throws -> falls back to in-memory store transparently
      await limiter(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(headers['X-RateLimit-Limit']).toBe('2')
      expect(headers['X-RateLimit-Remaining']).toBe('1')
    })
  })
})
