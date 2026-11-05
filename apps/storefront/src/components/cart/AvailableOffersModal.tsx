'use client'

import React, { useState, useEffect } from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { FREE_SHIPPING_THRESHOLD } from '../../context/StorefrontContext'
import { FreeShippingProgressBar } from './FreeShippingProgressBar'
import { RawOfferLike, normalizeOffer } from '../../lib/roadmap-utils'

export interface AvailableOffersModalProps {
  isOpen: boolean
  onClose: () => void
  subtotal: number
  appliedCoupon: string | null
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  offers?: RawOfferLike[]
}

const DEFAULT_ACTIVE_FALLBACK_OFFERS: RawOfferLike[] = [
  {
    code: 'DIWALI10',
    title: '10% OFF',
    description: '10% OFF On orders above ₹999',
    discount_badge: '10% OFF',
    discount_value: 10,
    min_spend: 999,
    category: 'sitewide',
    applicable_categories: ['*'],
    is_active: true,
  },
  {
    code: 'DIWALI15',
    title: '15% OFF',
    description: '15% OFF On orders above ₹1,599',
    discount_badge: '15% OFF',
    discount_value: 15,
    min_spend: 1599,
    category: 'sitewide',
    applicable_categories: ['*'],
    is_active: true,
  },
  {
    code: 'DIWALI20',
    title: '20% OFF',
    description: '20% OFF On orders above ₹2,299',
    discount_badge: '20% OFF',
    discount_value: 20,
    min_spend: 2299,
    category: 'sitewide',
    applicable_categories: ['*'],
    is_active: true,
  },
]

/**
 * GLOROV Available Offers Modal Sheet
 * Displays dynamic milestone progress roadmap, database offers,
 * automated de-duplication, real-time upgrade recommendations, and 1-tap apply/remove.
 */
export const AvailableOffersModal: React.FC<AvailableOffersModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  offers: initialOffers,
}) => {
  const [modalOffers, setModalOffers] = useState<RawOfferLike[]>(
    initialOffers && initialOffers.length > 0 ? initialOffers : DEFAULT_ACTIVE_FALLBACK_OFFERS
  )

  useEffect(() => {
    if (initialOffers && initialOffers.length > 0) {
      setModalOffers(initialOffers)
      return
    }

    // Fetch live active offers from Medusa database
    let isMounted = true
    fetch('/api/offers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.offers)) {
          // Strictly only include active offers
          const activeOnly = data.offers.filter((o: any) => o.is_active !== false)
          setModalOffers(activeOnly)
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [initialOffers])

  if (!isOpen) return null

  const isFreeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD
  const freeShippingShortfall = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  // Current promo discount percent
  const cleanAppliedCode = (appliedCoupon || '').trim().toUpperCase()
  let currentPromoPercent = 0
  if (cleanAppliedCode.includes('20')) currentPromoPercent = 20
  else if (cleanAppliedCode.includes('15')) currentPromoPercent = 15
  else if (cleanAppliedCode.includes('10')) currentPromoPercent = 10

  // Deduplicate and curate 3 to 5 offers
  const normalizedList = modalOffers.map(normalizeOffer).filter((o) => o.isActive)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-2xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[88vh] rounded-t-[26px] bg-white flex flex-col shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <GlorovCustomIcons.tag size={20} className="text-[#0A4C36]" />
            <h3 className="font-serif text-[19px] font-extrabold text-[#0A4C36] leading-none">
              Available Offers
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close offers"
          >
            <GlorovCustomIcons.close size={20} />
          </button>
        </div>

        {/* Roadmap Progress Meter inside modal */}
        <div className="px-4 pt-3 pb-1 bg-[#FAFCFA] border-b border-[#E8F3ED]">
          <FreeShippingProgressBar
            subtotal={subtotal}
            appliedCoupon={appliedCoupon}
            offers={modalOffers}
            hideViewOffersLink={true}
          />
        </div>

        {/* Offers List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Milestone Goal 1: Free Express Delivery */}
          <div
            className={`p-3.5 rounded-[18px] border transition-all flex items-start gap-2.5 ${
              isFreeShippingUnlocked
                ? 'bg-[#F2FAF5] border-[#0A4C36] border-[1.8px]'
                : 'bg-[#F9FAFB] border-[#E5E7EB]'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <GlorovCustomIcons.truck size={18} className="text-[#0A4C36]" />
                <h4 className="text-[15px] font-extrabold text-[#0A4C36] leading-tight">
                  Free Express Delivery
                </h4>
              </div>
              <p className="text-[12.5px] text-[#4B5563] mt-1 leading-snug">
                Free moisture-conditioned nursery express courier (save ₹99) on orders above ₹499
              </p>
              <p className="text-[12px] font-semibold text-[#059669] mt-0.5">
                Goal 1 • Automatically applied at ₹499
              </p>
              {!isFreeShippingUnlocked && (
                <p className="text-[11px] font-bold text-[#DC2626] mt-1">
                  Add ₹{Math.round(freeShippingShortfall)} more to unlock
                </p>
              )}
            </div>

            <span
              className={`px-2.5 py-1.5 rounded-[10px] text-[11px] font-extrabold flex-shrink-0 ${
                isFreeShippingUnlocked
                  ? 'bg-[#0A4C36] text-white'
                  : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {isFreeShippingUnlocked ? 'UNLOCKED' : 'GOAL 1'}
            </span>
          </div>

          {/* Curated Milestone Offers (3 to 5 offers) */}
          {normalizedList.map((offer) => {
            const isApplied = cleanAppliedCode === offer.code.toUpperCase()
            const isEligible = subtotal >= offer.minSpend
            const isHigherThanCurrent =
              isEligible && offer.discountPercent > currentPromoPercent
            const shortfall = Math.max(0, offer.minSpend - subtotal)
            const isCategoryOffer =
              offer.applicableCategories.length > 0 &&
              !offer.applicableCategories.includes('*') &&
              !offer.applicableCategories.includes('sitewide')

            return (
              <div
                key={offer.id}
                className={`p-3.5 rounded-[18px] border transition-all flex items-start gap-2.5 ${
                  isApplied
                    ? 'bg-[#F2FAF5] border-[#0A4C36] border-[1.8px]'
                    : isHigherThanCurrent
                      ? 'bg-[#FFFBEB] border-[#F59E0B] border-[1.8px]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[15px] font-extrabold text-[#0A4C36] leading-tight">
                      {offer.title}
                    </h4>
                    {isHigherThanCurrent && (
                      <span className="px-1.5 py-0.5 rounded-[6px] bg-[#D97706] text-white text-[9px] font-extrabold leading-none">
                        BETTER OFFER
                      </span>
                    )}
                    {isCategoryOffer && (
                      <span className="px-1.5 py-0.5 rounded-[6px] bg-[#E8F5E9] text-[#1B5E20] text-[9px] font-extrabold leading-none uppercase">
                        {offer.applicableCategories.join(', ')} ONLY
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-[#4B5563] mt-1 leading-snug">
                    {offer.description}
                  </p>
                  <p className="text-[12px] font-bold text-[#1F2937] mt-0.5">
                    Code: <span className="font-mono tracking-wider">{offer.code}</span>
                  </p>
                  <p className="text-[10.5px] italic text-[#9CA3AF] mt-0.5">
                    {offer.minSpend > 0 ? `Min order: ₹${offer.minSpend}` : 'No minimum order required'}
                  </p>
                  {!isEligible && (
                    <p className="text-[11px] font-bold text-[#DC2626] mt-1">
                      Add ₹{Math.round(shortfall)} more to unlock
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 pt-0.5">
                  {isApplied ? (
                    <button
                      type="button"
                      onClick={() => onRemoveCoupon()}
                      className="px-3.5 py-1.75 rounded-[10px] bg-white border-[1.4px] border-[#0A4C36] text-[12px] font-extrabold text-[#0A4C36] hover:bg-[#F2FAF5] transition-all active:scale-95"
                    >
                      REMOVE
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isEligible}
                      onClick={() => onApplyCoupon(offer.code)}
                      className={`px-4 py-1.75 rounded-[10px] text-[12px] font-extrabold transition-all ${
                        isEligible
                          ? 'bg-[#0A4C36] text-white hover:bg-[#135841] active:scale-95'
                          : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isEligible ? (isHigherThanCurrent ? 'UPGRADE' : 'APPLY') : 'LOCKED'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
