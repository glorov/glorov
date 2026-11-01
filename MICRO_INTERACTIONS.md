# GLOROV Micro-Interactions System

Integration and architectural guide for micro-interactions, tactile feedback, and accessible animations in the GLOROV botanical e-commerce web storefront.

---

## 1. Package Identification & Compatibility

| Property | Details |
| :--- | :--- |
| **Package** | `flutter_micro_interactions` |
| **Resolved Version** | `0.3.2` |
| **Canonical Repositories** | [github.com/dvxlabs520/flutter_micro_interactions](https://github.com/dvxlabs520/flutter_micro_interactions) / [github.com/dvillegastech/flutter_micro_interactions](https://github.com/dvillegastech/flutter_micro_interactions) |
| **License** | MIT License (David Villegas 2024) |
| **Flutter SDK** | `3.47.8` (Tested & verified) |
| **Dart SDK** | `3.13.7` (Supports `>=3.0.0 <4.0.0`) |
| **Target Platform** | Flutter Web (HTML & CanvasKit renderers) |
| **Third-Party Dependencies** | None (Zero external dependencies; pure Flutter framework) |

---

## 2. Motion Principles for Botanical E-Commerce

GLOROV's micro-interaction design language is intentionally **restrained, grounded, and organic**:

1. **Restraint over Gimmick**: Animations serve a cognitive purpose (confirming an action, indicating feedback, easing screen transitions) rather than drawing attention to themselves.
2. **Organic Easing**: Transitions prioritize decelerating and organic easing curves (`Curves.easeOutCubic`, `Curves.decelerate`, `Curves.easeInOut`) that evoke natural growth and physical weight.
3. **Subtle Tactile Feedback**:
   - Product cards depress gently on click (`scaleDown: 0.98`).
   - Action buttons press responsively (`scaleDown: 0.96`).
   - Focused inputs lift minimally (`scale: 1.01`, `elevation: 2.0`).
4. **Botanical Hover Accents**: Soft Sage (`#52796F`) glows replace harsh drop shadows, preserving the warm, earthy aesthetic of the storefront.
5. **Universal Accessibility & Reduced Motion**: Every component honors `MicroMotion.isReduced(context)` and `MediaQuery.disableAnimationsOf(context)`:
   - When reduced motion is preferred, animations drop to `Duration.zero` or instant transitions.
   - Screen reader semantics and announcements are maintained across all states.

---

## 3. Architecture & Integration Layer

The integration is centralized under `flutter/lib/core/interactions/`:

```
flutter/lib/core/interactions/
├── interaction_config.dart   # Design tokens & timing constants
├── interaction_feedback.dart # Accessible toasts & celebration bursts
├── interaction_widgets.dart  # Reusable GLOROV-branded wrapper widgets
├── glorov_buttons.dart       # Unified interactive button system (Primary, Secondary, Outlined, Destructive, Icon, Toolbar)
├── glorov_inputs.dart        # Accessible text inputs with InputFocus elevation
└── interactions.dart         # Barrel export file
```

### Import Usage

```dart
import 'package:shop/core/interactions/interactions.dart';
```

---

## 4. Reusable Component Inventory

### 4.1. Interactive Button Suite (`GlorovButton`, `GlorovIconButton`, `GlorovToolbarButton`)

Unified interactive buttons that combine `TapFeedback` scale compression, loading spinners, disabled states, and visible keyboard focus rings:

#### Primary Button
```dart
GlorovButton.primary(
  label: 'Proceed to Checkout',
  leadingIcon: Icon(Icons.lock_outline),
  onPressed: () => handleCheckout(),
)
```

#### Secondary Button
```dart
GlorovButton.secondary(
  label: 'Save for Later',
  onPressed: () => handleSave(),
)
```

#### Outlined Button
```dart
GlorovButton.outlined(
  label: 'Apply Coupon',
  onPressed: () => handleApply(),
)
```

#### Destructive Button
```dart
GlorovButton.destructive(
  label: 'Remove from Bag',
  onPressed: () => handleRemove(),
)
```

#### Loading State
```dart
GlorovButton.primary(
  label: 'Placing Order...',
  isLoading: true, // Replaces label with spinner & prevents double-submission
  onPressed: () => handlePlaceOrder(),
)
```

#### Icon Button
```dart
GlorovIconButton(
  icon: Icon(Icons.favorite_border),
  tooltip: 'Add to Wishlist',
  onPressed: () => toggleWishlist(),
)
```

#### Toolbar Button
```dart
GlorovToolbarButton(
  label: 'Seeds',
  icon: Icon(Icons.eco),
  isActive: selectedCategory == 'Seeds',
  onPressed: () => selectCategory('Seeds'),
)
```

---

### 4.2. Form Input Fields (`GlorovTextField`, `InputFocus`)

Input fields wrapped with `InputFocus` elevation and subtle shadow glow without layout jumps:

```dart
GlorovTextField(
  controller: searchController,
  label: 'Search Botanical Catalog',
  hintText: 'Search seeds, house plants, planters...',
  prefixIcon: Icon(Icons.search),
  validator: (val) => val == null || val.isEmpty ? 'Please enter a search term' : null,
  onFieldSubmitted: (query) => handleSearch(query),
)
```

---

### 4.3. Enhanced Botanical Product Card (`GlorovProductCard`)

Elevates the core storefront card with synchronized micro-interactions:
1. **Hover Glow**: Subtle Sage (`#52796F`) halo via `HoverGlow` with 10px blur radius.
2. **Image Zoom**: Smooth scale transition on product image (`scale: 1.04`, 250ms cubic ease).
3. **Wishlist Heart Bounce**: Wrapped in `TapFeedback(effect: TapAnimationType.bounce, scaleUp: 1.25)` with animated icon fill swap.
4. **Add to Cart Feedback**: Tactile click compression (`scaleDown: 0.94`) with top `ToastNotification` confirmation.
5. **Event Isolation**: Clicking wishlist or cart actions NEVER triggers card-level navigation.
6. **Keyboard Focus**: Focus ring with Enter/Space keyboard activation.

---

### 4.4. Page Transitions (`MicroPageRoute`)

Replaced standard `MaterialPageRoute` in `router.dart` with `MicroPageRoute(type: MicroTransitionType.fade)`:
- 200ms silky cross-fade between storefront screens.
- Zero layout jump or default Android slide-up on desktop browser.
- Full preservation of browser history, back/forward buttons, and deep linking.

---

## 5. Automated Verification Results

All 46 automated unit and widget tests pass:

```bash
$ cd flutter && flutter test
00:00 +0: GlorovButton Component Suite Primary button renders with forest deep background and triggers tap
00:00 +1: GlorovButton Component Suite Secondary button renders with sage tint and label
00:00 +2: GlorovButton Component Suite Outlined button renders with outline border
00:00 +3: GlorovButton Component Suite Destructive button renders for danger actions
00:00 +4: GlorovButton Component Suite Disabled button does not invoke onPressed
00:00 +5: GlorovButton Component Suite Loading button shows progress indicator and blocks tap
00:00 +6: GlorovIconButton & GlorovToolbarButton GlorovIconButton responds to tap and displays icon
00:00 +7: GlorovIconButton & GlorovToolbarButton GlorovToolbarButton renders active pill style and handles tap
00:00 +8: GlorovTextField Component Preserves controller text and handles onChanged input
00:00 +9: GlorovTextField Component Executes validator correctly on form validate
00:00 +10: GlorovProductCard Enhanced Interactions Wishlist tap toggles state and does not trigger card navigation
00:00 +11: GlorovProductCard Enhanced Interactions Add to cart button adds item and does not trigger card navigation
00:00 +12: GlorovProductCard Enhanced Interactions Tapping card body invokes navigation callback
...
00:03 +46: All tests passed!
```

### Static Analysis
```bash
$ cd flutter && flutter analyze lib/core/interactions lib/components/product/glorov_product_card.dart lib/route/router.dart lib/components/navigation/glorov_header.dart lib/components/cart/glorov_order_summary.dart lib/screens/account/ lib/screens/product/glorov_product_details_screen.dart lib/screens/cart/glorov_cart_screen.dart lib/screens/checkout/
Analyzing 9 items...
No issues found! (ran in 1.8s)
```

### Production Web Build
```bash
$ cd flutter && flutter build web --release
Compiling lib/main.dart for the Web... 29.2s
✓ Built build/web
```

---

## 6. Captured Visual Evidence

### Component & Foundation Artifacts
- [Homepage Cards with Hover & Badges](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-interactive-home-cards.png)
- [Cart Summary & Interactive Buttons](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-interactive-cart-summary.png)
- [Account Overview with Micro-Interactions](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-interactive-profile-account.png)
- [Catalog Grid with Hover Glow & Wishlist Bounce](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-interactive-catalog-filters.png)

### Shopping Journey Artifacts (Prompt 10)
- [PDP with Wishlist Sync & Image Transition](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-shopping-pdp-interactions.png)
- [Cart with Animated Counters, Steppers & Undo Toast](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-shopping-cart-interactions.png)
- [Checkout with Anti-Duplicate Submit Guard](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-shopping-checkout.png)
- [Order Confirmation with SuccessBurst & Animated Check](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-shopping-order-confirmation.png)

### Page Transitions, Skeletons & Feedback Artifacts (Prompt 11)
- [Notification Center with Staggered Items & Mark Read](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-feedback-notifications.png)
- [Customer Profile with ShakeButton Validation](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-feedback-profile.png)
- [Customer Support Inquiry Form with Validation Feedback](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-feedback-support.png)
- [Wishlist with Staggered Entrance & Primary Add All Action](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-feedback-wishlist-staggered.png)
- [Order History with Staggered Cards & Re-Order Feedback](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-feedback-orders-staggered.png)

### Final Audit & Responsive Verification Artifacts (Prompt 12)
- [Showcase Desktop 1440px Component Testbed](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-audit-showcase-desktop-1440.png)
- [Showcase Mobile 390px Responsive Adaptation](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-audit-showcase-mobile-390.png)
- [Homepage 1280px Desktop Audit](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-audit-home-1280.png)
- [Product Details 768px Tablet Buy Box](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-audit-pdp-768.png)
- [Cart Screen 390px Mobile Stack](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-audit-cart-390.png)
- [Checkout 320px Ultra-Compact Viewport Without Overflow](file:///Users/sourav/.gemini/antigravity/brain/8844d74a-7674-4709-9927-1ab1703d541f/glorov-audit-checkout-320.png)

---

## 7. Shopping Journey Micro-Interactions Integration (Prompt 10)

The shopping micro-interactions bind the verified component suite directly into the core customer journey from discovery to checkout confirmation:

### 7.1. Wishlist Synchronization & Visual Feedback
- **Animated Favorite Toggle**: Wrapped in `TapFeedback(effect: TapAnimationType.bounce, scaleUp: 1.25)` on both `GlorovProductCard` and `GlorovProductDetailsScreen`.
- **Immediate Visual Change**: Instantly fills the heart with `AppColors.error` (#E63946) and swaps border color.
- **Top Toast Notification**: Triggers `GlorovFeedback.showSuccessToast` with message `"Added to your Wishlist"` or `"Removed from Wishlist"`.
- **Global Reactive Sync**: Synchronized via `GlorovCartState.instance.toggleWishlist()`. When toggled anywhere, the header wishlist badge immediately updates with a smooth scale-pop animation (`ScaleTransition` via `AnimatedSwitcher`).
- **No Card Navigation Spill**: Clicks on the wishlist heart call `event.stopPropagation()`-equivalent isolation and never trigger navigation to the product details page.

### 7.2. Add-To-Cart Feedback & Anti-Duplicate Guard
- **Tactile Click Feedback**: Button compresses smoothly (`scaleDown: 0.96`) on press.
- **Cart Badge Animation**: The header shopping bag badge smoothly scales (`ScaleTransition` + `AnimatedSwitcher`) whenever the total item count increments or decrements.
- **Concise Toast Confirmation**: Top toast notifies the user (`"Added to Botanical Bag"`) with a direct `"VIEW BAG"` action button that navigates directly to the cart route.
- **Anti-Duplicate Lock**: Buttons implement an `_isAddingToCart` guard to discard accidental double-clicks while the state update propagates.
- **No Artificial Lag**: Zero artificial delays or simulated network sleeps; local state updates synchronously.

### 7.3. Quantity & Price Updates
- **Tactile Steppers**: Increment and decrement controls feature tactile compression feedback with minimum threshold guards (`quantity >= 1`).
- **Smooth Numerical Odometers**: Line item totals and order totals are rendered through `GlorovCounter` with `CounterAnimationType.slideDigits`, animating digits smoothly as quantities change.
- **Exact Calculation Guarantee**: Displayed text values always derive directly from `GlorovCartItem.totalPrice` and `GlorovCartState.total`, eliminating stale or mismatched numbers during animations.

### 7.4. Product Gallery Transitions
- **Cross-Fade Media Switcher**: The main image switcher in `GlorovProductDetailsScreen` uses `AnimatedSwitcher` with 250ms cubic easing for smooth cross-fading when packet sizes or color options change.
- **Responsive Thumbnail Previews**: Thumbnail selection chips provide scale feedback on hover and press, highlighting the active image with an emerald botanical ring.

### 7.5. Cart Item Removal & "Save for Later"
- **Undo Toast on Item Removal**: When an item is removed from the cart, a non-blocking toast appears with an immediate `"UNDO"` action button that restores the item with its previous quantity.
- **Save for Later**: Moves the cart item directly to `GlorovCartState.instance.wishlistIds`, confirms with a botanical toast notification, and updates both the cart and wishlist badges concurrently.
- **Empty Cart Callout**: If all items are removed, a clean illustrated empty bag state renders with a `GlorovButton.primary` directing users back to the botanical catalog.

### 7.6. Checkout & Confirmation Celebration
- **Double-Submission Prevention**: `GlorovCheckoutScreen` locks `_isSubmitting` immediately on "Confirm & Place Order" press, rendering a loading spinner and ignoring duplicate clicks.
- **Order Placement**: Automatically constructs an immutable `GlorovOrder` snapshot, saves it to persistent local storage, and clears the active cart.
- **Celebration Particle Burst**: `GlorovOrderConfirmationScreen` greets the user with `SuccessBurst` using botanical brand palette particles (`#2D5A27`, `#4A7C59`, `#8BA888`, `#E9C46A`, `#DDA15E`).
- **Animated Draw Checkmark**: Centered within the celebration burst, `GlorovAnimatedCheck` draws the victory checkmark path dynamically on entry.
- **Summary Actions**: Provides tactile `GlorovButton.primary` ("Track Delivery") and `GlorovButton.outlined` ("Continue Shopping") actions.

---

## 8. Page Transitions, Skeletons, and Form Feedback (Prompt 11)

Prompt 11 completes the full storefront interaction system, bringing consistent, restrained transitions, zero-layout-shift skeletons, staggered item entrances, and tactile form submission feedback across the remaining screens:

### 8.1. Centralized Botanical Skeletons (`glorov_skeletons.dart`)
- **`GlorovSkeletonLoader`**: Switches between real content and placeholder skeleton with an accessible cross-fade. Respects `MicroMotion.isReduced(context)`.
- **`SkeletonScope` Integration**: Wraps multiple skeletons under a single synchronized shimmer ticker, preventing individual skeletons from pulsing out-of-sync and reducing GPU overhead on web.
- **`GlorovProductCardSkeleton`**: Directly matches the aspect ratio and dimensional metrics of `GlorovProductCard`, including image container, category pill, title lines, rating badge, and price row.
- **`GlorovProductGridSkeleton`**: Configurable responsive grid skeleton with responsive column breakpoints matching `GlorovCatalogScreen`.
- **`GlorovListItemSkeleton`**: Reusable skeleton for order lists, notifications, and address tiles featuring avatar and stacked text placeholders.
- **`GlorovProductDetailsSkeleton`**: Full-page product skeleton mirroring the dual-column desktop gallery and buy-box layout.
- **Zero Fake Delays**: Local mock data screens load immediately; skeletons are used strictly when genuine asynchronous operations take place or during simulated state transitions.

### 8.2. Unified Web Route Transitions (`router.dart`)
- **`MicroPageRoute` Standard**: All 20+ storefront routes use `_buildRoute(child, settings, type: MicroTransitionType.fade, duration: 200ms)`.
- **Web Navigation Continuity**: Deep linking, query parameter extraction (`#/product_details?id=...`, `#/catalog?category=...`), browser forward/back buttons, and direct URL reloads are fully preserved.
- **Resilient Fallback**: Unknown or undefined routes gracefully fall back to `HomeScreen` rather than legacy onboarding flows.

### 8.3. Staggered Entrance Animations (`GlorovStaggeredItem`)
- **Discovery Grid**: Catalog cards enter with gentle staggered fade-slide (`StaggeredItem`), enhancing perceived performance.
- **Delay Clamping**: Entrance stagger index is strictly capped at `min(index, 5) * 50ms` (maximum 250ms), ensuring items scrolled into view further down the list never suffer noticeable latency.
- **Rebuild Stability**: Filter updates and pagination reuse cached layout boundaries without jarring full-page replay.

### 8.4. Tactile Form Validation & `GlorovShakeButton`
- **Validation-Locked Shaking**: Wraps the package `ShakeButton` into `GlorovShakeButton`. When the user attempts to submit an invalid form:
  1. The submit button performs a subtle horizontal shake (`offset: 6.0`, 3 cycles, 375ms).
  2. Mild tactile/haptic feedback triggers (`HapticFeedback.lightImpact`).
  3. A non-blocking warning toast (`GlorovFeedback.showWarningToast`) informs the user of the missing requirements (e.g., "Please select an inquiry topic").
  4. The form fields themselves remain stationary, avoiding disorienting whole-page shaking.
- **Form Implementations**:
  - **Customer Profile**: Validates name and phone fields with `GlorovShakeButton`.
  - **Address Book Modal**: Validates street, city, pin code, and state before saving.
  - **Support Inquiry**: Validates topic selection and inquiry message before generating a persistent support ticket reference.

### 8.5. Notification Center & Account Interactivity
- **Staggered Notifications**: Each notification card animates gently on entry.
- **Category Filter Chips**: Instant category filtering ("All", "Orders", "Gardening Tips", "Wishlist", "Store News") with active pill indicators.
- **"Mark All as Read" Feedback**: Synchronously marks all alerts as read, removes unread badges across the UI, and displays a success toast.
- **Individual Alert Actions**: Each card supports "Mark as Read", "View Details", and "Dismiss", smoothly updating unread counts and badge indicators.

---

## 9. Comprehensive Test Suite

The test suite contains **72 automated tests** across 7 test suites, with a 100% pass rate:

1. `test/glorov_interactions_test.dart` (10 tests) - Basic wrappers and animation controllers
2. `test/glorov_micro_components_test.dart` (11 tests) - Reusable interactive buttons, cards, and inputs
3. `test/glorov_shopping_interactions_test.dart` (12 tests) - Shopping journey, wishlist sync, and checkout
4. `test/glorov_product_details_test.dart` (10 tests) - Product details image gallery, packet sizes, and cart sync
5. `test/glorov_header_scroll_test.dart` (9 tests) - Centered category navigation, sticky scroll states, and micro-interactions
6. `test/glorov_transitions_and_skeletons_test.dart` (10 tests) - Skeletons, shake buttons, route transitions, and account forms
7. `test/glorov_final_audit_regression_test.dart` (10 tests) - Dev showcase, controller cycles, regression checks, and viewport resilience

```bash
$ cd flutter && flutter test
00:04 +72: All tests passed!
```

---

## 10. Complete Component Inventory

| Component Name | Underlying / Wrapper Widget | Intended Usage | Relevant Configuration | Reduced Motion Behavior | Accessibility Considerations | Screens Where Used | Verified |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`GlorovButton`** | `TapFeedback` + custom focus detector | Primary, secondary, outlined, and destructive user actions | `variant`, `size`, `isLoading`, `scaleDown: 0.96` | Scales instantly without animation | Visible emerald focus ring (`Border.all`), `Semantics(button: true)` | All storefront screens, Checkout, Cart, Account, Dialogs | Verified |
| **`GlorovShakeButton`** | `ShakeButton` | Form submit action that shakes on invalid input | `intensity: 8.0`, `duration: 350ms`, `onInvalidPress` | Suppresses shake translation; announces warning toast | Prevents whole-page shaking; only the submit trigger shakes | Customer Profile, Address Dialog, Customer Support Form | Verified |
| **`GlorovInteractiveButton`** | `ButtonStates` + `TapFeedback` | Async actions transitioning between idle, loading, success, error | `ButtonStateController`, custom loading & success builders | Transitions states without intermediate tweening | Preserves button label and announces state change | Dev Showcase, Product Details, Add to Cart | Verified |
| **`GlorovTapCard`** | `TapFeedback` + `HoverGlow` | Interactive catalog cards, order cards, and overview tiles | `scaleDown: 0.98`, `glowColor: AppColors.sage`, `glowRadius: 10` | Disables hover glow & scale; acts as standard touchable tile | Accessible tap target, keyboard activation support | Home Featured, Catalog Grid, Account Overview, Wishlist | Verified |
| **`GlorovTextField`** | `InputFocus` + `TextFormField` | Accessible botanical text input fields | `focusScale: 1.01`, `focusElevation: 2.0`, `shadowColor` | Zero elevation scaling; applies standard focus border color | Full keyboard tab traversal, form validation, error text | Search header, Checkout address form, Account forms | Verified |
| **`GlorovCounter`** | `AnimatedCounter` | Price odometers, line item totals, and loyalty point displays | `mode: slideDigits`, `mode: count`, `curveDecelerate` | Snaps immediately to new numeric value | Maintains exact numerical semantics for screen readers | Header counters, Cart line totals, Order totals, Account metrics | Verified |
| **`GlorovBadge`** | `AnimatedBadge` | Dynamic notification and cart quantity counters | `curve: Curves.elasticOut`, `duration: 250ms`, `showZero: false` | Updates numeric count without bounce or scale | Omits zero state cleanly; clear high-contrast red badge | Header Cart icon, Header Wishlist icon, Notification Center | Verified |
| **`GlorovAnimatedCheck`** | `AnimatedCheck` | Vector path-drawn checkmark for successful confirmations | `AnimatedCheckController`, `strokeWidth: 3.5`, `color: forestDeep` | Shows fully drawn checkmark immediately | Vector icon with high contrast against light botanical backgrounds | Order Confirmation (`thanks_order`), Showcase | Verified |
| **`GlorovStaggeredItem`** | `StaggeredItem` | Cascading entrance animation for grid and list items | `effect: fadeSlideUp`, capped index delay: `min(index, 5) * 50ms` | Renders at 100% opacity and final offset without entrance lag | Avoids layout shift; long scroll lists do not stall | Category Discovery, Catalog Grid, Wishlist, Notifications, Orders | Verified |
| **`GlorovSkeletonLoader`** | `SkeletonLoader` + `SkeletonScope` | Shimmer placeholder layout while loading asynchronous data | `loading: bool`, `skeleton: Widget`, `switchDuration: 250ms` | Renders static grey placeholder without shimmer pulse | Uses `Semantics(label: "Loading...")`; matches exact real layout | Product Grids, Product Cards, List Items, Account Sections | Verified |
| **`ToastNotification` / `GlorovFeedback`** | `ToastNotification` | Accessible non-blocking system toasts and alerts | `ToastPosition.top`, `type: success/error/info/warning` | Shows/hides with instant opacity switch | Top announcement; keyboard dismissable; action buttons | Cart additions, Wishlist updates, Coupon status, Address changes | Verified |
| **`SuccessBurst`** | `SuccessBurst` | Botanical particle celebration on checkout completion | `colors: GlorovFeedback.botanicalBurstColors` | Suppresses particle physics simulation | Decorative effect; does not obscure underlying receipt text | Order Confirmation Screen, Showcase | Verified |
| **`MicroPageRoute`** | `MicroPageRoute` | Uniform fade page transition for web storefront routes | `type: MicroTransitionType.fade`, `duration: 200ms` | Instant zero-duration route transition | Preserves browser forward/backward buttons, deep links, reload | All routes registered in `router.dart` | Verified |

---

## 11. Developer Guidelines for Future Screens

### 11.1. Import Convention
Always import the centralized barrel:
```dart
import 'package:shop/core/interactions/interactions.dart';
```

### 11.2. Controller Lifecycle & Disposal Rules
To prevent memory leaks and ticker leaks on Flutter Web:
1. **`ButtonStateController`**:
   - Initialize in `initState()`: `_controller = ButtonStateController();`
   - Always call `_controller.dispose()` in `dispose()`.
2. **`AnimatedCheckController`**:
   - Initialize in `initState()`: `_checkController = AnimatedCheckController();`
   - Always call `_checkController.dispose()` in `dispose()`.
3. **`GlorovTextField` with external `FocusNode`**:
   - If passing a custom `FocusNode`, ensure the parent widget owns and disposes it.
   - If no `FocusNode` is provided, `GlorovTextField` creates and disposes its internal node automatically.

### 11.3. Adding Skeletons to New Screens
1. Mirror the real layout metrics exactly (heights, paddings, border radii).
2. Wrap multiple skeleton items in a shared `SkeletonScope` or use `GlorovProductGridSkeleton` to share a single shimmer ticker.
3. Switch between skeleton and content using `GlorovSkeletonLoader(loading: isLoading, skeleton: ..., child: ...)`.

### 11.4. Adding Form Feedback
1. Wrap the submit button in `GlorovShakeButton`:
```dart
GlorovShakeButton(
  isValid: _isFormValid,
  onPressed: _handleSubmit,
  onInvalidPress: () {
    GlorovFeedback.showWarningToast(context, message: 'Please fill all required fields.');
  },
  builder: (ctx, handlePressed) => GlorovButton.primary(
    label: 'Save Changes',
    onPressed: handlePressed,
  ),
)
```

### 11.5. Development Showcase Route
The interaction testbed is accessible at:
- **Route**: `devInteractionShowcaseRoute` (`#/dev_showcase`)
- **Isolation**: Intentionally excluded from customer-facing headers, footers, and menus.
- **Purpose**: Rapid manual verification, screenshot regression, and testing of new micro-interaction components.


