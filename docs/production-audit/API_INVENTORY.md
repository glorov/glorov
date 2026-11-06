# GLOROV — Complete API Inventory

> **Audit Date:** November 6, 2026  
> **Source:** File system inspection of `apps/backend/src/api/`

---

## 1. Store API Routes (Customer-facing)

| Route | Method | Auth | Rate Limited | Purpose | Evidence |
|---|---|---|---|---|---|
| `/store/health` | GET | None | No | Health check endpoint | `store/health/route.ts` |
| `/store/hero` | GET | None | No | Homepage hero content | `store/hero/route.ts` |
| `/store/banners` | GET | None | No | Promotional banners | `store/banners/route.ts` |
| `/store/announcements` | GET | None | No | Announcement bar content | `store/announcements/route.ts` |
| `/store/offers` | GET | None | No | Active offers/coupons list | `store/offers/route.ts` |
| `/store/offers/validate` | POST | None | No | Coupon code validation | `store/offers/validate/route.ts` |
| `/store/trust-badges` | GET | None | No | Trust badge display data | `store/trust-badges/route.ts` |
| `/store/recommendations` | GET | None | No | Product recommendations | `store/recommendations/route.ts` |
| `/store/reviews` | GET/POST | Optional | No | Product reviews CRUD | `store/reviews/route.ts` |
| `/store/reviews/[id]/helpful` | POST | Optional | No | Mark review as helpful | `store/reviews/[id]/helpful/route.ts` |
| `/store/search/suggestions` | GET | None | No | Search autocomplete | `store/search/suggestions/route.ts` |
| `/store/pincode-check` | GET | None | ✅ 120/min | PIN code serviceability check | `store/pincode-check/route.ts` |
| `/store/checkout/validate` | POST | None | No | Server-side cart validation | `store/checkout/validate/route.ts` |
| `/store/checkout/place-order` | POST | None | No | Order placement (⚠️ generates fake IDs) | `store/checkout/place-order/route.ts` |
| `/store/payment/razorpay/verify` | POST | None | ✅ 60/min | Razorpay payment signature verification | `store/payment/razorpay/verify/route.ts` |
| `/store/customers/me/password` | POST | ✅ Customer | No | Password change | `store/customers/me/password/route.ts` |
| `/store/orders/[id]` | GET | Optional (customer) | No | Order details (IDOR-protected) | Medusa core + `validateOrderOwnership` |
| `/store/orders/[id]/cancel` | POST | Optional (customer) | ✅ 30/min | Order cancellation (IDOR-protected) | `store/orders/[id]/cancel/route.ts` |
| `/store/orders/[id]/return-request` | GET/POST | Optional (customer) | ✅ 30/min | Return request (IDOR-protected) | `store/orders/[id]/return-request/route.ts` |
| `/store/orders/[id]/tracking` | GET | Optional (customer) | No | Order tracking info (IDOR-protected) | `store/orders/[id]/tracking/route.ts` |

---

## 2. Admin API Routes

| Route | Method | Auth | Rate Limited | Purpose |
|---|---|---|---|---|
| `/admin/health/metrics` | GET | ✅ Admin | No | Operational metrics dashboard |
| `/admin/hero` | GET/POST | ✅ Admin | No | Homepage hero content management |
| `/admin/banners` | GET/POST | ✅ Admin | No | Banner CRUD |
| `/admin/banners/[id]` | GET/PUT/DELETE | ✅ Admin | No | Banner item management |
| `/admin/banners/seed` | POST | ✅ Admin | No | Banner seed data |
| `/admin/announcements` | GET/POST | ✅ Admin | No | Announcement CRUD |
| `/admin/announcements/[id]` | GET/PUT/DELETE | ✅ Admin | No | Announcement item management |
| `/admin/announcements/config` | GET/POST | ✅ Admin | No | Announcement configuration |
| `/admin/offers` | GET/POST | ✅ Admin | No | Offers/coupons CRUD |
| `/admin/offers/[id]` | GET/PUT/DELETE | ✅ Admin | No | Offer item management |
| `/admin/offers/seed` | POST | ✅ Admin | No | Offer seed data |
| `/admin/trust-badges` | GET/POST | ✅ Admin | No | Trust badge CRUD |
| `/admin/trust-badges/[id]` | GET/PUT/DELETE | ✅ Admin | No | Trust badge item management |
| `/admin/trust-badges/reorder` | POST | ✅ Admin | No | Reorder trust badges |
| `/admin/trust-badges/seed` | POST | ✅ Admin | No | Trust badge seed data |
| `/admin/trust-badges/settings` | GET/POST | ✅ Admin | No | Trust badge settings |
| `/admin/media` | GET | ✅ Admin | No | Media library listing |
| `/admin/media/upload` | POST | ✅ Admin | No | Media file upload |
| `/admin/products/csv-import/preview` | POST | ✅ Admin | ✅ 30/min | CSV import preview |
| `/admin/products/csv-import/confirm` | POST | ✅ Admin | ✅ 30/min | CSV import confirmation |
| `/admin/products/csv-import/reconcile` | POST | ✅ Admin | ✅ 30/min | CSV import reconciliation |
| `/admin/orders/[id]/shipment` | GET/POST | ✅ Admin | No | Create/view shipment for order |
| `/admin/orders/[id]/shipment/label` | GET | ✅ Admin | No | Download shipping label |
| `/admin/orders/[id]/shipment/reconcile` | POST | ✅ Admin | No | Reconcile shipment status |
| `/admin/orders/[id]/refund` | POST | ✅ Admin | No | Process refund |
| `/admin/orders/[id]/return-requests` | GET/POST | ✅ Admin | No | Return request management |
| `/admin/orders/[id]/return-requests/[request_id]/review` | POST | ✅ Admin | No | Review return request |
| `/admin/orders/[id]/return-inventory-triage` | POST | ✅ Admin | No | Return inventory triage |
| `/admin/payments/cod/reconcile` | POST | ✅ Admin | No | COD payment reconciliation |
| `/admin/payments/cod/refund` | POST | ✅ Admin | No | COD refund processing |

---

## 3. Webhook Endpoints

| Route | Method | Auth Mechanism | Purpose | Evidence |
|---|---|---|---|---|
| `/hooks/razorpay` | POST | HMAC-SHA256 signature (`x-razorpay-signature`) | Razorpay payment events | `hooks/razorpay/route.ts` (227 lines) |
| `/hooks/shiprocket` | POST | Token comparison (`x-api-key` / `x-shiprocket-token`) | Shiprocket tracking updates | `hooks/shiprocket/route.ts` (326 lines) |
| `/api/hooks/razorpay` | POST | Same as above | Duplicate webhook path | `api/hooks/razorpay/route.ts` |
| `/api/hooks/shiprocket` | POST | Same as above | Duplicate webhook path | `api/hooks/shiprocket/route.ts` |

> [!WARNING]
> **GLOROV-API-001**: Two webhook paths exist for each provider (`/hooks/*` and `/api/hooks/*`). This duplication means webhook events could be processed twice if both paths are registered in the provider dashboards. **Severity: MEDIUM**

---

## 4. Cloud Auth Routes

| Route | Method | Purpose |
|---|---|---|
| `/cloud/auth` | POST | Cloud authentication endpoint |
| `/cloud/auth/users` | GET | Cloud auth user listing |

---

## 5. Middleware Configuration

### Global Middleware
- [`requestCorrelationMiddleware`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/api/middlewares/request-correlation.ts) — Applied to `/.*/` (all routes)
  - Assigns/validates `x-correlation-id`
  - Records request duration and telemetry
  - Logs errors and slow requests (>1s)

### IDOR Prevention
- [`validateOrderOwnership`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/api/middlewares.ts#L43-L130) — Applied to all `/store/orders/:id/*` routes
  - Registered customers: verifies `auth_context.actor_id === order.customer_id`
  - Guest orders: GET allowed; mutations require matching email
  - Cross-customer access: blocked when authenticated customer email ≠ order email

### Rate Limiting
| Action | Limit | Window | Endpoints |
|---|---|---|---|
| `pincode_check` | 120 req | 60 sec | `/store/pincode-check` |
| `razorpay_verify` | 60 req | 60 sec | `/store/payment/razorpay/verify` |
| `csv_import` | 30 req | 60 sec | `/admin/products/csv-import*` |
| `order_cancel` | 30 req | 60 sec | `/store/orders/:id/cancel` |
| `return_request` | 30 req | 60 sec | `/store/orders/:id/return-request` |

### Global Error Handler
- [`sendSanitizedError`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/utils/error-handler.ts) — Registered as `errorHandler` in `defineMiddlewares`
  - Sanitizes stack traces in production
  - Maps MedusaError types to HTTP status codes
  - Includes correlation ID in response
  - Records operational metrics

---

## 6. API Issues Identified

| ID | Issue | Severity |
|---|---|---|
| **GLOROV-API-001** | Duplicate webhook paths (`/hooks/*` and `/api/hooks/*`) — risk of double processing | MEDIUM |
| **GLOROV-API-002** | Backend `store/checkout/place-order` generates fake order IDs (`ord_${Date.now()}`) — not connected to Medusa order module | CRITICAL |
| **GLOROV-API-003** | Backend `checkout-validation-service.ts` uses hardcoded `CANONICAL_INVENTORY` (21 items) instead of querying Medusa product/inventory modules | CRITICAL |
| **GLOROV-API-004** | No rate limiting on `/store/checkout/place-order` or `/store/checkout/validate` | HIGH |
| **GLOROV-API-005** | `/store/reviews` POST has no authentication requirement — anonymous review submission possible | MEDIUM |
