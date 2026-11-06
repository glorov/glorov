'use client'

import React, { useState } from 'react'

const GROWING_STAGES = [
  {
    name: 'Germination',
    desc: 'Sow seeds 1/4 inch deep in seed-starter coco peat mix. Keep moist with gentle daily misting. Germination starts within 3-5 days at 20-28°C.',
  },
  {
    name: 'Transplanting',
    desc: 'Once seedlings develop 2-3 sets of true leaves, gently transplant them into individual 6-inch planters or seedling trays with organic compost.',
  },
  {
    name: 'Growing',
    desc: 'Provide 6+ hours of direct morning sunlight. Water weekly or when the top 1 inch of soil feels dry to the touch.',
  },
  {
    name: 'Aftercare',
    desc: 'Pinch terminal shoots once to encourage lateral branching and thicker foliage. Feed with seaweed liquid fertilizer every 15 days.',
  },
  {
    name: 'Harvesting',
    desc: 'Expect continuous flowering or fruiting from day 65 to 90. Deadhead spent blooms or harvest fresh pods regularly to promote continuous fresh cycles.',
  },
]

/**
 * GLOROV BotanicalLifecycleTabs
 * Interactive growing lifecycle stages matching Flutter `_buildBotanicalLifecycleTabs()`.
 */
export const BotanicalLifecycleTabs: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const currentStage = GROWING_STAGES[selectedIndex]

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Tab Pills */}
      <div className="w-full flex items-center gap-2 overflow-x-auto py-1 scrollbar-none no-scrollbar">
        {GROWING_STAGES.map((stage, idx) => {
          const isSelected = idx === selectedIndex

          return (
            <button
              key={stage.name}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors active:scale-95 ${
                isSelected
                  ? 'bg-[#1B4332] text-white'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
              }`}
            >
              {stage.name}
            </button>
          )
        })}
      </div>

      {/* Stage Description Card */}
      <div className="w-full p-4 rounded-2xl bg-white border border-[#E5E7EB]">
        <div className="text-sm font-bold text-[#1B4332]">
          Stage {selectedIndex + 1}: {currentStage.name}
        </div>

        <p className="mt-1.5 text-xs text-[#374151] leading-relaxed">
          {currentStage.desc}
        </p>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white border border-[#D1D5DB] text-[11px] font-bold text-[#1E293B] flex items-center gap-1">
            🌱 Non-GMO Certified
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-[#D1D5DB] text-[11px] font-bold text-[#1E293B] flex items-center gap-1">
            🇮🇳 Made in India
          </span>
        </div>
      </div>
    </div>
  )
}
