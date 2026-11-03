# 09 — Migration Roadmap

> **Audit date:** 2026-11-03  
> **Status:** Roadmap document only. No implementation has started.  
> **Awaiting:** Your review and explicit approval before any work begins.

---

## Overview

This roadmap defines the exact sequence for migrating the GLOROV Flutter Web storefront to a native Next.js application. Each phase builds on the previous and must pass all quality gates before the next phase starts.

The Flutter application remains **untouched and live** throughout the entire migration.

---

## Phase Dependencies Map

```
Phase 1: Foundation
    ↓
Phase 2: Design System + UI Primitives
    ↓
Phase 3: Layout + Navigation Shell
    ↓
Phase 4: Home Page
    ↓
Phase 5: Catalog + Categories
    ↓
Phase 6: Product Detail + Search
    ↓
Phase 7: Cart + Checkout + Confirmation
    ↓
Phase 8: Auth + Account
    ↓
Phase 9: Policy Pages
    ↓
Phase 10: QA + Performance + SEO
    ↓
Phase 11: Production Launch
```

Each phase must not begin until the previous phase passes its completion criteria.

---

## Phase 1 — Foundation Setup

**Goal:** Working Next.js application scaffold wired into the monorepo with zero source code yet.

### Tasks

| # | Task | Notes |
|---|---|---|
| 1.1 | Create `apps/storefront/` directory | Follows structure in `06-directory-architecture.md` |
| 1.2 | `package.json` — `@glorov/storefront` | Workspace name, scripts: dev, build, typecheck, lint, test |
| 1.3 | `next.config.ts` | Image domains: `res.cloudinary.com`. Strict mode on. |
| 1.4 | `tsconfig.json` | Extends `@glorov/config/typescript/nextjs` (create this file) |
| 1.5 | `eslint.config.ts` | Extends `@glorov/config/eslint/react` (create this file) |
| 1.6 | `tailwind.config.ts` | Brand tokens per `05-design-system-inventory.md` |
| 1.7 | `src/styles/globals.css` | Tailwind directives + brand CSS variables |
| 1.8 | `src/styles/tokens.css` | All CSS custom properties |
| 1.9 | Copy font files | From `flutter/assets/fonts/` → `public/fonts/` |
| 1.10 | Copy SVG icon files | From `flutter/assets/icons/` → `public/icons/` |
| 1.11 | `src/app/layout.tsx` | Root layout: font loading, providers, `<html lang="en">` |
| 1.12 | `src/app/page.tsx` | Placeholder home page (blank, no content yet) |
| 1.13 | `src/lib/constants.ts` | `MEDUSA_URL`, `DEFAULT_REGION`, etc. |
| 1.14 | `src/lib/utils/currency.ts` | `formatINR(paise: number): string` |
| 1.15 | `src/lib/api/client.ts` | Base `apiFetch()` wrapper with error handling |
| 1.16 | Update `STORE_CORS` env hint | Document in `.env.example` at root |

**Completion criteria:**
- [ ] `pnpm dev --filter @glorov/storefront` starts without errors
- [ ] `pnpm typecheck --filter @glorov/storefront` passes
- [ ] `pnpm lint --filter @glorov/storefront` passes
- [ ] Browser loads `http://localhost:3000` — blank page, correct fonts
- [ ] No console errors

**Risk:** Low. Pure configuration work.

---

## Phase 2 — Design System & UI Primitives

**Goal:** All `components/ui/` and `components/feedback/` components implemented and visually verified.

### Tasks

| # | Task | Notes |
|---|---|---|
| 2.1 | `Button` component | All variants: primary, secondary, ghost, danger, link |
| 2.2 | `Input` component | States: default, focused, error, disabled |
| 2.3 | `Checkbox` component | Branded with `forest-deep` colour |
| 2.4 | `Select` component | Styled dropdown |
| 2.5 | `Badge` component | Size and colour variants |
| 2.6 | `Chip` component | Filter and category selection |
| 2.7 | `Tabs` component | Horizontal tabs with active underline |
| 2.8 | `Modal` component | Accessible with focus trap and `Escape` close |
| 2.9 | `Drawer` component | Slide-in from left (mobile nav) |
| 2.10 | `Pagination` component | Numbered or load-more style |
| 2.11 | `Spinner` component | Branded loading spinner |
| 2.12 | `EmptyState` component | Icon + title + message + optional CTA |
| 2.13 | `ErrorState` component | Error display + retry action |
| 2.14 | `Toast` component | Success / error / info notification |
| 2.15 | `ProductCardSkeleton` | Shimmer skeleton for product cards |
| 2.16 | `GallerySkeleton` | Shimmer skeleton for image gallery |
| 2.17 | Design system page | Internal-only `/dev/design-system` page to visually verify all primitives |

**Completion criteria:**
- [ ] Design system page renders all primitives at all 7 viewports without layout issues
- [ ] All components are typed with exported interfaces
- [ ] All components pass eslint + typecheck
- [ ] No horizontal overflow at 350px
- [ ] Accessibility: all interactive elements are keyboard-navigable

**Risk:** Low-medium. Focus on getting brand tokens pixel-perfect.

---

## Phase 3 — Layout & Navigation Shell

**Goal:** Every page has the correct header, footer, and navigation. No content yet.

### Tasks

| # | Task | Notes |
|---|---|---|
| 3.1 | `PageContainer` component | Max-width 1280px, horizontal padding |
| 3.2 | `AnnouncementBar` component | Marquee ticker; fetches `/store/announcements` |
| 3.3 | `Header` component | Logo, search trigger, cart badge, scroll-aware |
| 3.4 | `DesktopNav` component | Category links horizontal bar |
| 3.5 | `MobileDrawer` component | Slide-in nav drawer |
| 3.6 | `MobileBottomNav` component | Fixed bottom tab bar |
| 3.7 | `Footer` component | All links, logo, copyright |
| 3.8 | `Breadcrumbs` component | Route-aware breadcrumb trail |
| 3.9 | `StorefrontLayout` component | Composes all navigation |
| 3.10 | Wire `StorefrontLayout` into `app/layout.tsx` | |
| 3.11 | `AccountLayout` component | Sidebar + content panel for account pages |
| 3.12 | Wire `AccountLayout` into `app/account/layout.tsx` | |
| 3.13 | `CartContext` + `CartProvider` | Client-side cart state |
| 3.14 | `AuthContext` + `AuthProvider` | Client-side auth state |
| 3.15 | `useCart()` hook | Cart access hook |
| 3.16 | `useAuth()` hook | Auth access hook |

**Screenshot comparison:** Header, footer, announcement bar, mobile bottom nav, mobile drawer — at all 7 viewports.

**Completion criteria:**
- [ ] Flutter vs Next.js header screenshots match at all 7 viewports
- [ ] Footer matches at all 7 viewports
- [ ] Announcement bar marquee is animating
- [ ] Mobile bottom nav is visible and correct at 350px
- [ ] Mobile drawer opens and closes correctly at 350px
- [ ] Account layout sidebar is correct at 1280px and collapses on mobile

**Risk:** Medium. Header scroll behaviour and mobile drawer require careful state management.

---

## Phase 4 — Home Page

**Goal:** Full home page with all sections, live data, and visual parity.

### Tasks

| # | Task | Notes |
|---|---|---|
| 4.1 | `lib/api/banners.ts` | `fetchBanners()`, `fetchHeroData()`, `fetchAnnouncements()`, `fetchOffers()`, `fetchTrustBadges()` |
| 4.2 | `HeroBannerSlider` | Auto-play carousel with dot indicators |
| 4.3 | `HeroSection` | Botanical hero with category pills |
| 4.4 | `ValuePropsBar` | Trust icons row; data from `/store/trust-badges` |
| 4.5 | `CategoryDiscovery` | Category tiles grid |
| 4.6 | `FeaturedProductsRail` | Horizontal scrollable product rail |
| 4.7 | `OfferBanner` | Promotional offer section |
| 4.8 | `lib/api/products.ts` | `listProducts()` with typed params |
| 4.9 | `lib/api/categories.ts` | `listCategories()` |
| 4.10 | Wire all data into `app/page.tsx` | Server component data fetching |

**Screenshot comparison:** All home sections at all 7 viewports.

**Completion criteria:**
- [ ] Flutter vs Next.js home page screenshots match at 350px (priority 1)
- [ ] Matches at all other viewports
- [ ] Hero banner auto-plays
- [ ] Category tiles link to correct catalog routes
- [ ] Featured products show real data from backend
- [ ] No horizontal overflow at 350px
- [ ] Page loads under 3s on a standard connection

**Risk:** Medium. Hero banner animation and auto-play timing must match Flutter behaviour.

---

## Phase 5 — Catalog & Categories

**Goal:** `/categories` page and all `/c/[handle]` catalog listing pages with filters and pagination.

### Tasks

| # | Task | Notes |
|---|---|---|
| 5.1 | `ProductCard` component | Grid card with all variants |
| 5.2 | `ProductBadge` component | Discount + status badges |
| 5.3 | `ProductPrice` component | Price display with original/current/discount |
| 5.4 | `RatingStars` component | Display-only star rating |
| 5.5 | `useWishlist()` hook | Wishlist toggle state |
| 5.6 | `SearchResultsGrid` (shared) | Reusable product grid |
| 5.7 | `app/categories/page.tsx` | Category browser |
| 5.8 | `app/c/[handle]/page.tsx` | Catalog listing page |
| 5.9 | Filter chips + sort dropdown | Inline filter bar |
| 5.10 | `Pagination` or load-more | Infinite scroll or paginated |
| 5.11 | Empty state for no results | |
| 5.12 | `Breadcrumbs` for category pages | |

**Screenshot comparison:** Category browser + at least two catalog pages at all 7 viewports.

**Completion criteria:**
- [ ] 2-column product grid at 350px
- [ ] 3-column at tablet, 4-column at desktop
- [ ] Filter bar horizontal-scrollable at 350px (no vertical wrap)
- [ ] Sort and filter work correctly
- [ ] Empty state displays correctly
- [ ] Product cards match Flutter design

**Risk:** Low-medium. Grid layout at 350px requires careful attention.

---

## Phase 6 — Product Detail & Search

**Goal:** Full product detail page and search page with live data.

### Tasks

| # | Task | Notes |
|---|---|---|
| 6.1 | `ProductGallery` | Swipeable image gallery, thumbnail strip |
| 6.2 | `VariantSelector` | Packet size / option pills |
| 6.3 | `QuantityStepper` | +/− with min/max bounds |
| 6.4 | `DeliveryChecker` | Pincode input + `/store/pincode-check` |
| 6.5 | `ReviewCard` component | Single review display |
| 6.6 | `app/products/[handle]/page.tsx` | Full product detail |
| 6.7 | `app/products/[handle]/reviews/page.tsx` | Full reviews listing |
| 6.8 | `lib/api/reviews.ts` | `listReviews()`, `submitReview()` |
| 6.9 | `lib/api/pincode.ts` | `checkPincode()` |
| 6.10 | Sticky bottom CTA bar (mobile) | Add to Cart / Buy Now |
| 6.11 | `SearchBar` component | Search input with clear and submit |
| 6.12 | `SearchSuggestionsDropdown` | Live suggestions from `/store/search/suggestions` |
| 6.13 | `app/search/page.tsx` | Search results page |
| 6.14 | `useSearch()` hook | Debounced search state |

**Screenshot comparison:** Product detail (gallery, info, reviews tabs) + search page at all 7 viewports.

**Completion criteria:**
- [ ] Gallery swipe works on mobile at 350px
- [ ] Sticky bottom CTA does not cover gallery content
- [ ] Variant pills wrap cleanly at 350px
- [ ] Delivery checker result displays correctly
- [ ] Reviews tab shows real data
- [ ] Search suggestions appear after 300ms debounce
- [ ] No results state displays correctly

**Risk:** High. Product gallery sticky behaviour and search real-time suggestions are the most complex UI interactions.

---

## Phase 7 — Cart, Checkout & Order Confirmation

**Goal:** Complete purchase flow from cart through order confirmation.

### Tasks

| # | Task | Notes |
|---|---|---|
| 7.1 | `CartItem` component | Line item with stepper, remove, price |
| 7.2 | `CartSummary` component | Totals block |
| 7.3 | `CouponInput` component | Promo code + `/store/offers/validate` |
| 7.4 | `FreeDeliveryProgress` component | Progress bar toward free delivery threshold |
| 7.5 | `CartToast` component | "Added to cart" notification |
| 7.6 | `app/cart/page.tsx` | Cart page |
| 7.7 | Wire `CartContext` to Medusa cart API | Replace in-memory with Medusa cart operations |
| 7.8 | `AddressForm` component | Add/edit address |
| 7.9 | `AddressCard` component | Saved address display |
| 7.10 | `ShippingMethodSelector` | Shipping options from Medusa |
| 7.11 | `PaymentMethodSelector` | Razorpay + COD options |
| 7.12 | `CheckoutSummary` component | Right-panel order summary |
| 7.13 | `app/checkout/page.tsx` | Multi-step checkout |
| 7.14 | Razorpay web integration | `payment/razorpay/verify` route handler |
| 7.15 | `app/order/confirmation/page.tsx` | Order confirmation |
| 7.16 | `lib/api/cart.ts` | All cart mutation functions |
| 7.17 | `lib/api/orders.ts` | `completeCart()`, `getOrder()` |

**Screenshot comparison:** Cart (with items + empty), checkout steps, confirmation at all 7 viewports.

**Completion criteria:**
- [ ] Add to cart works from product detail and catalog pages
- [ ] Cart item quantity update and remove work
- [ ] Coupon code validation works
- [ ] Checkout flow completes with Razorpay (test mode)
- [ ] COD option selectable
- [ ] Order confirmation displays order details
- [ ] All screens match Flutter screenshots at 350px

**Risk:** Very high. Payment integration (Razorpay) is the highest-risk phase. Test thoroughly in sandbox mode before any production deployment.

---

## Phase 8 — Authentication & Account

**Goal:** Login, registration, and all account management screens.

### Tasks

| # | Task | Notes |
|---|---|---|
| 8.1 | `app/auth/login/page.tsx` | Login page |
| 8.2 | `app/auth/signup/page.tsx` | Registration page |
| 8.3 | Wire `AuthContext` to Medusa auth API | `POST /auth/customer/emailpass` |
| 8.4 | Auth guard middleware | Redirect unauthenticated users from `/account/**` |
| 8.5 | `ProfileCard` component | User info display |
| 8.6 | `AccountMenuNav` component | Account sidebar navigation |
| 8.7 | `app/account/page.tsx` | Account overview |
| 8.8 | `app/account/profile/page.tsx` | Edit profile |
| 8.9 | `OrderCard` component | Order list card |
| 8.10 | `OrderTimeline` component | Order progress stepper |
| 8.11 | `app/account/orders/page.tsx` | Order history |
| 8.12 | `app/account/orders/[id]/page.tsx` | Order detail |
| 8.13 | `app/account/addresses/page.tsx` | Address management |
| 8.14 | `app/account/wishlist/page.tsx` | Wishlist |
| 8.15 | `app/account/notifications/page.tsx` | Notifications |
| 8.16 | `lib/api/customers.ts` | Auth, profile, address CRUD |

**Screenshot comparison:** Login, signup, account overview, orders, addresses, wishlist at all 7 viewports.

**Completion criteria:**
- [ ] Login and registration work against live Medusa backend
- [ ] Auth token is stored securely (httpOnly cookie, not localStorage)
- [ ] Account pages are protected (redirect to login if not authenticated)
- [ ] Profile editing saves correctly
- [ ] Addresses CRUD works
- [ ] Order history shows real orders
- [ ] Wishlist persists (even if local-only initially, matching Flutter behaviour)

**Risk:** High. Authentication token management and secure cookie handling on Next.js Server Components requires careful implementation.

---

## Phase 9 — Policy Pages

**Goal:** All three static policy pages and the policy hub.

### Tasks

| # | Task | Notes |
|---|---|---|
| 9.1 | `app/policies/layout.tsx` | `GlorovPolicyLayout` equivalent |
| 9.2 | `app/policies/page.tsx` | Policy hub with links to all policies |
| 9.3 | `app/policies/privacy/page.tsx` | Privacy Policy |
| 9.4 | `app/policies/terms/page.tsx` | Terms of Service |
| 9.5 | `app/policies/shipping/page.tsx` | Shipping & Trust Policy |

Content source: `docs/LEGAL_AND_POLICIES_FRAMEWORK.md`

**Risk:** Low. Static content only.

---

## Phase 10 — QA, Performance & SEO

**Goal:** All pages meet quality, performance, and SEO requirements.

### Tasks

| # | Task | Notes |
|---|---|---|
| 10.1 | Final screenshot comparison for all pages | At all 7 viewports |
| 10.2 | Playwright E2E test suite | Core purchase journey + auth flows |
| 10.3 | Playwright visual regression baseline | Save screenshot baselines |
| 10.4 | Lighthouse performance audit | LCP < 2.5s, CLS < 0.1 |
| 10.5 | Accessibility audit | `axe-core` or Lighthouse a11y score ≥ 90 |
| 10.6 | SEO: `generateMetadata()` on all pages | Title, description, OG image, canonical |
| 10.7 | SEO: `sitemap.ts` | Dynamic sitemap with all product and category routes |
| 10.8 | SEO: `robots.ts` | |
| 10.9 | Error boundaries on all pages | `error.tsx` files |
| 10.10 | `not-found.tsx` page | Branded 404 |
| 10.11 | CORS env update on backend | Add production Next.js domain to `STORE_CORS` |
| 10.12 | Environment variable audit | All secrets server-side only; public vars reviewed |

**Risk:** Medium. Performance on product listing pages with many images needs caching strategy.

---

## Phase 11 — Production Launch

**Goal:** Next.js storefront live in production alongside the existing Flutter Web.

### Tasks

| # | Task | Notes |
|---|---|---|
| 11.1 | Choose hosting | Firebase Hosting (static), Vercel, or self-hosted (Caddy on VM) |
| 11.2 | Update `firebase.json` or add new hosting config | Do not break existing Flutter Web deploy |
| 11.3 | Update GitHub Actions CI/CD | Add storefront build + deploy pipeline |
| 11.4 | DNS routing strategy | Flutter Web and Next.js on different subdomains OR path-based split |
| 11.5 | Production smoke test | All pages, auth, cart, checkout in production |
| 11.6 | Monitor error rates | First 24h post-launch |

> [!CAUTION]
> The Flutter Web app must remain deployed and functional for mobile app users. Ensure that the Flutter Web deploy pipeline is not affected by the addition of the Next.js storefront.

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Razorpay payment flow breaks in Next.js environment | Medium | Critical | Test in Razorpay test mode thoroughly; build a dedicated server route handler for webhook verification |
| Flutter Web breaks during migration | Low | High | Do not touch Flutter source; verify Firebase deploy pipeline is separate |
| Backend CORS blocks Next.js requests | Medium | High | Update `STORE_CORS` environment variable before running Next.js dev server |
| Auth cookie SameSite issues in development | Medium | Medium | Use `sameSite: 'none'` + `secure: true` matching backend cookie config; use HTTPS even in dev (mkcert) |
| `@glorov/types` missing cart/order types | Medium | Medium | Add missing types to the shared package in Phase 1 |
| Font files not rendering correctly on web | Low | Medium | Test font loading in Phase 1 before proceeding |
| Medusa API field changes in future updates | Low | High | Pin Medusa version; document all consumed fields; validate API boundaries |

---

## What Requires Your Decision Before Implementation

| Decision | Options | Impact |
|---|---|---|
| **Hosting for the Next.js storefront** | Firebase Hosting (static export — limited), Vercel, self-hosted Caddy VM | Determines `next.config.ts` output mode and deploy pipeline |
| **DNS routing strategy** | New subdomain (`www.glorov.in` → Next.js, `app.glorov.in` → Flutter Web) OR path-based | Determines how Flutter Web and Next.js coexist in production |
| **Wishlist persistence** | Keep local-only (matching current Flutter behaviour) OR implement backend wishlist API | Determines Phase 8 complexity |
| **Cart persistence strategy** | Medusa server-side cart with `cartId` in cookie OR hybrid local+server | Determines Phase 7 architecture |
| **Auth cookie vs localStorage** | httpOnly server cookie (more secure, recommended) OR localStorage (simpler) | Security decision |
| **Zod for API validation** | Add to shared package now OR use manual narrowing initially | Phase 1 dependency decision |
| **`packages/ui/` shared component library** | Create now alongside storefront OR keep components inside `apps/storefront/` | Phase 1 architecture decision |

> [!NOTE]
> **STOP HERE.**
>
> This is the end of the Phase 1 audit documentation. No implementation work has been started.
>
> Please review all 9 documentation files and provide your decisions on the open questions listed above. Once you approve, implementation can begin with Phase 1 of this roadmap.
