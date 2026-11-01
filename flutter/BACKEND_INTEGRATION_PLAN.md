# GLOROV — Backend Integration Plan & Frontend Contract Audit

**Document Version:** 1.0.0  
**Target Platform:** Flutter Web (with future Android / iOS deployment parity)  
**Backend Target:** Medusa v2 Modular Commerce Backend (`apps/backend`) + PostgreSQL 16 + Redis 7  
**Scope:** Architecture Audit, Screen-by-Screen Data Specifications, Repository Pattern Contracts, DTO Serialization, and Phased Integration Roadmap  
**Market Context:** Indian Botanical D2C Commerce (Seeds, Live Nursery Plants, Gardening Care, Pots & Planters)

---

## 1. Executive Summary & Existing Backend Situation

### 1.1 Architectural Discovery

A comprehensive inspection of the repository reveals that GLOROV is organized as a monorepo containing:
1. **`apps/backend`**: A production-grade **Medusa v2** modular commerce backend (`@glorov/backend`) engineered specifically for the Indian botanical market.
   - **Database**: PostgreSQL 16 with Medusa v2 Drizzle ORM migrations.
   - **Caching & Event Bus**: Redis 7 for session caching, cart locks, and asynchronous subscribers.
   - **Botanical Metadata**: Custom seed and plant data models (`SeedMetadata`, germination periods, light requirements, watering needs, pet safety) stored within Medusa's JSONB `metadata` fields and verified against TypeScript schemas in `packages/types/src/botanical.ts`.
   - **Indian Logistics & Postal Codes**: Shiprocket courier integration module with automated 6-digit pincode serviceability validation (`/store/pincode-check`).
   - **Payment Modules**: Dual payment processing supporting Razorpay online payments (`/store/payment/create-session`, `/store/payment/verify`) and Cash on Delivery (COD) with automatic risk-tier checks.
2. **`flutter/`**: The Flutter Web storefront application, originally built on an e-commerce UI kit foundation and subsequently transformed into the GLOROV botanical design system (rich typography, botanical color palette, custom micro-interactions, responsive navigation, and simulated local state).

### 1.2 The Integration Gap

Prior to this contract audit, the Flutter Web frontend was disconnected from the Medusa v2 backend:
- The UI directly queried static in-memory objects (`GlorovMockData`).
- Cart, wishlist, and customer orders were maintained in synchronous local singletons (`GlorovCartState`, `GlorovAccountState`) backed by browser `window.localStorage`.
- No contract abstraction or service locator existed, meaning changing data fetching would require rewriting widget build methods.

### 1.3 The Solution: Data Access Boundary

To prepare GLOROV Flutter Web for seamless live integration without altering any UI design, layout, or micro-interaction behavior:
1. **Repository Contracts** (`lib/repositories/contracts/`): Abstract Dart interfaces defining data access contracts for Products, Carts, Orders, Accounts, Notifications, and Customer Support.
2. **Dual Implementations**:
   - `Mock/Local Repositories` (`lib/repositories/mock/`): In-memory and `LocalStorage`-backed adapters ensuring 100% offline functionality, immediate test execution, and CI stability.
   - `Remote HTTP Boundary` (`lib/repositories/remote/`): Type-safe `ApiResult<T>` envelopes, `MedusaApiConfig`, and `MedusaEndpoints` mapped directly to Medusa v2 Store API endpoints.
3. **Central Service Locator** (`GlorovRepositories`): Decouples UI screens from data implementation details, allowing single-line switching between mock and live Medusa environments (`GlorovRepositories.init(mode: RepositoryMode.remote)`).
4. **DTO Serialization**: Bidirectional JSON serialization (`toJson`, `fromJson`, `fromMedusaJson`, `fromMedusaCustomerJson`) supporting paise-to-rupee currency conversion, image array parsing, and botanical metadata extraction.

---

## 2. Screen-by-Screen Data & Contract Audit

The following audit covers every existing data-driven screen and feature in the GLOROV Flutter Web application. Each entry details data sources, state handling, required backend contracts, error/empty states, and recommended repository boundaries.

| Screen / Feature | Current Data Source | Current State Mechanism | Required Backend Data | Required User Actions | Expected Loading State | Expected Error State | Empty State Behavior | Recommended Repository Interface | Dependencies |
|---|---|---|---|---|---|---|---|---|---|
| **1. Homepage & Featured Showcase** (`lib/screens/home/views/home_screen.dart`) | `GlorovMockData.products`, `GlorovMockData.categories` | `StatelessWidget` / Static render | Top banners, Category collection list, Featured seeds, Best-selling houseplants, Gardening guides | View carousel, Tap category chip, Tap product card, Quick add-to-cart | `GlorovProductCardSkeleton` grid (shimmering 4-card row) | Error banner with retry button; falls back to cached items | Show "Seasonal collections coming soon" placeholder | `ProductRepository.getFeaturedProducts()`, `ProductRepository.getCategories()` | `GlorovCartState` (for cart badge and quick add) |
| **2. Category Discovery** (`lib/screens/discover/views/discover_screen.dart`) | `GlorovMockData.categories` | `StatelessWidget` | Category tree (`id`, `title`, `slug`, `bannerImageUrl`, `subcategories`) | Tap category card, View subcategories | Grid skeleton with image aspect ratio placeholders | "Unable to load categories" with refresh icon | Friendly botanical illustration: "No categories found" | `ProductRepository.getCategories()` | `ProductRepository` |
| **3. Product Listings / Catalog** (`lib/screens/catalog/glorov_catalog_screen.dart`) | `GlorovMockData.products` | `StatefulWidget` + local filter state | Filtered product array (`id`, `title`, `botanicalName`, `price`, `discountPrice`, `rating`, `inStock`, `badges`) | Filter by Category, Sunlight, Difficulty, Stock status; Sort by Price/Rating; Pagination | Staggered grid of `GlorovProductCardSkeleton` items | Error message tile with "Reload Catalog" CTA | "No botanical products match your active filters. Clear filters to explore." | `ProductRepository.getProducts(filter: ...)` | `GlorovCartState`, `ProductRepository` |
| **4. Search & Autocomplete** (`lib/screens/search/views/search_screen.dart`) | `GlorovMockData.searchProducts()` | `StatefulWidget` + `TextEditingController` | Matching products by title, botanical binomial, category, tags, and description | Enter search term, Clear search, Select auto-suggestion, Tap result | Inline pulsing search indicator in search bar | "Search failed. Check your internet connection." | "No seeds or plants found for '[query]'. Try searching for 'Tomato', 'Basil', or 'Monstera'." | `ProductRepository.getProducts(filter: GlorovProductFilter(searchQuery: ...))` | `ProductRepository` |
| **5. Product Details Screen (PDP)** (`lib/screens/product/views/glorov_product_details_screen.dart`) | `GlorovMockData.getProductById()`, `getRelatedProducts()` | `StatefulWidget` + variant selection state | Full product entity: image gallery, variants (seed packet size / pot size), botanical specs, related product IDs | Select pack size variant, Increment/decrement quantity, Toggle wishlist, Add to cart, Buy Now, Check pincode | Shimmer skeleton matching PDP layout: image carousel block, title block, price block, button block | "Plant not found or unavailable." with "Back to Catalog" button | N/A (404 page if invalid product ID/slug) | `ProductRepository.getProductById()`, `ProductRepository.getProductBySlug()`, `ProductRepository.getRelatedProducts()` | `GlorovCartState`, `CartRepository` |
| **6. Cart Screen & Slide-Over Drawer** (`lib/screens/cart/glorov_cart_screen.dart`, `components/cart_button.dart`) | `GlorovCartState` in-memory items | `ListenableBuilder` listening to `GlorovCartState` | Cart line items, Variant details, Subtotal, Applied discount, Delivery charge, Free shipping threshold progress (₹999) | Change line quantity, Remove item, Move item to wishlist, Apply coupon code, Proceed to checkout | Subtle spinner on quantity button / disabled state during sync | Toast message: "Failed to update item quantity" (reverts optimistic update) | Full-screen empty cart state: "Your botanical bag is empty" with "Explore Seeds" CTA | `CartRepository.getCartItems()`, `CartRepository.updateQuantity()`, `CartRepository.removeItem()`, `CartRepository.validateCoupon()` | `GlorovCartState`, `ProductRepository` |
| **7. Wishlist Screen** (`lib/screens/wishlist/glorov_wishlist_screen.dart`) | `GlorovCartState._wishlistIds` mapped to `GlorovMockData` | `ListenableBuilder` listening to `GlorovCartState` | Customer's saved product IDs, Live product availability, Current pricing | Remove from wishlist, Move individual item to cart, "Add All to Cart" action | `GlorovListItemSkeleton` staggered list | "Failed to refresh wishlist" snackbar | Empty heart illustration: "Your wishlist is empty. Save plants and seeds for later." with "Start Browsing" button | `CartRepository.getWishlistIds()`, `CartRepository.toggleWishlist()`, `CartRepository.addAllWishlistToCart()` | `GlorovCartState`, `ProductRepository` |
| **8. Checkout & Address Selection** (`lib/screens/checkout/views/glorov_checkout_screen.dart`) | `GlorovCartState` address list & delivery options | `StatefulWidget` + `GlorovCartState` | Saved addresses, Serviceable pincodes, Delivery speed options (Standard ₹0/₹99, Express ₹149), Payment methods | Select delivery address, Add new address with PIN validation, Choose delivery speed, Choose payment method, Place Order | Animated button loader on "Confirm & Place Order" | Inline form errors (red text) or payment modal error dialog | N/A (Redirects to Cart if cart is empty) | `AccountRepository.getAddresses()`, `AccountRepository.saveAddress()`, `OrderRepository.placeOrder()` | `GlorovCartState`, `OrderRepository`, `AccountRepository` |
| **9. Order Confirmation Screen** (`lib/screens/checkout/views/glorov_order_confirmation_screen.dart`) | `GlorovCartState._orders.first` | `StatelessWidget` | Created order ID, Order date, Item breakdown, Shipping address, Delivery estimate, Total paid | View order summary, Download botanical care guide, Track order, Continue shopping | Immediate display from state; skeleton if loaded via deep link | "Order details could not be retrieved" with support email link | N/A | `OrderRepository.getOrderById(orderId)` | `OrderRepository`, `GlorovCartState` |
| **10. Order History & Detail** (`lib/screens/order/views/orders_screen.dart`) | `GlorovCartState._orders` | `ListenableBuilder` listening to `GlorovCartState` | Historical order list: order numbers, status badges, order dates, line items, delivery tracking link | View past orders, Tap to view order detail, Reorder items, Request return/cancellation | Staggered list skeletons matching order card geometry | "Unable to load orders. Tap to retry." | "No orders placed yet. Your garden journey starts here!" with "Explore Bestsellers" CTA | `OrderRepository.getOrders()`, `OrderRepository.getOrderById()` | `GlorovCartState`, `OrderRepository` |
| **11. Customer Profile Section** (`lib/screens/account/sections/profile_section.dart`) | `GlorovAccountState.profile` | `ListenableBuilder` listening to `GlorovAccountState` | Customer name, Email, Phone (+91), Membership tier, Experience level, Garden type | Edit display name, Edit phone number, Save profile changes | Button loading spinner with checkmark transition | Form field validation errors below input | N/A | `AccountRepository.getProfile()`, `AccountRepository.updateProfile()` | `GlorovAccountState`, `AccountRepository` |
| **12. Notification Center** (`lib/screens/account/sections/notifications_section.dart`) | `GlorovAccountState.notifications` | `ListenableBuilder` listening to `GlorovAccountState` | In-app notifications: order updates, botanical sowing tips, seasonal promotions | Tap notification to mark read, "Mark all as read" button | Staggered list item skeletons | "Unable to load notifications" | Bell icon: "You are all caught up! No new notifications." | `NotificationRepository.getNotifications()`, `NotificationRepository.markAsRead()`, `NotificationRepository.markAllAsRead()` | `GlorovAccountState`, `NotificationRepository` |
| **13. Help & Support / FAQs** (`lib/screens/account/sections/support_section.dart`) | `GlorovFaqRepository` | `StatefulWidget` + expansion tiles | FAQ questions & answers grouped by category, Support ticket submission endpoint | Expand/collapse FAQ, Search FAQs, Submit support ticket (name, email, topic, order ref, message) | Skeleton accordion tiles | "Failed to submit inquiry. Please try again." | "No matching help topics found." | `SupportRepository.getFaqs()`, `SupportRepository.submitInquiry()` | `GlorovAccountState`, `SupportRepository` |
| **14. Account Settings** (`lib/screens/account/sections/settings_section.dart`) | `GlorovAccountState.settings` | `ListenableBuilder` listening to `GlorovAccountState` | Push notifications toggle, Email newsletter toggle, SMS alerts toggle, Currency format | Toggle preferences, Save settings | Subtle switch animation | Toast: "Failed to update preference" (reverts switch) | N/A | `AccountRepository.getSettings()`, `AccountRepository.updateSettings()` | `GlorovAccountState`, `AccountRepository` |

---

## 3. Data Access Boundary Architecture

The architecture enforces strict separation of concerns through four decoupled layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FLUTTER WEB PRESENTATION LAYER                   │
│   (HomeScreen, ProductDetailsScreen, CartScreen, CheckoutScreen, etc.)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        REACTIVE STATE CONTROLLERS                      │
│      GlorovCartState  •  GlorovAccountState  •  GlorovHeaderNotifier    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ delegates through
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GLOROV REPOSITORIES LOCATOR                      │
│                  GlorovRepositories.products / .cart / .orders         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ implements
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌────────────────────────────────┐
│      LOCAL / MOCK ADAPTERS        │   │       REMOTE HTTP ADAPTERS     │
│   MockProductRepository           │   │   MedusaProductRepository      │
│   LocalCartRepository             │   │   MedusaCartRepository         │
│   LocalOrderRepository            │   │   MedusaOrderRepository        │
│   LocalAccountRepository          │   │   MedusaAccountRepository      │
│   (In-Memory + LocalStorage)      │   │   (REST Store API + JWT/Cookie)│
└───────────────────────────────────┘   └────────────────────────────────┘
```

### 3.1 Repository Contract Definitions

All data contracts reside under `flutter/lib/repositories/contracts/`:
- **`ProductRepository`**:
  - `Future<List<GlorovProduct>> getProducts({GlorovProductFilter? filter})`
  - `Future<GlorovProduct?> getProductById(String id)`
  - `Future<GlorovProduct?> getProductBySlug(String slug)`
  - `Future<List<GlorovProductCategory>> getCategories()`
  - `Future<List<GlorovProduct>> getFeaturedProducts({String? category})`
  - `Future<List<GlorovProduct>> getRelatedProducts(String productId, {int limit = 4})`
- **`CartRepository`**:
  - `Future<List<GlorovCartItem>> getCartItems()`
  - `Future<void> addItem(GlorovProduct product, {GlorovProductVariant? variant, int quantity = 1})`
  - `Future<void> updateQuantity(String itemKey, int newQuantity)`
  - `Future<void> removeItem(String itemKey)`
  - `Future<void> clearCart()`
  - `Future<GlorovCouponValidation> validateCoupon(String code, double currentSubtotal)`
  - `Future<Set<String>> getWishlistIds()`
  - `Future<void> toggleWishlist(String productId)`
  - `Future<void> addAllWishlistToCart()`
- **`OrderRepository`**:
  - `Future<List<GlorovOrder>> getOrders()`
  - `Future<GlorovOrder?> getOrderById(String orderId)`
  - `Future<GlorovOrder> placeOrder({...})`
- **`AccountRepository`**:
  - `Future<GlorovUserProfile> getProfile()`
  - `Future<void> updateProfile(GlorovUserProfile profile)`
  - `Future<List<GlorovAddress>> getAddresses()`
  - `Future<void> saveAddress(GlorovAddress address)`
  - `Future<void> deleteAddress(String addressId)`
  - `Future<void> setDefaultAddress(String addressId)`
  - `Future<GlorovAccountSettings> getSettings()`
  - `Future<void> updateSettings(GlorovAccountSettings settings)`
- **`NotificationRepository`**:
  - `Future<List<GlorovNotification>> getNotifications()`
  - `Future<void> markAsRead(String notificationId)`
  - `Future<void> markAllAsRead()`
- **`SupportRepository`**:
  - `Future<List<GlorovFaqItem>> getFaqs({String? category})`
  - `Future<String> submitInquiry(SupportTicketSubmission inquiry)`

### 3.2 Service Locator (`GlorovRepositories`)

The service locator in `flutter/lib/repositories/glorov_repositories.dart` allows initializing the entire app in mock mode or switching to live Medusa HTTP adapters:

```dart
// Default in-memory development & testing mode
WidgetsFlutterBinding.ensureInitialized();
GlorovRepositories.init(mode: RepositoryMode.mock);

// Live backend mode (when connected to Medusa backend at http://localhost:9000)
GlorovRepositories.init(
  mode: RepositoryMode.remote,
  apiConfig: MedusaApiConfig(
    baseUrl: 'https://api.glorov.com',
    publishableKey: 'pk_glorov_live_...',
  ),
);
```

---

## 4. Medusa v2 Store API Endpoints & Contract Payloads

The remote boundary in `flutter/lib/repositories/remote/medusa_endpoints.dart` maps directly to the active Medusa v2 backend in `apps/backend/src/api/store/`.

### 4.1 Product Catalog Endpoints

- **List Products**: `GET /store/products`
  - **Query Parameters**: `limit`, `offset`, `category_id[]`, `q` (full-text search), `order` (e.g. `calculated_price`, `-created_at`).
  - **Medusa Response**: `{ "products": [ ... ], "count": 42, "offset": 0, "limit": 20 }`
  - **Botanical Metadata Mapping**: The parser extracts cultivation fields from Medusa's `metadata` JSONB object into `GlorovProduct`:
    - `metadata.botanical_name` → `product.botanicalName`
    - `metadata.germination_time_range` → `product.germinationPeriod`
    - `metadata.sowing_depth` → `product.sowingDepth`
    - `metadata.sunlight` → `product.sunlightRequirement`
    - `metadata.watering` → `product.wateringNeeds`
    - `metadata.difficulty` → `product.difficultyLevel`
    - `metadata.is_pet_friendly` → `product.isPetFriendly`
    - `metadata.in_stock` → `product.inStock`
- **Product by ID / Handle**: `GET /store/products/{id}` or `GET /store/products?handle={handle}`

### 4.2 Cart & Line Item Endpoints

- **Create Cart**: `POST /store/carts` (Body: `{ "region_id": "reg_in", "currency_code": "inr" }`)
- **Get Cart**: `GET /store/carts/{cart_id}`
- **Add Line Item**: `POST /store/carts/{cart_id}/line-items`
  - **Payload**: `{ "variant_id": "var_seed_100", "quantity": 1 }`
- **Update Line Item**: `POST /store/carts/{cart_id}/line-items/{line_id}`
  - **Payload**: `{ "quantity": 3 }`
- **Delete Line Item**: `DELETE /store/carts/{cart_id}/line-items/{line_id}`
- **Apply Promotion / Coupon**: `POST /store/carts/{cart_id}/promotions`
  - **Payload**: `{ "promo_codes": ["GLOROV10"] }`

### 4.3 Indian Commerce Custom Extensions

- **Pincode Delivery Check**: `POST /store/pincode-check`
  - **Implementation**: Handled by `apps/backend/src/api/store/pincode-check/route.ts`.
  - **Payload**: `{ "pincode": "560034" }`
  - **Response**: `{ "serviceable": true, "city": "Bengaluru", "state": "Karnataka", "estimated_days": "3-4 business days", "cod_available": true }`
- **Create Razorpay Payment Session**: `POST /store/payment/create-session`
  - **Payload**: `{ "cart_id": "cart_01J9...", "payment_provider_id": "pp_razorpay" }`
  - **Response**: `{ "order_id": "order_Rzp12345", "amount": 18500, "currency": "INR", "key_id": "rzp_test_..." }`
- **Verify Razorpay Payment Signature**: `POST /store/payment/verify`
  - **Payload**: `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }`
  - **Response**: `{ "success": true, "cart_id": "..." }`
- **Complete Cart into Order**: `POST /store/carts/{cart_id}/complete`
  - **Response**: `{ "type": "order", "order": { "id": "order_01...", "display_id": 1042, ... } }`

---

## 5. State Management & Reactive UI Integration Strategy

The GLOROV Flutter Web frontend uses a lightweight, reactive pattern combining Flutter's native `ChangeNotifier` with `ListenableBuilder` to eliminate heavy third-party state boilerplates.

### 5.1 Cart & Wishlist Synchronization (`GlorovCartState`)
- `GlorovCartState` is a singleton `ChangeNotifier`.
- **Cart Mutation Flow**:
  1. User clicks "Add to Bag" on `GlorovProductCard`.
  2. UI calls `GlorovRepositories.cart.addItem(product, variant: variant)`.
  3. Under mock mode, `LocalCartRepository` immediately updates `GlorovCartState` in memory and writes to `LocalStorage`.
  4. Under remote mode, `MedusaCartRepository` optimistically updates `GlorovCartState`, issues `POST /store/carts/{id}/line-items`, and reconciles on response (rolling back on failure).
  5. `ListenableBuilder` widgets listening to `GlorovCartState.instance` rebuild their badges and item totals smoothly.

### 5.2 Micro-Interactions & Loading Transitions
- As audited in Prompts 8–12, micro-interactions are decoupled from network delays:
  - Button state transitions (`ButtonStateController.toLoading()`, `toSuccess()`, `toIdle()`) provide instant user feedback.
  - Skeletons (`GlorovProductCardSkeleton`, `GlorovListItemSkeleton`) are displayed during genuine asynchronous operations and respect user reduced-motion settings.
  - Toasts (`GlorovToastManager`) notify users of cart additions or network issues without blocking user interactions.

---

## 6. Authentication, Tokens & Session Security

### 6.1 Authentication Mechanism
- **Medusa v2 Store Auth**: Medusa v2 provides customer authentication via `/store/auth/customer/emailpass`.
- **Session Tokens**: Successful login or registration yields a session JWT.
- **Header Injection**: `MedusaApiConfig.defaultHeaders` automatically appends:
  - `x-publishable-api-key: [PUBLISHABLE_KEY]` (required for all Medusa v2 store endpoints).
  - `Authorization: Bearer [CUSTOMER_JWT]` (when authenticated).

### 6.2 Guest Checkout Support
- Customers can add items to cart and check out without upfront registration.
- The storefront generates and persists a guest `cart_id` in `window.localStorage` (`glorov_cart_id`).
- When a guest customer logs in, `MedusaCartRepository` invokes customer cart association to merge guest items into the customer's permanent cart.

---

## 7. Phased Live Integration Roadmap

```
Phase 1: Catalog Read-Only [COMPLETED IN PROMPT 14]
  ├── MedusaProductRepository implemented with package:http
  ├── Live category navigation & botanical filter facets mapped
  └── PDP dynamic fetching by handle/slug implemented & unit-tested
Phase 2: Cart, Wishlist & Pincodes [COMPLETED IN PROMPT 14]
  ├── MedusaCartRepository with line-item mutations & promotions
  ├── Wishlist synchronization & optimistic updates with rollback
  └── MedusaPincodeService connected to /store/pincode-check
Phase 3: Customer Authentication, Profiles & Addresses [COMPLETED IN PROMPT 3 OF 5]
  ├── MedusaAccountRepository connected to /auth/customer/emailpass and /store/customers/me
  ├── 3-step customer registration flow implemented & verified
  ├── Session persistence via glorov_customer_token in LocalStorage
  ├── LoginScreen, SignUpScreen, and PasswordRecoveryScreen connected with loading/error states
  ├── Address book sync with /store/customers/me/addresses
  ├── Password update (/store/customers/me/password) & reset (/auth/customer/emailpass/reset-password)
  └── Sign out workflow clearing memory and storage tokens
Phase 4: Checkout, Razorpay & Order Completion [SCHEDULED]
  ├── Integrate Razorpay web checkout SDK via dart:js_interop
  ├── Handle COD order placement
  └── Connect Shiprocket webhook tracking to customer order details
```

### Phase 1: Catalog Read-Only (Status: Implemented & Verified)
- Implemented `MedusaProductRepository` using `package:http`.
- Parsed `/store/products` and mapped botanical metadata via `GlorovProduct.fromMedusaJson`.
- Connected to `GlorovRepositories.products` with dual mock/remote mode switching.

### Phase 2: Cart & Pincode Servicability (Status: Implemented & Verified)
- Implemented `MedusaCartRepository` supporting line-item additions, deletions, quantity changes, and promotion codes.
- Implemented `MedusaPincodeService` with strict 6-digit Indian PIN format validation and Shiprocket delivery timeline mapping.

### Phase 3: Customer Authentication & Account Management (Status: Implemented & Verified in Prompt 3 of 5)
- Documented in detail in `AUTHENTICATION_INTEGRATION.md`.
- Implemented `AccountRepository` contract with `login`, `register`, `logout`, `checkSession`, `requestPasswordReset`, `updatePassword`.
- Dual implementations: `LocalAccountRepository` for offline mock mode and `MedusaAccountRepository` for live Medusa v2 Store API.
- Integrated `GlorovAccountState` with reactive auth status (`GlorovAuthStatus`) and error tracking.
- Wired all auth screens (`LoginScreen`, `SignUpScreen`, `SignUpForm`, `PasswordRecoveryScreen`) with validation, micro-interactions, and progress loaders.
- Session persistence and restoration on web refresh via `glorov_customer_token`.
- Verified with 18 dedicated tests in `glorov_authentication_test.dart` (126/126 total suite passing).

### Phase 4: Checkout & Razorpay (Status: Architecture Specified)
- Razorpay Web Checkout SDK integration planned for final checkout modal.
- Completes cart and redirects to order confirmation screen with live Medusa order ID.
