import type { Metadata } from 'next'
import React from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PageContainer } from '../../../components/layout/PageContainer'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
import { ProductCard } from '../../../components/product/ProductCard'
import { Pagination } from '../../../components/common/Pagination'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { MOCK_PRODUCTS, MOCK_CATEGORY_DETAILS, CATEGORY_NAV_ITEMS } from '../../../lib/mock-data'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    subcat?: string
    sort?: string
    stock?: string
    page?: string
  }>
}

export async function generateStaticParams() {
  return [
    { slug: 'seeds' },
    { slug: 'live-plants' },
    { slug: 'planters' },
    { slug: 'plant-care' },
    { slug: 'flowering' },
    { slug: 'vegetables' },
    { slug: 'herbs' },
    { slug: 'offers' },
  ]
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categoryDetail = MOCK_CATEGORY_DETAILS.find((c) => c.slug === slug)
  const navItem = CATEGORY_NAV_ITEMS.find((c) => c.route.endsWith(`/${slug}`))

  const title = categoryDetail?.title ?? navItem?.label ?? slug
  const desc = categoryDetail?.description
    ? `${categoryDetail.description} — Shop online at GLOROV with 100% safe transit guarantee.`
    : `Shop authentic botanical ${title} online from GLOROV. Premium quality with transit guarantee.`
  const imageUrl = categoryDetail?.imageUrl || '/og-image.jpg'

  return {
    title: `${title} | GLOROV`,
    description: desc,
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${title} — Botanical Collection | GLOROV`,
      description: desc,
      url: `/categories/${slug}`,
      siteName: 'GLOROV',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${title} collection at GLOROV`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Botanical Collection | GLOROV`,
      description: desc,
      images: [imageUrl],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  if (slug === 'offers') {
    redirect('/offers')
  }
  const query = await searchParams

  const categoryDetail = MOCK_CATEGORY_DETAILS.find((c) => c.slug === slug)
  const navItem = CATEGORY_NAV_ITEMS.find((c) => c.route.endsWith(`/${slug}`))

  if (!categoryDetail && !navItem && slug !== 'offers') {
    notFound()
  }

  const categoryTitle = categoryDetail?.title ?? navItem?.label ?? 'Botanical Collection'
  const categoryDescription =
    categoryDetail?.description ??
    `Handpicked botanical cultivars, accessories, and organic gardening essentials curated by GLOROV.`

  const activeSubcat = query.subcat ?? 'All'
  const currentSort = query.sort ?? 'recommended'
  const inStockOnly = query.stock === 'true'
  const currentPage = parseInt(query.page ?? '1', 10) || 1
  const itemsPerPage = 8

  // Filter products by category/slug
  let products = MOCK_PRODUCTS.filter((p) => {
    if (slug === 'seeds') return p.category === 'Seeds' || p.productType === 'seeds'
    if (slug === 'live-plants') return p.category === 'Live Plants' || p.productType === 'plants'
    if (slug === 'planters') return p.category.includes('Planters') || p.productType === 'planters'
    if (slug === 'plant-care') return p.category.includes('Care') || p.productType === 'care'
    if (slug === 'flowering') {
      return (
        p.subcategory?.includes('Flower') ||
        p.category.includes('Flower') ||
        p.badges?.includes('FLOWERING')
      )
    }
    if (slug === 'vegetables') return p.subcategory?.includes('Vegetable')
    if (slug === 'herbs') return p.tags?.includes('spicy') || p.subcategory?.includes('Herb')
    if (slug === 'offers') return p.discountPrice !== undefined && p.discountPrice < p.price
    return true
  })

  // Subcategory filter
  if (activeSubcat !== 'All' && !activeSubcat.startsWith('All ')) {
    products = products.filter((p) => p.subcategory === activeSubcat)
  }

  // In-stock filter
  if (inStockOnly) {
    products = products.filter((p) => p.inStock)
  }

  // Sort
  products.sort((a, b) => {
    const priceA = a.discountPrice ?? a.price
    const priceB = b.discountPrice ?? b.price
    if (currentSort === 'price_asc') return priceA - priceB
    if (currentSort === 'price_desc') return priceB - priceA
    if (currentSort === 'rating') return b.rating - a.rating
    if (currentSort === 'best_selling') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
    return 0
  })

  const totalPages = Math.ceil(products.length / itemsPerPage)
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const subcategories = categoryDetail?.subcategories ?? ['All', 'Vegetable Seeds', 'Flower Seeds', 'Indoor Plants']

  return (
    <div className="w-full bg-[#F9FAF8] pb-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categories' },
          { label: categoryTitle },
        ]}
      />

      {/* 2. Category Hero Header */}
      <div className="w-full bg-[#081C15] text-white py-8 sm:py-12 border-b border-white/10">
        <PageContainer>
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#52B788] text-[#081C15] font-extrabold text-[10px] tracking-wider uppercase">
                {categoryDetail?.badge ?? 'CERTIFIED BOTANICAL'}
              </span>
              <span className="text-white/60 text-xs">
                {products.length} Products Available
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-black text-white">
              {categoryTitle}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              {categoryDescription}
            </p>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-6 sm:py-8 space-y-6">
        {/* 3. Filter Bar & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-glorov-md bg-white border border-[#E5E7EB] shadow-sm">
          {/* Subcategory Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar py-1">
            {subcategories.map((subcat) => {
              const isSelected = activeSubcat === subcat
              const targetUrl =
                subcat === 'All' || subcat.startsWith('All ')
                  ? `/categories/${slug}`
                  : `/categories/${slug}?subcat=${encodeURIComponent(subcat)}`

              return (
                <Link
                  key={subcat}
                  href={targetUrl}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-[#F3F4F1] text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {subcat}
                </Link>
              )
            })}
          </div>

          {/* Sort & Stock Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* In-Stock Toggle */}
            <Link
              href={
                inStockOnly
                  ? `/categories/${slug}${activeSubcat !== 'All' ? `?subcat=${encodeURIComponent(activeSubcat)}` : ''}`
                  : `/categories/${slug}?stock=true${activeSubcat !== 'All' ? `&subcat=${encodeURIComponent(activeSubcat)}` : ''}`
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                inStockOnly
                  ? 'border-[#16A34A] bg-emerald-50 text-emerald-800'
                  : 'border-[#E5E7EB] text-[#4B5563] hover:border-[#9CA3AF]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-[#16A34A]' : 'bg-gray-300'}`} />
              <span>In Stock Only</span>
            </Link>

            {/* Sort Menu */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#6B7280] hidden sm:inline">Sort:</span>
              <select
                defaultValue={currentSort}
                aria-label="Sort products by"
                className="h-8 px-2 rounded-glorov-sm bg-white border border-[#E5E7EB] text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#1B4332]"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="best_selling">Best Selling</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Product Cards Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No botanical varieties found"
            description="We could not find any products matching your selected filter. Try clearing subcategory or in-stock filters."
            action={
              <Link
                href={`/categories/${slug}`}
                className="px-4 py-2 rounded-full bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider"
              >
                Reset Filters
              </Link>
            }
          />
        )}

        {/* 5. Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/categories/${slug}`}
          />
        )}
      </PageContainer>
    </div>
  )
}
