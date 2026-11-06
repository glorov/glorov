import React from 'react'
import { BotanicalSpecifications } from '@/types/storefront'

export interface BotanicalSpecsTableProps {
  specs?: BotanicalSpecifications
  botanicalName?: string
}

/**
 * GLOROV BotanicalSpecsTable
 * Displays structured growing and care metrics (germination, sowing depth, sunlight, watering, pot size)
 * in an elegant grid designed for gardening transparency.
 */
export const BotanicalSpecsTable: React.FC<BotanicalSpecsTableProps> = ({
  specs,
  botanicalName,
}) => {
  if (!specs) return null

  const specItems = [
    {
      label: 'Germination',
      value: specs.germinationPeriod,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Sowing Depth',
      value: specs.sowingDepth,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
    {
      label: 'Season',
      value: specs.plantingSeason,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Harvest Time',
      value: specs.harvestTime,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Sunlight',
      value: specs.sunlightRequirement,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.14-0.01l-1.41 1.41M6.34 17.66l-1.41 1.41M12 6a6 6 0 100 12 6 6 0 000-12z" />
        </svg>
      ),
    },
    {
      label: 'Watering',
      value: specs.wateringNeeds,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: 'Difficulty',
      value: specs.difficultyLevel,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pot Size',
      value: specs.potSize,
      icon: (
        <svg width={20} height={20} className="w-5 h-5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
  ].filter((item) => Boolean(item.value))

  if (specItems.length === 0) return null

  return (
    <div className="w-full my-8 p-6 rounded-2xl bg-white border border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Botanical Growing & Care Guide
          </h2>
          {botanicalName && (
            <p className="text-xs text-stone-500 italic font-serif">
              Scientific Classification: {botanicalName}
            </p>
          )}
        </div>
        <span className="self-start sm:self-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
          Glorov Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {specItems.map((spec) => (
          <div
            key={spec.label}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/60"
          >
            <div className="p-2 rounded-lg bg-emerald-50 flex-shrink-0">
              {spec.icon}
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                {spec.label}
              </span>
              <p className="text-xs font-semibold text-stone-900 mt-0.5 leading-snug">
                {spec.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {specs.packContents && (
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-600">
          <span className="font-semibold text-stone-800">Package Contents:</span>
          <span>{specs.packContents}</span>
        </div>
      )}
    </div>
  )
}
