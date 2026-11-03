# GLOROV Shared Storefront Components — Architecture & Component Guide

This document catalogs the shared storefront components implemented for the **GLOROV** Next.js App Router storefront (`apps/storefront`), detailing their architectural responsibilities, Flutter equivalents, TypeScript interfaces, responsive behaviors, accessibility features, and usage examples.

---

## 1. Architectural Philosophy & Reuse Policy

All shared components follow strict non-duplication rules:
1. **Foundation First**: Built on top of the design system tokens (`tokens.css`, `tailwind.config.ts`) and primitives (`Button`, `IconButton`, `Drawer`, `Modal`, `Badge`) created in Prompt 3.
2. **350px-First Responsive Standard**: Every component is built and verified to render cleanly without clipping or horizontal overflow on 350px viewports (strict mobile minimum).
3. **No Any Policy**: Every component, prop interface, callback, and state hook uses strict TypeScript.
4. **Separation of Concerns**: Layout components live in `src/components/layout/`, product components in `src/components/product/`, feedback in `src/components/feedback/`, and common utilities in `src/components/common/`.

---

## 2. Navigation & Layout Components

### 2.1 AnnouncementBar (`src/components/layout/AnnouncementBar.tsx`)
- **Flutter Source**: `flutter/lib/components/navigation/glorov_announcement_bar.dart`
- **Purpose**: High-contrast botanical luxury announcement banner in Forest Deep background (`#081C15`).
- **Features**:
  - Continuous marquee auto-scrolling with seamless loop.
  - Pauses automatically on desktop hover and mobile finger touch.
  - Highlights promotional perks (e.g., `₹499 FREE DELIVERY`, `98% GERMINATION`) using amber/sage badges.
  - Separates announcements with subtle botanical bullets (`•`).
- **Props**:
  - `items?: AnnouncementItem[]` (defaults to `MOCK_ANNOUNCEMENTS`)
  - `speedSeconds?: number` (default: 32)
  - `isAnimated?: boolean` (default: true)
  - `className?: string`
- **Accessibility**: Emits `role="region"` and `aria-label="Store Announcements"`.

### 2.2 Header (`src/components/layout/Header.tsx`)
- **Flutter Source**: `flutter/lib/components/navigation/glorov_header.dart`
- **Purpose**: Primary sticky storefront navigation header.
- **Features**:
  - **3px Accent Strip**: Forest Deep emerald line at top.
  - **Desktop Top Row**:
    - High-resolution SVG brand logo (`/logo/glorov-logo.svg`).
    - Pill search bar with dynamic rotating botanical search queries (`Search for plants, seeds, fertilizers & pots...`).
    - Live action buttons: Account profile, Wishlist (with count badge), and Shopping Cart (with item count badge).
  - **Mobile Top Row (350px-first)**:
    - Hamburger button (`openMobileMenu()`), brand logo, compact search pill, and badged cart icon.
  - **Category Strip**:
    - 8 botanical categories (`Seeds`, `Live Plants`, `Planters`, `Plant Care`, `Flowering`, `Herbs`, `Vegetables`, `Offers`).
    - Active category underline and highlight styling.
- **Props**:
  - `currentCategory?: string`
  - `className?: string`

### 2.3 MobileMenuDrawer (`src/components/layout/MobileMenuDrawer.tsx`)
- **Flutter Source**: `flutter/lib/screens/catalog/views/glorov_filter_sheet.dart` and `Scaffold.drawer`
- **Purpose**: Slide-out navigation drawer on mobile viewports (< 768px).
- **Features**:
  - Reuses Prompt 3's accessible `Drawer` component (`placement="left"`).
  - Complete category list with route links.
  - Account actions: Profile, My Orders & Tracking, Wishlist (with badge).
  - Trust & Support links: Plant Transit Shield, Terms, Privacy Policy.
  - Closes automatically on route transition, backdrop touch, or `Escape` key press.

### 2.4 MobileBottomNav (`src/components/layout/MobileBottomNav.tsx`)
- **Flutter Source**: `flutter/lib/components/navigation/glorov_mobile_bottom_nav.dart`
- **Purpose**: Fixed bottom navigation bar on mobile/tablet devices (< 768px).
- **Features**:
  - 4 essential destinations: `Home`, `Categories` (triggers drawer), `Cart` (with live counter badge), and `Account`.
  - Height 56px with safe-area inset bottom padding.
  - 44px minimum touch target compliance.

### 2.5 Footer (`src/components/layout/Footer.tsx`)
- **Flutter Source**: `flutter/lib/components/navigation/glorov_footer.dart`
- **Purpose**: Comprehensive storefront footer in Forest Dark (`#081C15`).
- **Features**:
  - Brand mission statement with white SVG logo and 100% Transit Safe shield guarantee.
  - Botanical offerings navigation column.
  - Growing Support and seed sowing guides column.
  - Growing Club newsletter signup with immediate feedback via botanical toast.
  - Bottom bar with copyright and policy links.

### 2.6 Breadcrumbs (`src/components/layout/Breadcrumbs.tsx`)
- **Flutter Source**: `_buildBreadcrumbs` across Flutter catalog, PDP, orders, and checkout screens.
- **Purpose**: Hierarchical trail navigation with Back button.
- **Features**:
  - Interactive Back button with chevron icon (`router.back()` or fallback link).
  - Pipe separator `|` and trail slash separators `/`.
  - Current item highlighted in primary text with `aria-current="page"`.
  - Horizontal scroll protection with hidden scrollbar.

### 2.7 PageContainer (`src/components/layout/PageContainer.tsx`)
- **Purpose**: Enforces 1280px max content width with responsive padding (16px on mobile, 24px on tablet, 32px on desktop).

---

## 3. Product Components

### 3.1 ProductCard (`src/components/product/ProductCard.tsx`)
- **Flutter Source**: `flutter/lib/components/product/glorov_product_card.dart`
- **Purpose**: Reusable botanical product card for catalog, search, recommendations, and homepage grids.
- **Features**:
  - Aspect ratio 1.05 media area with hover image zoom.
  - Top-left promotional badge: Dark navy tag (`#0C2340`) with gold bolt (`#F9C74F`).
  - Top-right wishlist button with bounce animation.
  - Bottom-left frosted glass rating pill (`backdrop-blur-md bg-white/85`):
    - "New" leaf chip if reviewCount is 0.
    - Green star + score + review count if reviews exist.
  - Editorial serif title (`font-serif`, `text-[#0F2F24]`).
  - Short botanical description.
  - Bottom row: Effective price, strikethrough original price, and green Add to Cart button.

### 3.2 ProductPrice (`src/components/product/ProductPrice.tsx`)
- **Purpose**: Indian Rupee (`₹`) price formatting with discount calculation.
- **Props**:
  - `price: number`
  - `originalPrice?: number`
  - `discountPercent?: number`
  - `size?: 'sm' | 'md' | 'lg'`
  - `showDiscountBadge?: boolean`

### 3.3 RatingStars (`src/components/product/RatingStars.tsx`)
- **Purpose**: Star rating score with full/half/empty SVG stars in botanical green (`#16A34A`) or amber (`#F59E0B`).

### 3.4 ProductBadge (`src/components/product/ProductBadge.tsx`)
- **Purpose**: Botanical domain badges (`promotional`, `organic`, `bestseller`, `sale`, `in-stock`, `low-stock`, `out-of-stock`).

### 3.5 WishlistButton (`src/components/product/WishlistButton.tsx`)
- **Purpose**: Heart toggle button connecting to centralized wishlist state.

### 3.6 AddToCartButton (`src/components/product/AddToCartButton.tsx`)
- **Purpose**: Quick add action with instant checkmark feedback, 3 variants (`circular`, `pill`, `full`), and 44px touch targets.

---

## 4. Common Storefront UI Components

### 4.1 QuantitySelector (`src/components/common/QuantitySelector.tsx`)
- **Purpose**: Stepper control for item counts with min/max bounds and 44px mobile touch targets.

### 4.2 Pagination (`src/components/common/Pagination.tsx`)
- **Purpose**: Accessible numbered pagination bar with smart ellipsis and Prev/Next controls.

### 4.3 Toast & ToastContainer (`src/components/feedback/Toast.tsx`)
- **Flutter Source**: `flutter/lib/core/interactions/interaction_feedback.dart` (`GlorovFeedback`)
- **Purpose**: Botanical toast notifications with high contrast backgrounds:
  - Success: `#0A4C36` (Forest Deep) with `#34D399` icon.
  - Error: `#7F1D1D` with `#F87171` icon.
  - Warning: `#78350F` with `#FBBF24` icon.
  - Info: `#1E293B` with `#60A5FA` icon.

---

## 5. Viewport Verification Results

All shared components were tested using Chrome DevTools Protocol at `http://localhost:3000/dev/shared-components` across all 7 viewports in priority order:

| Viewport | Device Class | Scroll Width | Inner Width | Horizontal Overflow | Result | Screenshot File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **350 × 800** | Small Mobile (Fold/SE) | 350px | 350px | **0px** | **PASS** | `sc-showcase-350x800.png` |
| **360 × 800** | Standard Android | 360px | 360px | **0px** | **PASS** | `sc-showcase-360x800.png` |
| **375 × 812** | iPhone Mini / X | 375px | 375px | **0px** | **PASS** | `sc-showcase-375x812.png` |
| **768 × 1024**| iPad Portrait | 768px | 768px | **0px** | **PASS** | `sc-showcase-768x1024.png` |
| **1024 × 768**| iPad Landscape | 1024px | 1024px | **0px** | **PASS** | `sc-showcase-1024x768.png` |
| **1280 × 800**| Small Laptop | 1280px | 1280px | **0px** | **PASS** | `sc-showcase-1280x800.png` |
| **1440 × 900**| Desktop Monitor | 1440px | 1440px | **0px** | **PASS** | `sc-showcase-1440x900.png` |

### Interaction Screenshots (350×800 Viewport)
- **Mobile Menu Drawer**: `sc-drawer-350x800.png` — **PASS (0px overflow)**
- **Botanical Toast**: `sc-toast-350x800.png` — **PASS (0px overflow)**
