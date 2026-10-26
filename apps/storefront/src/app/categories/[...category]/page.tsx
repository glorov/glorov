import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, FolderTree, Sprout } from 'lucide-react'
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

interface CategoryPageProps {
  params: Promise<{
    category: string[]
  }>
  searchParams: Promise<{
    sort?: string
    page?: string
    in_stock?: string
  }>
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlugs } = await params
  const currentSlug = categorySlugs[categorySlugs.length - 1]

  const categoriesRes = await getStoreCatalogCategories()
  const categories = categoriesRes.success ? categoriesRes.categories : []
  const category = findCategoryByHandle(categories, currentSlug)

  if (!category) {
    return {
      title: 'Botanical Category | GLOROV',
      description: 'Explore Indian seeds, live indoor plants, and gardening supplies.',
    }
  }

  return {
    title: `${category.name} — Indian Seeds & Plants | GLOROV`,
    description:
      category.description ||
      `Buy ${category.name.toLowerCase()} online at GLOROV with reliable delivery across India.`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlugs } = await params
  const resolvedSearchParams = await searchParams

  const currentSlug = categorySlugs[categorySlugs.length - 1]
  const sort = resolvedSearchParams.sort || 'featured'
  const inStockOnly = resolvedSearchParams.in_stock === 'true'
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10) || 1)
  const pageSize = 12

  // 1. Fetch Categories Hierarchy
  const categoriesRes = await getStoreCatalogCategories()
  const categories = categoriesRes.success ? categoriesRes.categories : []

  // 2. Resolve target category
  const targetCategory = findCategoryByHandle(categories, currentSlug)

  if (!targetCategory) {
    // If category does not exist in Medusa, return 404
    notFound()
  }

  // 3. Collect category + descendant IDs
  const categoryIds = getCategoryHierarchyIds(targetCategory)

  // 4. Fetch products under this category branch
  const productsRes = await getStoreCatalogProducts({
    category_id: categoryIds,
    limit: 100,
  })

  let allProducts = productsRes.success ? productsRes.products : []

  // 5. In-Stock Filter
  if (inStockOnly) {
    allProducts = allProducts.filter((p) => getProductStockSummary(p).hasStock)
  }

  // 6. Sorting
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
        basePath="/store"
      />

      {/* Product Grid */}
      <ProductGrid
        products={paginatedProducts}
        emptyMessage={`No products found in the "${targetCategory.name}" category.`}
        resetHref="/store"
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl={`/categories/${categorySlugs.join('/')}`}
        searchParams={{
          sort: sort !== 'featured' ? sort : undefined,
          in_stock: inStockOnly ? 'true' : undefined,
        }}
      />
    </div>
  )
}
