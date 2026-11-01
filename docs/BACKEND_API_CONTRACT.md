# GLOROV — Backend API Contract & Network Layer Specification

**Document Version:** 1.0.0  
**Target Platform:** Flutter Web (with future Android / iOS deployment parity)  
**Backend Framework:** Medusa v2 (`@glorov/backend`)  
**Network Client:** `MedusaHttpClient` (`package:http`)  
**Scope:** Endpoint Specifications, Request/Response Payloads, Authentication Headers, Error Codes, and Mock vs Live Switching  

---

## 1. Network Layer Architecture

### 1.1 HTTP Client Configuration (`MedusaHttpClient`)
- **Library**: `package:http` (official Dart package with built-in web fetch support).
- **Base URL**: Configured via `MedusaApiConfig.baseUrl` (defaults to `http://localhost:9000` or compile-time environment variable `MEDUSA_BASE_URL`).
- **Publishable Key**: Injected automatically via header `x-publishable-api-key` (reads from `MEDUSA_PUBLISHABLE_KEY`).
- **Authorization**: Injected as `Authorization: Bearer <customer_jwt>` when customer is authenticated.
- **Timeouts**: 15 seconds default timeout with graceful `ApiFailure.timeout` (HTTP 408) error mapping.
- **Encoding/Decoding**: Safe UTF-8 decoding with protective JSON parsing to prevent UI crashes on malformed HTML/server error bodies.
- **Resource Lifecycle**: Automatic client disposal via `MedusaHttpClient.close()`.

### 1.2 Environment & Security Safeguards
- **Zero Secrets in Code**: No private keys, database passwords, or signing keys are embedded in frontend source files.
- **CORS Requirements**: Medusa v2 server must allow `STORE_CORS` matching the web host origin (e.g. `http://localhost:8086`, `http://localhost:3000`).
- **Compile-Time Flags**:
  ```bash
  # Run in live Medusa remote mode
  flutter run -d chrome --dart-define=GLOROV_API_MODE=remote --dart-define=MEDUSA_BASE_URL=https://api.glorov.com --dart-define=MEDUSA_PUBLISHABLE_KEY=pk_live_...

  # Run in offline mock mode (default for testing and offline development)
  flutter run -d chrome
  ```

---

## 2. Implemented Endpoints & Repository Mappings

```
┌─────────────────────────────────┬────────┬───────────────────────────────┬──────────────────────────────┐
│ Endpoint                        │ Method │ Repository / Service          │ Status                       │
├─────────────────────────────────┼────────┼───────────────────────────────┼──────────────────────────────┤
│ /store/products                 │ GET    │ MedusaProductRepository       │ Verified with Unit Tests     │
│ /store/products/:id             │ GET    │ MedusaProductRepository       │ Verified with Unit Tests     │
│ /store/product-categories       │ GET    │ MedusaProductRepository       │ Verified with Unit Tests     │
│ /store/carts                    │ POST   │ MedusaCartRepository          │ Verified with Unit Tests     │
│ /store/carts/:id                │ GET    │ MedusaCartRepository          │ Verified with Unit Tests     │
│ /store/carts/:id/line-items     │ POST   │ MedusaCartRepository          │ Verified with Unit Tests     │
│ /store/carts/:id/line-items/:id │ POST   │ MedusaCartRepository          │ Verified with Unit Tests     │
│ /store/carts/:id/line-items/:id │ DELETE │ MedusaCartRepository          │ Verified with Unit Tests     │
│ /store/carts/:id/promotions     │ POST   │ MedusaCartRepository          │ Verified with Unit Tests     │
│ /store/carts/:id/complete       │ POST   │ MedusaOrderRepository         │ Verified with Unit Tests     │
│ /store/orders                   │ GET    │ MedusaOrderRepository         │ Verified with Unit Tests     │
│ /store/orders/:id               │ GET    │ MedusaOrderRepository         │ Verified with Unit Tests     │
│ /store/orders/:id/tracking      │ GET    │ MedusaOrderRepository         │ Verified with Unit Tests     │
│ /store/customers/me             │ GET    │ MedusaAccountRepository       │ Verified with Unit Tests     │
│ /store/customers/me             │ POST   │ MedusaAccountRepository       │ Verified with Unit Tests     │
│ /store/customers/me/addresses   │ GET    │ MedusaAccountRepository       │ Verified with Unit Tests     │
│ /store/customers/me/addresses   │ POST   │ MedusaAccountRepository       │ Verified with Unit Tests     │
│ /store/customers/me/addresses/:id POST  │ MedusaAccountRepository       │ Verified with Unit Tests     │
│ /store/customers/me/addresses/:id DELETE│ MedusaAccountRepository       │ Verified with Unit Tests     │
│ /store/pincode-check            │ GET    │ MedusaPincodeService          │ Verified with Unit Tests     │
│ /store/payment/razorpay/verify  │ POST   │ MedusaPaymentService          │ Verified with Unit Tests     │
└─────────────────────────────────┴────────┴───────────────────────────────┴──────────────────────────────┘
```

---

## 3. Data Contracts & Schemas

### 3.1 Products Catalog (`GET /store/products`)
- **Query Parameters**:
  - `limit`: Integer (default 50)
  - `q`: Search keyword (searches title, botanical name, description)
  - `order`: Sort order (`calculated_price`, `-calculated_price`, `-rating`)
  - `fields`: `*variants,*categories,*images,+metadata`
- **Response Format**:
  ```json
  {
    "products": [
      {
        "id": "prod_01J9...",
        "title": "Organic Heirloom San Marzano Tomato Seeds",
        "handle": "organic-san-marzano-tomato-seeds",
        "description": "Indeterminate heirloom variety...",
        "thumbnail": "https://...",
        "images": [{ "url": "https://..." }],
        "variants": [
          {
            "id": "var_01...",
            "title": "100 Seeds Pack",
            "price": 185.0
          }
        ],
        "categories": [{ "name": "Vegetable Seeds" }],
        "metadata": {
          "botanical_name": "Solanum lycopersicum",
          "germination_time_range": "6–10 days",
          "sowing_depth": "0.5 cm",
          "sunlight": "Full Sun",
          "watering": "Regular",
          "season": "Summer & Monsoon",
          "difficulty": "Moderate",
          "is_pet_friendly": false,
          "in_stock": true,
          "rating": 4.9,
          "review_count": 128
        }
      }
    ]
  }
  ```

### 3.2 Indian Postal Pincode Lookup (`GET /store/pincode-check?pincode=...`)
- **Query Parameters**:
  - `pincode`: Required 6-digit Indian PIN (e.g. `560038`, cannot start with `0`).
  - `is_perishable`: Boolean string (`true` or `false`).
- **Response Format**:
  ```json
  {
    "pincode": "560038",
    "serviceable": true,
    "status": "serviceable",
    "city": "Bengaluru",
    "state": "Karnataka",
    "prepaid_eligible": true,
    "cod_available": true,
    "cod_eligible": true,
    "cod_restriction_reason": null,
    "estimated_days": 2,
    "courier_name": "Bluedart Botanical Air",
    "rate_inr": 85.0,
    "message": "Serviceable via Express Courier (2 days)"
  }
  ```

### 3.3 Cart Line Item Mutation (`POST /store/carts/:id/line-items`)
- **Payload**:
  ```json
  {
    "variant_id": "var_01J9...",
    "quantity": 1
  }
  ```

### 3.4 Customer Address (`POST /store/customers/me/addresses`)
- **Payload**:
  ```json
  {
    "first_name": "Ananya",
    "last_name": "Sharma",
    "address_1": "Flat 402, Green Meadows",
    "address_2": "Near Botanical Garden",
    "city": "Bengaluru",
    "province": "Karnataka",
    "postal_code": "560038",
    "phone": "9876543210",
    "is_default_shipping": true,
    "metadata": { "label": "Home" }
  }
  ```

---

## 4. Error Handling & State Recovery

The network layer maps all HTTP error codes to `ApiResult<T>`:
- **`400 Bad Request`**: Sanitizes backend Zod validation error messages and displays friendly helper text.
- **`401 Unauthorized`**: Indicates session expiration; prompts login without crashing existing cart.
- **`404 Not Found`**: Directs customer to botanical catalog fallback.
- **`408 Timeout`**: Triggered when server exceeds 15 seconds; prompts customer to retry.
- **`500 Server Error`**: Catches unhandled exceptions, keeps local state untouched, and logs correlation ID.
- **Optimistic UI with Rollback**: In `MedusaCartRepository`, items and quantities are added to `GlorovCartState` immediately for zero perceived latency. If the backend fails, the operation rolls back to the previous snapshot.

---

## 5. Development & Testing Mode Selection

To toggle between mock mode and live backend mode:

### Option A: Compile-Time Flag
```bash
flutter run -d chrome --dart-define=GLOROV_API_MODE=remote
```

### Option B: Runtime Service Locator
```dart
// Switch to Remote Medusa
GlorovRepositories.init(
  mode: RepositoryMode.remote,
  apiConfig: MedusaApiConfig(
    baseUrl: 'http://localhost:9000',
    publishableKey: 'pk_glorov_local',
  ),
);

// Switch to In-Memory Mock
GlorovRepositories.resetToMockDefaults();
```
