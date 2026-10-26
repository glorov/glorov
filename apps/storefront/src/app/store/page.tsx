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
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Botanical Store — Pure Seeds & Potted Live Plants | GLOROV',
  description:
    'Browse our comprehensive catalog of verified Indian vegetable seeds, flower seeds, medicinal herbs, and climate-hardened live plants.',
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

  // 3. Fetch products from Medusa Store API (using backend search query & category id if available)
  const productsRes = await getStoreCatalogProducts({
    q,
    category_id: categoryIds,
    limit: 100, // Fetch catalog specimens for rich faceted filtering and sorting
  })

  // Handle API failure gracefully
  if (!productsRes.success && productsRes.products.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Catalog Unavailable</h2>
          <p className="text-xs text-muted-foreground">
            We encountered a temporary issue connecting to the botanical catalog. Please try again or return home.
          </p>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/store">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Catalog</span>
            </Link>
          </Button>
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
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-botanical-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="font-semibold text-foreground">Botanical Store</span>
        {activeCategoryName && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="font-semibold text-botanical-800">{activeCategoryName}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="pb-6 border-b border-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-botanical-100 flex items-center justify-center text-botanical-700">
            <Sprout className="h-4 w-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-botanical-950 tracking-tight">
            {activeCategoryName || (q ? `Search: "${q}"` : 'All Botanical & Seed Varieties')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
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
        <div className="py-16 px-4 rounded-2xl border border-dashed border-border bg-earth-50/50 flex flex-col items-center justify-center text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700">
            <Search className="h-8 w-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-bold text-botanical-950">
              {q ? `No specimens found for "${q}"` : 'No specimens match your filters'}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {q
                ? `We couldn't find any botanical seeds, plants, or gardening items matching "${q}". Try checking for spelling errors or searching for broad terms.`
                : 'Try adjusting your price range, removing specific seed type or season filters, or clearing all filters to see more botanical items.'}
            </p>
          </div>

          {/* Quick Alternative Suggestions */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Popular searches:</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Tomato Seeds', 'Marigold', 'Krishna Tulsi', 'Snake Plant', 'Coriander'].map((term) => (
                <Link
                  key={term}
                  href={`/store?q=${encodeURIComponent(term)}`}
                  className="px-2.5 py-1 rounded-full bg-white border border-border hover:border-botanical-400 text-xs font-medium text-foreground transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button asChild variant="botanical" size="sm">
              <Link href="/store">View All Botanical Catalog</Link>
            </Button>
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
