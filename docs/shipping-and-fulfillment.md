# GLOROV — Shipping, Logistics & Fulfillment Architecture (Shiprocket)

**Status:** Verified Production-Grade Specification & Implementation  
**Medusa Core Version:** Medusa v2.22.0  
**Target Market:** India (All 28 States & 8 Union Territories)  
**Primary Aggregator / Carrier:** Shiprocket API Integration  
**Fulfillment Provider Identifier:** `shiprocket` (Provider ID: `shiprocket_shiprocket`)  

---

## 1. Executive Summary & Fulfillment Strategy

GLOROV delivers high-viability botanical seeds, saplings, live botanical nursery plants, organic soil mixtures, and handcrafted planters across India. Indian e-commerce logistics presents unique challenges:
1. **Diverse PIN Code Coverage**: 19,000+ PIN codes spanning Tier-1 Metros (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad), Tier-2/3 cities, and remote North-Eastern/island regions.
2. **Perishable Living Botanical Goods**: Live plants and perishable saplings cannot endure prolonged transit (>48–72 hours) or Cash-on-Delivery (COD) buyer refusal without terminal botanical shock.
3. **Multi-Carrier Agility**: Shiprocket acts as an intelligent multi-carrier aggregator routing orders across Blue Dart, Delhivery, DTDC, Xpressbees, Shadowfax, and Ecom Express based on pin-code delivery speed, surface/air performance, and cost.
4. **COD & Remittance Cycles**: Indian D2C demands Cash-on-Delivery with strict courier cash-handling reconciliation (T+2 to T+7 bank remittance).
5. **RTO (Return to Origin) Mitigation**: High-velocity seed packets can be restocked, whereas damaged or distressed live plants require quarantine inspection and loss salvage rather than automatic shelf re-entry.

---

## 2. Shiprocket Modular Provider Architecture

GLOROV's fulfillment architecture extends Medusa v2's `@medusajs/framework/utils` using the standard `AbstractFulfillmentProviderService`.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   Medusa v2 Core                       │
                    │   (completeCartWorkflow / createOrderFulfillmentWorkflow)│
                    └───────────────────────────┬────────────────────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ apps/backend/src/modules/fulfillment-shiprocket                                            │
│                                                                                            │
│   ├── index.ts                - ModuleProvider(Modules.FULFILLMENT, { services: [...] })   │
│   ├── service.ts              - ShiprocketFulfillmentService (extends AbstractFulfillment) │
│   ├── client.ts               - ShiprocketClient (24hr token cache, mock mode, timeouts)   │
│   └── types.ts                - Type definitions (Order, AWB, Webhook, Serviceability)     │
└───────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
           [Mock Mode: true]                                     [Mock Mode: false]
                     │                                                     │
                     ▼                                                     ▼
        Deterministic In-Memory Stubs                       https://apiv2.shiprocket.in/v1/external
    (Simulated AWB, Tracking, Labels)                       (Live Shiprocket REST API)
```

### 2.1 Provider Registration & Database Identifier
- **Module Registration (`apps/backend/medusa-config.ts`)**:
  ```ts
  {
    resolve: "@medusajs/medusa/fulfillment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/fulfillment-manual",
          id: "manual",
        },
        {
          resolve: "./src/modules/fulfillment-shiprocket",
          id: "shiprocket",
          options: {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
            api_key: process.env.SHIPROCKET_API_KEY,
            webhook_secret: process.env.SHIPROCKET_WEBHOOK_SECRET,
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Pune-Hub",
            mock_mode: process.env.SHIPROCKET_MOCK_MODE === "true" || !process.env.SHIPROCKET_EMAIL,
            timeout_ms: 10000,
          },
        },
      ],
    },
  }
  ```
- **Medusa v2 Identifier Convention**:
  Medusa concatenates `service.identifier` (`shiprocket`) with provider `id` (`shiprocket`), generating the provider database key `shiprocket_shiprocket`.
- **Fulfillment Provider Methods**:
  - `getFulfillmentOptions()`: Returns `shiprocket-standard` (Surface), `shiprocket-express` (Air), and `shiprocket-return` (Reverse).
  - `validateOption()`: Validates that selected shipping option matches supported IDs.
  - `validateFulfillmentData()`: Validates pickup location, shipping address, 6-digit postal code format, and contact phone number.
  - `canCalculate()`: Returns `true` for flat and dynamic Indian PIN-code rate estimation.
  - `calculatePrice()`: Computes shipping price in Indian paise (`4900` for surface, `9900` for express air) or uses courier rate calculation.
  - `createFulfillment()`: Creates adhoc Shiprocket order, requests AWB assignment, schedules courier pickup, and attaches AWB/shipment details to order fulfillment metadata.
  - `cancelFulfillment()`: Calls Shiprocket order cancellation endpoint to revoke AWB and release scheduled pickup.
  - `getFulfillmentDocuments()`: Generates and returns packaging slip / shipping label PDF URL.

### 2.2 Environment Variables & Mock Mode Fallback

| Variable | Description | Default / Mock Fallback |
| :--- | :--- | :--- |
| `SHIPROCKET_EMAIL` | Shiprocket account login email | When empty, triggers `mock_mode: true` |
| `SHIPROCKET_PASSWORD` | Shiprocket account login password | Required for live token authentication |
| `SHIPROCKET_API_KEY` | Secondary API key for webhook verification | Fallback to `SHIPROCKET_WEBHOOK_SECRET` |
| `SHIPROCKET_WEBHOOK_SECRET` | Secret key used by Shiprocket webhooks | `glorov_shiprocket_webhook_secret_local` |
| `SHIPROCKET_PICKUP_LOCATION` | Primary fulfillment warehouse name in Shiprocket | `Pune-Hub` |
| `SHIPROCKET_MOCK_MODE` | Explicitly enforce mock mode (`"true"` / `"false"`) | `"true"` |

#### Token Caching Strategy
Shiprocket issues JWT bearer tokens valid for 24 hours. `ShiprocketClient` caches this token in memory with an expiration timestamp (`cachedTokenExpiresAt`), only requesting a new token when within 5 minutes of expiration. In `mock_mode`, authentication returns a simulated token immediately without remote network round-trips.

---

## 3. Indian PIN Code Serviceability API (`GET /store/pincode-check`)

GLOROV provides customer-facing postal serviceability checks at the storefront product page, cart drawer, and checkout steps.

### 3.1 Endpoint Details
- **Route**: `GET /store/pincode-check?pincode=<6-digit-pin>`
- **Authentication**: Public (Publishable API Key header `x-publishable-api-key`)
- **Query Parameter**: `pincode` (Mandatory, 6 digits matching `/^[1-9][0-9]{5}$/`)

### 3.2 Response Schema
```json
{
  "serviceable": true,
  "pincode": "560001",
  "city": "Bengaluru",
  "state": "Karnataka",
  "tier": "tier-1",
  "cod_available": true,
  "estimated_delivery_days": {
    "surface": 3,
    "air": 2
  },
  "available_couriers": [
    {
      "courier_name": "Blue Dart Air Priority",
      "courier_company_id": 1,
      "mode": "air",
      "etd_days": 2,
      "rate_paise": 9900,
      "cod_supported": true
    },
    {
      "courier_name": "Delhivery Surface",
      "courier_company_id": 2,
      "mode": "surface",
      "etd_days": 3,
      "rate_paise": 4900,
      "cod_supported": true
    }
  ],
  "botanical_guardrails": {
    "live_plants_recommended": true,
    "warning": null
  }
}
```

### 3.3 Botanical Perishable Live Plant Guardrails
Live saplings, orchids, and nursery plants are prone to dehydration and mortality if transit exceeds 48 hours. The serviceability check enforces:
1. **COD Restriction on Long Transit**: If estimated delivery exceeds 2 days (`estimated_delivery_days.air > 2`), `cod_available` is flagged false for live botanical items.
2. **Transit Warnings for Remote Regions**: PIN codes in remote areas (e.g. Jammu & Kashmir `18xxxx–19xxxx`, North East `78xxxx–79xxxx`, Andaman & Nicobar `744xxx`) return a recommendation warning:
   `"Live plants may require priority air transit or expedited handling for this pin code."`

---

## 4. Secure Webhook Receiver Architecture

Shiprocket streams delivery updates asynchronously. GLOROV listens on both:
- `POST /hooks/shiprocket` (Direct Medusa API path)
- `POST /api/hooks/shiprocket` (Proxied path compatibility)

### 4.1 Authentication & Security Verification
Shiprocket delivers webhook signatures in request headers. GLOROV inspects:
- `x-api-key` header, OR
- `x-shiprocket-token` header

The webhook compares the provided header against `SHIPROCKET_WEBHOOK_SECRET` and `SHIPROCKET_API_KEY`. If unconfigured, development fallback secrets are accepted; in strict production mode, missing or invalid keys return HTTP `401 Unauthorized`.

### 4.2 Status Mapping & Event Normalization

| Shiprocket Status Code | Shiprocket Status Text | Medusa Internal State | Action Executed |
| :--- | :--- | :--- | :--- |
| `17`, `18`, `19` | `OUT_FOR_DELIVERY` | `out_for_delivery` | Updates fulfillment metadata, logs notification event |
| `6`, `7`, `8`, `9` | `DELIVERED` | `delivered` | Executes `markOrderFulfillmentAsDeliveredWorkflow` |
| `14`, `15` | `RTO_INITIATED`, `RTO_NDR` | `rto_initiated` | Flags fulfillment for RTO workflow, stops auto-capture |
| `16` | `RTO_DELIVERED` | `rto_delivered` | Initiates botanical return triage & restocking inspection |
| `4`, `5` | `PICKED_UP`, `SHIPPED` | `shipped` | Executes `createOrderShipmentWorkflow` (attaches AWB) |
| `12`, `13` | `CANCELED`, `LOST` | `canceled` | Reverses reservation or initiates insurance claim |

### 4.3 Idempotency & Concurrency Safety
Courier webhooks often fire duplicate notifications (e.g. repeated scans at distribution hubs).
- **AWB Tracking**: The receiver looks up existing orders by `metadata.shiprocket_order_id`, `metadata.awb_code`, or `order.id`.
- **Duplicate Suppression**:
  - If a fulfillment is already marked `delivered`, subsequent `DELIVERED` webhooks are safely acknowledged with `{ "received": true, "action_taken": "idempotent_skip_already_delivered" }` without re-running workflows.
  - If a fulfillment already has tracking numbers assigned and is marked shipped, duplicate `SHIPPED` webhooks do not duplicate shipment records (`idempotent_skip_already_shipped`).
  - If a fulfillment is already canceled, duplicate `CANCELLED` webhooks skip re-cancellation (`idempotent_skip_already_cancelled`).

### 4.4 Missed / Delayed Webhook Reconciliation Strategy
If Shiprocket webhooks are delayed by carrier network outages or dropped during server restarts, fulfillment statuses are reconciled through active background polling:
1. **Periodic Status Poller**: A background job queries Medusa for active fulfillments where `shipped_at` is set, but neither `delivered_at` nor `canceled_at` is present (orders in transit > 6 hours).
2. **Aggregator Tracking Lookup**: For each active fulfillment, the system calls `ShiprocketClient.trackAwb(awb_code)` against Shiprocket's tracking API endpoint (`GET /v1/external/courier/track/awb/{awb}`).
3. **Compensating Workflow Dispatch**:
   - If Shiprocket reports status `7` (`DELIVERED`), the runner triggers `markOrderFulfillmentAsDeliveredWorkflow`.
   - If Shiprocket reports status `8` (`CANCELLED`), the runner triggers `cancelOrderFulfillmentWorkflow`.
   - If Shiprocket reports status `15` / `16` (`RTO INITIATED` / `RTO DELIVERED`), an RTO operational alert is logged.
4. **Zero-Side-Effect Idempotency**: Because all Medusa workflows and webhook status checks verify `delivered_at`, `shipped_at`, and `canceled_at` timestamps, running polling alongside webhooks causes zero duplicate transitions or conflicting states.

---

## 5. Cash on Delivery (COD) Readiness & Lifecycle

Cash-on-Delivery remains a primary payment channel for Indian home gardeners and retail customers.

### 5.1 Pre-Dispatch Verification
1. **Indian Mobile Verification**: High COD RTO rates in India are mitigated by requiring valid 10-digit Indian phone numbers (`/^[6-9][0-9]{9}$/`).
2. **High-Value Cap**: Unverified COD orders exceeding ₹5,000 require automated WhatsApp / SMS confirmation before Medusa operations release the order for warehouse picking.
3. **Botanical Risk Rule**: Orders containing live perishable saplings (category `live-plants`) are restricted to prepaid or expedited air shipping where transit is under 48 hours.

### 5.2 COD Order Lifecycle
```
[Customer Selects COD]
         │
         ▼
[Medusa Order Placed (Payment Status: Awaiting Payment)]
         │
         ▼
[Shiprocket Order Created with `payment_method: "COD"`, `sub_total: order.subtotal`]
         │
         ▼
[Courier Delivery Agent Collects Cash at Doorstep]
         │
         ▼
[Shiprocket Webhook: DELIVERED]
         │
         ▼
[Medusa: markOrderFulfillmentAsDeliveredWorkflow (Fulfillment Status -> DELIVERED)]
(CRITICAL: Payment Status remains AWAITING REMITTANCE / NOT PAID)
         │
         ▼
[Courier Remittance Pipeline (T+2 to T+7 Days)]
         │
         ▼
[Finance Bank Settlement & UTR Reconciliation]
         │
         ▼
[Medusa Payment Captured: capturePaymentWorkflow on COD Payment Collection]
```

---

## 6. Courier Remittance Reconciliation (T+2 to T+7 Cycle)

Courier aggregators collect physical cash from customers upon delivery and remit the net amount to the merchant's bank account after deducting freight, COD fees, and fuel surcharges.

### 6.1 Remittance Timeline
- **T (Delivery Day)**: Delivery agent marks shipment `DELIVERED` and deposits cash at local branch hub.
- **T+1 to T+2**: Courier reconciles branch collections with central treasury.
- **T+2 to T+4**: Shiprocket aggregates carrier remittances (Early COD / Standard COD schedules).
- **T+5 to T+7**: Final bank transfer (NEFT/RTGS) to GLOROV's current account with Consolidated Remittance Advice (CRN / UTR Number).

### 6.2 Settlement Tracking & Deductions
For every delivered COD order, finance reconciles:

$$\text{Net Merchant Remittance} = \text{Order Gross Total (COD Collected)} - (\text{Forward Freight} + \text{COD Handling Fee} + \text{GST @ 18\% on Courier Fees})$$

| Metric | Benchmark Formula | Action upon Discrepancy |
| :--- | :--- | :--- |
| **COD Fee** | ₹30 or 1.5% of consignment value (whichever is higher) | Verify against Shiprocket rate card contract |
| **Dead Weight vs Volumetric Weight** | $\max\left(\text{Gross Weight}, \frac{L \times W \times H}{5000}\right)$ | Dispute weight discrepancies within 4 days with packaging photo evidence |
| **Remittance Discrepancy** | UTR Amount vs Medusa Delivered COD Sum | Open Shiprocket NDR / Billing Ticket with AWB list |

### 6.3 Settlement Information Recording & Ledger Tracking
To prevent premature or fraudulent order closures, courier-collected funds are recorded separately from delivery events:
1. **Separation of Concerns**: Delivery is tracked on the `Fulfillment` entity (`delivered_at`). Payment collection is recorded on the `Payment` / `PaymentCollection` entity.
2. **Settlement Metadata Record**:
   When finance receives the Shiprocket Remittance Advice (CRN / UTR statement), each delivered COD payment record is updated with:
   - `utr_number`: Bank reference number for NEFT/RTGS transaction.
   - `remitted_amount_paise`: Net rupees received in bank account.
   - `courier_deductions_paise`: Freight + COD commission deducted by aggregator.
   - `remittance_date`: Bank value date.
   - `reconciled_by`: Admin user or automated reconciliation pipeline ID.
3. **Capture Execution**: Only upon verified bank credit does the finance operator or settlement pipeline execute `capturePaymentWorkflow` on the order's COD payment collection. If an order was marked delivered but courier funds are never remitted (e.g. carrier theft or dispute), the order remains flagged with unpaid balance, allowing finance to pursue courier indemnity claims.

---

## 7. RTO (Return to Origin) & Inventory Replenishment

When a delivery attempt fails (NDR — Non-Delivery Report) due to customer unavailability, incorrect address, or refusal to pay COD, the shipment transitions to RTO and is routed back to the Pune Central Nursery Hub.

### 7.1 Category-Specific RTO Protocols

```
                                  [RTO Arrives at Pune Hub]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [High-Viability Seed Packets]                   [Live Perishable Plants]
                      │                                               │
                      ▼                                               ▼
     - Physical Inspection (Moisture Seal)           - Botanical Health Triage
     - Seed Germination Lot Check                    - Root Moisture & Foliage Check
     - Return to Stock (`stocked_quantity += Qty`)   - Salvageable?
                                                           ├── Yes: Quarantine, Water, Re-pot (30-day recovery)
                                                           └── No: Write-off as botanical shrinkage (Spotted Loss)
```

1. **Seeds & Merchandise (Non-Perishable)**:
   - Hermetically sealed foil packets retain full germination viability.
   - Upon physical receipt and barcode verification, `inventory_level.stocked_quantity` is incremented.
   - Restocking log records return with AWB reference.
2. **Live Plants & Saplings (Perishable)**:
   - **Never auto-restock** directly into available inventory upon RTO delivery webhook.
   - Live plants returned after 4–10 days in cardboard packaging suffer etiolation, moisture loss, or root rot.
   - Must undergo 14-day nursery quarantine and nursery revival before re-listing.
   - Incurred shipping cost and dead stock are allocated to D2C Operational Loss.

---

## 8. Verification & Test Suite Reference

The shipping and fulfillment system is covered by comprehensive automated tests:

1. **Unit Tests (`apps/backend/src/__tests__/shiprocket-provider.unit.spec.ts`)**:
   - 12 passing unit tests verifying client auth, token caching, PIN code validation, serviceability estimation, order generation, AWB assignment, label generation, cancellation, and error handling.
2. **Integration Tests (`apps/backend/integration-tests/http/shipping-and-fulfillment.spec.ts`)**:
   - 14 passing HTTP integration tests verifying PIN code API (`GET /store/pincode-check`), webhook authentication, status transitions (`DELIVERED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `RTO`), duplicate suppression, and Indian address fulfillment validation.
3. **Monorepo Compatibility**:
   - Zero modifications to core cart, checkout, or customer modules.
   - Full backwards compatibility with Medusa standard `manual_manual` provider for local testing and store administration.
