'use client'

import React from 'react'

/**
 * GLOROV BotanicalStoryBanner
 * Editorial Brand Story banner matching Flutter `_buildBotanicalStoryBanner()`.
 */
export const BotanicalStoryBanner: React.FC = () => {
  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#F4F6F0] border border-[#E2E8DD] select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0">
          <svg width={16} height={16} className="w-4 h-4 text-[#D8F3DC] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="font-serif italic font-bold text-base sm:text-[17px] text-[#1B4332]">
          From a seed...
        </h3>
      </div>

      <p className="mt-2.5 text-xs sm:text-[13px] text-[#374151] leading-relaxed">
        A tiny seed, your own hands, a little patience, and it becomes something you can eat, smell, or simply admire. A small ritual in your space that grows into something much more.
      </p>

      <p className="mt-2 text-xs sm:text-[12.5px] font-semibold text-[#1E293B]">
        Your harvest, your hands care. No chemicals, clean veggies, fruits, or blooms.
      </p>
    </div>
  )
}
