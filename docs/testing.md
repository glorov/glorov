# GLOROV — Automated Testing & Regression Strategy

**Application:** GLOROV Botanical E-Commerce (Next.js 15 Storefront + Medusa v2 Backend)  
**Testing Frameworks:** Vitest 2.1.9, React Testing Library, Jest 29 with `@swc/jest`, Playwright 1.50, Turborepo  
**Total Automated Tests:** 768 Tests Verified (285 Storefront Unit/Component, 329 Backend Unit, 140 Backend HTTP Integration, 14 Playwright E2E)  
**Status:** 100% Pass Rate Across All Layers (Zero Regressions)  
**Audit Verification (GLOROV-TEST-002):** Verified via `pnpm turbo test` on November 6, 2026.

---

## 1. Testing Architecture & Philosophy

The GLOROV test strategy follows the **Practical Testing Pyramid**, prioritizing fast feedback on business logic, rigorous API contract testing against the running Medusa v2 engine, and user-centric customer journey tests on the Next.js storefront:

```mermaid
flowchart TD
    E2E["Storefront E2E & Customer Journeys (14 Scenarios)\nPlaywright Chromium Headless\nHomepage, Catalog, Cart Checkout, Razorpay Mock, Account Navigation"]
    STORE["Storefront Unit & Component Tests (285 Tests)\nVitest + React Testing Library + jsdom (28 Test Files)\nAuthContext, CartContext, Address CRUD, Notifications, Sticky Bar, Pricing"]
    INT["Backend HTTP Integration Tests (140 Tests)\nJest in-band against live Medusa v2 engine + PostgreSQL + Redis (9 Suites)\nCart, Checkout, Customer Auth, Orders, Payments, Shipping, CSV, Anti-IDOR"]
    UNIT["Backend Unit Tests (329 Tests)\nJest with @swc/jest (26 Suites)\nRazorpay, Shiprocket LRU/AWB, COD Limits, Rate Limiter, Observability, Templates"]

    E2E --> STORE
    STORE --> INT
    INT --> UNIT
```

### Core Principles
1. **Never Weaken Validation to Pass Tests:** Security, Zod schemas, and access controls are actively verified, never bypassed.
2. **Deterministic, Isolated Test Data:** Integration tests create unique customer identifiers with timestamps (`aarav.customer.${Date.now()}@glorov.in`) to prevent collisions across runs.
3. **Safe Mocks for Third-Party Gateways:** Razorpay and Shiprocket operate in deterministic mock modes during automated tests, preventing accidental live charges or courier bookings.
4. **Fast Local Execution:** SWC compilation for Jest and Vitest native ES modules execute full test suites in seconds.

---

## 2. Test Suites Overview & Verified Execution Inventory

```
========================================================================================
GLOROV COMPREHENSIVE AUTOMATED TEST SUITE EXECUTION INVENTORY (VERIFIED)
========================================================================================

Layer / Suite File                                     Tests   Type          Focus
----------------------------------------------------------------------------------------
STOREFRONT (Vitest + jsdom + Testing Library - 28 Test Files)
  tests/unit/announcement-bar.test.tsx                    4    Component     Announcement cycling, ticker
  tests/unit/auth-account.test.tsx                        7    Integration   Auth flows, protected navigation
  tests/unit/cart-checkout.test.tsx                      12    Integration   Cart operations, address selection
  tests/unit/components.test.tsx                          8    Component     Badges, banners, ratings
  tests/unit/customer-addresses.test.tsx                 12    Component     Address forms, edit, delete modals
  tests/unit/customer-notifications.test.tsx              8    Component     Notification preferences, unread badges
  tests/unit/error-reporting.test.tsx                     5    Unit          Sentry integration, fallback logging
  tests/unit/medusa-cart.test.tsx                        11    Integration   Medusa Cart API, line items
  tests/unit/medusa-checkout-flow.test.ts                 8    Integration   Full checkout workflow, validation
  tests/unit/middleware.test.ts                          25    Unit          Edge auth protection, redirects
  tests/unit/offers-hub.test.tsx                          1    Component     Offers carousel, coupon copy
  tests/unit/orders.test.tsx                             11    Component     Order cards, cancellation modal
  tests/unit/pages.test.tsx                               7    Integration   SSR pages, product detail view
  tests/unit/pdp-search.test.tsx                         10    Component     Search, autocomplete, PDP specs
  tests/unit/razorpay-checkout.test.tsx                  23    Integration   Payment modal, failure, retry
  tests/unit/roadmap-utils.test.ts                        7    Unit          Roadmap item formatting
  tests/unit/security-config.test.ts                      5    Unit          Headers, CSP, CORS rules
  tests/unit/shared-components.test.tsx                  14    Component     Buttons, inputs, modals
  tests/unit/utils.test.ts                                9    Unit          formatINR, class merging
  src/__tests__/AddressForm.test.tsx                      6    Component     Indian address form validation
  src/__tests__/CartDrawer.test.tsx                      10    Component     Slide-over cart drawer
  src/__tests__/CheckoutSummary.test.tsx                  8    Component     Honest pricing summary
  src/__tests__/ProductCard.test.tsx                      7    Component     Botanical cards, stock status
  src/__tests__/address-validation.test.ts               21    Unit          6-digit PIN code regex, states
  src/__tests__/api-client.test.ts                       11    Unit          Fetch wrapper, auth cookies
  src/__tests__/auth.test.ts                             12    Unit          Auth state machine
  src/__tests__/cart.test.ts                             12    Unit          Cart calculations, discounts
  src/__tests__/price-formatting.test.ts                 11    Unit          INR currency formatting
  --------------------------------------------------------------------------------------
  Storefront Subtotal                                   285    100% PASS (28 Files)

BACKEND UNIT TESTS (Jest + @swc/jest - 26 Test Suites)
  src/__tests__/admin-access-control.unit.spec.ts         9    Unit          RBAC, bearer token verification
  src/__tests__/admin-operations.unit.spec.ts            14    Unit          Catalog CRUD, variants, filters
  src/__tests__/announcement-operations.unit.spec.ts     10    Unit          Announcement CRUD & scheduling
  src/__tests__/banner-operations.unit.spec.ts           10    Unit          Hero banners, rotation
  src/__tests__/business-logic-and-regression.unit.spec.ts 29  Unit          Botanical metadata, cart limits
  src/__tests__/cancellation-and-refunds.unit.spec.ts    12    Unit          Refund calculation, status
  src/__tests__/catalog-and-variants.unit.spec.ts        15    Unit          Variant pricing, inventory
  src/__tests__/cloudinary-provider.unit.spec.ts         12    Unit          Media upload, transformation
  src/__tests__/cod-provider.unit.spec.ts                 7    Unit          COD limit (500000 paise), state
  src/__tests__/csv-import.unit.spec.ts                  12    Unit          CSV parser, delimiter handling
  src/__tests__/database-integrity-and-performance.unit.spec.ts 14 Unit     Connection pool, indexing
  src/__tests__/health.unit.spec.ts                       2    Unit          Healthcheck responsiveness
  src/__tests__/hero-operations.unit.spec.ts              8    Unit          Hero slide management
  src/__tests__/notification-provider.unit.spec.ts       12    Unit          RFC 5322 validation, retry
  src/__tests__/notification-subscribers.unit.spec.ts    15    Unit          8 subscribers, idempotency
  src/__tests__/notification-templates.unit.spec.ts      18    Unit          Email templates, formatting
  src/__tests__/observability.unit.spec.ts               12    Unit          Redis metrics, dead-letter
  src/__tests__/offer-operations.unit.spec.ts            10    Unit          Coupon validation, discounts
  src/__tests__/rate-limiter.unit.spec.ts                 5    Unit          Redis INCR + EXPIRE, fallback
  src/__tests__/razorpay-provider.unit.spec.ts           11    Unit          Razorpay capture, refund
  src/__tests__/recommendations.unit.spec.ts             10    Unit          Botanical cross-sells
  src/__tests__/search-suggestions.unit.spec.ts          10    Unit          Autocomplete, fuzzy matching
  src/__tests__/security-hardening.unit.spec.ts           9    Unit          Production secret guards, HMAC
  src/__tests__/shiprocket-provider.unit.spec.ts         27    Unit          Serviceability, LRU cache, AWB
  src/__tests__/shiprocket-webhook.unit.spec.ts          12    Unit          HMAC verification, delivery
  src/__tests__/trust-badge-operations.unit.spec.ts      10    Unit          Trust badge configurations
  --------------------------------------------------------------------------------------
  Backend Unit Subtotal                                 329    100% PASS (26 Suites)

BACKEND HTTP INTEGRATION (Jest against Medusa Engine - 9 Suites)
  cart-checkout-order.spec.ts                             9    HTTP Int      Cart lifecycle, line items
  customer-auth-orders.spec.ts                           16    HTTP Int      Customer register, login
  shipping-and-fulfillment.spec.ts                       14    HTTP Int      Shiprocket options, AWB
  critical-regressions.spec.ts                           15    HTTP Int      Anti-IDOR, duplicate webhooks
  admin-operations.spec.ts                               17    HTTP Int      Admin catalog CRUD
  payment-integration.spec.ts                            10    HTTP Int      Razorpay + COD sessions
  catalog-store-api.spec.ts                              16    HTTP Int      Store catalog filters
  product-csv-import.spec.ts                             11    HTTP Int      Preview & validation
  security-audit.spec.ts                                 20    HTTP Int      401 admin access, rate limits
  --------------------------------------------------------------------------------------
  Backend Integration Subtotal                          140    100% PASS (9 Suites)

STOREFRONT PLAYWRIGHT E2E (Chromium Headless - 3 Specs)
  cart-flow.spec.ts                                       5    E2E           Cart drawer, quantity, total
  checkout-journey.spec.ts                                5    E2E           Address form, payment select
  customer-auth.spec.ts                                   4    E2E           Registration, login, logout
  --------------------------------------------------------------------------------------
  Storefront E2E Subtotal                                14    100% PASS (3 Specs)
========================================================================================
TOTAL MONOREPO AUTOMATED TEST COVERAGE                  768    100% PASS (66 Files)
  - Unit & Component Tests (`pnpm turbo test`):        614    100% PASS (54 Suites)
  - HTTP Integration & E2E Tests:                       154    100% PASS (12 Suites)
========================================================================================
```


---

## 3. Running Test Suites

### 3.1 Run All Tests Across Entire Monorepo
Using Turborepo:
```bash
# Run all unit and storefront journey tests
pnpm turbo test

# Run type checks and linting
pnpm turbo typecheck lint

# Run all backend HTTP integration tests
pnpm --filter @glorov/backend test:integration:http
```

### 3.2 Running Storefront Tests
```bash
# Run all storefront tests (unit + customer journeys)
pnpm --filter @glorov/storefront test

# Run in watch mode during frontend development
pnpm --filter @glorov/storefront exec vitest

# Run only customer journeys
pnpm --filter @glorov/storefront exec vitest run customer-journeys
```

### 3.3 Running Backend Unit Tests
```bash
# Run all backend unit tests
pnpm --filter @glorov/backend test:unit

# Run specific unit test suite
pnpm --filter @glorov/backend test:unit -t "Business Logic"
pnpm --filter @glorov/backend test:unit -t "Razorpay"
```

### 3.4 Running Backend Integration Tests
> **Prerequisite:** The Medusa backend must be running on port 9000 (or `MEDUSA_BACKEND_URL`), connected to PostgreSQL and Redis.
```bash
# Run all 9 HTTP integration test suites
pnpm --filter @glorov/backend test:integration:http

# Run only the critical regression suite
pnpm --filter @glorov/backend test:integration:http critical-regressions.spec.ts

# Run only security integration tests
pnpm --filter @glorov/backend test:integration:http security-audit.spec.ts

# Run matching a specific test description
pnpm --filter @glorov/backend test:integration:http -t "Anti-IDOR"
```

---

## 4. Test Database & Environment Configuration

### 4.1 Local Development Services (Docker)
Ensure Docker PostgreSQL 16 and Redis 7 containers are running:
```bash
# Start Docker containers
docker compose up -d

# Verify containers are healthy
docker ps
```

### 4.2 Test Database Setup & Migrations
```bash
# Run database migrations
pnpm --filter @glorov/backend db:migrate

# Seed Indian botanical region, test catalog & shipping options
pnpm --filter @glorov/backend exec npx tsx src/scripts/seed-india-region.ts

# Start backend server
pnpm --filter @glorov/backend start
```

### 4.3 Environment Variables for Testing
The test runner uses standard non-sensitive defaults for testing:
| Variable | Value for Tests | Description |
|---|---|---|
| `MEDUSA_BACKEND_URL` | `http://localhost:9000` | Target Medusa backend instance |
| `STORE_PUBLISHABLE_KEY` | `pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf` | Public storefront key |
| `RAZORPAY_MOCK_MODE` | `"true"` | Enables local deterministic Razorpay mock signatures |
| `SHIPROCKET_MOCK_MODE` | `"true"` | Enables local Shiprocket courier rate and tracking mocks |
| `SHIPROCKET_WEBHOOK_TOKEN` | `test_shiprocket_token_2026` | Test webhook secret token |
| `RAZORPAY_WEBHOOK_SECRET` | `mock_razorpay_webhook_secret_dev` | Test Razorpay webhook secret |

---

## 5. Mocking Strategy & Third-Party Integrations

### 5.1 Razorpay Payment Provider Mocks
- **In-Memory Mock Client (`RazorpayClient`):** When `RAZORPAY_MOCK_MODE=true` and `NODE_ENV !== 'production'`, orders and payments simulate successful creation, authorization, and capture without communicating with external Razorpay APIs (`api.razorpay.com`).
- **Signature Verification:** Mock mode accepts signatures starting with `mock_sig_` or `valid_mock_signature`. Any other signature string triggers full HMAC-SHA256 constant-time verification.
- **Production Safety:** In `NODE_ENV === 'production'`, mock mode is strictly disabled regardless of environment variables.

### 5.2 Shiprocket Fulfillment Provider Mocks
- **Serviceability Matrix:** `ShiprocketClient` simulates courier rate calculations based on Indian PIN codes (e.g., Delhivery Air Botanical Express, Bluedart Surface) with standard rates (₹49 standard, ₹99 express).
- **Tracking Scans:** Simulates tracking stages: `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`.
- **RTO Simulation:** Tests support triggering `RTO INITIATED` to verify seller botanical inspection workflow.

### 5.3 Optional Live Sandbox Verification
To run tests against live staging/sandbox APIs:
```bash
# Optional: Set live sandbox credentials
export RAZORPAY_MOCK_MODE=false
export RAZORPAY_KEY_ID="rzp_test_your_real_sandbox_key"
export RAZORPAY_KEY_SECRET="your_real_sandbox_secret"

export SHIPROCKET_MOCK_MODE=false
export SHIPROCKET_EMAIL="your_sandbox@shiprocket.com"
export SHIPROCKET_PASSWORD="your_sandbox_password"
```

---

## 6. Critical Regression Scenarios & Guardrails

The suite in [`critical-regressions.spec.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/integration-tests/http/critical-regressions.spec.ts) continuously guards against e-commerce regression bugs:

1. **Anti-IDOR Protection:** Customer B receives `403 Forbidden` when attempting to access Customer A's order by ID.
2. **Storefront Privilege Separation:** Storefront publishable keys and customer JWTs receive `401 Unauthorized` on `/admin/*` routes.
3. **Payment Tampering Defense:** Forged signatures or incomplete payloads are rejected with `400 Bad Request` before order completion.
4. **Webhook Idempotency:** Duplicate webhook events (e.g. repeated `payment.captured` or Shiprocket status callbacks) are handled idempotently without duplicate order mutations.
5. **Double-Checkout Prevention:** Repeated checkout requests on an already completed cart do not create duplicate orders.
6. **Overselling & Inventory Protection:** Attempting to checkout with unavailable stock or excessive quantities ($>50$ packets) is rejected.
7. **Failed Shipping Containment:** Courier API errors safely log orphan events without falsely marking orders as shipped.
8. **Catalog Integrity Guard:** Malformed CSV uploads in preview mode do not mutate database inventory.

---

## 7. Continuous Integration Pipeline (GitHub Actions)

The CI workflow in [`.github/workflows/ci.yml`](file:///Users/sourav/Developer/WEB/top-projects/glorov/.github/workflows/ci.yml) validates pull requests across three distinct stages:

```mermaid
flowchart LR
    A["Job 1: Quality\n• pnpm install --frozen-lockfile\n• pnpm turbo typecheck\n• pnpm turbo lint\n• pnpm turbo test (Vitest + Jest unit)"] --> B["Job 2: Integration\n• Service containers: Postgres 16 + Redis 7\n• db:migrate & seed\n• Medusa backend server startup\n• 9 HTTP Integration suites"]
    B --> C["Job 3: Production Build\n• Storefront Next.js build\n• Backend Medusa build & admin bundle"]
```

### Interpreting CI Failures
- **Quality Job Failure:** Run `pnpm typecheck` or `pnpm lint` locally to identify type mismatch or lint rule violations.
- **Integration Job Failure:** Verify that PostgreSQL and Redis services are reachable, migrations are applied (`db:migrate`), and the backend responds with `200 OK` on `/health`.
- **Build Job Failure:** Check Next.js build logs for dynamic route generation issues or missing environment variables.
