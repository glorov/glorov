# 05 — Design System Inventory

> **Audit date:** 2026-11-03  
> **Source:** `flutter/lib/theme/glorov/`, `flutter/pubspec.yaml`, `docs/glorov-theme-guide.md`  
> **Status:** Analysis-only. No implementation has started.

---

## Overview

GLOROV uses a nature-inspired, premium botanical design system. The canonical source of design tokens is the Flutter theme layer (`flutter/lib/theme/glorov/`). An extended reference exists in `docs/glorov-theme-guide.md` (59 KB — read this document before implementing any UI).

> [!IMPORTANT]
> `constants.dart` contains leftover template colours (purple `primaryColor`, legacy grey palette). **These are NOT GLOROV brand values.** Use only the tokens from `flutter/lib/theme/glorov/glorov_colors.dart`.

---

## 1. Brand Colours

Source: [`flutter/lib/theme/glorov/glorov_colors.dart`](../../flutter/lib/theme/glorov/glorov_colors.dart)

### Primary Brand Greens

| Token | Hex | Usage |
|---|---|---|
| `forestDeep` | `#1B4332` | Primary brand colour — buttons, links, headings, key accents |
| `forestMedium` | `#2D6A4F` | Hover states, secondary actions |
| `forestDark` | `#081C15` | Dark overlays, highest-contrast text on dark backgrounds |

### Secondary & Accent Greens

| Token | Hex | Usage |
|---|---|---|
| `sage` | `#52B788` | Secondary accent — badges, highlights, active states |
| `sageLight` | `#74C69D` | Lighter accent for hover on sage elements |
| `mint` | `#B7E4C7` | Subtle highlights, soft badges |
| `mintSurface` | `#E8F5E9` | Light green background for feature sections |
| `mintBadge` | `#D8F3DC` | Badge background |

### Botanical Earth & Warm Accents

| Token | Hex | Usage |
|---|---|---|
| `earthGold` | `#DDA15E` | Warm accent — star ratings, price highlights |
| `terracotta` | `#BC6C25` | Deep warm accent, terracotta badge tones |
| `earthWarm` | `#606C38` | Muted olive for secondary labels |
| `sunAmber` | `#F4A261` | CTA accents, warm highlights |

### Surfaces & Backgrounds

| Token | Hex | Usage |
|---|---|---|
| `surfacePure` | `#FFFFFF` | Card backgrounds, input fields |
| `surfaceCream` | `#F9FAF8` | Page/scaffold background — the default page colour |
| `surfaceMuted` | `#F3F4F1` | Section dividers, muted card backgrounds |
| `surfaceCard` | `#FFFFFF` | Product cards |

### Dark Blue Tags & Announcement

| Token | Hex | Usage |
|---|---|---|
| `tagDarkBlue` | `#0C2340` | Announcement bar background (dark blue, not green) |
| `tagDarkBlueHover` | `#08192E` | Hover on dark-blue elements |
| `tagTextWhite` | `#FFFFFF` | Text on dark-blue elements |

### Neutral Borders & Dividers

| Token | Hex | Usage |
|---|---|---|
| `borderSubtle` | `#E5E7EB` | Default border for cards, inputs |
| `borderMedium` | `#D1D5DB` | Slightly stronger borders, outlined buttons |
| `borderLight` | `#F3F4F6` | Very subtle dividers |

### Typography Colours

| Token | Hex | Usage |
|---|---|---|
| `textPrimary` | `#111827` | Body text, headings |
| `textSecondary` | `#374151` | Sub-labels, supporting text |
| `textMuted` | `#6B7280` | Hints, captions, placeholders |
| `textDisabled` | `#9CA3AF` | Disabled form elements |
| `textOnPrimary` | `#FFFFFF` | Text on dark/green backgrounds |

### Semantic Status Colours

| Token | Hex | Usage |
|---|---|---|
| `error` | `#EF4444` | Error messages, destructive actions |
| `errorSurface` | `#FEF2F2` | Error alert backgrounds |
| `success` | `#10B981` | Success messages, in-stock indicators |
| `successSurface` | `#ECFDF5` | Success alert backgrounds |
| `warning` | `#F59E0B` | Warning states, low-stock indicators |
| `warningSurface` | `#FFFBEB` | Warning alert backgrounds |
| `info` | `#3B82F6` | Informational badges |

---

## 2. Typography

Source: [`flutter/lib/theme/glorov/glorov_typography.dart`](../../flutter/lib/theme/glorov/glorov_typography.dart)

### Font Families

| Role | Family | Weights available | Usage |
|---|---|---|---|
| Primary / UI | **Plus Jakarta Display** | 400, 500, 700 | All body text, labels, buttons, navigation |
| Display / Serif | **Fraunces** | 400, 600, 700, 900 | Hero headings, display titles, brand moments |
| Decorative | **Grandis Extended** | 300, 400, 500, 700, 900 | Logo, special display treatments only |

Font files are in `flutter/assets/fonts/` and are already available as web-compatible OTF/TTF.

### Type Scale

| Role | Family | Size | Weight | Line height | Letter spacing | Usage |
|---|---|---|---|---|---|---|
| `displayLarge` | Fraunces | 36px | 700 | 1.2 | -0.5px | Hero headlines, page titles |
| `displayMedium` | Fraunces | 28px | 700 | 1.25 | -0.3px | Section headings |
| `displaySmall` | Fraunces | 24px | 700 | 1.3 | -0.2px | Sub-section titles |
| `headlineMedium` | Plus Jakarta | 20px | 600 | 1.35 | — | Card headings, modal titles |
| `headlineSmall` | Plus Jakarta | 18px | 600 | 1.4 | — | List headings |
| `titleLarge` | Plus Jakarta | 16px | 600 | 1.45 | — | Product names in cards |
| `titleMedium` | Plus Jakarta | 14px | 600 | 1.45 | — | Bold labels, tab titles |
| `titleSmall` | Plus Jakarta | 13px | 500 | 1.45 | — | Secondary labels |
| `bodyLarge` | Plus Jakarta | 15px | 400 | 1.5 | — | Main body copy |
| `bodyMedium` | Plus Jakarta | 14px | 400 | 1.5 | — | Supporting descriptions |
| `bodySmall` | Plus Jakarta | 12px | 400 | 1.5 | — | Captions, footnotes |
| `labelLarge` | Plus Jakarta | 14px | 600 | — | 0.1px | Button text |
| `labelMedium` | Plus Jakarta | 12px | 500 | — | 0.2px | Tag text, small labels |
| `labelSmall` | Plus Jakarta | 10px | 600 | — | 0.5px | Micro badges, legal text |

---

## 3. Spacing Scale

Source: [`flutter/lib/theme/glorov/glorov_spacing.dart`](../../flutter/lib/theme/glorov/glorov_spacing.dart)

| Token | Value | CSS equivalent |
|---|---|---|
| `xxs` | 4px | `space-1` |
| `xs` | 8px | `space-2` |
| `sm` | 12px | `space-3` |
| `md` | 16px | `space-4` |
| `lg` | 24px | `space-6` |
| `xl` | 32px | `space-8` |
| `xxl` | 48px | `space-12` |
| `hero` | 64px | `space-16` |

---

## 4. Border Radius Scale

Source: [`flutter/lib/theme/glorov/glorov_radii.dart`](../../flutter/lib/theme/glorov/glorov_radii.dart)

| Token | Value | Usage |
|---|---|---|
| `none` | 0px | Square elements |
| `xs` | 4px | Small chips, tiny tags |
| `sm` | 8px | Input fields, small cards |
| `md` | 12px | Cards, buttons (primary usage) |
| `lg` | 16px | Large cards, modals |
| `xl` | 24px | Bottom sheets, hero elements |
| `full` | 999px | Pills, circular icons |

---

## 5. Breakpoints

Source: [`flutter/lib/theme/glorov/glorov_breakpoints.dart`](../../flutter/lib/theme/glorov/glorov_breakpoints.dart)

| Breakpoint | Width | Behaviour |
|---|---|---|
| Mobile | ≤ 640px | Bottom nav visible; single column layouts |
| Tablet | 641px – 1024px | 3-column grid; no bottom nav |
| Desktop | ≥ 1025px | 4-column grid; sidebar layouts; max content 1280px |

**Product grid column count:**
- < 640px → 2 columns
- 640px – 1149px → 3 columns
- ≥ 1150px → 4 columns

---

## 6. Component-Specific Token Usage

### Buttons (from `GlorovTheme.lightTheme`)

| Variant | Background | Text | Border | Padding | Radius |
|---|---|---|---|---|---|
| Primary (elevated) | `forestDeep` (#1B4332) | White | None | 24px × 16px | 12px (`md`) |
| Secondary (outlined) | Transparent | `forestDeep` | `borderMedium` 1.2px | 16px × 12px | 12px (`md`) |
| Text / Ghost | Transparent | `forestDeep` | None | 12px horizontal | — |

### Input Fields

| State | Fill | Border | Radius |
|---|---|---|---|
| Default | `surfacePure` | `borderSubtle` | 12px |
| Focused | `surfacePure` | `forestDeep` 1.5px | 12px |
| Error | `surfacePure` | `error` 1px | 12px |

**Content padding:** 16px horizontal, 14px vertical

### Cards

| Property | Value |
|---|---|
| Background | `surfacePure` |
| Border | `borderSubtle` 1px |
| Border radius | 12px (`md`) |
| Elevation | 0 (flat) |
| Margin | 0 |

### App Bar / Header

| Property | Value |
|---|---|
| Background | `surfacePure` |
| Elevation | 0 (scroll: 0.5) |
| Title font | Plus Jakarta 16px/600 |
| Icon colour | `textPrimary` |

### Announcement Bar (custom GLOROV)

| Property | Value |
|---|---|
| Background | `tagDarkBlue` (#0C2340) — **NOT green** |
| Text colour | White |
| Highlight colour | `sage` (#52B788) |

---

## 7. Elevation & Shadows

GLOROV uses **flat design** — `elevation: 0` on all cards and buttons by default. Shadows are applied selectively:

| Element | Shadow |
|---|---|
| Cards (default) | None |
| Modals / Drawers | Soft backdrop shadow |
| Sticky header (scrolled) | `box-shadow: 0 1px 4px rgba(0,0,0,0.08)` |
| Floating cart button | Subtle drop shadow |

---

## 8. Icons

GLOROV uses:
- **Material Icons** (Flutter built-in) — navigation, actions, status
- **Custom SVG icons** in `flutter/assets/icons/` — trust badge icons, category icons, botanical icons
- **`GlorovCustomTrustIcon`** — renders custom SVG trust icons with brand colour tinting

All custom SVG icon files must be exported to `apps/storefront/public/icons/` during implementation.

---

## 9. Image Treatments

| Context | Treatment |
|---|---|
| Product images | Square crop (1:1), Cloudinary-hosted, progressive JPEG |
| Hero banners | Wide crop (16:9 or fill), Cloudinary-optimised |
| Category tiles | Square, with semi-transparent gradient overlay for text legibility |
| Thumbnails | 80×80 or 120×120, object-fit: cover |

Use Cloudinary transformation URLs for automatic resizing and WebP delivery:
```
https://res.cloudinary.com/naodmm8w/image/upload/w_400,h_400,c_fill,f_auto,q_auto/glorov/...
```

---

## 10. Animation & Transitions

Source: `docs/MICRO_INTERACTIONS.md` (27 KB)

| Element | Animation | Duration |
|---|---|---|
| Page transitions | Fade | 200ms |
| Header collapse/expand | Slide + fade | 200ms |
| Modal open/close | Fade + scale | 200ms |
| Drawer slide | Slide | 250ms |
| Cart toast | Slide up + fade | 200ms |
| Skeleton shimmer | Infinite shimmer | 1200ms |
| Carousel auto-advance | Crossfade | 400ms |
| Button press | Scale 0.97 | 100ms |
| Wishlist toggle | Heart pulse | 150ms |

All transitions use `ease-in-out` or Flutter's `Curves.easeInOut`.

---

## 11. Tailwind CSS & CSS Variables Migration Plan

### Step 1 — CSS custom properties (`:root`)

Define all brand tokens as CSS variables so they work with both Tailwind and plain CSS:

```css
:root {
  /* Brand greens */
  --color-forest-deep: #1B4332;
  --color-forest-medium: #2D6A4F;
  --color-forest-dark: #081C15;
  --color-sage: #52B788;
  --color-sage-light: #74C69D;
  --color-mint: #B7E4C7;
  --color-mint-surface: #E8F5E9;
  --color-mint-badge: #D8F3DC;

  /* Earth accents */
  --color-earth-gold: #DDA15E;
  --color-terracotta: #BC6C25;
  --color-earth-warm: #606C38;
  --color-sun-amber: #F4A261;

  /* Surfaces */
  --color-surface-pure: #FFFFFF;
  --color-surface-cream: #F9FAF8;
  --color-surface-muted: #F3F4F1;

  /* Tags */
  --color-tag-dark-blue: #0C2340;

  /* Borders */
  --color-border-subtle: #E5E7EB;
  --color-border-medium: #D1D5DB;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-muted: #6B7280;
  --color-text-disabled: #9CA3AF;

  /* Semantic */
  --color-error: #EF4444;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-info: #3B82F6;
}
```

### Step 2 — Tailwind theme extension (`tailwind.config.ts`)

```ts
theme: {
  extend: {
    colors: {
      'forest-deep':    'var(--color-forest-deep)',
      'forest-medium':  'var(--color-forest-medium)',
      'forest-dark':    'var(--color-forest-dark)',
      'sage':           'var(--color-sage)',
      'sage-light':     'var(--color-sage-light)',
      'mint':           'var(--color-mint)',
      'mint-surface':   'var(--color-mint-surface)',
      'mint-badge':     'var(--color-mint-badge)',
      'earth-gold':     'var(--color-earth-gold)',
      'terracotta':     'var(--color-terracotta)',
      'sun-amber':      'var(--color-sun-amber)',
      'surface-cream':  'var(--color-surface-cream)',
      'surface-muted':  'var(--color-surface-muted)',
      'tag-dark-blue':  'var(--color-tag-dark-blue)',
      'border-subtle':  'var(--color-border-subtle)',
      'border-medium':  'var(--color-border-medium)',
      'text-primary':   'var(--color-text-primary)',
      'text-secondary': 'var(--color-text-secondary)',
      'text-muted':     'var(--color-text-muted)',
    },
    fontFamily: {
      sans:    ['Plus Jakarta Display', 'sans-serif'],
      serif:   ['Fraunces', 'serif'],
      display: ['Fraunces', 'serif'],
      brand:   ['Grandis Extended', 'sans-serif'],
    },
    borderRadius: {
      'xs':   '4px',
      'sm':   '8px',
      'md':   '12px',
      'lg':   '16px',
      'xl':   '24px',
      'full': '999px',
    },
    spacing: {
      'xxs':  '4px',
      'xs':   '8px',
      'sm':   '12px',
      'md':   '16px',
      'lg':   '24px',
      'xl':   '32px',
      'xxl':  '48px',
      'hero': '64px',
    },
    maxWidth: {
      'content': '1280px',
    },
    screens: {
      'tablet':  '641px',
      'desktop': '1025px',
    },
  },
}
```

### Step 3 — Font loading

Load fonts via `next/font/local` in `app/layout.tsx` using the font files already present in `flutter/assets/fonts/`. Copy files to `apps/storefront/public/fonts/` during setup.

```ts
const plusJakarta = localFont({
  src: [
    { path: '../public/fonts/PlusJakartaDisplay-Regular.otf', weight: '400' },
    { path: '../public/fonts/PlusJakartaDisplay-Medium.otf',  weight: '500' },
    { path: '../public/fonts/PlusJakartaDisplay-Bold.otf',    weight: '700' },
  ],
  variable: '--font-plus-jakarta',
})

const fraunces = localFont({
  src: [
    { path: '../public/fonts/Fraunces-Regular.ttf',   weight: '400' },
    { path: '../public/fonts/Fraunces-SemiBold.ttf',  weight: '600' },
    { path: '../public/fonts/Fraunces-Bold.ttf',      weight: '700' },
    { path: '../public/fonts/Fraunces-Black.ttf',     weight: '900' },
  ],
  variable: '--font-fraunces',
})
```

> [!NOTE]
> Font files are already present in `flutter/assets/fonts/` in OTF/TTF format. They are valid for web use. No new licenses need to be acquired — these are the same files already served in production Flutter Web.
