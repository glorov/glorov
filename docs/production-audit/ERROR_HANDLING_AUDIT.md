# GLOROV — Error Handling & Observability Audit

> **Audit Date:** November 6, 2026

---

## 1. Error Handling Architecture

### Backend Error Handler
**File**: [`error-handler.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/error-handler.ts) (115 lines)

| Feature | Status | Evidence |
|---|---|---|
| Centralized `sendSanitizedError()` function | ✅ PASS | L26-114 — Single entry point for all error responses |
| MedusaError type → HTTP status mapping | ✅ PASS | L50-79 — INVALID_DATA→400, NOT_FOUND→404, CONFLICT→409, etc. |
| Stack trace suppression in production | ✅ PASS | Via `classifyError()` from `@glorov/types` |
| Correlation ID in error responses | ✅ PASS | L42 — `res.setHeader('x-correlation-id', correlationId)` |
| Structured error logging | ✅ PASS | L100-107 — Internal diagnostic error with structured attributes |
| Safe user messages (no internal details) | ✅ PASS | L84-91 — Only shows error.message for 4xx < 200 chars |
| Operational metrics recording | ✅ PASS | L94-97 — `metricsCollector.recordHttpError()` + payment failure tracking |
| Sanitized error payload (from shared types) | ✅ PASS | L109 — `createSanitizedErrorPayload()` |
| Registered as global error handler | ✅ PASS | `middlewares.ts` L258-268 — `errorHandler` in `defineMiddlewares` |

### Storefront Error Handling
| Feature | Status | Evidence |
|---|---|---|
| Root error boundary | ✅ PASS | [`error.tsx`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/error.tsx) — "Something unexpected sprouted" with retry + home buttons |
| 404 Not Found page | ✅ PASS | [`not-found.tsx`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/not-found.tsx) — "Botanical Path Not Found" |
| Root loading state | ✅ PASS | [`loading.tsx`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/loading.tsx) — `BotanicalLoadingState` |
| Nested route error boundaries | ❌ NOT FOUND | No `error.tsx` in nested route groups |
| Client-side error logging | ⚠️ PARTIAL | `error.tsx` L18: `console.error()` only — no external error reporter |

---

## 2. Structured Logging

### StructuredLogger
**File**: [`structured-logger.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/structured-logger.ts) (212 lines)

| Feature | Status | Evidence |
|---|---|---|
| ISO 8601 timestamps | ✅ PASS | L70 |
| Severity levels (info/warn/error/debug) | ✅ PASS | L123-165 |
| Correlation ID propagation | ✅ PASS | L48-51, L74 |
| Environment-aware formatting | ✅ PASS | L84 — JSON in production, human-readable in dev |
| PII redaction | ✅ PASS | L59 — `redactSensitiveData(context)` from shared types |
| Duration measurement | ✅ PASS | L170-192 — `measure()` helper for async operations |
| Context immutability | ✅ PASS | L33-39 — `withContext()` creates new logger instance |
| Stack trace exclusion in production | ✅ PASS | L145 — `stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined` |
| Structured JSON output | ✅ PASS | L89 — `JSON.stringify(entry)` to stdout/stderr |
| Error-level to stderr | ✅ PASS | L90-93 |

### Log Entry Schema
```typescript
{
  timestamp: string,       // ISO 8601
  severity: 'info' | 'warn' | 'error' | 'debug',
  service: 'glorov-backend',
  environment: string,     // NODE_ENV
  correlation_id: string,  // Request-scoped
  operation: string,       // e.g., "POST /store/checkout/place-order"
  duration_ms?: number,    // For measured operations
  error_code?: string,     // Classified error code
  message: string,
  metadata?: Record<string, unknown>  // PII-redacted
}
```

---

## 3. Request Correlation

### requestCorrelationMiddleware
**File**: [`request-correlation.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/api/middlewares/request-correlation.ts) (63 lines)

| Feature | Status | Evidence |
|---|---|---|
| Accepts incoming `x-correlation-id` or `x-request-id` | ✅ PASS | L24-27 |
| Generates ID if none provided | ✅ PASS | L29 — `extractOrGenerateCorrelationId()` |
| Echoes ID in response header | ✅ PASS | L34 |
| Records start time for duration tracking | ✅ PASS | L31 |
| Automatic response logging on errors (≥400) and slow requests (>1s) | ✅ PASS | L42 |
| Metrics recording per request | ✅ PASS | L39 — `metricsCollector.recordRequest()` |

---

## 4. Operational Metrics

### MetricsCollector
**File**: [`metrics-collector.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/metrics-collector.ts) (239 lines)

| Metric | Tracked | Evidence |
|---|---|---|
| Total requests | ✅ | L65 |
| Total errors (4xx + 5xx) | ✅ | L69 |
| P95 latency (rolling 500 samples) | ✅ | L104-108 |
| Average latency | ✅ | L111-115 |
| Payment failures | ✅ | L84-86 |
| Shipment failures | ✅ | L88-90 |
| Webhook failures | ✅ | L92-94 |
| Notification failures | ✅ | L96-98 |
| Checkout errors | ✅ | L100-102 |
| Status code distribution | ✅ | L66 |
| Active alerts | ✅ | L117-201 |

### Alert Thresholds (configurable via env vars)
| Alert | Default | Severity |
|---|---|---|
| P95 latency > 2000ms | warning | `ALERT_LATENCY_P95_MS` |
| Error rate > 5% | critical | `ALERT_ERROR_RATE_PERCENT` |
| Payment failures ≥ 5/hr | critical | `ALERT_PAYMENT_FAILURE_THRESHOLD_HOURLY` |
| Shipment failures ≥ 3/hr | warning | `ALERT_SHIPMENT_FAILURE_THRESHOLD_HOURLY` |
| Webhook failures ≥ 5/hr | warning | `ALERT_WEBHOOK_FAILURE_THRESHOLD_HOURLY` |
| Notification failures ≥ 5/hr | warning | `ALERT_NOTIFICATION_FAILURE_THRESHOLD_HOURLY` |
| Checkout errors ≥ 9 | critical | `ALERT_CHECKOUT_RETRY_THRESHOLD * 3` |

---

## 5. Async Retry & Dead-Letter Queue

### withBoundedRetry
**File**: [`async-retry.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/async-retry.ts) (247 lines)

| Feature | Status | Evidence |
|---|---|---|
| Exponential backoff with jitter | ✅ PASS | L146-147 — `baseDelayMs * 2^(attempt-1) + random(0,100)`, capped at 3s |
| Max 3 retries (production), 1 in test | ✅ PASS | L90-91 |
| Non-retryable error detection | ✅ PASS | L58-80 — `INVALID_DATA`, `NOT_FOUND`, `NOT_ALLOWED`, pattern matching |
| Dead-letter record creation | ✅ PASS | L170-186 |
| Order metadata persistence | ✅ PASS | L207-238 — Writes `failed_async_jobs` to order metadata |
| Structured logging per attempt | ✅ PASS | L104-116, L130-142, L149-161, L192-204 |
| Metrics recording on permanent failure | ✅ PASS | L189 |

---

## 6. Issues Identified

| ID | Issue | Severity | Detail |
|---|---|---|---|
| **GLOROV-ERR-001** | **No external error reporting service** — Errors are logged to stdout/stderr only. No Sentry, Datadog, or similar APM integration. In production, errors may go unnoticed unless logs are actively monitored. | HIGH | No APM dependency in `package.json` |
| **GLOROV-ERR-002** | **Storefront error boundary only uses `console.error()`** — No structured error reporting from the Next.js frontend to any backend or monitoring service. | HIGH | [`error.tsx` L18](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/error.tsx#L18) |
| **GLOROV-ERR-003** | **Metrics are in-memory only** — `MetricsCollector` is a singleton that resets on process restart. No persistence to Redis, database, or external metrics service. | MEDIUM | [`metrics-collector.ts` L238](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/metrics-collector.ts#L238) |
| **GLOROV-ERR-004** | **Dead-letter records are in-memory** — `inMemoryDeadLetters` array loses data on restart. Order metadata backup may fail silently. | MEDIUM | [`async-retry.ts` L45](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/async-retry.ts#L45) |
| **GLOROV-ERR-005** | **No nested error boundaries** — Only root `error.tsx` exists. A failure in checkout or product pages will show the generic root error boundary instead of contextual recovery. | LOW | `apps/storefront/src/app/` |
| **GLOROV-ERR-006** | **Rate limiter uses in-memory fallback** — When Redis/cache is unavailable, rate limiting falls back to `Map<string, RateLimitRecord>()` which is per-process. In multi-process PM2, limits aren't shared. | MEDIUM | [`rate-limiter.ts` L16](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/api/middlewares/rate-limiter.ts#L16) |

---

## 7. Overall Error Handling Verdict

> [!TIP]
> Backend error handling is **exceptionally well-designed** — centralized sanitization, structured logging, PII redaction, correlation IDs, bounded retries with dead-letter queuing, and configurable alert thresholds. The main gaps are external integration (no APM/Sentry) and persistence (in-memory metrics and dead-letter records).
