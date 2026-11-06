import React from 'react'
import Link from 'next/link'
import { GlorovImage } from '../ui/GlorovImage'
import { MOCK_CATEGORY_DETAILS } from '../../lib/mock-data'
import {
  GlorovAllIcon,
  GlorovSeedIcon,
  GlorovVegetableIcon,
  GlorovLivePlantIcon,
  GlorovFlowerIcon,
  GlorovHerbIcon,
} from '../common/GlorovIcons'
import { cn } from '../../lib/utils/cn'

export interface CategoryDiscoveryGridProps {
  className?: string
}

/**
 * GLOROV Category Discovery Component
 * Curated botanical collections:
 * - Direct Category Touch Pill Filter Row (For You, Seeds, Vegetables, Living Plants, Flowers, Herbs)
 * - Immersive full-bleed category grid with high readability bottom gradient
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] bg-[#EFF6FF] border border-[#BFDBFE] text-[11.5px] font-extrabold text-[#1D4ED8] hover:bg-[#DBEAFE] active:scale-95 transition-all shrink-0"
          >
            <GlorovAllIcon size={14} className="text-[#2563EB]" />
            <span>For You</span>
          </Link>

          {/* Seeds Pill */}
          <Link
            href="/categories/seeds"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <GlorovSeedIcon size={14} className="text-[#1B4332]" />
            <span>Seeds</span>
          </Link>

          {/* Vegetables Pill */}
          <Link
            href="/categories/vegetables"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <GlorovVegetableIcon size={14} className="text-[#1B4332]" />
            <span>Vegetables</span>
          </Link>

          {/* Living Plants Pill */}
          <Link
            href="/categories/live-plants"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <GlorovLivePlantIcon size={14} className="text-[#1B4332]" />
            <span>Living Plants</span>
          </Link>

          {/* Flowers Pill */}
          <Link
            href="/categories/flowers"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <GlorovFlowerIcon size={14} className="text-[#1B4332]" />
            <span>Flowers</span>
          </Link>

          {/* Herbs Pill */}
          <Link
            href="/categories/herbs"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-[11.5px] font-semibold text-[#111827] hover:border-[#1B4332]/40 hover:bg-white active:scale-95 transition-all shrink-0"
          >
            <GlorovHerbIcon size={14} className="text-[#1B4332]" />
            <span>Herbs</span>
          </Link>
        </div>

        {/* 3. Responsive Category Grid (Clean on Mobile, 5 across on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {MOCK_CATEGORY_DETAILS.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-[14px] overflow-hidden border border-[#E5E7EB] hover:border-[#1B4332]/50 transition-colors duration-200 block aspect-[1/1.08] sm:aspect-square bg-[#F4F4F5]"
            >
              {/* Full-bleed Category Image with Shimmer & Smooth Fade */}
              <GlorovImage
                src={cat.imageUrl}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                containerClassName="w-full h-full"
                fallbackTitle={cat.title}
              />

              {/* High-Readability Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/35 to-black/85 pointer-events-none" />

              {/* Optional Top-Left Badge */}
              {cat.badge && (
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/65 text-white text-[9px] font-bold tracking-wide">
                  {cat.badge}
                </span>
              )}

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 text-white flex flex-col justify-end">
                <span className="text-[10px] font-semibold text-[#86EFAC] uppercase tracking-wider mb-0.5">
                  {cat.productCount} Items
                </span>
                <h3 className="font-serif text-[15px] sm:text-[16px] font-bold leading-tight group-hover:text-[#86EFAC] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5 leading-snug hidden sm:block">
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
