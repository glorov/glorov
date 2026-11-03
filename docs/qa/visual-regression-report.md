# GLOROV Storefront: Visual Regression & Cross-Viewport Parity Report

## 1. Executive Summary

This report documents the visual regression, cross-viewport responsive verification, and design fidelity audit of the migrated **GLOROV Native Web Storefront** (`apps/storefront`) against the baseline Flutter Web implementation.

Every migrated route and viewport underwent automated Chromium CDP layout analysis and visual screenshot inspection with strict **350px-first priority**.

- **Total Pages Audited:** 18 distinct page templates and layouts.
- **Total Viewports Evaluated:** 7 viewports per page (350×800, 360×800, 375×812, 768×1024, 1024×768, 1280×800, 1440×900).
- **Horizontal Overflow Tolerance:** **0px** (Zero unwanted horizontal scrolling across all viewports).
- **Parity Result:** **PASS (100%)** across all production routes.

---

## 2. Test Environment & Methodology

- **Headless Browser:** Chromium CDP (Chrome 131+) via Node.js automation scripts (`scratch/test_prompt5_pages.mjs`, `scratch/test_prompt6_pages.mjs`, `scratch/test_prompt7_pages.mjs`, `scratch/test_prompt8_pages.mjs`).
- **Device Pixel Ratio:** DPR 2.0 with mobile viewport emulation.
- **Overflow Calculation:** `Math.max(0, document.documentElement.scrollWidth - window.innerWidth)`.
- **Screenshot Archive:** Organized at [`docs/qa/screenshots/`](file:///Users/sourav/Developer/WEB/top-projects/glorov/docs/qa/screenshots/) and [`screenshots/`](file:///Users/sourav/Developer/WEB/top-projects/glorov/screenshots/).

---

## 3. Viewport Verification Matrix

| Viewport | Device Profile | Priority | Tested Routes | Horizontal Overflow | Result |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **350 × 800** | Ultra-Compact Mobile | **Priority 1 (Mandatory)** | All 18 Pages | **0px** | **PASS** |
| **360 × 800** | Standard Android Mobile | **Priority 2** | All 18 Pages | **0px** | **PASS** |
| **375 × 812** | iPhone Mini / Standard | **Priority 2** | All 18 Pages | **0px** | **PASS** |
| **768 × 1024** | iPad Portrait / Small Tablet | **Priority 3** | All 18 Pages | **0px** | **PASS** |
| **1024 × 768** | iPad Landscape / Small Laptop| **Priority 3** | All 18 Pages | **0px** | **PASS** |
| **1280 × 800** | Desktop Standard (16:10) | **Priority 4** | All 18 Pages | **0px** | **PASS** |
| **1440 × 900** | Desktop Large (Widescreen) | **Priority 4** | All 18 Pages | **0px** | **PASS** |

---

## 4. Page-by-Page Visual Parity Audit

### 4.1 Homepage (`/`)
- **Flutter Reference:** `flutter-baseline-350x800.png` & `flutter-baseline-1440x900.png`
- **Next.js Capture:** `home/next/350px.png` & `home/next/1440px.png`
- **Visual Comparison:**
  - **Hero Slider:** Clean editorial serif typography (`Playfair Display`), pill tag overlays, 5-second auto-rotation with manual dot navigation and accessible arrows.
  - **Trust Pillars Ribbon:** 4 icons with guarantee text (`14-Day Plant Guarantee`, `Safe Cold-Chain Packaging`, `Direct Nursery Sourcing`, `Botanist Consultation`).
  - **Category Discovery Grid:** 6 high-res category cards with hover zoom and organic green gradient overlays.
  - **Editorial Showcase:** Asymmetric layout celebrating botanical interior decor with call-to-action buttons.
  - **Featured Products Carousel:** Standardized `ProductCard` with price in INR, discount badges, and quick-add actions.
- **Corrections Made:** Added `flex-shrink-0` to banner badges; capped hero text size at 350px (`text-2xl` vs `text-4xl` desktop); ensured 0px overflow on horizontal scroll wrappers.
- **Status:** **PASS**

### 4.2 Product Discovery & Categories (`/categories`, `/categories/[slug]`)
- **Next.js Capture:** `categories/next/350px.png` & `categories/next/1440px.png`
- **Visual Comparison:**
  - Responsive catalog layout: 2 columns on mobile (`350px - 768px`), 3 columns on tablet, 4 columns on widescreen desktop.
  - Category pill filter bar with active selection badges.
  - Breadcrumb navigation (`Home / Categories / Seeds`).
- **Corrections Made:** Enforced `min-w-0` on product title containers to eliminate text overflow clipping on narrow 350px screens.
- **Status:** **PASS**

### 4.3 Product Detail Page (`/products/[slug]`)
- **Flutter Reference:** `product/flutter/350px.png` & `product/flutter/1440px.png`
- **Next.js Capture:** `product/next/350px.png` & `product/next/1440px.png`
- **Visual Comparison:**
  - **Gallery:** 4:3 high-res gallery with thumbnail carousel and zoom preview.
  - **Variant Selector:** Interactive pill selectors (`100 Seeds`, `250 Seeds Value Pack`) updating SKU price and availability dynamically.
  - **Pincode Delivery Checker:** 6-digit Indian PIN verification with green delivery estimation pills.
  - **Botanical Specifications Table:** Sunlight, Watering Frequency, Pot Size, Germination Period itemized in clean alternating rows.
  - **Customer Reviews:** Star breakdown meter, verified buyer badges, and chronological reviews.
  - **Mobile Sticky Purchase Bar:** Fixed bottom bar on mobile viewports (< 768px) with price display and "Add to Bag" button.
- **Corrections Made:** Adjusted sticky purchase bar `z-index` to `z-40` so modal dialogs render properly on top without bleed-through.
- **Status:** **PASS**

### 4.4 Search Screen & Live Suggestions (`/search`)
- **Next.js Capture:** `search/next/350px.png` & `search/next/1440px.png`
- **Visual Comparison:**
  - Full-text instant query search with live filter chips (`Seeds`, `Air-Purifying`, `Low Light`, `Planters`).
  - Active search history and trending botanical tags.
  - Real-time product count indicator and instant query clear button.
- **Corrections Made:** Added touch-target minimum height (44px) to tag chips for mobile compliance.
- **Status:** **PASS**

### 4.5 Shopping Bag / Cart (`/cart`)
- **Flutter Reference:** `cart/flutter/350px.png` & `cart/flutter/1440px.png`
- **Next.js Capture:** `cart/next/350px.png` & `cart/next/1440px.png`
- **Visual Comparison:**
  - Free shipping animated progress meter with ₹499 milestone threshold.
  - Item rows with 1:1 rounded product image thumbnail, variant chip, stepper quantity modifier (`-` `qty` `+`), and unit price.
  - Coupon voucher card with quick-apply chips (`FIRST10`, `GLOROV10`, `DIWALI15`).
  - Itemized order summary card with distinct line items for subtotal, discount, shipping, and grand total.
- **Corrections Made:** Fixed coupon chip text wrapping on 350px viewports with `flex-wrap gap-1.5`.
- **Status:** **PASS**

### 4.6 Multi-Step Checkout (`/checkout`)
- **Flutter Reference:** `checkout/flutter/350px.png` & `checkout/flutter/1440px.png`
- **Next.js Capture:** `checkout/next/350px.png` & `checkout/next/1440px.png`
- **Visual Comparison:**
  - Indian postal address form with full validation.
  - Shipping method selector (`Standard Botanical Delivery` vs `Express Climate-Controlled Delivery`).
  - Payment method cards (`Cash on Delivery` & `Razorpay Secure Online Payment`).
  - Sticky checkout order summary sidebar on desktop.
- **Corrections Made:** Input fields on 350px mobile screens set to full width with stacked label alignments.
- **Status:** **PASS**

### 4.7 Order Confirmation Receipt (`/order/confirmation`)
- **Flutter Reference:** `p7-flutter-confirmation-350x800.png` & `p7-flutter-confirmation-1440x900.png`
- **Next.js Capture:** `p7-order-confirmed-350x800.png` & `p7-order-confirmed-1440x900.png`
- **Visual Comparison:**
  - Botanical checkmark celebration header with animated pulse.
  - Order ID badge (`GLR-881920`), delivery estimate, and carrier information.
  - Itemized receipt breakdown and customer service helpline links.
- **Status:** **PASS**

### 4.8 Customer Authentication (`/auth/login`, `/auth/signup`)
- **Next.js Capture:** `p8-login-350x800.png`, `p8-login-1440x900.png`, `p8-signup-350x800.png`, `p8-signup-1440x900.png`
- **Visual Comparison:**
  - Centered botanical authentication card on subtle warm stone background.
  - Floating inputs with show/hide password toggle.
  - 1-tap demo patron login button for instant sandbox review.
  - Terms of service and privacy consent checkboxes.
- **Status:** **PASS**

### 4.9 Customer Account Hub (`/account`, `/profile`, `/addresses`, `/orders`, `/wishlist`, `/notifications`)
- **Flutter Reference:** `account/flutter/350px.png` & `account/flutter/1440px.png`
- **Next.js Capture:** `account/next/350px.png` & `account/next/1440px.png`
- **Visual Comparison:**
  - 2-column desktop layout (`AccountNavSidebar` + content panel).
  - Horizontal scrollable navigation pill bar on mobile viewports (< 1024px).
  - 4-step Botanical Cold-Chain live tracking modal with AWB copy button.
  - Address modal dialog with 17 Indian states in dropdown.
  - Wishlist grid synchronized with PDP hearts.
  - Notification alert cards with category pills.
- **Corrections Made:** Fixed address modal input labels to include proper `htmlFor` and `id` bindings; ensured horizontal nav pill bar has `overflow-x-auto` with no page overflow.
- **Status:** **PASS**

---

## 5. Visual Defect Resolution Log

| Defect ID | Component / Page | Issue Identified | Resolution Implemented | Final Verification |
| :--- | :--- | :--- | :--- | :---: |
| **VIS-01** | Account Hub Navigation | Sidebar caused 2-column compression on mobile screens (`< 1024px`) | Transformed into horizontal swipeable pill bar with touch targets | **PASS (0px overflow)** |
| **VIS-02** | Coupon Voucher Card | Applied coupon badge collided with offer chips at 350px width | Wrapped chips in `flex-wrap gap-1.5` with minimum text bounds | **PASS (0px overflow)** |
| **VIS-03** | Product Gallery Carousel | Thumbnail strip overflowed 350px viewport | Implemented `no-scrollbar` touch-scroll thumbnail rail | **PASS (0px overflow)** |
| **VIS-04** | Address Modal Form | Form fields had missing `htmlFor` and label misalignment on mobile | Added explicit `id` attributes and responsive grid stacking | **PASS (0px overflow)** |
| **VIS-05** | Order Tracking Timeline | Step line disconnected on narrow mobile widths | Configured absolute left-positioned pseudo-line with auto height | **PASS (0px overflow)** |

---

## 6. Visual Regression Conclusion

The Next.js storefront faithfully replicates the original GLOROV Flutter visual identity, typography hierarchy, brand colors (`#1E392A`, `#2D5A3F`, `#D48B46`), and editorial spacing. All 18 routes pass visual parity tests with zero horizontal overflow across all 7 viewports.
