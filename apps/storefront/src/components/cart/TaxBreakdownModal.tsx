'use client'

import React from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'

export interface TaxBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  subtotal: number
  compareSubtotal: number
  discountAmount: number
  shippingAmount: number
  total: number
  appliedCoupon?: string | null
}

/**
 * GLOROV Price & Tax Breakdown Bottom Sheet
 * 100% matched with Flutter `_showTaxBreakdownSheet`:
 * Transparent itemized ledger, catalog savings, tax inclusion note,
 * and mint green total savings callout badge.
 */
export const TaxBreakdownModal: React.FC<TaxBreakdownModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  compareSubtotal,
  discountAmount,
  shippingAmount,
  total,
  appliedCoupon,
}) => {
  if (!isOpen) return null

  const hasCompareSavings = compareSubtotal > subtotal
  const comparePrice = hasCompareSavings ? compareSubtotal : subtotal
  const totalSavings = (hasCompareSavings ? compareSubtotal - subtotal : 0) + discountAmount

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-2xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[26px] bg-white flex flex-col p-5 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <GlorovCustomIcons.receipt size={20} className="text-[#0A4C36]" />
            <h3 className="font-serif text-[19px] font-extrabold text-[#0A4C36] leading-none">
              Price &amp; Tax Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close breakdown"
          >
            <GlorovCustomIcons.close size={20} />
          </button>
        </div>

        {/* Ledger Breakdown Lines */}
        <div className="flex flex-col gap-2.5 text-[12.5px] py-2">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span>Items Subtotal</span>
            <span className="text-[13px] font-bold text-[#111827]">
              ₹{Math.round(subtotal)}
            </span>
          </div>

          {hasCompareSavings && (
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Original Catalog Value</span>
              <span className="text-[13px] font-bold text-[#111827]">
                ₹{Math.round(comparePrice)}
              </span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-[#6B7280]">
              <span>Promotional Savings ({appliedCoupon})</span>
              <span className="text-[13px] font-bold text-[#059669]">
                -₹{Math.round(discountAmount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[#6B7280]">
            <span>Botanical Delivery Fee</span>
            <span
              className={`text-[13px] font-bold ${
                shippingAmount === 0 ? 'text-[#059669]' : 'text-[#111827]'
              }`}
            >
              {shippingAmount === 0 ? 'FREE' : `₹${Math.round(shippingAmount)}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#6B7280]">
            <span>GST &amp; Agricultural Packaging</span>
            <span className="text-[13px] font-bold text-[#111827]">
              Included in MRP
            </span>
          </div>
        </div>

        <div className="h-[1px] bg-[#E5ECE8] my-3.5" />

        {/* Total Row */}
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-extrabold text-[#111827]">
            Total Payable
          </span>
          <span className="text-[20px] font-black text-[#0A4C36]">
            ₹{Math.round(total)}
          </span>
        </div>

        {/* Savings Announcement */}
        {totalSavings > 0 && (
          <div className="mt-3.5 w-full py-2.25 px-3.5 rounded-[10px] bg-[#ECFDF5] border border-[#A7F3D0] text-center">
            <p className="text-[12px] font-bold text-[#047857]">
              🎉 You are saving ₹{Math.round(totalSavings)} on this order!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
