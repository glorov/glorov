'use client'

import React from 'react'
import { Percent, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './CartCouponCard.module.css'

export function CartCouponCard() {
  const { appliedCoupon, removeCoupon, openOffersDrawer, isMutating } = useCart()

  return (
    <div className={styles.couponCardContainer}>
      <div className={styles.couponTopRow}>
        <div className={styles.couponInfoGroup}>
          <div className={styles.percentBadge}>
            <Percent size={14} />
          </div>
          <div className={styles.textStack}>
            <span className={styles.couponTitle}>
              {appliedCoupon
                ? `${appliedCoupon.discount_value}% OFF ${
                    appliedCoupon.min_spend ? `On orders above ₹${appliedCoupon.min_spend}` : ''
                  }`
                : '10% OFF On orders above ₹999'}
            </span>
            <span className={styles.couponCode}>
              {appliedCoupon ? `Code: ${appliedCoupon.code}` : 'Code: DIWALI10'}
            </span>
          </div>
        </div>

        {appliedCoupon ? (
          <button
            type="button"
            onClick={removeCoupon}
            disabled={isMutating}
            className={styles.removeCouponBtn}
            aria-label={`Remove coupon ${appliedCoupon.code}`}
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={openOffersDrawer}
            className={styles.applyCouponBtn}
            aria-label="View and apply promotional coupons"
          >
            <Tag size={13} />
            <span>Apply</span>
          </button>
        )}
      </div>

      <div className={styles.divider} />

      <button
        type="button"
        onClick={openOffersDrawer}
        className={styles.viewAllBtn}
        aria-label="View all promotional coupons"
      >
        <span>View all coupons</span>
        <ArrowRight size={14} className={styles.arrowIcon} />
      </button>
    </div>
  )
}
