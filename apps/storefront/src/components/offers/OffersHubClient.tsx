'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageContainer } from '../layout/PageContainer'
import { Breadcrumbs } from '../layout/Breadcrumbs'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { FreeShippingProgressBar } from '../cart/FreeShippingProgressBar'
import { ProductCard } from '../product/ProductCard'
import { useStorefront, FREE_SHIPPING_THRESHOLD } from '../../context/StorefrontContext'
import {
  buildDynamicMilestoneRoadmap,
  RawOfferLike,
  normalizeOffer,
  RoadmapNode,
} from '../../lib/roadmap-utils'
import { MOCK_PRODUCTS } from '../../lib/mock-data'

export interface OffersHubClientProps {
  initialOffers: RawOfferLike[]
}

export function OffersHubClient({ initialOffers }: OffersHubClientProps) {
  const {
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    showToast,
    cartCount,
  } = useStorefront()

  const [offers, setOffers] = useState<RawOfferLike[]>(initialOffers || [])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Fetch latest active database offers
  useEffect(() => {
    let isMounted = true
    fetch('/api/offers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !Array.isArray(data.offers) || data.offers.length === 0) return
        setOffers(data.offers)
      })
      .catch(() => {
        // Fallback to initialOffers
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Build the dynamic milestone roadmap
  const roadmap = buildDynamicMilestoneRoadmap(
    offers,
    cartSubtotal,
    appliedCoupon,
    FREE_SHIPPING_THRESHOLD
  )

  // Deduplicate and curate 3 to 5 offers for display
  const curatedOffers = offers.map(normalizeOffer).filter((o) => o.isActive).slice(0, 5)

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code)
        setCopiedCode(code)
        showToast('success', `Coupon code "${code}" copied to clipboard!`)
        setTimeout(() => setCopiedCode(null), 2000)
      }
    } catch {
      showToast('info', `Coupon code: ${code}`)
    }
  }

  const handleApplyOffer = (code: string) => {
    const target = curatedOffers.find((o) => o.code.toUpperCase() === code.toUpperCase())
    if (target && cartSubtotal < target.minSpend) {
      showToast(
        'warning',
        `Add ₹${(target.minSpend - cartSubtotal).toLocaleString('en-IN')} more to unlock ${target.code}`
      )
      return
    }
    const success = applyCoupon(code)
    if (success) {
      showToast('success', `Applied ${code} successfully!`)
    }
  }

  // Qualifying botanical products
  const qualifyingProducts = MOCK_PRODUCTS.filter(
    (p) => p.discountPrice !== undefined && p.discountPrice < p.price
  ).slice(0, 4)

  return (
    <div className="w-full bg-[#F9FAF8] pb-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Offers & Milestones' },
        ]}
      />

      {/* 2. Hero Header */}
      <div className="w-full bg-[#081C15] text-white py-8 sm:py-12 border-b border-white/10">
        <PageContainer>
          <div className="max-w-3xl space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#52B788] text-[#081C15] font-extrabold text-[10px] tracking-wider uppercase">
                ACTIVE PROMOTIONS & REWARDS
              </span>
              <span className="text-white/60 text-xs">
                {curatedOffers.length} Verified Offers Available
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-black text-white">
              Botanical Offers & Milestone Rewards
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              Unlock higher botanical savings automatically as you nurture your cart.
              Every order enjoys moisture-conditioned express dispatch and certified seed vigor.
            </p>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-6 sm:py-8 space-y-8">
        {/* 3. Dynamic Milestone Roadmap Tracker Section */}
        <section className="p-4 sm:p-6 rounded-[22px] bg-white border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#F3F4F6]">
            <div>
              <div className="flex items-center gap-2">
                <GlorovCustomIcons.tag size={20} className="text-[#0A4C36]" />
                <h2 className="font-serif text-lg sm:text-xl font-extrabold text-[#0A4C36]">
                  Your Garden Milestone Roadmap
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Automatically calculates based on current active offers and your shopping bag.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#374151]">
                Current Bag: <strong className="text-[#0A4C36]">₹{cartSubtotal}</strong> ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </span>
              <Link
                href="/cart"
                className="px-3 py-1.5 rounded-full bg-[#0A4C36] text-white text-xs font-extrabold hover:bg-[#135841] transition-colors"
              >
                View Bag &rarr;
              </Link>
            </div>
          </div>

          {/* Dynamic Roadmap Progress Meter */}
          <div className="py-1">
            <FreeShippingProgressBar
              subtotal={cartSubtotal}
              appliedCoupon={appliedCoupon}
              offers={offers}
              onApplyCoupon={(code) => handleApplyOffer(code)}
              onShowNotice={(msg) => showToast('info', msg)}
              hideViewOffersLink={true}
            />
          </div>

          {/* Interactive Milestone Nodes Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {roadmap.nodes.map((node: RoadmapNode) => {
              const shortfall = Math.max(0, node.minSpend - cartSubtotal)

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    if (node.isReached && node.code && node.type !== 'free_shipping') {
                      handleApplyOffer(node.code)
                    } else if (!node.isReached) {
                      showToast('info', `Add ₹${shortfall} more to unlock ${node.label} ${node.title}`)
                    }
                  }}
                  className={`p-3 rounded-[14px] border cursor-pointer transition-all ${
                    node.isApplied
                      ? 'bg-[#F2FAF5] border-[#0A4C36] ring-1 ring-[#0A4C36]'
                      : node.isReached
                        ? 'bg-[#F2FAF5] border-[#A3DCBF] hover:border-[#0A4C36]'
                        : 'bg-[#FAFAFA] border-[#E5E7EB] opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black leading-none ${
                        node.isReached
                          ? 'bg-[#0A4C36] text-white'
                          : 'bg-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      {node.label}
                    </span>
                    <span className="text-[10px] font-bold text-[#6B7280]">
                      ₹{node.minSpend}
                    </span>
                  </div>

                  <p className="text-[12px] font-extrabold text-[#111827] truncate">
                    {node.title}
                  </p>

                  <p className="text-[10.5px] text-[#4B5563] mt-0.5 truncate">
                    {node.isApplied ? (
                      <span className="text-[#059669] font-bold">Active in bag</span>
                    ) : node.isReached ? (
                      <span className="text-[#059669] font-bold">Unlocked • Tap to apply</span>
                    ) : (
                      <span className="text-[#DC2626] font-semibold">
                        Add ₹{shortfall} more
                      </span>
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. Curated Database Offers Grid (3 to 5 Offers) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-[#111827]">
                Active Coupons & Discounts
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
                Curated directly from our botanical database. One-click copy or instant apply.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curatedOffers.map((offer) => {
              const isApplied =
                appliedCoupon && appliedCoupon.toUpperCase() === offer.code.toUpperCase()
              const isEligible = cartSubtotal >= offer.minSpend
              const isCategoryRestricted =
                offer.applicableCategories.length > 0 &&
                !offer.applicableCategories.includes('*') &&
                !offer.applicableCategories.includes('sitewide')
              const isCopied = copiedCode === offer.code

              return (
                <div
                  key={offer.id}
                  className={`p-4 rounded-[18px] bg-white border transition-all flex flex-col justify-between shadow-xs ${
                    isApplied
                      ? 'border-[#0A4C36] ring-1 ring-[#0A4C36] bg-[#F2FAF5]/50'
                      : 'border-[#E5E7EB] hover:border-[#A3DCBF]'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-[6px] bg-[#EAF4EE] text-[#0A4C36] font-black text-[10px] tracking-wide uppercase">
                        {offer.discountPercent}% OFF
                      </span>

                      {isCategoryRestricted ? (
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#FFF8E1] text-[#B45309] font-extrabold text-[9.5px] uppercase">
                          {offer.applicableCategories.join(', ')} ONLY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#F3F4F6] text-[#4B5563] font-bold text-[9.5px] uppercase">
                          Sitewide
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-extrabold text-[#111827] leading-tight">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {offer.description}
                    </p>

                    {/* Minimum spend note */}
                    <div className="text-[11px]">
                      {offer.minSpend > 0 ? (
                        isEligible ? (
                          <span className="text-[#059669] font-bold">
                            ✓ Unlocked (Min order ₹{offer.minSpend} reached)
                          </span>
                        ) : (
                          <span className="text-[#DC2626] font-semibold">
                            Add ₹{offer.minSpend - cartSubtotal} more to unlock
                          </span>
                        )
                      ) : (
                        <span className="text-[#6B7280] font-medium">
                          No minimum order required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Strip: Code + Copy Icon Button + Apply Button */}
                  <div className="pt-4 mt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 bg-[#F3F4F1] px-2.5 py-1 rounded-[10px] border border-[#E5E7EB]">
                      <span className="font-mono text-xs font-black tracking-wider text-[#1F2937]">
                        {offer.code}
                      </span>
                      {/* Icon-only copy button matching instructions */}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.code)}
                        aria-label={`Copy coupon code ${offer.code}`}
                        title={isCopied ? 'Copied!' : 'Copy Code'}
                        className="p-1 rounded-md text-[#4B5563] hover:text-[#0A4C36] hover:bg-white transition-colors"
                      >
                        {isCopied ? (
                          <GlorovCustomIcons.check size={14} className="text-[#059669]" />
                        ) : (
                          <GlorovCustomIcons.copy size={14} />
                        )}
                      </button>
                    </div>

                    {isApplied ? (
                      <button
                        type="button"
                        onClick={() => removeCoupon()}
                        className="px-3.5 py-1.5 rounded-[10px] bg-white border border-[#0A4C36] text-xs font-extrabold text-[#0A4C36] hover:bg-[#F2FAF5] transition-all"
                      >
                        REMOVE
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!isEligible}
                        onClick={() => handleApplyOffer(offer.code)}
                        className={`px-3.5 py-1.5 rounded-[10px] text-xs font-extrabold transition-all shadow-xs ${
                          isEligible
                            ? 'bg-[#0A4C36] text-white hover:bg-[#135841] active:scale-95 cursor-pointer'
                            : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isEligible ? 'APPLY' : 'LOCKED'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 5. Qualifying Botanical Picks */}
        <section className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-[#111827]">
                Qualifying Botanical Picks
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
                Add these handpicked cultivars and supplies to reach your next milestone.
              </p>
            </div>
            <Link
              href="/categories/seeds"
              className="text-xs font-extrabold text-[#0A4C36] hover:underline"
            >
              Explore All Cultivars &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {qualifyingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showWishlist={true}
                showSubtitle={false}
              />
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  )
}
