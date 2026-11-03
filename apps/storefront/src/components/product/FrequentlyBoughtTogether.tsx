'use client'

import React, { useState } from 'react'
import { GlorovImage } from '../ui/GlorovImage'
import { GlorovProductItem } from '@/types/storefront'
import { useCart, useToast } from '@/context/StorefrontContext'

export interface FrequentlyBoughtTogetherProps {
  mainProduct: GlorovProductItem
  complementaryProducts: GlorovProductItem[]
}

/**
 * GLOROV FrequentlyBoughtTogether
 * 3-Item Bundle Upsell with dynamic live total calculation and 1-tap cart addition.
 * Direct parity with Flutter `GlorovProductDetailsScreen._buildFrequentlyBoughtTogether()`.
 */
export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  mainProduct,
  complementaryProducts,
}) => {
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const [mainChecked, setMainChecked] = useState(true)
  const [item1Checked, setItem1Checked] = useState(true)
  const [item2Checked, setItem2Checked] = useState(true)

  if (complementaryProducts.length < 2) return null

  const comp1 = complementaryProducts[0]
  const comp2 = complementaryProducts[1]

  const mainPrice = mainProduct.discountPrice ?? mainProduct.price
  const comp1Price = comp1.discountPrice ?? comp1.price
  const comp2Price = comp2.discountPrice ?? comp2.price

  let total = 0
  let count = 0
  if (mainChecked) {
    total += mainPrice
    count++
  }
  if (item1Checked) {
    total += comp1Price
    count++
  }
  if (item2Checked) {
    total += comp2Price
    count++
  }

  const handleAddBundle = () => {
    if (count === 0) return

    if (mainChecked) addToCart(mainProduct, 1, undefined, { silent: true })
    if (item1Checked && comp1) addToCart(comp1, 1, undefined, { silent: true })
    if (item2Checked && comp2) addToCart(comp2, 1, undefined, { silent: true })

    showToast('success', `Added ${count} bundle items to your shopping bag!`, {
      actionLabel: 'VIEW BAG',
      onAction: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/cart'
        }
      },
    })
  }

  return (
    <div className="w-full p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="font-serif text-[15px] sm:text-base font-extrabold text-[#111827]">
        Frequently bought together
      </h3>

      <div className="mt-3.5 space-y-3">
        {/* Main Product */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={mainChecked}
            onChange={(e) => setMainChecked(e.target.checked)}
            className="w-4.5 h-4.5 rounded text-[#1B4332] accent-[#1B4332] focus:ring-[#1B4332] cursor-pointer shrink-0"
          />
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
            <GlorovImage
              src={mainProduct.primaryImage}
              alt={mainProduct.title}
              fill
              sizes="44px"
              className="object-cover"
              containerClassName="w-full h-full"
              fallbackTitle={mainProduct.title}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#1F2937] truncate">
              {mainProduct.title}
            </div>
            <div className="text-xs font-bold text-[#111827] mt-0.5">
              ₹{mainPrice}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#F3F4F6]" />

        {/* Comp 1 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={item1Checked}
            onChange={(e) => setItem1Checked(e.target.checked)}
            className="w-4.5 h-4.5 rounded text-[#1B4332] accent-[#1B4332] focus:ring-[#1B4332] cursor-pointer shrink-0"
          />
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
            <GlorovImage
              src={comp1.primaryImage}
              alt={comp1.title}
              fill
              sizes="44px"
              className="object-cover"
              containerClassName="w-full h-full"
              fallbackTitle={comp1.title}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#1F2937] truncate">
              {comp1.title}
            </div>
            <div className="text-xs font-bold text-[#111827] mt-0.5">
              ₹{comp1Price}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#F3F4F6]" />

        {/* Comp 2 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={item2Checked}
            onChange={(e) => setItem2Checked(e.target.checked)}
            className="w-4.5 h-4.5 rounded text-[#1B4332] accent-[#1B4332] focus:ring-[#1B4332] cursor-pointer shrink-0"
          />
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
            <GlorovImage
              src={comp2.primaryImage}
              alt={comp2.title}
              fill
              sizes="44px"
              className="object-cover"
              containerClassName="w-full h-full"
              fallbackTitle={comp2.title}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#1F2937] truncate">
              {comp2.title}
            </div>
            <div className="text-xs font-bold text-[#111827] mt-0.5">
              ₹{comp2Price}
            </div>
          </div>
        </div>
      </div>

      {/* Total & Action */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-[#6B7280]">Total Amount</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#111827]">₹{total}</span>
            <span className="text-xs text-stone-400 line-through">₹{Math.round(total * 1.25)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={count === 0}
          onClick={handleAddBundle}
          className="px-4 py-2 rounded-lg bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143427] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-1"
        >
          <span>Add {count} Items To Cart</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
