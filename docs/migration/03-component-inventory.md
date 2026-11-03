# 03 — Component Inventory

> **Audit date:** 2026-11-03  
> **Source:** `flutter/lib/components/`, `flutter/lib/screens/` (screen-local components)  
> **Status:** Analysis-only. No implementation has started.

---

## 1. Existing Flutter Components

All components live under `flutter/lib/components/`. They are organised into sub-directories by domain.

### Navigation Components

| Component | File | Responsibility |
|---|---|---|
| `GlorovAnnouncementBar` | `navigation/glorov_announcement_bar.dart` | Marquee ticker at the top of every page. Renders items from `/store/announcements`. Auto-scrolling, configurable speed and colours. |
| `GlorovHeader` | `navigation/glorov_header.dart` | App-wide top navigation: logo, search icon, cart badge, category nav bar. Scroll-aware — collapses on scroll down, reappears on scroll up. |
| `GlorovDrawer` | `navigation/glorov_drawer.dart` | Mobile slide-out navigation drawer. Contains category links, account link, search. |
| `GlorovMobileBottomNav` | `navigation/glorov_mobile_bottom_nav.dart` | Fixed bottom navigation bar (mobile only). Tabs: Home, Discover, Search, Cart, Account. |
| `GlorovFooter` | `navigation/glorov_footer.dart` | Site-wide footer. Logo, nav links, social icons, policy links, copyright. |
| `GlorovStorefrontScaffold` | `navigation/glorov_storefront_scaffold.dart` | Master layout wrapper. Composes Header + AnnouncementBar + MobileBottomNav + Footer around page content. |

### Home Page Components

| Component | File | Responsibility |
|---|---|---|
| `GlorovHeroBannerSlider` | `home/glorov_hero_banner_slider.dart` | Full-width auto-play image carousel with dot indicators. Fetches from `/store/banners`. |
| `GlorovHeroBannerSliderSkeleton` | `home/glorov_hero_banner_slider_skeleton.dart` | Loading skeleton for the banner carousel. |
| `GlorovHeroSection` | `home/glorov_hero_section.dart` | Botanical hero showcase — large feature image, headline, product category pills. Fetches from `/store/hero`. |
| `GlorovValueProps` | `home/glorov_value_props.dart` | Horizontal icon+label trust row. Fetches from `/store/trust-badges`. |
| `GlorovCategoryDiscovery` | `home/glorov_category_discovery.dart` | Grid of category tiles linking to catalog screens. |
| `GlorovFeaturedProducts` | `home/glorov_featured_products.dart` | Horizontally scrollable product card rail. |
| `GlorovOfferBanner` | `home/glorov_offer_banner.dart` | Promotional offer banner with countdown or CTA. Fetches from `/store/offers`. |

### Product Components

| Component | File | Responsibility |
|---|---|---|
| `GlorovProductCard` | `product/glorov_product_card.dart` | Standard product card for grids and rails. Shows image, title, price, discount badge, wishlist toggle, add-to-cart button. |
| `GlorovProductGallery` | `product/glorov_product_gallery.dart` | Sticky image gallery on product detail. Swipeable, with thumbnail strip. |
| `ProductCard` (generic) | `product/product_card.dart` | Lower-level product card variant (from template base). |
| Secondary product cards | `product/secondary/` | Alternative card styles (horizontal, compact). |

### Cart Components

| Component | File | Responsibility |
|---|---|---|
| `GlorovOrderSummary` | `cart/glorov_order_summary.dart` | Cart item list + totals block. Used in cart screen and checkout summary. |

### Logistics / Delivery Components

| Component | File | Responsibility |
|---|---|---|
| `GlorovDeliveryAvailabilityAlert` | `logistics/glorov_delivery_availability_alert.dart` | Pincode entry + serviceability result display. Shows estimated delivery days, COD availability. |

### Common / Utility Components

| Component | File | Responsibility |
|---|---|---|
| `GlorovCustomTrustIcon` | `common/glorov_custom_trust_icon.dart` | Custom SVG icon renderer for trust badge icons. |
| `GlorovScrollbar` | `common/glorov_scrollbar.dart` | Styled scrollbar wrapper for web. |
| `GlorovYScrollPassThrough` | `common/glorov_y_scroll_pass_through.dart` | Passes vertical scroll events through nested widgets (web scrolling fix). |

### General UI Primitives

| Component | File | Responsibility |
|---|---|---|
| `BlurContainer` | `blur_container.dart` | Glassmorphism blur background container. |
| `CartButton` | `cart_button.dart` | Floating cart action button with item count badge. |
| `CheckMark` | `check_mark.dart` | Animated checkmark confirmation indicator. |
| `DotIndicators` | `dot_indicators.dart` | Carousel dot pagination indicator row. |
| `NetworkImageWithLoader` | `network_image_with_loader.dart` | Cached network image with loading shimmer. |
| `OrderProcessCard` | `order_process.dart` | Visual order progress stepper. |
| `OrderStatusCard` | `order_status_card.dart` | Order status display chip. |
| `OutlinedActiveButton` | `outlined_active_button.dart` | Toggle-style outlined button. |
| `CardInfo` | `card_info.dart` | Generic information card container. |
| `ChatActiveDot` | `chat_active_dot.dart` | Online status indicator dot. |
| `CustomModalBottomSheet` | `custom_modal_bottom_sheet.dart` | Styled bottom sheet modal wrapper. |
| `BuyFullUIKit` | `buy_full_ui_kit.dart` | Template promotion widget — **NOT customer-facing, do not migrate.** |

### Banner Components (Template-origin)

| Component | File | Responsibility |
|---|---|---|
| `BannerL` / `BannerLStyle1` | `Banner/L/` | Large banner layouts from UI kit template |
| `BannerM` variants | `Banner/M/` | Medium banner styles (4 variants) + countdown variant |
| `BannerS` variants | `Banner/S/` | Small banner styles |
| `BannerDiscountTag` | `Banner/banner_discount_tag.dart` | Discount percentage badge overlay |

> [!NOTE]
> The `Banner/` directory contains largely template-origin components. Only `BannerDiscountTag` is actively used in GLOROV screens. The rest are reference implementations.

### List Tile Components

| Component | File | Responsibility |
|---|---|---|
| `CheckboxUnderlineListTile` | `list_tile/checkbox_underline_list_tile.dart` | Checkbox list tile with underline divider |
| `DividerListTile` | `list_tile/divider_list_tile.dart` | List tile with bottom divider separator |

---

## 2. Screen-Local Components

Some components are scoped to a single screen and live under `screens/`:

| Component | Location | Used by |
|---|---|---|
| `ProductImages` | `screens/product/views/components/product_images.dart` | Product details screen |
| `ProductInfo` | `screens/product/views/components/product_info.dart` | Product details screen |
| `ProductListTile` | `screens/product/views/components/product_list_tile.dart` | Product details screen |
| `ProductQuantity` | `screens/product/views/components/product_quantity.dart` | Product details screen |
| `SelectedColors` | `screens/product/views/components/selected_colors.dart` | Product details screen |
| `SelectedSize` | `screens/product/views/components/selected_size.dart` | Product details screen |
| `UnitPrice` | `screens/product/views/components/unit_price.dart` | Product details screen |
| `ProfileCard` | `screens/profile/views/components/profile_card.dart` | Account screen |
| `ProfileMenuItemListTile` | `screens/profile/views/components/profile_menu_item_list_tile.dart` | Account screen |
| `SearchForm` | `screens/search/views/components/search_form.dart` | Search screen |
| `ReviewProductCard` | `screens/reviews/view/components/review_product_card.dart` | Reviews screen |
| `WalletBalanceCard` | `screens/wallet/views/components/wallet_balance_card.dart` | Wallet screen |
| `WalletHistoryCard` | `screens/wallet/views/components/wallet_history_card.dart` | Wallet screen |

---

## 3. Proposed Next.js Reusable Component Architecture

This section defines which components to build for the Next.js storefront, where they should be placed, and their responsibilities.

### Component directory locations

```
apps/storefront/src/
├── components/
│   ├── layout/          ← page-level layout wrappers
│   ├── navigation/      ← header, footer, nav primitives
│   ├── product/         ← product card, gallery, pricing, badges
│   ├── cart/            ← cart item, summary, coupon input
│   ├── search/          ← search bar, suggestions dropdown
│   ├── home/            ← hero banner, category discovery, value props
│   ├── checkout/        ← checkout steps, address form, payment selector
│   ├── account/         ← profile card, order card, address card
│   ├── ui/              ← design-system primitives (Button, Input, Badge, etc.)
│   └── feedback/        ← skeletons, empty states, error states, toasts
```

---

### Layout Components (`components/layout/`)

| Component | Responsibility |
|---|---|
| `StorefrontLayout` | Root layout wrapper: AnnouncementBar + Header + children + Footer. Used in `app/layout.tsx`. |
| `PageContainer` | Max-width content container (1280px), horizontal padding. Used on every page. |
| `AccountLayout` | Two-column layout for account pages: sidebar nav + content panel. |

---

### Navigation Components (`components/navigation/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `AnnouncementBar` | `GlorovAnnouncementBar` | Marquee ticker. Fetches `/store/announcements`. |
| `Header` | `GlorovHeader` | Logo, search trigger, cart icon with badge, desktop nav links. Scroll-aware sticky behaviour. |
| `DesktopNav` | Part of `GlorovHeader` | Horizontal category navigation bar for desktop. |
| `MobileDrawer` | `GlorovDrawer` | Slide-in mobile navigation drawer. |
| `MobileBottomNav` | `GlorovMobileBottomNav` | Fixed bottom tab bar for mobile. |
| `Footer` | `GlorovFooter` | Site footer with nav links, policies, copyright. |
| `Breadcrumbs` | (implicit in Flutter) | Route breadcrumb trail for catalog and product pages. |

---

### Product Components (`components/product/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `ProductCard` | `GlorovProductCard` | Grid/rail product card. Image, title, price, discount badge, wishlist toggle. |
| `ProductGallery` | `GlorovProductGallery` | Product detail image gallery. Swipeable on mobile, thumbnail strip on desktop. |
| `ProductPrice` | `UnitPrice` (screen-local) | Price display: current price, original price, discount percentage. |
| `ProductBadge` | `BannerDiscountTag` | Discount / "New" / "Low Stock" badge overlay on product card. |
| `VariantSelector` | `SelectedSize` / `SelectedColors` | Packet size or option variant pill selector. |
| `QuantityStepper` | `ProductQuantity` | Increment/decrement quantity control with min/max bounds. |
| `RatingStars` | `flutter_rating_bar` | Star rating display. Read-only and interactive variants. |
| `ReviewCard` | `ReviewProductCard` | Single review display: author, date, rating, text, helpful vote. |
| `DeliveryChecker` | `GlorovDeliveryAvailabilityAlert` | Pincode input + serviceability result inline display. |

---

### Cart Components (`components/cart/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `CartItem` | Part of `GlorovOrderSummary` | Single cart line: image, name, variant, quantity stepper, remove, price. |
| `CartSummary` | `GlorovOrderSummary` | Order total block: subtotal, discount, delivery, grand total. |
| `CouponInput` | Part of cart screen | Promo code text field + apply button + validation feedback. |
| `FreeDeliveryProgress` | Part of cart screen | Progress bar showing amount needed for free delivery threshold. |
| `CartToast` | (Flutter shows toast) | "Added to cart" toast notification. |

---

### Search Components (`components/search/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `SearchBar` | `SearchForm` + header search | Search input field with clear button and submit action. |
| `SearchSuggestionsDropdown` | `GlorovSearchScreen` (suggestions state) | Popover showing product previews + category pills + trending searches. |
| `SearchResultsGrid` | `GlorovSearchScreen` (results state) | Product grid rendered from search query results. |

---

### Home Components (`components/home/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `HeroBannerSlider` | `GlorovHeroBannerSlider` | Auto-play image carousel with dot indicators. |
| `HeroSection` | `GlorovHeroSection` | Botanical hero: background image, headline, category pill links. |
| `ValuePropsBar` | `GlorovValueProps` | Trust icons row (Free Delivery, Authentic, etc.). |
| `CategoryDiscovery` | `GlorovCategoryDiscovery` | Category tiles grid. |
| `FeaturedProductsRail` | `GlorovFeaturedProducts` | Horizontally scrollable product card rail. |
| `OfferBanner` | `GlorovOfferBanner` | Promotional offer panel with CTA. |

---

### Checkout Components (`components/checkout/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `AddressForm` | Checkout address step | Add/edit delivery address form. |
| `AddressCard` | Part of addresses screen | Saved address display card with edit/select/delete. |
| `ShippingMethodSelector` | Checkout shipping step | List of available shipping options with prices. |
| `PaymentMethodSelector` | Checkout payment step | Razorpay and COD option cards. |
| `CheckoutSummary` | Part of checkout | Right-panel order summary during checkout. |

---

### Account Components (`components/account/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `ProfileCard` | `ProfileCard` | User avatar, name, email display. |
| `AccountMenuNav` | `ProfileMenuItemListTile` | Sidebar navigation links for account sub-pages. |
| `OrderCard` | `OrderStatusCard` | Past order summary card with status and actions. |
| `OrderTimeline` | `OrderProcess` | Visual step tracker for order progress. |

---

### UI Primitives (`components/ui/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `Button` | `ElevatedButton`, `OutlinedButton`, `TextButton` | Primary / secondary / ghost / danger button variants. |
| `Input` | `TextField` with `InputDecorationTheme` | Text input with label, hint, error, icon slots. |
| `Checkbox` | `Checkbox` with custom theme | Branded checkbox. |
| `Select` | `DropdownButton` | Styled select/dropdown. |
| `Modal` | `showDialog` | Accessible modal dialog with overlay. |
| `Drawer` | `GlorovDrawer` | Side-panel drawer with overlay. |
| `Badge` | `BannerDiscountTag` | Generic small badge (count, label, status). |
| `Chip` | Category/filter pills | Filter and category selection chips. |
| `Tabs` | `TabBar` on product detail | Horizontal tab navigation (Description, Reviews, etc.). |
| `Pagination` | (scroll-based in Flutter) | Numbered or load-more pagination for catalog. |

---

### Feedback Components (`components/feedback/`)

| Component | Replaces Flutter | Responsibility |
|---|---|---|
| `ProductCardSkeleton` | `GlorovHeroBannerSliderSkeleton` | Skeleton placeholder for product cards. |
| `GallerySkeleton` | (inline in product screen) | Skeleton for product image gallery. |
| `EmptyState` | Various empty illustrations | Generic empty state with icon, title, message, optional CTA. |
| `ErrorState` | Various error widgets | Error display with retry action. |
| `Toast` | `CartToast` + Flutter snackbar | Top/bottom toast notifications. |
| `Spinner` | `CircularProgressIndicator` | Loading spinner for async actions. |

---

## 4. Component Reuse Rules Summary

> [!IMPORTANT]
> These rules must be followed during the implementation phase.

1. **Never create the same component twice.** If a component already exists, reuse or extend it.
2. **`ProductCard` is the only product card.** Configure it with props (`showWishlist`, `showAddToCart`, `size`) rather than creating separate "catalog card" and "search card" variants.
3. **`EmptyState` is the only empty-state component.** Pass `icon`, `title`, `message`, and optional `action` props.
4. **`Button` covers all button variants** via a `variant` prop (`primary` | `secondary` | `ghost` | `danger` | `link`).
5. **`StorefrontLayout` wraps every page** — never repeat header + footer markup in individual pages.
6. **`AccountLayout` wraps every account sub-page** — never repeat the sidebar nav per account page.
7. Screen-local components (e.g., `CheckoutSummary`) should not be moved into `components/ui/` until they are needed by a second screen.

---

## 5. Duplicate / Overlapping Components to Avoid

| Risk | Resolution |
|---|---|
| `ProductCard` vs `SecondaryProductCard` vs horizontal card | One `ProductCard` with `orientation` and `size` props |
| `GlorovOrderSummary` used in cart AND checkout | Extract `CartSummary` reusable component shared by both pages |
| `SearchBar` in header AND search page | One `SearchBar` component, used in both places |
| `AddressCard` in checkout AND addresses screen | One `AddressCard` component, used in both |
| Multiple skeleton components per feature | One `ProductCardSkeleton`, parameterised by count |

---

## 6. Component Documentation Standard

Every reusable component must include a JSDoc block at the top of its file. See `08-typescript-quality-standards.md` for the full standard.

Minimum required fields:
- `@component` — Name
- `@description` — One-sentence purpose
- `@example` — Minimal usage snippet
- Prop interface with JSDoc on every prop
