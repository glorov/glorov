'use client'

import React, { useState, useEffect } from 'react'
import {
  Tag,
  Copy,
  Check,
  Percent,
  CreditCard,
  Sprout,
  Leaf,
  Info,
} from 'lucide-react'
import styles from './OffersPage.module.css'

export interface CouponItem {
  id: string
  code: string
  title: string
  discountBadge: string
  category: 'sitewide' | 'seeds' | 'plants' | 'bank'
  tag: string
  description: string
  minSpend: string
  expiry: string
}

export const ACTIVE_OFFERS: CouponItem[] = [
  {
    id: 'thunder-15',
    code: 'THUNDER15',
    title: 'Monsoon Thunder Sale',
    discountBadge: '15% OFF',
    category: 'sitewide',
    tag: 'Limited Time',
    description: 'Flat 15% discount across all conditioned indoor plants and heirloom seed collections.',
    minSpend: 'Min Order: ₹1,199',
    expiry: 'Expires in 4 days',
  },
  {
    id: 'welcome-100',
    code: 'WELCOME100',
    title: 'First Green Addition',
    discountBadge: '₹100 OFF',
    category: 'sitewide',
    tag: 'New Plant Parent',
    description: 'Flat ₹100 instant discount on your first living botanical order from our Pune nursery.',
    minSpend: 'Min Order: ₹599',
    expiry: 'Valid on first order',
  },
  {
    id: 'heirloom-20',
    code: 'HEIRLOOM20',
    title: 'Desi Heirloom Seed Fest',
    discountBadge: '20% OFF',
    category: 'seeds',
    tag: '0% GST HSN 1209',
    description: 'Extra 20% savings on pure desi vegetable, culinary herb, and festive flower seed packets.',
    minSpend: 'Min Order: ₹499',
    expiry: 'Seasonal planting special',
  },
  {
    id: 'air-plants-150',
    code: 'AIRPLANTS150',
    title: 'Air-Purifying Green Haven',
    discountBadge: '₹150 OFF',
    category: 'plants',
    tag: 'Living Foliage',
    description: 'Flat ₹150 OFF on Peace Lilies, Sansevierias, and Money Plants conditioned for indoor low-light.',
    minSpend: 'Min Order: ₹999',
    expiry: 'Valid on live plants',
  },
  {
    id: 'upi-pay-50',
    code: 'UPIPAY50',
    title: 'Razorpay UPI Instant Cashback',
    discountBadge: '₹50 CASH',
    category: 'bank',
    tag: 'Instant Payment',
    description: 'Flat ₹50 instant discount applied when paying securely via Google Pay, PhonePe, or BHIM UPI.',
    minSpend: 'Min Order: ₹799',
    expiry: 'All UPI transactions',
  },
  {
    id: 'green-friend',
    code: 'GREENFRIEND',
    title: 'Community Referral Voucher',
    discountBadge: '₹150 OFF',
    category: 'sitewide',
    tag: 'Plant Parent Club',
    description: 'Gift ₹150 to a fellow plant parent and receive 200 Green Coins once delivered safely.',
    minSpend: 'Min Order: ₹699',
    expiry: 'No expiry',
  },
]

const FILTER_TABS = [
  { id: 'all', label: 'All Offers (6)', icon: Tag },
  { id: 'sitewide', label: 'Sitewide Codes', icon: Percent },
  { id: 'seeds', label: '0% GST Seeds', icon: Sprout },
  { id: 'plants', label: 'Live Plants', icon: Leaf },
  { id: 'bank', label: 'UPI & Bank Offers', icon: CreditCard },
]

export function CouponVaultInteractive() {
  const [offersList, setOffersList] = useState<CouponItem[]>(ACTIVE_OFFERS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchOffers = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
        const res = await fetch(`${backendUrl}/store/offers`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && Array.isArray(data.offers) && data.offers.length > 0) {
            const mapped: CouponItem[] = data.offers.map((o: {
              id: string
              code: string
              title: string
              discount_badge: string
              category: string
              tag: string
              description: string
              min_spend_text?: string
              min_spend?: number
              expiry_text?: string
            }) => ({
              id: o.id,
              code: o.code,
              title: o.title,
              discountBadge: o.discount_badge,
              category: o.category === 'welcome' ? 'sitewide' : (o.category as CouponItem['category']),
              tag: o.tag,
              description: o.description,
              minSpend: o.min_spend_text || `Min Order: ₹${o.min_spend || 499}`,
              expiry: o.expiry_text || 'Active Deal',
            }))
            setOffersList(mapped)
          }
        }
      } catch {
        // Retain default ACTIVE_OFFERS
      }
    }

    fetchOffers()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredOffers =
    selectedCategory === 'all'
      ? offersList
      : offersList.filter((offer) => offer.category === selectedCategory)

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code)
    }
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev))
    }, 3000)
  }

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className={styles.filterTabsRow} role="tablist" aria-label="Filter Promotional Offers">
        {FILTER_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
              onClick={() => setSelectedCategory(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Coupons Grid */}
      <div className={styles.couponsGrid} role="region" aria-label="Available Coupons List">
        {filteredOffers.map((offer) => {
          const isCopied = copiedCode === offer.code
          return (
            <article key={offer.id} className={styles.couponCard}>
              <div className={styles.cardHeader}>
                <span className={styles.couponDiscountBadge}>{offer.discountBadge}</span>
                <span className={styles.couponTag}>{offer.tag}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.couponTitle}>{offer.title}</h3>
                <p className={styles.couponDesc}>{offer.description}</p>
                <div className={styles.minSpendRow}>
                  <Info size={13} />
                  <span>{offer.minSpend} • {offer.expiry}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.codePill} aria-label={`Coupon code ${offer.code}`}>
                  {offer.code}
                </div>
                <button
                  type="button"
                  className={`${styles.copyCodeBtn} ${isCopied ? styles.copyCodeBtnSuccess : ''}`}
                  onClick={() => handleCopyCode(offer.code)}
                  aria-label={`Copy coupon code ${offer.code}`}
                >
                  {isCopied ? (
                    <>
                      <Check size={14} />
                      <span>Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
