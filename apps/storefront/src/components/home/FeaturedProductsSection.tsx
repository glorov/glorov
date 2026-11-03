'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { PageContainer } from '../layout/PageContainer'
import { ProductCard } from '../product/ProductCard'
import { MOCK_PRODUCTS } from '../../lib/mock-data'
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
]

export function FeaturedProductsSection({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'all' | 'plants' | 'seeds'>('all')

  const filteredProducts = React.useMemo(() => {
    if (activeTab === 'all') {
      const curated = CURATED_FEATURED_SLUGS.map((slug) =>
        MOCK_PRODUCTS.find((p) => p.slug === slug)
      ).filter(Boolean) as typeof MOCK_PRODUCTS
      return curated.length > 0 ? curated : MOCK_PRODUCTS.slice(0, 8)
    }
    if (activeTab === 'plants') {
      return MOCK_PRODUCTS.filter((product) =>
        product.category.toLowerCase().includes('plant') ||
        product.productType === 'plants'
      ).slice(0, 8)
    }
    if (activeTab === 'seeds') {
      return MOCK_PRODUCTS.filter((product) =>
        product.category.toLowerCase().includes('seed') ||
        product.productType === 'seeds'
      ).slice(0, 8)
    }
    return MOCK_PRODUCTS.slice(0, 8)
  }, [activeTab])

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
            <span>All Featured</span>
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
            <span>Live Plants</span>
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
            <span>Heirloom Seeds</span>
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-2.5 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom Catalog Discovery Link */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#F3F4F6] text-[#1B4332] font-bold text-xs uppercase tracking-wider border border-[#1B4332]/30 shadow-sm transition-all active:scale-95"
          >
            <span>Explore Entire Botanical Nursery</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </PageContainer>
    </section>
  )
}
