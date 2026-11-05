'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageContainer } from '../layout/PageContainer'
import { ProductCard } from '../product/ProductCard'
import { MOCK_PRODUCTS } from '../../lib/mock-data'
import type { GlorovProductItem } from '../../types/storefront'
import { cn } from '../../lib/utils/cn'

const CURATED_FEATURED_SLUGS = [
  'brinjal-banarshi-giant-seeds',
  'chinese-cabbage-seeds',
  'green-onion-seeds-leek',
  'drumstick-seeds-moringa',
  'watermelon-seeds',
  'white-cucumber-seeds-khira',
  'petunia-mix-seeds',
  'dahlia-seeds',
  'green-chilli-seeds',
  'anthurium-red-plant',
  'marigold-african-double-seeds',
  'money-plant-golden',
  'peace-lily-plant',
  'jade-plant-mini',
  'cosmos-mix-seeds',
  'aglaonema-pink-beauty-plant',
]

export interface FeaturedProductsSectionProps {
  className?: string
  initialProducts?: GlorovProductItem[]
  limit?: number
}

/**
 * FeaturedProductsSection
 * Displays 16 botanical products at a time with instant category filter tabs.
 * Mirrors Flutter `GlorovFeaturedProducts`:
 * - Curated selection of 16 hand-picked items (Seeds, Live Plants, Flowering, Planters)
 * - Zero double-fetch: hydrates synchronously from initialProducts passed from the server
 * - Instant zero-latency filter tabs: All Featured (16), Live Plants (16), Heirloom Seeds (16)
 * - Botanical specimen counter chip with direct catalog navigation
 */
export function FeaturedProductsSection({
  className,
  initialProducts,
  limit = 16,
}: FeaturedProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'plants' | 'seeds'>('all')

  // Source of truth: Server-preloaded initialProducts or local botanical catalog
  const productSource = useMemo(() => {
    return initialProducts && initialProducts.length > 0 ? initialProducts : MOCK_PRODUCTS
  }, [initialProducts])

  // Instant synchronous filtering matching Flutter _getCuratedProducts()
  const filteredProducts = useMemo(() => {
    if (activeTab === 'plants') {
      const plants = productSource.filter(
        (product) =>
          product.category.toLowerCase().includes('plant') ||
          product.productType === 'plants'
      )
      return plants.slice(0, limit)
    }

    if (activeTab === 'seeds') {
      const seeds = productSource.filter(
        (product) =>
          product.category.toLowerCase().includes('seed') ||
          product.productType === 'seeds'
      )
      return seeds.slice(0, limit)
    }

    // Default 'all': Curated botanical showcase prioritizing the 16 featured slugs
    const curated = CURATED_FEATURED_SLUGS.map((slug) =>
      productSource.find((p) => p.slug === slug)
    ).filter(Boolean) as GlorovProductItem[]

    if (curated.length >= limit) {
      return curated.slice(0, limit)
    }

    // Fill remainder from productSource if fewer than 16 curated matches
    const curatedIds = new Set(curated.map((p) => p.id))
    const remainder = productSource.filter((p) => !curatedIds.has(p.id))
    return [...curated, ...remainder].slice(0, limit)
  }, [activeTab, productSource, limit])

  return (
    <section className={cn('w-full bg-[#F9FAF8] py-8 sm:py-12 border-t border-[#E5E7EB]', className)}>
      <PageContainer>
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#52B788]">
              HANDPICKED FOR YOUR GARDEN
            </span>
            <h2 className="font-serif text-[22px] sm:text-[26px] lg:text-[28px] font-extrabold text-[#111827] tracking-tight mt-0.5">
              Featured Seeds &amp; Plants
            </h2>
          </div>

          <Link
            href="/categories"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4332] hover:text-[#2D6A4F] transition-colors py-1"
          >
            <span>View Full Catalog</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Interactive Filter Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-6 sm:mb-8 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all border shrink-0',
              activeTab === 'all'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            )}
          >
            {activeTab === 'all' && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>All Featured (16)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plants')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all border shrink-0',
              activeTab === 'plants'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            )}
          >
            {activeTab === 'plants' && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>Live Plants (16)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seeds')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all border shrink-0',
              activeTab === 'seeds'
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            )}
          >
            {activeTab === 'seeds' && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>Heirloom Seeds (16)</span>
          </button>
        </div>

        {/* Product Cards Grid — 16 items rendered cleanly across responsive breakpoints */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-2.5 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Specimen Counter Pill matching Flutter */}
        <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E8F5E9] text-[#1B4332] text-sm shrink-0">
              🌱
            </span>
            <span className="text-[12.5px] sm:text-[13px] font-semibold text-[#374151]">
              Showing <span className="font-bold text-[#1B4332]">{filteredProducts.length}</span> hand-picked botanicals of 60+ specimens
            </span>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 shrink-0"
          >
            <span>Explore Full Catalog (60+)</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </PageContainer>
    </section>
  )
}
