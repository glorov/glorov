'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Check,
  ChevronDown,
} from 'lucide-react'
import type { StoreCatalogCategory } from '@glorov/types'
import type { CatalogFacets } from '@/lib/catalog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

export interface CatalogFiltersProps {
  categories: StoreCatalogCategory[]
  selectedCategoryHandle?: string
  currentSort?: string
  totalCount?: number
  basePath?: string
  facets?: CatalogFacets
  activeFilters?: {
    q?: string
    category?: string
    seed_type?: string
    season?: string
    min_price?: number
    max_price?: number
    in_stock?: boolean
    packet_size?: string
    sort?: string
  }
}

const PRESET_PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 – ₹100', min: 50, max: 100 },
  { label: '₹100 – ₹200', min: 100, max: 200 },
  { label: 'Above ₹200', min: 200, max: undefined },
]

const SEED_TYPE_OPTIONS = [
  { label: 'Heirloom', value: 'heirloom' },
  { label: 'Open-Pollinated', value: 'open_pollinated' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Certified Organic', value: 'organic' },
  { label: 'Live Botanical Specimen', value: 'live' },
]

const SEASON_OPTIONS = [
  { label: 'Kharif (Monsoon)', value: 'kharif' },
  { label: 'Rabi (Winter)', value: 'rabi' },
  { label: 'Zaid (Summer)', value: 'zaid' },
  { label: 'All Season', value: 'all_season' },
]

const PACKET_SIZE_OPTIONS = [
  { label: '20 Seeds', value: '20 Seeds' },
  { label: '50 Seeds', value: '50 Seeds' },
  { label: '100 Seeds', value: '100 Seeds' },
  { label: '250 Seeds', value: '250 Seeds' },
  { label: '4-inch Pot', value: '4-inch' },
  { label: '6-inch Pot', value: '6-inch' },
]

function CatalogFiltersInner({
  categories,
  selectedCategoryHandle,
  currentSort = 'featured',
  totalCount,
  basePath = '/store',
  activeFilters,
}: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [customMin, setCustomMin] = useState(activeFilters?.min_price?.toString() || '')
  const [customMax, setCustomMax] = useState(activeFilters?.max_price?.toString() || '')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  // Extract query values from searchParams as fallback
  const q = activeFilters?.q ?? (searchParams.get('q') || '')
  const category = activeFilters?.category ?? (searchParams.get('category') || selectedCategoryHandle || '')
  const seedType = activeFilters?.seed_type ?? (searchParams.get('seed_type') || '')
  const season = activeFilters?.season ?? (searchParams.get('season') || '')
  const inStockOnly = activeFilters?.in_stock ?? (searchParams.get('in_stock') === 'true')
  const packetSize = activeFilters?.packet_size ?? (searchParams.get('packet_size') || '')
  const minPrice = activeFilters?.min_price ?? (searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined)
  const maxPrice = activeFilters?.max_price ?? (searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined)

  // Count active filters (excluding default sort and page)
  let activeFilterCount = 0
  if (q) activeFilterCount++
  if (category && category !== selectedCategoryHandle) activeFilterCount++
  if (seedType) activeFilterCount++
  if (season) activeFilterCount++
  if (inStockOnly) activeFilterCount++
  if (packetSize) activeFilterCount++
  if (minPrice !== undefined || maxPrice !== undefined) activeFilterCount++

  // Update query params helper
  const createQueryString = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    // Reset to page 1 on any filter change
    params.delete('page')
    return params.toString()
  }

  const handleUpdateFilter = (name: string, value: string | null) => {
    const newQuery = createQueryString({ [name]: value })
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuery = createQueryString({
      sort: e.target.value === 'featured' ? null : e.target.value,
    })
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname)
  }

  const handleStockToggle = () => {
    handleUpdateFilter('in_stock', inStockOnly ? null : 'true')
  }

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault()
    const minVal = customMin.trim() ? Math.max(0, parseInt(customMin, 10)).toString() : null
    const maxVal = customMax.trim() ? Math.max(0, parseInt(customMax, 10)).toString() : null
    const newQuery = createQueryString({
      min_price: minVal,
      max_price: maxVal,
    })
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname)
  }

  const handlePresetPrice = (min?: number, max?: number) => {
    setCustomMin(min?.toString() || '')
    setCustomMax(max?.toString() || '')
    const newQuery = createQueryString({
      min_price: min !== undefined ? min.toString() : null,
      max_price: max !== undefined ? max.toString() : null,
    })
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname)
  }

  const handleClearAllFilters = () => {
    setCustomMin('')
    setCustomMax('')
    const params = new URLSearchParams()
    const sortVal = searchParams.get('sort')
    if (sortVal && sortVal !== 'featured') {
      params.set('sort', sortVal)
    }
    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
    setMobileDrawerOpen(false)
  }

  // De-duplicate categories for top pill row
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
      {/* 1. Active Filter Pills Row */}
      {activeFilterCount > 0 && (
        <div
          role="region"
          aria-label="Active filters"
          className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-botanical-50/70 border border-botanical-200/80 text-xs"
        >
          <span className="font-semibold text-botanical-950 flex items-center gap-1.5 mr-1 text-[11px] uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-botanical-700" />
            Active Filters ({activeFilterCount}):
          </span>

          {/* Search Term Pill */}
          {q && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium">
              <span>Search: &ldquo;{q}&rdquo;</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('q', null)}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove search term filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Category Pill (if selected via query parameter) */}
          {category && category !== selectedCategoryHandle && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium">
              <span>Category: {category}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('category', null)}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Seed / Plant Type Pill */}
          {seedType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium capitalize">
              <span>Type: {seedType.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('seed_type', null)}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove seed type filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Season Pill */}
          {season && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium capitalize">
              <span>Season: {season.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('season', null)}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove season filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Price Range Pill */}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium">
              <span>
                Price:{' '}
                {minPrice !== undefined && maxPrice !== undefined
                  ? `₹${minPrice} – ₹${maxPrice}`
                  : minPrice !== undefined
                  ? `Above ₹${minPrice}`
                  : `Under ₹${maxPrice}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomMin('')
                  setCustomMax('')
                  const newQuery = createQueryString({ min_price: null, max_price: null })
                  router.push(newQuery ? `${pathname}?${newQuery}` : pathname)
                }}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove price range filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* In Stock Only Pill */}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={handleStockToggle}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove in-stock filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Packet Size Pill */}
          {packetSize && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-botanical-300 text-botanical-900 shadow-xs font-medium">
              <span>Pack: {packetSize}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('packet_size', null)}
                className="hover:text-red-600 rounded-full p-0.5"
                aria-label="Remove packet size filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Clear All Action */}
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-botanical-800 hover:text-red-700 transition-colors underline decoration-dotted underline-offset-2"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}

      {/* 2. Top Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-border">
        {/* Left: Specimen count, Mobile Filter Button, and In-Stock chip */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-bold text-botanical-950">
            <SlidersHorizontal className="h-4 w-4 text-botanical-700" />
            <span>
              {totalCount !== undefined
                ? `${totalCount} ${totalCount === 1 ? 'Specimen' : 'Specimens'}`
                : 'Botanical Catalog'}
            </span>
          </div>

          {/* Mobile Filter Modal Trigger */}
          <Dialog open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden gap-1.5 text-xs h-8 rounded-full border-border hover:border-botanical-400"
              >
                <Filter className="h-3.5 w-3.5 text-botanical-700" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-botanical-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            {/* Accessible Mobile Filter Dialog Content */}
            <DialogContent className="max-w-md w-[92vw] sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6">
                  <span>Filter Botanical Catalog</span>
                  {activeFilterCount > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {activeFilterCount} active
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-2 text-xs">
                {/* Mobile: Availability */}
                <div className="space-y-2">
                  <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
                    Availability
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-earth-50 hover:bg-earth-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={handleStockToggle}
                      className="h-4 w-4 rounded border-border text-botanical-700 focus:ring-botanical-600 cursor-pointer"
                    />
                    <span className="font-medium text-foreground">In Stock Only</span>
                  </label>
                </div>

                {/* Mobile: Seed & Plant Types */}
                <div className="space-y-2">
                  <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
                    Botanical Seed / Plant Type
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {SEED_TYPE_OPTIONS.map((opt) => {
                      const isSelected = seedType === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateFilter('seed_type', isSelected ? null : opt.value)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-botanical-800 text-white border-botanical-800'
                              : 'bg-background border-border text-foreground/80 hover:border-botanical-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: Sowing Season */}
                <div className="space-y-2">
                  <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
                    Sowing Season
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {SEASON_OPTIONS.map((opt) => {
                      const isSelected = season === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateFilter('season', isSelected ? null : opt.value)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-botanical-800 text-white border-botanical-800'
                              : 'bg-background border-border text-foreground/80 hover:border-botanical-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: Price Presets & Custom */}
                <div className="space-y-2">
                  <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
                    Price Range (₹ INR)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PRICE_RANGES.map((preset, idx) => {
                      const isSelected = minPrice === preset.min && maxPrice === preset.max
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetPrice(preset.min, preset.max)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-botanical-800 text-white border-botanical-800'
                              : 'bg-background border-border text-foreground/80 hover:border-botanical-400'
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: Packet Size */}
                <div className="space-y-2">
                  <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
                    Packet / Pot Size
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {PACKET_SIZE_OPTIONS.map((opt) => {
                      const isSelected = packetSize === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateFilter('packet_size', isSelected ? null : opt.value)}
                          className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-botanical-800 text-white border-botanical-800'
                              : 'bg-background border-border text-foreground/80 hover:border-botanical-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-row items-center justify-between gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-xs text-muted-foreground hover:text-red-700"
                >
                  Clear All
                </Button>
                <Button
                  type="button"
                  variant="botanical"
                  size="sm"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="text-xs"
                >
                  Apply &amp; View Results
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Desktop Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              filterPanelOpen || activeFilterCount > 0
                ? 'bg-earth-100 text-botanical-950 border-botanical-300'
                : 'bg-background text-muted-foreground border-border hover:border-botanical-300'
            }`}
          >
            <Filter className="h-3 w-3 text-botanical-700" />
            <span>More Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-botanical-700 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 transition-transform ${filterPanelOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick In-Stock chip */}
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

        {/* Right: Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <label htmlFor="catalog-sort" className="text-xs text-muted-foreground whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="catalog-sort"
            value={currentSort}
            onChange={handleSortChange}
            aria-label="Sort products catalog"
            className="h-8 pl-2 pr-6 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-botanical-600 cursor-pointer"
          >
            <option value="featured">Featured &amp; Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="title_asc">Alphabetical: A to Z</option>
          </select>
        </div>
      </div>

      {/* 3. Category Quick Pills Row */}
      {distinctCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <Link
            href={basePath}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              !selectedCategoryHandle && !category
                ? 'bg-botanical-800 text-white shadow-xs'
                : 'bg-earth-100/70 text-foreground/80 hover:bg-earth-200 hover:text-foreground'
            }`}
          >
            All Products
          </Link>

          {distinctCategories.map((cat) => {
            const isSelected = selectedCategoryHandle === cat.handle || category === cat.handle
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

      {/* 4. Desktop Expandable Filter Drawer Panel */}
      {filterPanelOpen && (
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 p-5 rounded-2xl bg-earth-50/70 border border-border animate-in slide-in-from-top-2 duration-150 text-xs">
          {/* Column 1: Botanical Seed Type */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              Seed / Plant Type
            </h4>
            <div className="flex flex-col space-y-1">
              {SEED_TYPE_OPTIONS.map((opt) => {
                const isSelected = seedType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateFilter('seed_type', isSelected ? null : opt.value)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-botanical-100 font-bold text-botanical-900'
                        : 'hover:bg-earth-100 text-foreground/80'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-botanical-700" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 2: Sowing Season */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              Sowing Season
            </h4>
            <div className="flex flex-col space-y-1">
              {SEASON_OPTIONS.map((opt) => {
                const isSelected = season === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateFilter('season', isSelected ? null : opt.value)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-botanical-100 font-bold text-botanical-900'
                        : 'hover:bg-earth-100 text-foreground/80'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-botanical-700" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 3: Packet / Pot Size */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              Packet / Pot Size
            </h4>
            <div className="flex flex-col space-y-1">
              {PACKET_SIZE_OPTIONS.map((opt) => {
                const isSelected = packetSize === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateFilter('packet_size', isSelected ? null : opt.value)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-botanical-100 font-bold text-botanical-900'
                        : 'hover:bg-earth-100 text-foreground/80'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-botanical-700" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 4: Price Filter */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-botanical-950 uppercase tracking-wider text-[11px]">
              Price Range (₹ INR)
            </h4>
            <div className="space-y-1.5">
              {PRESET_PRICE_RANGES.map((preset, idx) => {
                const isSelected = minPrice === preset.min && maxPrice === preset.max
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetPrice(preset.min, preset.max)}
                    className={`block w-full text-left px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-botanical-100 font-bold text-botanical-900'
                        : 'hover:bg-earth-100 text-foreground/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            {/* Custom Min/Max Input Form */}
            <form onSubmit={handleApplyCustomPrice} className="pt-2 border-t border-border flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min ₹"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="w-16 h-7 px-1.5 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-botanical-600"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className="w-16 h-7 px-1.5 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-1 focus:ring-botanical-600"
              />
              <Button type="submit" size="sm" variant="botanical" className="h-7 px-2 text-[10px]">
                Go
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export function CatalogFilters(props: CatalogFiltersProps) {
  return (
    <React.Suspense fallback={<div className="h-10 animate-pulse bg-earth-50 rounded-xl" />}>
      <CatalogFiltersInner {...props} />
    </React.Suspense>
  )
}

