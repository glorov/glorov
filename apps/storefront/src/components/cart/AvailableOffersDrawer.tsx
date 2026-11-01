'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, ArrowRight, Loader2, Tag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import {
  fetchAvailableOffers,
  type CouponOffer,
  FALLBACK_COUPONS,
} from '@/lib/coupons'
import { formatINR } from '@/lib/utils'
import styles from './AvailableOffersDrawer.module.css'

export function AvailableOffersDrawer() {
  const {
    cart,
    isOffersDrawerOpen,
    closeOffersDrawer,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscountINR,
    isMutating,
  } = useCart()

  const [offers, setOffers] = useState<CouponOffer[]>(FALLBACK_COUPONS)
  const [customCode, setCustomCode] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [loadingCode, setLoadingCode] = useState<string | null>(null)

  const subtotalPaise = cart?.item_subtotal || cart?.subtotal || 0
  const subtotalINR = Math.round(subtotalPaise / 100)

  // Fetch live evaluated offers when drawer opens or cart subtotal changes
  useEffect(() => {
    if (!isOffersDrawerOpen) return

    let isMounted = true
    fetchAvailableOffers(subtotalINR).then((fetched) => {
      if (isMounted && fetched.length > 0) {
        setOffers(fetched)
      }
    })

    return () => {
      isMounted = false
    }
  }, [isOffersDrawerOpen, subtotalINR])

  // Escape listener
  useEffect(() => {
    if (!isOffersDrawerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOffersDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOffersDrawerOpen, closeOffersDrawer])

  if (!isOffersDrawerOpen) return null

  const handleApply = async (code: string) => {
    setActionError(null)
    setActionSuccess(null)
    setLoadingCode(code)

    const res = await applyCoupon(code)
    setLoadingCode(null)

    if (res.success) {
      setActionSuccess(res.message || `Coupon ${code} applied!`)
      setTimeout(() => {
        setActionSuccess(null)
        closeOffersDrawer()
      }, 900)
    } else {
      setActionError(res.message || 'Could not apply coupon')
    }
  }

  const handleRemove = (code: string) => {
    removeCoupon()
    setActionSuccess(`Removed coupon ${code}`)
    setTimeout(() => setActionSuccess(null), 1200)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customCode.trim()) return
    handleApply(customCode.trim())
  }

  // Calculate cart pricing for drawer footer
  const originalSubtotal = subtotalINR
  const finalTotal = Math.max(0, subtotalINR - couponDiscountINR)
  const discountPercent =
    originalSubtotal > 0 && couponDiscountINR > 0
      ? Math.round((couponDiscountINR / originalSubtotal) * 100)
      : 0

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="available-offers-title"
      onClick={closeOffersDrawer}
    >
      <div
        className={styles.modalPanel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="available-offers-title" className={styles.modalTitle}>
            Available Offers
          </h2>
          <button
            type="button"
            onClick={closeOffersDrawer}
            className={styles.closeBtn}
            aria-label="Close available offers"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alerts */}
        {actionSuccess && (
          <div className={styles.successBanner}>
            <Check size={14} />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className={styles.errorBanner}>
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className={styles.dismissBtn}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Direct Promo Code Input Form */}
        <form onSubmit={handleCustomSubmit} className={styles.codeForm}>
          <div className={styles.inputWrap}>
            <Tag size={15} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Enter coupon code"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              className={styles.codeInput}
              autoCapitalize="characters"
            />
          </div>
          <button
            type="submit"
            disabled={!customCode.trim() || isMutating}
            className={styles.codeSubmitBtn}
          >
            {loadingCode === customCode.trim() ? (
              <Loader2 size={14} className={styles.spinner} />
            ) : (
              'Apply'
            )}
          </button>
        </form>

        {/* Offers Cards List */}
        <div className={styles.offersList}>
          {offers.map((offer) => {
            const isApplied = appliedCoupon?.code.toUpperCase() === offer.code.toUpperCase()
            const minSpend = offer.min_spend || 0
            const isEligible = subtotalINR >= minSpend
            const needed = Math.max(0, minSpend - subtotalINR)
            const isLoadingThis = loadingCode === offer.code

            return (
              <div
                key={offer.id || offer.code}
                className={`${styles.offerCard} ${isApplied ? styles.offerCardApplied : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.offerBadgeTitle}>
                      {offer.discount_badge || offer.title}
                    </h3>
                    <p className={styles.offerSpendReq}>
                      {offer.min_spend_text || `On orders above ₹${minSpend}`}
                    </p>
                    <p className={styles.offerCodeDisplay}>
                      Code: <strong>{offer.code}</strong>
                    </p>
                    {offer.terms && (
                      <p className={styles.offerTerms}>
                        {offer.terms}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className={styles.cardActionArea}>
                    {isApplied ? (
                      <button
                        type="button"
                        onClick={() => handleRemove(offer.code)}
                        disabled={isMutating}
                        className={styles.removeBtn}
                        aria-label={`Remove coupon ${offer.code}`}
                      >
                        REMOVE
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(offer.code)}
                        disabled={isMutating || isLoadingThis || !isEligible}
                        className={`${styles.applyBtn} ${!isEligible ? styles.applyBtnDisabled : ''}`}
                        title={
                          !isEligible
                            ? `Add ₹${needed} more to unlock this offer`
                            : `Apply ${offer.code}`
                        }
                        aria-label={`Apply coupon ${offer.code}`}
                      >
                        {isLoadingThis ? (
                          <Loader2 size={14} className={styles.spinner} />
                        ) : (
                          'APPLY'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isEligible && (
                  <div className={styles.unlockedHelper}>
                    Add ₹{needed} more to unlock this offer
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sticky Footer */}
        <div className={styles.drawerFooter}>
          <div className={styles.footerPricing}>
            <div className={styles.priceLine}>
              <span className={styles.currentTotal}>{formatINR(finalTotal * 100)}</span>
              {couponDiscountINR > 0 && (
                <span className={styles.originalTotal}>{formatINR(originalSubtotal * 100)}</span>
              )}
              {discountPercent > 0 && (
                <span className={styles.discountPill}>{discountPercent}% off</span>
              )}
            </div>
            <span className={styles.taxNote}>Inclusive of all taxes</span>
          </div>

          <button
            type="button"
            onClick={closeOffersDrawer}
            className={styles.checkoutBtn}
          >
            <span>APPLY &amp; CONTINUE</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
