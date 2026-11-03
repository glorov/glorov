import React from 'react'
import Link from 'next/link'
import { GlorovImage } from '../ui/GlorovImage'
import { MOCK_CATEGORY_DETAILS } from '../../lib/mock-data'
import { cn } from '../../lib/utils/cn'

export interface CategoryDiscoveryGridProps {
  className?: string
}

/**
 * GLOROV Category Discovery Component
 * Direct 1:1 migration of Flutter `GlorovCategoryDiscovery`:
 * - Curated for Growers section header with "View All" link
 * - Direct Category Touch Pill Filter Row (For You, Seeds, Live Plants, Planters & Pots, Plant Care & Soil)
 * - Immersive full-bleed 4-category grid (2x2 on mobile, 4 across on desktop)
 * - High readability bottom gradient with category title, description & item count badges
 */
export function CategoryDiscoveryGrid({ className }: CategoryDiscoveryGridProps) {
  return (
    <section className={cn('w-full bg-white py-4 sm:py-6 lg:py-8 select-none', className)}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* 1. Section Header Row */}
        <div className="flex items-end justify-between gap-2 mb-2.5 sm:mb-3">
          <div>
            <span className="block text-[10.5px] font-bold tracking-[0.8px] text-[#52B788] uppercase">
              CURATED FOR GROWERS
            </span>
            <h2 className="font-serif text-[19px] sm:text-[22px] lg:text-[24px] font-extrabold text-[#111827] tracking-[-0.3px] mt-0.5 leading-tight">
              Explore by Category
            </h2>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#1B4332] hover:text-[#2D6A4F] transition-colors py-1 px-2 group shrink-0"
          >
            <span>View All</span>
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 2. Direct Category Touch Pill Filter Row */}
        <div
          role="region"
          aria-label="Quick Category Filters"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Special 'For You' Pill */}
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.25 px-2.5 py-1 rounded-[16px] bg-[#EFF6FF] border border-[#BFDBFE] text-[11.5px] font-extrabold text-[#1D4ED8] hover:bg-[#DBEAFE] active:scale-95 transition-all shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-[#2563EB]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
            </svg>
            <span>For You</span>
          </Link>

          {/* Seeds Pill */}
          <Link
            href="/categories/seeds"
            className="inline-flex items-center gap-1.25 px-2.5 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            <span>Seeds</span>
          </Link>

          {/* Live Plants Pill */}
          <Link
            href="/categories/live-plants"
            className="inline-flex items-center gap-1.25 px-2.5 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-1.5 3-4.5 5-7 5 0 3 1.5 6 4 7 0 3 2 6 3 6s3-3 3-6c2.5-1 4-4 4-7-2.5 0-5.5-2-7-5z" />
            </svg>
            <span>Live Plants</span>
          </Link>

          {/* Planters & Pots Pill */}
          <Link
            href="/categories/planters"
            className="inline-flex items-center gap-1.25 px-2.5 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Planters &amp; Pots</span>
          </Link>

          {/* Plant Care & Soil Pill */}
          <Link
            href="/categories/plant-care"
            className="inline-flex items-center gap-1.25 px-2.5 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.64 10.6 20 12 20c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm0 15c-1.07 0-2.09-.28-2.98-.78l3.69-3.69c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-3.69 3.69C7.28 14.09 7 13.07 7 12c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5z" />
            </svg>
            <span>Plant Care &amp; Soil</span>
          </Link>
        </div>

        {/* 3. Responsive 4-Category Grid (Clean 2x2 on Mobile, 4 across on Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {MOCK_CATEGORY_DETAILS.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-[14px] overflow-hidden border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-[#1B4332]/40 transition-all duration-300 block aspect-[1/1.05] sm:aspect-square md:aspect-[1/0.95] bg-[#F4F4F5]"
            >
              {/* Full-bleed Category Image with Shimmer & Smooth Fade */}
              <GlorovImage
                src={cat.imageUrl}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                containerClassName="w-full h-full"
                fallbackTitle={cat.title}
              />

              {/* High-Readability Bottom Gradient Overlay matching Flutter */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/35 to-black/85 pointer-events-none" />

              {/* Optional Top-Left Badge (e.g. 98% Germination / High Germination) */}
              {cat.badge && (
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/45 text-white/95 text-[9px] font-bold tracking-wide backdrop-blur-xs shadow-2xs">
                  {cat.badge}
                </span>
              )}

              {/* Item Count Pill at Top Right */}
              <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-white/92 text-[#1B4332] text-[9.5px] font-extrabold backdrop-blur-xs shadow-2xs">
                {cat.productCount} items
              </span>

              {/* Category Title & Description at Bottom */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
                <h3 className="font-sans font-extrabold text-[14.5px] text-white tracking-[-0.2px] truncate leading-tight drop-shadow-xs">
                  {cat.title}
                </h3>
                <p className="text-[10.5px] font-medium text-white/90 truncate leading-snug mt-0.5 drop-shadow-xs">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
