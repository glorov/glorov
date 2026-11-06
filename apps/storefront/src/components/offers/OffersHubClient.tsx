'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PageContainer } from '../layout/PageContainer'
import { Breadcrumbs } from '../layout/Breadcrumbs'
import { ProductCard } from '../product/ProductCard'
import { useStorefront, FREE_SHIPPING_THRESHOLD } from '../../context/StorefrontContext'
import { GlorovOfferIcon } from '../common/GlorovIcons'
import { RawOfferLike, normalizeOffer } from '../../lib/roadmap-utils'
import type { GlorovProductItem } from '../../types/storefront'

export interface BotanicalVoucher {
  id: string
  code: string
  title: string
  discountHighlight: string
  badge: string
  badgeVariant: 'emerald' | 'gold' | 'indigo' | 'rose'
  description: string
  minSpend: number
  maxDiscount?: number
  expiryText: string
  category: 'all' | 'discounts' | 'shipping' | 'welcome'
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue: number
}

const CANONICAL_VOUCHERS: BotanicalVoucher[] = [
  {
    id: 'voucher_glorov15',
    code: 'GLOROV15',
    title: 'Sitewide Botanical Sprout Discount',
    discountHighlight: 'FLAT 15% OFF',
    badge: 'MOST POPULAR',
    badgeVariant: 'emerald',
    description: 'Save 15% on all Desi heirloom seeds and indoor living houseplants.',
    minSpend: 499,
    maxDiscount: 250,
    expiryText: 'Valid for next 7 days',
    category: 'discounts',
    discountType: 'percentage',
    discountValue: 15,
  },
  {
    id: 'voucher_welcome100',
    code: 'WELCOME100',
    title: 'First-Time Nursery Welcome Bonus',
    discountHighlight: '₹100 FLAT OFF',
    badge: 'NEW GROWERS',
    badgeVariant: 'gold',
    description: 'Flat ₹100 instant savings on your first botanical order of fresh seeds & nursery plants.',
    minSpend: 599,
    maxDiscount: 100,
    expiryText: 'Valid on 1st order',
    category: 'welcome',
    discountType: 'fixed',
    discountValue: 100,
  },
  {
    id: 'voucher_freeship',
    code: 'FREESHIP',
    title: 'Pan-India Free Express Cold-Chain Delivery',
    discountHighlight: 'FREE DELIVERY',
    badge: 'ZERO DELIVERY FEE',
    badgeVariant: 'indigo',
    description: 'Enjoy 100% moisture-conditioned safe transit dispatch across India at zero shipping cost.',
    minSpend: 499,
    expiryText: 'Ongoing Offer',
    category: 'shipping',
    discountType: 'free_shipping',
    discountValue: 0,
  },
  {
    id: 'voucher_greenhome20',
    code: 'GREENHOME20',
    title: 'Living Indoor Foliage & Houseplants Special',
    discountHighlight: '20% OFF PLANTS',
    badge: 'LIMITED TIME',
    badgeVariant: 'emerald',
    description: 'Exclusive 20% savings on NASA air-purifying indoor houseplants and tabletop succulents.',
    minSpend: 899,
    maxDiscount: 350,
    expiryText: 'Expires this Sunday',
    category: 'discounts',
    discountType: 'percentage',
    discountValue: 20,
  },
  {
    id: 'voucher_desiseeds10',
    code: 'DESISEEDS10',
    title: 'Indigenous Heirloom Seed Packets Discount',
    discountHighlight: '10% OFF SEEDS',
    badge: 'HIGH GERMINATION',
    badgeVariant: 'rose',
    description: '10% off open-pollinated Desi vegetable seeds and seasonal flower varieties with 98% vigor.',
    minSpend: 349,
    maxDiscount: 150,
    expiryText: 'Active Today',
    category: 'discounts',
    discountType: 'percentage',
    discountValue: 10,
  },
]

export interface OffersHubClientProps {
  initialOffers?: RawOfferLike[]
}

/**
 * GLOROV E-Commerce Offers & Vouchers Hub
 * Redesigned based on modern online coupon UX best practices:
 * - High-converting perforated ticket voucher cards
 * - 1-tap clipboard copy with animated visual feedback
 * - Direct "Apply in Bag" button integrated with cart state
 * - Live cart spend indicator and remaining spend shortfall
 * - Filter tabs: All Offers, Discounts, Free Delivery, First Order
 * - Curated discounted botanical products grid
 * - Multi-device responsive grid (mobile stacked ticket, desktop 2-column vouchers)
 */
export function OffersHubClient({ initialOffers }: OffersHubClientProps) {
  const {
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    showToast,
    cartCount,
  } = useStorefront()

  const [activeTab, setActiveTab] = useState<'all' | 'discounts' | 'shipping' | 'welcome'>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [qualifyingProducts, setQualifyingProducts] = useState<GlorovProductItem[]>([])
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null)

  // Merge any dynamic offers from backend with canonical vouchers
  const allVouchers = useMemo<BotanicalVoucher[]>(() => {
    if (!initialOffers || initialOffers.length === 0) {
      return CANONICAL_VOUCHERS
    }

    const dynamicVouchers: BotanicalVoucher[] = initialOffers
      .map(normalizeOffer)
      .filter((o) => o.isActive && o.code)
      .map((o) => ({
        id: o.id,
        code: o.code,
        title:
          o.title && !o.title.toLowerCase().match(/^\d+%\s*off$/)
            ? o.title
            : `Botanical Order Savings`,
        discountHighlight:
          o.discountType === 'free_shipping'
            ? 'FREE DELIVERY'
            : o.discountType === 'fixed'
              ? `₹${o.discountPercent} FLAT OFF`
              : `${o.discountPercent}% OFF`,
        badge: o.discountType === 'free_shipping' ? 'FREE SHIPPING' : 'EXCLUSIVE',
        badgeVariant: 'emerald' as const,
        description: o.description || 'Special promotional discount on verified botanical selections.',
        minSpend: o.minSpend || 0,
        expiryText: 'Limited Period Offer',
        category: (o.discountType === 'free_shipping' ? 'shipping' : 'discounts') as BotanicalVoucher['category'],
        discountType: o.discountType,
        discountValue: o.discountPercent,
      }))

    // Combine avoiding duplicate codes
    const codes = new Set(dynamicVouchers.map((v) => v.code))
    const nonDuplicated = CANONICAL_VOUCHERS.filter((v) => !codes.has(v.code))
    return [...dynamicVouchers, ...nonDuplicated]
  }, [initialOffers])

  // Filter vouchers by active tab
  const displayedVouchers = useMemo(() => {
    if (activeTab === 'all') return allVouchers
    return allVouchers.filter((v) => v.category === activeTab)
  }, [allVouchers, activeTab])

  // Fetch qualifying discounted products
  useEffect(() => {
    let isMounted = true
    fetch('/api/products?limit=16')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !Array.isArray(data.products)) return
        const discounted = data.products
          .filter((p: GlorovProductItem) => p.discountPrice !== undefined && p.discountPrice < p.price)
          .slice(0, 4)
        setQualifyingProducts(discounted.length > 0 ? discounted : data.products.slice(0, 4))
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code)
        setCopiedCode(code)
        showToast('success', `Coupon code "${code}" copied to clipboard!`)
        setTimeout(() => setCopiedCode(null), 2500)
      } else {
        setCopiedCode(code)
        showToast('info', `Coupon code: ${code}`)
        setTimeout(() => setCopiedCode(null), 2500)
      }
    } catch {
      showToast('info', `Coupon code: ${code}`)
    }
  }

  const handleApplyVoucher = (voucher: BotanicalVoucher) => {
    if (cartCount === 0) {
      handleCopyCode(voucher.code)
      showToast('info', `Code "${voucher.code}" copied! Add items to bag to use it.`)
      return
    }

    if (cartSubtotal < voucher.minSpend) {
      const shortfall = voucher.minSpend - cartSubtotal
      showToast(
        'warning',
        `Add ₹${shortfall.toLocaleString('en-IN')} more to your bag to unlock ${voucher.code}`
      )
      return
    }

    const ok = applyCoupon(voucher.code)
    if (ok) {
      showToast('success', `🎉 Code ${voucher.code} applied successfully!`)
    }
  }

  return (
    <div className="w-full bg-[#F9FAF8] pb-16">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Offers & Coupons' },
        ]}
      />

      {/* 2. Hero Promotional Header */}
      <section className="relative w-full bg-[#081C15] text-white py-10 sm:py-14 border-b border-white/10 overflow-hidden">
        {/* Subtle botanical backdrop glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1B4332]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#52B788]/20 rounded-full blur-2xl pointer-events-none" />

        <PageContainer className="relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B4332] border border-[#52B788]/30">
              <GlorovOfferIcon size={16} className="text-[#86EFAC]" />
              <span className="text-[11px] font-extrabold tracking-wider text-[#86EFAC] uppercase">
                EXCLUSIVE GARDEN OFFERS &amp; VOUCHERS
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight">
              Grow More. Save More.
            </h1>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal max-w-2xl">
              Clip verified discount coupons, unlock instant cart savings, and enjoy 100% moisture-conditioned cold-chain dispatch across India.
            </p>

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2 text-[11.5px] sm:text-xs text-white/90">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#52B788]" />
                1-Tap Instant Apply
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#52B788]" />
                Free Delivery Above ₹{FREE_SHIPPING_THRESHOLD}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#52B788]" />
                100% Safe Transit Guarantee
              </span>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-6 sm:py-8 space-y-8">
        {/* 3. Live Shopping Bag Spend & Auto-Apply Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E8F5E9] text-[#1B4332] text-xs font-bold">
                🛍️
              </span>
              <span className="text-sm font-bold text-[#111827]">
                Shopping Bag Total:{' '}
                <strong className="text-[#1B4332] font-black text-base">₹{cartSubtotal}</strong>
                {cartCount > 0 && (
                  <span className="text-xs font-medium text-[#6B7280] ml-1">
                    ({cartCount} {cartCount === 1 ? 'specimen' : 'specimens'})
                  </span>
                )}
              </span>
            </div>

            <p className="text-xs text-[#4B5563]">
              {appliedCoupon ? (
                <span className="text-[#059669] font-bold flex items-center gap-1">
                  <span>✓ Coupon</span>
                  <span className="font-mono bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0] text-[#065F46]">
                    {appliedCoupon}
                  </span>
                  <span>is active in your bag!</span>
                </span>
              ) : cartSubtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-[#059669] font-semibold">
                  ✓ Congratulations! You qualify for Pan-India Free Delivery!
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="text-[#1B4332]">
                    ₹{FREE_SHIPPING_THRESHOLD - cartSubtotal}
                  </strong>{' '}
                  more to unlock <strong>FREE Express Delivery</strong>.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {appliedCoupon && (
              <button
                type="button"
                onClick={removeCoupon}
                className="px-3 py-2 rounded-full border border-[#E5E7EB] hover:border-[#DC2626] text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              >
                Remove Code
              </button>
            )}

            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold active:scale-95 transition-colors"
            >
              <span>View Shopping Bag</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 4. Voucher Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            }`}
          >
            All Offers ({allVouchers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discounts')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border shrink-0 ${
              activeTab === 'discounts'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            }`}
          >
            Discount Coupons (3)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border shrink-0 ${
              activeTab === 'shipping'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            }`}
          >
            Free Delivery (1)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('welcome')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border shrink-0 ${
              activeTab === 'welcome'
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:text-[#111827]'
            }`}
          >
            New Growers (1)
          </button>
        </div>

        {/* 5. Authentic Voucher Ticket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {displayedVouchers.map((voucher) => {
            const isApplied = appliedCoupon?.toUpperCase() === voucher.code.toUpperCase()
            const isCopied = copiedCode === voucher.code
            const isEligible = cartCount > 0 && cartSubtotal >= voucher.minSpend
            const shortfall = Math.max(0, voucher.minSpend - cartSubtotal)

            const badgeBg =
              voucher.badgeVariant === 'emerald'
                ? 'bg-[#E8F5E9] text-[#1B4332] border-[#C8E6C9]'
                : voucher.badgeVariant === 'gold'
                  ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                  : voucher.badgeVariant === 'indigo'
                    ? 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]'
                    : 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]'

            return (
              <div
                key={voucher.id}
                className={`relative rounded-2xl bg-white border transition-colors duration-200 overflow-hidden flex flex-col justify-between ${
                  isApplied
                    ? 'border-[#1B4332] ring-2 ring-[#1B4332]/20'
                    : 'border-[#E5E7EB] hover:border-[#1B4332]'
                }`}
              >
                {/* Perforated Scallop Punch Holes on Left and Right borders */}
                <div className="hidden sm:block absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-[#F9FAF8] border-r border-[#E5E7EB] -translate-y-1/2 pointer-events-none z-10" />
                <div className="hidden sm:block absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-[#F9FAF8] border-l border-[#E5E7EB] -translate-y-1/2 pointer-events-none z-10" />

                {/* Top Voucher Body Area */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${badgeBg}`}
                    >
                      {voucher.badge}
                    </span>

                    <span className="text-[11px] font-semibold text-[#6B7280]">
                      {voucher.expiryText}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-serif text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
                      {voucher.discountHighlight}
                    </div>
                    {voucher.title &&
                      voucher.title.trim().toLowerCase() !==
                        voucher.discountHighlight.trim().toLowerCase() && (
                        <h3 className="text-sm font-bold text-[#1F2937]">
                          {voucher.title}
                        </h3>
                      )}
                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {voucher.description}
                    </p>
                  </div>

                  {/* Conditions line */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                    <span>Min spend: ₹{voucher.minSpend}</span>
                    {voucher.maxDiscount && (
                      <>
                        <span>•</span>
                        <span>Max discount: ₹{voucher.maxDiscount}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Ticket Perforated Divider & Coupon Action Box */}
                <div className="bg-[#FAFBF9] border-t border-dashed border-[#E5E7EB] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Coupon Code Pill */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-dashed border-[#1B4332]/40">
                      <span className="font-mono text-xs sm:text-sm font-black text-[#1B4332] tracking-wider">
                        {voucher.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(voucher.code)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-white border border-transparent hover:border-[#E5E7EB] transition-all"
                      title="Copy code to clipboard"
                    >
                      {isCopied ? (
                        <span className="text-[#059669] font-bold">✓ Copied!</span>
                      ) : (
                        <span>Copy Code</span>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Primary CTA */}
                  <div>
                    {isApplied ? (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D8F3DC] text-[#1B4332] text-xs font-bold border border-[#A3DCBF]">
                        <span>✓ Applied in Bag</span>
                      </div>
                    ) : isEligible ? (
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher(voucher)}
                        className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold active:scale-95 transition-colors"
                      >
                        Apply in Bag &rarr;
                      </button>
                    ) : cartCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher(voucher)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] text-[11.5px] font-bold transition-all text-center"
                      >
                        Add ₹{shortfall} to Unlock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(voucher.code)}
                        className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold active:scale-95 transition-colors"
                      >
                        {isCopied ? '✓ Copied' : 'Copy Code'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 6. How Offers Work — Simple 3-Step Educational Strip */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#14532D]">
              How to Redeem Your Botanical Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#14532D]">Select Botanicals</h3>
                <p className="text-[11px] text-[#166534] mt-0.5 leading-relaxed">
                  Browse indigenous Desi seeds and living air-purifying plants to meet the offer minimum spend.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#14532D]">Clip or Apply</h3>
                <p className="text-[11px] text-[#166534] mt-0.5 leading-relaxed">
                  Click &apos;Apply in Bag&apos; directly from this page, or enter the code in your shopping cart voucher field.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#16A34A] text-white text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#14532D]">Enjoy Guaranteed Dispatch</h3>
                <p className="text-[11px] text-[#166534] mt-0.5 leading-relaxed">
                  Enjoy instant discount deductions and 100% transit-safe nursery packaging delivered to your door.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Qualifying Discounted Products on Sale */}
        {qualifyingProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#52B788] uppercase tracking-wider">
                  FEATURED SALE SELECTIONS
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-black text-[#111827] mt-0.5">
                  Qualifying Sale Botanicals
                </h2>
              </div>

              <Link
                href="/categories"
                className="text-xs font-bold text-[#1B4332] hover:text-[#2D6A4F] transition-colors"
              >
                Browse All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {qualifyingProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* 8. Frequently Asked Questions (FAQ Accordion) */}
        <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#111827]">
            Frequently Asked Questions About Offers
          </h2>

          <div className="space-y-2">
            {[
              {
                q: 'How do I apply a voucher to my order?',
                a: 'Simply tap "Apply in Bag" on any coupon card above if you meet the minimum spend. Alternatively, copy the code and paste it into the "Apply Coupon" field on the Cart or Checkout screen.',
              },
              {
                q: 'Can I combine multiple discount coupon codes?',
                a: 'Only one promo discount code can be active per transaction. However, coupons can be seamlessly combined with our automatic Free Shipping threshold (orders above ₹499)!',
              },
              {
                q: 'What is the Free Express Shipping condition?',
                a: 'All orders with a cart subtotal of ₹499 or more automatically qualify for 100% Free Pan-India Delivery with moisture-safe cold-chain packaging.',
              },
              {
                q: 'Do discount vouchers apply to discounted sale items?',
                a: 'Yes! Sitewide vouchers like GLOROV15 and WELCOME100 apply to already discounted botanical specimens unless explicitly specified.',
              },
            ].map((faq, idx) => {
              const isExpanded = expandedFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-[#111827] hover:bg-[#F9FAF8]"
                  >
                    <span>{faq.q}</span>
                    <span className="text-base font-normal text-[#6B7280]">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-[#4B5563] leading-relaxed border-t border-[#F3F4F6] bg-[#FAFBF9]">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
