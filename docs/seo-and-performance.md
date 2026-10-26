# GLOROV E-commerce Platform — Technical SEO and Performance Optimization

**Document Version:** 1.0.0  
**Status:** Implemented & Verified in CI/CD  
**Scope:** `@glorov/storefront` Next.js 15 App Router  

---

## 1. Overview & Architectural Goals

The GLOROV storefront discoverability strategy balances aggressive search visibility for botanical products and educational categories with strict privacy protection for customer checkout, cart, and authentication paths.

### Core Objectives
1. **Accurate Botanical Discovery:** High visibility for organic seeds, heirloom varieties, and live indoor botanicals across India.
2. **Deterministic Canonical URLs:** Prevent crawl loops and duplicate indexing caused by faceted navigation and sorting query parameters (`?q=...&season=...&packet_size=...`).
3. **Verified Schema.org Structured Data:** Deliver valid JSON-LD `Product` and `Offer` data sourced strictly from backend Medusa inventory and INR pricing, never fabricating reviews, fake ratings, or false delivery promises.
4. **Crawl Shielding:** Absolute exclusion of customer account areas (`/account/*`), checkout sessions (`/checkout`), order confirmations (`/order/confirmed/*`), and internal API endpoints (`/api/*`) using `robots.txt` and `<meta name="robots" content="noindex, nofollow" />`.
5. **Core Web Vitals & Mobile Performance:** Zero Cumulative Layout Shift (CLS) through fixed container aspect ratios, image compression via AVIF/WebP formats with `sharp`, responsive `sizes` attributes, and request-level deduplication via SSR memoization.

---

## 2. Metadata Architecture

### Root Metadata (`app/layout.tsx`)
- **MetadataBase:** `https://glorov.in` (configured via `NEXT_PUBLIC_BASE_URL` with production fallback).
- **Title Template:** `%s | GLOROV Botanicals` (Default: `GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery`).
- **OpenGraph:** `locale: 'en_IN'`, `type: 'website'`, `siteName: 'GLOROV Botanicals'`.
- **Twitter:** `card: 'summary_large_image'`.
- **Googlebot Directives:** `'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1`.

### Canonical URL Strategy
| Route | Canonical Target | Reason |
| :--- | :--- | :--- |
| **Homepage** (`/`) | `https://glorov.in/` | Primary root domain canonical. |
| **Catalog Store** (`/store`) | `https://glorov.in/store` | Strips all search (`?q=...`), facet, pagination, and sorting parameters. |
| **Category Routes** (`/categories/[...category]`) | `https://glorov.in/categories/:slug` | Prevents index explosion across faceted filters (season, packet size). |
| **Product Detail** (`/products/[handle]`) | `https://glorov.in/products/:handle` | Unique canonical per botanical variant handle. |
| **Private Routes** (`/account/*`, `/checkout`, `/cart`) | `noindex, nofollow` | Never indexed by public search crawlers. |

---

## 3. Product Structured Data (Schema.org JSON-LD)

Each product detail page injects Schema.org compliant structured data rendered from verified Medusa Store API values:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Desi Genda Marigold Seeds",
  "description": "Heirloom yellow and orange flower seeds for festive winter blooms.",
  "image": [
    "https://images.unsplash.com/photo-1592841200221-a6898f307baa"
  ],
  "sku": "GLR-MAR-50S",
  "category": "Flower Seeds",
  "url": "https://glorov.in/products/desi-genda-marigold-seeds",
  "brand": {
    "@type": "Brand",
    "name": "GLOROV"
  },
  "offers": [
    {
      "@type": "Offer",
      "sku": "GLR-MAR-50S",
      "name": "50 Seeds Packet",
      "priceCurrency": "INR",
      "price": "99.00",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "url": "https://glorov.in/products/desi-genda-marigold-seeds",
      "seller": {
        "@type": "Organization",
        "name": "GLOROV Botanicals"
      }
    }
  ]
}
```

### Safety Invariants
- **No Fabricated Reviews:** No fake stars, aggregate ratings, or simulated reviews are added.
- **Accurate Currency:** Sourced from Medusa variant pricing in `INR` (converted from paise `amount / 100`).
- **Dynamic Availability:** Accurately reflects real-time stock levels (`https://schema.org/InStock` vs `https://schema.org/OutOfStock`).

---

## 4. Crawl Directives and Dynamic Sitemap

### `app/robots.ts`
Outputs standard `robots.txt` configuration:
```txt
User-agent: *
Allow: /
Disallow: /account
Disallow: /account/
Disallow: /checkout
Disallow: /checkout/
Disallow: /cart
Disallow: /cart/
Disallow: /order/confirmed
Disallow: /order/confirmed/
Disallow: /api/

Sitemap: https://glorov.in/sitemap.xml
```

### `app/sitemap.ts`
Dynamically generates `sitemap.xml` containing:
- Homepage (`/`) with priority `1.0` and daily change frequency.
- Store Catalog (`/store`) with priority `0.9` and daily change frequency.
- Published Categories (`/categories/:handle`) with priority `0.8` and weekly change frequency.
- Published Products (`/products/:handle`) with priority `0.7` and daily change frequency.
- Graceful try/catch fallback ensuring static core routes always build even if the backend is temporarily offline during build time.

---

## 5. Performance Optimizations & Measurements

### Server-Side Request Deduplication
When Next.js renders `products/[handle]`, both `generateMetadata` and `ProductDetailPage` request catalog data for the same handle.
- Added in-flight request deduplication and a 15-second TTL in-memory promise memoizer in `src/lib/catalog.ts`.
- **Result:** Exactly **1 network request** is dispatched to the Medusa backend per page view, halving upstream backend catalog query load during SSR.

### Image Compression & Core Web Vitals
- Installed `sharp` high-performance imaging engine in `@glorov/storefront`.
- Configured AVIF and WebP image generation with device sizes `[640, 750, 828, 1080, 1200, 1920]` in `next.config.ts`.
- Removed blanket `unoptimized` flag from `ProductCard` and `ProductGallery` images, enabling automatic WebP/AVIF compression.
- Maintained explicit responsive `sizes` attributes (e.g. `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw`) and `priority` on above-the-fold hero and gallery images to optimize Largest Contentful Paint (LCP) and eliminate Cumulative Layout Shift (CLS).

### Build Baseline vs. Final Measurements
| Route | Baseline First Load JS | Post-Optimization First Load JS | Classification |
| :--- | :--- | :--- | :--- |
| **Shared by All** | 103 kB | 103 kB | Shared framework & vendor bundles |
| **Homepage** (`/`) | 172 kB | 172 kB | Dynamic SSR (health status & catalog) |
| **Store Catalog** (`/store`) | 189 kB | 189 kB | Dynamic SSR (faceted filters & search) |
| **Category** (`/categories/[...category]`) | 189 kB | 189 kB | Dynamic SSR (category hierarchy) |
| **Product Detail** (`/products/[handle]`) | 185 kB | 185 kB | Dynamic SSR (variant pricing & stock) |
| **Robots** (`/robots.txt`) | *N/A (Missing)* | 103 kB | Static Prerendered |
| **Sitemap** (`/sitemap.xml`) | *N/A (Missing)* | 103 kB | Dynamic SSR |
| **Checkout** (`/checkout`) | 131 kB | 131 kB | Static Client Form (`noindex`) |
| **Cart** (`/cart`) | 131 kB | 131 kB | Static Client Drawer (`noindex`) |

---

## 6. Verification & Automated Test Coverage

The SEO and technical indexing suite is automated in `src/__tests__/seo-and-performance.test.tsx` across 15 test cases:
1. Root layout `metadataBase`, title template, OpenGraph locale `en_IN`, and Googlebot directives.
2. Canonical link and OpenGraph card generation for the homepage.
3. Stable canonical URL for `/store` preventing crawl traps.
4. Dynamic category metadata and canonical path ignoring filter query strings.
5. Dynamic 404/noindex fallback for nonexistent categories.
6. Dynamic product metadata with botanical taxonomy names and image arrays.
7. Valid Schema.org `Product` JSON-LD with verified INR prices, SKU, availability, and seller details (strictly omitting fake reviews).
8. Customer account layout `robots: { index: false, follow: false }`.
9. Checkout layout `robots: { index: false, follow: false }`.
10. Cart layout `robots: { index: false, follow: false }`.
11. Order confirmed page `robots: { index: false, follow: false }`.
12. Robots.txt rules disallowing private paths and referencing `sitemap.xml`.
13. Sitemap generator returning core public routes, categories, and published products.
14. Request deduplication for `getStoreCatalogProductByHandle` ensuring 1 backend query per SSR cycle.
15. Request deduplication for `getStoreCatalogCategories`.
