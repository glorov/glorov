import {
  redactSensitiveData,
  maskEmail,
  maskPhone,
  maskBankAccount,
  isValidCorrelationId,
  generateCorrelationId,
  extractOrGenerateCorrelationId,
  classifyError,
  createSanitizedErrorPayload,
} from '@glorov/types'
import { StructuredLogger } from '../utils/structured-logger'
import { OperationalMetrics } from '../utils/metrics-collector'
import { sendSanitizedError } from '../utils/error-handler'
import { withBoundedRetry, NonRetryableError, getDeadLetterRecords, clearDeadLetterRecords, loadDeadLettersFromRedis } from '../utils/async-retry'
import * as redisClientModule from '../utils/redis-client'
import * as errorReporterModule from '../utils/error-reporter'
import { GET as storeHealthHandler } from '../api/store/health/route'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

describe('GLOROV Observability, Structured Logging, and Safe Error Handling', () => {
  // =========================================================================
  // 1. Sensitive Data Redaction & Customer PII Masking
  // =========================================================================
  describe('1. Sensitive Data Redaction & Customer PII Masking', () => {
    it('redacts sensitive keys including passwords, tokens, API keys, and CVVs', () => {
      const sensitivePayload = {
        user: {
          username: 'botanical_grower',
          password: 'superSecretPassword123!',
          api_key: 'rzp_live_testSecretKey999',
          auth_token: 'secret_jwt_token_here',
          card: {
            cvv: '123',
            cardNumber: '4111222233334444',
          },
        },
      }

      const redacted = redactSensitiveData(sensitivePayload) as Record<string, any>

      expect(redacted.user.username).toBe('botanical_grower')
      expect(redacted.user.password).toBe('[REDACTED]')
      expect(redacted.user.api_key).toBe('[REDACTED]')
      expect(redacted.user.auth_token).toBe('[REDACTED]')
      expect(redacted.user.card.cvv).toBe('[REDACTED]')
      expect(redacted.user.card.cardNumber).toBe('************4444')
    })

    it('masks customer email addresses preserving domain and boundary characters', () => {
      expect(maskEmail('sourav@example.com')).toBe('s***v@e***.com')
      expect(maskEmail('ab@domain.in')).toBe('a***@d***.in')
      expect(maskEmail('a@b.com')).toBe('a***@b***.com')
      expect(maskEmail('')).toBe('[NO_EMAIL]')
      expect(maskEmail(undefined)).toBe('[NO_EMAIL]')
    })

    it('masks Indian mobile numbers preserving only the last 4 digits', () => {
      expect(maskPhone('9876543210')).toBe('******3210')
      expect(maskPhone('+91 98765 43210')).toBe('******3210')
      expect(maskPhone('123')).toBe('******')
      expect(maskPhone('')).toBe('[NO_PHONE]')
      expect(maskPhone(null)).toBe('[NO_PHONE]')
    })

    it('masks bank accounts preserving only the last 4 digits', () => {
      expect(maskBankAccount('123456789012')).toBe('XXXXXX9012')
      expect(maskBankAccount('9876')).toBe('XXXXXX9876')
      expect(maskBankAccount('')).toBe('[NO_ACCOUNT]')
    })

    it('masks customer street addresses while retaining city, state, and pincode', () => {
      const address = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        address_1: 'Flat 402, Lotus Orchid Enclave, Shivaji Nagar',
        address_2: 'Behind Central Post Office',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411005',
        phone: '9876543210',
        email: 'aarav.sharma@example.com',
      }

      const redacted = redactSensitiveData(address) as Record<string, any>
      expect(redacted.address_1).toBe('[REDACTED_ADDRESS_LINE]')
      expect(redacted.address_2).toBe('[REDACTED_ADDRESS_LINE]')
      expect(redacted.city).toBe('Pune')
      expect(redacted.province).toBe('Maharashtra')
      expect(redacted.postal_code).toBe('411005')
      expect(redacted.phone).toBe('******3210')
      expect(redacted.email).toBe('a***a@e***.com')
    })

    it('redacts raw JWTs and Bearer tokens embedded in string values', () => {
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      const bearerHeader = `Bearer ${jwt}`

      const payload = {
        customHeader: bearerHeader,
        payloadString: jwt,
      }

      const redacted = redactSensitiveData(payload) as Record<string, any>
      expect(redacted.customHeader).toBe('Bearer [REDACTED_TOKEN]')
      expect(redacted.payloadString).toBe('[REDACTED_JWT]')
    })

    it('gracefully handles circular references and deep nesting without blowing up the stack', () => {
      const circularObj: any = { name: 'Botanical Plant' }
      circularObj.self = circularObj

      const result = redactSensitiveData(circularObj) as Record<string, any>
      expect(result.name).toBe('Botanical Plant')
      expect(result.self).toBe('[CIRCULAR_REF]')
    })

    it('strips stack traces from Error objects during customer-facing serialization', () => {
      const err = new Error('Database query timed out')
      const sanitized = createSanitizedErrorPayload(err, 'req_test123')

      expect(sanitized.error).not.toContain('at ')
      expect((sanitized as any).stack).toBeUndefined()
      expect(sanitized.correlation_id).toBe('req_test123')
    })
  })

  // =========================================================================
  // 2. Request Correlation & ID Validation
  // =========================================================================
  describe('2. Request Correlation & ID Validation', () => {
    it('accepts valid RFC 4122 UUIDs as correlation IDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000'
      expect(isValidCorrelationId(validUuid)).toBe(true)
    })

    it('accepts valid alphanumeric prefixed IDs', () => {
      expect(isValidCorrelationId('req_1234567890abcdef')).toBe(true)
      expect(isValidCorrelationId('trace-order-12345')).toBe(true)
      expect(isValidCorrelationId('c_987654321')).toBe(true)
    })

    it('rejects invalid, unsafe, or overly long correlation IDs', () => {
      expect(isValidCorrelationId('')).toBe(false)
      expect(isValidCorrelationId(' ')).toBe(false)
      expect(isValidCorrelationId('ab')).toBe(false) // too short (< 8)
      expect(isValidCorrelationId('a'.repeat(65))).toBe(false) // too long (> 64)
      expect(isValidCorrelationId('<script>alert(1)</script>')).toBe(false) // XSS injection
      expect(isValidCorrelationId('id; DROP TABLE orders;')).toBe(false) // SQL injection
      expect(isValidCorrelationId('id with spaces')).toBe(false)
    })

    it('generates a valid, cryptographically secure correlation ID when requested', () => {
      const generated = generateCorrelationId()
      expect(isValidCorrelationId(generated)).toBe(true)
      expect(generated).toMatch(/^(?:glr_)?[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('extractOrGenerateCorrelationId reuses valid headers or creates a new one', () => {
      const existing = 'valid-correlation-id-12345'
      expect(extractOrGenerateCorrelationId(existing)).toBe(existing)

      const invalid = 'short'
      const fallback = extractOrGenerateCorrelationId(invalid)
      expect(isValidCorrelationId(fallback)).toBe(true)
      expect(fallback).not.toBe(invalid)
    })
  })

  // =========================================================================
  // 3. Error Classification & Client-Safe Sanitization
  // =========================================================================
  describe('3. Error Classification & Client-Safe Sanitization', () => {
    it('classifies database connectivity errors into generic client messages without leaking credentials', () => {
      const dbErr = new Error('connect ECONNREFUSED postgres://postgres:p%40ssw0rd!@10.0.0.15:5432/medusa_db')
      const classified = classifyError(dbErr)

      expect(classified.code).toBe('DATABASE_UNAVAILABLE')
      expect(classified.statusCode).toBe(503)
      expect(classified.sanitizedMessage).not.toContain('postgres://')
      expect(classified.sanitizedMessage).not.toContain('p%40ssw0rd!')
      expect(classified.sanitizedMessage).not.toContain('10.0.0.15')
      expect(classified.sanitizedMessage).toContain('Database service is temporarily unavailable')
    })

    it('classifies database syntax errors without leaking SQL table names', () => {
      const sqlErr = new Error('relation "admin_secret_credentials" does not exist at character 45')
      const classified = classifyError(sqlErr)

      expect(classified.code).toBe('DATABASE_QUERY_ERROR')
      expect(classified.statusCode).toBe(500)
      expect(classified.sanitizedMessage).not.toContain('admin_secret_credentials')
      expect(classified.sanitizedMessage).toContain('database transaction could not be completed')
    })

    it('classifies Razorpay timeout errors into 504 Gateway Timeout', () => {
      const rzpErr = new Error('Razorpay gateway request timed out after 5000ms: ETIMEDOUT')
      const classified = classifyError(rzpErr)

      expect(classified.code).toBe('PAYMENT_GATEWAY_TIMEOUT')
      expect(classified.statusCode).toBe(504)
      expect(classified.sanitizedMessage).toContain('Payment service took too long to respond')
    })

    it('classifies Shiprocket logistics failures into 502 Bad Gateway', () => {
      const shiprocketErr = new Error('Shiprocket courier dispatch returned 502 Bad Gateway')
      const classified = classifyError(shiprocketErr)

      expect(classified.code).toBe('LOGISTICS_PROVIDER_ERROR')
      expect(classified.statusCode).toBe(502)
      expect(classified.sanitizedMessage).toContain('Logistics provider service is temporarily unavailable')
    })

    it('classifies rate limiting errors into 429 Too Many Requests', () => {
      const rateLimitErr = new Error('Rate limit exceeded: too many requests per minute')
      const classified = classifyError(rateLimitErr)

      expect(classified.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(classified.statusCode).toBe(429)
    })

    it('delivers safe error envelope via sendSanitizedError without leaking diagnostics', () => {
      const mockRes = {
        statusCode: 0,
        responseBody: null as any,
        headers: {} as Record<string, string>,
        status(code: number) {
          this.statusCode = code
          return this
        },
        json(body: any) {
          this.responseBody = body
          return this
        },
        setHeader(name: string, value: string) {
          this.headers[name] = value
          return this
        },
      }

      const internalLeakError = new Error('FATAL: password authentication failed for user "postgres" at db.internal.net')
      sendSanitizedError(mockRes as any, internalLeakError, 500, { orderId: 'ord_123' })

      expect(mockRes.statusCode).toBe(500)
      expect(mockRes.responseBody.success).toBe(false)
      expect(mockRes.responseBody.error).not.toContain('postgres')
      expect(mockRes.responseBody.error).not.toContain('db.internal.net')
      expect(mockRes.responseBody.message).toBe(mockRes.responseBody.error)
      expect(mockRes.responseBody.correlation_id).toBeDefined()
      expect(mockRes.responseBody.timestamp).toBeDefined()
    })
  })

  // =========================================================================
  // 4. Structured Logger Redaction & Latency Measurement
  // =========================================================================
  describe('4. Structured Logger Redaction & Latency Measurement', () => {
    it('redacts sensitive fields in structured log output', () => {
      const recordedLogs: string[] = []
      const mockMedusaLogger = {
        info: jest.fn((msg) => recordedLogs.push(msg)),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const structured = new StructuredLogger(mockMedusaLogger as any)
      structured.info('Checkout', 'Customer checkout initiated', {
        email: 'customer@botanical.in',
        card_token: 'rzp_tok_secret99',
        pincode: '411001',
      })

      expect(mockMedusaLogger.info).toHaveBeenCalled()
      const [msg, entry] = mockMedusaLogger.info.mock.calls[0] as unknown as [string, any]
      expect(msg).toBe('Customer checkout initiated')
      expect(JSON.stringify(entry)).not.toContain('rzp_tok_secret99')
      expect(JSON.stringify(entry)).toContain('[REDACTED]')
      expect(JSON.stringify(entry)).toContain('c***r@b***.in')
    })

    it('measures execution time accurately using logger.measure', async () => {
      const mockMedusaLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      }

      const structured = new StructuredLogger(mockMedusaLogger as any)
      const result = await structured.measure('pincode_validation', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return { serviceable: true }
      })

      expect(result.serviceable).toBe(true)
      expect(mockMedusaLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('pincode_validation completed in'),
        expect.any(Object)
      )
    })
  })

  // =========================================================================
  // 5. Bounded Async Retries & Dead-Letter Auditing
  // =========================================================================
  describe('5. Bounded Async Retries & Dead-Letter Auditing', () => {
    beforeEach(() => {
      clearDeadLetterRecords()
    })

    it('retries transient failures up to maximum bounds and records dead-letter on exhaustion', async () => {
      let attempts = 0
      const transientFailureOp = async () => {
        attempts++
        throw new Error('Connection reset by peer: ECONNRESET')
      }

      const result = await withBoundedRetry(transientFailureOp, {
        subscriberName: 'TestSubscriber',
        eventName: 'order.placed',
        resourceId: 'order_test_123',
        maxRetries: 3,
        baseDelayMs: 10,
      })

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(3)
      expect(result.deadLetterRecorded).toBe(true)
      expect(attempts).toBe(3)

      const deadLetters = getDeadLetterRecords()
      expect(deadLetters.length).toBe(1)
      expect(deadLetters[0].subscriber_name).toBe('TestSubscriber')
      expect(deadLetters[0].event_name).toBe('order.placed')
      expect(deadLetters[0].resource_id).toBe('order_test_123')
      expect(deadLetters[0].attempts).toBe(3)
    })

    it('halts immediately on non-retryable errors without wasting retries', async () => {
      let attempts = 0
      const nonRetryableOp = async () => {
        attempts++
        throw new NonRetryableError('Invalid customer phone number: +919999999999 rejected by SMS gateway')
      }

      const result = await withBoundedRetry(nonRetryableOp, {
        subscriberName: 'SmsNotificationSubscriber',
        eventName: 'shipment.created',
        resourceId: 'shipment_456',
        maxRetries: 3,
        baseDelayMs: 10,
      })

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(1) // Stopped on attempt 1!
      expect(result.deadLetterRecorded).toBe(true)
      expect(attempts).toBe(1)
    })

    it('succeeds if a transient error resolves within the retry limit', async () => {
      let attempts = 0
      const flappyOp = async () => {
        attempts++
        if (attempts < 2) {
          throw new Error('Transient 503 from external webhook endpoint')
        }
        return { delivered: true }
      }

      const result = await withBoundedRetry(flappyOp, {
        subscriberName: 'WebhookDispatch',
        eventName: 'order.created',
        resourceId: 'ord_retry_success',
        maxRetries: 3,
        baseDelayMs: 10,
      })

      expect(result.success).toBe(true)
      expect(result.attempts).toBe(2)
      expect(result.deadLetterRecorded).toBe(false)
    })
  })

  // =========================================================================
  // 6. Operational Health Check Route
  // =========================================================================
  describe('6. Operational Health Check Route (/store/health)', () => {
    it('returns HTTP 200 with healthy components when database is responsive', async () => {
      const mockQuery = {
        graph: jest.fn().mockResolvedValue({ data: [{ id: 'reg_in' }] }),
      }

      const mockReq = {
        scope: {
          resolve: jest.fn((key) => {
            if (key === ContainerRegistrationKeys.QUERY) return mockQuery
            return null
          }),
        },
      }

      let responseStatus = 0
      let responseJson: any = null

      const mockRes = {
        status(code: number) {
          responseStatus = code
          return this
        },
        json(body: any) {
          responseJson = body
          return this
        },
      }

      await storeHealthHandler(mockReq as any, mockRes as any)

      expect(responseStatus).toBe(200)
      expect(responseJson.status).toBe('healthy')
      expect(responseJson.ready).toBe(true)
      expect(responseJson.components.process.status).toBe('healthy')
      expect(responseJson.components.database.status).toBe('healthy')
      expect(responseJson.timestamp).toBeDefined()
    })

    it('returns HTTP 503 with unhealthy status when database is disconnected without leaking connection string', async () => {
      const mockQuery = {
        graph: jest.fn().mockRejectedValue(new Error('Connection terminated unexpectedly: secret_db_user@10.0.1.2:5432')),
      }

      const mockReq = {
        scope: {
          resolve: jest.fn((key) => {
            if (key === ContainerRegistrationKeys.QUERY) return mockQuery
            return null
          }),
        },
      }

      let responseStatus = 0
      let responseJson: any = null

      const mockRes = {
        status(code: number) {
          responseStatus = code
          return this
        },
        json(body: any) {
          responseJson = body
          return this
        },
      }

      await storeHealthHandler(mockReq as any, mockRes as any)

      expect(responseStatus).toBe(503)
      expect(responseJson.status).toBe('unhealthy')
      expect(responseJson.ready).toBe(false)
      expect(responseJson.components.database.status).toBe('unhealthy')
      // Must not leak connection string or host
      expect(JSON.stringify(responseJson)).not.toContain('secret_db_user')
      expect(JSON.stringify(responseJson)).not.toContain('10.0.1.2')
      expect(responseJson.components.process.status).toBe('healthy')
    })
  })

  // =========================================================================
  // 7. Operational Metrics Collection & Alerting Evaluation
  // =========================================================================
  describe('7. Operational Metrics Collection & Alerting Evaluation', () => {
    it('calculates accurate p95 latency and request statistics', () => {
      const metrics = new OperationalMetrics()

      // Record 100 requests with latencies 1ms to 100ms
      for (let i = 1; i <= 100; i++) {
        metrics.recordRequest(200, i)
      }

      const snapshot = metrics.getSnapshot()
      expect(snapshot.requests_total).toBe(100)
      expect(snapshot.errors_total).toBe(0)
      expect(snapshot.error_rate_percent).toBe(0)
      expect(snapshot.p95_latency_ms).toBeGreaterThanOrEqual(95)
    })

    it('evaluates alerts and triggers when error rate threshold is breached', () => {
      const metrics = new OperationalMetrics({
        errorRatePercent: 5.0, // 5% threshold
      })

      // Record 100 requests: 90 success, 10 errors (10% error rate, min 20 requests)
      for (let i = 0; i < 90; i++) {
        metrics.recordRequest(200, 25)
      }
      for (let i = 0; i < 10; i++) {
        metrics.recordRequest(500, 30)
      }

      const alerts = metrics.evaluateAlerts()
      const errorRateAlert = alerts.find((a) => a.name === 'HighErrorRate')

      expect(errorRateAlert).toBeDefined()
      expect(errorRateAlert?.severity).toBe('critical')
      expect(errorRateAlert?.message).toContain('exceeds threshold (5%)')
    })

    it('triggers payment failure alert when failure count exceeds threshold', () => {
      const metrics = new OperationalMetrics({
        paymentFailureThresholdHourly: 3,
      })

      metrics.recordPaymentFailure('card_declined')
      metrics.recordPaymentFailure('gateway_timeout')
      metrics.recordPaymentFailure('insufficient_funds')
      metrics.recordPaymentFailure('authentication_failed')

      const alerts = metrics.evaluateAlerts()
      const paymentAlert = alerts.find((a) => a.name === 'ElevatedPaymentFailures')

      expect(paymentAlert).toBeDefined()
      expect(paymentAlert?.severity).toBe('critical')
      expect(paymentAlert?.message).toContain('Payment failures count (4) exceeded alert threshold (3)')
    })

    it('persists metrics snapshot to Redis and restores on startup', async () => {
      const mockStorage: Record<string, string> = {}
      const mockRedis = {
        set: jest.fn().mockImplementation((key, val) => {
          mockStorage[key] = val
          return Promise.resolve('OK')
        }),
        get: jest.fn().mockImplementation((key) => {
          return Promise.resolve(mockStorage[key] || null)
        }),
      }

      redisClientModule.setRedisClientForTesting(mockRedis as any)

      const metrics = new OperationalMetrics()
      metrics.recordRequest(200, 15)
      metrics.recordRequest(500, 45)
      metrics.recordPaymentFailure('test_error')

      await metrics.flushToRedis()
      expect(mockRedis.set).toHaveBeenCalledWith(
        'glorov:metrics:snapshot',
        expect.any(String),
        'EX',
        expect.any(Number)
      )

      // Reset in-memory and restore
      metrics.reset()
      expect(metrics.getSnapshot().requests_total).toBe(0)

      await metrics.loadFromRedis()
      expect(metrics.getSnapshot().requests_total).toBe(2)
      expect(metrics.getSnapshot().errors_total).toBe(1)
      expect(metrics.getSnapshot().payment_failures_total).toBe(1)

      redisClientModule.setRedisClientForTesting(null)
    })

    it('loads dead-letter records from Redis list on startup', async () => {
      const sampleDlq = {
        job_id: 'dlq_test_123',
        subscriber_name: 'test_sub',
        event_name: 'order.placed',
        resource_id: 'ord_1',
        resource_type: 'order',
        failed_at: new Date().toISOString(),
        attempts: 3,
        error_code: 'TEST_ERROR',
        error_message: 'Failure',
        correlation_id: 'req_123',
      }

      const mockRedis = {
        lrange: jest.fn().mockResolvedValue([JSON.stringify(sampleDlq)]),
        del: jest.fn().mockResolvedValue(1),
        rpush: jest.fn().mockResolvedValue(1),
      }

      redisClientModule.setRedisClientForTesting(mockRedis as any)

      clearDeadLetterRecords()
      expect(getDeadLetterRecords().length).toBe(0)

      const loaded = await loadDeadLettersFromRedis()
      expect(loaded.length).toBe(1)
      expect(getDeadLetterRecords().some((r) => r.job_id === 'dlq_test_123')).toBe(true)

      clearDeadLetterRecords()
      expect(mockRedis.del).toHaveBeenCalledWith('glorov:dead_letter:records')

      redisClientModule.setRedisClientForTesting(null)
    })
  })

  // =========================================================================
  // 6. External Error Reporting (Sentry Integration)
  // =========================================================================
  describe('6. External Error Reporting (Sentry Integration)', () => {
    let capturedEvents: Array<{
      type: string
      error: unknown
      context?: any
      deadLetterRecord?: any
    }> = []

    beforeEach(() => {
      capturedEvents = []
      errorReporterModule.setErrorReportingListenerForTesting((event) => {
        capturedEvents.push(event)
      })
    })

    afterEach(() => {
      errorReporterModule.setErrorReportingListenerForTesting(null)
    })

    it('reports 5xx internal server errors to Sentry reporter with redacted context', async () => {
      const mockRes = {
        statusCode: 0,
        headers: {} as Record<string, string>,
        status(code: number) {
          this.statusCode = code
          return this
        },
        json(body: any) {
          return this
        },
        setHeader(name: string, value: string) {
          this.headers[name] = value
          return this
        },
      }

      const serverErr = new Error('Database pool connection timeout')
      sendSanitizedError(mockRes as any, serverErr, 500, {
        operation: 'checkout.process',
        customer_email: 'sourav@botanical.in',
        card_token: 'rzp_tok_secret999',
      })

      expect(mockRes.statusCode).toBe(500)

      // Allow fire-and-forget Promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(capturedEvents.length).toBe(1)
      expect(capturedEvents[0].type).toBe('backend_error')
      expect(capturedEvents[0].error).toBe(serverErr)
      expect(capturedEvents[0].context.statusCode).toBe(500)
      expect(capturedEvents[0].context.operation).toBe('checkout.process')
      // Verify PII was redacted
      expect(capturedEvents[0].context.customer_email).toBe('s***v@b***.in')
      expect(capturedEvents[0].context.card_token).toBe('[REDACTED]')
    })

    it('does NOT report 4xx client errors (400, 404, 409) to Sentry', async () => {
      const mockRes = {
        statusCode: 0,
        headers: {} as Record<string, string>,
        status(code: number) {
          this.statusCode = code
          return this
        },
        json(body: any) {
          return this
        },
        setHeader(name: string, value: string) {
          this.headers[name] = value
          return this
        },
      }

      const clientErr = new Error('Invalid delivery postal code')
      sendSanitizedError(mockRes as any, clientErr, 400)

      expect(mockRes.statusCode).toBe(400)

      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(capturedEvents.length).toBe(0)
    })

    it('reports dead-letter events to external reporter on retry exhaustion', async () => {
      const failureOp = async () => {
        throw new Error('Upstream Shiprocket courier API 500 error')
      }

      await withBoundedRetry(failureOp, {
        subscriberName: 'ShiprocketDispatcher',
        eventName: 'order.placed',
        resourceId: 'order_dlq_test_1',
        maxRetries: 2,
        baseDelayMs: 10,
      })

      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(capturedEvents.length).toBe(1)
      expect(capturedEvents[0].type).toBe('dead_letter')
      expect(capturedEvents[0].deadLetterRecord.subscriber_name).toBe('ShiprocketDispatcher')
      expect(capturedEvents[0].deadLetterRecord.event_name).toBe('order.placed')
      expect(capturedEvents[0].deadLetterRecord.resource_id).toBe('order_dlq_test_1')
    })
  })
})
