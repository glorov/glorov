# GLOROV — Indian Payment Integration Architecture (Razorpay & Cash on Delivery)

**Status:** Verified Production-Grade Specification & Implementation  
**Medusa Core Version:** Medusa v2.22.0  
**Target Market:** India (Currency: INR - ₹)  
**Primary Online Payment Gateway:** Razorpay (`pp_razorpay_razorpay`)  
**Offline Doorstep Cash Provider:** Cash on Delivery (`pp_cod_cod`)  
**Fallback / Development Provider:** System Default (`pp_system_default`)  

---

## 1. Executive Summary & Architecture Overview

GLOROV supports two complementary payment flows tailored to the Indian commerce ecosystem:
1. **Razorpay Online Payments**: Instant digital payment processing across UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), and Indian Net Banking.
2. **Cash on Delivery (COD)**: Doorstep physical cash collection managed via courier logistics, maintaining an uncaptured / outstanding payment state until bank remittance reconciliation.

```
                                  ┌───────────────────────────┐
                                  │   Next.js 15 Storefront   │
                                  │     (/checkout page)      │
                                  └─────────────┬─────────────┘
                                                │
                          1. Select Payment Provider (Razorpay vs COD)
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │      Medusa v2 Core       │
                                  │ (Store API / Payment Mod) │
                                  └──────┬─────────────┬──────┘
                                         │             │
                    ┌────────────────────┘             └────────────────────┐
                    ▼                                                       ▼
┌─────────────────────────────────────────┐               ┌─────────────────────────────────────────┐
│ apps/backend/modules/payment-razorpay   │               │ apps/backend/modules/payment-cod        │
│                                         │               │                                         │
│ • AbstractPaymentProvider extension     │               │ • AbstractPaymentProvider extension     │
│ • Razorpay Order creation (paise, INR)  │               │ • ₹5,000 max order limit check          │
│ • HMAC-SHA256 signature verification    │               │ • Remote PIN code restriction check     │
│ • Auto-capture / Manual capture support │               │ • Leaves order payment UNCAPTURED       │
│ • Refund API integration                │               │ • Reconciled on courier bank remittance │
│ • Secure webhook receiver               │               │                                         │
└───────────────────┬─────────────────────┘               └─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│     Razorpay External REST API v1       │
│      https://api.razorpay.com/v1        │
│  (Orders, Payments, Refunds, Webhooks)  │
└─────────────────────────────────────────┘
```

---

## 2. Payment Provider Module Specifications

### 2.1 Razorpay Payment Provider (`apps/backend/src/modules/payment-razorpay`)
- **Class Identifier**: `static identifier = "razorpay"`
- **Provider ID**: `pp_razorpay_razorpay`
- **Module Resolution**: Registered under `@medusajs/medusa/payment` in `medusa-config.ts`.
- **Currency Validation**: Strictly enforces `currency_code === 'inr'`. Rejects foreign currencies.
- **Unit Precision**: Converts order amounts to minor currency units (paise). 1 INR = 100 paise.

#### Supported Method Handlers:
| Method | Description | Implementation Details |
| :--- | :--- | :--- |
| `initiatePayment` | Creates Razorpay order (`POST /v1/orders`) | Passes `amount` in paise, `currency: 'INR'`, and `notes: { cart_id }`. Returns `{ id, data }`. |
| `authorizePayment` | Verifies payment authorization | Cryptographically validates `HMAC-SHA256(order_id + '\|' + payment_id, secret)`. Never trusts client-side redirect. |
| `capturePayment` | Captures authorized funds | Calls `POST /v1/payments/{id}/capture` (or verifies auto-captured state). |
| `refundPayment` | Issues customer refund | Calls `POST /v1/payments/{id}/refund` with refund amount and audit reason. |
| `cancelPayment` | Cancels payment authorization | Marks session status as `canceled`. |
| `getPaymentStatus` | Maps provider status | Maps `captured` $\rightarrow$ `captured`, `authorized` $\rightarrow$ `authorized`, `canceled/refunded` $\rightarrow$ `canceled`. |
| `getWebhookActionAndData` | Webhook event ingestion | Normalizes `payment.captured`, `order.paid`, `payment.failed`, and `refund.processed`. |

### 2.2 Cash on Delivery (COD) Provider (`apps/backend/src/modules/payment-cod`)
- **Class Identifier**: `static identifier = "cod"`
- **Provider ID**: `pp_cod_cod`
- **Eligibility Constraints**:
  1. **Maximum Order Value**: Default limit ₹5,000 (500,000 paise). Configurable via `COD_MAX_AMOUNT_PAISE`. High-value orders must use Razorpay to mitigate courier cash handling risks.
  2. **Postal Code Serviceability**: Disallows remote island corridors (Andaman & Nicobar `744xxx`, Lakshadweep `682xxx`) where long transit times lead to high RTO botanical spoilage.
- **Payment Separation Rule**: 
  - Completing a COD order leaves the payment status as `authorized` with `cash_collected: false`.
  - Marking a shipment as `DELIVERED` **never marks a COD order as paid**.
  - Payment is captured **only after courier cash remittance (NEFT/RTGS with UTR)** is received.

---

## 3. Cryptographic Signature Verification & Webhooks

### 3.1 Payment Signature Verification
After customer completes the Razorpay checkout modal, Razorpay delivers three parameters to the frontend:
1. `razorpay_order_id`
2. `razorpay_payment_id`
3. `razorpay_signature`

The storefront sends these to `POST /store/payment/razorpay/verify`. The server verifies:
$$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} \parallel \text{"|"} \parallel \text{payment\_id},\, \text{RAZORPAY\_KEY\_SECRET})$$

Verification uses `crypto.timingSafeEqual` to prevent timing attacks. If the signature matches, the payment session is marked `verified: true` and authorized.

### 3.2 Webhook Receiver (`POST /api/hooks/razorpay`)
- **Authenticity Header**: Validates `x-razorpay-signature` against raw request body using `RAZORPAY_WEBHOOK_SECRET`.
- **Missing / Forged Signatures**: Returns HTTP 401 Unauthorized.
- **Idempotency & Replay Protection**: If `payment.captured` arrives for an order that is already in `captured` state, the endpoint acknowledges with `{ received: true, action_taken: 'idempotent_skip_already_captured' }` without duplicating workflows.
- **Out-of-Order Events**: Handles `payment.failed` and `refund.processed` safely without unhandled exceptions.

---

## 4. Cash on Delivery (COD) Reconciliation Lifecycle

```
[Customer Places Order] ──▶ [Medusa: Order Created]
                                 │
                                 ├── Payment Status: "authorized" (NOT captured)
                                 ├── Cash Collected: false
                                 │
[Warehouse Ships Items] ──▶ [Shiprocket: AWB Dispatched]
                                 │
[Courier Delivers Box]  ──▶ [Shiprocket Webhook: DELIVERED]
                                 │
                                 ├── Fulfillment Status: "delivered"
                                 ├── Payment Status: STILL "authorized" (NOT paid)
                                 │
[Courier Bank Credit]   ──▶ [Finance: UTR Verification (T+2 to T+7)]
                                 │
                                 ▼
                         [Medusa: capturePayment]
                                 ├── Payment Status: "captured"
                                 └── Cash Collected: true
```

---

## 5. Security & PCI-DSS Compliance

1. **No Sensitive Card Data**: Card numbers, expiry dates, and CVVs are entered exclusively inside Razorpay's PCI-DSS Level 1 certified checkout iframe. GLOROV servers never touch, process, or store raw cardholder data.
2. **Server-Side API Secrets**: `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are strictly kept server-side in `apps/backend/.env`. Never prefixed with `NEXT_PUBLIC_` or exposed to client browsers.
3. **Mock Mode Isolation**: In development and automated tests (`NODE_ENV === 'test'` or `RAZORPAY_MOCK_MODE=true`), all external network calls are bypassed with deterministic cryptographic stubs, ensuring tests never hit live payment rails or charge real money.

---

## 6. Environment Configuration

### Backend Environment (`apps/backend/.env`)
```bash
# Razorpay Payment Gateway (Server-side Only)
RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
RAZORPAY_KEY_SECRET="your_razorpay_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret_here"
RAZORPAY_MOCK_MODE="false" # Set to "true" for local offline testing

# Cash on Delivery Configuration
COD_MAX_AMOUNT_PAISE="500000" # Max COD limit: ₹5,000
```

### Storefront Environment (`apps/storefront/.env.local`)
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL="http://localhost:9000"
NEXT_PUBLIC_STORE_PUBLISHABLE_KEY="pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf"
# Note: Key secret is NOT exposed to frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
```

---

## 7. Sandbox Verification & Production Rollout Checklist

### Sandbox Testing Steps
1. Create a Razorpay test account at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate API Keys in **Settings $\rightarrow$ API Keys** (select Test Mode).
3. Set webhook URL to `https://api.glorov.in/api/hooks/razorpay` in **Settings $\rightarrow$ Webhooks**.
4. Subscribe to events: `payment.captured`, `payment.authorized`, `payment.failed`, `order.paid`, `refund.processed`.
5. Run test checkout in the storefront using Razorpay Test Cards or test UPI IDs (`success@razorpay`).

### Production Activation Checklist
- [ ] Business entity KYC approved on Razorpay (PAN, GSTIN, Bank Account).
- [ ] Razorpay Live Key ID and Key Secret generated and configured in production `.env`.
- [ ] Webhook URL registered with production secret.
- [ ] Auto-capture configured to match business requirements (instant vs manual capture upon packing).
- [ ] Standard refund policy documented and tested.
- [ ] Courier COD remittance bank account linked and verified.
