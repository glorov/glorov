'use client'

import React, { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BotanicalSpecifications, ProductType } from '@/types/storefront'
import {
  useCollapsibleBanner,
  DISCLOSE,
  EASE,
  NUDGE,
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
 * Open by default with smooth spring transitions matching Flutter `GlorovProductDetailsScreen._buildProductSpecifications()`.
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
    if (specs?.sowingDepth) specRows.push({ key: 'Sowing Depth', value: specs.sowingDepth })
    if (specs?.germinationPeriod) specRows.push({ key: 'Germination Time', value: specs.germinationPeriod })
    if (specs?.sunlightRequirement) specRows.push({ key: 'Sunlight Requirement', value: specs.sunlightRequirement })
    if (specs?.wateringNeeds) specRows.push({ key: 'Watering Schedule', value: specs.wateringNeeds })
    if (specs?.difficultyLevel) specRows.push({ key: 'Difficulty Level', value: specs.difficultyLevel })
    if (specs?.plantingSeason) specRows.push({ key: 'Planting Season', value: specs.plantingSeason })
    if (specs?.harvestTime) specRows.push({ key: 'Days to Harvest', value: specs.harvestTime })
    if (specs?.packContents) specRows.push({ key: 'Pack Contents', value: specs.packContents })
  } else if (productType === 'plants') {
    if (specs?.sunlightRequirement) specRows.push({ key: 'Sunlight Requirement', value: specs.sunlightRequirement })
    if (specs?.wateringNeeds) specRows.push({ key: 'Watering Schedule', value: specs.wateringNeeds })
    if (specs?.difficultyLevel) specRows.push({ key: 'Difficulty Level', value: specs.difficultyLevel })
    if (specs?.potSize) specRows.push({ key: 'Recommended Pot', value: specs.potSize })
    specRows.push({ key: 'Pet Friendly', value: specs?.isPetFriendly ? 'Yes' : 'No' })
  } else {
    if (specs?.material) specRows.push({ key: 'Material', value: specs.material })
    if (specs?.dimensions) specRows.push({ key: 'Dimensions', value: specs.dimensions })
    specRows.push({ key: 'Durability', value: 'Heavy Duty / Weatherproof' })
  }

  if (specRows.length === 0) return null

  const discloseTransition = reduced
    ? INSTANT
    : {
        height: DISCLOSE,
        opacity: { duration: 0.18, ease: EASE, delay: open ? 0.04 : 0 },
      }

  return (
    <div className="w-full flex flex-col">
      {/* Accordion Toggle Bar matching Flutter UI */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full px-4 py-3 rounded-xl bg-[#1B4332] text-white flex items-center justify-between shadow-xs hover:bg-[#143427] transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788]/60 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5">
          <svg
            width={18}
            height={18}
            className="w-[18px] h-[18px] text-white shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.4}
              d="M4 7h16M4 12h16M4 17h16"
            />
          </svg>
          <span className="text-[13.5px] font-bold text-white tracking-wide">
            Product Specifications
          </span>
        </div>

        {/* Plus / Minus Indicator with Smooth Spring Rotation */}
        <motion.div
          aria-hidden="true"
          className="flex items-center justify-center shrink-0 text-white"
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduced ? INSTANT : NUDGE}
        >
          {open ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 12h14"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 5v14m7-7H5"
              />
            </svg>
          )}
        </motion.div>
      </button>

      {/* Accordion Content Body with Spring Height & Opacity Transition */}
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
          animate={{ y: open ? 0 : -6 }}
          transition={reduced ? INSTANT : DISCLOSE}
          className="mt-2.5 p-4 rounded-xl bg-[#F9FAF8] border border-[#E5E7EB] space-y-2.5 shadow-xs"
        >
          {specRows.map((row, idx) => (
            <div
              key={`spec-${idx}`}
              className="flex items-start text-xs border-b border-[#F0F2F0] pb-2 last:border-b-0 last:pb-0"
            >
              <span className="w-2/5 font-semibold text-[#6B7280]">
                {row.key}
              </span>
              <span className="w-3/5 font-bold text-[#1F2937]">
                {row.value}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
