'use client'

import React, { useState, useEffect } from 'react'

export interface OfferItem {
  id: string
  title: string
  code: string
  subtext: string
}

const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: 'off-1',
    title: 'Winter Sowing & Planting Fest',
    code: 'WINTER20',
    subtext: 'Min Order: ₹2,299',
  },
  {
    id: 'off-2',
    title: 'Special Welcome Offer',
    code: 'GLOROV10',
    subtext: 'Min Order: ₹499',
  },
  {
    id: 'off-3',
    title: '10% OFF',
    code: 'DIWALI10',
    subtext: 'On orders above ₹999',
  },
]

export interface OffersCarouselProps {
  offers?: OfferItem[]
  onCopyCode?: (code: string) => void
}

/**
 * GLOROV OffersCarousel
 * Horizontal scrolling coupon cards carousel with 1-tap clipboard copy.
 * Matches Flutter `_buildOffersCarousel()`.
 */
export const OffersCarousel: React.FC<OffersCarouselProps> = ({
  offers: initialOffers,
  onCopyCode,
}) => {
  const [offersList, setOffersList] = useState<OfferItem[]>(initialOffers || DEFAULT_OFFERS)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (initialOffers && initialOffers.length > 0) {
      setOffersList(initialOffers)
      return
    }

    // Load dynamic offers from backend API
    fetch('/api/offers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.offers) && data.offers.length > 0) {
          const transformed: OfferItem[] = data.offers
            .filter((o: { is_active?: boolean }) => o.is_active !== false)
            .map((o: { id: string; title: string; code: string; min_spend_text?: string; description?: string }) => ({
              id: o.id,
              title: o.title,
              code: o.code,
              subtext: o.min_spend_text || o.description || 'Special Botanical Discount',
            }))
          if (transformed.length > 0) {
            setOffersList(transformed)
          }
        }
      })
      .catch(() => {})
  }, [initialOffers])

  const handleCopy = (code: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2500)
    }
    if (onCopyCode) {
      onCopyCode(code)
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-bold text-[#111827]">
          Offers for you:
        </span>
        {copiedCode && (
          <span className="text-xs font-semibold text-[#16A34A] animate-pulse">
            Code {copiedCode} copied!
          </span>
        )}
      </div>

      <div className="w-full flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none no-scrollbar">
        {offersList.map((offer) => {
          const isCopied = copiedCode === offer.code

          return (
            <div
              key={offer.id}
              onClick={() => handleCopy(offer.code)}
              className="w-[220px] flex-shrink-0 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] hover:border-[#F59E0B] transition-all cursor-pointer shadow-xs active:scale-98 select-none"
              title="Click to copy coupon code"
            >
              <div className="text-xs font-bold text-[#92400E] truncate">
                {offer.title}
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded border border-[#F59E0B] bg-white font-mono text-[10px] font-extrabold text-[#B45309]">
                  {offer.code}
                </span>
                <span className="text-[10px] text-[#78350F] truncate flex-1">
                  {isCopied ? 'Copied to clipboard!' : offer.subtext}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
