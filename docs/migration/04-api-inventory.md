# 04 — API Inventory

> **Audit date:** 2026-11-03  
> **Source:** `apps/backend/src/api/`, `flutter/lib/repositories/remote/medusa_endpoints.dart`  
> **Medusa version:** 2.22.0  
> **Status:** Analysis-only. No implementation has started.

---

## Overview

All storefront API calls go through the Medusa v2 REST API. The base URL is configurable via environment variable; default is `http://localhost:9000`.

There are two categories of endpoints:
1. **Medusa native endpoints** — built into the Medusa framework (`/store/products`, `/store/carts`, etc.)
2. **GLOROV custom endpoints** — implemented in `apps/backend/src/api/store/`

> [!IMPORTANT]
> All prices in this API are in **paise** (Indian subunit). Divide by 100 to display as ₹.  
> Example: `amount: 4900` → ₹49.00

---

## Authentication

Medusa v2 uses JWT-based session authentication via cookies.

| Flow | Endpoint | Method | Auth Required |
|---|---|---|---|
| Customer login | `/auth/customer/emailpass` | `POST` | No |
| Customer register | `/auth/customer/emailpass/register` | `POST` | No |
| Refresh token | `/auth/token/refresh` | `POST` | No |
| Get current customer | `/store/customers/me` | `GET` | Yes |

### Login request body
```json
{
  "email": "customer@example.com",
  "password": "securepassword"
}
```

### Login response
```json
{
  "token": "<jwt>",
  "customer": {
    "id": "cus_...",
    "email": "customer@example.com",
    "first_name": "Priya",
    "last_name": "Sharma"
  }
}
```

**Authentication header for protected requests:**
```
Authorization: Bearer <jwt>
```

Cookie-based auth is also supported (SameSite: None, Secure: true in production).

---

## 1. Products & Catalog (Medusa Native)

### List Products

```
GET /store/products
```

| Query param | Type | Description |
|---|---|---|
| `limit` | number | Items per page (default 12) |
| `offset` | number | Pagination offset |
| `category_id[]` | string[] | Filter by category IDs |
| `collection_id[]` | string[] | Filter by collection IDs |
| `handle` | string | Filter by URL handle |
| `q` | string | Full-text search query |
| `fields` | string | Comma-separated field selector |
| `order` | string | Sort field (e.g. `created_at`, `-created_at`) |

**Auth required:** No  
**Response shape:**
```json
{
  "products": [StoreCatalogProduct],
  "count": 42,
  "offset": 0,
  "limit": 12
}
```

**`StoreCatalogProduct` type** (from `packages/types/src/catalog.ts`):
```ts
interface StoreCatalogProduct {
  id: string
  title: string
  handle: string
  description: string | null
  subtitle?: string | null
  status: 'draft' | 'proposed' | 'published' | 'rejected'
  thumbnail: string | null
  images?: { id: string; url: string }[]
  options?: StoreCatalogProductOption[]
  variants?: StoreCatalogVariant[]
  categories?: StoreCatalogCategory[]
  collection?: StoreCatalogCollection | null
  metadata?: SeedMetadata | Record<string, unknown> | null
}
```

---

### Get Single Product

```
GET /store/products/:id
```

Returns a single `StoreCatalogProduct` with full variant and inventory data.

**Auth required:** No

---

### List Product Categories

```
GET /store/product-categories
```

**Auth required:** No  
**Response:**
```json
{
  "product_categories": [StoreCatalogCategory],
  "count": 6
}
```

**`StoreCatalogCategory`:**
```ts
interface StoreCatalogCategory {
  id: string
  name: string
  handle: string
  description?: string | null
  parent_category_id?: string | null
  category_children?: StoreCatalogCategory[]
  metadata?: Record<string, unknown> | null
}
```

---

### List Collections

```
GET /store/collections
```

**Auth required:** No  
**Response:**
```json
{
  "collections": [StoreCatalogCollection],
  "count": 3
}
```

---

## 2. Cart & Checkout (Medusa Native)

### Create Cart

```
POST /store/carts
```

**Body:**
```json
{
  "region_id": "reg_...",
  "currency_code": "inr"
}
```

**Auth required:** No (anonymous cart supported)

---

### Get Cart

```
GET /store/carts/:id
```

Returns full cart with line items, promotions, shipping methods, payment sessions, totals.

---

### Add Line Item

```
POST /store/carts/:id/line-items
```

**Body:**
```json
{
  "variant_id": "variant_...",
  "quantity": 1
}
```

---

### Update Line Item

```
PUT /store/carts/:id/line-items/:line_item_id
```

**Body:** `{ "quantity": 2 }`

---

### Delete Line Item

```
DELETE /store/carts/:id/line-items/:line_item_id
```

---

### Apply Promotion Code

```
POST /store/carts/:id/promotions
```

**Body:** `{ "promo_codes": ["GLOROV10"] }`

---

### List Shipping Options (for cart)

```
GET /store/shipping-options?cart_id=:id
```

Returns available shipping methods (manual + Shiprocket rates).

---

### Add Shipping Method to Cart

```
POST /store/carts/:id/shipping-methods
```

**Body:** `{ "option_id": "so_..." }`

---

### Initiate Payment Sessions

```
POST /store/carts/:id/payment-sessions
```

Initialises all available payment providers for the cart.

---

### Complete Cart (Place Order)

```
POST /store/carts/:id/complete
```

Places the order and returns the order object.

---

## 3. Customer & Addresses (Medusa Native)

### Create Customer Account

```
POST /store/customers
```

**Body:**
```json
{
  "email": "...",
  "password": "...",
  "first_name": "...",
  "last_name": "...",
  "phone": "..."
}
```

---

### Get Current Customer

```
GET /store/customers/me
```

**Auth required:** Yes

---

### Update Customer Profile

```
POST /store/customers/me
```

**Auth required:** Yes

---

### Change Password

```
POST /store/customers/me/password
```

**Auth required:** Yes  
**Body:** `{ "password": "newpassword" }`  
**Source:** Custom endpoint at `apps/backend/src/api/store/customers/me/password/route.ts`

---

### List Addresses

```
GET /store/customers/me/addresses
```

**Auth required:** Yes

---

### Add Address

```
POST /store/customers/me/addresses
```

**Auth required:** Yes

---

### Update Address

```
PUT /store/customers/me/addresses/:address_id
```

**Auth required:** Yes

---

### Delete Address

```
DELETE /store/customers/me/addresses/:address_id
```

**Auth required:** Yes

---

## 4. Orders (Medusa Native + Custom)

### List Orders for Customer

```
GET /store/orders
```

**Auth required:** Yes

---

### Get Order

```
GET /store/orders/:id
```

**Auth required:** Yes

---

### Get Order Tracking (Custom)

```
GET /store/orders/:id/tracking
```

**Auth required:** Yes  
**Source:** `apps/backend/src/api/store/orders/[id]/tracking/route.ts`  
**Response:** Shiprocket tracking data — AWB number, current status, estimated delivery.

---

### Cancel Order (Custom)

```
POST /store/orders/:id/cancel
```

**Auth required:** Yes  
**Source:** `apps/backend/src/api/store/orders/[id]/cancel/route.ts`

---

### Submit Return Request (Custom)

```
POST /store/orders/:id/return-request
```

**Auth required:** Yes  
**Source:** `apps/backend/src/api/store/orders/[id]/return-request/route.ts`

---

## 5. Custom GLOROV Store Endpoints

### Announcements

```
GET /store/announcements
```

**Auth required:** No  
**Response:**
```json
{
  "config": {
    "is_enabled": true,
    "speed_seconds": 30,
    "bg_color": "#1B4332",
    "text_color": "#FFFFFF",
    "highlight_color": "#52B788",
    "pause_on_hover": true
  },
  "items": [
    {
      "id": "ann_...",
      "text": "Free delivery on orders above ₹499",
      "highlight_text": "FREE",
      "icon": "local_shipping",
      "link_url": "/offers",
      "display_order": 1,
      "is_active": true
    }
  ],
  "count": 3
}
```

---

### Hero Carousel Banners

```
GET /store/banners
```

**Auth required:** No  
**Response:**
```json
{
  "banners": [
    {
      "id": "ban_...",
      "title": "...",
      "subtitle": "...",
      "image_url": "https://res.cloudinary.com/...",
      "cta_text": "Shop Now",
      "cta_url": "/seeds",
      "display_order": 1,
      "is_active": true
    }
  ],
  "count": 3
}
```

---

### Botanical Hero Section

```
GET /store/hero
```

**Auth required:** No  
**Response:** Hero configuration with featured image URL, headline, sub-headline, category pill links.

---

### Promotional Offers

```
GET /store/offers
```

**Auth required:** No  
**Response:** List of active promotional offers with title, description, discount, validity.

---

### Validate Offer / Coupon Code

```
POST /store/offers/validate
```

**Auth required:** No  
**Body:** `{ "code": "GLOROV10", "cart_total": 49900 }`  
**Response:**
```json
{
  "valid": true,
  "code": "GLOROV10",
  "discount_percent": 10,
  "discount_amount": 4990,
  "is_free_shipping": false,
  "message": "10% off applied"
}
```

---

### Trust Badges

```
GET /store/trust-badges
```

**Auth required:** No  
**Response:**
```json
{
  "badges": [
    {
      "id": "tb_...",
      "title": "Free Delivery",
      "subtitle": "On orders above ₹499",
      "icon": "local_shipping",
      "is_active": true,
      "display_order": 1
    }
  ],
  "settings": {
    "section_title": "Why GLOROV?",
    "bg_color": "#F9FAF8"
  },
  "count": 4
}
```

---

### Product Reviews

```
GET /store/reviews?product_id=:id&sort=Most Recent&rating=4
```

**Auth required:** No  
**Response:**
```json
{
  "product_id": "prod_...",
  "reviews": [...],
  "summary": {
    "average_rating": 4.5,
    "total_reviews": 23,
    "distribution": { "5": 15, "4": 5, "3": 2, "2": 1, "1": 0 }
  },
  "count": 23
}
```

---

### Submit Review

```
POST /store/reviews
```

**Auth required:** No (guest reviews accepted)  
**Body:** `{ "product_id": "...", "rating": 5, "title": "...", "body": "...", "author": "..." }`

---

### Mark Review as Helpful

```
POST /store/reviews/:id/helpful
```

**Auth required:** No

---

### Search Suggestions

```
GET /store/search/suggestions?q=monstera&limit=5
```

**Auth required:** No  
**Response:**
```json
{
  "suggestions": [
    {
      "id": "prod_...",
      "title": "Monstera Deliciosa",
      "handle": "monstera-deliciosa",
      "thumbnail": "https://...",
      "category": "plants",
      "price": 79900
    }
  ],
  "categories": ["plants", "seeds"],
  "trending": ["Basil Seeds", "Snake Plant", "Ceramic Pots"],
  "count": 5
}
```

---

### Pincode Serviceability Check

```
GET /store/pincode-check?pincode=411001&weight_kg=0.5&is_perishable=true&cod=true
```

**Auth required:** No  
**Response** (from `packages/types/src/pincode.ts`):
```json
{
  "pincode": "411001",
  "serviceable": true,
  "status": "confirmed",
  "city": "Pune",
  "state": "Maharashtra",
  "cod_available": true,
  "cod_eligible": true,
  "estimated_days": 3,
  "courier_name": "Shiprocket",
  "rate_inr": 49,
  "rate_source": "live_courier"
}
```

---

### Razorpay Payment Verification (Custom)

```
POST /store/payment/razorpay/verify
```

**Auth required:** No  
**Body:** `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }`

---

### Product Recommendations

```
GET /store/recommendations?handles=monstera,snake-plant&categories=plants&limit=6
```

**Auth required:** No  
**Source:** `apps/backend/src/api/store/recommendations/route.ts`

---

### Health Check

```
GET /store/health
```

**Auth required:** No  
**Response:** Operational health status of backend, database, and external services.

---

## 6. Medusa Native Fields Reference

> [!NOTE]
> Medusa v2 uses a `fields` query parameter to control which fields are returned. Always request only what you need to reduce payload size.

Common field sets for the storefront:

**Product list (catalog):**
```
fields=id,title,handle,thumbnail,description,status,categories,variants,metadata
```

**Product detail:**
```
fields=id,title,handle,description,subtitle,thumbnail,images,options,variants,categories,collection,metadata
```

**Variant with inventory:**
```
fields=+variants.inventory_items.inventory.location_levels
```

---

## 7. Next.js Integration Approach

All API calls should be made server-side where possible using Next.js Server Components and Server Actions.

| Pattern | Use case |
|---|---|
| Server Component `fetch` | Product listings, product details, categories, home data |
| Client `fetch` / SWR | Cart operations, search suggestions (real-time), wishlist |
| Server Action | Add to cart, checkout steps, address CRUD, login/register |
| Route Handler (`app/api/`) | Webhooks, Razorpay callback verification |

> [!CAUTION]
> Never expose `JWT_SECRET`, `COOKIE_SECRET`, `RAZORPAY_KEY_SECRET`, or `SHIPROCKET_PASSWORD` to the browser. All secret-dependent API calls must go through server-side code.
