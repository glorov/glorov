# GLOROV — Complete Route Inventory

> **Audit Date:** November 6, 2026  
> **Source:** Actual file system inspection of `apps/storefront/src/app/` and `apps/backend/src/api/`

---

## 1. Storefront Routes (25 pages discovered)

### Customer-Facing Pages

| Route | File | Purpose | Protected | Backend Deps | Status |
|---|---|---|---|---|---|
| `/` | `page.tsx` | Homepage — hero, categories, best sellers, trust badges | Public | Hero, banners, products, offers, trust-badges APIs | ✅ Implemented |
| `/products/[slug]` | `products/[slug]/page.tsx` | Product detail page (PDP) | Public | Product catalog, variant pricing, reviews | ✅ Implemented |
| `/categories` | `categories/page.tsx` | All categories listing | Public | Product categories API | ✅ Implemented |
| `/categories/[slug]` | `categories/[slug]/page.tsx` | Category product listing with filters | Public | Products by category API | ✅ Implemented |
| `/collections/[slug]` | `collections/[slug]/page.tsx` | Collection product listing | Public | Product collections API | ✅ Implemented |
| `/search` | `search/page.tsx` | Search results page | Public | Search suggestions API | ✅ Implemented |
| `/offers` | `offers/page.tsx` | Active offers/coupons page | Public | Offers API | ✅ Implemented |
| `/cart` | `cart/page.tsx` | Shopping cart | Public | ⚠️ localStorage only | ⚠️ Client-side only |
| `/checkout` | `checkout/page.tsx` | Checkout flow | Public | ⚠️ Fallback mock validation | ⚠️ Mock fallback |
| `/order/confirmation` | `order/confirmation/page.tsx` | Order confirmation receipt | Public | ⚠️ Accepts fake order data | ⚠️ No real order lookup |

### Authentication Pages

| Route | File | Purpose | Protected | Backend Deps | Status |
|---|---|---|---|---|---|
| `/auth/login` | `auth/login/page.tsx` | Customer login | Public | ⚠️ Simulated auth | ⚠️ localStorage |
| `/auth/signup` | `auth/signup/page.tsx` | Customer registration | Public | ⚠️ Simulated auth | ⚠️ localStorage |
| `/auth/forgot-password` | `auth/forgot-password/page.tsx` | Password reset request | Public | ⚠️ No real email sent | ⚠️ Simulated |
| `/auth/reset-password` | `auth/reset-password/page.tsx` | Password reset form | Public | ⚠️ localStorage only | ⚠️ Simulated |

### Account Pages (All require auth)

| Route | File | Purpose | Protected | Backend Deps | Status |
|---|---|---|---|---|---|
| `/account` | `account/page.tsx` | Account dashboard | ⚠️ Client-side only | ⚠️ localStorage | ⚠️ No middleware guard |
| `/account/profile` | `account/profile/page.tsx` | Edit profile | ⚠️ Client-side only | ⚠️ localStorage | ⚠️ No middleware guard |
| `/account/addresses` | `account/addresses/page.tsx` | Saved addresses | ⚠️ Client-side only | ⚠️ localStorage | ⚠️ No middleware guard |
| `/account/orders` | `account/orders/page.tsx` | Order history | ⚠️ Client-side only | ⚠️ Demo data | ⚠️ No middleware guard |
| `/account/wishlist` | `account/wishlist/page.tsx` | Saved wishlist | ⚠️ Client-side only | ⚠️ localStorage | ⚠️ No middleware guard |
| `/account/notifications` | `account/notifications/page.tsx` | Notification preferences | ⚠️ Client-side only | ⚠️ localStorage | ⚠️ No middleware guard |

### Policy & Legal Pages

| Route | File | Purpose | Protected | Status |
|---|---|---|---|---|
| `/policies/privacy` | `policies/privacy/page.tsx` | Privacy policy | Public | ✅ Static content |
| `/policies/shipping` | `policies/shipping/page.tsx` | Shipping policy | Public | ✅ Static content |
| `/policies/terms` | `policies/terms/page.tsx` | Terms & conditions | Public | ✅ Static content |

### Development Pages

| Route | File | Purpose | Protected | Status |
|---|---|---|---|---|
| `/dev/design-system` | `dev/design-system/page.tsx` | Design system showcase | Public | ⚠️ Should be dev-only |
| `/dev/shared-components` | `dev/shared-components/page.tsx` | Shared components demo | Public | ⚠️ Should be dev-only |

---

## 2. Storefront Error Handling Routes

| File | Purpose | Status |
|---|---|---|
| [`error.tsx`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/error.tsx) | Root error boundary — "Something unexpected sprouted" | ✅ Implemented, branded |
| [`not-found.tsx`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/not-found.tsx) | 404 page — "Botanical Path Not Found" | ✅ Implemented, branded |
| [`loading.tsx`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/app/loading.tsx) | Root loading state — `BotanicalLoadingState` | ✅ Implemented |

---

## 3. Storefront API Routes

| Route | File | Method | Purpose | Status |
|---|---|---|---|---|
| `/api/checkout/validate` | `app/api/checkout/validate/route.ts` | POST | Cart validation before order | ⚠️ Falls back to `MOCK_PRODUCTS` |
| `/api/checkout/place-order` | `app/api/checkout/place-order/route.ts` | POST | Order placement | ⚠️ Creates fake `ord_${Date.now()}` orders |

---

## 4. Route Validation Findings

### Missing Routes (Expected for E-commerce)
- ❌ No dedicated order tracking page (e.g., `/order/tracking/[id]`)
- ❌ No cancellation request page
- ❌ No return request page
- ❌ No refund status page
- ❌ No customer reviews/write-review page
- ❌ No contact/support page
- ❌ No about page

### Security Issues
| ID | Issue | Severity | Status |
|---|---|---|---|
| **GLOROV-ROUTE-001 / GLOROV-DEV-001** | `/dev/design-system` and `/dev/shared-components` are publicly accessible in production | MEDIUM | RESOLVED (Gated by Next.js middleware in production) |
| **GLOROV-ROUTE-002** | No Next.js `middleware.ts` exists — no server-side auth redirect for `/account/*` routes | HIGH | RESOLVED (Added apps/storefront/src/middleware.ts) |
| **GLOROV-ROUTE-003 / GLOROV-AUTH-003** | `/account/*` routes rely only on `CustomerAuthContext` (client-side `useState`) for protection | HIGH | RESOLVED (Server-side middleware guards /account/* with JWT expiry inspection) |

### Metadata & SEO
- Homepage: Has metadata (confirmed from existing docs)
- Product pages: Dynamic metadata from product data
- Policy pages: Static metadata
- ❌ No `middleware.ts` for canonical URL enforcement
- ✅ `sitemap.ts` exists (not read in detail)
- ✅ `robots.ts` exists (not read in detail)
