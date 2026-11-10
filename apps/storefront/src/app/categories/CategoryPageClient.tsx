'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GlorovImage } from '../../components/ui/GlorovImage'
import { useCart } from '../../context/StorefrontContext'
import {
  GlorovSeedIcon,
  GlorovVegetableIcon,
  GlorovLivePlantIcon,
  GlorovFlowerIcon,
  GlorovHerbIcon,
  GlorovAllIcon,
} from '../../components/common/GlorovIcons'
import {
  GLOROV_BOTANICAL_CATEGORIES,
} from '../../lib/botanical-categories'

export interface CategoryPageClientProps {
  initialCategoryHandle?: string
}

// Mobile: strictly 4 primary categories as requested
const MOBILE_PRIMARY_CATEGORY_HANDLES = ['seeds', 'vegetables', 'live-plants', 'flowers']

export function CategoryPageClient({
  initialCategoryHandle,
}: CategoryPageClientProps) {
  const router = useRouter()
  const { cartCount } = useCart()

  // Mobile selected category index in mobileRailCategories (0 = For You)
  const initialIndex = useMemo(() => {
    if (!initialCategoryHandle) return 0
    const idx = GLOROV_BOTANICAL_CATEGORIES.findIndex(
      (c) => c.handle === initialCategoryHandle
    )
    return idx !== -1 ? idx : 0
  }, [initialCategoryHandle])

  const [selectedMobileIndex, setSelectedMobileIndex] = useState<number>(initialIndex)
  // Mobile layout mode: 'rail' (fast dual-column switcher) or 'feed' (immersive full-bleed visual cards)
  const [mobileViewMode, setMobileViewMode] = useState<'rail' | 'feed'>('rail')

  // Desktop search & tab filters
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('')
  const [selectedDesktopGroup, setSelectedDesktopGroup] = useState<string>(() => {
    if (!initialCategoryHandle || initialCategoryHandle === 'for-you') return 'All Categories'
    const match = GLOROV_BOTANICAL_CATEGORIES.find((c) => c.handle === initialCategoryHandle)
    return match ? match.title : 'All Categories'
  })

  // Mobile: Strictly 4 categories (+ For You overview in rail)
  const mobileRailCategories = useMemo(() => {
    return GLOROV_BOTANICAL_CATEGORIES.filter(
      (c) => c.handle === 'for-you' || MOBILE_PRIMARY_CATEGORY_HANDLES.includes(c.handle)
    ).slice(0, 5)
  }, [])

  // Mobile active category
  const activeMobileCategory = mobileRailCategories[selectedMobileIndex] || mobileRailCategories[0]
  const isForYouMobile = activeMobileCategory.handle === 'for-you'

  // Mobile feed: Strictly 4 categories only
  const mobileFeedCategories = useMemo(() => {
    return GLOROV_BOTANICAL_CATEGORIES.filter(
      (c) => c.handle !== 'for-you' && MOBILE_PRIMARY_CATEGORY_HANDLES.includes(c.handle)
    ).slice(0, 4)
  }, [])

  // Desktop & Tablet categories (All 5 botanical categories: Seeds, Vegetables, Living Plants, Flowers, Herbs)
  const allDesktopCategories = useMemo(() => {
    return GLOROV_BOTANICAL_CATEGORIES.filter((c) => c.handle !== 'for-you')
  }, [])

  // Desktop filtered categories
  const filteredDesktopCategories = useMemo(() => {
    let list = allDesktopCategories

    if (selectedDesktopGroup !== 'All Categories') {
      list = list.filter((cat) => cat.title === selectedDesktopGroup)
    }

    if (desktopSearchQuery.trim().length > 0) {
      const q = desktopSearchQuery.trim().toLowerCase()
      list = list.filter((cat) => {
        const titleMatch = cat.title.toLowerCase().includes(q)
        const descMatch = cat.description.toLowerCase().includes(q)
        const subMatch = cat.subCategories.some((s) => s.title.toLowerCase().includes(q))
        return titleMatch || descMatch || subMatch
      })
    }

    return list
  }, [allDesktopCategories, selectedDesktopGroup, desktopSearchQuery])

  // Desktop selected category for single showcase view
  const activeDesktopCategory = useMemo(() => {
    if (selectedDesktopGroup === 'All Categories') return null
    return (
      allDesktopCategories.find((c) => c.title === selectedDesktopGroup) ||
      allDesktopCategories[0]
    )
  }, [allDesktopCategories, selectedDesktopGroup])

  const desktopTabs = [
    { label: 'All Categories', Icon: GlorovAllIcon },
    { label: 'Seeds', Icon: GlorovSeedIcon },
    { label: 'Vegetables', Icon: GlorovVegetableIcon },
    { label: 'Living Plants', Icon: GlorovLivePlantIcon },
    { label: 'Flowers', Icon: GlorovFlowerIcon },
    { label: 'Herbs', Icon: GlorovHerbIcon },
  ]

  return (
    <div className="w-full h-full cat-desktop:h-auto flex flex-col bg-white cat-desktop:bg-[#F9FAF8]">
      {/* =========================================================================
          1. MOBILE VIEWPORT (< 800px / cat-desktop:hidden)
          Sleek, modern mobile botanical experience with dual-view toggle:
          - Rail View (Fast dual-column rail with spacious 2-column cards)
          - Feed View (Immersive card feed for visual exploration)
          ========================================================================= */}
      <div className="cat-desktop:hidden flex flex-col w-full h-full bg-[#F9FAF8] overflow-hidden select-none">
        {/* Mobile Top Navigation App Bar */}
        <header className="h-14 min-h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-2 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Back to home"
              className="w-10 h-10 flex items-center justify-center text-[#111827] active:bg-[#F3F4F1] rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-[17px] font-extrabold text-[#111827] tracking-[-0.2px] leading-tight">
                Botanical Categories
              </h1>
              <p className="text-[10px] text-[#6B7280] font-medium leading-none mt-0.5">
                Pune Nursery Acclimatized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* View Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileViewMode((v) => (v === 'rail' ? 'feed' : 'rail'))}
              title={mobileViewMode === 'rail' ? 'Switch to Card Feed View' : 'Switch to Dual Rail View'}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3F7F4] text-[#1B4332] border border-[#D8E6DD] flex items-center gap-1 active:scale-95 transition-all"
            >
              {mobileViewMode === 'rail' ? (
                <>
                  <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Feed</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                  </svg>
                  <span>Rail</span>
                </>
              )}
            </button>

            <Link
              href="/search"
              aria-label="Search collection"
              className="w-9 h-9 flex items-center justify-center text-[#111827] active:bg-[#F3F4F1] rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="w-9 h-9 flex items-center justify-center text-[#111827] active:bg-[#F3F4F1] rounded-full transition-colors relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 8.5h13l1.2 12.2a2 2 0 0 1-2 2.3H6.3a2 2 0 0 1-2-2.3L5.5 8.5z" />
                <path d="M9.5 12.5a2.5 2.5 0 0 0 5 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#1B4332] text-white text-[8.5px] font-extrabold flex items-center justify-center border border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {mobileViewMode === 'rail' ? (
          /* =========================================================================
             A. MOBILE DUAL-COLUMN RAIL VIEW (Fast category tap browsing)
             ========================================================================= */
          <div className="flex-1 flex flex-row overflow-hidden bg-white">
            {/* Left Category Navigation Rail (88px) */}
            <nav
              aria-label="Botanical Category Rail"
              className="w-[88px] min-w-[88px] max-w-[88px] bg-[#F7F9F7] border-r border-[#E5E7EB] overflow-y-auto overflow-x-hidden py-1.5 scrollbar-none"
            >
              {mobileRailCategories.map((cat, idx) => {
                const isSelected = idx === selectedMobileIndex
                const isForYou = cat.handle === 'for-you'

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedMobileIndex(idx)}
                    className={`w-full py-2.5 px-1 relative flex flex-col items-center justify-center transition-all ${
                      isSelected ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'bg-transparent hover:bg-black/[0.02]'
                    }`}
                  >
                    {/* Active Left Vertical Indicator Bar */}
                    {isSelected && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] bg-[#1B4332] rounded-r-[3px]" />
                    )}

                    {/* Thumbnail Container */}
                    <div
                      className={`w-12 h-12 rounded-[14px] flex items-center justify-center overflow-hidden transition-all ${
                        isForYou
                          ? isSelected
                            ? 'bg-[#D8F3DC] border-2 border-[#1B4332] shadow-sm'
                            : 'bg-[#E8F5E9] border border-[#E5E7EB]'
                          : isSelected
                            ? 'border-2 border-[#1B4332] bg-white shadow-sm ring-2 ring-[#1B4332]/10'
                            : 'border border-[#E5E7EB] bg-white'
                      }`}
                    >
                      {isForYou ? (
                        <svg className="w-5 h-5 text-[#1B4332]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
                        </svg>
                      ) : (
                        <div className="relative w-full h-full">
                          <GlorovImage
                            src={cat.image}
                            alt={cat.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                            containerClassName="w-full h-full"
                            fallbackTitle={cat.title}
                          />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[10.5px] leading-[1.2] text-center mt-1.5 px-0.5 line-clamp-2 ${
                        isSelected ? 'font-extrabold text-[#1B4332]' : 'font-semibold text-[#4B5563]'
                      }`}
                    >
                      {cat.title}
                    </span>
                  </button>
                )
              })}
            </nav>

            {/* Right Content Area (Clean 2-column cards for high readability) */}
            <main
              key={activeMobileCategory.handle}
              className="flex-1 bg-white overflow-y-auto overflow-x-hidden p-3.5 animate-in fade-in duration-200"
            >
              {/* Category Header Banner */}
              <div className="bg-gradient-to-r from-[#F0F5F2] to-[#E8F0EA] rounded-2xl p-3 mb-4 border border-[#DCE7DF] flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-extrabold tracking-wider uppercase text-[#1B4332] bg-white/70 px-2 py-0.5 rounded-full inline-block">
                    {activeMobileCategory.badge}
                  </span>
                  <h2 className="text-[16px] font-extrabold text-[#111827] mt-1 leading-tight">
                    {isForYouMobile ? 'Curated For You' : `${activeMobileCategory.title}`}
                  </h2>
                  <p className="text-[11px] text-[#4B5563] mt-0.5 line-clamp-1">
                    {activeMobileCategory.description}
                  </p>
                </div>
                {!isForYouMobile && (
                  <Link
                    href={`/categories/${activeMobileCategory.handle}`}
                    className="shrink-0 px-2.5 py-1.5 rounded-full bg-[#1B4332] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <span>View All</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Section 1: Subcategories in spacious 2-column cards */}
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[14px] font-extrabold text-[#111827] tracking-[-0.2px]">
                  {isForYouMobile ? 'Popular Collections' : `${activeMobileCategory.title} Collections`}
                </h3>
                <span className="text-[11px] font-semibold text-[#6B7280]">
                  {activeMobileCategory.subCategories.length} Collections
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {activeMobileCategory.subCategories.map((sub) => (
                  <Link
                    key={sub.handle}
                    href={`/categories/${activeMobileCategory.handle}?subcat=${encodeURIComponent(sub.title)}`}
                    className="flex flex-col bg-[#FBFDFB] rounded-[16px] border border-[#E5EDE7] overflow-hidden p-2 hover:border-[#1B4332]/40 active:scale-95 transition-all group shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
                  >
                    <div className="w-full aspect-[4/3] rounded-[12px] bg-[#F4F4F5] overflow-hidden relative">
                      <GlorovImage
                        src={sub.image}
                        alt={sub.title}
                        fill
                        sizes="140px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        containerClassName="w-full h-full"
                        fallbackTitle={sub.title}
                      />
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold backdrop-blur-xs">
                        {sub.count} items
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-[#1F2937] leading-[1.25] mt-1.5 line-clamp-1 group-hover:text-[#1B4332] transition-colors">
                      {sub.title}
                    </span>
                    <span className="text-[10px] text-[#6B7280] font-medium flex items-center gap-0.5 mt-0.5">
                      <span>Explore</span>
                      <svg className="w-2.5 h-2.5 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>

              {/* Section 2: Top Launches / Featured Varieties */}
              {activeMobileCategory.launches.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5 mb-2.5 pt-1">
                    <svg className="w-4 h-4 text-[#BC4749] fill-current" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                    </svg>
                    <h3 className="text-[14px] font-extrabold text-[#111827] tracking-[-0.2px]">
                      {isForYouMobile ? 'Featured Arrivals' : 'Top Seeded Varieties'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {activeMobileCategory.launches.map((launch) => {
                      let tagBg = 'bg-[#1B4332] text-white'
                      if (launch.tag === 'SALE IS LIVE') tagBg = 'bg-[#BC4749] text-white'
                      else if (launch.tag === 'NEW LAUNCH') tagBg = 'bg-[#52B788] text-white'

                      return (
                        <Link
                          key={launch.handle}
                          href={`/products/${launch.handle}`}
                          className="flex flex-col bg-white rounded-[16px] border border-[#E5EDE7] p-2 hover:border-[#1B4332]/40 active:scale-95 transition-all group shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
                        >
                          <div className="w-full aspect-square rounded-[12px] bg-[#F9FAF8] overflow-hidden relative">
                            <GlorovImage
                              src={launch.image}
                              alt={launch.title}
                              fill
                              sizes="140px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              containerClassName="w-full h-full"
                              fallbackTitle={launch.title}
                            />
                            <span
                              className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide shadow-xs ${tagBg}`}
                            >
                              {launch.tag}
                            </span>
                          </div>

                          <span className="text-[11.5px] font-bold text-[#1F2937] leading-[1.25] mt-1.5 line-clamp-1 group-hover:text-[#1B4332] transition-colors">
                            {launch.title}
                          </span>

                          {launch.price !== undefined && (
                            <span className="text-[12px] font-black text-[#1B4332] mt-0.5">
                              ₹{launch.price.toFixed(0)}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </>
              )}

              <div className="h-10" />
            </main>
          </div>
        ) : (
          /* =========================================================================
             B. MOBILE VISUAL FEED VIEW (Immersive full-bleed card stream)
             ========================================================================= */
          <main className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {mobileFeedCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-[#E5EDE7] shadow-sm overflow-hidden flex flex-col group"
              >
                <Link
                  href={`/categories/${cat.handle}`}
                  className="relative w-full aspect-[16/9] overflow-hidden bg-[#F4F4F5] block"
                >
                  <GlorovImage
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    fallbackTitle={cat.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#FFD51F] text-[#042018] text-[10px] font-black shadow-sm">
                    {cat.badge}
                  </span>
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                    {cat.count} Varieties
                  </span>
                </Link>

                <div className="p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link
                      href={`/categories/${cat.handle}`}
                      className="font-serif !text-[#042018] group-hover:!text-[#1B4332] text-[18px] font-bold tracking-tight transition-colors"
                    >
                      {cat.title}
                    </Link>
                    <span className="text-[10.5px] font-bold text-[#1B4332] bg-[#EFF6F1] px-2 py-0.5 rounded-full border border-[#DCE7DF]">
                      {cat.count} Varieties
                    </span>
                  </div>

                  <p className="text-[12px] text-[#4B5563] line-clamp-2 leading-[1.45] mb-3">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {cat.subCategories.slice(0, 3).map((sub) => (
                      <Link
                        key={sub.handle}
                        href={`/categories/${cat.handle}?subcat=${encodeURIComponent(sub.title)}`}
                        className="px-2.5 py-1 rounded-full bg-[#F3F7F4] text-[#1B4332] text-[11px] font-semibold border border-[#DCE7DF]"
                      >
                        {sub.title} ({sub.count})
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/categories/${cat.handle}`}
                    className="w-full py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 active:bg-[#2D6A4F] transition-colors shadow-xs"
                  >
                    <span>Browse All {cat.title}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
            <div className="h-8" />
          </main>
        )}
      </div>

      {/* =========================================================================
          2. DESKTOP & TABLET VIEWPORT (>= 800px / hidden cat-desktop:block)
          Elevated botanical editorial taxonomy with luxury cards and instant filters
          ========================================================================= */}
      <div className="hidden cat-desktop:block w-full bg-[#F9FAF8] pb-16">
        {/* Compact, Inspiring Botanical Hero Banner Header */}
        <section className="w-full bg-gradient-to-br from-[#042018] via-[#0A3729] to-[#144D3A] text-white px-8 py-5 lg:px-12 lg:py-6 border-b border-white/10 relative overflow-hidden">
          {/* Subtle botanical background aura */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#52B788]/10 to-transparent pointer-events-none" />

          <div className="max-w-[1280px] mx-auto relative z-10">
            {/* Top Bar: Back & Pill Badge */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-[12.5px] font-semibold transition-colors group"
              >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Store</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4E79E]/[0.18] border border-[#D4E79E]/[0.35] text-[#D4E79E] text-[10.5px] font-bold tracking-[0.8px] uppercase">
                <svg className="w-3 h-3 text-[#D4E79E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
                <span>PUNE CENTRAL NURSERY DIRECTORY</span>
              </div>
            </div>

            {/* Main Headline & Stat Badges in Responsive Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h1 className="font-serif !text-white font-extrabold text-[26px] lg:text-[32px] leading-tight tracking-[-0.5px]">
                  Explore Botanical Collections
                </h1>
                <p className="text-white/80 text-[13.5px] lg:text-[14px] leading-relaxed mt-1 font-normal">
                  Discover indigenous Desi heirloom seeds with 98% germination guarantee, nursery-acclimatized foliage, and fresh garden blooms.
                </p>
              </div>

              {/* Botanical Trust Badges */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4E79E]" />
                  <span>98% Germination</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4E79E]" />
                  <span>100+ Varieties</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4E79E]" />
                  <span>Transit Safe Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-5 pb-14 space-y-5">
          {/* Search Box & Instant Filter Row */}
          <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
            {/* Live Search Input */}
            <div className="flex-1 bg-white rounded-2xl border border-[#E5EDE7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus-within:border-[#1B4332] focus-within:ring-2 focus-within:ring-[#1B4332]/10 flex items-center px-4 py-3 gap-3 transition-all">
              <svg className="w-5 h-5 text-[#1B4332] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={desktopSearchQuery}
                onChange={(e) => setDesktopSearchQuery(e.target.value)}
                placeholder="Search categories, seeds, houseplants, herbs, or flowers..."
                className="flex-1 text-[15px] text-[#111827] placeholder:text-[#6B7280] focus:outline-none bg-transparent"
              />
              {desktopSearchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDesktopSearchQuery('')}
                  aria-label="Clear search"
                  className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Result Counter Pill */}
            <div className="text-xs font-bold text-[#4B5563] bg-[#EFF4F0] px-3.5 py-3 rounded-2xl border border-[#DCE7DF] shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
              <span>
                {filteredDesktopCategories.length} {filteredDesktopCategories.length === 1 ? 'Category' : 'Categories'}
              </span>
            </div>
          </div>

          {/* Quick Filter Pill Tabs with Icons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
            {desktopTabs.map((tab) => {
              const isSelected = selectedDesktopGroup === tab.label
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setSelectedDesktopGroup(tab.label)}
                  className={`px-4 py-2 rounded-full border text-[13px] flex items-center gap-2 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#1B4332] text-white font-extrabold border-[#1B4332] shadow-sm ring-2 ring-[#1B4332]/20'
                      : 'bg-white text-[#111827] hover:border-[#1B4332]/40 hover:bg-[#F9FAF8] font-semibold border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <tab.Icon
                    size={16}
                    className={isSelected ? 'text-white' : 'text-[#1B4332]'}
                  />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* =========================================================================
              VIEWPORT SWITCHER: All Categories (Desktop: 1 Line, Tablet: Max 2 Lines)
              ========================================================================= */}
          {selectedDesktopGroup === 'All Categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-3 xl:gap-4.5 pt-1">
              {filteredDesktopCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl xl:rounded-3xl border border-[#E5EDE7] shadow-[0_4px_20px_rgba(27,67,50,0.05)] hover:shadow-[0_18px_40px_rgba(27,67,50,0.12)] hover:border-[#2D6A4F]/40 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Category Image Header with Rich Floating Badges */}
                  <Link
                    href={`/categories/${cat.handle}`}
                    className="relative w-full aspect-[16/10] overflow-hidden bg-[#F4F4F5] block cursor-pointer"
                  >
                    <GlorovImage
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                      containerClassName="w-full h-full"
                      fallbackTitle={cat.title}
                    />

                    {/* Subtle top gradient for badge contrast */}
                    <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                    {/* Botanical Badge (Top-Left) */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#FFD51F] text-[#042018] text-[10px] font-black tracking-wide shadow-xs">
                      {cat.badge}
                    </span>

                    {/* Varieties Count Badge (Top-Right Glassmorphic) */}
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md border border-white/25 shadow-xs">
                      {cat.count} Varieties
                    </span>
                  </Link>

                  {/* Card Body with Title, Subcategory Chips and Explorer Button */}
                  <div className="p-3.5 xl:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title Row with hover icon */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <Link
                          href={`/categories/${cat.handle}`}
                          className="font-serif !text-[#042018] group-hover:!text-[#1B4332] text-[17px] xl:text-[19px] font-extrabold tracking-[-0.3px] leading-tight transition-colors truncate"
                        >
                          {cat.title}
                        </Link>
                        <span className="w-6 h-6 xl:w-7 xl:h-7 rounded-full bg-[#F3F7F4] group-hover:bg-[#1B4332] group-hover:text-white text-[#1B4332] flex items-center justify-center transition-all duration-300 shrink-0">
                          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>

                      <p className="text-[12px] text-[#4B5563] leading-[1.4] line-clamp-2">
                        {cat.description}
                      </p>

                      {/* Interactive Subcategory Pills */}
                      <div className="mt-3 pt-2.5 border-t border-[#F1F5F2]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                            Collections
                          </span>
                          <span className="text-[10px] font-semibold text-[#1B4332]">
                            {cat.subCategories.length} Sub-types
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {cat.subCategories.slice(0, 2).map((sub) => (
                            <Link
                              key={sub.handle}
                              href={`/categories/${cat.handle}?subcat=${encodeURIComponent(sub.title)}`}
                              className="px-2 py-0.5 rounded-full bg-[#F3F7F4] hover:bg-[#1B4332] hover:text-white text-[#1B4332] text-[10px] font-bold border border-[#DCE7DF] transition-all truncate max-w-[120px]"
                            >
                              <span>{sub.title}</span>
                              <span className="ml-1 opacity-70">({sub.count})</span>
                            </Link>
                          ))}
                          {cat.subCategories.length > 2 && (
                            <Link
                              href={`/categories/${cat.handle}`}
                              className="text-[9.5px] font-bold text-[#6B7280] hover:text-[#1B4332] transition-colors ml-0.5"
                            >
                              +{cat.subCategories.length - 2} more
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Explore Action CTA */}
                    <div className="mt-4 pt-3 border-t border-[#F1F5F2] flex items-center justify-between">
                      <div className="text-[10.5px] font-semibold text-[#52B788] flex items-center gap-1">
                        <svg className="w-3 h-3 text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Acclimatized</span>
                      </div>

                      <Link
                        href={`/categories/${cat.handle}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1B4332] text-white hover:bg-[#2D6A4F] text-[11px] font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
                      >
                        <span>Explore</span>
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeDesktopCategory ? (
            /* =========================================================================
               SINGLE CATEGORY SHOWCASE VIEW (When a specific category tab is selected)
               ========================================================================= */
            <div className="space-y-8 pt-1">
              {/* Category Spotlight Banner */}
              <div className="bg-white rounded-3xl border border-[#E5EDE7] p-8 shadow-[0_4px_24px_rgba(27,67,50,0.06)] flex flex-col md:flex-row items-center gap-8">
                <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden relative shrink-0 bg-[#F4F4F5] shadow-md">
                  <GlorovImage
                    src={activeDesktopCategory.image}
                    alt={activeDesktopCategory.title}
                    fill
                    sizes="140px"
                    className="object-cover"
                    containerClassName="w-full h-full"
                    fallbackTitle={activeDesktopCategory.title}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FFD51F] text-[#042018] text-[11px] font-black">
                      {activeDesktopCategory.badge}
                    </span>
                    <span className="text-[12px] font-bold text-[#1B4332] bg-[#D8F3DC] px-2.5 py-0.5 rounded-full">
                      {activeDesktopCategory.count} Botanical Varieties
                    </span>
                  </div>
                  <h2 className="font-serif text-[28px] font-extrabold text-[#111827] mt-2 tracking-[-0.4px]">
                    {activeDesktopCategory.title} Collections
                  </h2>
                  <p className="text-[14.5px] text-[#4B5563] leading-[1.5] mt-1.5 max-w-3xl">
                    {activeDesktopCategory.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/categories/${activeDesktopCategory.handle}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4332] text-white hover:bg-[#2D6A4F] text-xs font-bold transition-all shadow-sm"
                    >
                      <span>Shop Entire {activeDesktopCategory.title} Catalog</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Subcategories Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-extrabold text-[#111827]">
                    Curated {activeDesktopCategory.title} Subcategories
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedDesktopGroup('All Categories')}
                    className="text-[13px] font-bold text-[#1B4332] hover:underline flex items-center gap-1"
                  >
                    <span>View All Categories</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeDesktopCategory.subCategories.map((sub) => (
                    <Link
                      key={sub.handle}
                      href={`/categories/${activeDesktopCategory.handle}?subcat=${encodeURIComponent(sub.title)}`}
                      className="bg-white rounded-2xl border border-[#E5EDE7] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex h-[105px] cursor-pointer hover:border-[#1B4332]/40 hover:shadow-md transition-all group"
                    >
                      <div className="w-[120px] h-full relative shrink-0 bg-[#F4F4F5]">
                        <GlorovImage
                          src={sub.image}
                          alt={sub.title}
                          fill
                          sizes="120px"
                          className="object-cover group-hover:scale-108 transition-transform duration-300"
                          containerClassName="w-full h-full"
                          fallbackTitle={sub.title}
                        />
                      </div>
                      <div className="px-4 py-3 flex-1 flex flex-col justify-center">
                        <h4 className="text-[15.5px] font-extrabold text-[#111827] line-clamp-1 group-hover:text-[#1B4332] transition-colors">
                          {sub.title}
                        </h4>
                        <span className="text-[12px] text-[#6B7280] font-medium mt-0.5">
                          {sub.count} curated items
                        </span>
                        <div className="flex items-center gap-1 text-[12px] font-bold text-[#1B4332] mt-2">
                          <span>Browse Collection</span>
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured Launches Section */}
              {activeDesktopCategory.launches.length > 0 && (
                <div>
                  <h3 className="text-[20px] font-extrabold text-[#111827] mt-8 mb-4">
                    Top Botanical Varieties & New Arrivals
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {activeDesktopCategory.launches.map((launch) => {
                      let tagBg = 'bg-[#1B4332] text-white'
                      if (launch.tag === 'SALE IS LIVE') tagBg = 'bg-[#BC4749] text-white'
                      else if (launch.tag === 'NEW LAUNCH') tagBg = 'bg-[#52B788] text-white'

                      return (
                        <Link
                          key={launch.handle}
                          href={`/products/${launch.handle}`}
                          className="bg-white rounded-2xl border border-[#E5EDE7] shadow-sm hover:shadow-md hover:border-[#1B4332]/40 transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
                        >
                          <div className="w-full aspect-[4/3] bg-[#F9FAF8] overflow-hidden relative">
                            <GlorovImage
                              src={launch.image}
                              alt={launch.title}
                              fill
                              sizes="320px"
                              className="object-cover group-hover:scale-108 transition-transform duration-300"
                              containerClassName="w-full h-full"
                              fallbackTitle={launch.title}
                            />
                            <span
                              className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide shadow-xs ${tagBg}`}
                            >
                              {launch.tag}
                            </span>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <h4 className="text-[13px] font-bold text-[#111827] line-clamp-1 group-hover:text-[#1B4332] transition-colors">
                              {launch.title}
                            </h4>
                            {launch.price !== undefined && (
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[14px] font-black text-[#1B4332]">
                                  ₹{launch.price.toFixed(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Seasonal Sowing Spotlight Banner */}
          <section className="bg-gradient-to-r from-[#F9F5EC] to-[#F5ECE0] rounded-3xl border border-[#E2D6C3] p-8 lg:p-10 mt-12 relative overflow-hidden shadow-sm">
            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-[#1B4332] text-white text-[10.5px] font-extrabold tracking-wider uppercase">
                SEASONAL SOWING GUIDE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-[-0.3px]">
                Need Help Choosing What to Plant This Month?
              </h2>
              <p className="text-[14.5px] text-[#556052] leading-relaxed">
                Explore our month-by-month Indian Sowing Calendar designed for Kharif, Rabi, and Zaid cultivation across Indian agro-climatic zones. Get acclimatized varieties calibrated for Indian terrace containers and home gardens.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDesktopGroup('Seeds')}
                  className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>View Indian Sowing Calendar</span>
                </button>
                <Link
                  href="/categories/seeds"
                  className="bg-white hover:bg-[#FAFBF9] text-[#1B4332] border border-[#C5D9CB] px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 active:scale-95 transition-all shadow-xs"
                >
                  <span>Explore Heirloom Seeds</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
