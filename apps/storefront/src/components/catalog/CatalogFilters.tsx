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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import styles from './CatalogFilters.module.css'

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
    <div className={styles.container}>
      {/* 1. Active Filter Pills Row */}
      {activeFilterCount > 0 && (
        <div
          role="region"
          aria-label="Active filters"
          className={styles.activeFiltersRegion}
        >
          <span className={styles.activeFiltersLabel}>
            <Filter size={14} style={{ color: 'var(--ugaoo-green)' }} />
            Active Filters ({activeFilterCount}):
          </span>

          {/* Search Term Pill */}
          {q && (
            <span className={styles.filterPill}>
              <span>Search: &ldquo;{q}&rdquo;</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('q', null)}
                className={styles.removeFilterBtn}
                aria-label="Remove search term filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Category Pill */}
          {category && category !== selectedCategoryHandle && (
            <span className={styles.filterPill}>
              <span>Category: {category}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('category', null)}
                className={styles.removeFilterBtn}
                aria-label="Remove category filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Seed / Plant Type Pill */}
          {seedType && (
            <span className={styles.filterPill} style={{ textTransform: 'capitalize' }}>
              <span>Type: {seedType.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('seed_type', null)}
                className={styles.removeFilterBtn}
                aria-label="Remove seed type filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Season Pill */}
          {season && (
            <span className={styles.filterPill} style={{ textTransform: 'capitalize' }}>
              <span>Season: {season.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('season', null)}
                className={styles.removeFilterBtn}
                aria-label="Remove season filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Price Range Pill */}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className={styles.filterPill}>
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
                className={styles.removeFilterBtn}
                aria-label="Remove price range filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* In Stock Only Pill */}
          {inStockOnly && (
            <span className={styles.filterPill}>
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={handleStockToggle}
                className={styles.removeFilterBtn}
                aria-label="Remove in-stock filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Packet Size Pill */}
          {packetSize && (
            <span className={styles.filterPill}>
              <span>Pack: {packetSize}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter('packet_size', null)}
                className={styles.removeFilterBtn}
                aria-label="Remove packet size filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {/* Clear All Action */}
          <button
            type="button"
            onClick={handleClearAllFilters}
            className={styles.clearAllBtn}
          >
            <RotateCcw size={12} />
            <span>Clear all filters</span>
          </button>
        </div>
      )}

      {/* 2. Top Filter & Sort Bar */}
      <div className={styles.filterSortBar}>
        {/* Left: Specimen count, Mobile Filter Button, and In-Stock chip */}
        <div className={styles.leftControls}>
          <div className={styles.specimenCount}>
            <SlidersHorizontal size={16} style={{ color: 'var(--ugaoo-maroon)' }} />
            <span>
              {totalCount !== undefined
                ? `${totalCount} ${totalCount === 1 ? 'Specimen' : 'Specimens'}`
                : 'Botanical Catalog'}
            </span>
          </div>

          {/* Mobile Filter Modal Trigger */}
          <Dialog open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className={styles.mobileFilterBtn}
              >
                <Filter size={14} style={{ color: 'var(--ugaoo-maroon)' }} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className={styles.filterBadgeCount}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </DialogTrigger>

            {/* Mobile Filter Dialog Content */}
            <DialogContent className={styles.mobileDialogContent}>
              <DialogHeader>
                <DialogTitle className={styles.mobileDialogTitle}>
                  <span>Filter Botanical Catalog</span>
                  {activeFilterCount > 0 && (
                    <span className={styles.mobileActiveCount}>
                      {activeFilterCount} active
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.75rem 0', fontSize: '13px' }}>
                {/* Mobile: Availability */}
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--ugaoo-green)', textTransform: 'uppercase', fontSize: '11px', marginBottom: '0.5rem' }}>
                    Availability
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.625rem', borderRadius: '8px', background: 'var(--ugaoo-cream-light)' }}>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={handleStockToggle}
                      style={{ height: '16px', width: '16px', accentColor: 'var(--ugaoo-green)', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--ugaoo-text-dark)' }}>In Stock Only</span>
                  </label>
                </div>

                {/* Mobile: Seed & Plant Types */}
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--ugaoo-green)', textTransform: 'uppercase', fontSize: '11px', marginBottom: '0.5rem' }}>
                    Botanical Seed / Plant Type
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {SEED_TYPE_OPTIONS.map((opt) => {
                      const isSelected = seedType === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateFilter('seed_type', isSelected ? null : opt.value)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            border: `1px solid ${isSelected ? 'var(--ugaoo-green)' : 'var(--ugaoo-border)'}`,
                            backgroundColor: isSelected ? 'var(--ugaoo-green)' : 'var(--ugaoo-white)',
                            color: isSelected ? 'var(--ugaoo-white)' : 'var(--ugaoo-text-dark)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: Sowing Season */}
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--ugaoo-green)', textTransform: 'uppercase', fontSize: '11px', marginBottom: '0.5rem' }}>
                    Sowing Season
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {SEASON_OPTIONS.map((opt) => {
                      const isSelected = season === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateFilter('season', isSelected ? null : opt.value)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            border: `1px solid ${isSelected ? 'var(--ugaoo-green)' : 'var(--ugaoo-border)'}`,
                            backgroundColor: isSelected ? 'var(--ugaoo-green)' : 'var(--ugaoo-white)',
                            color: isSelected ? 'var(--ugaoo-white)' : 'var(--ugaoo-text-dark)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: Price Presets */}
                <div>
                  <h4 style={{ fontWeight: 700, color: 'var(--ugaoo-green)', textTransform: 'uppercase', fontSize: '11px', marginBottom: '0.5rem' }}>
                    Price Range (₹ INR)
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {PRESET_PRICE_RANGES.map((preset, idx) => {
                      const isSelected = minPrice === preset.min && maxPrice === preset.max
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetPrice(preset.min, preset.max)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '9999px',
                            border: `1px solid ${isSelected ? 'var(--ugaoo-green)' : 'var(--ugaoo-border)'}`,
                            backgroundColor: isSelected ? 'var(--ugaoo-green)' : 'var(--ugaoo-white)',
                            color: isSelected ? 'var(--ugaoo-white)' : 'var(--ugaoo-text-dark)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className={styles.mobileDialogFooter}>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className={styles.clearAllBtn}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={styles.applyFiltersBtn}
                >
                  Apply &amp; View Results
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Desktop Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`${styles.desktopToggleBtn} ${filterPanelOpen || activeFilterCount > 0 ? styles.desktopToggleBtnActive : ''}`}
          >
            <Filter size={14} style={{ color: 'var(--ugaoo-green)' }} />
            <span>More Filters</span>
            {activeFilterCount > 0 && (
              <span className={styles.filterBadgeCount}>
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={14} style={{ transform: filterPanelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Quick In-Stock chip */}
          <button
            type="button"
            onClick={handleStockToggle}
            className={`${styles.inStockToggleBtn} ${inStockOnly ? styles.inStockToggleBtnActive : ''}`}
          >
            {inStockOnly ? '✓ In Stock Only' : 'In Stock Only'}
          </button>
        </div>

        {/* Right: Sort Dropdown */}
        <div className={styles.rightControls}>
          <ArrowUpDown size={14} style={{ color: 'var(--ugaoo-text-muted)' }} />
          <label htmlFor="catalog-sort" className={styles.sortLabel}>
            Sort by:
          </label>
          <select
            id="catalog-sort"
            value={currentSort}
            onChange={handleSortChange}
            aria-label="Sort products catalog"
            className={styles.sortSelect}
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
        <div className={styles.categoryPillsRow}>
          <Link
            href={basePath}
            className={`${styles.categoryPill} ${!selectedCategoryHandle && !category ? styles.categoryPillActive : ''}`}
          >
            All Products
          </Link>

          {distinctCategories.map((cat) => {
            const isSelected = selectedCategoryHandle === cat.handle || category === cat.handle
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.handle}`}
                className={`${styles.categoryPill} ${isSelected ? styles.categoryPillActive : ''}`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      )}

      {/* 4. Desktop Expandable Filter Drawer Panel */}
      {filterPanelOpen && (
        <div className={styles.desktopFilterPanel}>
          {/* Column 1: Botanical Seed Type */}
          <div className={styles.filterColumn}>
            <h4 className={styles.filterColumnTitle}>
              Seed / Plant Type
            </h4>
            <div className={styles.filterOptionList}>
              {SEED_TYPE_OPTIONS.map((opt) => {
                const isSelected = seedType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateFilter('seed_type', isSelected ? null : opt.value)}
                    className={`${styles.filterOptionItem} ${isSelected ? styles.filterOptionItemActive : ''}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--ugaoo-maroon)' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 2: Sowing Season */}
          <div className={styles.filterColumn}>
            <h4 className={styles.filterColumnTitle}>
              Sowing Season
            </h4>
            <div className={styles.filterOptionList}>
              {SEASON_OPTIONS.map((opt) => {
                const isSelected = season === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateFilter('season', isSelected ? null : opt.value)}
                    className={`${styles.filterOptionItem} ${isSelected ? styles.filterOptionItemActive : ''}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--ugaoo-maroon)' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 3: Packet / Pot Size */}
          <div className={styles.filterColumn}>
            <h4 className={styles.filterColumnTitle}>
              Packet / Pot Size
            </h4>
            <div className={styles.filterOptionList}>
              {PACKET_SIZE_OPTIONS.map((opt) => {
                const isSelected = packetSize === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleUpdateFilter('packet_size', isSelected ? null : opt.value)}
                    className={`${styles.filterOptionItem} ${isSelected ? styles.filterOptionItemActive : ''}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} style={{ color: 'var(--ugaoo-maroon)' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 4: Price Filter */}
          <div className={styles.filterColumn}>
            <h4 className={styles.filterColumnTitle}>
              Price Range (₹ INR)
            </h4>
            <div className={styles.filterOptionList}>
              {PRESET_PRICE_RANGES.map((preset, idx) => {
                const isSelected = minPrice === preset.min && maxPrice === preset.max
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetPrice(preset.min, preset.max)}
                    className={`${styles.filterOptionItem} ${isSelected ? styles.filterOptionItemActive : ''}`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>

            {/* Custom Min/Max Input Form */}
            <form onSubmit={handleApplyCustomPrice} className={styles.customPriceForm}>
              <input
                type="number"
                placeholder="Min ₹"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className={styles.priceInput}
              />
              <span style={{ color: 'var(--ugaoo-text-muted)' }}>–</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className={styles.priceInput}
              />
              <button type="submit" className={styles.priceSubmitBtn}>
                Go
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export function CatalogFilters(props: CatalogFiltersProps) {
  return (
    <React.Suspense fallback={<div style={{ height: '40px', backgroundColor: 'var(--ugaoo-cream-light)', borderRadius: '12px' }} />}>
      <CatalogFiltersInner {...props} />
    </React.Suspense>
  )
}
