# GLOROV — Order Operations: Cancellations, Returns, and Refund Workflows

This document establishes the operational procedures, botanical domain invariants, and technical architecture for handling order cancellations, customer return claims, physical inventory triage, and refund workflows in **GLOROV** (`glorov.in`) on **Medusa v2** (`@medusajs/medusa@2.22.0`).

---

## 1. Architectural Overview & Domain Principles

GLOROV's order lifecycle respects strict state decoupling between high-level order status (`pending`, `completed`, `canceled`, `requires_action`), payment status (`authorized`, `captured`, `refunded`, `canceled`), and fulfillment status (`not_fulfilled`, `fulfilled`, `shipped`, `delivered`, `canceled`).

```mermaid
flowchart TD
    subgraph Order Placement
        OrderPlaced["Order Placed\n(Status: pending, Fulfillment: not_fulfilled)"]
    end

    subgraph Pre-Dispatch (Pre-Shipping)
        OrderPlaced -->|Customer/Admin Cancel| CancelCheck{"Shipped in transit?"}
        CancelCheck -->|No| CancelSR["Cancel Shiprocket Fulfillment"]
        CancelSR -->|Success| CancelOrderWorkflow["cancelOrderWorkflow\n(Releases reservations, voids/refunds payment)"]
        CancelSR -->|Failure| AbortCancel["Abort with 502\n(Shipment NOT falsely marked canceled)"]
        CancelCheck -->|Yes| RejectCancel["Reject with 422\n(In-transit packages cannot be canceled)"]
    end

    subgraph Post-Delivery
        OrderPlaced -->|Dispatched & Delivered| OrderDelivered["Delivered Order"]
        OrderDelivered -->|Customer Submits Claim| ReturnReq["orderReturnRequestSchema\n(Botanical reasons, photo notes)"]
        ReturnReq -->|Seller Review| AdminReview["adminReturnReviewSchema\n(Approve with refund / exchange / reject)"]
        AdminReview --> PhysicalTriage["Botanical Inventory Triage\n(/admin/orders/:id/return-inventory-triage)"]
    end

    subgraph Financial Settlements
        AdminReview --> PayType{"Payment Provider"}
        PayType -->|Prepaid / Razorpay| RzpRefund["refundPaymentWorkflow\n(Bounds check: captured - refunded)"]
        PayType -->|Cash on Delivery (COD)| CodBankTransfer["COD Direct Bank Transfer\n(NEFT/IMPS + verified bank UTR)"]
    end
```

---

## 2. Order Cancellation Eligibility Matrix

GLOROV enforces strict state-machine guardrails on order cancellations to prevent logistics desynchronization and inventory phantom stock:

| Order Status | Fulfillment Status | Payment Type | Cancellation Permitted? | Workflow Executed | Customer Guidance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `pending` | `not_fulfilled` | Prepaid / COD | **Yes** | `cancelOrderWorkflow` | Instant cancellation. Inventory reservation released; uncaptured payment session voided. |
| `pending` | `fulfilled` (Label printed, not shipped) | Prepaid / COD | **Yes** (Conditional) | `cancelOrderFulfillmentWorkflow` &rarr; `cancelOrderWorkflow` | Shiprocket shipment canceled first. If Shiprocket confirms, order cancellation proceeds. |
| `pending` | `shipped` (In transit with courier) | Prepaid / COD | **No** (HTTP 422) | None | Packages in transit cannot be stopped in mid-air/road. Instruct customer to await delivery and initiate a botanical return claim. |
| `pending` | `delivered` | Prepaid / COD | **No** (HTTP 422) | None | Order is fulfilled. Customer must use the Return / Claim workflow. |
| `completed` | Any | Any | **No** (HTTP 400) | None | Completed orders must follow the formal return/exchange process. |
| `canceled` | Any | Any | **No** (HTTP 400) | None | Rejects duplicate cancellation calls idempotently. |

### Shiprocket Cancellation Failure Recovery Procedures
If Shiprocket courier returns an error status (e.g. AWB already scanned onto outbound linehaul truck):
1. `ShiprocketFulfillmentService.cancelFulfillment` catches the non-200 provider response and throws a `MedusaError`.
2. The cancellation route aborts immediately and returns `HTTP 502 Bad Gateway` with the provider's rejection reason.
3. The order fulfillment in Medusa **remains active and is never falsely marked as canceled**.
4. Support team receives a failure alert and contacts Delhivery/Shiprocket dispatch desk to intercept or initiate RTO (Return to Origin).

---

## 3. Customer Return Request Lifecycle & Authorization

Customer return claims for botanical seeds, live plants, and merchandise are managed via customer-facing and administrative endpoints:

### Endpoints
- `POST /store/orders/:id/return-request` (Customer submission, validated via `orderReturnRequestSchema`)
- `GET /store/orders/:id/return-request` (Customer status check, sanitized)
- `GET /admin/orders/:id/return-requests` (Admin inspection)
- `POST /admin/orders/:id/return-requests/:request_id/review` (Admin review decision)

### Botanical Return Reasons
- `damaged_in_transit`: Packaging crushed, torn foil seals, or bruised live foliage.
- `defective_quality`: Low germination rate (&lt;60%) under certified propagation conditions.
- `wrong_item`: Variant or species mismatch (e.g. indeterminate vs determinate tomato).
- `expired_viability`: Past seed packet germination validity date.
- `changed_mind_unopened`: Unopened seed packets within the standard 7-day return window.
- `other`: Custom botanical defects with customer explanation.

### Administrative Decision Actions
- `approve_with_refund`: Authorizes payment refund without requiring live plant return shipment.
- `approve_exchange`: Authorizes replacement dispatch from Pune Central Nursery Hub.
- `reject`: Rejects claim (e.g., exceeded return window, or customer over-watering damage).

---

## 4. Botanical Return Inventory Triage Rules

Returned physical packages (customer returns or courier RTO shipments) must undergo physical inspection before touching Medusa stock levels:

```
[Returned Package Arrives at Pune Hub]
                  │
     ┌────────────┴────────────┐
     ▼                         ▼
[Seed Packets]           [Live Plants]
     │                         │
     ├─► Sealed & Intact:      ├─► Transport Shock / Bruised:
     │   RESTOCK to Pune Hub   │   QUARANTINE in Nursery Bay
     │                         │   (NEVER auto-restocked)
     └─► Torn / Punctured:     │
         WRITE-OFF as loss     └─► Root Rot / Dead Foliage:
         (Do NOT restock)          WRITE-OFF as botanical spoilage
```

### Triage Rules Summary:
1. **Unopened Sealed Seeds (`unopened_sealed_seeds`)**:
   - Condition: Hermetic aluminum foil seal intact, zero moisture ingress, valid germination test lot date.
   - Action: `restock: true`. Adjusts stock level at `Pune Central Nursery Hub` (`sloc_01M5TARDFF5ZRKX7V0F855EF8Z`).
2. **Damaged Packaging (`damaged_unsellable`)**:
   - Condition: Foil puncture, moisture absorption, crushed envelope.
   - Action: `restock: false`. Recorded as packaging loss; zero inventory increment.
3. **Live Nursery Plants (`quarantine_salvage` / `perishable_spoilage`)**:
   - Condition: Live plants suffer acute transit stress, transpiration loss, and root shock.
   - Invariant: **Live nursery plants (`is_perishable: true`) are NEVER auto-restocked to sellable inventory.** Any attempt to restock live plants is rejected with HTTP 400.
   - Action: `restock: false`. Routed to greenhouse quarantine isolation bay for horticultural observation or written off as botanical spoilage.
4. **Quantity Bounds & Duplicate Adjustment Guardrail**:
   - `POST /admin/orders/:id/return-inventory-triage` checks `items.quantity` against ordered amounts and previously restocked quantities. Restocks exceeding ordered units or duplicate full restocks are rejected with `HTTP 409 Conflict` / `HTTP 400`.
   - Inventory adjustments via Medusa's inventory service report explicit errors without silently corrupting physical-to-digital inventory state.

---

## 5. Refund Workflows: Online Prepaid vs. Cash on Delivery (COD)

GLOROV enforces distinct financial reconciliation rails for prepaid transactions vs Cash on Delivery:

### Prepaid Refunds (Razorpay / Cards / UPI / NetBanking)
- **Route**: `POST /admin/orders/:id/refund`
- **Execution**: Native Medusa `refundPaymentWorkflow`.
- **Pre-Conditions**:
  1. Payment collection session must be verified as `captured`. Uncaptured payments are rejected with `HTTP 422`.
  2. Maximum refundable amount is bounded: `requested_amount <= captured_amount - already_refunded_amount`.
  3. Duplicate submissions rejected via optional `idempotency_key` (explicit keys enforced strictly; rapid-click 5s debounce applied when auto-generated). Subsequent legitimate partial refunds of identical amounts with distinct keys remain fully permitted.
  4. Attempts to trigger automated gateway refund on a COD order are strictly blocked with `HTTP 422`.

### Cash on Delivery (COD) Refunds (Direct Bank Payout)
Physical currency handed to a delivery courier has no card or UPI payment gateway reversal rails. A fake automated refund on a COD order would create immediate reconciliation fraud:
- **Route**: `POST /admin/payments/cod/refund`
- **Pre-Conditions**:
  1. Cash collection verified: Payment session must be marked `captured` (courier remittance reconciled).
  2. Verified Indian Bank Account: Requires 9–18 digit account number, valid 11-character IFSC code (`^[A-Z]{4}0[A-Z0-9]{6}$`), and account holder name.
  3. Confirmed Bank UTR: Bank transfer reference number (UTR/NEFT/IMPS) must be supplied and verified against the merchant bank statement.
  4. Cross-Order Duplicate UTR check: Rejects duplicate use of the same UTR across all orders in the database with `HTTP 409 Conflict`.
  5. Audit Record: Recorded under `order.metadata.cod_refunds`.

---

## 6. Steps Still Requiring Manual Seller Action

While workflows automate validation, state transitions, and audit records, the following steps intentionally require physical human verification:

1. **Shiprocket RTO Package Inspection**:
   - Physical opening of returned parcels at Pune Central Nursery Hub.
   - Seed moisture seal inspection and germination date verification.
2. **Horticultural Live Plant Assessment**:
   - Greenhouse nursery manager diagnosis of returned plants (rhizome viability, fungal check).
3. **NEFT / IMPS Bank Transfer Execution**:
   - Treasury manager initiating the actual payout transfer from HDFC/ICICI corporate banking portal and generating the bank UTR reference.
4. **Disputed Courier Delivery Settlements**:
   - Reconciliation of courier COD remittances when courier marks cash collected but bank remittance is delayed beyond 48 hours.
