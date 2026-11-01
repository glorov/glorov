'use client'

import React, { useState, useEffect } from 'react'
import { Gift, Check, Copy } from 'lucide-react'
import styles from './OfferBanner.module.css'

export interface StoreOffer {
  id: string
  code: string
  title: string
  tag: string
  description: string
  discount_badge: string
  discount_type: string
  discount_value: number
  min_spend?: number
  min_spend_text?: string
  expiry_text?: string
  bg_color?: string
  text_color?: string
  accent_color?: string
  is_active: boolean
}

const DEFAULT_OFFER: StoreOffer = {
  id: 'offer_welcome_glorov10',
  code: 'GLOROV10',
  title: 'Special Welcome Offer',
  tag: 'SPECIAL WELCOME OFFER',
  description:
    'Use code GLOROV10 at checkout for an extra 10% off your entire botanical order.',
  discount_badge: '10% OFF',
  discount_type: 'percentage',
  discount_value: 10,
  min_spend: 499,
  min_spend_text: 'Min Order: ₹499',
  bg_color: '#EAF4EE',
  text_color: '#1B3B2B',
  accent_color: '#1E3D2F',
  is_active: true,
}

export function OfferBanner() {
  const [offer, setOffer] = useState<StoreOffer>(DEFAULT_OFFER)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const fetchOffer = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
        const res = await fetch(`${backendUrl}/store/offers`, { next: { revalidate: 60 } })
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.welcome_offer) {
            setOffer(data.welcome_offer)
          }
        }
      } catch {
        // Fall back gracefully to DEFAULT_OFFER
      }
    }

    fetchOffer()
    return () => {
      isMounted = false
    }
  }, [])

  if (!offer.is_active) {
    return null
  }

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(offer.code)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className={styles.bannerWrapper}>
      <div
        className={styles.bannerCard}
        style={{
          backgroundColor: offer.bg_color || '#EAF4EE',
          borderColor: offer.accent_color ? `${offer.accent_color}40` : undefined,
        }}
      >
        <div className={styles.leftGroup}>
          <div
            className={styles.iconCircle}
            style={{ backgroundColor: offer.accent_color || '#1E3D2F' }}
          >
            <Gift size={20} />
          </div>

          <div className={styles.textGroup}>
            <span
              className={styles.eyebrow}
              style={{ color: offer.accent_color || '#1E3D2F' }}
            >
              {offer.tag}
            </span>
            <p
              className={styles.headline}
              style={{ color: offer.text_color || '#1B3B2B' }}
            >
              {offer.description}
            </p>
          </div>
        </div>

        <div className={styles.actionGroup}>
          <div className={styles.couponPill}>
            <span className={styles.couponCode}>{offer.code}</span>
            <button
              type="button"
              onClick={handleCopy}
              className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
              aria-label={`Copy discount code ${offer.code}`}
            >
              {copied ? (
                <>
                  <Check size={12} />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {offer.discount_badge && (
            <span className={styles.discountBadge}>{offer.discount_badge}</span>
          )}
        </div>
      </div>
    </div>
  )
}
