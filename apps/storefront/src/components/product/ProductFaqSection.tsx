'use client'

import React, { useState } from 'react'
import { ProductType } from '@/types/storefront'

export interface ProductFaqSectionProps {
  productTitle: string
  productType?: ProductType
  plantingSeason?: string
  sunlightRequirement?: string
  sowingDepth?: string
  wateringNeeds?: string
  isPetFriendly?: boolean
}

/**
 * GLOROV ProductFaqSection
 * Contextual Frequently Asked Questions accordion matching Flutter `_buildFaqSection()`.
 */
export const ProductFaqSection: React.FC<ProductFaqSectionProps> = ({
  productTitle,
  productType = 'seeds',
  plantingSeason = 'mild sunny weather',
  sunlightRequirement = 'full sun',
  sowingDepth = '1-2 cm',
  wateringNeeds = 'regular moderate',
  isPetFriendly = true,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  let faqs: { q: string; a: string }[] = []

  if (productType === 'seeds') {
    faqs = [
      {
        q: `When is the best time to sow ${productTitle}?`,
        a: `Plant seeds during ${plantingSeason}. They thrive in ${sunlightRequirement.toLowerCase()} with well-drained, aerated potting soil.`,
      },
      {
        q: 'How deep should I sow the seeds?',
        a: `Sow seeds at a depth of ${sowingDepth}. Gently cover with fine soil mix and mist lightly with water to keep the soil moist without displacing the seeds.`,
      },
      {
        q: 'How often should I water the seedling?',
        a: `Follow a ${wateringNeeds.toLowerCase()} routine. Keep the upper layer moist during germination, then water only when the top 1 inch of soil feels dry to the touch.`,
      },
      {
        q: "What is GLOROV's guarantee & replacement policy?",
        a: 'All GLOROV botanical seeds and plants are protected by our 100% "Arrives Healthy" guarantee. In the rare event of damage or non-germination, we provide free replacement support.',
      },
    ]
  } else if (productType === 'plants') {
    faqs = [
      {
        q: `What are the light requirements for ${productTitle}?`,
        a: `This live plant thrives best in ${sunlightRequirement.toLowerCase()}. Avoid harsh scorching direct sun unless acclimated.`,
      },
      {
        q: 'How frequently should I water this plant?',
        a: `Follow a ${wateringNeeds.toLowerCase()} schedule. Allow the top 1-2 inches of potting mix to dry out between waterings to prevent root rot.`,
      },
      {
        q: 'Is this plant safe for pets?',
        a: isPetFriendly
          ? `Yes! ${productTitle} is certified non-toxic and pet-friendly for homes with dogs and cats.`
          : `${productTitle} is best kept out of reach of curious cats and dogs.`,
      },
      {
        q: 'What should I do immediately after my plant arrives?',
        a: 'Unbox gently, place in a shaded bright spot for 24-48 hours to acclimate after transit, and check soil moisture.',
      },
    ]
  } else {
    faqs = [
      {
        q: `What materials is ${productTitle} crafted from?`,
        a: 'Crafted from high-grade, durable materials designed for long-lasting gardening and nursery use.',
      },
      {
        q: 'How do I care for and maintain this item?',
        a: 'Wipe clean with a damp cloth after use. Store in a dry place to prevent moisture degradation.',
      },
      {
        q: 'Is this suitable for both indoor and outdoor gardening?',
        a: 'Yes, engineered for versatility across indoor pots, balcony planters, and terrace/outdoor raised beds.',
      },
      {
        q: "What is GLOROV's transit guarantee?",
        a: 'Protected by safe delivery transit packaging. If any defect or damage occurs during transit, we provide immediate free replacement.',
      },
    ]
  }

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="w-full flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <svg width={20} height={20} className="w-5 h-5 text-[#1B4332] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-serif font-bold text-lg text-[#1B4332]">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-2.5">
        {faqs.map((f, idx) => {
          const isOpen = openIndex === idx

          return (
            <div
              key={`faq-${idx}`}
              className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden transition-all shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 select-none"
              >
                <span className="text-[13.5px] font-bold text-[#1F2937]">
                  {f.q}
                </span>
                <svg
                  width={16}
                  height={16}
                  className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 text-xs sm:text-[12.5px] text-[#4B5563] leading-relaxed border-t border-stone-100 pt-2.5">
                  {f.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
