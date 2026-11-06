'use client'

import React from 'react'
import { ProductVariantItem, ProductType } from '@/types/storefront'

export interface ProductVariantSelectorProps {
  variants: ProductVariantItem[]
  selectedVariantId: string
  onSelectVariant: (variant: ProductVariantItem) => void
  productType?: ProductType
  onOpenSizeGuide?: () => void
}

/**
 * GLOROV ProductVariantSelector
 * Direct parity with Flutter `GlorovProductDetailsScreen._buildVariantSelector()`.
 * Renders horizontal variant selector chips with checkmark, price pill,
 * and optional plant size guide link.
 */
export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
  productType = 'seeds',
  onOpenSizeGuide,
}) => {
  if (!variants || variants.length === 0) return null

  // Determine selector title based on botanical product type
  let selectorTitle = 'Select Option'
  if (productType === 'seeds') {
    selectorTitle = 'Select Packet Size'
  } else if (productType === 'plants') {
    selectorTitle = 'Select Plant Size'
  } else if (productType === 'planters') {
    selectorTitle = 'Select Pot Size'
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#111827]">
          {selectorTitle}
        </span>
        {productType === 'plants' && onOpenSizeGuide && (
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="text-[12.5px] font-semibold text-[#1B4332] underline hover:text-[#2D6A4F] transition"
          >
            Size Guide
          </button>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Product options"
        className="flex flex-wrap gap-2.5 pt-0.5"
      >
        {variants.map((v) => {
          const isSelected = v.id === selectedVariantId
          const isAvailable = v.inStock !== false
          const effectivePrice = v.discountPrice ?? v.price

          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isAvailable}
              onClick={() => onSelectVariant(v)}
              className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-left transition-colors active:scale-95 ${
                isSelected
                  ? 'bg-[#E8F5E9] border-[#1B4332] border-[1.6px] text-[#1B4332]'
                  : 'bg-white border-[#D1D5DB] border text-[#374151] hover:border-[#9CA3AF]'
              } ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-stone-50' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <svg width={14} height={14} className="w-3.5 h-3.5 text-[#1B4332] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}

              <span
                className={`text-[13px] truncate ${
                  isSelected ? 'font-extrabold text-[#1B4332]' : 'font-semibold text-[#374151]'
                }`}
              >
                {v.name}
              </span>

              <span
                className={`text-[12.5px] font-bold ml-1 ${
                  isSelected ? 'text-[#1B4332]' : 'text-[#6B7280]'
                }`}
              >
                ₹{effectivePrice}
              </span>

              {!isAvailable && (
                <span className="text-[10px] font-medium text-rose-600 ml-1">
                  (Out of stock)
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
