'use client'

import React from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { MILESTONE_COUPONS } from '../../context/StorefrontContext'

export interface CouponVoucherCardProps {
  appliedCoupon: string | null
  onApplyCoupon: (code: string) => boolean | void
  onRemoveCoupon: () => void
  onOpenOffersModal?: () => void
  subtotal: number
  availableOffers?: typeof MILESTONE_COUPONS
}

/**
 * GLOROV In-Flow Coupon Voucher Card
 * 100% matched with Flutter `_buildCouponVoucherCard`:
 * Mint-tinted applied voucher state with direct remove action,
 * eligible milestone quick-apply button or progressive savings hint,
 * amber upgrade banner when higher discount tier is unlocked,
 * and link to available offers modal.
 */
export const CouponVoucherCard: React.FC<CouponVoucherCardProps> = ({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenOffersModal,
  subtotal,
  availableOffers = MILESTONE_COUPONS,
}) => {
  // Find highest eligible milestone offer among active offers
  const eligibleOffers = availableOffers.filter((o) => subtotal >= o.minSpend)
  const bestApplicable = eligibleOffers.length > 0 ? eligibleOffers[eligibleOffers.length - 1] : null

  // Active applied coupon object
  const appliedOfferObj = availableOffers.find(
    (c) => c.code.toUpperCase() === (appliedCoupon || '').toUpperCase()
  )

  // Active discount percentage
  const currentDiscountPercent =
    appliedOfferObj?.discountPercent ??
    (appliedCoupon?.includes('20')
      ? 20
      : appliedCoupon?.includes('15')
        ? 15
        : appliedCoupon?.includes('10')
          ? 10
          : 0)

  // Check if a higher offer is unlocked while a lower one is active
  const higherUnlockedOffer =
    appliedCoupon &&
    availableOffers.slice()
      .reverse()
      .find((o) => subtotal >= o.minSpend && o.discountPercent > currentDiscountPercent)

  if (appliedCoupon) {
    const promoTitle = appliedOfferObj
      ? `${appliedOfferObj.discountPercent}% OFF ${appliedOfferObj.minSpend > 0 ? `On orders above ₹${appliedOfferObj.minSpend.toLocaleString('en-IN')}` : ''}`.trim()
      : `${appliedCoupon} Active`

    return (
      <div className="w-full p-3.5 rounded-[18px] bg-[#F2FAF5] border-[1.2px] border-[#B7E4C7] shadow-[0_2px_6px_rgba(10,76,54,0.024)] transition-all">
        <div className="flex items-center gap-2.5">
          {/* Discount Circle Icon */}
          <div className="w-7 h-7 rounded-full bg-[#0A4C36] flex items-center justify-center text-white flex-shrink-0">
            <GlorovCustomIcons.percent size={14} className="stroke-[2.5]" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-extrabold text-[#0A4C36] truncate leading-tight">
              {promoTitle}
            </h4>
            <p className="text-[11.5px] font-normal text-[#4B5563] mt-0.5 leading-tight">
              Code: <span className="font-semibold">{appliedCoupon}</span>
            </p>
          </div>

          {/* Outlined Remove Button */}
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="px-3.5 py-1.5 rounded-[10px] bg-white border-[1.2px] border-[#0A4C36] text-[12.5px] font-bold text-[#0A4C36] hover:bg-[#F2FAF5] transition-all active:scale-95"
          >
            Remove
          </button>
        </div>

        {/* Higher Offer Upgrade Banner */}
        {higherUnlockedOffer && (
          <div className="mt-2.5 p-2.5 rounded-[14px] bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border-[1.2px] border-[#F59E0B] flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-white flex-shrink-0">
              <GlorovCustomIcons.bolt size={14} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[12px] font-extrabold text-[#92400E]">
                  {higherUnlockedOffer.title} Unlocked!
                </span>
                <span className="px-1 py-0.25 rounded-[4px] bg-[#D97706] text-white text-[8.5px] font-extrabold leading-none">
                  BETTER
                </span>
              </div>
              <p className="text-[10.5px] text-[#78350F] truncate mt-0.5">
                Orders &gt; ₹{Math.round(higherUnlockedOffer.minSpend)} (Code: {higherUnlockedOffer.code})
              </p>
            </div>

            <button
              type="button"
              onClick={() => onApplyCoupon(higherUnlockedOffer.code)}
              className="px-2.5 py-1.5 rounded-[8px] bg-[#0A4C36] text-white text-[11px] font-extrabold shadow-[0_1px_4px_rgba(10,76,54,0.16)] hover:bg-[#135841] transition-all active:scale-95 whitespace-nowrap"
            >
              APPLY {higherUnlockedOffer.title}
            </button>
          </div>
        )}

        <div className="h-[1px] bg-[#D6ECE0] my-2" />

        {/* View all coupons link */}
        <button
          type="button"
          onClick={onOpenOffersModal}
          className="w-full flex items-center justify-center gap-1 text-[12.5px] font-bold text-[#0A4C36] hover:underline py-0.5"
        >
          <span>View all available coupons</span>
          <GlorovCustomIcons.arrowForward size={13} className="stroke-[2.5]" />
        </button>
      </div>
    )
  }

  // Unapplied state
  const title = bestApplicable
    ? `Apply ${bestApplicable.code} (${Math.round(bestApplicable.discountPercent)}% OFF)`
    : 'Apply Coupon & Save More'

  const subtitle = bestApplicable
    ? `Tap to save ₹${Math.round((subtotal * bestApplicable.discountPercent) / 100)} on this order`
    : subtotal > 0
      ? `Add ₹${Math.max(0, Math.round(999 - subtotal))} more to unlock 10% OFF`
      : 'Milestone offers up to 20% off available'

  return (
    <div
      className={`w-full p-3.5 rounded-[18px] bg-white border shadow-[0_2px_6px_rgba(0,0,0,0.024)] transition-all ${
        bestApplicable ? 'border-[1.2px] border-[#B7E4C7]' : 'border border-[#E5ECE8]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Percent Icon */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            bestApplicable ? 'bg-[#0A4C36] text-white' : 'bg-[#E8F5E9] text-[#0A4C36]'
          }`}
        >
          <GlorovCustomIcons.percent size={14} className="stroke-[2.5]" />
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-[13px] font-extrabold truncate leading-tight ${
              bestApplicable ? 'text-[#0A4C36]' : 'text-[#111827]'
            }`}
          >
            {title}
          </h4>
          <p className="text-[11.5px] font-normal text-[#6B7280] mt-0.5 leading-tight truncate">
            {subtitle}
          </p>
        </div>

        {/* Right CTA: APPLY button or Milestone hint */}
        {bestApplicable ? (
          <button
            type="button"
            onClick={() => onApplyCoupon(bestApplicable.code)}
            className="px-3.5 py-1.5 rounded-[10px] bg-[#0A4C36] text-white text-[12.5px] font-extrabold hover:bg-[#135841] transition-all active:scale-95"
          >
            APPLY
          </button>
        ) : (
          <span className="px-2.5 py-1.25 rounded-[8px] bg-[#F3FAF6] border border-[#D6EAE0] text-[11px] font-bold text-[#0A4C36] whitespace-nowrap">
            10% at ₹999
          </span>
        )}
      </div>

      <div className="h-[1px] bg-[#F3F4F6] my-2" />

      {/* View all coupons link */}
      <button
        type="button"
        onClick={onOpenOffersModal}
        className="w-full flex items-center justify-center gap-1 text-[12px] font-bold text-[#0A4C36] hover:underline py-0.5"
      >
        <span>View all available coupons</span>
        <GlorovCustomIcons.arrowForward size={13} className="stroke-[2.5]" />
      </button>
    </div>
  )
}
