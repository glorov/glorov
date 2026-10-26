import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, FolderTree, Sprout } from 'lucide-react'
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

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{
    category: string[]
  }>
  searchParams: Promise<{
    q?: string
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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlugs } = await params
  const currentSlug = categorySlugs[categorySlugs.length - 1]
  const canonicalPath = `/categories/${categorySlugs.join('/')}`

  const categoriesRes = await getStoreCatalogCategories()
  const categories = categoriesRes.success ? categoriesRes.categories : []
  const category = findCategoryByHandle(categories, currentSlug)

  if (!category) {
    return {
      title: 'Botanical Category Not Found',
      description: 'Explore Indian seeds, live indoor plants, and gardening supplies.',
      alternates: {
        canonical: canonicalPath,
      },
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const title = `${category.name} — Indian Seeds & Plants`
  const description =
    category.description ||
    `Buy authentic ${category.name.toLowerCase()} online at GLOROV with reliable delivery across India.`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${category.name} — Indian Seeds & Plants | GLOROV Botanicals`,
      description,
      url: canonicalPath,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} — Indian Seeds & Plants | GLOROV Botanicals`,
      description,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlugs } = await params
  const resolvedSearchParams = await searchParams

  const currentSlug = categorySlugs[categorySlugs.length - 1]
  const q = resolvedSearchParams.q?.trim() || undefined
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

  // 1. Fetch Categories Hierarchy
  const categoriesRes = await getStoreCatalogCategories()
  const categories = categoriesRes.success ? categoriesRes.categories : []

  // 2. Resolve target category
  const targetCategory = findCategoryByHandle(categories, currentSlug)

  if (!targetCategory) {
    notFound()
  }

  // 3. Collect category + descendant IDs
  const categoryIds = getCategoryHierarchyIds(targetCategory)

  // 4. Fetch products under this category branch
  const productsRes = await getStoreCatalogProducts({
    q,
    category_id: categoryIds,
    limit: 100,
  })

  const rawProducts = productsRes.success ? productsRes.products : []

  // 5. Extract facets
  const facets = extractCatalogFacets(rawProducts)

  // 6. Apply filters
  const filteredProducts = filterCatalogProducts(rawProducts, {
    q,
    category: targetCategory.handle,
    seed_type: seedTypeParam,
    season: seasonParam,
    min_price: minPriceParam,
    max_price: maxPriceParam,
    in_stock: inStockOnly,
    packet_size: packetSizeParam,
  })

  // 7. Sort products
  const sortedProducts = sortCatalogProducts(filteredProducts, sort, q)

  const totalCount = sortedProducts.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize)

  // Subcategories
  const subcategories = targetCategory.category_children || []

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-botanical-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link href="/store" className="hover:text-botanical-700 transition-colors">
          Store
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="font-semibold text-botanical-900">{targetCategory.name}</span>
      </nav>

      {/* Category Header */}
      <div className="pb-6 border-b border-border space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-botanical-100 flex items-center justify-center text-botanical-700 shadow-inner">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-botanical-950 tracking-tight">
              {targetCategory.name}
            </h1>
          </div>
        </div>

        {targetCategory.description && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {targetCategory.description}
          </p>
        )}

        {/* Subcategory Quick Links */}
        {subcategories.length > 0 && (
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-muted-foreground font-semibold flex items-center gap-1">
              <FolderTree className="h-3.5 w-3.5 text-botanical-700" />
              Subcategories:
            </span>
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.handle}`}
                className="px-3 py-1 rounded-full border border-border bg-earth-50 hover:bg-earth-100 hover:border-botanical-300 text-botanical-950 transition-colors font-medium text-xs"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <CatalogFilters
        categories={categories}
        selectedCategoryHandle={targetCategory.handle}
        currentSort={sort}
        totalCount={totalCount}
        basePath={`/categories/${categorySlugs.join('/')}`}
        facets={facets}
        activeFilters={{
          q,
          category: targetCategory.handle,
          seed_type: seedTypeParam,
          season: seasonParam,
          min_price: minPriceParam,
          max_price: maxPriceParam,
          in_stock: inStockOnly,
          packet_size: packetSizeParam,
          sort,
        }}
      />

      {/* Product Grid */}
      <ProductGrid
        products={paginatedProducts}
        emptyMessage={`No specimens found matching your criteria in the "${targetCategory.name}" category.`}
        resetHref={`/categories/${categorySlugs.join('/')}`}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl={`/categories/${categorySlugs.join('/')}`}
        searchParams={{
          q,
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
