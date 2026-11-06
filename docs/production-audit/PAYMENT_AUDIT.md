# GLOROV — Payment & Financial Transaction Audit

> **Audit Date:** November 6, 2026  
> **Scope:** Razorpay, COD, refunds, financial calculations  

---

## 1. Razorpay Payment Provider

**Files Inspected:**
- [`apps/backend/src/modules/payment-razorpay/service.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/modules/payment-razorpay/service.ts) (455 lines)
- [`apps/backend/src/modules/payment-razorpay/client.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/modules/payment-razorpay/client.ts) (321 lines)

### What Works
- ✅ Order creation via Razorpay REST API with `payment_capture: 1` (auto-capture)
- ✅ HMAC-SHA256 payment signature verification: `SHA256(order_id|payment_id, secret)`
- ✅ HMAC-SHA256 webhook signature verification with `crypto.timingSafeEqual`
- ✅ INR currency enforcement — rejects non-INR payments
- ✅ Mock mode for development/testing — generates deterministic mock IDs
- ✅ 10-second timeout with `AbortController` on all Razorpay API calls
- ✅ Proper error handling with `MedusaError` types
- ✅ Webhook handler processes `payment.captured`, `payment.authorized`, `payment.failed`, `order.paid`

### Issues Found

| ID | Severity | Finding | Location |
|---|---|---|---|
| GLOROV-PAY-002 | HIGH | `capturePayment` catch block returns `status: 'captured'` even on failure. Comment says "If already captured by auto-capture, treat as success" but this assumes the only failure reason is double-capture. Network errors, auth failures, etc. would also be silently marked as captured. | `service.ts` L219-228 |
| GLOROV-PAY-003 | HIGH | Hardcoded fallback amount `9800` in capturePayment when session data has no amount. This could capture a payment for ₹98 regardless of actual order total. | `service.ts` L207 |
| GLOROV-PAY-004 | HIGH | No refund idempotency. Multiple calls to `refundPayment` with the same payment ID could issue multiple refunds to Razorpay. | `service.ts` L234-271 |
| GLOROV-RZP-001 | MEDIUM | `convertToPaise` uses `Math.round(num * 100)` for float-to-paise. IEEE 754: `1.005 * 100 = 100.49999...` → rounds to 100 instead of 101. | `service.ts` L70 |

---

## 2. COD Payment Provider

**Files Inspected:**
- [`apps/backend/src/modules/payment-cod/service.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/backend/src/modules/payment-cod/service.ts) (313 lines)

### What Works
- ✅ ₹5,000 order cap (500,000 paise) — configurable via `COD_MAX_AMOUNT_PAISE`
- ✅ Pincode restrictions for Andaman & Nicobar, Lakshadweep
- ✅ INR currency enforcement
- ✅ Prevents refund of uncaptured COD orders (no cash was collected)
- ✅ Requires bank UTR reference for COD refunds (prevents fake automated refunds)
- ✅ Distinct `authorized` vs `captured` lifecycle (captured = cash physically collected)

### Issues Found

| ID | Severity | Finding | Location | Status |
|---|---|---|---|---|
| GLOROV-COD-001 | HIGH | Storefront fallback validation checked `grandTotal > 5000` (rupees) while backend converts to paise. Standardized to 500,000 paise across `@glorov/types`, backend, and storefront with `isCodAmountEligible()`. | `payment-cod/service.ts`, `PaymentMethodSelector.tsx` | RESOLVED (FIX-015) |

---

## 3. Storefront Payment Flow

| ID | Severity | Finding |
|---|---|---|
| GLOROV-PAY-001 | CRITICAL | No Razorpay checkout modal is integrated in the Next.js storefront. When the storefront falls back to local validation, it assigns `paymentStatus: 'captured'` for simulated card/UPI payments without any gateway interaction. |
| — | CRITICAL | The fallback `place-order/route.ts` generates fake order IDs and returns them to the customer as if a real order was placed. No actual Medusa order, no inventory deduction, no payment. |

---

## 4. Financial Calculation Safety

- ✅ Backend uses integer paise with `precision: 20` in Medusa v2 `raw_*` JSONB fields
- ✅ COD max amount comparison uses integer paise
- ✅ Razorpay amounts sent as integer paise to API
- ⚠️ Storefront calculations use JavaScript floating-point (acceptable for display, but validated server-side)
- ⚠️ `convertToPaise` float→int conversion uses `Math.round(num * 100)` which has edge-case precision issues
