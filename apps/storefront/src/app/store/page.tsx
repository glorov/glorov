import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Sprout } from 'lucide-react'
import {
  getStoreCatalogProducts,
  getStoreCatalogCategories,
  findCategoryByHandle,
  getCategoryHierarchyIds,
  getProductLowestPriceINR,
  getProductStockSummary,
} from '@/lib/catalog'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import { Pagination } from '@/components/catalog/Pagination'

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
    sort?: string
    page?: string
    in_stock?: string
  }>
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q?.trim() || undefined
  const categoryParam = resolvedSearchParams.category?.trim() || undefined
  const sort = resolvedSearchParams.sort || 'featured'
  const inStockOnly = resolvedSearchParams.in_stock === 'true'
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10) || 1)
  const pageSize = 12

  // 1. Fetch Categories for filter pills
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

  // 3. Fetch products from Medusa Store API
  const productsRes = await getStoreCatalogProducts({
    q,
    category_id: categoryIds,
    limit: 100, // Fetch up to 100 to allow in-stock and price sorting across result set
  })

  let allProducts = productsRes.success ? productsRes.products : []

  // 4. In-Stock filter
  if (inStockOnly) {
    allProducts = allProducts.filter((p) => getProductStockSummary(p).hasStock)
  }

  // 5. Apply sorting
  if (sort === 'price_asc') {
    allProducts = [...allProducts].sort((a, b) => {
      const priceA = getProductLowestPriceINR(a).minPricePaise ?? Infinity
      const priceB = getProductLowestPriceINR(b).minPricePaise ?? Infinity
      return priceA - priceB
    })
  } else if (sort === 'price_desc') {
    allProducts = [...allProducts].sort((a, b) => {
      const priceA = getProductLowestPriceINR(a).minPricePaise ?? -Infinity
      const priceB = getProductLowestPriceINR(b).minPricePaise ?? -Infinity
      return priceB - priceA
    })
  } else if (sort === 'title_asc') {
    allProducts = [...allProducts].sort((a, b) => a.title.localeCompare(b.title))
  }

  const totalCount = allProducts.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedProducts = allProducts.slice((page - 1) * pageSize, page * pageSize)

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
      />

      {/* Product Grid */}
      <ProductGrid
        products={paginatedProducts}
        emptyMessage={
          q
            ? `No botanical items found matching "${q}". Try checking your spelling or searching for general categories like tomato, marigold, or tulsi.`
            : 'No botanical items currently match your chosen filters.'
        }
        resetHref="/store"
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/store"
        searchParams={{
          q,
          category: categoryParam,
          sort: sort !== 'featured' ? sort : undefined,
          in_stock: inStockOnly ? 'true' : undefined,
        }}
      />
    </div>
  )
}
