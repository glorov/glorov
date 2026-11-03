# 06 — Directory Architecture

> **Audit date:** 2026-11-03  
> **Target location:** `apps/storefront/`  
> **Status:** Proposed structure only. No files have been created yet.

---

## 1. Proposed `apps/storefront/` Directory Tree

```
apps/storefront/
│
├── public/                         ← Static assets served at root URL
│   ├── fonts/                      ← Plus Jakarta, Fraunces, Grandis Extended (copied from flutter/assets/fonts/)
│   ├── icons/                      ← Custom SVG icons (copied from flutter/assets/icons/)
│   ├── logo/                       ← GLOROV logo variants
│   ├── og-image.jpg                ← Open Graph image
│   └── favicon.ico
│
├── src/
│   │
│   ├── app/                        ← Next.js App Router: all route segments
│   │   ├── layout.tsx              ← Root layout (font loading, StorefrontLayout, providers)
│   │   ├── page.tsx                ← Home page ( / )
│   │   ├── error.tsx               ← Root error boundary
│   │   ├── not-found.tsx           ← Global 404 page
│   │   │
│   │   ├── c/                      ← Category catalog pages
│   │   │   └── [handle]/
│   │   │       └── page.tsx        ← /c/seeds, /c/plants, etc.
│   │   │
│   │   ├── products/               ← Product pages
│   │   │   └── [handle]/
│   │   │       ├── page.tsx        ← Product detail page
│   │   │       └── reviews/
│   │   │           └── page.tsx    ← Full reviews listing
│   │   │
│   │   ├── categories/
│   │   │   └── page.tsx            ← Category browser ( /categories )
│   │   │
│   │   ├── search/
│   │   │   └── page.tsx            ← Search results ( /search?q=... )
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx            ← Cart ( /cart )
│   │   │
│   │   ├── checkout/
│   │   │   └── page.tsx            ← Checkout ( /checkout )
│   │   │
│   │   ├── order/
│   │   │   └── confirmation/
│   │   │       └── page.tsx        ← Order confirmation ( /order/confirmation )
│   │   │
│   │   ├── account/                ← Protected account pages
│   │   │   ├── layout.tsx          ← AccountLayout (sidebar + content panel)
│   │   │   ├── page.tsx            ← Account overview ( /account )
│   │   │   ├── profile/
│   │   │   │   └── page.tsx        ← Edit profile
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx        ← Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    ← Order detail
│   │   │   ├── addresses/
│   │   │   │   └── page.tsx        ← Address book
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx        ← Wishlist
│   │   │   └── notifications/
│   │   │       └── page.tsx        ← Notifications
│   │   │
│   │   ├── auth/                   ← Authentication pages (unauthenticated)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── policies/               ← Static policy pages
│   │   │   ├── layout.tsx          ← GlorovPolicyLayout equivalent
│   │   │   ├── page.tsx            ← Policy hub
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   ├── terms/
│   │   │   │   └── page.tsx
│   │   │   └── shipping/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                    ← Next.js Route Handlers (server-side only)
│   │       └── health/
│   │           └── route.ts        ← Storefront health check
│   │
│   ├── components/                 ← All React components
│   │   │
│   │   ├── layout/                 ← Page-level layout wrappers
│   │   │   ├── StorefrontLayout.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── AccountLayout.tsx
│   │   │
│   │   ├── navigation/             ← Global navigation components
│   │   │   ├── AnnouncementBar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DesktopNav.tsx
│   │   │   ├── MobileDrawer.tsx
│   │   │   ├── MobileBottomNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── home/                   ← Home page feature components
│   │   │   ├── HeroBannerSlider.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ValuePropsBar.tsx
│   │   │   ├── CategoryDiscovery.tsx
│   │   │   ├── FeaturedProductsRail.tsx
│   │   │   └── OfferBanner.tsx
│   │   │
│   │   ├── product/                ← Product-related components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductPrice.tsx
│   │   │   ├── ProductBadge.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── QuantityStepper.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   └── DeliveryChecker.tsx
│   │   │
│   │   ├── cart/                   ← Cart feature components
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   ├── CouponInput.tsx
│   │   │   ├── FreeDeliveryProgress.tsx
│   │   │   └── CartToast.tsx
│   │   │
│   │   ├── search/                 ← Search feature components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchSuggestionsDropdown.tsx
│   │   │   └── SearchResultsGrid.tsx
│   │   │
│   │   ├── checkout/               ← Checkout step components
│   │   │   ├── AddressForm.tsx
│   │   │   ├── AddressCard.tsx
│   │   │   ├── ShippingMethodSelector.tsx
│   │   │   ├── PaymentMethodSelector.tsx
│   │   │   └── CheckoutSummary.tsx
│   │   │
│   │   ├── account/                ← Account page components
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── AccountMenuNav.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   └── OrderTimeline.tsx
│   │   │
│   │   ├── ui/                     ← Design-system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Pagination.tsx
│   │   │
│   │   └── feedback/               ← Loading, empty, error states
│   │       ├── ProductCardSkeleton.tsx
│   │       ├── GallerySkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── Toast.tsx
│   │       └── Spinner.tsx
│   │
│   ├── lib/                        ← Shared utilities and helpers
│   │   ├── api/                    ← Medusa API client functions
│   │   │   ├── client.ts           ← Base fetch wrapper with auth + error handling
│   │   │   ├── products.ts         ← Product fetching functions
│   │   │   ├── categories.ts       ← Category fetching
│   │   │   ├── cart.ts             ← Cart operations
│   │   │   ├── orders.ts           ← Order fetching
│   │   │   ├── customers.ts        ← Customer / auth operations
│   │   │   ├── banners.ts          ← Banner / hero / announcements
│   │   │   ├── reviews.ts          ← Reviews
│   │   │   ├── search.ts           ← Search suggestions
│   │   │   └── pincode.ts          ← Pincode serviceability
│   │   │
│   │   ├── hooks/                  ← Custom React hooks
│   │   │   ├── useCart.ts          ← Cart state access
│   │   │   ├── useAuth.ts          ← Authentication state
│   │   │   ├── useWishlist.ts      ← Wishlist operations
│   │   │   ├── useSearch.ts        ← Search state and debounce
│   │   │   └── useMediaQuery.ts    ← Responsive viewport detection
│   │   │
│   │   ├── context/                ← React context providers
│   │   │   ├── CartContext.tsx     ← Cart state provider
│   │   │   └── AuthContext.tsx     ← Authentication state provider
│   │   │
│   │   ├── utils/                  ← Pure utility functions
│   │   │   ├── currency.ts         ← formatINR(paise) → "₹49"
│   │   │   ├── image.ts            ← Cloudinary URL builder
│   │   │   ├── pincode.ts          ← Pincode format validation
│   │   │   ├── slug.ts             ← Handle/slug generation
│   │   │   └── date.ts             ← Date formatting (Indian locale)
│   │   │
│   │   └── constants.ts            ← App-wide constants (API base URL, limits, etc.)
│   │
│   ├── types/                      ← Storefront-specific TypeScript types
│   │   ├── cart.ts                 ← CartItem, CartState, CartTotals
│   │   ├── auth.ts                 ← AuthState, CustomerSession
│   │   ├── search.ts               ← SearchState, SuggestionResult
│   │   └── ui.ts                   ← Variant, Size, ButtonVariant, etc.
│   │
│   └── styles/
│       ├── globals.css             ← Tailwind base, CSS variables, font declarations
│       └── tokens.css              ← GLOROV brand CSS custom properties
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json                   ← extends @glorov/config/typescript/nextjs
├── eslint.config.ts                ← extends @glorov/config/eslint/react
├── postcss.config.ts
├── package.json                    ← name: @glorov/storefront
└── README.md
```

---

## 2. Folder Purpose Reference

| Folder | Purpose |
|---|---|
| `src/app/` | All Next.js App Router route segments. Only pages, layouts, error boundaries, and API route handlers. No business logic. |
| `src/app/api/` | Server-only route handlers — webhooks, Razorpay callbacks, health endpoint. Never expose secrets through client-side code. |
| `src/components/layout/` | Page-structural layout wrappers. Used in `app/layout.tsx` and `app/account/layout.tsx`. |
| `src/components/navigation/` | Every navigation element: header, footer, drawers, bottom tabs, announcement bar. |
| `src/components/home/` | Home page feature sections. Not reused outside the home page. |
| `src/components/product/` | All product-related UI: card, gallery, pricing, variants, reviews. Reused across catalog, search, home, and product detail pages. |
| `src/components/cart/` | Cart item display, totals, coupon input, toast. Reused in cart page and checkout summary. |
| `src/components/search/` | Search input, suggestions, and results grid. Reused in header and search page. |
| `src/components/checkout/` | Multi-step checkout forms and selectors. Only used on the checkout page. |
| `src/components/account/` | Account-specific display components. Only used in account sub-pages. |
| `src/components/ui/` | Design-system primitives with no business logic. Reusable anywhere. |
| `src/components/feedback/` | Loading skeletons, empty states, error states, toasts. Reused everywhere. |
| `src/lib/api/` | All functions that call the Medusa backend. Each file groups related endpoints. Server-safe (can be called from server components and actions). |
| `src/lib/hooks/` | Client-only React hooks that wrap context, state, and browser APIs. |
| `src/lib/context/` | React context providers. Cart and auth are the primary stateful concerns. |
| `src/lib/utils/` | Pure functions with no side effects. No React imports, no API calls. Safe to use anywhere. |
| `src/types/` | Storefront-local TypeScript interfaces. Augments `@glorov/types` for frontend-specific needs. |
| `src/styles/` | Global CSS including Tailwind directives, brand CSS variables, and font declarations. |
| `public/fonts/` | Font files copied from `flutter/assets/fonts/`. Served as static assets. |
| `public/icons/` | Custom SVG icon files copied from `flutter/assets/icons/`. |

---

## 3. File Naming Conventions

| Concern | Convention | Example |
|---|---|---|
| React components | PascalCase `.tsx` | `ProductCard.tsx` |
| Non-component modules | camelCase `.ts` | `currency.ts`, `useCart.ts` |
| Next.js special files | lowercase (required by Next.js) | `page.tsx`, `layout.tsx`, `error.tsx` |
| Constant files | camelCase | `constants.ts` |
| Type files | camelCase | `cart.ts` |
| Test files | same name + `.test.tsx` | `ProductCard.test.tsx` |
| CSS files | camelCase or kebab-case | `globals.css`, `tokens.css` |

---

## 4. Component File Structure

Each component file must follow this internal structure:

```tsx
// 1. Imports (external → internal → types → styles)
import type { StoreCatalogProduct } from '@glorov/types'
import { cn } from '@/lib/utils/cn'
import { ProductPrice } from '@/components/product/ProductPrice'

// 2. Types / interface for props
export interface ProductCardProps {
  /** The product data to display */
  product: StoreCatalogProduct
  /** Whether to show the wishlist toggle button */
  showWishlist?: boolean
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg'
}

// 3. Component implementation
/**
 * @component ProductCard
 * @description Displays a single product in grid or rail layouts.
 * @example
 * <ProductCard product={product} showWishlist size="md" />
 */
export function ProductCard({ product, showWishlist = true, size = 'md' }: ProductCardProps) {
  // ...
}
```

---

## 5. Import Aliases

The `tsconfig.json` must define a path alias so all internal imports use `@/` instead of relative paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage: `import { Button } from '@/components/ui/Button'`

---

## 6. `package.json` for Storefront

```json
{
  "name": "@glorov/storefront",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 7. Monorepo Wiring

The storefront will be auto-discovered by Turborepo via `pnpm-workspace.yaml` (which already includes `"apps/*"`). No changes to the workspace file are needed. The `turbo.json` build pipeline will also apply automatically.

The CORS environment variable on the backend must be updated:
```
STORE_CORS=http://localhost:3000,https://glorov.in
```
