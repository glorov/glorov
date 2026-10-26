# GLOROV — Site Reliability Engineering, Observability & Error Handling Specification

**Document Version:** 1.0.0  
**Target Architecture:** Next.js Storefront + Medusa v2 Headless Backend + PostgreSQL + Redis  
**Scope:** Distributed Structured Logging, Sensitive Data Redaction, Request Correlation, Error Sanitization, Health Checks, Affordable Monitoring, and Operational Runbooks  

---

## 1. Executive Summary & Reliability Philosophy

GLOROV delivers high-viability botanical seeds, live plants, organic fertilizers, and garden accessories across all 28 Indian States and 8 Union Territories. Because living botanical products are perishable and time-sensitive, operational blind spots directly translate into dead plants, failed deliveries, and lost customer trust.

Traditional e-commerce platforms often suffer from two operational extremes:
1. **Silent Failures:** Swallowing errors without structured tracking, leaving engineers to diagnose payment or delivery issues via angry customer support emails.
2. **Security & PII Leaks:** Dumping raw request payloads, stack traces, and database connection strings into logs, exposing customer names, phone numbers, addresses, and payment tokens.

GLOROV implements an enterprise-grade, SRE-first observability architecture tailored for modern Indian D2C e-commerce:
- **Zero-Secret Disclosure:** Guaranteed redaction of customer PII, Indian mobile numbers, bank account numbers, passwords, API secrets, and payment tokens.
- **End-to-End Request Correlation:** Deterministic `x-correlation-id` propagation across Storefront (Next.js), Backend (Medusa v2), and external gateways (Razorpay, Shiprocket).
- **Graceful Failure Isolation:** Operational health checks that distinguish process liveness from external third-party hiccups, eliminating orchestrator restart storms.
- **Affordable Telemetry:** SRE recommendations engineered for Indian startups with zero-to-low infrastructure overhead (Grafana Cloud, Sentry, UptimeRobot, and webhook alerts).

---

## 2. Structured Logging Schema & Conventions

### 2.1 Standard JSON Format
All backend services and background subscribers emit machine-parseable JSON logs in production. Standardizing logs into single-line JSON allows cost-effective ingestion into Loki, Signoz, CloudWatch, or Datadog without custom regex parsing.

```json
{
  "timestamp": "2026-10-26T16:21:17.917Z",
  "severity": "info",
  "service": "glorov-backend",
  "environment": "production",
  "correlation_id": "glr_afaf0d89-8271-4a62-8526-575a9e603478",
  "operation": "checkout.payment_capture",
  "message": "Payment verified for Order ord_01HXYZ: captured 129900 paise",
  "duration_ms": 142,
  "metadata": {
    "order_id": "ord_01HXYZ",
    "display_id": 1042,
    "provider": "razorpay",
    "email": "c***r@b***.in",
    "pincode": "411001",
    "card_token": "[REDACTED]"
  }
}
```

### 2.2 Core Schema Fields
| Field | Type | Description |
|---|---|---|
| `timestamp` | ISO-8601 String | UTC timestamp when the log entry was emitted. |
| `severity` | String | Log level: `debug`, `info`, `warn`, or `error`. |
| `service` | String | Service identifier: `glorov-backend` or `glorov-storefront`. |
| `environment` | String | Deployment environment: `production`, `staging`, `test`, or `development`. |
| `correlation_id` | String | Distributed tracing ID linking storefront request to backend workflows. |
| `operation` | String | Dot-notated functional domain (e.g. `pincode.check`, `payment.capture`). |
| `duration_ms` | Number (Optional) | Execution latency in milliseconds for performance profiling. |
| `error_code` | String (Optional) | Safe categorized error code (e.g. `DATABASE_UNAVAILABLE`). |
| `message` | String | Human-readable explanation of the operational event. |
| `metadata` | Object | Safe, redacted key-value context. |

### 2.3 Using Structured Logger in Medusa v2
Backend services and routes access the structured logger directly from the Medusa container or scope:

```typescript
import { getStructuredLogger } from '../utils/structured-logger'

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const correlationId = (req as any).correlationId
  const logger = getStructuredLogger(req.scope, correlationId)

  await logger.measure('pincode_serviceability_check', async () => {
    logger.info('pincode.lookup', 'Validating dispatch pin code', { pincode })
    // Business logic...
  })
}
```

---

## 3. PII & Secret Redaction Engine

### 3.1 Strict Security Invariants
In accordance with the Digital Personal Data Protection Act (DPDPA 2023) and RBI payment security guidelines, GLOROV enforces recursive redaction before any metadata touches disk, memory buffers, or remote log forwarders.

### 3.2 Redaction Rules Table
| Data Category | Target Fields / Patterns | Redaction Behavior | Example Output |
|---|---|---|---|
| **Credentials & Secrets** | `password`, `pwd`, `secret`, `token`, `jwt`, `api_key`, `key_secret`, `webhook_secret` | Replaced with static tag | `"[REDACTED]"` |
| **Card Data** | `card_number`, `cardNumber`, `pan` | Mask all except last 4 digits | `"************4444"` |
| **Card Verification** | `cvv`, `cvc`, `security_code` | Stripped completely | `"[REDACTED]"` |
| **Customer Email** | `email`, `customer_email`, `to` | Mask username & domain host; retain 1st/last chars & TLD | `"s***v@e***.com"` |
| **Indian Mobile Numbers** | `phone`, `mobile`, `contact_number` | Mask all except last 4 digits | `"******3210"` |
| **Bank Account Numbers** | `account_number`, `bank_account` | Mask all except last 4 digits | `"XXXXXX9012"` |
| **Customer Street Address** | `address_1`, `address_2`, `street`, `line1`, `line2` | Stripped to protect home location; retains city, state, PIN | `"[REDACTED_ADDRESS_LINE]"` |
| **HTTP Authorization** | String starting with `Bearer ...` or standalone JWT | Token sanitized | `"Bearer [REDACTED_TOKEN]"` |
| **Circular References** | Self-referencing JavaScript objects | Detected via `WeakSet` | `"[CIRCULAR_REF]"` |
| **Deep Recursion** | Nesting depth > 8 levels | Terminated | `"[DEPTH_LIMIT]"` |

---

## 4. Request Correlation & Distributed Tracing

### 4.1 Trace Context Propagation
Every customer interaction is assigned an immutable correlation ID that flows downstream:

```
[Storefront Client]
  │  x-correlation-id: glr_123e4567-e89b-12d3-a456-426614174000
  ▼
[Next.js Storefront /api/shipping/*]
  │  (Forwards incoming header or creates new via extractOrGenerateCorrelationId)
  ▼
[Medusa v2 Backend /store/* or /admin/*]
  │  (requestCorrelationMiddleware sets response header & attaches to req.correlationId)
  ├──────────────────────────────┐
  ▼                              ▼
[Subscribers & Background Jobs] [External Gateway Calls]
  │                               │ Razorpay: notes.correlation_id
  │ Async bounded retry tracking  │ Shiprocket: custom_order_id / tracking tags
  ▼
[Audit & Dead-Letter Log]
```

### 4.2 Correlation ID Format Validation
- **Regex:** `/^[a-zA-Z0-9_\-]+$/`
- **Length:** Min 8 characters, Max 64 characters.
- **Default Prefix:** `glr_` followed by cryptographically random RFC 4122 v4 UUID.
- **Injection Defense:** IDs containing whitespace, semicolons, brackets, or angle brackets (`<script>`) are automatically rejected and replaced with freshly minted valid UUIDs.

---

## 5. Standardized Safe Error Handling Matrix

### 5.1 Error Classification & Response Schema
When an error occurs, `sendSanitizedError()` classifies the exception, records internal diagnostics to the structured logger, and returns a safe payload to the client.

```json
{
  "success": false,
  "code": "DATABASE_UNAVAILABLE",
  "message": "Database service is temporarily unavailable. Please retry your request shortly.",
  "error": "Database service is temporarily unavailable. Please retry your request shortly.",
  "correlation_id": "glr_123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2026-10-26T16:21:17.917Z"
}
```

### 5.2 Error Classification Matrix
| Root Cause / Pattern | Error Code | HTTP Status | Client Message | Internal Diagnostic Action |
|---|---|---|---|---|
| PostgreSQL connection timeout, pool exhaustion, `ECONNREFUSED` | `DATABASE_UNAVAILABLE` | **503** | "Database service is temporarily unavailable. Please retry your request shortly." | Log pool state, alert SRE if > 3 occurrences in 5m. |
| SQL syntax error, relation does not exist, constraint violation | `DATABASE_QUERY_ERROR` | **500** | "A database transaction could not be completed. Please try again." | Log full SQL error internally; NEVER leak schema/table names to client. |
| Razorpay network timeout / `ETIMEDOUT` | `PAYMENT_GATEWAY_TIMEOUT` | **504** | "Payment service took too long to respond. Please verify your payment status before retrying." | Record payment failure metric, log timeout duration. |
| Insufficient funds, card declined, invalid UPI PIN | `PAYMENT_AUTHORIZATION_FAILED` | **400** | "Payment authorization could not be completed. Please check your payment details or try an alternate method." | Log provider error code without storing customer card details. |
| Razorpay HMAC signature mismatch | `INVALID_SIGNATURE` | **401** | "Invalid cryptographic verification signature. Request rejected." | Log potential tampering attempt with source IP. |
| Shiprocket API unreachable / 502 Bad Gateway | `LOGISTICS_PROVIDER_ERROR` | **502** | "Logistics provider service is temporarily unavailable. Your request could not be completed." | Fall back to cached PIN code estimates; avoid process crash. |
| Rate limit exceeded (IP / Session) | `RATE_LIMIT_EXCEEDED` | **429** | "Too many requests. Please wait a moment before trying again." | Return `Retry-After: 60` header. |
| Missing or invalid required fields (Zod) | `VALIDATION_ERROR` | **400** | Sanitized validation failure message | Return structured field errors. |
| Missing session token / unauthenticated | `UNAUTHORIZED` | **401** | "Authentication required to perform this action." | Prompt client login modal. |
| Horizontal privilege escalation attempt | `FORBIDDEN` | **403** | "Unauthorized access: you do not have permission to access this resource." | Log actor ID vs requested resource ID. |
| Unknown order / product ID | `NOT_FOUND` | **404** | "The requested resource was not found." | Return safe 404 envelope. |
| Duplicate cancellation / return submission | `CONFLICT` | **409** | "The operation conflicts with current resource state." | Return current state idempotently. |
| Malformed CSV / Formula injection | `CSV_IMPORT_ERROR` | **422** | "Product CSV import failed. Please check CSV format." | Return row number and specific column error. |

---

## 6. Operational Health & Readiness Checks

### 6.1 Architecture: Liveness vs. Readiness
Container orchestrators (Docker Swarm, Kubernetes, Coolify, or Render) require health checks to determine when to route traffic and when to restart unhealthy processes.

```
                  ┌──────────────────────┐
                  │ Orchestrator / Proxy │
                  └──────────┬───────────┘
                             │ Polls /store/health
                             ▼
         ┌───────────────────────────────────────┐
         │     GLOROV Backend Health Handler     │
         └───────┬───────────────────────┬───────┘
                 │                       │
     Postgres Query Check       External Dependencies Check
                 │              (Shiprocket / Razorpay / Redis)
                 ▼                       │
    ┌────────────────────────┐           ▼
    │ Database Unreachable?  │  ┌─────────────────────────────┐
    │ ➔ Ready: FALSE         │  │ 3rd Party Gateway Degraded? │
    │ ➔ HTTP Status: 503     │  │ ➔ Ready: TRUE               │
    │ (Traffic halted safely)│  │ ➔ HTTP Status: 200          │
    └────────────────────────┘  │ ➔ Overall Status: 'degraded'│
                                │ (PREVENTS RESTART CASCADES!)│
                                └─────────────────────────────┘
```

### 6.2 Endpoint Reference
1. **Public Storefront Health (`/store/health`):**
   - Unauthenticated.
   - Evaluates Node process event loop, PostgreSQL pool connectivity, Redis cache, and external gateway configuration.
   - Response when fully operational (HTTP 200):
     ```json
     {
       "status": "healthy",
       "ready": true,
       "service": "glorov-backend",
       "environment": "production",
       "timestamp": "2026-10-26T16:21:17.917Z",
       "components": {
         "process": { "status": "healthy", "latency_ms": 1, "message": "Node.js event loop responding normally" },
         "database": { "status": "healthy", "latency_ms": 3, "message": "PostgreSQL connection pool responsive" },
         "cache": { "status": "healthy", "message": "In-memory LRU cache active" },
         "payment_gateway": { "status": "healthy", "message": "Razorpay gateway configured" },
         "shipping_provider": { "status": "healthy", "message": "Shiprocket aggregator configured" }
       }
     }
     ```
2. **Admin Operational Telemetry (`/admin/health/metrics`):**
   - Authenticated via Medusa Admin token.
   - Exposes request counts, P95 latency, error rates, failure counters, and active alert rules for Prometheus scraping or internal dashboards.
3. **Storefront Process Health (`/api/health`):**
   - Evaluates Next.js runtime memory, process uptime, and calls backend health. Returns status `degraded` if backend is recovering without tearing down the Next.js container.

---

## 7. Asynchronous Job Resilience & Dead-Letter Auditing

### 7.1 Bounded Retries with Exponential Backoff
All background subscribers (`order-placed`, `shipment-created`, `delivery-created`, `tracking-updated`, `payment-captured`, `payment-failed`, `payment-refunded`) execute through `withBoundedRetry()`.

```typescript
const retryResult = await withBoundedRetry(
  async () => {
    return await notificationModule.createNotifications({ ... })
  },
  {
    subscriberName: 'ShipmentCreatedSubscriber',
    eventName: 'shipment.created',
    resourceId: targetOrder.id,
    resourceType: 'order',
    container,
  }
)
```

### 7.2 Retry Mechanism Invariants
1. **Bounded Execution:** Maximum 3 attempts in production with exponential backoff (`delay = baseDelayMs * 2^(attempt - 1) + jitter`).
2. **Non-Retryable Short-Circuit:** Fatal errors (`Invalid customer email`, `Order not found`, `Missing phone number`) are never retried, saving compute cycles and avoiding rate-limiting third-party APIs.
3. **Dead-Letter Audit Trail:** When retries are exhausted:
   - A structured dead-letter event (`PERMANENT_ASYNC_FAILURE`) is logged with full correlation details.
   - If an order context exists, the dead letter is recorded into the order's metadata (`failed_async_jobs`) for seller dashboard triage.
   - The operational metrics collector increments `notification_failures_total`.

---

## 8. Affordable Monitoring & Alerting Guide for Indian D2C Businesses

Small-to-medium Indian e-commerce businesses cannot justify expensive enterprise observability subscriptions ($1,000–$5,000/month for Datadog or New Relic). GLOROV is configured to run on an ultra-affordable stack costing **under ₹1,500/month ($18/mo)** or **100% free** using generous developer tiers.

### 8.1 Recommended Tooling Stack
| Layer | Tool | Cost | Why it fits Indian D2C |
|---|---|---|---|
| **Uptime & Heartbeat** | Better Uptime / UptimeRobot | **Free** (50 monitors) | Pings `/store/health` and `/api/health` every 1 minute. Sends instant SMS/email when backend is down. |
| **Error Tracking** | Sentry (Developer Tier) | **Free** (5K errors/mo) | Deep exception capture for Next.js storefront and Medusa backend with breadcrumbs and release tracking. |
| **Log Management** | Grafana Cloud (Loki) | **Free** (50GB logs/mo) | Ingests single-line JSON structured logs directly via Promtail or Docker logging driver. |
| **Metrics & APM** | Internal `/admin/health/metrics` + Grafana Cloud | **Free** (10K metrics) | Visualizes P95 latency, order creation rates, and Razorpay success ratios. |
| **Team Alerts** | Telegram Bot / Slack Webhook | **Free** | Instant notifications into founder/developer chat channels for high error rates or payment surges. |

### 8.2 Configurable Alert Thresholds
Configurable via environment variables without code modification:

| Variable | Default Value | Trigger Condition | Severity |
|---|---|---|---|
| `ALERT_LATENCY_P95_MS` | `2000` (2s) | P95 latency across last 100 requests exceeds 2,000ms | Warning |
| `ALERT_ERROR_RATE_PERCENT` | `5` (5%) | Error responses (4xx/5xx) exceed 5% of total traffic | Critical |
| `ALERT_PAYMENT_FAILURE_THRESHOLD_HOURLY` | `5` | More than 5 payment failures recorded within an hour | Critical |
| `ALERT_SHIPMENT_FAILURE_THRESHOLD_HOURLY` | `3` | More than 3 courier generation failures in an hour | Warning |
| `ALERT_NOTIFICATION_FAILURE_THRESHOLD_HOURLY` | `5` | More than 5 customer emails/SMS failed | Warning |
| `ALERT_CHECKOUT_RETRY_THRESHOLD` | `3` | Cart completion retried more than 3 times by same customer | Warning |

---

## 9. Operational Runbooks & Troubleshooting Guides

### Runbook 1: Spike in Payment Failures (Razorpay)
**Symptoms:** Alert `ElevatedPaymentFailures` triggered; customer reports of failed UPI transactions.  
**Diagnostic Steps:**
1. Check `/store/health` component `payment_gateway`.
2. Inspect structured logs filtered by `operation: "payment.capture"` and `severity: "error"`.
3. Verify if errors are concentrated on a specific Indian bank (e.g. HDFC/SBI netbanking downtime) vs Razorpay platform outage:
   - Check [Razorpay Status Page](https://status.razorpay.com).
   - If gateway timeout, verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` credentials have not expired.
4. **Resolution:**
   - If single bank outage: customer-facing error boundary automatically suggests alternate UPI/card method.
   - If Razorpay outage: enable Cash on Delivery (COD) banner on storefront announcement bar.

### Runbook 2: Logistics & Shiprocket Dispatch Failures
**Symptoms:** Alert `ShipmentFailuresHigh` triggered; orders stuck in `processing` fulfillment state.  
**Diagnostic Steps:**
1. Filter logs by `operation: "ShiprocketFulfillmentService"` and check HTTP status codes.
2. If `401 Unauthorized`: Shiprocket 24-hour JWT token expired and automatic token cache failed to refresh. Restart backend or verify `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`.
3. If `422 Unserviceable`: inspect `pincode` in metadata. Verify whether address is remote or perishable plant restriction is blocking courier assignment.
4. **Resolution:**
   - For temporary Shiprocket API downtime: `withBoundedRetry` automatically buffers dispatch.
   - Admin can manually trigger AWB generation from Admin Order Details using alternate courier.

### Runbook 3: Database Connection Pool Exhaustion
**Symptoms:** `/store/health` returns HTTP 503 (`status: "unhealthy"`); requests timing out after 5,000ms.  
**Diagnostic Steps:**
1. Query PostgreSQL active connections:
   ```sql
   SELECT count(*), state FROM pg_stat_activity GROUP BY state;
   ```
2. Verify if pool limit in `medusa-config.js` (`min: 2, max: 20`) is saturated by long-running transactions.
3. Check for unindexed search queries or runaway subscriber loops.
4. **Resolution:**
   - Terminate idle-in-transaction connections:
     ```sql
     SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < current_timestamp - INTERVAL '5 minutes';
     ```
   - Restart container if connection pool deadlocks.

### Runbook 4: Product CSV Import Validation Failures
**Symptoms:** Admin receives 422 error on CSV upload; import preview shows rejected rows.  
**Diagnostic Steps:**
1. Check `/admin/products/csv-import/preview` response for row-by-row error reasons.
2. Common causes:
   - Excel CSV containing formula characters (`=`, `+`, `-`, `@`) — automatically sanitized by GLOROV's RFC 4180 parser.
   - Missing required botanical attributes (`packet_size`, `sunlight_requirement`, `watering_frequency`).
   - Duplicate SKUs existing in database.
3. **Resolution:** Download rejected rows CSV, correct highlighted cells, and re-upload with `allow_inventory_updates: true`.

### Runbook 5: Asynchronous Notification Dead-Letter Triage
**Symptoms:** Customer did not receive tracking link or order confirmation email.  
**Diagnostic Steps:**
1. Open Admin Order page and inspect metadata key `failed_async_jobs`.
2. Inspect dead-letter record attributes: `subscriber_name`, `error_code`, `failed_at`.
3. Common causes: invalid customer email address (e.g. typos like `user@gmaill.comm`).
4. **Resolution:** Correct customer email in order details and trigger manual notification resend via Medusa Admin.

---

## 10. Verification & Test Evidence

The GLOROV observability framework is validated by an automated unit test suite (`apps/backend/src/__tests__/observability.unit.spec.ts`) covering:
1. **PII Masking & Redaction:** 100% of sensitive fields (passwords, tokens, CVVs, card PANs, street addresses, phone numbers, bank accounts) sanitized.
2. **Correlation IDs:** Strict RFC 4122 UUID validation and injection prevention.
3. **Error Classification:** Seamless mapping of database, payment, logistics, and auth failures to client-safe envelopes without diagnostic leakage.
4. **Bounded Retries & Dead Letters:** Verification of 3-attempt maximum, exponential backoff, non-retryable short-circuiting, and audit record creation.
5. **Operational Health:** HTTP 200 on healthy database, HTTP 503 on database disconnect with connection string protection, and isolation against third-party provider outages.
6. **Metrics & Alerting:** P95 latency calculation and threshold evaluation.
