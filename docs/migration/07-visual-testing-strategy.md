# 07 — Visual Testing Strategy

> **Audit date:** 2026-11-03  
> **Status:** Strategy document only. No tests have been written yet.

---

## Overview

Visual similarity between the Flutter Web storefront and the Next.js storefront is a **critical quality requirement**, not a nice-to-have. Every migrated page must be screenshot-compared against its Flutter equivalent before it is considered complete.

**A page is NOT complete if:**
- It renders without errors but has not been screenshot-compared
- It passes screenshot comparison only at 1440px desktop
- The 350px mobile layout has not been explicitly tested and approved

---

## 1. The Screenshot Comparison Cycle

Every migrated page must go through this exact cycle before being marked complete:

```
1. Open the existing Flutter Web page in the browser
2. Set viewport to the target size
3. Capture a screenshot → save as flutter-{page}-{viewport}.png
4. Open the equivalent Next.js page at exactly the same viewport
5. Capture a screenshot → save as next-{page}-{viewport}.png
6. Compare both screenshots section by section:
   - Spacing and padding
   - Alignment (left, right, centre)
   - Typography (size, weight, colour, line-height)
   - Colours (backgrounds, borders, text, icons)
   - Image dimensions and crop
   - Border radii
   - Layout structure (column counts, stacking order)
   - Responsive breakpoint behaviour
7. Write down every identified difference
8. Fix each difference in the Next.js implementation
9. Capture a new Next.js screenshot
10. Compare again — repeat from step 6
11. Continue until all visual differences are resolved or
    documented as intentional improvements
```

> [!IMPORTANT]
> Never move to the next viewport until the current one passes comparison. Always start with 350px.

---

## 2. Mandatory Viewport Test Order

Test every page in this exact priority order:

### Priority 1 — Small Mobile (MUST pass first)

| Width | Height | Notes |
|---|---|---|
| **350px** | 800px | **Highest priority. All important pages and interactions.** |

This is the single most important viewport. If the 350px layout is broken, the page is not complete regardless of how well it looks at larger sizes.

### Priority 2 — Other Small Mobile

| Width | Height |
|---|---|
| 360px | 800px |
| 375px | 812px |

### Priority 3 — Tablet

| Width | Height |
|---|---|
| 768px | 1024px |
| 1024px | 768px |

### Priority 4 — Desktop

| Width | Height |
|---|---|
| 1280px | 800px |
| 1440px | 900px |

---

## 3. Screenshot Tooling

### Current Flutter Web deployment

The Flutter Web app is deployed via Firebase Hosting. Screenshots are captured using **Puppeteer** (Node.js) or **Playwright** (preferred for Next.js testing), as evidenced by existing scripts in `scratch/`:
- `scratch/capture_logistics_screenshots.mjs` — Puppeteer script for logistics screenshots
- `scratch/capture_coupon_tier_verified.mjs` — Puppeteer coupon screenshots
- `scratch/test_screenshot.mjs` — General screenshot test

Existing screenshots from prior development are stored in `screenshots/`:
- `screenshots/flutter-baseline/` — Flutter Web baseline screenshots
- `screenshots/prompt5/` through `screenshots/prompt8/` — Per-feature comparison screenshots

### Recommended tooling for the Next.js migration

**Primary:** [Playwright](https://playwright.dev/) — already the standard for the project.

Install in the storefront package:
```bash
pnpm add -D @playwright/test --filter @glorov/storefront
```

**Configuration:**
```ts
// apps/storefront/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '../../screenshots/nextjs-migration',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: '350px', use: { viewport: { width: 350, height: 800 } } },
    { name: '360px', use: { viewport: { width: 360, height: 800 } } },
    { name: '375px', use: { viewport: { width: 375, height: 812 } } },
    { name: '768px', use: { viewport: { width: 768, height: 1024 } } },
    { name: '1024px', use: { viewport: { width: 1024, height: 768 } } },
    { name: '1280px', use: { viewport: { width: 1280, height: 800 } } },
    { name: '1440px', use: { viewport: { width: 1440, height: 900 } } },
  ],
})
```

**Screenshot output directory structure:**
```
screenshots/
├── flutter-baseline/          ← existing Flutter Web baseline
└── nextjs-migration/
    ├── home/
    │   ├── flutter-350x800.png
    │   ├── next-350x800.png
    │   ├── flutter-1440x900.png
    │   └── next-1440x900.png
    ├── product/
    ├── cart/
    ├── checkout/
    ├── account/
    └── ...
```

---

## 4. 350px-Specific Checklist

At **350px** width, check every one of the following on every page:

| Check | What to look for |
|---|---|
| Horizontal overflow | Any element causing the page to scroll horizontally |
| Clipped content | Text or images cut off at the right edge |
| Text wrapping | Long words or labels that break layout or overlap |
| Button sizes | All tap targets must be ≥ 44px × 44px |
| Overlapping elements | Absolutely/fixed positioned elements covering content |
| Navigation | Header logo + icons must all fit in one row |
| Bottom nav | Bottom nav (mobile) must not cover page content |
| Product card layout | 2-column grid must display cleanly at 350px |
| Form fields | All inputs must be full-width (no partial-width fields) |
| Modal overflow | Modals must not be wider than the viewport |
| Sticky CTAs | Sticky "Add to Cart" or "Place Order" bars must not overlap content above |
| Image dimensions | No images overflowing their containers |
| Price display | Price + discount badge must not overflow product card |
| Coupon input | Full-width; apply button must remain on same row or stack cleanly |
| Filter chips | Must scroll horizontally, not wrap to multiple rows without clear UX intent |
| Announcement bar | Text must be readable; no overflow |

---

## 5. Page-by-Page Visual Acceptance Criteria

### Home Page (`/`)

| Section | What to verify |
|---|---|
| Announcement bar | Dark blue background, white text, marquee scroll |
| Header | Logo centred (mobile) or left (desktop); cart badge visible |
| Hero banner | Full-width at all viewports; auto-advance dots visible |
| Hero section | Category pills legible at 350px; no text overflow |
| Value props | Icon + label pairs aligned; wraps cleanly at 350px |
| Category tiles | 2-column mobile; 3+ tablet/desktop |
| Featured products rail | Horizontal scroll on mobile; no vertical clipping |
| Offer banner | CTA button accessible; image not distorted |
| Footer | Links stack on mobile; do not overflow |

### Product Detail Page (`/products/[handle]`)

| Section | What to verify |
|---|---|
| Gallery | Full-width on mobile; sticky or side-by-side on desktop |
| Title + botanical name | Wraps cleanly; no overflow at 350px |
| Price + badge | Price and discount tag fit on one line or stack correctly |
| Variant selector | Pills wrap correctly; selected state visible |
| Quantity stepper | +/− buttons are ≥ 44px tap target |
| Add to Cart CTA | Full-width on mobile; sticky bottom on scroll |
| Delivery checker | Input + button fit at 350px |
| Tabs (Description / Reviews) | Tab labels fit; active indicator visible |
| Review cards | Star rating + text lay out correctly |

### Catalog Page (`/c/[handle]`)

| Section | What to verify |
|---|---|
| Header with breadcrumb | Category name visible without overflow |
| Filter / sort bar | Chips horizontally scrollable at 350px |
| Product grid | 2 columns at 350px; 3 at tablet; 4 at desktop |
| Product card | Image, title, price, badge all visible; no text clipping |
| Empty state | Illustration and CTA centred |
| Load-more / pagination | Button full-width on mobile |

### Cart Page (`/cart`)

| Section | What to verify |
|---|---|
| Cart items list | Item row: image, name, variant, stepper, remove — no overlap at 350px |
| Coupon input | Full-width at 350px |
| Free delivery progress bar | Fills correctly; label readable |
| Order summary | Subtotal/discount/total lines align |
| Checkout button | Full-width, green, clearly visible |
| Empty cart state | Illustration + "Continue Shopping" CTA |

### Checkout Page (`/checkout`)

| Section | What to verify |
|---|---|
| Step indicators | All step labels visible at 350px |
| Address form | All fields full-width |
| Shipping option cards | Fit at 350px without truncation |
| Payment option cards | Razorpay + COD option legible |
| Place Order button | Full-width, correct colour |
| Order summary (desktop) | Visible in right panel at 1280px+ |

### Account Pages (`/account/...`)

| Section | What to verify |
|---|---|
| Profile card | Avatar, name, email display correctly |
| Account menu | Full-width links on mobile; sidebar on desktop |
| Order cards | Status badge, item thumbnails, totals visible at 350px |
| Address cards | Address text wraps cleanly at 350px |

### Auth Pages (`/auth/login`, `/auth/signup`)

| Section | What to verify |
|---|---|
| Form card | Centred and padded correctly on all viewports |
| Input fields | Full-width; labels visible |
| Submit button | Full-width, brand green |
| Link to other auth page | Visible below form |

---

## 6. Known Flutter Web Issues to NOT Reproduce

| Page | Issue | Recommended Fix |
|---|---|---|
| Home | Hero category pills may clip at 350px | Use `overflow-x: auto` horizontally scrollable pill row |
| Product detail | Sticky bottom CTA covers gallery scroll indicators | Add bottom padding equal to sticky bar height |
| Cart | Quantity stepper + delete icon overlap at 350px | Move delete icon to a separate row or use icon-only with adequate spacing |
| Checkout | Form field labels truncate | Ensure labels use `white-space: normal` and full width |
| Catalog | Sort/filter bar breaks onto multiple rows without scroll | Force single-row horizontal scroll with `overflow-x: auto` |

> [!WARNING]
> If the Flutter Web layout is broken at 350px, **do not reproduce the broken behaviour**. Document the improvement and implement the corrected layout. Note the change in the implementation PR description.

---

## 7. Visual Diff Tooling (Optional Enhancement)

For automated pixel-level comparisons, consider:

- **Playwright visual comparisons** (`expect(page).toHaveScreenshot()`) — built-in baseline comparison with diff highlighting
- **Percy** or **Chromatic** — cloud-based visual regression services
- **pixelmatch** — lightweight Node.js pixel diff library for custom scripts

The existing project pattern uses Puppeteer scripts in `scratch/`. For the Next.js migration, Playwright's built-in screenshot comparison is preferred since it integrates directly with the test suite.

---

## 8. Screenshot Naming Convention

```
{source}-{page}-{section?}-{width}x{height}.png
```

| Part | Values | Example |
|---|---|---|
| `source` | `flutter`, `next` | `next` |
| `page` | page name | `home`, `product`, `cart` |
| `section` | optional sub-section | `hero`, `gallery`, `reviews` |
| `width` | viewport width | `350` |
| `height` | viewport height | `800` |

Examples:
```
flutter-home-350x800.png
next-home-350x800.png
next-product-gallery-1440x900.png
flutter-cart-350x800.png
```

---

## 9. Completion Sign-Off Criteria

A page is **complete** only when all of the following are true:

- [ ] Flutter baseline screenshot captured at all 7 viewports
- [ ] Next.js screenshot captured at all 7 viewports
- [ ] 350px comparison passed (no regressions vs Flutter; improvements documented)
- [ ] 360px and 375px comparison passed
- [ ] 768px and 1024px comparison passed
- [ ] 1280px and 1440px comparison passed
- [ ] All 350px checklist items verified
- [ ] No horizontal overflow at any viewport
- [ ] All tap targets ≥ 44px at 350px
- [ ] TypeScript type-check passes with zero errors
- [ ] ESLint passes with zero errors
- [ ] Page loads without console errors
