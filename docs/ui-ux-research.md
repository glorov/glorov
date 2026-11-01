# GLOROV UI/UX Research and Architecture Audit

> **Document Version:** 1.0.0  
> **Target System:** GLOROV Storefront (Next.js 15 App Router, Medusa v2 Backend, PostgreSQL)  
> **Objective:** Establish the empirical research, component inventory, and architectural constraints for the 10-prompt visual and usability redesign inspired by Ugaoo.

---

## 1. Executive Summary & Problem Statement

GLOROV is an e-commerce platform specifically designed for selling high-viability garden seeds, Desi heirloom varieties, and climate-hardened live houseplants across India. The backend commerce infrastructure—powered by Medusa v2, PostgreSQL, Redis, custom Indian payment gateways (Razorpay, PhonePe, Cash-on-Delivery), multi-carrier shipping aggregation (Shiprocket, Delhivery), and comprehensive test coverage (681 automated tests, 45 test suites)—is fully functional and verified.

However, the existing storefront UI reflects an early engineering baseline:
1. **Utilitarian Visual Hierarchy:** Layouts rely heavily on unstyled default shadcn card primitives, neutral grays, and rigid rectangular grids that do not convey the living, organic richness expected by Indian gardening enthusiasts.
2. **Friction in Discovery & Purchasing:** Product cards require navigating to the Product Detail Page (PDP) even for simple single-variant seeds, missing the high-converting "Quick Add" and variant bottom-sheet patterns prevalent in leading D2C commerce.
3. **Absence of Botanical Trust Triggers:** Crucial Indian gardening considerations—such as climate zone sowing calendars, monsoon readiness, transit hydration guarantees, and seed viability test ratings—are buried in secondary tabs rather than surfaced prominently.
4. **Benchmark Inspiration:** [Ugaoo](https://www.ugaoo.com/) represents the leading Indian direct-to-consumer gardening standard, exhibiting polished category navigation circles, promotional ribbons, sticky PDP buy-boxes with expandable care accordions, and gamified cart drawers with free shipping threshold meters.

This UI redesign will elevate GLOROV to market parity with Ugaoo while preserving GLOROV's unique brand identity (the authentic botanical 'G' monogram and wordmark), existing API contracts, database schemas, and commerce logic.

---

## 2. Storefront Technical Stack & Existing Architecture

The GLOROV storefront operates as an independent Next.js application within a pnpm/Turborepo workspace:

| Layer | Technology | Specification / Current Version |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.1.7` (React 19, Turbopack compatible) |
| **Language** | TypeScript | `5.6.3` with strict mode enabled |
| **CSS & Design Tokens** | Tailwind CSS | `3.4.17` with `@tailwindcss/typography`, `tailwindcss-animate` |
| **UI Primitives** | shadcn/ui (Radix Primitives) | Accessible headless components (`Button`, `Card`, `Badge`, `Dialog`, `Sheet`, `Select`, `Tabs`, `Slider`) |
| **Icons & Brand Graphics** | Lucide React + Vector SVGs | `lucide-react@0.469.0`, brand vectors in `apps/storefront/public/` |
| **State Management** | React Context + LocalStorage | `CartContext` managing Medusa cart state, `localStorage`, and cookie sync |
| **API Client** | `@medusa/js-sdk` & Native Fetch | Typed Medusa v2 Store API client with publishable API key headers |
| **Currency & Number Formats** | Custom Indian Formatter | `formatINR()` in `apps/storefront/src/lib/utils.ts` (₹ symbol, lakhs/crores formatting) |

### Active Routes Inventory

The storefront serves the following verified routes (`apps/storefront/src/app/`):
- `/` — Homepage: Hero banner, value propositions, category showcase, featured products, gardening guide.
- `/store` — Product Listing Page (PLP): Server-rendered catalog with search (`q`), category filters, price range slider, facet checkboxes, sorting, and pagination.
- `/categories/[...category]` — Hierarchical category landing pages.
- `/products/[handle]` — Product Detail Page (PDP): Gallery, variant selector, botanical specs, pincode checker, trust badges, Schema.org JSON-LD.
- `/cart` — Dedicated Cart Page: Itemized line items, quantity adjustment, subtotal calculation, free shipping notices.
- `/checkout` — Commerce Checkout: Multi-step customer address entry, shipping option selection, payment initialization.
- `/order/confirmed/[id]` — Post-purchase order confirmation & tracking link.
- `/account/*` — Customer portal: `/account/login`, `/account/register`, `/account/profile`, `/account/orders`, `/account/addresses`.

---

## 3. Comprehensive Frontend Component Inventory

An exhaustive audit of `apps/storefront/src/components/` reveals the following component inventory:

### 3.1. Common & Shell Components (`src/components/common/`)

| Component | File Path | Current Role & Implementation | Visual Evaluation |
| :--- | :--- | :--- | :--- |
| `Header` | `Header.tsx` | Sticky desktop/mobile header with logo, navigation links, search bar, and cart trigger button. | Functional but rigid. Desktop navigation links lack mega-menu categorization; mobile menu is a basic slide-out list. |
| `AnnouncementBar` | `AnnouncementBar.tsx` | Fixed top bar displaying shipping notification. | Static single-message banner; lacks rotating multi-message ticker or promotional countdowns. |
| `Footer` | `Footer.tsx` | Multi-column footer with newsletter signup, legal links, botanical categories, and copyright. | Well-structured, but typography and email input styling could be softened with botanical warm tones. |
| `MobileNav` | `MobileNav.tsx` | Sheet-based mobile navigation drawer for small viewports. | Clean hierarchy, needs visual category icons and contact touchpoints. |
| `SearchInput` | `SearchInput.tsx` | Interactive debounced search box with live results dropdown. | Works well with keyboard navigation, but lacks visual product thumbnails in quick-search suggestions. |

### 3.2. Homepage Components (`src/components/home/`)

| Component | File Path | Current Role & Implementation | Visual Evaluation |
| :--- | :--- | :--- | :--- |
| `Hero` | `Hero.tsx` | Text-heavy banner with two CTA buttons and a transit packaging diagram. | Needs richer visual imagery, background organic curves, and responsive multi-slide carousel capability. |
| `CategoryShowcase` | `CategoryShowcase.tsx` | 6-card grid with category icons, descriptions, and badges. | Functional, but modern shoppers prefer horizontal category circle rails (avatars) for immediate mobile scanning. |
| `FeaturedProducts` | `FeaturedProducts.tsx` | Grid displaying top 4 products from the Medusa catalog. | Clean grid; needs carousel/rail controls for mobile and curated category tab filtering. |
| `ValuePropositions` | `ValuePropositions.tsx` | 4-column trust feature row (Viability Guaranteed, Desi Varieties, Air Transit, Safe Packaging). | Solid content; icons and card surfaces need botanical warmth and refined microcopy. |
| `GardeningGuide` | `GardeningGuide.tsx` | Informational block for seed germination and plant acclimation. | Good educational content; can be restyled into an engaging editorial lifestyle layout. |

### 3.3. Catalog & PLP Components (`src/components/catalog/`)

| Component | File Path | Current Role & Implementation | Visual Evaluation |
| :--- | :--- | :--- | :--- |
| `ProductCard` | `ProductCard.tsx` | Core product card displaying image, category badge, botanical name, title, price, and "Select Options" button. | **Critical Redesign Target:** Missing quick-add CTA, lacks customer review stars, lacks compare-at price strike-through, image ratio is unpadded. |
| `ProductGrid` | `ProductGrid.tsx` | Responsive CSS grid (1 col mobile, 2 col sm, 3 col md, 4 col xl). | Excellent layout foundation; needs seamless integration with updated card dimensions. |
| `CatalogFilters` | `CatalogFilters.tsx` | Faceted sidebar and mobile drawer with price slider, seed type, season, and stock toggles. | Thorough filtering; visual presentation can be streamlined with pill chips and collapsible accordions. |
| `Pagination` | `Pagination.tsx` | Accessible page number navigation with next/previous controls. | Standard pagination; clean and compliant. |
| `ProductGallery` | `ProductGallery.tsx` | Main product image viewer with thumbnail preview strip. | Works well; thumbnail carousel needs improved active focus rings and smooth swipe transitions on mobile. |
| `VariantSelector` | `VariantSelector.tsx` | Interactive buttons for selecting seed packet sizes (e.g., 25 seeds, 50 seeds) or live plant pot sizes. | Needs circular color swatches for planters/pots and rounded pill toggles for seed weights with savings badges. |
| `BotanicalSpecs` | `BotanicalSpecs.tsx` | Tabbed or list display of sunlight, watering, germination temperature, and soil pH. | Informative; can be transformed into Ugaoo-style visual icon badges and collapsible accordion sections. |
| `ProductTrustAndPolicies` | `ProductTrustAndPolicies.tsx` | Shipping safety guarantees, live transit replacement policy, seed testing warranty. | High customer value; needs refined iconography and compact expandable drawer presentation. |

### 3.4. Cart & Checkout Components (`src/components/cart/`, `src/components/shipping/`)

| Component | File Path | Current Role & Implementation | Visual Evaluation |
| :--- | :--- | :--- | :--- |
| `CartDrawer` | `CartDrawer.tsx` | Slide-over drawer displaying line items, quantity increment/decrement, and checkout button. | **Major Redesign Target:** Needs Free Shipping progress bar meter (e.g., "Add ₹350 more for Free Delivery"), upsell carousel, and coupon input. |
| `CartNavButton` | `CartNavButton.tsx` | Header cart icon with badge showing live item count. | Needs subtle bounce animation on item addition and clear badge contrast. |
| `PincodeChecker` | `PincodeChecker.tsx` | Pincode input component checking courier deliverability and estimated transit days. | High conversion asset; should be styled with a clean inline "Check" button and clear success/warning badges. |
| `ShipmentTracker` | `ShipmentTracker.tsx` | Timeline view of order tracking milestones. | Informative and clean; needs visual refinement to match the botanical design language. |

---

## 4. Technical Invariants & Guardrails (Non-Negotiables)

To prevent regression and maintain system integrity, the UI redesign operates under strict architectural guardrails:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GLOROV ARCHITECTURAL BOUNDARIES                      │
├────────────────────────────────────────────────────────────────────────┤
│  [UI / Presentation Layer]        <-- FULL FREEDOM FOR REDESIGN        │
│  - Tailwind CSS tokens & theme                                         │
│  - Typography & font hierarchy                                         │
│  - Layout grids, cards, drawers, hero, carousels                       │
│  - Micro-interactions, hover states, animations                        │
├────────────────────────────────────────────────────────────────────────┤
│  [Data Access & Formatting Layer] <-- STRICT PRESERVATION              │
│  - formatINR() integer paise handling (never float division errors)    │
│  - CartContext state machine and Medusa session token management       │
│  - Real stock validation (inventory_quantity vs overselling rules)     │
├────────────────────────────────────────────────────────────────────────┤
│  [Backend Contracts & APIs]       <-- READ-ONLY / DO NOT ALTER         │
│  - Medusa v2 Store APIs (/store/products, /store/carts, etc.)          │
│  - PostgreSQL schemas & migrations                                     │
│  - Payment webhook endpoints & shipping aggregator adapters           │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Zero Backend API & Database Modifications:** No modifications to Medusa v2 core, plugins, PostgreSQL schemas, or API endpoints. The redesign is strictly client-side presentation and layout.
2. **Preserve Indian Currency Calculations:** All Medusa prices are stored as integer paise (e.g. ₹299 is `29900`). All pricing display must continue using `formatINR()` from `@/lib/utils`.
3. **Preserve Session & Auth Cookies:** Customer JWT tokens (`_medusa_jwt`) and active cart IDs (`_medusa_cart_id`) must remain untouched to ensure checkout continuity.
4. **Authentic Botanical Branding:** GLOROV's bespoke botanical 'G' monogram (`glorov-g-symbol.svg`) and full wordmark (`glorov-logo.svg`) must remain the primary brand identity. Ugaoo is a reference for **layout, UX patterns, and component hierarchy**, not a source for direct brand cloning or proprietary asset extraction.
5. **Real Catalog Data Only:** No mock products or fabricated customer reviews. UI elements like ratings will gracefully show verified review scores or default to botanical viability guarantees when user reviews are pending.
6. **Accessibility Compliance (WCAG 2.1 AA):** All text combinations must meet minimum contrast ratios (4.5:1 for body, 3:1 for large headings). Interactive touch targets must maintain at least 44×44px on mobile devices. Focus rings (`focus-visible:ring-2`) must be preserved for keyboard accessibility.

---

## 5. Identified Gaps & Redesign Strategy

| Commerce Area | Current GLOROV Implementation | Ugaoo Benchmark Pattern | Redesign Strategy |
| :--- | :--- | :--- | :--- |
| **Global Header** | Standard fixed navbar with simple text links. | Multi-tier header: Rotating announcement ticker, clean logo, category mega-navigation, interactive search drawer, floating cart counter. | Implement rotating announcement bar, mobile bottom navigation bar, and enriched search drawer. |
| **Homepage Visuals** | Static text hero with synthetic packaging graphic; flat category cards. | High-resolution botanical photography carousel, horizontal category circles ("Category Avatars"), curated collection tabs. | Replace static hero with responsive botanical slider; introduce circular category rail; add curated plant/seed tabs. |
| **Product Card** | Simple card with "Select Options" button linking to PDP; no review stars; no discount badge. | 1:1 square image wrap with hover zoom, sale ribbon, bestseller badge, discount percentage pill, rating score, and direct "Add to Cart" / variant drawer. | Transform card into high-converting modular component with quick-add drawer, rating stars, and discount calculations. |
| **PDP Experience** | Standard 2-column layout; basic bulleted specs; separate pincode block. | Sticky right-hand buy box, thumbnail gallery slider, interactive pot/size swatches, inline pincode checker, and collapsible botanical care accordion. | Redesign PDP with sticky purchase panel, visual variant swatches, inline delivery estimator, and botanical care guide tabs. |
| **Cart Drawer** | Simple slide-out drawer showing items and subtotal. | Slide-over cart with free delivery progress meter, companion plant upsell carousel, coupon drawer, and trust security seals. | Enhance `CartDrawer` with dynamic free shipping progress bar, upsell rail, and checkout assurance triggers. |

---

## 6. Prompt 1 & Prompt 2 Execution Status

1. **Prompt 1 Complete:** Deep reference analysis with empirical evidence in `docs/ugaoo-reference-evidence.md`, technical token architecture and component mapping in `docs/glorov-ui-implementation-plan.md`, initial baseline screenshots verified.
2. **Prompt 2 Complete:** Safe setup and verification of `rea-agents@6.7.0` (Antigravity MCP registration aligned, reverse-engineering skill aligned), browser inspection dual pipeline verified, full 3-viewport screenshot gauntlet captured (360×800, 390×844, 1440×900) across 4 core reference pages and 4 GLOROV baseline pages.
3. **Ready for Prompt 3:** Centralized Design Token System, Typography & Theme Infrastructure.

---

## 7. Tool Setup and Browser Inspection Verification

- **REA Reverse-Engineering Tool:** `rea-agents@6.7.0` registered in `/Users/sourav/.gemini/config/mcp_config.json` with dedicated backup file preserved. Bundled reverse-engineering skill aligned in `/Users/sourav/.gemini/config/skills/reverse-engineer-anything` (207 tools).
- **Headless Chrome Engine:** Multi-viewport automated screenshot capture verified across `360×800`, `390×844`, and `1440×900` viewports, stored in `artifacts/ui-redesign/prompt-02/`.
- **System Non-Regression:** No storefront redesign was applied; application code, Medusa v2 APIs, database schemas, and routes remain completely untouched.

