'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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

const EASE = [0.23, 1, 0.32, 1] as const
const DISCLOSE = { type: 'spring', stiffness: 220, damping: 28, mass: 0.8 } as const
const INSTANT = { duration: 0 } as const

/**
 * GLOROV ProductFaqSection
 * Contextual Frequently Asked Questions accordion matching Image 2:
 * - Editorial Fraunces serif heading with botanical question circle icon.
 * - Distinct 22px rounded capsule cards with smooth spring physics disclosure.
 * - Morphing rotating chevron indicator without jumpiness.
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
  const reduced = useReducedMotion()

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

  const discloseTransition = reduced
    ? INSTANT
    : {
        height: DISCLOSE,
        opacity: { duration: 0.2, ease: EASE, delay: 0.02 },
      }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Header with Question Circle Icon matching Image 2 */}
      <div className="flex items-center gap-2.5">
        <svg
          width={22}
          height={22}
          className="w-[22px] h-[22px] text-[#163E30] shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="9" strokeWidth="2.2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
          />
          <circle cx="12" cy="17" r="1" fill="currentColor" strokeWidth="0" />
        </svg>
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#163E30] tracking-tight">
          Frequently Asked Questions
        </h3>
      </div>

      {/* 2. FAQ List: Rounded capsule cards matching Image 2 */}
      <div className="space-y-3">
        {faqs.map((f, idx) => {
          const isOpen = openIndex === idx
          const answerId = `faq-answer-${idx}`

          return (
            <div
              key={`faq-${idx}`}
              className="rounded-[22px] border border-[#E2E8F0] bg-white overflow-hidden transition-colors hover:border-[#CBD5E1]"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="w-full px-5 sm:px-6 py-4 sm:py-4.5 text-left flex items-center justify-between gap-4 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163E30]"
              >
                <span className="text-[14.5px] sm:text-[15.5px] font-bold text-[#1E293B] leading-snug">
                  {f.q}
                </span>

                {/* Rotating Chevron Icon with Spring Physics */}
                <motion.div
                  aria-hidden="true"
                  initial={false}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="shrink-0 text-[#64748B]"
                >
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.div>
              </button>

              {/* Collapsible Answer with Spring Height and Opacity Transition */}
              <motion.div
                id={answerId}
                inert={!isOpen}
                initial={false}
                animate={{
                  height: isOpen ? 'auto' : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={discloseTransition}
                style={{ overflow: 'hidden' }}
              >
                <motion.div
                  initial={false}
                  animate={{ y: isOpen ? 0 : -6 }}
                  transition={reduced ? INSTANT : DISCLOSE}
                  className="px-5 sm:px-6 pb-4 sm:pb-5 pt-1 text-[13.5px] sm:text-[14px] text-[#475569] leading-relaxed border-t border-[#F1F5F9]"
                >
                  {f.a}
                </motion.div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
