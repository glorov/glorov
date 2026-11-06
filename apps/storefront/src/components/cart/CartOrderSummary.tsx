'use client'

import React from 'react'
import Link from 'next/link'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface CartOrderSummaryProps {
  subtotal: number
  compareSubtotal?: number
  discountAmount: number
  shippingAmount: number
  total: number
  overallDiscountPercent?: number
  appliedCoupon?: string | null
  checkoutHref?: string
  itemCount?: number
}

/**
 * GLOROV Desktop Order Summary Card
 * 100% matched with Flutter `_buildDesktopOrderSummaryCard`:
 * Clear itemized ledger, green discount callout, free shipping indicator,
 * payable amount with comparison strike and savings percentage,
 * primary green checkout CTA pill, and 256-bit secure checkout guarantee.
 */
export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  subtotal,
  compareSubtotal = 0,
  discountAmount,
  shippingAmount,
  total,
  overallDiscountPercent = 0,
  appliedCoupon,
  checkoutHref = '/checkout',
  itemCount,
}) => {
  const hasDiscount = compareSubtotal > total && overallDiscountPercent > 0
  const comparePrice = hasDiscount ? compareSubtotal : 0
  const discountPercent = hasDiscount ? overallDiscountPercent : 0

  return (
    <div className="w-full p-5 rounded-[20px] bg-white border border-[#E5ECE8] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 pb-3.5">
        <GlorovCustomIcons.receipt size={16} className="text-[#0A4C36]" />
        <h3 className="text-[13px] font-extrabold text-[#0A4C36] tracking-[0.8px] uppercase">
          ORDER SUMMARY{itemCount !== undefined ? ` (${itemCount} items)` : ''}
        </h3>
      </div>

      {/* Itemized Lines */}
      <div className="flex flex-col gap-2.5 text-[12.5px]">
        <div className="flex items-center justify-between text-[#6B7280]">
          <span>Items Subtotal</span>
          <span className="text-[13px] font-bold text-[#111827]">
            ₹{Math.round(subtotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="truncate pr-2">
              Coupon Discount {appliedCoupon && `(${appliedCoupon})`}
            </span>
            <span className="text-[13px] font-bold text-[#059669] whitespace-nowrap">
              -₹{Math.round(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[#6B7280]">
          <span>Shipping Transit</span>
          <span
            className={`text-[13px] font-bold ${
              shippingAmount === 0 ? 'text-[#059669]' : 'text-[#111827]'
            }`}
          >
            {shippingAmount === 0 ? 'FREE' : `₹${Math.round(shippingAmount)}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#6B7280]">
          <span>Taxes &amp; Packaging</span>
          <span className="text-[13px] font-bold text-[#111827]">
            Included in MRP
          </span>
        </div>
      </div>

      <div className="h-[1px] bg-[#E5ECE8] my-4.5" />

      {/* Payable Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[14px] font-bold text-[#111827]">
            Total Payable
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[12px] text-[#9CA3AF] line-through">
                ₹{Math.round(comparePrice)}
              </span>
              <span className="text-[11px] font-bold text-[#008C4B]">
                ({discountPercent}% OFF)
              </span>
            </div>
          )}
        </div>

        <div className="text-[22px] font-black text-[#0A4C36] leading-none">
          ₹{Math.round(total)}
        </div>
      </div>

      {/* Proceed to Checkout CTA */}
      <div className="mt-4.5">
        <Link
          href={checkoutHref}
          className="w-full h-[48px] rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
        >
          <span className="text-[13px] font-extrabold tracking-[0.5px]">
            PROCEED TO CHECKOUT
          </span>
          <GlorovCustomIcons.arrowForward size={16} />
        </Link>
      </div>

      {/* Security Trust Footnote */}
      <div className="mt-3 flex items-center justify-center gap-1 text-[10.5px] text-[#6B7280]">
        <GlorovCustomIcons.lock size={12} className="text-[#6B7280]" />
        <span>256-bit Secure Checkout</span>
      </div>
    </div>
  )
}
