'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { StoreCatalogCategory } from '@glorov/types'

interface CatalogFiltersProps {
  categories: StoreCatalogCategory[]
  selectedCategoryHandle?: string
  currentSort?: string
  totalCount?: number
  basePath?: string
}

export function CatalogFilters({
  categories,
  selectedCategoryHandle,
  currentSort = 'featured',
  totalCount,
  basePath = '/store',
}: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const q = searchParams.get('q') || ''
  const inStockOnly = searchParams.get('in_stock') === 'true'

  // Update query params helper
  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '') {
      params.delete(name)
    } else {
      params.set(name, value)
    }
    // Reset to page 1 on filter changes
    params.delete('page')
    return params.toString()
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuery = createQueryString('sort', e.target.value === 'featured' ? null : e.target.value)
    router.push(`${pathname}?${newQuery}`)
  }

  const handleStockToggle = () => {
    const newQuery = createQueryString('in_stock', inStockOnly ? null : 'true')
    router.push(`${pathname}?${newQuery}`)
  }

  const handleClearSearch = () => {
    const newQuery = createQueryString('q', null)
    router.push(`${pathname}?${newQuery}`)
  }

  const distinctCategories = React.useMemo(() => {
    const seen = new Set<string>()
    return categories.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }, [categories])

  return (
    <div className="space-y-4">
      {/* Search Query Active Tag */}
      {q && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-botanical-50 border border-botanical-200 text-xs">
          <span className="text-muted-foreground">Search results for:</span>
          <span className="font-bold text-botanical-900">&ldquo;{q}&rdquo;</span>
          <button
            type="button"
            onClick={handleClearSearch}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-botanical-700 hover:text-botanical-950"
            aria-label="Clear search term"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear search</span>
          </button>
        </div>
      )}

      {/* Top Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border">
        {/* Count and Category Quick Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-bold text-botanical-950">
            <SlidersHorizontal className="h-4 w-4 text-botanical-700" />
            <span>
              {totalCount !== undefined
                ? `${totalCount} ${totalCount === 1 ? 'Specimen' : 'Specimens'}`
                : 'Filter Catalog'}
            </span>
          </div>

          {/* Quick in-stock filter chip */}
          <button
            type="button"
            onClick={handleStockToggle}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              inStockOnly
                ? 'bg-botanical-800 text-white border-botanical-800 shadow-xs'
                : 'bg-background text-muted-foreground border-border hover:border-botanical-300'
            }`}
          >
            {inStockOnly ? '✓ In Stock Only' : 'In Stock Only'}
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <label htmlFor="catalog-sort" className="text-xs text-muted-foreground whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="catalog-sort"
            value={currentSort}
            onChange={handleSortChange}
            className="h-8 pl-2 pr-6 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-botanical-600 cursor-pointer"
          >
            <option value="featured">Featured Varieties</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title_asc">Alphabetical: A to Z</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      {distinctCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <Link
            href={basePath}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              !selectedCategoryHandle
                ? 'bg-botanical-800 text-white shadow-xs'
                : 'bg-earth-100/70 text-foreground/80 hover:bg-earth-200 hover:text-foreground'
            }`}
          >
            All Products
          </Link>

          {distinctCategories.map((cat) => {
            const isSelected = selectedCategoryHandle === cat.handle
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-botanical-800 text-white shadow-xs'
                    : 'bg-earth-100/70 text-foreground/80 hover:bg-earth-200 hover:text-foreground'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
