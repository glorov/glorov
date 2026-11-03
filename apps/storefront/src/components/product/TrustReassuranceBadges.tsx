'use client'

import React, { useState } from 'react'
import { ProductType } from '@/types/storefront'

export interface TrustReassuranceBadgesProps {
  productType?: ProductType
}

/**
 * GLOROV TrustReassuranceBadges
 * High-craft botanical trust reassuring badges with modal T&C support.
 * Directly mirrors Flutter `GlorovProductDetailsScreen._buildTrustReassuranceBadges()`.
 */
export const TrustReassuranceBadges: React.FC<TrustReassuranceBadgesProps> = ({
  productType = 'seeds',
}) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  const isPlant = productType === 'plants'
  const isSeeds = productType === 'seeds'

  const guaranteeTitle = isPlant
    ? '30-Day Plant Guarantee'
    : isSeeds
      ? 'Verified Germination Guarantee'
      : 'Safe Transit Guarantee'

  return (
    <div className="w-full flex flex-col gap-2">
      {/* 1. Guarantee Row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] text-[#713F12]">
        <div className="flex items-center gap-2">
          <svg width={18} height={18} className="w-[18px] h-[18px] text-[#854D0E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[12.5px] font-bold text-[#713F12]">
            {guaranteeTitle}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsTermsOpen(true)}
          className="text-[11.5px] font-bold text-[#854D0E] underline hover:text-[#713F12] transition"
        >
          T&C
        </button>
      </div>

      {/* 2. Logistics & Care Row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] text-[#713F12]">
        {isPlant && (
          <div className="flex items-center gap-1.5 flex-1">
            <svg width={16} height={16} className="w-4 h-4 text-[#854D0E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-bold text-[#713F12] truncate">
              Plant Care Support
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-1">
          <svg width={18} height={18} className="w-[18px] h-[18px] text-[#854D0E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <span className="text-xs font-bold text-[#713F12] truncate">
            Pan-India Delivery
          </span>
        </div>
      </div>

      {/* Guarantee Terms & Conditions Modal */}
      {isTermsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs select-none"
          onClick={() => setIsTermsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#854D0E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="font-extrabold text-base text-[#111827]">
                  Guarantee Terms & Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-xs text-[#4B5563] leading-relaxed">
              At GLOROV, every botanical product is carefully verified and packaged in transit-safe breathable containers. Our terms & conditions include:
            </p>

            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Transit & Delivery Guarantee</div>
                  <div className="text-[11.5px] text-[#6B7280] leading-snug">
                    If your plant or seeds arrive damaged or stressed from travel, notify us within 48 hours for an immediate free replacement.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Verified Quality Warranty</div>
                  <div className="text-[11.5px] text-[#6B7280] leading-snug">
                    Follow our plant care instructions. If your specimen fails within 30 days despite proper care, our botanists will assist you or replace it.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Hassle-Free Replacement</div>
                  <div className="text-[11.5px] text-[#6B7280] leading-snug">
                    Share 2 clear photos and your order number via WhatsApp or support to initiate an instant replacement claim.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTermsOpen(false)}
              className="mt-5 w-full py-2.5 rounded-lg border border-[#1B4332] text-[#1B4332] font-bold text-xs hover:bg-[#1B4332] hover:text-white transition"
            >
              Close Guarantee Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
