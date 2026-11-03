'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { useCart } from '@/context/StorefrontContext'
import { GlorovProductItem } from '@/types/storefront'
import { ProductCard } from '../product/ProductCard'

const RECENT_SEARCHES_STORAGE_KEY = 'glorov_recent_searches'
const MAX_RECENT_SEARCHES = 10

const TRENDING_SEARCHES = [
  'Monstera Deliciosa',
  'Snake Plant',
  'Bonsai Tree',
  'Ceramic Pots',
  'Organic Neem Oil',
  'Cherry Tomato Seeds',
  'Basil Seeds',
  'Peace Lily',
  'Succulents',
  'Vegetable Seeds',
]

const CATEGORY_FILTERS = [
  'All',
  'Seeds',
  'Live Plants',
  'Planters & Pots',
  'Plant Care & Soil',
]

const RECOVERY_CHIPS = ['Monstera', 'Seeds', 'Houseplants', 'Pots', 'Soil']

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating'

interface ScoredProduct {
  product: GlorovProductItem
  score: number
}

/**
 * Helper to highlight matching substrings in autocomplete suggestions
 */
function HighlightedText({ text, query }: { text: string; query: string }): React.ReactElement {
  if (!query) {
    return <span>{text}</span>
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index < 0) {
    return <span>{text}</span>
  }

  const before = text.substring(0, index)
  const match = text.substring(index, index + query.length)
  const after = text.substring(index + query.length)

  return (
    <span>
      {before}
      <strong className="font-extrabold text-[#1B4332]">{match}</strong>
      {after}
    </span>
  )
}

/**
 * GLOROV SearchClientView
 * 1:1 migration of Flutter's GlorovSearchScreen & GlorovSearchService:
 * 1. Top Search Navigation Header (Back button, Search pill, Clear button, Submit button)
 * 2. Zero-Query View: Recent searches (with individual delete & clear all), Trending searches, Browse by Category, Popular Botanical Picks
 * 3. As-You-Type View: Featured Closest Result / Best Match Card (with image, details, quick actions), Keyword autocomplete with diagonal insert arrow, Matching products preview list, "See all results" CTA
 * 4. Submitted Results View: Results counter header, Sort dropdown, Category filter pills, Responsive 2-4 column product grid
 * 5. No Results Empty State: Circular search-off illustration & recovery suggestion chips
 */
export const SearchClientView: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToCart } = useCart()

  const initialQuery = searchParams ? (searchParams.get('q') || '') : ''
  const initialCategory = searchParams ? (searchParams.get('category') || 'All') : 'All'

  const [query, setQuery] = useState<string>(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [selectedSort, setSelectedSort] = useState<SortOption>('relevance')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(initialQuery.trim()))
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))
        }
      }
    } catch {
      // Fallback empty
    }
  }, [])

  // Synchronize state when URL searchParams change
  useEffect(() => {
    const q = searchParams ? (searchParams.get('q') || '') : ''
    const cat = searchParams ? (searchParams.get('category') || 'All') : 'All'
    setQuery(q)
    setSelectedCategory(cat)
    if (q.trim()) {
      setIsSubmitted(true)
    }
  }, [searchParams])

  // Save term to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim()
    if (!clean) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())
      const updated = [clean, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }
      return updated
    })
  }, [])

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== term.toLowerCase())
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })
  }, [])

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY)
    } catch {
      // Ignore
    }
  }, [])

  // Core Search Scoring Algorithm matching Flutter GlorovSearchService
  const { rankedProducts, closestProduct, keywordSuggestions } = useMemo(() => {
    const cleanQ = query.trim().toLowerCase()

    let baseProducts = MOCK_PRODUCTS

    // Apply category filter if not 'All'
    if (selectedCategory !== 'All') {
      baseProducts = baseProducts.filter((p) => p.category === selectedCategory)
    }

    if (!cleanQ) {
      return {
        rankedProducts: baseProducts,
        closestProduct: null,
        keywordSuggestions: [],
      }
    }

    const scored: ScoredProduct[] = []

    for (const product of baseProducts) {
      let score = 0
      const titleLower = product.title.toLowerCase()
      const botLower = (product.botanicalName || '').toLowerCase()
      const catLower = product.category.toLowerCase()
      const subLower = (product.subcategory || '').toLowerCase()
      const descLower = (product.description || '').toLowerCase()
      const tagMatch = product.tags?.some((t) => t.toLowerCase().includes(cleanQ)) || false

      if (titleLower === cleanQ) {
        score += 100
      } else if (titleLower.startsWith(cleanQ)) {
        score += 60
      } else if (titleLower.includes(cleanQ)) {
        score += 35
      }

      if (botLower === cleanQ) {
        score += 50
      } else if (botLower.includes(cleanQ)) {
        score += 25
      }

      if (catLower.includes(cleanQ) || subLower.includes(cleanQ)) {
        score += 20
      }

      if (descLower.includes(cleanQ)) {
        score += 10
      }

      if (tagMatch) {
        score += 15
      }

      if (product.isBestSeller) score += 5
      if (product.rating >= 4.5) score += 5
      if (product.inStock) score += 10

      if (score > 0) {
        scored.push({ product, score })
      }
    }

    // Sort by relevance score descending
    scored.sort((a, b) => b.score - a.score)

    // Secondary sorting if specified in submitted state
    let results = scored.map((s) => s.product)

    if (isSubmitted && selectedSort !== 'relevance') {
      results = [...results].sort((a, b) => {
        const priceA = a.discountPrice ?? a.price
        const priceB = b.discountPrice ?? b.price

        switch (selectedSort) {
          case 'price_asc':
            return priceA - priceB
          case 'price_desc':
            return priceB - priceA
          case 'rating':
            return b.rating - a.rating
          default:
            return 0
        }
      })
    }

    const closest = scored.length > 0 ? scored[0].product : null

    // Compute keyword suggestions
    const suggestionSet = new Set<string>()

    if (closest) {
      suggestionSet.add(closest.title)
    }

    for (const trending of TRENDING_SEARCHES) {
      if (trending.toLowerCase().includes(cleanQ)) {
        suggestionSet.add(trending)
      }
    }

    for (const p of results.slice(0, 4)) {
      suggestionSet.add(p.title)
      if (p.botanicalName && p.botanicalName.toLowerCase().includes(cleanQ)) {
        suggestionSet.add(p.botanicalName)
      }
    }

    return {
      rankedProducts: results,
      closestProduct: closest,
      keywordSuggestions: Array.from(suggestionSet).slice(0, 5),
    }
  }, [query, selectedCategory, selectedSort, isSubmitted])

  // Popular botanical picks for zero-query state (take first 6 products)
  const popularPicks = useMemo(() => {
    return MOCK_PRODUCTS.slice(0, 6)
  }, [])

  // Execute full submitted search
  const executeSubmittedSearch = useCallback(
    (term: string) => {
      const clean = term.trim()
      if (!clean) return

      saveRecentSearch(clean)
      setIsSubmitted(true)
      const params = new URLSearchParams()
      params.set('q', clean)
      if (selectedCategory !== 'All') {
        params.set('category', selectedCategory)
      }
      router.push(`/search?${params.toString()}`)
    },
    [saveRecentSearch, selectedCategory, router]
  )

  // Selecting a suggestion or chip
  const handleSelectSuggestion = useCallback(
    (term: string) => {
      setQuery(term)
      executeSubmittedSearch(term)
    },
    [executeSubmittedSearch]
  )

  // Inserting suggestion into input without submitting (diagonal arrow button)
  const handleInsertIntoSearch = useCallback((term: string) => {
    setQuery(term)
    setIsSubmitted(false)
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Clear query
  const handleClear = useCallback(() => {
    setQuery('')
    setIsSubmitted(false)
    router.push('/search')
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [router])

  // Back button action
  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
      router.back()
    } else {
      router.push('/')
    }
  }, [router])

  // Auto-focus input on mount if empty query
  useEffect(() => {
    if (!initialQuery && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [initialQuery])

  // Escape key closes search (modal / full screen parity with Flutter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBack])

  // Handle adding product to cart with floating notification matching Flutter
  const handleAddToCart = useCallback(
    (product: GlorovProductItem) => {
      addToCart(product, 1)
    },
    [addToCart]
  )

  return (
    <div className="w-full min-h-screen bg-white">
      {/* 1. Top Search Navigation Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[960px] mx-auto px-3 sm:px-4 py-2 flex items-center gap-2">
          {/* Back Button */}
          <button
            key="search_back_button"
            type="button"
            onClick={handleBack}
            aria-label="Close search"
            className="p-2 text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors shrink-0"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Search Input Pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              executeSubmittedSearch(query)
            }}
            className="flex-1 min-w-0"
            role="search"
          >
            <div className="flex items-center h-11 bg-[#F4F4F5] rounded-full border border-transparent focus-within:border-[#1B4332]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1B4332]/10 transition-all px-3.5">
              <span className="text-[#1B4332] shrink-0 mr-2.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>

              <input
                key="glorov_search_text_field"
                id="glorov_search_text_field"
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsSubmitted(false)
                }}
                placeholder="Search plants, seeds, fertilizers, pots..."
                className="w-full bg-transparent text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none"
                autoFocus={!initialQuery}
              />

              {query && (
                <button
                  key="search_clear_button"
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search query"
                  className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded-full shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Search Submit Action Button */}
          <button
            key="search_submit_button"
            type="button"
            onClick={() => executeSubmittedSearch(query)}
            aria-label="Submit search"
            className="p-2 text-[#1B4332] hover:bg-[#F3F4F6] rounded-full transition-colors shrink-0"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Main Search Body Content */}
      <main className={`mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 ${isSubmitted ? 'max-w-[1280px]' : 'max-w-[960px]'}`}>
        {/* VIEW 1: ZERO-QUERY STATE */}
        {!query.trim() && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Recent Searches */}
            {recentSearches.length > 0 && (
              <section aria-labelledby="recent-searches-title">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[#111827]">
                    <svg className="w-4 h-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 id="recent-searches-title">Recent Searches</h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllRecentSearches}
                    className="text-xs font-semibold text-[#1B4332] hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#F9FAF8] border border-[#E5E7EB] text-xs text-[#111827] hover:border-[#1B4332]/30 transition-all cursor-pointer group"
                      onClick={() => handleSelectSuggestion(term)}
                    >
                      <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="max-w-[160px] truncate">{term}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRecentSearch(term)
                        }}
                        aria-label={`Remove ${term}`}
                        className="p-0.5 text-[#9CA3AF] hover:text-[#111827] rounded-full"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Trending Searches */}
            <section aria-labelledby="trending-searches-title">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#111827] mb-3">
                <svg className="w-5 h-5 text-[#E11D48]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.533 1.035-.688 1.581-.24.845-.38 1.764-.38 2.68 0 .49-.395.89-.885.89a.89.89 0 01-.885-.89 6.84 6.84 0 01.37-2.226c.078-.262.176-.52.29-.77.17-.373.125-.815-.12-1.143a1 1 0 00-1.44-.12C5.39 3.82 4 5.99 4 8.5 4 13.194 7.806 17 12.5 17s8.5-3.806 8.5-8.5c0-2.82-1.39-5.32-3.55-6.837a1 1 0 00-1.285.12c-.22.22-.32.535-.27.842.14.862.14 1.745-.03 2.585-.16.78-.49 1.48-.97 2.07a.89.89 0 01-1.29.11.89.89 0 01-.21-1.18c.32-.51.52-1.11.58-1.74.06-.63-.04-1.27-.32-1.84a4.4 4.4 0 00-.76-1.077z" clipRule="evenodd" />
                </svg>
                <h2 id="trending-searches-title">Trending Searches</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((trend) => (
                  <button
                    key={trend}
                    type="button"
                    onClick={() => handleSelectSuggestion(trend)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E4E4E7] text-xs font-medium text-[#111827] hover:border-[#1B4332] hover:bg-[#F9FAF8] active:scale-95 transition-all shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{trend}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Browse by Category */}
            <section aria-labelledby="browse-category-title">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#111827] mb-3">
                <svg className="w-4 h-4 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <h2 id="browse-category-title">Browse by Category</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORY_FILTERS.map((cat) => {
                  const isSelected = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat)
                        if (cat !== 'All') {
                          handleSelectSuggestion(cat)
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        isSelected
                          ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                          : 'bg-[#F9FAF8] border-[#E4E4E7] text-[#111827] hover:border-[#1B4332]/40'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-[#1B4332] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>{cat}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 4. Popular Botanical Picks */}
            <section aria-labelledby="popular-picks-title">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#111827] mb-3">
                <svg className="w-4 h-4 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h2 id="popular-picks-title">Popular Botanical Picks</h2>
              </div>
              <div className="space-y-2">
                {popularPicks.map((product) => {
                  const effectivePrice = product.discountPrice ?? product.price
                  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price
                  const discountPercent =
                    product.discountPercent ??
                    (hasDiscount && product.price
                      ? Math.round(((product.price - effectivePrice) / product.price) * 100)
                      : undefined)

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5ECE8] hover:border-[#0A4C36]/40 hover:shadow-xs transition-all group"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-[58px] h-[58px] rounded-lg overflow-hidden bg-[#F4F7F4] shrink-0 border border-[#E5ECE8]">
                        <Image
                          src={product.primaryImage || product.imageUrls[0]}
                          alt={product.title}
                          fill
                          sizes="58px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                          {product.category}
                        </span>
                        <h3 className="font-serif font-bold text-[13.5px] text-[#0F2F24] truncate group-hover:text-[#0A4C36] transition-colors leading-snug">
                          {product.title}
                        </h3>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="font-serif font-extrabold text-[14px] text-[#0A4C36]">
                            ₹{effectivePrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] text-[#9CA3AF] line-through font-medium">
                              ₹{product.price}
                            </span>
                          )}
                          {discountPercent && discountPercent > 0 && (
                            <span className="text-[9px] font-extrabold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5]/60 px-1.5 py-0.5 rounded leading-none">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chevron Arrow */}
                      <span className="text-[#9CA3AF] group-hover:text-[#0A4C36] group-hover:translate-x-0.5 transition-all p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: AS-YOU-TYPE LIVE SUGGESTIONS VIEW */}
        {query.trim() && !isSubmitted && (
          <div className="space-y-6 animate-fadeIn">
            {/* If no matches found at all */}
            {rankedProducts.length === 0 ? (
              <NoResultsView query={query} onSelect={handleSelectSuggestion} />
            ) : (
              <>
                {/* A. FEATURED CLOSEST RESULT / BEST MATCH CARD */}
                {closestProduct && (
                  <section aria-labelledby="closest-result-title">
                    <div className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-[#0A4C36] tracking-tight mb-2">
                      <svg className="w-4 h-4 text-[#0A4C36]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h2 id="closest-result-title">Closest Result / Best Match</h2>
                    </div>

                    <div
                      key="closest_match_card"
                      className="bg-white rounded-[20px] border border-[#E5ECE8] shadow-[0_4px_16px_rgba(10,76,54,0.06)] hover:border-[#0A4C36]/35 p-3.5 sm:p-4.5 transition-all"
                    >
                      <div className="flex gap-3.5 sm:gap-4 items-center">
                        {/* High-Res Product Thumbnail with Signature Badge */}
                        <div className="relative w-[96px] h-[96px] sm:w-[108px] sm:h-[108px] rounded-[16px] overflow-hidden bg-[#F4F7F4] shrink-0 border border-[#E5ECE8]">
                          <Image
                            src={closestProduct.primaryImage || closestProduct.imageUrls[0]}
                            alt={closestProduct.title}
                            fill
                            sizes="108px"
                            className="object-cover"
                          />
                          {(closestProduct.isBestSeller || (closestProduct.discountPercent && closestProduct.discountPercent >= 20)) && (
                            <span className="absolute top-0 left-0 bg-[#0C2340] text-white text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-tl-[16px] rounded-br-[6px] shadow-xs flex items-center gap-0.5 leading-none">
                              <svg width={9} height={9} className="w-[9px] h-[9px] text-[#F9C74F] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                              <span>{closestProduct.isBestSeller ? 'Best Seller' : 'Sale'}</span>
                            </span>
                          )}
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-[5px] bg-white text-[#0F172A] border border-white shadow-2xs text-[10px] font-extrabold flex items-center gap-0.5 leading-none">
                            <span>{closestProduct.rating.toFixed(1)}</span>
                            <span className="text-[#16A34A]">★</span>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Category & In-Stock pill */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider">
                              {closestProduct.category}
                            </span>
                            {closestProduct.inStock && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                                In Stock
                              </span>
                            )}
                          </div>

                          {/* Product Title */}
                          <h3 className="font-serif font-bold text-[14.5px] sm:text-[16.5px] text-[#0F2F24] line-clamp-2 leading-snug">
                            {closestProduct.title}
                          </h3>

                          {/* Botanical Name */}
                          {closestProduct.botanicalName && (
                            <p className="text-[11px] italic text-[#6B7280] mt-0.5 truncate">
                              {closestProduct.botanicalName}
                            </p>
                          )}

                          {/* Price & Discount */}
                          <div className="flex flex-wrap items-baseline gap-1.5 mt-1.5">
                            <span className="font-serif font-extrabold text-[16px] sm:text-[17.5px] text-[#0A4C36] leading-none">
                              ₹{closestProduct.discountPrice ?? closestProduct.price}
                            </span>
                            {closestProduct.discountPrice != null && closestProduct.discountPrice < closestProduct.price && (
                              <>
                                <span className="text-[11px] sm:text-xs text-[#9CA3AF] line-through font-medium leading-none">
                                  ₹{closestProduct.price}
                                </span>
                                {closestProduct.discountPercent && (
                                  <span className="text-[9.5px] font-extrabold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5]/60 px-1.5 py-0.5 rounded leading-none">
                                    {closestProduct.discountPercent}% OFF
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-[#F3F4F6]">
                        <Link
                          key="closest_match_details_button"
                          href={`/products/${closestProduct.slug}`}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-[#0A4C36] text-xs font-bold text-[#0A4C36] hover:bg-[#F2FAF5] transition-colors active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="truncate">View Details</span>
                        </Link>

                        <button
                          key="closest_match_add_to_cart_button"
                          type="button"
                          onClick={() => handleAddToCart(closestProduct)}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#0A4C36] text-white text-xs font-bold hover:bg-[#135841] transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="truncate">Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* B. Autocomplete Keyword Suggestions */}
                {keywordSuggestions.length > 0 && (
                  <section aria-labelledby="search-suggestions-title" className="pt-2">
                    <h3 id="search-suggestions-title" className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                      Search Suggestions
                    </h3>
                    <div className="divide-y divide-[#F3F4F6] border-t border-b border-[#F3F4F6]">
                      {keywordSuggestions.map((keyword) => (
                        <div
                          key={keyword}
                          className="flex items-center justify-between py-2.5 px-1 hover:bg-[#F9FAF8] rounded-lg transition-colors cursor-pointer group"
                          onClick={() => handleSelectSuggestion(keyword)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <svg className="w-4 h-4 text-[#9CA3AF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm text-[#111827] truncate">
                              <HighlightedText text={keyword} query={query} />
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsertIntoSearch(keyword)
                            }}
                            title="Insert into search"
                            className="p-1.5 text-[#9CA3AF] hover:text-[#1B4332] rounded-full hover:bg-stone-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* C. Matching Products List Preview */}
                {rankedProducts.length > 1 && (
                  <section aria-labelledby="matching-products-title" className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 id="matching-products-title" className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                        Matching Products ({rankedProducts.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => executeSubmittedSearch(query)}
                        className="text-xs font-bold text-[#1B4332] hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2">
                      {rankedProducts
                        .filter((p) => p.id !== closestProduct?.id)
                        .slice(0, 4)
                        .map((product) => {
                          const effectivePrice = product.discountPrice ?? product.price
                          const hasDiscount = product.discountPrice != null && product.discountPrice < product.price
                          const discountPercent =
                            product.discountPercent ??
                            (hasDiscount && product.price
                              ? Math.round(((product.price - effectivePrice) / product.price) * 100)
                              : undefined)

                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E5ECE8] hover:border-[#0A4C36]/40 hover:shadow-xs transition-all group"
                            >
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F4F7F4] shrink-0 border border-[#E5ECE8]">
                                <Image
                                  src={product.primaryImage || product.imageUrls[0]}
                                  alt={product.title}
                                  fill
                                  sizes="56px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                                  {product.category}
                                </span>
                                <h4 className="font-serif font-bold text-[13.5px] text-[#0F2F24] truncate group-hover:text-[#0A4C36] transition-colors leading-snug">
                                  {product.title}
                                </h4>
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                  <span className="font-serif font-extrabold text-[14.5px] text-[#0A4C36]">
                                    ₹{effectivePrice}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-[11px] text-[#9CA3AF] line-through font-medium">
                                      ₹{product.price}
                                    </span>
                                  )}
                                  {discountPercent && discountPercent > 0 && (
                                    <span className="text-[9px] font-extrabold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5]/60 px-1.5 py-0.5 rounded leading-none">
                                      {discountPercent}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="text-[#9CA3AF] group-hover:text-[#0A4C36] group-hover:translate-x-0.5 transition-all p-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            </Link>
                          )
                        })}
                    </div>
                  </section>
                )}

                {/* Quick button to view all matching results in grid */}
                <div className="pt-2">
                  <button
                    key="view_all_results_button"
                    type="button"
                    onClick={() => executeSubmittedSearch(query)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#143224] text-white text-sm font-bold transition-all shadow-sm active:scale-98"
                  >
                    <span>See all {rankedProducts.length} results</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 3: FULL SUBMITTED RESULTS GRID VIEW */}
        {query.trim() && isSubmitted && (
          <div className="space-y-6 animate-fadeIn">
            {rankedProducts.length === 0 ? (
              <NoResultsView query={query} onSelect={handleSelectSuggestion} />
            ) : (
              <>
                {/* Filter & Sort Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                  {/* Results Count */}
                  <div className="text-sm text-[#111827]">
                    <span className="font-bold">{rankedProducts.length}</span> results for &ldquo;
                    <span className="font-bold text-[#1B4332]">{query}</span>&rdquo;
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-[#6B7280]">Sort by:</span>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white text-[#111827] focus:outline-none focus:border-[#1B4332] cursor-pointer"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Category Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {CATEGORY_FILTERS.map((cat) => {
                    const isSelected = selectedCategory === cat
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat)
                          const params = new URLSearchParams()
                          params.set('q', query)
                          if (cat !== 'All') params.set('category', cat)
                          router.push(`/search?${params.toString()}`)
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-2xs font-bold'
                            : 'bg-white text-[#111827] border-[#E4E4E7] hover:border-[#1B4332]/40'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>

                {/* Product Grid - Matching GLOROV Signature ProductCard Design */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {rankedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showWishlist={true}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Empty / No Results Found Component matching Flutter _buildNoResultsState
 */
function NoResultsView({
  query,
  onSelect,
}: {
  query: string
  onSelect: (term: string) => void
}): React.ReactElement {
  return (
    <div className="text-center py-12 px-4 max-w-md mx-auto animate-fadeIn">
      {/* Search Off Circular Icon Container */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[#1B4332]/8 flex items-center justify-center text-[#1B4332] mb-4">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l4 4m0-4l-4 4" />
        </svg>
      </div>

      <h3 className="text-base font-extrabold text-[#111827] mb-2">
        No Botanical Results Found for &ldquo;{query}&rdquo;
      </h3>

      <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
        Try searching with broader terms or choose one of our trending botanical collections:
      </p>

      {/* Recovery Suggestion Chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {RECOVERY_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F9FAF8] border border-[#E5E7EB] text-[#111827] hover:border-[#1B4332] hover:bg-white transition-all shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
