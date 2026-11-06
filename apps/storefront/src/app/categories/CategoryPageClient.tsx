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

export function CategoryPageClient({
  initialCategoryHandle,
}: CategoryPageClientProps) {
  const router = useRouter()
  const { cartCount } = useCart()

  // Mobile selected category index in GLOROV_BOTANICAL_CATEGORIES (0 = For You)
  const initialIndex = useMemo(() => {
    if (!initialCategoryHandle) return 0
    const idx = GLOROV_BOTANICAL_CATEGORIES.findIndex(
      (c) => c.handle === initialCategoryHandle
    )
    return idx !== -1 ? idx : 0
  }, [initialCategoryHandle])

  const [selectedMobileIndex, setSelectedMobileIndex] = useState<number>(initialIndex)

  // Desktop search & tab filters
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('')
  const [selectedDesktopGroup, setSelectedDesktopGroup] = useState<string>(() => {
    if (!initialCategoryHandle || initialCategoryHandle === 'for-you') return 'All Categories'
    const match = GLOROV_BOTANICAL_CATEGORIES.find((c) => c.handle === initialCategoryHandle)
    return match ? match.title : 'All Categories'
  })

  // Mobile active category
  const activeMobileCategory = GLOROV_BOTANICAL_CATEGORIES[selectedMobileIndex] || GLOROV_BOTANICAL_CATEGORIES[0]
  const isForYouMobile = activeMobileCategory.handle === 'for-you'

  // Desktop categories (exclude "for-you")
  const filteredDesktopCategories = useMemo(() => {
    let list = GLOROV_BOTANICAL_CATEGORIES.filter((c) => c.handle !== 'for-you')

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
  }, [selectedDesktopGroup, desktopSearchQuery])

  // Desktop selected category for single showcase view
  const activeDesktopCategory = useMemo(() => {
    if (selectedDesktopGroup === 'All Categories') return null
    return (
      GLOROV_BOTANICAL_CATEGORIES.find((c) => c.title === selectedDesktopGroup) ||
      GLOROV_BOTANICAL_CATEGORIES[1]
    )
  }, [selectedDesktopGroup])

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
          1. MOBILE DUAL-COLUMN CATEGORY BROWSER (< 800px / cat-desktop:hidden)
          100% exact match with Flutter `_buildMobileDualColumnLayout`
          ========================================================================= */}
      <div className="cat-desktop:hidden flex flex-col w-full h-full bg-white overflow-hidden select-none">
        {/* Mobile Top App Bar */}
        <header className="h-14 min-h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-1 z-20">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Back to home"
              className="w-12 h-14 flex items-center justify-center text-[#111827] active:bg-[#F3F4F1] transition-colors"
            >
              <svg className="w-6 h-6 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-[18px] font-extrabold text-[#111827] tracking-[-0.2px] leading-tight ml-2">
              All Categories
            </h1>
          </div>

          <div className="flex items-center pr-1">
            <Link
              href="/search"
              aria-label="Search collection"
              className="w-11 h-14 flex items-center justify-center text-[#111827] active:bg-[#F3F4F1] transition-colors"
            >
              <svg className="w-6 h-6 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="w-11 h-14 flex items-center justify-center text-[#111827] active:bg-[#F3F4F1] transition-colors relative"
            >
              <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 8.5h13l1.2 12.2a2 2 0 0 1-2 2.3H6.3a2 2 0 0 1-2-2.3L5.5 8.5z" />
                <path d="M9.5 12.5a2.5 2.5 0 0 0 5 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-2 right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#1B4332] text-white text-[8.5px] font-extrabold flex items-center justify-center border-[1.2px] border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Dual-Column Split Body */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Left Category Navigation Rail (88px) */}
          <nav
            aria-label="Botanical Category Rail"
            className="w-[88px] min-w-[88px] max-w-[88px] bg-[#F8FAF9] border-r border-[#E5E7EB] overflow-y-auto overflow-x-hidden py-1 scrollbar-none"
          >
            {GLOROV_BOTANICAL_CATEGORIES.map((cat, idx) => {
              const isSelected = idx === selectedMobileIndex
              const isForYou = cat.handle === 'for-you'

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedMobileIndex(idx)}
                  className={`w-full py-[11px] px-1 relative flex flex-col items-center justify-center transition-all ${
                    isSelected ? 'bg-white' : 'bg-transparent hover:bg-black/[0.02]'
                  }`}
                >
                  {/* Active Left Vertical Indicator Bar */}
                  {isSelected && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3.8px] bg-[#1B4332] rounded-r-[3px]" />
                  )}

                  {/* Thumbnail Container */}
                  <div
                    className={`w-12 h-12 rounded-[14px] flex items-center justify-center overflow-hidden transition-colors ${
                      isForYou
                        ? isSelected
                          ? 'bg-[#D8F3DC] border-[1.8px] border-[#1B4332]'
                          : 'bg-[#E8F5E9] border border-[#E5E7EB]'
                        : isSelected
                          ? 'border-[1.8px] border-[#1B4332] bg-white'
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

          {/* Right Scrollable Subcategory & Launch Content Area */}
          <main
            key={activeMobileCategory.handle}
            className="flex-1 bg-white overflow-y-auto overflow-x-hidden px-3.5 py-4 animate-in fade-in slide-in-from-bottom-1 duration-200"
          >
            {/* Section 1: Collections Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-extrabold text-[#111827] tracking-[-0.2px] leading-tight">
                {isForYouMobile ? 'Popular Collections' : `${activeMobileCategory.title} Collections`}
              </h2>
              <span className="text-[11px] font-semibold text-[#6B7280]">
                {activeMobileCategory.subCategories.length} Collections
              </span>
            </div>

            {/* 3-Column Subcategories Grid */}
            <div className="grid grid-cols-3 gap-x-2.5 gap-y-3">
              {activeMobileCategory.subCategories.map((sub) => (
                <Link
                  key={sub.handle}
                  href={`/categories/${activeMobileCategory.handle}?subcat=${encodeURIComponent(sub.title)}`}
                  className="flex flex-col items-center text-center group active:scale-95 transition-transform"
                >
                  <div className="w-full aspect-square rounded-[14px] bg-[#F9FAF8] border border-[#ECEEEB] overflow-hidden relative">
                    <GlorovImage
                      src={sub.image}
                      alt={sub.title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      containerClassName="w-full h-full"
                      fallbackTitle={sub.title}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#1F2937] leading-[1.25] text-center mt-1.5 line-clamp-2">
                    {sub.title}
                  </span>
                </Link>
              ))}
            </div>

            {/* Section 2: Top Seeded Varieties / Launches Header */}
            {activeMobileCategory.launches.length > 0 && (
              <>
                <div className="mt-6 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#BC4749] fill-current" viewBox="0 0 24 24">
                    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                  </svg>
                  <h2 className="text-[15px] font-extrabold text-[#111827] tracking-[-0.2px] leading-tight">
                    {isForYouMobile ? 'New & Upcoming Launches' : 'Top Seeded Varieties'}
                  </h2>
                </div>

                {/* 3-Column Launches Grid */}
                <div className="grid grid-cols-3 gap-x-2.5 gap-y-3.5">
                  {activeMobileCategory.launches.map((launch) => {
                    let tagBg = 'bg-[#1B4332]'
                    if (launch.tag === 'SALE IS LIVE') tagBg = 'bg-[#BC4749]'
                    else if (launch.tag === 'NEW LAUNCH') tagBg = 'bg-[#52B788]'

                    return (
                      <Link
                        key={launch.handle}
                        href={`/products/${launch.handle}`}
                        className="flex flex-col items-center text-center group active:scale-95 transition-transform"
                      >
                        <div className="w-full aspect-square rounded-[14px] bg-[#F9FAF8] border border-[#ECEEEB] overflow-hidden relative">
                          <GlorovImage
                            src={launch.image}
                            alt={launch.title}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            containerClassName="w-full h-full"
                            fallbackTitle={launch.title}
                          />
                          <span
                            className={`absolute inset-x-0 bottom-0 py-[2.5px] rounded-b-[13px] text-center text-white text-[9px] font-extrabold tracking-[0.3px] uppercase ${tagBg}`}
                          >
                            {launch.tag}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-[#1F2937] leading-[1.2] text-center mt-1.5 line-clamp-2">
                          {launch.title}
                        </span>

                        {launch.price !== undefined && (
                          <span className="text-[11.5px] font-extrabold text-[#1B4332] text-center mt-0.5">
                            ₹{launch.price.toFixed(0)}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </>
            )}

            <div className="h-8" />
          </main>
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP VIEWPORT (>= 800px / hidden cat-desktop:block)
          100% exact match with Flutter `_buildDesktopLayout`
          ========================================================================= */}
      <div className="hidden cat-desktop:block w-full bg-[#F9FAF8] pb-16">
        {/* Desktop Hero Banner Header */}
        <section className="w-full bg-gradient-to-br from-[#042018] via-[#0A3729] to-[#144D3A] text-white px-12 py-12 border-b border-white/10">
          <div className="max-w-[1200px] mx-auto">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1 text-white/70 hover:text-white text-[13px] font-semibold pb-3 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>

            {/* Pill Badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4E79E]/[0.18] border border-[#D4E79E]/[0.35] text-[#D4E79E] text-[11px] font-bold tracking-[0.8px] uppercase">
                <svg className="w-3.5 h-3.5 text-[#D4E79E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
                <span>PUNE CENTRAL NURSERY DIRECTORY</span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-white font-extrabold text-[36px] leading-[1.2] tracking-[-0.5px] mt-4">
              Explore Botanical Categories
            </h1>

            {/* Description */}
            <p className="text-white/85 text-[16px] max-w-[720px] mt-2 leading-[1.5] font-normal">
              Browse acclimatized live indoor houseplants, germination-tested Desi heirloom seeds, fresh vegetable varieties, vibrant flowering plants, and aromatic kitchen herbs.
            </p>

            {/* Stat Chips */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6">
              <div className="px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white text-[12px] font-medium flex items-center gap-1.25">
                <svg className="w-3.5 h-3.5 text-[#D4E79E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                <span>100+ Verified Seeded Varieties</span>
              </div>

              <div className="px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white text-[12px] font-medium flex items-center gap-1.25">
                <svg className="w-3.5 h-3.5 text-[#D4E79E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H1v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                <span>Pan-India Transit Safe</span>
              </div>

              <div className="px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white text-[12px] font-medium flex items-center gap-1.25">
                <svg className="w-3.5 h-3.5 text-[#D4E79E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                </svg>
                <span>7-Day Live Replacement</span>
              </div>

              <div className="px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-white text-[12px] font-medium flex items-center gap-1.25">
                <svg className="w-3.5 h-3.5 text-[#D4E79E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 2H6c-1.2 0-2 .8-2 2v16c0 1.2.8 2 2 2h13c1.2 0 2-.8 2-2V4c0-1.2-.8-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
                <span>Free Care Guide Included</span>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Content Container */}
        <div className="max-w-[1280px] mx-auto px-8 py-6 space-y-6">
          {/* Desktop Search Box */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] flex items-center px-4 py-3 gap-3">
            <svg className="w-5 h-5 text-[#1B4332] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={desktopSearchQuery}
              onChange={(e) => setDesktopSearchQuery(e.target.value)}
              placeholder="Search categories, seeds, houseplants, vegetables..."
              className="flex-1 text-[15px] text-[#111827] placeholder:text-[#6B7280] focus:outline-none bg-transparent"
            />
            {desktopSearchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setDesktopSearchQuery('')}
                aria-label="Clear search"
                className="text-[#9CA3AF] hover:text-[#111827]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Desktop Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {desktopTabs.map((tab) => {
              const isSelected = selectedDesktopGroup === tab.label
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setSelectedDesktopGroup(tab.label)}
                  className={`px-3.5 py-2 rounded-full border text-[13px] flex items-center gap-2 transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#1B4332] text-white font-bold border-[#1B4332]'
                      : 'bg-white text-[#111827] hover:bg-[#F9FAF8] font-semibold border-[#E5E7EB]'
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

          {/* Desktop Content Switcher: All Categories 3-Col Grid OR Single Category Showcase */}
          {selectedDesktopGroup === 'All Categories' ? (
            <div className="grid grid-cols-3 gap-6 mt-6">
              {filteredDesktopCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedDesktopGroup(cat.title)}
                  className="bg-white rounded-[20px] border border-[#E5E7EB] hover:border-[#1B4332]/50 transition-colors overflow-hidden flex flex-col justify-between group cursor-pointer aspect-[0.74]"
                >
                  {/* 16:9 Image with Overlaid Badges */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#F3F4F1]">
                    <GlorovImage
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      containerClassName="w-full h-full"
                      fallbackTitle={cat.title}
                    />
                    {/* Yellow Top-Left Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FFD51F] text-[#042018] text-[11px] font-extrabold">
                      {cat.badge}
                    </span>
                    {/* Top-Right Varieties Badge */}
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/75 text-white text-[11px] font-semibold">
                      {cat.count} Varieties
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-[18px] font-extrabold text-[#111827] line-clamp-1">
                        {cat.title}
                      </h2>
                      <p className="text-[13px] text-[#6B7280] leading-[1.4] mt-1 line-clamp-2">
                        {cat.description}
                      </p>

                      {/* Subcategory Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {cat.subCategories.slice(0, 3).map((sub) => (
                          <span
                            key={sub.handle}
                            className="px-2 py-0.5 rounded-full bg-[#F3F4F1] border border-[#E5E7EB] text-[11px] text-[#1B4332] font-semibold"
                          >
                            {sub.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F3F4F6]">
                      <span className="text-[13px] font-bold text-[#1B4332]">
                        Explore Collection
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#FFF3D9] flex items-center justify-center text-[#1B4332] group-hover:translate-x-0.5 transition-transform">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeDesktopCategory ? (
            /* Single Category Showcase */
            <div className="space-y-8 pt-2">
              {/* Category Spotlight Hero Card */}
              <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 flex items-center gap-8">
                <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden relative shrink-0 bg-[#F3F4F1]">
                  <GlorovImage
                    src={activeDesktopCategory.image}
                    alt={activeDesktopCategory.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                    containerClassName="w-full h-full"
                    fallbackTitle={activeDesktopCategory.title}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#D8F3DC] text-[#1B4332] text-[11px] font-extrabold">
                      {activeDesktopCategory.badge}
                    </span>
                    <span className="text-[12px] font-semibold text-[#6B7280]">
                      {activeDesktopCategory.count} Botanical Varieties
                    </span>
                  </div>
                  <h2 className="font-serif text-[26px] font-extrabold text-[#111827] mt-2 tracking-[-0.4px]">
                    {activeDesktopCategory.title}
                  </h2>
                  <p className="text-[14px] text-[#4B5563] leading-[1.4] mt-1.5 max-w-3xl">
                    {activeDesktopCategory.description}
                  </p>
                </div>
              </div>

              {/* Subcategories Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-extrabold text-[#111827]">
                    {activeDesktopCategory.title} Collections
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedDesktopGroup('All Categories')}
                    className="text-[13px] font-bold text-[#1B4332] hover:underline flex items-center gap-1"
                  >
                    <span>View All in Catalog</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDesktopCategory.subCategories.map((sub) => (
                    <Link
                      key={sub.handle}
                      href={`/categories/${activeDesktopCategory.handle}?subcat=${encodeURIComponent(sub.title)}`}
                      className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden flex h-[100px] cursor-pointer hover:border-[#1B4332]/40 transition-colors group"
                    >
                      <div className="w-[120px] h-full relative shrink-0 bg-[#F3F4F1]">
                        <GlorovImage
                          src={sub.image}
                          alt={sub.title}
                          fill
                          sizes="120px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          containerClassName="w-full h-full"
                          fallbackTitle={sub.title}
                        />
                      </div>
                      <div className="px-4 py-3 flex-1 flex flex-col justify-center">
                        <h4 className="text-[15.5px] font-extrabold text-[#111827] line-clamp-1">
                          {sub.title}
                        </h4>
                        <span className="text-[12.5px] text-[#6B7280] font-medium mt-0.5">
                          {sub.count} curated varieties
                        </span>
                        <div className="flex items-center gap-1 text-[12px] font-bold text-[#1B4332] mt-2">
                          <span>Explore Collection</span>
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
                  <h3 className="text-[18px] font-extrabold text-[#111827] mt-8 mb-4">
                    Featured Varieties & Launches
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeDesktopCategory.launches.map((launch) => {
                      let tagBg = 'bg-[#1B4332]'
                      if (launch.tag === 'SALE IS LIVE') tagBg = 'bg-[#BC4749]'
                      else if (launch.tag === 'NEW LAUNCH') tagBg = 'bg-[#52B788]'

                      return (
                        <Link
                          key={launch.handle}
                          href={`/products/${launch.handle}`}
                          className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden flex flex-col justify-between cursor-pointer hover:border-[#1B4332]/50 transition-colors group"
                        >
                          <div className="w-full aspect-[1.15] bg-[#F9FAF8] overflow-hidden relative">
                            <GlorovImage
                              src={launch.image}
                              alt={launch.title}
                              fill
                              sizes="320px"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                              containerClassName="w-full h-full"
                              fallbackTitle={launch.title}
                            />
                            <span
                              className={`absolute top-2 left-2 px-2 py-0.5 rounded-[6px] text-center text-white text-[9.5px] font-extrabold tracking-[0.2px] uppercase ${tagBg}`}
                            >
                              {launch.tag}
                            </span>
                          </div>

                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <h4 className="text-[13px] font-bold text-[#111827] line-clamp-1">
                              {launch.title}
                            </h4>
                            {launch.price !== undefined && (
                              <span className="text-[13.5px] font-extrabold text-[#1B4332] mt-1">
                                ₹{launch.price.toFixed(0)}
                              </span>
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
          <section className="bg-[#F9F5EC] rounded-2xl border border-[#E2D6C3] p-6 lg:p-8 mt-10 space-y-3">
            <span className="inline-block px-2.5 py-1 rounded-full bg-[#1B4332] text-white text-[10.5px] font-extrabold tracking-wider uppercase">
              SEASONAL SOWING GUIDE
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#111827]">
              Need Help Choosing What to Plant This Month?
            </h2>
            <p className="text-[13.5px] text-[#6B7280] max-w-3xl leading-relaxed">
              Explore our month-by-month Indian Sowing Calendar designed for Kharif, Rabi, and Zaid cultivation across Indian agro-climatic zones.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedDesktopGroup('Seeds')}
                className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 active:scale-95 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>View Indian Sowing Calendar</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
