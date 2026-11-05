'use client'

import React, { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BotanicalSpecifications, ProductType } from '@/types/storefront'
import {
  useCollapsibleBanner,
  DISCLOSE,
  EASE,
  INSTANT,
} from '../ui/CollapsibleBanner'

export interface ProductSpecificationsAccordionProps {
  productType?: ProductType
  category: string
  subcategory?: string
  botanicalName?: string
  specs?: BotanicalSpecifications
  defaultOpen?: boolean
}

/**
 * GLOROV ProductSpecificationsAccordion
 * Collapsible botanical data specifications table with spring physics disclosure.
 * Features:
 * - Rounded pill header matching Image 1 with custom menu icon (☰) and morphing plus/minus (±) toggle.
 * - Buttery smooth spring disclosure without layout jumps.
 * - Structured metadata rows with soft alternating borders and high-contrast typography.
 */
export const ProductSpecificationsAccordion: React.FC<ProductSpecificationsAccordionProps> = ({
  productType = 'seeds',
  category,
  subcategory,
  botanicalName,
  specs,
  defaultOpen = true,
}) => {
  const reduced = useReducedMotion()
  const uid = useId()
  const bodyId = `${uid}-specs-body`

  const { open, toggle } = useCollapsibleBanner({
    defaultState: defaultOpen ? 'open' : 'folded',
  })

  const specRows: { key: string; value: string }[] = []

  if (botanicalName) {
    specRows.push({ key: 'Botanical Name', value: botanicalName })
  }
  specRows.push({ key: 'Category', value: category })
  if (subcategory) {
    specRows.push({ key: 'Subcategory', value: subcategory })
  }

  if (productType === 'seeds') {
    specRows.push({ key: 'Sowing Depth', value: specs?.sowingDepth || '0.5 cm' })
    specRows.push({ key: 'Germination Time', value: specs?.germinationPeriod || '5 — 8 Days' })
    specRows.push({ key: 'Sunlight Requirement', value: specs?.sunlightRequirement || 'Full Sun (6 — 8 Hours Daily)' })
    specRows.push({ key: 'Watering Schedule', value: specs?.wateringNeeds || 'Moderate • Water when top soil is dry' })
    specRows.push({ key: 'Difficulty Level', value: specs?.difficultyLevel || 'Beginner Friendly' })
    specRows.push({ key: 'Planting Season', value: specs?.plantingSeason || 'All Seasons (Monsoon / Summer)' })
    specRows.push({ key: 'Days to Harvest', value: specs?.harvestTime || '65 — 75 Days from Sowing' })
    specRows.push({ key: 'Pack Contents', value: specs?.packContents || 'Approx. 100 Seeds (Minimum 98% Germination)' })
  } else if (productType === 'plants') {
    specRows.push({ key: 'Sunlight Requirement', value: specs?.sunlightRequirement || 'Bright Indirect Sunlight' })
    specRows.push({ key: 'Watering Schedule', value: specs?.wateringNeeds || 'Water when top 1-2 inches dry' })
    specRows.push({ key: 'Difficulty Level', value: specs?.difficultyLevel || 'Beginner Friendly' })
    specRows.push({ key: 'Recommended Pot', value: specs?.potSize || '6 — 8 Inch Nursery Pot' })
    specRows.push({ key: 'Pet Friendly', value: specs?.isPetFriendly ? 'Yes' : 'No' })
  } else {
    specRows.push({ key: 'Material', value: specs?.material || 'Premium Glazed Ceramic' })
    specRows.push({ key: 'Dimensions', value: specs?.dimensions || '15 cm x 15 cm x 14 cm' })
    specRows.push({ key: 'Durability', value: 'Heavy Duty / Weatherproof' })
  }

  if (specRows.length === 0) return null

  const discloseTransition = reduced
    ? INSTANT
    : {
        height: DISCLOSE,
        opacity: { duration: 0.22, ease: EASE, delay: open ? 0.03 : 0 },
      }

  return (
    <div className="w-full flex flex-col">
      {/* 1. Pill Header matching Image 1: rounded pill in dark forest green with custom icons */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full px-5 sm:px-6 py-3.5 rounded-full bg-[#16382C] text-white flex items-center justify-between shadow-xs hover:bg-[#122F25] transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788]/60 active:scale-[0.99]"
      >
        {/* Left Side: 3 Horizontal Menu Bars + Title */}
        <div className="flex items-center gap-3">
          <svg
            width={20}
            height={20}
            className="w-5 h-5 text-white shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 7h16M4 12h16M4 17h16"
            />
          </svg>
          <span className="text-[15px] sm:text-[16px] font-bold text-white tracking-tight">
            Product Specifications
          </span>
        </div>

        {/* Right Side: Smooth Rotating Up / Down Chevron Arrow Toggle */}
        <motion.div
          aria-hidden="true"
          className="w-6 h-6 flex items-center justify-center shrink-0 text-white"
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>

      {/* 2. Accordion Content Body with Smooth Spring Transition matching Image 1 */}
      <motion.div
        id={bodyId}
        inert={!open}
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={discloseTransition}
        style={{ overflow: 'hidden' }}
      >
        <motion.div
          initial={false}
          animate={{ y: open ? 0 : -8 }}
          transition={reduced ? INSTANT : DISCLOSE}
          className="mt-3 p-4 sm:p-6 rounded-[24px] bg-[#FAFDF9] border border-[#E2EAE5] shadow-[0_2px_12px_rgba(22,56,44,0.03)] divide-y divide-[#EDF3EF]"
        >
          {specRows.map((row, idx) => (
            <div
              key={`spec-${idx}`}
              className="flex items-start py-3.5 first:pt-1 last:pb-1 text-[13.5px] sm:text-[14px]"
            >
              <span className="w-[42%] font-bold text-[#4B5E54]">
                {row.key}
              </span>
              <span className="flex-1 font-bold text-[#111827]">
                {row.value}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
