# GLOROV Homepage, Categories, and Collection Pages — Migration Guide

This document details the architecture, sections, components, backend integrations, SEO metadata, and responsive verification for the **GLOROV Homepage, Category Directory, and Collection Product Listing Pages** in `apps/storefront`.

---

## 1. Pages Migrated

| Page Name | Next.js Route | Flutter Equivalent Source | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Storefront Homepage** | `/` (`src/app/page.tsx`) | `flutter/lib/screens/home/views/home_screen.dart` | Main landing experience featuring hero carousel, trust guarantees, category discovery, handpicked featured collections, and editorial showcase. |
| **Category Directory** | `/categories` (`src/app/categories/page.tsx`) | `flutter/lib/screens/discover/glorov_categories_screen.dart` | Full taxonomy directory with deep-dive subcategories, variety counts, and the Indian seasonal sowing calendar guide. |
| **Category / Collection Catalog** | `/categories/[slug]` (`src/app/categories/[slug]/page.tsx`) | `flutter/lib/screens/catalog/glorov_catalog_screen.dart` | Reusable product listing catalog with category banners, subcategory filter tabs, price/rating/bestseller sorting, in-stock filter, and pagination. |
| **Collection Route Alias** | `/collections/[slug]` (`src/app/collections/[slug]/page.tsx`) | Route alias | Redirects collection URLs to canonical `/categories/[slug]`. |
| **Offers Route Alias** | `/offers` (`src/app/offers/page.tsx`) | Route alias | Routes directly to discounted products in `/categories/offers`. |

---

## 2. Homepage Sections Implemented

The homepage structure accurately reproduces `HomeScreen` in Flutter:

### 2.1 HeroBannerSlider (`src/components/home/HeroBannerSlider.tsx`)
- **Flutter Source**: `flutter/lib/components/home/glorov_hero_banner_slider.dart`
- **Features**:
  - Carousel of 4 promotional slides using Cloudinary images from `apps/backend/data/banners.json`.
  - Multi-device image assets: Wide landscape for desktop (`2.75:1`) and tall portrait for mobile (`3:4`).
  - Autoplay (5s per slide) with pause on mouse hover and mobile finger touch.
  - Previous / Next buttons and active dot indicators.
  - Editorial overlay: Promotional badge (`GROW YOUR OWN`), display serif title, subtitle, and CTA button (`SHOP VEGETABLE SEEDS`) linking to category route.
  - Fallback background color (`bgColor`) for immediate layout stability prior to image paint.

### 2.2 ValuePropsRibbon (`src/components/home/ValuePropsRibbon.tsx`)
- **Flutter Source**: `flutter/lib/components/home/glorov_value_props.dart` & `glorov_offer_banner.dart`
- **Features**:
  - **Dynamic Welcome Offer**: Welcome banner with code `FIRST10` for 10% off and 1-tap copy-to-clipboard button triggering botanical toast.
  - **4 Botanical Trust Guarantee Pillars** in unified Forest Medium green ribbon (`#2D6A4F`):
    1. `90-Day Pre-Fertilised Soil`: Open-pollinated heirloom seeds tested for 98%+ germination vigor.
    2. `Arrives Healthy Guaranteed`: Custom ventilated botanical packaging ensuring shock-free transit.
    3. `Free Plant Replacement`: 7-day transit distress guarantee.
    4. `Lifetime Botanical Support`: Direct access to in-house botanists.
  - Circular white icon badges with custom botanical line-art icons.

### 2.3 CategoryDiscoveryGrid (`src/components/home/CategoryDiscoveryGrid.tsx`)
- **Flutter Source**: `flutter/lib/components/home/glorov_category_discovery.dart`
- **Features**:
  - 4 Root Seeded Categories:
    - `Seeds` (18 varieties, badge: '98% Germination')
    - `Live Plants` (24 varieties, badge: 'Nursery Fresh')
    - `Planters & Pots` (12 varieties, badge: 'Handcrafted')
    - `Plant Care & Soil` (15 varieties, badge: '100% Organic')
  - Image cards with zoom hover micro-interaction, variety count chip, and link to `/categories/[slug]`.
  - Responsive 2-column grid on mobile (< 640px) and 4-column row on desktop.

### 2.4 FeaturedProductsSection (`src/components/home/FeaturedProductsSection.tsx`)
- **Flutter Source**: `flutter/lib/components/home/glorov_featured_products.dart`
- **Features**:
  - Header with label `HANDPICKED FOR YOUR GARDEN` and title `Featured Botanical Collections`.
  - Interactive Filter Tabs: `All Featured`, `Live Plants`, `Heirloom Seeds`.
  - Grid of canonical `ProductCard` components with live cart quick-add and wishlist actions.
  - Discovery button linking to the full nursery catalog (`/categories`).

### 2.5 BotanicalEditorialShowcase (`src/components/home/BotanicalEditorialShowcase.tsx`)
- **Flutter Source**: `flutter/lib/components/home/glorov_hero_section.dart`
- **Features**:
  - Forest Deep background (`#081C15`) with ambient floral glow.
  - Tag: `CERTIFIED 100% ORGANIC NURSERY`.
  - Editorial headline: `Nurture Nature in Every Corner of Your Home`.
  - Action buttons: `Explore Desi Seeds` and `View Live Houseplants`.
  - 3 Trust metrics: `98%+ Germination Vigor`, `100% Transit Protected`, `50k+ Gardens Planted`.
  - Right visual highlight: Monstera Deliciosa with floating verified rating pill (`4.9 / 5.0`) and `Air-Purifying Certified` badge.

---

## 3. Category & Collection Catalog Experience

### 3.1 Category Directory (`/categories`)
- Provides deep-dive access to all 4 root botanical categories.
- Subcategory pill links for instant category filtering.
- **Indian Seasonal Planting & Sowing Calendar Guide**:
  - `Monsoon • Kharif` (June — Oct: Bottle Gourd, Okra, Chillies, Brinjal).
  - `Winter • Rabi` (Oct — March: Desi Tomatoes, Spinach, Carrots, Marigolds).
  - `Summer • Zaid` (March — June: Melons, Cucumbers, Mint).

### 3.2 Dynamic Collection & Category Catalog (`/categories/[slug]`)
- Supported categories: `seeds`, `live-plants`, `planters`, `plant-care`, `flowering`, `vegetables`, `herbs`, `offers`.
- **Breadcrumb Navigation**: `Home / Categories / Category Name` with Back button.
- **Subcategory Filters**: Horizontal pill tabs matching Flutter catalog filter sheet.
- **Sort Options**: `Recommended`, `Price: Low to High`, `Price: High to Low`, `Highest Rated`, `Best Selling`.
- **In-Stock Only Filter**: Toggle button with active green dot indicator.
- **Responsive Grid**: 2 columns on mobile, 3 on tablet, 4 on desktop.
- **Pagination**: Numbered pagination control with Prev/Next buttons.
- **Empty State**: Accessible `EmptyState` placeholder with action to reset filters when no products match.

---

## 4. Real Backend & Data Architecture

- **Banners**: Synced with Medusa backend banner data (`apps/backend/data/banners.json`) and `/store/banners`.
- **Trust Settings**: Synced with Medusa `/admin/trust-badges` and `apps/backend/data/trust-settings.json`.
- **Products & Catalog**: Seeded botanical taxonomy (`@glorov/types`, `StoreCatalogProduct`, `SeedMetadata`).
- **Static Generation (SSG)**: `generateStaticParams()` pre-renders all 8 category routes and collection aliases at build time, yielding 22 static pages.

---

## 5. SEO, Schema.org & Performance

1. **Structured Data (JSON-LD)**:
   - Root homepage emits `@type: Organization` and `@type: WebSite` with SearchAction.
   - Breadcrumbs emit Schema.org BreadcrumbList microdata.
2. **Metadata**:
   - Distinct page titles, meta descriptions, canonical URLs, and Open Graph tags across Homepage, Categories, and dynamic Collection pages.
3. **Image Optimization**:
   - `next/image` with responsive `sizes` attribute and priority loading on hero banners.
4. **Server Components**:
   - `page.tsx` and `categories/page.tsx` are React Server Components; interactivity is localized to Client Components (`HeroBannerSlider`, `FeaturedProductsSection`, `ValuePropsRibbon`).

---

## 6. Viewport Test Results & Screenshot Evidence

Automated headless Chrome CDP verification was executed at `http://localhost:3000/` across 21 test scenarios (3 pages × 7 viewports):

| Page | 350×800 (P1) | 360×800 (P2) | 375×812 (P2) | 768×1024 (P3) | 1024×768 (P3) | 1280×800 (P4) | 1440×900 (P4) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage** (`/`) | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** |
| **Categories** (`/categories`) | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** |
| **Catalog** (`/categories/seeds`)| **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** | **PASS (0px)** |

- **Console Errors**: 0
- **Runtime Exceptions**: 0
- **Screenshots Artifacts**: Saved in [`screenshots/prompt5/`](file:///Users/sourav/Developer/WEB/top-projects/glorov/screenshots/prompt5/)
  - `home-350x800.png` through `home-1440x900.png`
  - `categories-350x800.png` through `categories-1440x900.png`
  - `seeds-collection-350x800.png` through `seeds-collection-1440x900.png`
