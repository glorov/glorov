'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { CartItem } from '../../types/cart'
import { formatINR } from '../product/ProductPrice'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { GlorovImage } from '../ui/GlorovImage'
import { useCart, useToast, MILESTONE_COUPONS } from '../../context/StorefrontContext'

export interface CheckoutOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discountAmount: number
  shippingAmount: number
  total: number
  appliedCoupon?: string | null
  isSubmitting: boolean
  isAddressValid: boolean
  onPlaceOrder: () => void
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  subtotal,
  discountAmount,
  shippingAmount,
  total,
  appliedCoupon,
  isSubmitting,
  isAddressValid,
  onPlaceOrder,
}) => {
  const { applyCoupon, removeCoupon } = useCart()
  const { showToast } = useToast()
  const [couponInput, setCouponInput] = useState<string>('')

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = couponInput.trim().toUpperCase()
    if (!trimmed) return

    const success = applyCoupon(trimmed)
    if (success) {
      showToast('success', `Coupon ${trimmed} applied!`, { title: 'Offer Activated' })
      setCouponInput('')
    } else {
      showToast('error', `Invalid coupon "${trimmed}". Try SEEDS20 or GLOROV10.`, {
        title: 'Coupon Error',
      })
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    showToast('info', 'Coupon removed from order.', { title: 'Coupon Removed' })
  }

  return (
    <div className="w-full p-5 sm:p-6 rounded-[20px] bg-white border border-[#E5ECE8] shadow-[0_4px_16px_rgba(10,76,54,0.06)] flex flex-col gap-4">
      {/* Title with Receipt Icon matching Flutter `_buildOrderSummary` */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#EBF5F0] flex items-center justify-center text-[#0A4C36] flex-shrink-0">
            <GlorovCustomIcons.receipt size={15} />
          </div>
          <h2 className="font-serif text-[15px] font-extrabold text-[#0A4C36] tracking-[0.8px] uppercase">
            ORDER SUMMARY
          </h2>
        </div>
        <span className="text-[11.5px] font-bold text-[#6B7280]">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Mini Items Thumbnail List */}
      <div className="max-h-52 overflow-y-auto divide-y divide-[#F3F4F6] pr-1 scrollbar-thin">
        {items.map((item) => (
          <CheckoutItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="pt-2 border-t border-[#F0F4F2] flex items-center justify-between">
        <Link
          href="/cart"
          className="text-[11.5px] font-bold text-[#0A4C36] hover:underline flex items-center gap-1"
        >
          <span>Modify Bag</span>
          <GlorovCustomIcons.arrowForward size={11} />
        </Link>
      </div>

      {/* Financial Ledger matching Flutter */}
      <div className="pt-2 border-t border-[#F0F4F2] flex flex-col gap-2.5 text-[12.5px] text-[#4B5563]">
        <div className="flex items-center justify-between">
          <span>Subtotal ({items.length} items)</span>
          <span className="font-bold text-[#111827]">{formatINR(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Transit & Packing</span>
          {shippingAmount === 0 ? (
            <span className="font-extrabold text-[#059669] uppercase">FREE</span>
          ) : (
            <span className="font-bold text-[#111827]">{formatINR(shippingAmount)}</span>
          )}
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-[#B45309]">
            <span className="flex items-center gap-1 font-semibold">
              Promo Savings
              {appliedCoupon && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] border border-[#FDE68A] font-extrabold text-[#78350F]">
                  {appliedCoupon}
                </span>
              )}
            </span>
            <span className="font-extrabold">- {formatINR(discountAmount)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="pt-3 border-t border-[#E5ECE8] flex items-baseline justify-between">
        <div>
          <span className="text-[14.5px] font-black text-[#0A4C36]">Total Payable</span>
          <p className="text-[10.5px] text-[#6B7280]">Inclusive of GST & live plant insurance</p>
        </div>
        <span className="text-[22px] font-black text-[#0A4C36]">
          {formatINR(total)}
        </span>
      </div>

      {/* Coupon Box matching Flutter */}
      <div className="pt-1">
        {appliedCoupon ? (
          (() => {
            const activeOffer = MILESTONE_COUPONS.find(
              (c) => c.code.toUpperCase() === appliedCoupon?.toUpperCase()
            )
            return (
              <div className="px-3 py-2 rounded-[10px] bg-[#D8F3DC] border border-[#A7F3D0] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#0A4C36] flex-wrap">
                  <GlorovCustomIcons.tag size={14} className="text-[#059669]" />
                  <span className="text-[12px] font-extrabold tracking-wide">{appliedCoupon}</span>
                  {activeOffer?.applicableCategories && activeOffer.applicableCategories.length > 0 && (
                    <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#0A4C36]/10 text-[#0A4C36]">
                      {activeOffer.applicableCategories.join('/')} Only
                    </span>
                  )}
                  <span className="text-[10px] text-[#047857] font-semibold">• SAVED {formatINR(discountAmount)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] font-bold text-[#DC2626] hover:underline shrink-0 ml-2"
                >
                  Remove
                </button>
              </div>
            )
          })()
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Coupon (e.g. SEEDS20)"
              className="flex-1 px-3 py-2 rounded-[10px] border border-[#D1D5DB] text-[12px] uppercase font-mono placeholder:normal-case placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#0A4C36]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-[10px] bg-[#0A4C36] hover:bg-[#135841] text-white text-[11.5px] font-extrabold uppercase tracking-wider transition-colors"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        disabled={isSubmitting || !isAddressValid || items.length === 0}
        onClick={onPlaceOrder}
        className="w-full py-3.5 px-5 rounded-full bg-[#0A4C36] hover:bg-[#135841] text-white font-extrabold text-[13.5px] uppercase tracking-[0.8px] shadow-[0_4px_12px_rgba(10,76,54,0.22)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>CONFIRMING ORDER...</span>
          </>
        ) : (
          <>
            <span>CONFIRM & PLACE ORDER</span>
            <GlorovCustomIcons.arrowForward size={16} />
          </>
        )}
      </button>

      {!isAddressValid && (
        <p className="text-[11px] text-[#92400E] text-center font-medium bg-[#FEF3C7] p-2 rounded-[10px] border border-[#FDE68A]">
          Please complete the required delivery address fields to confirm your order.
        </p>
      )}

      {/* Security & Transit Trust Footer matching Flutter */}
      <div className="pt-2 border-t border-[#F0F4F2] flex flex-col gap-1 text-[11px] text-[#6B7280] text-center">
        <div className="flex items-center justify-center gap-1.5 text-[#0A4C36] font-semibold">
          <GlorovCustomIcons.shieldCheck size={13} />
          <span>Simulated Demonstration Checkout</span>
        </div>
        <p>🔒 256-Bit SSL Encrypted • 🌱 7-Day Live Plant Replacement Guarantee</p>
      </div>
    </div>
  )
}

const CheckoutItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  return (
    <div className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
      <div className="relative w-11 h-11 rounded-[8px] overflow-hidden border border-[#EFEFEF] bg-[#F9FAF8] flex-shrink-0">
        {item.image ? (
          <GlorovImage
            src={item.image}
            alt={item.title}
            fill
            sizes="44px"
            className="object-cover"
            containerClassName="w-full h-full"
            fallbackTitle={item.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#16A34A] bg-[#F3F7F5]">
            <GlorovCustomIcons.spa size={18} />
          </div>
        )}
        <span className="absolute bottom-0 right-0 px-1 rounded-tl-[4px] bg-[#0A4C36]/85 text-white text-[8.5px] font-black leading-tight z-10">
          x{item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-[12.5px] font-bold text-[#111827] truncate leading-tight">
          {item.title}
        </p>
        <p className="text-[10.5px] text-[#6B7280] font-medium truncate mt-0.5">
          {item.variantName || 'Standard Pack'} • Qty: {item.quantity}
        </p>
      </div>
      <span className="text-[12.5px] font-extrabold text-[#0A4C36] flex-shrink-0">
        {formatINR(item.price * item.quantity)}
      </span>
    </div>
  )
}
