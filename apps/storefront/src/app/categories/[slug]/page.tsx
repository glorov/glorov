import type { Metadata } from 'next'
import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageContainer } from '../../../components/layout/PageContainer'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
import { ProductCard } from '../../../components/product/ProductCard'
import { Pagination } from '../../../components/common/Pagination'
import { EmptyState } from '../../../components/feedback/EmptyState'
import { MOCK_CATEGORY_DETAILS, CATEGORY_NAV_ITEMS } from '../../../lib/mock-data'
import { GLOROV_BOTANICAL_CATEGORIES } from '../../../lib/botanical-categories'
import { getProductsByCategory } from '../../../lib/api/products'

export const dynamicParams = true
export const revalidate = 60

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
    { slug: 'vegetables' },
    { slug: 'live-plants' },
    { slug: 'flowers' },
    { slug: 'herbs' },
  ]
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categoryDetail = MOCK_CATEGORY_DETAILS.find((c) => c.slug === slug)
  const navItem = CATEGORY_NAV_ITEMS.find((c) => c.route.endsWith(`/${slug}`))

  let botanicalMatchTitle: string | undefined
  let botanicalMatchDesc: string | undefined
  for (const cat of GLOROV_BOTANICAL_CATEGORIES) {
    if (cat.handle === slug) {
      botanicalMatchTitle = cat.title
      botanicalMatchDesc = cat.description
      break
    }
    const sub = cat.subCategories.find((s) => s.handle === slug)
    if (sub) {
      botanicalMatchTitle = sub.title
      botanicalMatchDesc = sub.description || `Browse authentic ${sub.title} cultivated with 100% transit guarantee.`
      break
    }
  }

  const title =
    categoryDetail?.title ??
    navItem?.label ??
    botanicalMatchTitle ??
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const desc =
    categoryDetail?.description ??
    botanicalMatchDesc ??
    `Shop authentic botanical ${title} online from GLOROV. Premium quality with transit guarantee.`
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
  if (slug === 'flowering') {
    redirect('/categories/flowers')
  }
  if (slug === 'planters' || slug === 'plant-care' || slug === 'planters-pots' || slug === 'plant-care-soil') {
    redirect('/categories')
  }
  const query = await searchParams

  const categoryDetail = MOCK_CATEGORY_DETAILS.find((c) => c.slug === slug)
  const navItem = CATEGORY_NAV_ITEMS.find((c) => c.route.endsWith(`/${slug}`))

  let botanicalMatchTitle: string | undefined
  let botanicalMatchDesc: string | undefined
  for (const cat of GLOROV_BOTANICAL_CATEGORIES) {
    if (cat.handle === slug) {
      botanicalMatchTitle = cat.title
      botanicalMatchDesc = cat.description
      break
    }
    const sub = cat.subCategories.find((s) => s.handle === slug)
    if (sub) {
      botanicalMatchTitle = sub.title
      botanicalMatchDesc = sub.description || `Browse authentic ${sub.title} cultivated with 100% transit guarantee.`
      break
    }
  }

  const categoryTitle =
    categoryDetail?.title ??
    navItem?.label ??
    botanicalMatchTitle ??
    slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

  const categoryDescription =
    categoryDetail?.description ??
    botanicalMatchDesc ??
    `Handpicked botanical cultivars, pure heirloom seeds, and live nursery house plants curated by GLOROV.`

  const activeSubcat = query.subcat ?? 'All'
  const currentSort = query.sort ?? 'recommended'
  const inStockOnly = query.stock === 'true'
  const currentPage = parseInt(query.page ?? '1', 10) || 1
  const itemsPerPage = 8

  // Fetch live products for category from Medusa backend (with fallback to mock data)
  let products = await getProductsByCategory(slug)

  // Subcategory filter with clean isolation
  if (activeSubcat !== 'All' && !activeSubcat.startsWith('All ')) {
    products = products.filter((p) => {
      const subLower = (p.subcategory || '').toLowerCase()
      const activeLower = activeSubcat.toLowerCase()
      return (
        subLower === activeLower ||
        subLower.includes(activeLower) ||
        activeLower.includes(subLower)
      )
    })
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

  const matchedBotanicalCategory = GLOROV_BOTANICAL_CATEGORIES.find(
    (c) => c.handle === slug
  )
  const subcategories =
    categoryDetail?.subcategories ??
    (matchedBotanicalCategory
      ? ['All', ...matchedBotanicalCategory.subCategories.map((s) => s.title)]
      : ['All'])

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-glorov-md bg-white border border-[#E5E7EB]">
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
                      ? 'bg-[#1B4332] text-white'
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
