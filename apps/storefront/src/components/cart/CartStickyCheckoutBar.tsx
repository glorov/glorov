'use client'

import React from 'react'
import Link from 'next/link'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface CartStickyCheckoutBarProps {
  total: number
  compareSubtotal: number
  overallDiscountPercent: number
  checkoutHref?: string
  onOpenTaxBreakdown?: () => void
}

/**
 * GLOROV Mobile Sticky Checkout Bar
 * 100% matched with Flutter `_buildStickyCheckoutBar`:
 * High-converting mobile bottom dock with price stack, strikethrough compare price,
 * vivid green discount pill, expandable tax breakdown trigger, and signature forest green CHECKOUT CTA.
 */
export const CartStickyCheckoutBar: React.FC<CartStickyCheckoutBarProps> = ({
  total,
  compareSubtotal,
  overallDiscountPercent,
  checkoutHref = '/checkout',
  onOpenTaxBreakdown,
}) => {
  const comparePrice = compareSubtotal > total ? compareSubtotal : Math.round(total * 1.35)
  const discountPercent = overallDiscountPercent > 0 ? overallDiscountPercent : 31

  return (
    <aside
      aria-label="Mobile Checkout Dock"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-[1.2px] border-[#E5ECE8] px-3.5 sm:px-4 pt-2.5 sm:pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(10,76,54,0.08)]"
    >
      <div className="flex items-center justify-between gap-2.5 max-w-[640px] mx-auto">
        {/* Left: Price Stack & Inclusive of taxes toggle */}
        <div className="flex flex-col min-w-0 flex-shrink">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[19px] sm:text-[20px] font-black text-[#0A4C36] leading-none">
              ₹{Math.round(total)}
            </span>
            <span className="text-[12px] sm:text-[12.5px] font-medium text-[#9CA3AF] line-through leading-none">
              ₹{Math.round(comparePrice)}
            </span>
            <span className="px-1.5 py-[2px] rounded-[10px] bg-[#008C4B] text-white text-[9.5px] sm:text-[10px] font-extrabold leading-none">
              {discountPercent}% off
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenTaxBreakdown}
            className="flex items-center gap-0.5 mt-1 text-[11px] font-semibold text-[#4B5563] text-left hover:text-[#111827] transition-colors whitespace-nowrap"
          >
            <span>Inclusive of all taxes</span>
            <GlorovCustomIcons.chevronDown size={14} className="text-[#4B5563]" />
          </button>
        </div>

        {/* Right: Signature Forest Green Checkout Button */}
        <Link
          href={checkoutHref}
          className="px-[20px] sm:px-[26px] py-[10px] sm:py-[12px] rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white text-[13px] sm:text-[13.5px] font-extrabold tracking-[0.6px] sm:tracking-[0.8px] shadow-[0_4px_10px_rgba(10,76,54,0.2)] flex items-center justify-center gap-1.5 active:scale-95 transition-all flex-shrink-0 whitespace-nowrap"
        >
          <span>CHECKOUT</span>
          <GlorovCustomIcons.arrowForward size={15} />
        </Link>
      </div>
    </aside>
  )
}
