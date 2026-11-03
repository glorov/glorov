# 02 — Flutter Screen Inventory

> **Audit date:** 2026-11-03  
> **Source:** `flutter/lib/screens/`, `flutter/lib/route/app_routes.dart`, `flutter/lib/route/route_constants.dart`  
> **Status:** Analysis-only. No implementation has started.

---

## Overview

GLOROV Flutter has **20+ active customer-facing screens** implemented and wired into the named-route system. Each screen lives under `flutter/lib/screens/` and is exported via `flutter/lib/route/screen_export.dart`. The router (`app_routes.dart`) uses `generateRoute()` with `MicroPageRoute` (fade/slide transitions, 200 ms).

---

## Screen Inventory

### 1. Home Screen

| Property | Value |
|---|---|
| Route constant | `homeScreenRoute = "/"` |
| Source file | `flutter/lib/screens/home/glorov_home_screen.dart` |
| Purpose | Primary landing page — brand entry point |

**Main sections (top to bottom):**
1. `GlorovAnnouncementBar` — scrolling marquee ticker (data from `/store/announcements`)
2. `GlorovHeader` — logo + search + cart icon + category nav bar
3. `GlorovHeroBannerSlider` — full-width image carousel with dot indicators (data from `/store/banners`)
4. `GlorovHeroSection` — botanical hero showcase with featured product pills (data from `/store/hero`)
5. `GlorovValueProps` — trust icons row (Free Delivery, Authentic Seeds, etc.) — data from `/store/trust-badges`
6. `GlorovCategoryDiscovery` — category grid (Seeds, Plants, Planters, Care)
7. `GlorovFeaturedProducts` — horizontal product card rail (data from `/store/products`)
8. `GlorovOfferBanner` — promotional offer section (data from `/store/offers`)
9. `GlorovFooter`
10. `GlorovMobileBottomNav` (mobile only)

**API dependencies:** `/store/announcements`, `/store/banners`, `/store/hero`, `/store/trust-badges`, `/store/products`, `/store/offers`, `/store/product-categories`

**State dependencies:** `GlorovCartState` (cart badge count), `GlorovHeaderScrollNotifier` (header collapse on scroll)

**Responsive behavior:**
- Mobile (≤640px): Single column, full-width banner, 2-column product grid, bottom nav bar visible
- Tablet (641–1024px): 3-column product grid, no bottom nav
- Desktop (≥1025px): Max content width 1280px, 4-column product grid, no bottom nav

**Known 350px issues:** Hero banner text may overflow on very small widths. Category pill row needs horizontal scroll at 350px.

---

### 2. Categories / Discover Screen

| Property | Value |
|---|---|
| Route constant | `categoriesScreenRoute = "/categories"` |
| Source file | `flutter/lib/screens/discover/glorov_categories_screen.dart` |
| Purpose | Browse all product categories with visual tiles |

**Main sections:**
1. `GlorovHeader` (compact scroll-aware)
2. Category grid — each tile shows image + label + product count
3. Sub-category expansion on tap

**API dependencies:** `/store/product-categories`

**State dependencies:** `GlorovHeaderScrollNotifier`

**Navigation:** Tapping a category tile navigates to `glorov_catalog_screen` with category filter pre-applied.

**Responsive behavior:**
- Mobile: 2-column grid
- Tablet/Desktop: 3–4 column grid

---

### 3. Catalog / Product Listing Screen

| Property | Value |
|---|---|
| Route constants | `/seeds`, `/live_plants`, `/planters`, `/plant_care`, `/flowering`, `/herbs`, `/vegetables`, `/offers`, `/discover` |
| Source file | `flutter/lib/screens/catalog/glorov_catalog_screen.dart` |
| Purpose | Filtered product listing with sort and filter controls |

**Main sections:**
1. `GlorovHeader` with category breadcrumb
2. Filter bar (category chips, sort dropdown)
3. Product grid — `GlorovProductCard` instances
4. Load-more / pagination
5. Empty state when no results

**Loading state:** Skeleton shimmer grid cards
**Empty state:** "No plants found" illustration + CTA
**Error state:** Retry button with error message

**API dependencies:** `/store/products?category_id=...&limit=...&offset=...&q=...`

**State dependencies:** `GlorovHeaderScrollNotifier`, local `category`, `sort`, `filters` state

**Responsive behavior:**
- Mobile: 2-column grid
- Tablet: 3-column grid
- Desktop: 4-column grid, sidebar filter panel

**350px issues:** Filter chips may overflow horizontally; sort dropdown needs full-width treatment.

---

### 4. Product Details Screen

| Property | Value |
|---|---|
| Route constant | `productDetailsScreenRoute = "/product_details"` |
| Source file | `flutter/lib/screens/product/glorov_product_details_screen.dart` |
| Additional views | `flutter/lib/screens/product/views/product_details_screen.dart` |
| Purpose | Full product information, variant selection, add to cart |

**Main sections:**
1. `GlorovProductGallery` — sticky image gallery (swipeable, pinch-zoom on web)
2. Product title, botanical name, rating stars + review count
3. Price display (current + original + discount %)
4. Variant selector (packet size options)
5. Quantity stepper
6. Add to Cart / Buy Now CTAs
7. Pincode serviceability checker (`GlorovDeliveryAvailabilityAlert`)
8. Tabs: Description | Growing Guide | Reviews
9. Product reviews section (`ProductReviewsScreen` inline or navigated)
10. Recommended products rail

**Loading state:** Skeleton for gallery, title, price
**Error state:** Error card + back navigation

**API dependencies:**
- `/store/products/:id` (product data)
- `/store/reviews?product_id=:id` (reviews)
- `/store/pincode-check?pincode=:pin` (serviceability)
- `/store/recommendations?...` (related products)

**State dependencies:** `GlorovCartState` (add to cart), `GlorovAccountState` (wishlist)

**Responsive behavior:**
- Mobile: Single column, gallery full-width, sticky bottom CTA bar
- Tablet: Two-column (gallery left, info right)
- Desktop: Two-column, wider gallery, sidebar sticky purchase panel

**350px issues:** Variant selector pills must wrap cleanly; sticky bottom CTA must not overlap gallery.

---

### 5. Search Screen

| Property | Value |
|---|---|
| Route constant | `searchScreenRoute = "/search"` |
| Source file | `flutter/lib/screens/search/views/glorov_search_screen.dart` |
| Purpose | Live search with suggestions and submitted results |

**States:**
1. **Zero query:** Trending searches list, category suggestion pills
2. **Typing (suggestions):** Product thumbnails + titles + category pills from `/store/search/suggestions?q=...`
3. **Submitted:** Full product grid results from `/store/products?q=...`
4. **No results:** Empty state illustration + "Try different keywords" message

**API dependencies:** `/store/search/suggestions`, `/store/products`

**Responsive behavior:**
- Mobile: Full-screen overlay
- Desktop: Inline panel below header search bar

**350px issues:** Search input must be full-width; suggestion list items must not clip.

---

### 6. Cart Screen

| Property | Value |
|---|---|
| Route constant | `cartScreenRoute = "/cart"` |
| Source file | `flutter/lib/screens/cart/glorov_cart_screen.dart` |
| Purpose | View and manage cart items, apply coupons, proceed to checkout |

**Main sections:**
1. Cart item list (`GlorovOrderSummary` component)
   - Product thumbnail, name, variant, quantity stepper, remove button
2. Coupon / promo code input + validation
3. Free delivery progress bar (based on `GlorovCartState`)
4. Order summary: subtotal, discount, delivery, total
5. Checkout CTA button
6. Empty cart state with "Continue Shopping" link

**Loading state:** Skeleton item rows
**Empty state:** Illustration + CTA to home

**API dependencies:** Cart data managed locally in `GlorovCartState`; coupon validation via `/store/offers/validate`

**State dependencies:** `GlorovCartState` (primary), `GlorovAccountState` (auth check before checkout)

**Responsive behavior:**
- Mobile: Single column stack
- Desktop: Two-column (items left, summary right)

**350px issues:** Quantity stepper and remove button must not overlap product title.

---

### 7. Checkout Screen

| Property | Value |
|---|---|
| Route constant | `checkoutScreenRoute = "/checkout"` |
| Source file | `flutter/lib/screens/checkout/glorov_checkout_screen.dart` |
| Purpose | Multi-step checkout: address → shipping → payment → review |

**Steps:**
1. Delivery address (select existing or add new)
2. Pincode serviceability validation
3. Shipping method selection (Standard / Express / Shiprocket live rates)
4. Payment method selection (Razorpay / COD)
5. Razorpay SDK checkout launch (web: redirect; mobile: native Razorpay SDK)
6. Order review summary

**API dependencies:**
- `/store/carts/:id/shipping-methods`
- `/store/carts/:id/payment-sessions`
- `/store/payment/razorpay/create-session`
- `/store/carts/:id/complete`
- `/store/customers/me/addresses`
- `/store/pincode-check`

**State dependencies:** `GlorovCartState`, `GlorovAccountState`

**Responsive behavior:**
- Mobile: Stepper accordion
- Desktop: Two-column (form left, summary right)

**350px issues:** Form inputs must be full-width; payment buttons must have adequate tap target (≥48px).

---

### 8. Order Confirmation Screen

| Property | Value |
|---|---|
| Route constant | `thanksForOrderScreenRoute = "/thanks_order"` |
| Source file | `flutter/lib/screens/checkout/glorov_order_confirmation_screen.dart` |
| Purpose | Post-order success message with order details |

**Main sections:**
1. Success animation / checkmark
2. Order number and estimated delivery
3. Order item summary
4. "Track Order" and "Continue Shopping" CTAs

**API dependencies:** Order data passed via navigation arguments; optionally `/store/orders/:id`

**Responsive behavior:** Single column on all viewports.

---

### 9. Orders Screen

| Property | Value |
|---|---|
| Route constant | `ordersScreenRoute = "/orders"` |
| Source file | `flutter/lib/screens/order/glorov_orders_screen.dart` |
| Purpose | List of past and active orders |

**Main sections:**
1. Tab bar: Active | Past | Cancelled
2. Order cards with status badges, item thumbnails, total
3. "Track Order" and "Return/Cancel" actions per order

**API dependencies:** `/store/orders` (filtered by customer via auth)

**State dependencies:** `GlorovAccountState` (authenticated)

**Auth requirement:** Protected — redirects to login if unauthenticated.

**Responsive behavior:**
- Mobile: Single column list
- Desktop: Table-like wider layout with more columns visible

---

### 10. Account / Profile Screen

| Property | Value |
|---|---|
| Route constant | `profileScreenRoute = "/profile"` |
| Source file | `flutter/lib/screens/account/glorov_account_screen.dart` |
| Purpose | Account dashboard: profile info, menu links |

**Main sections:**
1. Profile card (avatar, name, email)
2. Menu items: Orders, Wishlist, Addresses, Settings, Support, Policies, Logout

**API dependencies:** `/store/customers/me`

**State dependencies:** `GlorovAccountState`

**Auth requirement:** Protected.

**Responsive behavior:**
- Mobile: Full-screen with bottom nav
- Desktop: Sidebar layout with content panel on right

---

### 11. Login Screen

| Property | Value |
|---|---|
| Route constant | `logInScreenRoute = "/login"` |
| Source file | `flutter/lib/screens/auth/views/login_screen.dart` |
| Purpose | Email + password authentication |

**Sections:** Email field, password field, forgot password link, sign-in button, sign-up link.

**API dependencies:** `POST /auth/customer/emailpass`

**Responsive behavior:** Centred card on desktop; full-screen on mobile.

**350px issues:** Form must not require horizontal scroll; buttons must be full-width.

---

### 12. Sign-Up Screen

| Property | Value |
|---|---|
| Route constant | `signUpScreenRoute = "/signup"` |
| Source file | `flutter/lib/screens/auth/views/sign_up_screen.dart` |
| Purpose | New customer registration |

**Sections:** First name, last name, email, password, phone (optional), register button, login link.

**API dependencies:** `POST /auth/customer/emailpass/register` + `POST /store/customers`

**Responsive behavior:** Same as Login.

---

### 13. Wishlist Screen

| Property | Value |
|---|---|
| Route constant | `bookmarkScreenRoute = "/bookmark"` |
| Source file | `flutter/lib/screens/wishlist/glorov_wishlist_screen.dart` |
| Purpose | Saved / bookmarked products |

**Sections:** Product grid of wishlisted items; empty state with "Explore Products" CTA.

**Data source:** Stored locally in `GlorovAccountState` (not persisted to backend yet — wishlist is local-only in current Flutter implementation).

**Auth requirement:** Protected — shows login prompt if unauthenticated.

**Responsive behavior:** 2-column grid on mobile; 3–4 column on tablet/desktop.

---

### 14. Addresses Screen

| Property | Value |
|---|---|
| Route constant | `addressesScreenRoute = "/addresses"` |
| Source file | `flutter/lib/screens/address/views/addresses_screen.dart` |
| Purpose | Manage saved delivery addresses |

**Sections:** Address list cards, add new address button, edit/delete per address.

**API dependencies:** `GET/POST/PUT/DELETE /store/customers/me/addresses/:id`

**Auth requirement:** Protected.

---

### 15. User Info / Edit Profile Screen

| Property | Value |
|---|---|
| Route constant | `userInfoScreenRoute = "/user_info"` |
| Source file | `flutter/lib/screens/user_info/views/user_info_screen.dart` |
| Purpose | View and edit account name, email, phone |

**API dependencies:** `GET /store/customers/me`, `POST /store/customers/me`

**Auth requirement:** Protected.

---

### 16. Product Reviews Screen

| Property | Value |
|---|---|
| Route constant | `productReviewsScreenRoute = "/product_reviews"` |
| Source file | `flutter/lib/screens/reviews/view/product_reviews_screen.dart` |
| Purpose | Full reviews listing with filter and sort |

**Sections:** Rating breakdown summary, sort/filter controls, review list.

**API dependencies:** `GET /store/reviews?product_id=...&sort=...&rating=...`

---

### 17. Policy Hub + Individual Policy Screens

| Route | Source file | Purpose |
|---|---|---|
| `/policies` | `glorov_policy_hub_screen.dart` | Links to all policies |
| `/privacy_policy` | `privacy_policy_screen.dart` | Privacy Policy content |
| `/terms_of_services` | `terms_of_service_screen.dart` | Terms of Service content |
| `/shipping_and_trust_policy` | `shipping_and_trust_policy_screen.dart` | Shipping Policy content |

**Layout:** `GlorovPolicyLayout` — shared wrapper with header, scrollable content, footer.

**Data source:** Static text content (no API). Content defined in `docs/LEGAL_AND_POLICIES_FRAMEWORK.md`.

---

### 18. Notifications Screen

| Property | Value |
|---|---|
| Route constant | `notificationsScreenRoute = "/notifications"` |
| Source file | `flutter/lib/screens/notification/view/notificatios_screen.dart` |
| Purpose | In-app notification list |

**Data source:** `NotificationRepository` — local in current implementation.

---

### 19. Preferences Screen

| Property | Value |
|---|---|
| Route constant | `preferencesScreenRoute = "/preferences"` |
| Source file | `flutter/lib/screens/preferences/views/preferences_screen.dart` |
| Purpose | App preferences (language, notification settings) |

---

### 20. Dev / Interaction Showcase Screen

| Property | Value |
|---|---|
| Route constant | `devInteractionShowcaseRoute = "/dev_showcase"` |
| Source file | `flutter/lib/screens/dev/interaction_showcase_screen.dart` |
| Purpose | Internal developer screen — not customer-facing |

> [!NOTE]
> This screen must **not** be migrated to the Next.js storefront. It is a development tool only.

---

## Route → Next.js Page Mapping

| Flutter Route | Next.js App Router Page | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Home |
| `/categories` | `app/categories/page.tsx` | Category browser |
| `/seeds`, `/live_plants`, etc. | `app/c/[handle]/page.tsx` | Dynamic catalog by category handle |
| `/product_details` | `app/products/[handle]/page.tsx` | Dynamic product detail |
| `/search` | `app/search/page.tsx` | Search |
| `/cart` | `app/cart/page.tsx` | Cart |
| `/checkout` | `app/checkout/page.tsx` | Checkout |
| `/thanks_order` | `app/order/confirmation/page.tsx` | Order confirmation |
| `/orders` | `app/account/orders/page.tsx` | Order history |
| `/profile` | `app/account/page.tsx` | Account dashboard |
| `/login` | `app/auth/login/page.tsx` | Login |
| `/signup` | `app/auth/signup/page.tsx` | Sign up |
| `/bookmark` | `app/account/wishlist/page.tsx` | Wishlist |
| `/addresses` | `app/account/addresses/page.tsx` | Addresses |
| `/user_info` | `app/account/profile/page.tsx` | Edit profile |
| `/product_reviews` | `app/products/[handle]/reviews/page.tsx` | Product reviews |
| `/policies` | `app/policies/page.tsx` | Policy hub |
| `/privacy_policy` | `app/policies/privacy/page.tsx` | Privacy policy |
| `/terms_of_services` | `app/policies/terms/page.tsx` | Terms |
| `/shipping_and_trust_policy` | `app/policies/shipping/page.tsx` | Shipping policy |
| `/notifications` | `app/account/notifications/page.tsx` | Notifications |
| `/dev_showcase` | **Not migrated** | Dev-only |

---

## Screens Sharing Similar Layout

| Group | Screens |
|---|---|
| Auth forms | Login, Sign-Up — same centered card layout |
| Account sub-pages | Orders, Addresses, Wishlist, Profile, Notifications — same sidebar/tab layout |
| Policy pages | Privacy, Terms, Shipping — same `GlorovPolicyLayout` scroll wrapper |
| Catalog pages | All category routes (`/seeds`, `/live_plants`, etc.) — same catalog grid |

---

## Responsive Issues Observed in Flutter Web

| Screen | Viewport | Issue |
|---|---|---|
| Home | 350px | Hero banner text may overlap with pill tags |
| Home | 350px | Category discovery row needs `overflow: scroll` |
| Product Details | 350px | Sticky bottom CTA bar risks covering gallery dots |
| Checkout | 350px | Address form labels truncate |
| Cart | 350px | Quantity stepper + delete icon compete for space on item row |
| Catalog | 350px | Sort/filter bar wraps awkwardly |

> [!WARNING]
> Do not reproduce broken Flutter layouts in the Next.js implementation. Document and fix each issue during the implementation phase, referencing this inventory.
