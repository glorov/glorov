# GLOROV Storefront: Developer Guide & Architectural Handbook

## 1. Monorepo Architecture & Directory Structure

The GLOROV project is structured as a pnpm workspace orchestrated by Turborepo:

```
glorov/
├── apps/
│   ├── backend/               # Medusa v2 Commerce Backend (Port 9000)
│   │   ├── src/               # Custom Medusa modules, workflows, endpoints
│   │   ├── data/              # JSON seed data (hero, banners, reviews, trust)
│   │   └── package.json
│   │
│   └── storefront/            # Next.js 15.3.3 App Router Storefront (Port 3000)
│       ├── src/
│       │   ├── app/           # App Router pages, layouts, sitemap, robots
│       │   ├── components/    # React component architecture
│       │   │   ├── ui/        # Design system primitives (Button, Badge, Input, Card)
│       │   │   ├── layout/    # Layout shells (Header, Footer, Drawer, Nav)
│       │   │   ├── product/   # Product cards, price, gallery, variants, specs
│       │   │   ├── home/      # Homepage sections (Hero, ValueProps, Editorial)
│       │   │   ├── cart/      # Cart items, shipping meter, coupon card
│       │   │   ├── checkout/  # Address form, shipping, payment selectors
│       │   │   └── account/   # Sidebar, addresses, orders, live tracking
│       │   ├── context/       # StorefrontContext, CustomerAuthContext
│       │   ├── lib/           # Medusa client, mock data, constants, utilities
│       │   ├── styles/        # Tailwind configuration, tokens.css, globals.css
│       │   └── types/         # Domain TypeScript interfaces (cart, account, etc.)
│       ├── tests/             # Vitest unit test suites
│       └── package.json
│
├── flutter/                   # Flutter Native Mobile Project (iOS & Android)
│   ├── lib/                   # Dart models, screens, repositories, state
│   └── pubspec.yaml
│
├── packages/
│   ├── config/                # Shared ESLint, Tailwind, TypeScript configs
│   └── types/                 # Shared domain data models
│
├── docs/                      # Technical migration reports & operational guides
│   ├── migration/             # Detailed phase reports (01 to 15)
│   └── qa/                    # Quality assurance & visual regression audits
│
├── screenshots/               # Visual verification & viewport evidence archives
└── package.json               # Root monorepo workspace scripts
```

---

## 2. Developer Workflow & Commands

### 2.1 Workspace Scripts (from Root)
| Command | Action |
| :--- | :--- |
| `pnpm install` | Install dependencies across monorepo |
| `pnpm storefront:dev` | Start Next.js storefront dev server on `http://localhost:3000` |
| `pnpm storefront:build` | Build Next.js storefront production bundle |
| `pnpm storefront:test` | Run Vitest unit tests (64 tests) |
| `pnpm storefront:typecheck`| Run TypeScript static type check (`tsc --noEmit`) |
| `pnpm storefront:lint` | Run Next.js ESLint validation |
| `pnpm backend:dev` | Start Medusa v2 backend server on `http://localhost:9000` |
| `pnpm flutter:test` | Run Flutter mobile unit and widget tests |
| `pnpm db:up` | Launch local PostgreSQL 16 and Redis containers via Docker |

---

## 3. Component Architecture & Guidelines

### 3.1 Layer Responsibilities
1. **Design System Primitives (`src/components/ui/`)**:
   - Atomic, stateless UI elements: [`Button`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/ui/Button.tsx), [`Badge`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/ui/Badge.tsx), [`Input`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/ui/Input.tsx), [`Card`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/ui/Card.tsx).
   - Consume CSS tokens from [`tokens.css`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/styles/tokens.css).
2. **Domain Storefront Components (`src/components/product/`, `layout/`)**:
   - Reusable across multiple pages: [`ProductCard`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/product/ProductCard.tsx), [`Header`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/layout/Header.tsx), [`WishlistButton`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/product/WishlistButton.tsx).
3. **Route View Modules (`src/components/cart/`, `checkout/`, `account/`)**:
   - Complex interactive views: [`CheckoutAddressForm`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/checkout/CheckoutAddressForm.tsx), [`OrderTrackingModal`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/components/account/OrderTrackingModal.tsx).

### 3.2 JSDoc Documentation Standard
All shared components must include structured JSDoc headers:

```tsx
/**
 * @component ProductCard
 *
 * @description
 * Reusable GLOROV Botanical Product Card migrated directly from Flutter `GlorovProductCard`.
 * Displays editorial typography, live price in INR, sales badge, and quick actions.
 *
 * @accessibility
 * - Card acts as an accessible landmark link to product PDP.
 * - Wishlist and quick-add actions have isolated event propagation and explicit ARIA labels.
 */
export function ProductCard({ product, showWishlist = true }: ProductCardProps) { ... }
```

---

## 4. TypeScript & Code Quality Conventions

1. **Strict No-`any` Rule**:
   - Never use `any` or `@ts-ignore`.
   - Use `unknown` with type narrowing (e.g., `typeof`, `instanceof`, or custom type guards) when processing untrusted inputs.
2. **Explicit Interfaces**:
   - Define domain interfaces in `src/types/`:
     - [`types/storefront.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/types/storefront.ts): Products, Variants, Categories, Reviews.
     - [`types/cart.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/types/cart.ts): Cart items, coupons, totals.
     - [`types/checkout.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/types/checkout.ts): Shipping options, payment providers.
     - [`types/account.ts`](file:///Users/sourav/Developer/WEB/top-projects/glorov/apps/storefront/src/types/account.ts): Customer user, addresses, orders, notifications.

---

## 5. Testing Guidelines

- **Testing Framework**: Vitest 2.1.9 with `@testing-library/react` and `jsdom`.
- **Location**: Store unit and component integration tests in `apps/storefront/tests/unit/`.
- **Naming**: `*.test.tsx` or `*.test.ts`.
- **Coverage Requirements**: Every state-altering hook, commerce calculation, form validation, and responsive interactive widget must have unit tests.
