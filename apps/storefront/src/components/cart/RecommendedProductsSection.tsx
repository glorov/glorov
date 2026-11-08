'use client'

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GlorovImage } from '../ui/GlorovImage'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { useCart } from '../../context/StorefrontContext'
import type { GlorovProductItem } from '../../types/storefront'

export interface RecommendedProductsSectionProps {
  products?: GlorovProductItem[]
}

type RecommendationTab = 'for-you' | 'bestsellers' | 'seeds-vegetables' | 'living-plants' | 'under-150'

/**
 * GLOROV Intelligent Cart Recommendation System & Refined Card UI
 * Features:
 * - Smart Recommendation Engine: Context-aware pairing based on active cart contents (seeds, plants, planters, soil)
 * - Category / Goal Tabs: "✨ For You", "🔥 Bestsellers", "🌱 Seeds & Soil", "🪴 Plants & Pots", "⚡ Under ₹150"
 * - Cart Exclusion & Milestone Acceleration: Highlights add-ons that unlock Free Delivery (₹499)
 * - High-Craft Card UI:
 *   - Signature flush top-left docked tag with gold bolt (`⚡ BESTSELLER`, `⚡ SUMMER SALE`, `⚡ FREE DELIVERY`)
 *   - High-contrast frosted glass rating chip (4.7 ★ | 48)
 *   - Clean botanical category micro-tag
 *   - Fraunces serif editorial title with fixed 2-line alignment
 *   - Price row with strikethrough MRP & % OFF discount pill
 *   - Tactile quick-add circular button with animated spring checkmark & in-cart states
 *   - Smooth trackpad horizontal wheel scroll & smart arrow bounds
 */
export const RecommendedProductsSection: React.FC<RecommendedProductsSectionProps> = React.memo(
  function RecommendedProductsSection({ products }) {
  const { cartItems, cartSubtotal, addToCart, showToast } = useCart()
  const [activeTab, setActiveTab] = useState<RecommendationTab>('for-you')
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const canScrollLeftRef = useRef(false)
  const canScrollRightRef = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Track items in cart for smart exclusion & quantity indicators
  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of cartItems) {
      map.set(item.id, item.quantity)
      if (item.productId) map.set(item.productId, item.quantity)
    }
    return map
  }, [cartItems])

  const [fetchedProducts, setFetchedProducts] = useState<GlorovProductItem[]>([])

  useEffect(() => {
    if (products && products.length > 0) return
    let active = true
    fetch('/api/products?limit=16')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return
        if (data && Array.isArray(data.products)) {
          setFetchedProducts(data.products)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [products])

  const pool = products && products.length > 0 ? products : fetchedProducts

  // Cart Context Analysis
  const cartContext = useMemo(() => {
    const hasSeeds = cartItems.some(
      (i) =>
        i.title.toLowerCase().includes('seed') ||
        i.productId?.toLowerCase().includes('seed'),
    )
    const hasPlants = cartItems.some(
      (i) =>
        i.title.toLowerCase().includes('plant') ||
        i.title.toLowerCase().includes('monstera') ||
        i.title.toLowerCase().includes('pothos') ||
        i.productId?.toLowerCase().includes('plant'),
    )
    const hasPlanters = cartItems.some(
      (i) =>
        i.title.toLowerCase().includes('pot') ||
        i.title.toLowerCase().includes('planter') ||
        i.productId?.toLowerCase().includes('pot'),
    )
    const hasSoil = cartItems.some(
      (i) =>
        i.title.toLowerCase().includes('soil') ||
        i.title.toLowerCase().includes('mix') ||
        i.title.toLowerCase().includes('compost'),
    )

    const freeShippingGap = Math.max(0, 499 - cartSubtotal)

    return { hasSeeds, hasPlants, hasPlanters, hasSoil, freeShippingGap }
  }, [cartItems, cartSubtotal])

  // Smart Recommendation Engine
  const recommendedItems = useMemo(() => {
    // 1. Filter out items already in cart
    const unadded = pool.filter((p) => !cartItemMap.has(p.id) && !cartItemMap.has(p.slug || ''))
    const sourcePool = unadded.length >= 3 ? unadded : pool

    switch (activeTab) {
      case 'bestsellers': {
        return sourcePool
          .filter((p) => p.isBestSeller || p.rating >= 4.8 || p.badges?.includes('POPULAR'))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10)
      }
      case 'seeds-vegetables': {
        return sourcePool
          .filter(
            (p) =>
              p.category.toLowerCase().includes('seed') ||
              p.category.toLowerCase().includes('vegetable') ||
              p.productType === 'seeds',
          )
          .slice(0, 10)
      }
      case 'living-plants': {
        return sourcePool
          .filter(
            (p) =>
              p.category.toLowerCase().includes('plant') ||
              p.productType === 'plants',
          )
          .slice(0, 10)
      }
      case 'under-150': {
        return sourcePool
          .filter((p) => (p.discountPrice ?? p.price) <= 150)
          .sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price))
          .slice(0, 10)
      }
      case 'for-you':
      default: {
        // Smart dynamic pairing based on cart context:
        // Prioritize complementary categories
        const scored = sourcePool.map((p) => {
          let score = 0
          const effPrice = p.discountPrice ?? p.price

          // Free shipping accelerator score: items that help cross the 499 milestone
          if (cartContext.freeShippingGap > 0 && effPrice >= cartContext.freeShippingGap * 0.7) {
            score += 15
          }

          // Companion matching
          if (cartContext.hasSeeds) {
            if (p.category.toLowerCase().includes('soil') || p.category.toLowerCase().includes('care')) {
              score += 25 // Soil/cocopeat is #1 companion for seeds
            }
            if (p.category.toLowerCase().includes('seed')) score += 10
            if (p.category.toLowerCase().includes('pot')) score += 12
          }

          if (cartContext.hasPlants) {
            if (p.category.toLowerCase().includes('pot') || p.category.toLowerCase().includes('planter')) {
              score += 25 // Planters are #1 companion for plants
            }
            if (p.category.toLowerCase().includes('care')) score += 18
          }

          if (cartContext.hasPlanters && p.category.toLowerCase().includes('plant')) {
            score += 25
          }

          // Quality multipliers
          if (p.isBestSeller) score += 12
          score += p.rating * 2
          if (p.discountPercent && p.discountPercent >= 20) score += 8

          return { product: p, score }
        })

        scored.sort((a, b) => b.score - a.score)
        return scored.map((s) => s.product).slice(0, 10)
      }
    }
  }, [pool, cartItemMap, activeTab, cartContext])

  // Scroll bounds checker with rAF and threshold deduplication
  const updateScrollBounds = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const nextLeft = scrollLeft > 10
    const nextRight = scrollLeft + clientWidth < scrollWidth - 10
    if (nextLeft !== canScrollLeftRef.current) {
      canScrollLeftRef.current = nextLeft
      setCanScrollLeft(nextLeft)
    }
    if (nextRight !== canScrollRightRef.current) {
      canScrollRightRef.current = nextRight
      setCanScrollRight(nextRight)
    }
  }, [])

  useEffect(() => {
    updateScrollBounds()
    const el = scrollRef.current
    if (!el) return

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          updateScrollBounds()
          ticking = false
        })
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [recommendedItems, updateScrollBounds])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -240 : 240
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const handleAddToCart = (e: React.MouseEvent, prod: GlorovProductItem) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(prod, 1)
    setJustAddedId(prod.id)
    setTimeout(() => {
      setJustAddedId((curr) => (curr === prod.id ? null : curr))
    }, 1400)

    if (showToast) {
      showToast('success', `Added "${prod.title}" to cart!`)
    }
  }

  // Handle wheel horizontal scrolling naturally on desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && Math.abs(e.deltaY) > 5) {
      scrollRef.current.scrollLeft += e.deltaY * 0.7
    }
  }

  if (recommendedItems.length === 0) return null

  return (
    <section className="w-full select-none" aria-label="Recommended Products">
      {/* 1. Header with Controls & Contextual Milestone Guidance */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#EAF5EE] flex items-center justify-center text-[#0A4C36] shrink-0">
            <GlorovCustomIcons.spa size={15} />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-[18px] sm:text-[19px] font-extrabold text-[#0A4C36] tracking-[-0.2px] truncate leading-tight">
              Recommended Products
            </h3>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0A4C36] transition-colors ${
              canScrollLeft
                ? 'hover:bg-[#F2FAF5] active:scale-90 cursor-pointer text-[#0A4C36]'
                : 'opacity-40 cursor-not-allowed text-stone-300'
            }`}
            aria-label="Scroll left"
          >
            <GlorovCustomIcons.chevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#0A4C36] transition-colors ${
              canScrollRight
                ? 'hover:bg-[#F2FAF5] active:scale-90 cursor-pointer text-[#0A4C36]'
                : 'opacity-40 cursor-not-allowed text-stone-300'
            }`}
            aria-label="Scroll right"
          >
            <GlorovCustomIcons.chevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. Interactive Recommendation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-0.5 -mx-1 px-1">
        {[
          { id: 'for-you', label: '✨ For You' },
          { id: 'bestsellers', label: '🔥 Bestsellers' },
          { id: 'seeds-vegetables', label: '🌱 Seeds & Veggies' },
          { id: 'living-plants', label: '🪴 Living Plants' },
          { id: 'under-150', label: '⚡ Under ₹150' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as RecommendationTab)
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
                }
              }}
              className={`px-3 py-1 rounded-full text-[11.5px] font-bold tracking-[0.2px] whitespace-nowrap transition-colors duration-150 cursor-pointer select-none ${
                isActive
                  ? 'bg-[#0A4C36] text-white scale-[1.02]'
                  : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#0A4C36]/40 hover:text-[#0A4C36] hover:bg-[#F9FAF8]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}

        {/* Dynamic Milestone Delivery Helper Tag */}
        {cartContext.freeShippingGap > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF9C3] border border-[#FDE047] text-[#854D0E] text-[11px] font-bold whitespace-nowrap ml-auto">
            🚚 Add ₹{cartContext.freeShippingGap} for Free Delivery
          </span>
        )}
      </div>

      {/* 3. Horizontal Recommended Cards Carousel */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-1 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendedItems.map((prod) => {
          const effectivePrice = prod.discountPrice ?? prod.price
          const originalPrice = prod.discountPrice ? prod.price : undefined
          const hasDiscount = originalPrice !== undefined && originalPrice > effectivePrice
          const discountPercent =
            prod.discountPercent ??
            (hasDiscount && originalPrice
              ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
              : undefined)

          const inCartQty = cartItemMap.get(prod.id) ?? (prod.slug ? cartItemMap.get(prod.slug) : undefined) ?? 0
          const isJustAdded = justAddedId === prod.id

          // Contextual Tag Resolution
          const badgeText = (() => {
            if (
              cartContext.freeShippingGap > 0 &&
              effectivePrice >= cartContext.freeShippingGap &&
              effectivePrice <= cartContext.freeShippingGap + 80
            ) {
              return 'FREE SHIPPING'
            }
            if (prod.badges && prod.badges.length > 0 && prod.badges[0].trim()) {
              return prod.badges[0].trim()
            }
            if (prod.isBestSeller) {
              return 'BESTSELLER'
            }
            if (discountPercent && discountPercent >= 20) {
              return 'SUMMER SALE'
            }
            if (prod.rating >= 4.8) {
              return 'TOP RATED'
            }
            return null
          })()

          // Category Micro-tag
          const categoryTag = (() => {
            const cat = prod.category.toLowerCase()
            if (cat.includes('soil') || cat.includes('care') || cat.includes('fertilizer') || cat.includes('compost')) {
              return 'Organic Soil Care'
            }
            if (cat.includes('pot') || cat.includes('planter')) {
              return 'Ceramic Planter'
            }
            if (cat.includes('seed')) {
              return 'Heirloom Seeds'
            }
            if (cat.includes('plant')) {
              return 'Rare Houseplant'
            }
            return prod.category
          })()

          return (
            <div
              key={prod.id}
              className="w-[168px] min-w-[168px] sm:w-[176px] sm:min-w-[176px] h-[272px] sm:h-[278px] flex-shrink-0 rounded-[20px] bg-white border border-[#E5ECE8] overflow-hidden flex flex-col justify-between transition-colors duration-200 hover:border-[#0A4C36]/50 group relative"
            >
              {/* Media with Overlays */}
              <div className="relative w-full h-[148px] sm:h-[154px] bg-[#F4F7F4] overflow-hidden shrink-0 rounded-t-[20px]">
                <Link href={`/products/${prod.slug || prod.id}`} className="block w-full h-full">
                  <GlorovImage
                    src={prod.primaryImage}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 640px) 168px, 176px"
                    className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                    containerClassName="w-full h-full"
                    fallbackTitle={prod.title}
                  />
                </Link>

                {/* Top-Left Signature Flush Docked Tag with Golden Lightning Bolt */}
                {badgeText && (
                  <div className="absolute top-0 left-0 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-[3px] bg-[#0C2340] text-white text-[9px] font-extrabold tracking-[0.4px] uppercase px-2 py-[3.5px] rounded-tl-[20px] rounded-tr-[7px] rounded-br-[7px] rounded-bl-0 select-none leading-none">
                      <svg
                        width={10}
                        height={10}
                        className="w-2.5 h-2.5 text-[#F9C74F] shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{badgeText}</span>
                    </span>
                  </div>
                )}

                {/* Bottom-Left Solid White Rating Badge */}
                <div className="absolute left-2 bottom-2 px-1.5 py-[3px] rounded-[6px] bg-white text-[#0F172A] border border-stone-200 flex items-center gap-1 leading-none select-none z-10">
                  <span className="text-[11px] font-extrabold text-[#0F172A]">{prod.rating.toFixed(1)}</span>
                  <GlorovCustomIcons.star size={11} className="text-[#16A34A] fill-current" />
                  <span className="text-[#CBD5E1] text-[9.5px]">|</span>
                  <span className="text-[10px] font-semibold text-[#475569]">{prod.reviewCount}</span>
                </div>
              </div>

              {/* Content Area with uniform 2-line title container */}
              <div className="p-2.5 flex-1 flex flex-col justify-between min-h-[114px]">
                <div>
                  {/* Category Micro-tag */}
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#16A34A] truncate block leading-tight mb-0.5">
                    {categoryTag}
                  </span>

                  {/* 2-line editorial Fraunces serif title */}
                  <Link
                    href={`/products/${prod.slug || prod.id}`}
                    title={prod.title}
                    className="font-serif font-bold text-[13px] sm:text-[13.5px] text-[#0F2F24] line-clamp-2 leading-[1.25] h-[34px] flex items-start overflow-hidden group-hover:text-[#16A34A] transition-colors"
                  >
                    {prod.title}
                  </Link>
                </div>

                {/* Price & Interactive Circular Quick-Add Button Row */}
                <div className="flex items-center justify-between gap-1 mt-auto pt-1">
                  <div className="flex items-baseline gap-1 flex-wrap min-w-0">
                    <span className="font-serif text-[15px] sm:text-[15.5px] font-extrabold text-[#0A4C36] leading-none">
                      ₹{Math.round(effectivePrice)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <span className="text-[11px] text-[#94A3B8] line-through leading-none font-medium">
                        ₹{Math.round(originalPrice)}
                      </span>
                    )}
                    {discountPercent && discountPercent > 0 && (
                      <span className="text-[9px] font-extrabold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5]/60 px-1 py-0.5 rounded leading-none shrink-0">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Circular Botanical Green Quick-Add Button with Interactive Check Feedback */}
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, prod)}
                    aria-label={`Add ${prod.title} to cart`}
                    title={inCartQty > 0 ? `In Cart (${inCartQty}). Click to add another` : 'Add to cart'}
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 cursor-pointer active:scale-90 hover:scale-105 transition-all relative ${
                      isJustAdded
                        ? 'bg-[#15803D] text-white scale-105 ring-2 ring-emerald-200'
                        : inCartQty > 0
                        ? 'bg-[#0A4C36] text-white ring-1 ring-[#0A4C36]'
                        : 'bg-[#0A4C36] hover:bg-[#135841] text-white'
                    }`}
                  >
                    {isJustAdded ? (
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white animate-in zoom-in-75 duration-150"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : inCartQty > 0 ? (
                      <div className="flex items-center justify-center relative">
                        <GlorovCustomIcons.cart size={16} className="text-white" />
                        <span className="absolute -top-2.5 -right-2.5 w-4 h-4 rounded-full bg-[#16A34A] text-white text-[9.5px] font-black flex items-center justify-center border border-white leading-none">
                          {inCartQty}
                        </span>
                      </div>
                    ) : (
                      <GlorovCustomIcons.cart size={16} className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
})
