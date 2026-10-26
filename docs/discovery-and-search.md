# GLOROV — Product Search, Filtering, and Sorting Documentation

**Version:** 1.0.0  
**Status:** Implemented & Verified  
**Scope:** Storefront Discovery Engine & Backend Store API Integration  

---

## 1. Overview & Architecture

GLOROV's product discovery system provides a fast, responsive, and server-driven catalog discovery experience tailored specifically for Indian home gardeners, farmers, and plant enthusiasts.

The discovery architecture bridges Medusa v2's Store API with Next.js 15 App Router Server Components, preserving complete URL-driven state while avoiding heavy client-side downloads of catalog data.

```mermaid
flowchart TD
    User["Customer (Desktop / Mobile Browser)"]
    HeaderSearch["Desktop & Mobile Header SearchInput"]
    TypeaheadAPI["Next.js Route Handler (/api/search?q=...)"]
    StorePage["Next.js Server Component (/store & /categories)"]
    MedusaStoreAPI["Medusa v2 Store API (/store/products)"]
    PostgresDB[(PostgreSQL 16 Engine)]

    User -->|"Typeahead query (250ms debounce)"| HeaderSearch
    HeaderSearch -->|"BFF request (with AbortController)"| TypeaheadAPI
    TypeaheadAPI -->|"GET /store/products?q=...&limit=5"| MedusaStoreAPI
    MedusaStoreAPI -->|"Full-text index search"| PostgresDB

    User -->|"Form submit / filter change"| StorePage
    StorePage -->|"GET /store/products?q=...&category_id=..."| MedusaStoreAPI
    StorePage -->|"Extract facets, apply botanical filters & sorting"| StorePage
    StorePage -->|"Server-rendered HTML with active pills & pagination"| User
```

---

## 2. URL State & Search Parameters Specification

Discovery state is preserved in shareable, bookmarks-friendly URL query parameters across both `/store` and `/categories/[...category]` routes:

| URL Parameter | Type / Format | Example | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | `?q=tomato` | Free-text search matching title, description, botanical name, variety, common Hindi/vernacular name, and SKUs. |
| `category` | `string` (handle) | `?category=vegetable-seeds` | Product category handle filter. Queries category and all its descendant branches. |
| `seed_type` | `string` (enum/slug) | `?seed_type=heirloom` | Botanical seed/plant classification: `heirloom`, `open_pollinated`, `hybrid`, `organic`, `live`. |
| `season` | `string` (enum/slug) | `?season=kharif` | Indian sowing seasons: `kharif` (Monsoon), `rabi` (Winter), `zaid` (Summer), or `all_season`. |
| `min_price` | `integer` (Rupees) | `?min_price=50` | Minimum product starting price in INR. |
| `max_price` | `integer` (Rupees) | `?max_price=200` | Maximum product starting price in INR. |
| `in_stock` | `boolean` (`'true'`) | `?in_stock=true` | Excludes completely out-of-stock items, showing only items available for dispatch. |
| `packet_size` | `string` | `?packet_size=50+Seeds` | Filters by packet seed count or container dimensions (e.g., `20 Seeds`, `50 Seeds`, `100 Seeds`, `4-inch`, `6-inch`). |
| `sort` | `string` (enum) | `?sort=price_asc` | Ordering strategy: `featured`, `price_asc`, `price_desc`, `newest`, `title_asc`. |
| `page` | `integer` | `?page=2` | Pagination page number (defaults to 1). Resets to 1 automatically whenever filters change. |

---

## 3. Supported Sorting Strategies

1. **Featured & Relevance (`featured` / `relevance`):**
   - When a search query `q` is active, products are ranked by an Indian botanical relevance score:
     - Exact title match: **+100 points**
     - Common vernacular / Hindi name or variety match: **+70 points**
     - Title prefix match: **+60 points**
     - Title substring match: **+40 points**
     - Botanical binomial name match: **+30 points**
     - Variant title or SKU match: **+15 points**
     - Description match: **+10 points**
   - When no search query is active, original catalog order is preserved.
2. **Price: Low to High (`price_asc`):**
   - Sorts products by their lowest variant price in INR paise (`paise / 100`).
3. **Price: High to Low (`price_desc`):**
   - Sorts products by their highest variant price in INR descending.
4. **Newest Arrivals (`newest`):**
   - Sorts products by `created_at` timestamp descending, prioritizing recently added varieties.
5. **Alphabetical: A to Z (`title_asc`):**
   - Sorts products in alphabetical lexicographical order by product title.

---

## 4. UI Components & Responsive Discovery

### 4.1 SearchInput (`src/components/common/SearchInput.tsx`)
- Accessible search field with `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, and `aria-controls`.
- Automatic 250ms debouncing with `AbortController` cancellation to disregard stale in-flight requests.
- Integrated typeahead suggestions displaying thumbnail, title, variety/common name, lowest price (`From ₹49`), and stock badge (`In Stock` / `Out of Stock`).
- Clear button (`X`) to reset query with keyboard focus restoration.
- Keyboard navigation: Arrow Down / Arrow Up to navigate suggestions, Enter to select or submit, Escape to dismiss.
- Wrapped in `<React.Suspense>` to prevent Next.js 15 CSR prerender bailouts during static site generation.

### 4.2 CatalogFilters (`src/components/catalog/CatalogFilters.tsx`)
- **Active Filter Pills Bar:** Displays removable badges for every active filter (Search query, Category, Seed Type, Season, Price range, In-stock, Packet size) with individual remove (`X`) buttons and a "Clear all filters" CTA.
- **Top Quick Bar:** Displays total matching specimens count (`13 Specimens`), quick "In Stock Only" toggle pill, and accessible Sort dropdown.
- **Category Quick Chips:** Horizontally scrollable category pills ("All Products", "Vegetable Seeds", "Flower Seeds", "Herb Seeds", "Live Plants", etc.).
- **Desktop Expandable Drawer:** 4-column filter grid accessible via "More Filters" toggle:
  - Seed / Plant Type selector
  - Sowing Season selector
  - Packet / Pot Size selector
  - Price Range preset buttons + Custom Min/Max INR inputs
- **Mobile Filter Dialog:** Accessible modal dialog (powered by Radix UI `Dialog`) triggered by a mobile "Filters" button displaying an active filter counter badge.

### 4.3 Catalog Pages (`src/app/store/page.tsx` & `src/app/categories/[...category]/page.tsx`)
- Server Components resolving search parameters dynamically without downloading full catalog payloads on the client.
- Dynamic facet extraction (`extractCatalogFacets`) calculating category counts, seed type counts, season counts, and price bounds.
- Resilient empty states when 0 products match, providing helpful explanations and 1-click popular search suggestions ("Tomato Seeds", "Marigold", "Krishna Tulsi", "Snake Plant", "Coriander").
- Graceful API error handling with retry CTA when Medusa backend is temporarily unreachable.

---

## 5. Verification Instructions

### 5.1 Verification Using Live Seed & Plant Fixtures

#### 1. Search for Tomato Seeds
- Navigate to: `http://localhost:3000/store?q=tomato`
- Expected: Returns **Tomato Seeds (Desi / Pusa Ruby)** (`tomato-seeds-desi`). Shows active filter badge `Search: "tomato"`.

#### 2. Search for Marigold Seeds
- Navigate to: `http://localhost:3000/store?q=marigold`
- Expected: Returns **Marigold Seeds (Pusa Narangi Gainda)** (`marigold-seeds-pusa-narangi`).

#### 3. Search for Live Plants
- Navigate to: `http://localhost:3000/store?q=snake`
- Expected: Returns **Snake Plant Golden Hahnii (Sansevieria)** (`snake-plant-golden-hahnii`).

#### 4. Filter by Season: Kharif
- Navigate to: `http://localhost:3000/store?season=kharif`
- Expected: Returns Kharif and All-Season seeds (Tomato, Marigold, Tulsi, Snake Plant); excludes Rabi-only seeds (Coriander).

#### 5. Filter by Price Range: Under ₹50
- Navigate to: `http://localhost:3000/store?max_price=50`
- Expected: Returns products starting at or under ₹50 (Tomato Seeds ₹49, Marigold Seeds ₹39, Tulsi Seeds ₹45). Excludes Snake Plant (₹199).

#### 6. Combined Filter (In-Stock + Vegetable Seeds)
- Navigate to: `http://localhost:3000/store?category=vegetable-seeds&in_stock=true`
- Expected: Returns in-stock vegetable seeds (Tomato Seeds); excludes out-of-stock items.

#### 7. Sorting by Price
- Low to High: `http://localhost:3000/store?sort=price_asc`
  - Expected: Lowest price varieties (₹35, ₹39, ₹45, ₹49) appear first.
- High to Low: `http://localhost:3000/store?sort=price_desc`
  - Expected: Premium varieties / potted plants (₹199) appear first.

---

## 6. Automated Test Suite Summary

All tests pass 100% across the monorepo:

| Test Suite | File | Tests Count | Status |
| :--- | :--- | :--- | :--- |
| Storefront Catalog Unit Tests | `apps/storefront/src/lib/__tests__/catalog.test.ts` | **51 tests** | PASS |
| Storefront Discovery Component Tests | `apps/storefront/src/__tests__/search-and-filtering.test.tsx` | **16 tests** | PASS |
| Storefront Customer Journey Tests | `apps/storefront/src/__tests__/customer-journeys.test.tsx` | **17 tests** | PASS |
| Storefront Other Unit Tests | `apps/storefront/src/lib/__tests__/*.test.ts` | **80 tests** | PASS |
| Backend Store API Catalog Tests | `apps/backend/integration-tests/http/catalog-store-api.spec.ts` | **12 tests** | PASS |
| Backend HTTP Integration Suite | `apps/backend/integration-tests/http/*.spec.ts` | **133 tests** | PASS |
| Backend Unit Suite | `apps/backend/src/__tests__/*.spec.ts` | **116 tests** | PASS |
| **Total Monorepo Automated Tests** | — | **413 tests** | **100% PASS** |
