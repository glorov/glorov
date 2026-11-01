# GLOROV UI Redesign Implementation Plan

> **Document Version:** 1.0.0  
> **Target System:** GLOROV E-Commerce Storefront (`apps/storefront`)  
> **Reference Standard:** Ugaoo Layout & UX Benchmark  
> **Execution Strategy:** 10-Prompt Phased Redesign Workflow (Prompt 1 Complete, Prompts 2–10 Roadmap)

---

## 1. Centralized Theme Management Architecture

To ensure consistent visual styling across all pages and avoid hardcoded ad-hoc styles, GLOROV will establish a single canonical design token architecture combining **CSS Custom Properties**, **Tailwind CSS**, and **shadcn/ui primitives**.

### 1.1. Single Source of Truth Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SINGLE SOURCE OF TRUTH (SSOT)                       │
├────────────────────────────────────────────────────────────────────────┤
│  1. Design Token Foundation: apps/storefront/src/styles/theme.css      │
│     - HSL & HEX CSS Custom Properties (--brand-primary, --radius, etc.)│
│     - Semantic color assignments (background, card, border, text)      │
├────────────────────────────────────────────────────────────────────────┤
│  2. Framework Integration: apps/storefront/tailwind.config.ts         │
│     - Maps CSS custom properties to Tailwind utility classes           │
│     - Configures font families ('Outfit', 'Inter', botanical serif)    │
│     - Extends spatial tokens (radii, aspect-ratios, custom shadows)    │
├────────────────────────────────────────────────────────────────────────┤
│  3. UI Library Alignment: apps/storefront/src/components/ui/*          │
│     - Standard shadcn/ui components consume semantic theme tokens      │
│     - Variant styling powered by class-variance-authority (cva)        │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Design Token Schema Definition

#### Colors & Semantic Palette
```css
:root {
  /* Brand Botanicals */
  --brand-botanical-dark: #07532a;     /* Primary brand forest green */
  --brand-botanical-primary: #0a4c36;  /* Ugaoo-aligned deep green for buttons/links */
  --brand-botanical-light: #255e3a;    /* Secondary hover tone */
  --brand-botanical-surface: #f2f8f4;  /* Soft green tinted surface */
  
  /* Commercial & Functional */
  --price-regular: #0a4c36;            /* Primary bold price */
  --price-discount: #149253;           /* Promotional discounted price */
  --price-original: #78716c;           /* Compare-at strikethrough price */
  --badge-bestseller: #ffd51f;         /* Bestseller golden pill */
  --badge-sale-cut: #d93025;           /* Discount percentage badge */
  --badge-stock-low: #f59e0b;          /* Urgency warning */
  --badge-sold-out: #efece7;           /* Out-of-stock muted gray */
  
  /* Warm Earth Neutrals */
  --earth-cream: #fee7d1;              /* Warm peach highlight for promo bars */
  --earth-sand: #fdfbf7;               /* Off-white canvas background */
  --earth-divider: #e7e5e4;            /* Soft structural borders */
  --surface-image-wrap: #f7f7f7;       /* 1:1 image background placeholder */
  
  /* shadcn/ui Standard HSL Variables */
  --background: 40 20% 99%;
  --foreground: 155 30% 12%;
  --primary: 155 77% 17%;              /* #07532a */
  --primary-foreground: 0 0% 100%;
  --secondary: 42 30% 94%;
  --secondary-foreground: 155 45% 20%;
  --muted: 42 20% 94%;
  --muted-foreground: 150 14% 33%;
  --accent: 38 70% 92%;
  --accent-foreground: 28 80% 25%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 42 20% 88%;
  --input: 42 20% 88%;
  --ring: 155 77% 17%;
}
```

#### Typography Schema
- **Headings & Display (`font-heading`):** `Outfit`, system-ui, sans-serif. Used for titles, hero headlines, prices, badges, and primary buttons.
- **Body & Metadata (`font-body`):** `Inter`, system-ui, sans-serif. Used for product descriptions, specifications, policies, and form inputs.
- **Botanical Accent (`font-serif`):** `Playfair Display` or `Georgia`, serif. Used for italic Latin binomial botanical names (`Solanum lycopersicum`).

#### Radii, Spatial Elevation & Geometry
- **Card Border Radius:** Desktop: `18px` (`rounded-[18px]`); Mobile: `12px` (`rounded-[12px]`).
- **Pill Buttons & Badges:** `9999px` (`rounded-full`).
- **Modal & Drawer Radii:** Desktop: `16px`; Mobile Bottom Sheet: `20px 20px 0 0`.
- **Card Shadows:** `shadow-botanical` (`0 4px 20px -2px rgba(7, 83, 42, 0.08)`) and `shadow-botanical-lg` (`0 10px 30px -4px rgba(7, 83, 42, 0.12)`).

---

## 2. Component Mapping Table

Every existing component in `apps/storefront/src/components/` has been evaluated against Ugaoo benchmarks and assigned an action classification:

| Current Component | Location | Ugaoo Benchmark Equivalent | Action Classification | Target Prompt | Modernization Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Header` | `common/Header.tsx` | Sticky multi-tier header & mega-menu | **Refactor visually** | Prompt 3 | Add rotating announcement bar, mobile bottom bar, and interactive search trigger. |
| `AnnouncementBar` | `common/AnnouncementBar.tsx` | Rotating ticker banner (`.announcement-bar`) | **Refactor visually** | Prompt 3 | Convert static banner into animated cycling ticker with delivery & discount promos. |
| `MobileNav` | `common/MobileNav.tsx` | Slide-out mobile navigation drawer | **Refactor visually** | Prompt 3 | Enhance with category circle icons, phone/WhatsApp contact shortcuts, and account quick-links. |
| `SearchInput` | `common/SearchInput.tsx` | Live predictive search with thumbnails | **Refactor visually** | Prompt 5 | Integrate product image thumbnails, direct price display, and category quick-chips. |
| `Footer` | `common/Footer.tsx` | Comprehensive newsletter & legal footer | **Restyle** | Prompt 3 | Soften color palette with botanical green background, warm borders, and payment partner icons. |
| `Hero` | `home/Hero.tsx` | High-impact promotional lifestyle carousel | **Refactor visually** | Prompt 4 | Replace static text block with responsive botanical carousel, trust chips, and dual primary CTAs. |
| `CategoryShowcase` | `home/CategoryShowcase.tsx` | Horizontal Category Circle Rail | **Refactor visually** | Prompt 4 | Introduce horizontal circular avatar rail (80px circles) for rapid mobile category navigation. |
| `FeaturedProducts` | `home/FeaturedProducts.tsx` | Tabbed curated product rail | **Refactor visually** | Prompt 4 | Add category filter tabs ("Bestsellers", "Air Purifying", "Desi Seeds") with horizontal swipe on mobile. |
| `ValuePropositions` | `home/ValuePropositions.tsx` | Botanical trust & transit markers | **Restyle** | Prompt 4 | Style with soft cream cards, refined icons, and Pune nursery transit assurance badges. |
| `GardeningGuide` | `home/GardeningGuide.tsx` | Gardening journal / blog cards | **Restyle** | Prompt 4 | Present in clean 3-card editorial layout with botanical reading tags and publication dates. |
| `ProductCard` | `catalog/ProductCard.tsx` | Modular card with quick-add & rating | **Refactor visually** | Prompt 6 | **Core Redesign:** 1:1 image wrap, sale ribbon, discount badge, star rating, 2-line title, and quick-add CTA. |
| `ProductGrid` | `catalog/ProductGrid.tsx` | Responsive responsive collection grid | **Keep** | Prompt 5 | Layout engine is robust (1/2/3/4 cols); keep container structure, integrate redesigned cards. |
| `CatalogFilters` | `catalog/CatalogFilters.tsx` | Faceted drawer & pill filter bar | **Refactor visually** | Prompt 5 | Introduce active filter pill row, collapsible accordion groups, and mobile filter bottom-sheet. |
| `Pagination` | `catalog/Pagination.tsx` | Page numbers & next/previous controls | **Keep** | Prompt 5 | Fully functional and accessible; apply updated button styling tokens. |
| `ProductGallery` | `catalog/ProductGallery.tsx` | Interactive thumbnail slider & zoom | **Refactor visually** | Prompt 7 | Add mobile swipeable carousel, vertical desktop thumbnail strip, and active ring indicators. |
| `VariantSelector` | `catalog/VariantSelector.tsx` | Pot color swatches & packet size pills | **Refactor visually** | Prompt 7 | Create circular color swatches for planters, and pill chips for seed packet weights with savings tags. |
| `BotanicalSpecs` | `catalog/BotanicalSpecs.tsx` | Botanical care guide accordion | **Refactor visually** | Prompt 7 | Transform into Ugaoo-style visual icon accordion (Light, Watering, Soil, Feeding, Temperature). |
| `ProductTrustAndPolicies` | `catalog/ProductTrustAndPolicies.tsx` | Transit safety & guarantee block | **Restyle** | Prompt 7 | Compact into clean expandable drawer or trust badge grid with 48h live replacement policy. |
| `PincodeChecker` | `shipping/PincodeChecker.tsx` | `<pincode-checker>` with courier SLA | **Restyle** | Prompt 7 | Modernize input box with inline "Check" button, green checkmark delivery estimate, and COD status. |
| `ShipmentTracker` | `shipping/ShipmentTracker.tsx` | Milestone delivery timeline | **Restyle** | Prompt 9 | Align timeline dots and status cards with botanical green and earth tone tokens. |
| `CartDrawer` | `cart/CartDrawer.tsx` | Gamified slide-over cart with free shipping meter | **Refactor visually** | Prompt 8 | **Major Redesign:** Add Free Delivery tier progress bar, companion product upsell rail, and coupon drawer. |
| `CartNavButton` | `cart/CartNavButton.tsx` | Header cart trigger icon with counter badge | **Restyle** | Prompt 3 | Add pulse animation on cart mutation and high-contrast badge counter. |
| `AddressModal` | `account/AddressModal.tsx` | Customer address dialog | **Reuse UI-library** | Prompt 9 | Retain Radix Dialog primitive; restyle form fields, labels, and action buttons. |
| `AccountNav` | `account/AccountNav.tsx` | Customer profile navigation tabs | **Restyle** | Prompt 9 | Convert into sleek sidebar navigation with icons and active botanical highlights. |

---

## 3. Prompts 2–10 Execution Plan

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    10-PROMPT UI REDESIGN ROADMAP                        │
├─────────────────────────────────────────────────────────────────────────┤
│ [Prompt 1]  Audit, Research, REA Verification, Implementation Plan      │ <- DONE
│ [Prompt 2]  Centralized Theme System, Typography & Design Tokens        │
│ [Prompt 3]  Header, Announcement Bar, Navigation & Brand Shell          │
│ [Prompt 4]  Homepage Redesign: Hero, Category Circles, Curated Rails    │
│ [Prompt 5]  Product Listing (PLP), Faceted Filters & Search UX          │
│ [Prompt 6]  Product Card Overhaul & Quick-Add Variant Drawer            │
│ [Prompt 7]  Product Detail Page (PDP), Gallery & Care Accordions        │
│ [Prompt 8]  Cart Drawer, Free Shipping Meter & Checkout UX              │
│ [Prompt 9]  Account Pages, Address Book & Shipment Tracking UI          │
│ [Prompt 10] Cross-Device Polish, Accessibility & Visual Regression Test │
└─────────────────────────────────────────────────────────────────────────┘
```

### Prompt 2: Centralized Design Token System, Typography & Theme Infrastructure
- **Objective:** Establish the canonical design system. Install/configure Google Fonts (`Outfit` + `Inter`), build `src/styles/theme.css`, and update `tailwind.config.ts`.
- **Files Modified/Created:**
  - Create: `apps/storefront/src/styles/theme.css`
  - Modify: `apps/storefront/src/app/globals.css`
  - Modify: `apps/storefront/tailwind.config.ts`
  - Modify: `apps/storefront/src/app/layout.tsx` (font loaders)
- **Verification:** Tailwind build passes; computed styles match design tokens; fonts load without layout shift.
- **Screenshot Checkpoint:** Typography and color token preview harness.

### Prompt 3: Global Header, Announcement Ticker & Navigation Overhaul
- **Objective:** Redesign the header shell with a rotating announcement bar, responsive navigation, mobile bottom navigation bar, and refined brand presentation.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/components/common/Header.tsx`
  - Modify: `apps/storefront/src/components/common/AnnouncementBar.tsx`
  - Modify: `apps/storefront/src/components/common/MobileNav.tsx`
  - Modify: `apps/storefront/src/components/common/Footer.tsx`
  - Create: `apps/storefront/src/components/common/MobileBottomBar.tsx`
- **Verification:** Desktop mega-navigation operates smoothly; announcement bar cycles messages; mobile bottom bar responds to touch.
- **Screenshot Checkpoints:** Desktop header & mobile bottom bar across viewports.

### Prompt 4: High-Converting Homepage Redesign
- **Objective:** Build a vibrant homepage featuring a responsive botanical hero carousel, horizontal Category Circle Rail (Plants, Seeds, Pots, Fertilizers), curated tabbed product rails, and trust highlights.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/components/home/Hero.tsx`
  - Create: `apps/storefront/src/components/home/CategoryCircleRail.tsx`
  - Modify: `apps/storefront/src/components/home/FeaturedProducts.tsx`
  - Modify: `apps/storefront/src/components/home/ValuePropositions.tsx`
  - Modify: `apps/storefront/src/app/page.tsx`
- **Verification:** Category circles navigate to correct routes; hero displays clear CTAs; tabbed rail toggles products without page reload.
- **Screenshot Checkpoints:** Desktop and mobile homepage captures.

### Prompt 5: Product Listing Page (PLP), Faceted Filtering & Search UX
- **Objective:** Modernize `/store` with an intuitive faceted filter drawer, active filter chip row, sticky sort controls, and enhanced predictive search dropdown.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/app/store/page.tsx`
  - Modify: `apps/storefront/src/components/catalog/CatalogFilters.tsx`
  - Modify: `apps/storefront/src/components/common/SearchInput.tsx`
  - Modify: `apps/storefront/src/components/catalog/ProductGrid.tsx`
- **Verification:** Filter parameters properly update URL search params; mobile filter drawer opens/closes cleanly; search dropdown renders thumbnails.
- **Screenshot Checkpoints:** Desktop store with active filters & mobile filter drawer.

### Prompt 6: Modernized Product Card & Quick-Add Variant Drawer
- **Objective:** Completely overhaul `ProductCard` to match Ugaoo standards: 1:1 image wrap, hover zoom, sale ribbon, discount pill, review stars, 2-line title clamp, and quick "Add to Cart" / bottom-sheet variant drawer.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/components/catalog/ProductCard.tsx`
  - Create: `apps/storefront/src/components/catalog/QuickVariantDrawer.tsx`
- **Verification:** Quick-add adds single-variant product to cart instantly with loader; multi-variant item triggers drawer; discount percentage is mathematically accurate.
- **Screenshot Checkpoints:** Card hover states, sale ribbons, and mobile variant drawer.

### Prompt 7: Premium Botanical Product Detail Page (PDP)
- **Objective:** Redesign `/products/[handle]` with a sticky buy-box, interactive image gallery, pot color / seed weight variant selector, inline pincode delivery checker, and expandable botanical care accordion.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/app/products/[handle]/page.tsx`
  - Modify: `apps/storefront/src/components/catalog/ProductGallery.tsx`
  - Modify: `apps/storefront/src/components/catalog/VariantSelector.tsx`
  - Modify: `apps/storefront/src/components/catalog/BotanicalSpecs.tsx`
  - Modify: `apps/storefront/src/components/shipping/PincodeChecker.tsx`
- **Verification:** Sticky buy-box stays pinned during scroll; variant selection updates price and stock status; care accordion toggles smoothly; pincode check renders SLA.
- **Screenshot Checkpoints:** Desktop PDP view & mobile PDP above-the-fold with care accordion.

### Prompt 8: Interactive Slide-Over Cart Drawer & Free Shipping Gamification
- **Objective:** Upgrade `CartDrawer` with a real-time Free Shipping progress meter (₹999 threshold), companion upsell carousel, coupon accordion, and secure checkout CTA.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/components/cart/CartDrawer.tsx`
  - Create: `apps/storefront/src/components/cart/FreeShippingMeter.tsx`
  - Create: `apps/storefront/src/components/cart/CartUpsellRail.tsx`
  - Modify: `apps/storefront/src/app/cart/page.tsx`
- **Verification:** Progress bar calculates remaining amount to free shipping; upsell item adds to cart; quantity modifications update subtotal instantly.
- **Screenshot Checkpoints:** Open cart drawer with progress bar (<₹999 and ≥₹999 states).

### Prompt 9: Account Portal, Address Book & Post-Purchase Order Tracking
- **Objective:** Modernize `/account/*` and `/order/confirmed/[id]` with a refined botanical aesthetic, streamlined address modal, and milestone shipment tracking.
- **Files Modified/Created:**
  - Modify: `apps/storefront/src/components/account/AccountNav.tsx`
  - Modify: `apps/storefront/src/components/account/AddressModal.tsx`
  - Modify: `apps/storefront/src/components/shipping/ShipmentTracker.tsx`
  - Modify: `apps/storefront/src/app/account/page.tsx`
  - Modify: `apps/storefront/src/app/order/confirmed/[id]/page.tsx`
- **Verification:** Customer orders render clean status badges; address modal validates Indian postal codes; order tracking displays chronological milestones.
- **Screenshot Checkpoints:** Desktop account dashboard & order confirmation screen.

### Prompt 10: Cross-Device Polish, Accessibility Audit & Visual Verification
- **Objective:** Conduct full cross-device verification (360px, 390px, 768px, 1024px, 1440px), run WCAG 2.1 AA contrast audit, verify touch targets, and capture after-redesign screenshot gauntlet.
- **Files Modified/Created:**
  - Global CSS touchups and utility refinements
  - Create: `docs/ui-redesign-verification-report.md`
  - Capture: Full set of "After" screenshots in `artifacts/ui-redesign/prompt-10/`
- **Verification:** 100% automated test suites pass (`pnpm test`); zero accessibility violations; complete visual comparison matrix against Prompt 1 baselines.

---

## 4. Non-Regression Safeguards & Verification Strategy

To guarantee that the UI redesign does not compromise existing commerce capabilities, every prompt execution will adhere to the following verification gauntlet:

1. **Automated Test Suite Execution:**
   - Unit tests: `pnpm --filter @glorov/storefront test:unit`
   - Integration tests: `pnpm --filter @glorov/storefront test:int`
   - Full monorepo validation: `pnpm test`
2. **Contract Preservation:**
   - Medusa v2 Store API requests must preserve payload schemas and headers (`x-publishable-api-key`).
   - All price formatting must utilize `formatINR()` operating on integer paise.
3. **Accessibility Standards (WCAG 2.1 AA):**
   - High text contrast on all colored badges and buttons.
   - Interactive targets minimum 44×44px for thumb-driven mobile commerce.
   - Preserved `aria-label`, `aria-expanded`, and keyboard focus rings.
4. **Screenshot Verification:**
   - Every prompt will capture evidence in `artifacts/ui-redesign/prompt-XX/` to verify visual improvements against Prompt 1 baselines.
