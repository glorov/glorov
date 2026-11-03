'use client'

import React from 'react'
import { BotanicalSpecifications, ProductType } from '@/types/storefront'

export interface BotanicalMetricCardsProps {
  productType?: ProductType
  specs?: BotanicalSpecifications
  badges?: string[]
}

/**
 * GLOROV BotanicalMetricCards
 * Contextual metric cards tailored to botanical seeds, plants, or gardening supplies.
 * Directly mirrors Flutter `GlorovProductDetailsScreen._buildBotanicalMetricCards()`.
 */
export const BotanicalMetricCards: React.FC<BotanicalMetricCardsProps> = ({
  productType = 'seeds',
  specs,
  badges = [],
}) => {
  if (productType === 'plants') {
    return (
      <div className="w-full grid grid-cols-3 gap-2">
        {/* Sunlight */}
        <div className="bg-[#F9FAF8] border border-[#E5E7EB] rounded-[10px] p-2.5 text-center flex flex-col items-center justify-center">
          <svg width={20} height={20} className="w-5 h-5 text-[#D97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#111827] mt-1 line-clamp-1">
            {specs?.sunlightRequirement || 'Bright Indirect'}
          </span>
          <span className="text-[10.5px] font-medium text-[#6B7280]">Sunlight</span>
        </div>

        {/* Watering */}
        <div className="bg-[#F9FAF8] border border-[#E5E7EB] rounded-[10px] p-2.5 text-center flex flex-col items-center justify-center">
          <svg width={20} height={20} className="w-5 h-5 text-[#2563EB] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#111827] mt-1 line-clamp-1">
            {specs?.wateringNeeds || 'Moderate'}
          </span>
          <span className="text-[10.5px] font-medium text-[#6B7280]">Watering</span>
        </div>

        {/* Care Level */}
        <div className="bg-[#F9FAF8] border border-[#E5E7EB] rounded-[10px] p-2.5 text-center flex flex-col items-center justify-center">
          <svg width={20} height={20} className="w-5 h-5 text-[#16A34A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#111827] mt-1 line-clamp-1">
            {specs?.difficultyLevel || 'Easy'}
          </span>
          <span className="text-[10.5px] font-medium text-[#6B7280]">Care Level</span>
        </div>
      </div>
    )
  }

  // Calculate germination percent from badges or default
  const germStat = (() => {
    for (const b of badges) {
      if (b.includes('%')) {
        return b.replace(/GERMINATION/gi, '').trim()
      }
    }
    return '85%+'
  })()

  return (
    <div className="w-full grid grid-cols-3 gap-2">
      {/* Germination */}
      <div className="bg-[#F9FAF8] border border-[#E5E7EB] rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
        <svg width={20} height={20} className="w-5 h-5 text-[#16A34A] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#111827] mt-1 line-clamp-1">
          {germStat}
        </span>
        <span className="text-[10px] sm:text-[10.5px] font-medium text-[#6B7280]">Germination</span>
      </div>

      {/* Sprout Time */}
      <div className="bg-[#F9FAF8] border border-[#E5E7EB] rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
        <svg width={20} height={20} className="w-5 h-5 text-[#D97706] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#111827] mt-1 line-clamp-1">
          {specs?.germinationPeriod || '5 — 8 Days'}
        </span>
        <span className="text-[10px] sm:text-[10.5px] font-medium text-[#6B7280]">Sprout</span>
      </div>

      {/* Maturity / Harvest */}
      <div className="bg-[#F9FAF8] border border-[#E5E7EB] rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center">
        <svg width={20} height={20} className="w-5 h-5 text-[#DC2626] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[12.5px] sm:text-[13px] font-extrabold text-[#111827] mt-1 line-clamp-1">
          {specs?.harvestTime || '65 — 75 Days'}
        </span>
        <span className="text-[10px] sm:text-[10.5px] font-medium text-[#6B7280]">to Maturity</span>
      </div>
    </div>
  )
}
