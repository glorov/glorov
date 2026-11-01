# GLOROV Flutter Web Frontend UI/UX Architecture & Technical Blueprint

## 1. Executive Summary & Design Vision
**GLOROV** is a premium, modern direct-to-consumer e-commerce brand specializing in rare botanical plants, heirloom seeds, and handcrafted gardening essentials. 

This document defines the architectural foundation for transforming the open-source Flutter e-commerce base into a high-performance, responsive Flutter Web experience. The design direction is guided by:
- **Restrained Botanical Aesthetic:** Deep forest greens (`#1B4332`), calming sage (`#52B788`), warm earth tones (`#DDA15E`), and crisp neutral surfaces (`#F9FAF8` / `#FFFFFF`).
- **Clean Typography & Hierarchy:** High-readability typography using Plus Jakarta Display and Grandis Extended.
- **Responsive Desktop Canvas:** A tailored desktop browsing experience (max-width `1280px` canvas with structured top navigation, prominent search, multi-column product grids, and contextual filters) while maintaining a fluid, touch-optimized mobile web experience.
- **Centralized Token Architecture:** Total separation of design tokens (colors, typography, spacing, radii, breakpoints, elevation) from business logic and mock data.

---

## 2. In-Depth Frontend Audit & Screen Inventory

### 2.1 Workspace & Source Tree Inspection
The codebase at [`/Users/sourav/Developer/WEB/top-projects/glorov/flutter`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter) contains a fully modular Flutter web frontend:
- `lib/main.dart`: Root entry point invoking `MyApp` with `initialRoute: '/'` and title `GLOROV • Grow More. Live Greener.`.
- `lib/core/theme/`: Centralized Design Tokens (`app_colors.dart`, `app_typography.dart`, `app_spacing.dart`, `app_radii.dart`, `app_shadows.dart`, `app_breakpoints.dart`, `app_motion.dart`, `app_theme.dart`).
- `lib/components/navigation/`: `glorov_announcement_bar.dart`, `glorov_header.dart`, `glorov_drawer.dart`, `glorov_footer.dart`.
- `lib/components/home/`: `glorov_hero_section.dart`, `glorov_category_discovery.dart`, `glorov_featured_products.dart`, `glorov_value_props.dart`.
- `lib/components/product/`: `glorov_product_card.dart` with INR pricing, botanical badges, wishlist toggle, and cart action.
- `lib/components/cart/`: `glorov_order_summary.dart` (reusable order summary and coupon card).
- `lib/models/glorov/`: `glorov_product.dart`, `glorov_mock_data.dart`, `glorov_address.dart`, `glorov_delivery_option.dart`, `glorov_payment_method.dart`, `glorov_order.dart`.
- `lib/screens/catalog/`: `glorov_catalog_screen.dart` (reusable PLP, category browsing, and search results page).
- `lib/screens/product/`: `glorov_product_details_screen.dart` (production-grade PDP with gallery, variants, specs, reviews, and safe transit shield).
- `lib/screens/cart/`: `glorov_cart_screen.dart` (responsive cart page with item steppers, variant badges, and free shipping progress).
- `lib/screens/wishlist/`: `glorov_wishlist_screen.dart` (dedicated botanical wishlist with 1-click add-to-bag and sync).
- `lib/screens/checkout/`: `glorov_checkout_screen.dart` (simulated address form, delivery speeds, payment selection, and placement).
- `lib/screens/checkout/`: `glorov_order_confirmation_screen.dart` (post-checkout confirmation receipt and tracking link).
- `lib/screens/order/`: `glorov_orders_screen.dart` (order history with botanical transit checkpoints and re-order actions).
- `lib/services/`: `glorov_cart_state.dart` (reactive pure Flutter state manager with local storage persistence).
- `lib/services/storage/`: `local_storage.dart`, `local_storage_web.dart`, `local_storage_stub.dart` (cross-platform storage abstraction).

### 2.2 Screen Inventory & Status

| Screen Name | Current File Path | Status | GLOROV Implementation Strategy |
| :--- | :--- | :--- | :--- |
| **1. Storefront Home** | `lib/screens/home/views/home_screen.dart` | **Implemented** | Full GLOROV botanical storefront: Announcement bar, Header, Hero, Categories, Featured Products, Value Props, Footer. |
| **2. Category Browsing & PLP** | `lib/screens/catalog/glorov_catalog_screen.dart` | **Implemented** | Reusable category/catalog screen with subcategory pills, price/sunlight/type filters, active chips, and responsive grid. |
| **3. Search & Results** | `lib/screens/catalog/glorov_catalog_screen.dart` | **Implemented** | Live query search filtering over catalog with active filter indicators, recovery empty state, and suggestions. |
| **4. Product Details (PDP)** | `lib/screens/product/glorov_product_details_screen.dart`| **Implemented** | High-res gallery, pack/pot size variant selector, botanical quick-highlights grid, transit shield, care tabs, and reviews. |
| **5. Shopping Bag (Cart)** | `lib/screens/cart/glorov_cart_screen.dart` | **Implemented** | Desktop 2-column & mobile stacked bag, line subtotals, variant tags, quantity steppers, free transit progress, and suggestions. |
| **6. Botanical Wishlist** | `lib/screens/wishlist/glorov_wishlist_screen.dart` | **Implemented** | Synchronized wishlist grid, individual removals, 1-click "Add all to bag", and empty state recovery. |
| **7. Simulated Checkout** | `lib/screens/checkout/glorov_checkout_screen.dart` | **Implemented** | Delivery address form with validation, transit speeds, demonstration payment options (COD, UPI, Card), and order placement. |
| **8. Order Confirmation** | `lib/screens/checkout/glorov_order_confirmation_screen.dart`| **Implemented** | Order reference receipt (`GLR-ORD-2026-XXXX`), purchased items snapshot, address, payment method, and tracking links. |
| **9. Order History & Tracking** | `lib/screens/order/glorov_orders_screen.dart` | **Implemented** | Saved local orders list, visual 4-checkpoint botanical transit timeline, itemized snapshots, and instant re-order action. |
| **10. Plant Care & FAQs** | `lib/screens/preferences/views/preferences_screen.dart` | **Adaptable** | Accordion FAQ with germination guides. |

---

## 3. Centralized Design Tokens System (`lib/core/theme/`)

```
lib/core/theme/
├── app_colors.dart         # Nature-inspired semantic color palette
├── app_typography.dart     # Plus Jakarta & Grandis Extended text scale
├── app_spacing.dart        # 4px to 64px standardized spacing scale & insets
├── app_radii.dart          # Corner radius definitions (4px, 8px, 12px, 16px, pill)
├── app_shadows.dart        # Card, hover, header, and dropdown elevations
├── app_breakpoints.dart    # Desktop, tablet, and mobile viewport thresholds
├── app_motion.dart         # Animation curves & durations
└── app_theme.dart          # Unified Material3 ThemeData & AppThemeTokens
```

### 3.1 Color Palette
- **Forest Deep (`#1B4332`):** Primary brand identity, primary CTA buttons, active state accents.
- **Forest Medium (`#2D6A4F`):** Secondary brand green, hover interactions, subheaders.
- **Sage (`#52B788`):** Botanical accents, badge outlines, positive highlights.
- **Mint Badge (`#D8F3DC`):** Background for discount pills, stock tags, botanical category chips.
- **Earth Gold (`#DDA15E`):** Price highlights, seed germination tags, sun requirements.
- **Terracotta (`#BC6C25`):** Discount tags, alert badges, remove/cancel indicators.
- **Cream Surface (`#F9FAF8`):** Warm neutral canvas surface.
- **Pure White (`#FFFFFF`):** High-contrast product card backgrounds and input fields.
- **Charcoal Text (`#111827`):** Primary text color (WCAG AAA contrast).

---

## 4. Product Catalog & Category Discovery Architecture (`lib/screens/catalog/`)

The [`GlorovCatalogScreen`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/screens/catalog/glorov_catalog_screen.dart) provides a unified, production-grade browsing experience:
- **Dynamic Routing:** Supports both category-driven browsing (`discoverScreenRoute`) and keyword search queries (`searchScreenRoute`).
- **Sidebar & Mobile Sheet Filters:**
  - Product Type (`GlorovProductType.seeds`, `plants`, `supplies`)
  - Price Range presets (`Under ₹300`, `₹300 - ₹700`, `₹700 - ₹1,500`, `Over ₹1,500`)
  - Sunlight Requirements (Bright Indirect Light, Full Sun, Low Light)
  - Stock Availability toggle switch
  - Minimum Customer Rating (4.5★+, 4.0★+)
- **Active Filter Chips:** Visible tags with individual one-click dismissal and a "Clear All" action.
- **Sort Dropdown:** Recommended (Bestsellers first), Price Low to High, Price High to Low, Highest Rated, and Best Selling.
- **Empty State Recovery:** Botanical illustration, guidance copy, and a "Reset All Filters" button.

---

## 5. Product Details Architecture (`lib/screens/product/`)

The [`GlorovProductDetailsScreen`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/screens/product/glorov_product_details_screen.dart) provides an interactive botanical product page:
- **Image Gallery:** Multi-image preview with AspectRatio container, badges overlay, and interactive horizontal thumbnail selector.
- **Botanical Header:** Latin botanical name in italicized sage, title, star rating, verified review count, and stock status pill.
- **Variant Selector:** Interactive choice chips for pack/pot sizes updating effective price in real-time.
- **Quantity & Actions:** Stepper counter (`- 1 +`), primary "ADD TO CART" button with floating snackbar confirmation and "VIEW BAG" link, secondary "BUY NOW WITH 1-CLICK" action, and wishlist toggle.
- **Botanical Quick-Highlights 2x2 Grid:** Sowing depth, germination period, sunlight needs, and harvest timeline (for seeds); sunlight, watering, care level, and pet safety (for live plants).
- **Transit Shield Guarantee:** Eco packaging, root moisture protection, and 7-day hassle-free replacement.
- **Tabbed Accordion Sections:** Description & Benefits, Step-by-Step Care Protocol, Botanical Specifications Table, Pan-India Courier Shipping & Returns.
- **Customer Reviews:** Average rating score with star distribution bars and 3 verified buyer reviews.
- **Companion Pairings:** "You May Also Like" 4-column responsive grid.
- **Mobile Sticky Action Bar:** Bottom bar with price, active variant, and "ADD TO CART" action.

---

## 6. Cart & Wishlist Architecture (`lib/screens/cart/` & `lib/screens/wishlist/`)

### 6.1 Shopping Bag (`GlorovCartScreen`)
- **Responsive 2-Column Canvas:** 62% items list + 38% sticky order summary on desktop viewports; fluid single-column layout on mobile with bottom dock.
- **Item Stepper & Controls:** Increment/decrement quantity controls with lower bound checks (confirm removal on $< 1$, max limit 10).
- **Variant & Line Pricing:** Distinct entries for each product variant with unit price, line subtotal, and selected pack/pot size badge.
- **Free Transit Meter:** Visual progress bar tracking progress toward the ₹999 free shipping threshold.
- **Empty State Experience:** Botanical illustration, helpful copy, and "Explore Catalog" action followed by suggested botanical picks.

### 6.2 Botanical Wishlist (`GlorovWishlistScreen`)
- **Reactive Synchronization:** Real-time reflection of items toggled from product cards, product details, or moved from the cart.
- **Batch Actions:** "ADD ALL TO BAG" action that transfers all saved items into the active cart with confirmation feedback.
- **Card Controls:** Individual item removal and direct navigation into product details.

---

## 7. Order Summary & Pricing Calculation Architecture (`lib/components/cart/`)

The [`GlorovOrderSummary`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/components/cart/glorov_order_summary.dart) component centralizes all cart math:
- **Item Subtotal:** Dynamically computed from $\sum (\text{unitPrice} \times \text{quantity})$.
- **Shipping Costs:**
  - *Standard Eco Transit:* ₹0 if subtotal $\ge ₹999$, else ₹99.
  - *Express Priority Air Courier:* Flat ₹149.
- **Mock Coupon Rules:**
  - `GLOROV10`: 10% discount on cart subtotal (requires minimum order of ₹499).
  - `SEEDS20`: 20% discount on cart subtotal (requires minimum order of ₹599).
  - `FREESHIP`: 100% discount on shipping fees regardless of subtotal.
- **Total Payable:** Calculated dynamically as $\max(0, \text{subtotal} - \text{promoDiscount} + \text{shippingCost})$.
- **Demonstration Disclosures:** Clear labels noting that calculations and coupons represent simulated demonstration values.

---

## 8. Simulated Checkout & Mock Order Lifecycle (`lib/screens/checkout/`)

The [`GlorovCheckoutScreen`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/screens/checkout/glorov_checkout_screen.dart) provides a simulated, end-to-end checkout:
1. **Delivery Address Form:** Validates full name, 10-digit mobile phone, street address, city, state, and 6-digit PIN code. Includes a "Use Sample Address" autofill shortcut for rapid testing.
2. **Delivery Speed Selection:** Radio selector updating the order summary shipping cost dynamically.
3. **Payment Method Selection (Demonstration):** Supports Cash on Delivery, UPI Instant Transfer (with simulated QR & UPI ID input), and Credit/Debit Card preview without capturing sensitive secrets.
4. **Order Placement Lifecycle:**
   - Validates cart non-emptiness and address fields.
   - Generates unique reference ID: `GLR-ORD-[YEAR]-[RANDOM_5_DIGIT]`.
   - Captures an immutable snapshot of line items, prices, address, and method.
   - Appends order to local order history.
   - Clears cart items and resets applied coupons.
   - Transitions seamlessly to [`GlorovOrderConfirmationScreen`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/screens/checkout/glorov_order_confirmation_screen.dart).

---

## 9. Order Confirmation & History Architecture (`lib/screens/order/`)

### 9.1 Order Confirmation Receipt (`GlorovOrderConfirmationScreen`)
- Success checkmark celebration badge.
- Order reference number and formatted placement timestamp.
- Itemized list of purchased items with thumbnails, variants, quantities, and line totals.
- Delivery address and selected payment/delivery options.
- Breakdown of subtotal, shipping, discounts, and final amount paid.
- Shortcut buttons to "View Order History & Tracking" or "Continue Shopping".

### 9.2 Order History & Botanical Tracking (`GlorovOrdersScreen`)
- Lists all locally placed demonstration orders in reverse chronological order.
- Status badge (*"Confirmed"*, *"In Nursery Prep"*, *"Dispatched"*).
- Visual 4-checkpoint tracking bar (*Order Placed* $\rightarrow$ *Nursery Prep* $\rightarrow$ *Transit Shield* $\rightarrow$ *Delivered*).
- "Re-order Items" action that populates current cart and links to bag.

---

## 10. Cross-Platform Local Storage Persistence (`lib/services/storage/`)

Implemented in `lib/services/storage/local_storage.dart`:
- Abstract interface with conditional compilation:
  - `local_storage_web.dart`: Maps to browser `window.localStorage` when compiled for Web.
  - `local_storage_stub.dart`: In-memory fallback for unit testing or non-web targets.
- Persisted keys:
  - `glorov_cart_items`: Cart items list with product IDs, variants, and quantities.
  - `glorov_wishlist`: List of saved product IDs.
  - `glorov_address`: Last entered delivery address.
  - `glorov_orders`: History of locally created mock orders.
- Restores state automatically on application startup, allowing full cart/wishlist persistence across browser page refreshes.

---

## 11. Complete Verification Pipeline

Captured live in Google Chrome against the compiled production web build:

| Screen / Flow | Desktop Viewport | Mobile Viewport | Status |
| :--- | :--- | :--- | :--- |
| **Homepage** | `glorov-homepage-desktop.png` (1280x800) | `glorov-homepage-mobile.png` (390x844) | **Verified** |
| **Catalog / PLP** | `glorov-catalog-desktop.png` (1280x1000) | `glorov-catalog-mobile.png` (390x844) | **Verified** |
| **Product Details (PDP)** | `glorov-pdp-desktop.png` (1280x1200) | `glorov-pdp-mobile.png` (390x844) | **Verified** |
| **Shopping Bag (Cart)** | `glorov-cart-desktop.png` (1280x960) | `glorov-cart-mobile.png` (390x844) | **Verified** |
| **Botanical Wishlist** | `glorov-wishlist-desktop.png` (1280x960) | `glorov-wishlist-mobile.png` (390x844) | **Verified** |
| **Simulated Checkout** | `glorov-checkout-desktop.png` (1280x1100) | `glorov-checkout-mobile.png` (390x844) | **Verified** |
| **Order Confirmation** | `glorov-confirmation-desktop.png` (1280x1000) | `glorov-confirmation-mobile.png` (390x844) | **Verified** |
| **Order History & Tracking** | `glorov-orders-desktop.png` (1280x1000) | `glorov-orders-mobile.png` (390x844) | **Verified** |
| **Account Overview Hub** | `glorov-account-desktop.png` (1280x1000) | `glorov-account-mobile.png` (390x844) | **Verified** |
| **Customer Profile & Edit** | `glorov-profile-desktop.png` (1280x1000) | `glorov-profile-mobile.png` (390x844) | **Verified** |
| **Address Book Management** | `glorov-addressbook-desktop.png` (1280x1000) | `glorov-addressbook-mobile.png` (390x844) | **Verified** |
| **Notifications Center** | `glorov-notifications-desktop.png` (1280x1000) | `glorov-notifications-mobile.png` (390x844) | **Verified** |
| **Help Center & Searchable FAQ**| `glorov-help-faq-desktop.png` (1280x1100)| `glorov-help-faq-mobile.png` (390x844) | **Verified** |
| **Customer Support Form** | `glorov-support-desktop.png` (1280x1000) | `glorov-support-mobile.png` (390x844) | **Verified** |
| **Settings & Demo Data Reset** | `glorov-settings-desktop.png` (1280x1100)| `glorov-settings-mobile.png` (390x844) | **Verified** |

---

## 12. Account & Profile Hub Architecture (`lib/screens/account/`)

### 12.1 Account Hub Layout (`GlorovAccountScreen`)
- **Desktop (>= 1024px):** 2-column layout with a 280px left navigation sidebar and a rich right main content pane. Features active section indicators, badge counters, and seamless switching without full-page reloads.
- **Mobile (< 1024px):** Stacked dashboard overview featuring user initials hero avatar, metric stat cards, and intuitive menu list tiles. Sub-sections include a persistent back button ("< Back to Account Dashboard") for natural navigation.

### 12.2 Profile Management (`GlorovProfileSection`)
- Manages [`GlorovUserProfile`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/models/glorov/glorov_user_profile.dart).
- Form validation:
  - Full Name: $\ge 2$ characters.
  - Email: RFC 5322 regex validation.
  - Mobile Phone: 10-digit Indian mobile format (`^[6-9]\d{9}$`).
- Clear visual indicator distinguishing demonstration accounts from verified production credentials.

### 12.3 Address Book Architecture (`GlorovAddressBookSection`)
- Integrates with [`GlorovAddressFormDialog`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/screens/account/dialogs/address_form_dialog.dart).
- Features: Add, Edit, Delete (with confirmation dialog), Set Default Address, and Autofill Sample Address for quick testing.
- Single default address guarantee: Setting any address as default automatically unsets others.
- Fully synchronized with Checkout: Address choices instantly populate the simulated checkout address selector chips.

### 12.4 Notification Center (`GlorovNotificationsSection`)
- Reactive unread count synchronized with [`GlorovHeader`](file:///Users/sourav/Developer/WEB/top-projects/glorov/flutter/lib/components/navigation/glorov_header.dart).
- Category filtering: *All*, *Orders*, *Gardening Tips*, *Wishlist*, *Store News*.
- Actions: Mark as Read, Mark All as Read, Dismiss (delete), and direct route navigation.

### 12.5 Help Center & Searchable FAQ (`GlorovHelpFaqSection`)
- Real-time search query filtering over questions, answers, and horticultural metadata.
- Category filter chips (*Seeds & Sowing*, *Live Plant Care*, *Orders & Tracking*, *Transit & Guarantee*, *Account & Shopping*).
- Animated expandable accordion tiles using Flutter `ExpansionTile`.
- Empty search recovery state with search reset action.

### 12.6 Customer Support Interface (`GlorovSupportSection`)
- Inquiries contact form with topics dropdown, optional order reference, and live 500-character counter.
- Simulated ticket generation (`GLR-SUP-XXXX`) logged to `GlorovAccountState.supportTickets` with confirmation card and automatic notification logging.

### 12.7 Settings & Local Data Reset (`GlorovSettingsSection`)
- Channel preferences: Order updates, seasonal sowing alerts, promotional drops.
- Regional preferences: Language and measurement units.
- Danger Zone: Destructive demo account reset with confirmation modal, safely returning cart, wishlist, addresses, and orders back to initial demonstration defaults.
