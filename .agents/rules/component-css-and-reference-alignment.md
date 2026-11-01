# Rule: Component-Separated CSS Modules & Reference Alignment Architecture

When developing or refactoring storefront UI components for GLOROV:

1. **Pure Component-Separated CSS Modules:**
   - Do NOT use Tailwind CSS utility classes in redesigned components.
   - Every component must have a dedicated CSS module file (e.g. `Header.module.css`, `AnnouncementBar.module.css`, `ProductCard.module.css`, `CatalogFilters.module.css`, `VariantSelector.module.css`, `CartDrawer.module.css`).
   - Use scoped class names and media queries inside the component's CSS module file.

2. **Global CSS Custom Properties (`variables.css`):**
   - Reference centralized design tokens via `var(--...)` for all colors, fonts, dimensions, transitions, and z-indices.
   - Do not hardcode magic hex codes or pixel paddings inside individual components when a global variable exists.
   - Brand tokens:
     - `--ugaoo-maroon: #93113a` (Primary action button, active badges)
     - `--ugaoo-maroon-hover: #790d2e`
     - `--ugaoo-green: #0a4c36` (Botanical forest green)
     - `--ugaoo-cream: #f4e6c6` (Search background, pill filters)
     - `--ugaoo-butter: #fff3d9` (Category rail badges, story highlights)
     - `--ugaoo-sale-red: #d93025` (Discount badges, flash sales)

3. **Automated Reference Extraction:**
   - Use Node.js CDP automation (`scripts/extract-ugaoo-assets-and-styles.mjs`) to pull live CSS rules and markup structures directly from the reference site (Ugaoo).
   - Replicate responsive breakpoints: Desktop (>=1025px), Tablet (768px-1024px), and Mobile (<768px).

4. **Botanical Catalog Domain Constraint:**
   - Strictly filter all imported or mocked catalog records to **plants and seeds only**.
   - Always exclude gardening instruments, harvesters, planters, chemicals, and non-living equipment.
   - Every botanical listing must specify HSN code 1209 (0% GST) and authentic horticultural attributes (sunlight, watering frequency, difficulty).

5. **Accessibility & Responsive Standards:**
   - Minimum 44x44px touch targets on mobile viewports.
   - Support roving tabindex, keyboard arrow navigation, and proper ARIA states for all interactive widgets.

6. **Zero Tailwind CSS & Third-Party Primitive Invariants:**
   - **No Tailwind Classes:** Storefront UI components, layouts, and modals must never use Tailwind utility classes.
   - **Lucide Icon Props:** Always specify explicit `size={16|18|20|24}` props on Lucide React icons. Never use `className="h-X w-X"`.
   - **Loading Animations:** Replace `className="animate-spin"` with dedicated `.spinner` module classes that define scoped `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`.
   - **Headless UI Decoupling:** Radix UI and other unstyled primitives must use dedicated CSS modules (`Dialog.module.css`) for positioning, backdrop blur, and transitions.

7. **Evergreen (Non-Festive) Architecture & Typography:**
   - **Canvas & Header Theme:** Warm soft ivory background (`#fff6f4`), deep forest green announcement bar (`#0a4c36`), and cream header background (`#fff6f4`).
   - **Hero Structure:** Asymmetric split layout (0.91fr / 0.3fr):
     - Left banner: 24px border-radius, high-resolution botanical nursery photography.
     - Right stacked cards: Forest green card (`#0f4c36`, beginner plants) + Butter yellow card (`#f4efc0`, heirloom seeds).
   - **Rating Bar:** Translucent green pill (`background: rgba(0, 168, 89, 0.08)`, `border: 1px solid rgba(0, 168, 89, 0.32)`) with 5 gold stars and `Rated 4.9 by 1,00,000+ Plant Parents Across India`.
   - **Trust Reassurance:** Harvest gold yellow trust bar (`#ffd51f`) with white circular icon discs and dark green text (`#042018`).
   - **Botanical Journey:** 4-step nursery care journey (*Grown at our farm*, *3-step quality check*, *Survival packaging*, *Arrives alive*).
   - **Space Curation:** Living room, bedroom, balcony, and office styling strictly showcasing living indoor plants.

8. **Checkout, Order Confirmation & Customer Portal Standards:**
   - **Dedicated CSS Modules:**
     - Checkout: `CheckoutPage.module.css`
     - Order Confirmation: `OrderConfirmedPage.module.css`
     - Authentication: `AuthPage.module.css`
     - Customer Portal: `AccountDashboard.module.css`, `CustomerOrders.module.css`, `CustomerOrderDetail.module.css`, `CustomerAddresses.module.css`, `CustomerProfile.module.css`, `AccountNav.module.css`
     - Modals & Actions: `AddressModal.module.css`, `OrderCancellationButton.module.css`, `OrderReturnRequestModal.module.css`, `OrderReturnStatusSection.module.css`
   - **Indian Form Standards:** 6-digit Indian PIN codes, Indian states dropdown, 10-digit mobile number validation.
   - **Self-Serve Actions:** Reason selection dropdowns, transit guarantee notes, and real-time status tracking.

9. **Test Invariant & Class Assertion Resilience:**
   - **Semantic Test Assertions:** Never test for Tailwind classes like `hidden`, `flex`, `p-4`, or `min-h-[44px]` in tests.
   - **Accessible Roles & Scoped Classes:** Prefer querying by role (`screen.getByRole('button', { name: ... })`) or verifying module class tokens (e.g. `expect(el.className).toContain('desktopNav')`).

10. **Mobile Touch Target Invariants (WCAG 2.5.5 / AAA Compliance):**
   - **Minimum Tap Area:** All interactive buttons, quantity steppers, delete actions, and form inputs must maintain a minimum hit area of 44x44px.
   - **Cart Steppers:** Stepper minus/plus buttons must specify `min-width: 44px; min-height: 44px;`.
   - **Remove Actions:** Inline item removal triggers must declare `min-height: 44px;` with vertical padding.
   - **Postal & Outline CTAs:** Secondary form buttons (`.outlineBtn`, `.checkBtn`) must measure at least 44px height.
