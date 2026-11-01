import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Sprout, AlertCircle, RefreshCw, Search } from 'lucide-react'
import type { CatalogSortOption } from '@glorov/types'
import {
  getStoreCatalogProducts,
  getStoreCatalogCategories,
  findCategoryByHandle,
  getCategoryHierarchyIds,
  filterCatalogProducts,
  sortCatalogProducts,
  extractCatalogFacets,
} from '@/lib/catalog'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import { Pagination } from '@/components/catalog/Pagination'
import styles from './StorePage.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Botanical Store — Pure Seeds & Potted Live Plants',
  description:
    'Browse our comprehensive catalog of verified Indian vegetable seeds, flower seeds, medicinal herbs, and climate-hardened live plants.',
  alternates: {
    canonical: '/store',
  },
  openGraph: {
    title: 'Botanical Store — Pure Seeds & Potted Live Plants | GLOROV Botanicals',
    description:
      'Browse our comprehensive catalog of verified Indian vegetable seeds, flower seeds, medicinal herbs, and climate-hardened live plants.',
    url: '/store',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Botanical Store — Pure Seeds & Potted Live Plants | GLOROV Botanicals',
    description:
      'Browse our comprehensive catalog of verified Indian vegetable seeds, flower seeds, medicinal herbs, and climate-hardened live plants.',
  },
}

interface StorePageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    seed_type?: string
    season?: string
    min_price?: string
    max_price?: string
    in_stock?: string
    packet_size?: string
    sort?: string
    page?: string
  }>
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || undefined
  const categoryParam = resolvedSearchParams.category?.trim() || undefined
  const seedTypeParam = resolvedSearchParams.seed_type?.trim() || undefined
  const seasonParam = resolvedSearchParams.season?.trim() || undefined
  const packetSizeParam = resolvedSearchParams.packet_size?.trim() || undefined
  const minPriceParam = resolvedSearchParams.min_price
    ? Math.max(0, parseInt(resolvedSearchParams.min_price, 10))
    : undefined
  const maxPriceParam = resolvedSearchParams.max_price
    ? Math.max(0, parseInt(resolvedSearchParams.max_price, 10))
    : undefined
  const inStockOnly = resolvedSearchParams.in_stock === 'true'
  const sort = (resolvedSearchParams.sort as CatalogSortOption) || 'featured'
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10) || 1)
  const pageSize = 12

  // 1. Fetch Categories for filter pills and category hierarchy
  const categoriesRes = await getStoreCatalogCategories()
  const categories = categoriesRes.success ? categoriesRes.categories : []

  // 2. Resolve Category ID filter if specified
  let categoryIds: string[] | undefined = undefined
  let activeCategoryName: string | undefined = undefined

  if (categoryParam) {
    const matchedCategory = findCategoryByHandle(categories, categoryParam)
    if (matchedCategory) {
      categoryIds = getCategoryHierarchyIds(matchedCategory)
      activeCategoryName = matchedCategory.name
    }
  }

  // 3. Fetch products from Medusa Store API & authentic botanical catalog
  const productsRes = await getStoreCatalogProducts({
    q,
    category_id: categoryIds,
    limit: 100,
  })

  // Handle API failure gracefully
  if (!productsRes.success && productsRes.products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <AlertCircle size={24} style={{ color: 'var(--ugaoo-sale-red)' }} />
          </div>
          <h2 className={styles.emptyTitle}>Catalog Unavailable</h2>
          <p className={styles.emptyText}>
            We encountered a temporary issue connecting to the botanical catalog. Please try again or return home.
          </p>
          <Link href="/store" className={styles.viewAllCatalogBtn}>
            <RefreshCw size={14} style={{ marginRight: '4px' }} />
            <span>Retry Catalog</span>
          </Link>
        </div>
      </div>
    )
  }

  const rawProducts = productsRes.products || []

  // 4. Extract facets from fetched products
  const facets = extractCatalogFacets(rawProducts)

  // 5. Apply discovery filters (query fallback, seed type, season, price bounds, in-stock, packet sizes)
  const filteredProducts = filterCatalogProducts(rawProducts, {
    q,
    category: categoryParam,
    seed_type: seedTypeParam,
    season: seasonParam,
    min_price: minPriceParam,
    max_price: maxPriceParam,
    in_stock: inStockOnly,
    packet_size: packetSizeParam,
  })

  // 6. Sort filtered products cleanly
  const sortedProducts = sortCatalogProducts(filteredProducts, sort, q)

  const totalCount = sortedProducts.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Botanical Store</span>
        {activeCategoryName && (
          <>
            <ChevronRight size={12} aria-hidden="true" />
            <span className={styles.breadcrumbActiveCategory}>{activeCategoryName}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.badgeRow}>
          <span className={styles.nurseryBadge}>
            Pune Propagation Nursery
          </span>
          <span className={styles.dispatchText}>• Pan-India Dispatch</span>
        </div>

        <div className={styles.titleRow}>
          <div className={styles.iconWrap}>
            <Sprout size={20} aria-hidden="true" />
          </div>
          <h1 className={styles.title}>
            {activeCategoryName || (q ? `Search: "${q}"` : 'All Botanical & Seed Varieties')}
          </h1>
        </div>
        <p className={styles.description}>
          Authentic Indian heirloom and adapted seed varieties and potted plants dispatched directly from our Pune nursery hub across India.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <CatalogFilters
        categories={categories}
        selectedCategoryHandle={categoryParam}
        currentSort={sort}
        totalCount={totalCount}
        basePath="/store"
        facets={facets}
        activeFilters={{
          q,
          category: categoryParam,
          seed_type: seedTypeParam,
          season: seasonParam,
          min_price: minPriceParam,
          max_price: maxPriceParam,
          in_stock: inStockOnly,
          packet_size: packetSizeParam,
          sort,
        }}
      />

      {/* Product Grid & Search Results */}
      {paginatedProducts.length > 0 ? (
        <ProductGrid products={paginatedProducts} />
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Search size={28} aria-hidden="true" />
          </div>
          <div>
            <h3 className={styles.emptyTitle}>
              {q ? `No specimens found for "${q}"` : 'No specimens match your filters'}
            </h3>
            <p className={styles.emptyText}>
              {q
                ? `We couldn't find any botanical seeds or plants matching "${q}". Try checking for spelling errors or searching for broad terms.`
                : 'Try adjusting your price range, removing specific seed type or season filters, or clearing all filters to see more botanical items.'}
            </p>
          </div>

          {/* Quick Alternative Suggestions */}
          <div className={styles.suggestionsRow}>
            <span className={styles.suggestionsLabel}>Popular searches:</span>
            <div className={styles.suggestionsPills}>
              {['Tomato Seeds', 'Marigold', 'Krishna Tulsi', 'Snake Plant', 'Coriander'].map((term) => (
                <Link
                  key={term}
                  href={`/store?q=${encodeURIComponent(term)}`}
                  className={styles.suggestionChip}
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '0.5rem' }}>
            <Link href="/store" className={styles.viewAllCatalogBtn}>
              View All Botanical Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Pagination (preserves all active filters in page URLs) */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/store"
        searchParams={{
          q,
          category: categoryParam,
          seed_type: seedTypeParam,
          season: seasonParam,
          min_price: minPriceParam !== undefined ? minPriceParam.toString() : undefined,
          max_price: maxPriceParam !== undefined ? maxPriceParam.toString() : undefined,
          in_stock: inStockOnly ? 'true' : undefined,
          packet_size: packetSizeParam,
          sort: sort !== 'featured' ? sort : undefined,
        }}
      />
    </div>
  )
}
