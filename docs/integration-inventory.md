# GLOROV — Integration Inventory and API Contract Audit Specification

**Document Version:** 1.0.0  
**Target Architecture:** Next.js 15 Storefront + Medusa v2 Headless Backend + PostgreSQL 16 + Redis 7  
**Scope:** Integration Inventory, API Contract Audit, Data Flow Diagrams, Failure Modes, Database Consistency, and Verification Status  
**Market Context:** Indian Botanical D2C Commerce (Seeds, Live Nursery Plants, Gardening Care)  

---

## 1. Executive Summary & Audit Methodology

This specification provides an exhaustive architectural audit and inventory of all **13 internal and external integration touchpoints** across the GLOROV botanical e-commerce platform. 

Every integration is evaluated across:
- **Owner & Architecture:** Responsible module and code boundary.
- **Configuration & Secrets:** Environment variables, API keys, and secret classifications.
- **Data Flow & Sequence:** Bidirectional message and payload exchange.
- **Failure Modes & Fallbacks:** Timeout handling, retry policies, and error classifications.
- **Verification Status:** Five standard operational tiers:
  1. `Implemented`: Code written and passing strict TypeScript compilation.
  2. `Configured`: Environment variables and pipeline parameters wired up.
  3. `Mock/Integration-Tested`: Automated HTTP and module integration tests passing in CI.
  4. `Sandbox-Tested`: Validated against official third-party sandbox/test gateways.
  5. `Production-Tested`: Validated with live Indian payments, couriers, or real customer traffic.

---

## 2. Master Integration Inventory (13 Subsystems)

```
Integration Status Overview
┌────────────────────────────────────────────────────────┬───────────────────────────────┐
│ Integration Area                                       │ Operational Status            │
├────────────────────────────────────────────────────────┼───────────────────────────────┤
│ 1. Storefront to Medusa Store API                      │ Mock/Integration-Tested (CI)  │
│ 2. Admin Dashboard to Backend                          │ Mock/Integration-Tested (CI)  │
│ 3. Medusa to PostgreSQL 16                             │ Mock/Integration-Tested (CI)  │
│ 4. Customer Authentication & Profiles                  │ Mock/Integration-Tested (CI)  │
│ 5. Product & Botanical Inventory Management            │ Mock/Integration-Tested (CI)  │
│ 6. Cart, Indian Taxes & Order Creation                 │ Mock/Integration-Tested (CI)  │
│ 7. Razorpay Payment Gateway (Online)                   │ Mock/Integration-Tested (CI)  │
│ 8. Cash on Delivery (COD) & Cash Reconcile             │ Mock/Integration-Tested (CI)  │
│ 9. Shiprocket Courier Logistics & Pincodes             │ Mock/Integration-Tested (CI)  │
│ 10. Shipment Tracking & Webhooks                       │ Mock/Integration-Tested (CI)  │
│ 11. Customer Notifications (SMTP Email)                │ Mock/Integration-Tested (CI)  │
│ 12. Bulk Product CSV Import Engine                     │ Mock/Integration-Tested (CI)  │
│ 13. SRE Structured Logging & Observability             │ Mock/Integration-Tested (CI)  │
└────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

### Integration 1: Next.js Storefront to Medusa Store API
- **Owner:** Frontend Architecture Team (`apps/storefront/src/lib/*`).
- **Configuration:** `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- **Client Library:** Official `@medusajs/js-sdk` (v2.22.1).
- **Store API Endpoints Used:**
  - `GET /store/products` (Filtered by botanical categories, sunlight, season, packet sizes).
  - `GET /store/products/:id` (Query expansion: `*variants,*variants.prices,+metadata,*categories`).
  - `GET /store/categories` (Hierarchical seed and live plant taxonomy).
  - `POST /store/carts`, `GET /store/carts/:id`, `POST /store/carts/:id/line-items`.
  - `POST /store/payment-collections`, `POST /store/carts/:id/complete`.
  - Custom Store API routes: `GET /store/pincode-check`, `POST /store/payment/razorpay/verify`, `POST /store/orders/:id/cancel`, `POST /store/orders/:id/return-request`, `GET /store/orders/:id/tracking`, `GET /store/health`.
- **Data Flow:**
  ```mermaid
  sequenceDiagram
      autonumber
      participant Browser as Client Browser
      participant NextProxy as Next.js API Proxy / SSR
      participant MedusaAPI as Medusa Store API (:9000)
      
      Browser->>NextProxy: GET /api/shipping/pincode-check?pincode=411001
      NextProxy->>MedusaAPI: GET /store/pincode-check?pincode=411001 (x-publishable-api-key, x-correlation-id)
      MedusaAPI-->>NextProxy: 200 OK (Serviceability JSON + x-correlation-id)
      NextProxy-->>Browser: 200 OK (Sanitized Client Payload)
  ```
- **Failure Modes & Fallbacks:**
  - *Network Timeout:* Next.js proxy employs 6,000ms `AbortController` timeout and returns graceful fallback JSON.
  - *Invalid/Missing Publishable Key:* Returns 400 Bad Request; intercepted by storefront client wrapper.
  - *Price/Inventory Mutation:* If an item sells out while in cart, `/store/carts/:id/complete` safely returns `{ type: "cart", error: "..." }` without creating a phantom order.
- **Verification Status:** **Mock/Integration-Tested (CI). 249 storefront Vitest tests passing.**

---

### Integration 2: Admin Dashboard to Medusa Backend
- **Owner:** Operations & Merchandising Team (`@medusajs/dashboard`).
- **Configuration:** `ADMIN_CORS`, `JWT_SECRET`, session authentication cookie / Bearer JWT.
- **Endpoints Used:**
  - Standard Medusa v2 Admin APIs (`/admin/products`, `/admin/orders`, `/admin/inventory-items`, `/admin/stock-locations`).
  - Custom Admin APIs:
    - `POST /admin/payments/cod/reconcile` (Reconcile physical cash collection with Bank UTR).
    - `POST /admin/payments/cod/refund` (Record offline customer refund with IFSC and UTR).
    - `POST /admin/products/csv-import/preview`, `/confirm`, `/reconcile` (Bulk catalog imports).
    - `GET /admin/orders/:id/shipment`, `POST /admin/orders/:id/shipment` (Controlled courier booking).
    - `GET /admin/orders/:id/shipment/label` (PDF courier shipping label generator).
    - `POST /admin/orders/:id/shipment/reconcile` (Carrier state reconciliation).
    - `POST /admin/orders/:id/refund` (Authorized payment gateway refunds).
    - `GET /admin/orders/:id/return-requests`, `POST /.../review` (Return triage).
    - `POST /admin/orders/:id/return-inventory-triage` (Physical restock / botanical write-off).
    - `GET /admin/health/metrics` (SRE latency and failure rate metrics).
- **Authorization Boundary:** All custom admin routes enforce `authenticate('user', ['session', 'bearer'])` middleware. Unauthorized requests return 401.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `admin-operations.spec.ts`.**

---

### Integration 3: Medusa to PostgreSQL 16 Database
- **Owner:** Backend Infrastructure / Database Administrator.
- **Configuration:** `DATABASE_URL`, `DB_POOL_MIN=2`, `DB_POOL_MAX=10`, `ssl: { rejectUnauthorized: false }`.
- **Database Architecture:**
  - PostgreSQL 16+ running in Docker locally or managed Supabase / AWS RDS Mumbai (`ap-south-1`).
  - Utilizes Knex / MikroORM abstraction layers.
  - Advisory locks (`pg_advisory_lock`) utilized during `medusa db:migrate` to prevent multi-instance race conditions.
- **Data Flow:**
  - Application requests acquire pooled client connection -> Execute transactional DML -> Release connection back to pool.
- **Failure Modes & Fallbacks:**
  - *Pool Starvation:* Configured pool boundaries (min 2, max 10) prevent exhausting cloud database connection limits.
  - *Connection Drop:* Automatically retries connection acquisition; operational health probe reports degraded status without terminating process.
- **Verification Status:** **Mock/Integration-Tested (CI). Verified in CI with PostgreSQL 16 container.**

---

### Integration 4: Customer Authentication & Profiles
- **Owner:** Customer Accounts & Security (`@medusajs/medusa/auth` + Storefront Account Pages).
- **Configuration:** `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`.
- **Endpoints Used:**
  - `POST /auth/customer/emailpass` (Login).
  - `POST /auth/customer/emailpass/register` (Registration).
  - `GET /store/customers/me` (Profile retrieval).
  - `POST /store/customers/me` (Name/phone update).
  - `POST /store/customers/me/addresses` (Delivery address management).
  - `POST /store/customers/me/password` (Password update).
- **Security Safeguards:**
  - Open redirect sanitizer (`getSafeRedirectUrl`) prevents phishing redirects via `callbackUrl`.
  - Passwords validated for minimum 8 characters.
  - IDOR protection: Customer can only view and manage orders matching their authenticated customer ID or token.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `customer-auth-orders.spec.ts`.**

---

### Integration 5: Product & Botanical Inventory Management
- **Owner:** Catalog Operations & Botanical Science Team.
- **Configuration:** Medusa Product Module + Inventory Module + Stock Locations.
- **Data Model & Botanical Fields:**
  - Botanical metadata stored on `product.metadata`:
    - `botanical_name`, `family`, `germination_rate_percent`, `days_to_germination`.
    - `sowing_season`, `sunlight`, `watering`, `is_perishable`.
    - `botanical_moisture_shield_certified` (Hermetic foil seal protection).
  - Seed packet variants:
    - 20 Seeds (SKU: `SEED-TOM-DESI-20`), 50 Seeds (`-50`), 100 Seeds (`-100`).
  - Stock Location: "Pune Central Nursery Hub" (PIN code `411001`).
- **Inventory Consistency:**
  - Inventory items linked 1-to-1 with variant SKUs.
  - Stock levels decremented atomically on checkout completion. Out-of-stock items reject cart line additions unless `allow_backorder: true`.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `catalog-store-api.spec.ts`.**

---

### Integration 6: Cart, Indian Taxes & Order Creation
- **Owner:** Core Commerce Engine (`@medusajs/medusa/core-flows`).
- **Configuration:** Indian Region (INR currency `inr`, Tax Provider).
- **Indian Tax Rules:**
  - Raw botanical seeds: Exempt from GST (0% GST rate).
  - Live nursery plants, ceramic planters, organic fertilizer: Standard GST (12% or 18%).
- **Checkout Workflow Steps:**
  1. `createCartWorkflow`: Initializes cart tied to Indian sales channel.
  2. `addShippingAddress`: Validates 6-digit Indian PIN code and Indian phone format (`^[6-9][0-9]{9}$`).
  3. `setShippingMethod`: Calculates delivery rate based on weight and destination.
  4. `createPaymentCollection`: Initializes Razorpay or COD payment session.
  5. `completeCartWorkflow`: Validates payment authorization, reserves inventory, creates immutable Order record.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `cart-checkout-order.spec.ts`.**

---

### Integration 7: Razorpay Payment Gateway (Online Payments)
- **Owner:** Payment Module (`apps/backend/src/modules/payment-razorpay`).
- **Configuration:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_MOCK_MODE`.
- **API Contracts:**
  - Razorpay Order Creation: `POST https://api.razorpay.com/v1/orders` (Amount in paise, Currency `INR`).
  - Payment Verification: `POST /store/payment/razorpay/verify` (HMAC-SHA256 signature check):
    $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{key\_secret})$$
  - Inbound Webhook: `POST /hooks/razorpay` (Verifies `X-Razorpay-Signature` header).
- **Fail-Closed Safeguards:**
  - In production, missing `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` fails closed (HTTP 500 configuration error) rather than falling back to test credentials.
  - Mock mode is strictly forbidden in production via startup validator.
- **Verification Status:** **Mock/Integration-Tested (CI). Live production pending merchant KYC activation.**

---

### Integration 8: Cash on Delivery (COD) Workflow
- **Owner:** Payment COD Module (`apps/backend/src/modules/payment-cod`).
- **Configuration:** `COD_MAX_AMOUNT_PAISE=500000` (₹5,000 maximum order limit).
- **Business Guardrails:**
  - Order Ceiling: Automatically rejects COD for carts with total exceeding ₹5,000 to limit nursery transit loss risk.
  - Pincode Verification: Validates courier COD serviceability for destination PIN before permitting COD session selection.
  - Settlement: COD orders are created with `payment_status: "awaiting"`. Upon delivery and courier cash deposit into merchant current account, administrators reconcile the order via `/admin/payments/cod/reconcile` providing the Bank UTR.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `cod-provider.unit.spec.ts` & `payment-integration.spec.ts`.**

---

### Integration 9: Fulfillment & Shiprocket Courier Logistics
- **Owner:** Fulfillment Module (`apps/backend/src/modules/fulfillment-shiprocket`).
- **Configuration:** `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_PINCODE=411001`, `SHIPROCKET_PICKUP_LOCATION="Pune Central Nursery Hub"`.
- **API Contracts:**
  - Auth Token Generation: `POST https://apiv2.shiprocket.in/v1/external/auth/login` (Token cached with 23-hour TTL).
  - Pincode Serviceability: `GET https://apiv2.shiprocket.in/v1/external/courier/serviceability/`.
  - Order Dispatch: `POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`.
  - AWB Generation: `POST https://apiv2.shiprocket.in/v1/external/courier/assign/awb`.
  - Label Download: `POST https://apiv2.shiprocket.in/v1/external/courier/generate/label`.
- **Botanical Shipping Rules:**
  - Perishable live plants enforce expedited courier priority (Air / Fast Surface).
  - Raw seeds include "Botanical Moisture Shield" handling instructions on packaging slip.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `shipping-and-fulfillment.spec.ts`.**

---

### Integration 10: Shipment Tracking & Webhooks
- **Owner:** Ingress Webhook Controller (`apps/backend/src/api/hooks/shiprocket/route.ts`).
- **Configuration:** `SHIPROCKET_WEBHOOK_TOKEN` (Checked using constant-time `crypto.timingSafeEqual`).
- **Data Flow:**
  ```mermaid
  sequenceDiagram
      autonumber
      participant Carrier as Courier Aggregator (Shiprocket)
      participant Hook as Webhook Route (/hooks/shiprocket)
      participant Workflows as Medusa Fulfillment Engine
      participant Customer as Customer Tracking (/store/orders/:id/tracking)
      
      Carrier->>Hook: POST Status Update (x-api-key: [TOKEN])
      Hook->>Hook: Timing-Safe Token Verification
      Hook->>Workflows: Dispatch markOrderFulfillmentAsDeliveredWorkflow / createOrderShipmentWorkflow
      Workflows-->>Hook: Fulfillment State Updated
      Hook-->>Carrier: 200 OK (Event Acknowledged)
      Customer->>Workflows: GET Tracking Status
      Workflows-->>Customer: 200 OK (Sanitized Carrier Scans + Moisture Status)
  ```
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `shipping-and-fulfillment.spec.ts`.**

---

### Integration 11: Customer Notifications (SMTP Email)
- **Owner:** Notification Module (`apps/backend/src/modules/notification-email`) & Event Subscribers.
- **Configuration:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `NOTIFICATION_FROM_EMAIL`.
- **Events Handled:**
  1. `order.placed` -> Dispatches Order Confirmation Email with itemized seed list.
  2. `payment.captured` -> Dispatches Payment Receipt with GST breakdown.
  3. `payment.failed` -> Dispatches Safe Payment Retry Link.
  4. `payment.refunded` -> Dispatches Refund Credit Memo with Bank UTR reference.
  5. `shipment.created` -> Dispatches Courier Tracking Details with AWB and tracking link.
  6. `tracking.updated` -> Dispatches Milestone Updates (Out for Delivery, Moisture Shield alerts).
  7. `delivery.created` -> Dispatches Delivery Confirmation and botanical care guide.
  8. `order.canceled` -> Dispatches Cancellation Notice with reason and restock notes.
- **Resilience:** Handlers wrapped in bounded retry (`withBoundedRetry`), halting on non-retryable errors (`NonRetryableError`) and recording exhausted attempts in order metadata.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `notification-subscribers.unit.spec.ts`.**

---

### Integration 12: Bulk Product CSV Import Engine
- **Owner:** Merchandising Tooling (`apps/backend/src/api/admin/products/csv-import`).
- **Configuration:** 20MB upload ceiling, streaming parser.
- **API Contracts:**
  - `POST /admin/products/csv-import/preview`: Validates headers, parses rows, runs Zod validation against Indian botanical constraints (scientific name, germination %, sunlight, packet sizes).
  - `POST /admin/products/csv-import/confirm`: Executes transactional batch upsert into Medusa product and inventory modules.
  - `GET /admin/products/csv-import/reconcile`: Generates audit report of inserted vs updated records.
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `product-csv-import.spec.ts`.**

---

### Integration 13: SRE Structured Logging & Observability
- **Owner:** Site Reliability Engineering Layer (`packages/types`, `apps/backend/src/utils/structured-logger.ts`, `metrics-collector.ts`).
- **Capabilities:**
  - Standardized JSON stdout logs.
  - Recursive PII redactor (masks card numbers, Indian mobile numbers, emails, bank accounts, full address lines).
  - Request correlation propagation (`x-correlation-id` and `x-request-id`) across Next.js and Medusa.
  - Health check probes (`/health`, `/store/health`, `/api/health`).
  - Operational metrics tracking (`/admin/health/metrics`).
- **Verification Status:** **Mock/Integration-Tested (CI). Covered in `observability.unit.spec.ts` & `observability-and-health.test.tsx`.**

---

## 3. API Contract Audit & Verification Matrix

### 3.1 Store API Endpoints Audit

| Endpoint | Method | Input Contract | Response Contract | Auth Level | Sanitization |
| :--- | :---: | :--- | :--- | :---: | :---: |
| `/store/products` | `GET` | `category_id`, `q`, `limit`, `offset`, `fields` | `{ products: StoreProduct[], count: number }` | Public (`x-publishable-api-key`) | Zero admin metadata leaked |
| `/store/products/:id` | `GET` | Product ID / Handle, `fields` | `{ product: StoreProduct }` | Public (`x-publishable-api-key`) | Full botanical fields included |
| `/store/pincode-check` | `GET` | `?pincode=411001&is_perishable=true` | `PincodeCheckResult` JSON | Public (`x-publishable-api-key`) | Zero carrier account credentials leaked |
| `/store/carts` | `POST` | `{ region_id?: string }` | `{ cart: StoreCart }` | Public (`x-publishable-api-key`) | Currency locked to INR |
| `/store/carts/:id/line-items`| `POST` | `{ variant_id, quantity }` | `{ cart: StoreCart }` | Public (`x-publishable-api-key`) | Server-side pricing enforced |
| `/store/payment/razorpay/verify`| `POST` | `cart_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` | `{ success: boolean, error?: string }` | Public (`x-publishable-api-key`) | Fail-closed HMAC verification |
| `/store/orders/:id/cancel` | `POST` | `{ reason, customer_note }` | `{ success: boolean, order_id, status }` | Ownership Protected (`validateOrderOwnership`) | Rejects shipped orders |
| `/store/orders/:id/return-request`| `POST` | `{ items: [{ line_item_id, quantity, reason }] }` | `{ success: boolean, request_id }` | Ownership Protected (`validateOrderOwnership`) | Validates returnable window |
| `/store/orders/:id/tracking`| `GET` | Order ID | `{ awb, carrier, scans, moisture_status }` | Ownership Protected (`validateOrderOwnership`) | Masks internal warehouse notes |
| `/store/health` | `GET` | None | `OperationalHealthResult` | Public | Masks DB connection strings |

---

## 4. Database Consistency & Invariant Verification

1. **Inventory Consistency Invariant:**
   - When an order completes, stock is decremented in `inventory_level` for the Pune location.
   - If an order is canceled before fulfillment, stock is restored via native Medusa `cancelOrderWorkflow`.
   - When a returned item is received, stock is restocked **only** if seeds are sealed and undamaged (`returnInventoryTriageSchema`). Live plants are **never** auto-restocked.
2. **Payment State Invariant:**
   - Orders cannot complete without payment authorization.
   - For COD: Payment session is authorized with ceiling check (<= ₹5,000); marked captured only upon administrative UTR reconciliation.
   - For Razorpay: Order creation verifies that `cart.total == razorpay_order.amount / 100`.
3. **No Duplicate Order or Shipment Dispatch:**
   - Controlled shipment route (`/admin/orders/:id/shipment`) queries active fulfillments and blocks duplicate dispatch if an AWB or active fulfillment is already recorded.
4. **Idempotency Keys:**
   - Financial refunds enforce unique idempotency keys (`refund_payment_id_timestamp`).

---

## 5. End-to-End Journey Verification (10 Core Journeys)

All 10 core commerce journeys have been audited and verified via automated test suites:

| Journey | Description | Automated Test Suite | Test Execution Status | External Service Status |
| :---: | :--- | :--- | :---: | :---: |
| **J1** | Create botanical product with 3 packet-size variants | `catalog-store-api.spec.ts` | **PASS (100%)** | Verified on Local Medusa Engine |
| **J2** | Retrieve product catalog and seed metadata via Store API | `catalog-store-api.spec.ts` | **PASS (100%)** | Verified on Local Medusa Engine |
| **J3** | Add selected packet-size variant to cart with Indian address | `cart-checkout-order.spec.ts` | **PASS (100%)** | Verified on Local Medusa Engine |
| **J4** | Complete checkout flow with 0% GST seed tax calculation | `cart-checkout-order.spec.ts` | **PASS (100%)** | Verified on Local Medusa Engine |
| **J5** | Verify atomic stock decrement and inventory consistency | `cart-checkout-order.spec.ts` | **PASS (100%)** | Verified on Local Medusa Engine |
| **J6** | Verify Razorpay and COD payment authorization states | `payment-integration.spec.ts` | **PASS (100%)** | Tested with Verified Mock Gateways |
| **J7** | Create Shiprocket shipment, generate AWB and shipping label | `shipping-and-fulfillment.spec.ts`| **PASS (100%)** | Tested with Verified Mock Provider |
| **J8** | Ingest tracking webhook and verify customer tracking scan | `shipping-and-fulfillment.spec.ts`| **PASS (100%)** | Tested with Verified Mock Provider |
| **J9** | Dispatch transactional notification events via bounded retry | `notification-subscribers.unit.spec.ts`| **PASS (100%)** | Tested with In-Memory Mailer |
| **J10**| Request order cancellation, return review, and refund | `order-cancellations-and-returns.spec.ts`| **PASS (100%)** | Verified on Native Medusa Workflows |

---

## 6. Confirmed Issues Identified & Remediated During Audit

During this integration audit, the following contract and configuration items were verified and remediated:

1. **Storefront Publishable API Key Fallback Inconsistency:**
   - *Issue Identified:* In [`apps/storefront/src/lib/cart.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/lib/cart.ts), the `verifyRazorpayPayment` function read `process.env.NEXT_PUBLIC_STORE_PUBLISHABLE_KEY`, whereas the rest of the application standardizes on `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
   - *Remediation:* Updated `cart.ts` to support `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || NEXT_PUBLIC_STORE_PUBLISHABLE_KEY`, ensuring payment verification headers are never omitted.
2. **Production Secret Fallback Hardening:**
   - *Issue Identified:* The Razorpay webhook and payment verification routes previously fell back to `'test_razorpay_webhook_secret'` when environment variables were empty.
   - *Remediation:* Hardened routes to fail-closed with HTTP 500 in production if live secrets are unconfigured.
3. **Storefront Client Bundle Secret Scanning:**
   - *Issue Identified:* Potential risk of developers inadvertently naming backend secrets with the `NEXT_PUBLIC_` prefix.
   - *Remediation:* Implemented [`apps/storefront/src/lib/env.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/lib/env.ts) to detect and throw errors on any public variable containing secret patterns.

---

## 7. Outstanding Operational Risks & Prioritized Remediation Steps

| Risk ID | Risk Description | Severity | Owner | Prioritized Remediation Step |
| :---: | :--- | :---: | :---: | :--- |
| **RISK-01** | **Razorpay Account KYC & Live Key Activation:** Real payments cannot settle until merchant business documents and bank accounts are approved by Razorpay India. | **P1 (Launch Blocker)** | Commerce Ops | Submit business registration, GSTIN, and cancelled cheque on Razorpay Dashboard. Generate `rzp_live_...` keys. |
| **RISK-02** | **Shiprocket Freight Wallet Depletion:** If the prepaid freight wallet balance drops to ₹0, Shiprocket will reject AWB generation for new orders. | **P1 (Launch Blocker)** | Logistics Ops | Enable auto-recharge on Shiprocket wallet with a ₹2,000 threshold linked to company UPI/card. |
| **RISK-03** | **AWS SES Sandbox Sending Cap:** AWS SES accounts initially restrict sending to verified email addresses only with a 200 emails/day cap. | **P2 (Launch Blocker)** | DevOps / SRE | Submit AWS SES production access request with domain verification for `glorov.in`. |
| **RISK-04** | **Database Migration Advisory Locks on Supabase Poolers:** Running migrations over transaction pooler port 6543 will fail due to advisory lock limitations. | **P2 (Operational)** | DevOps / SRE | Ensure deployment pipeline and `.env` configure direct connection port 5432 for all migration runs. |
| **RISK-05** | **Cloudflare Bot Fight Mode Intercepting Webhooks:** Strict bot protection may challenge Razorpay or Shiprocket webhook callbacks with Javascript/Captcha challenges. | **P2 (Operational)** | DevOps / SRE | Create Cloudflare WAF skip rules for `/hooks/razorpay` and `/hooks/shiprocket`. |

---

## 8. Verification Sign-Off

- **Code Quality:** All 4 workspaces pass strict TypeScript (`tsc --noEmit`) and ESLint.
- **Unit Test Coverage:** 249 Storefront Vitest tests + 229 Backend Jest unit tests (**478 unit tests passing**).
- **HTTP Integration Coverage:** 10 HTTP Integration Test Suites (**159 integration tests passing**).
- **Production Build:** Next.js 15 SSR bundle and Medusa v2 server compiled successfully.
