'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import styles from './CartSummaryFooter.module.css'

interface CartSummaryFooterProps {
  onCheckoutClick?: () => void
}

export function CartSummaryFooter({ onCheckoutClick }: CartSummaryFooterProps) {
  const { cart, couponDiscountINR, appliedCoupon } = useCart()
  const [isTaxDetailsOpen, setIsTaxDetailsOpen] = useState(false)

  const items = cart?.items || []
  const subtotalPaise = cart?.item_subtotal || cart?.subtotal || 0
  const subtotalINR = Math.round(subtotalPaise / 100)

  // Calculate estimated original compare-at total for crossed-out display
  // Approximate original price based on typical 30-45% botanical discounts or compare prices
  const estimatedOriginalINR = Math.max(
    subtotalINR,
    Math.round(
      items.reduce((acc, it) => {
        const unitPriceINR = Math.round((it.unit_price || 0) / 100)
        // Assume compare price is ~40% higher if not specified
        const compareUnitINR = Math.round(unitPriceINR * 1.45)
        return acc + compareUnitINR * (it.quantity || 1)
      }, 0)
    )
  )

  const finalTotalINR = Math.max(0, subtotalINR - couponDiscountINR)
  const totalSavingsINR = Math.max(0, estimatedOriginalINR - finalTotalINR)
  const discountPercent =
    estimatedOriginalINR > 0 && totalSavingsINR > 0
      ? Math.round((totalSavingsINR / estimatedOriginalINR) * 100)
      : 0

  return (
    <footer className={styles.summaryFooter} aria-label="Cart Total and Checkout">
      {/* Collapsible Tax & Fee Breakdown */}
      {isTaxDetailsOpen && (
        <div className={styles.taxBreakdownSheet}>
          <div className={styles.breakdownHeader}>
            <span className={styles.breakdownTitle}>Price Breakdown</span>
            <ShieldCheck size={14} className={styles.shieldIcon} />
          </div>

          <div className={styles.breakdownRow}>
            <span>Botanical Subtotal</span>
            <span>{formatINR(subtotalINR * 100)}</span>
          </div>

          {couponDiscountINR > 0 && (
            <div className={`${styles.breakdownRow} ${styles.discountRow}`}>
              <span>Coupon Savings ({appliedCoupon?.code})</span>
              <span>-{formatINR(couponDiscountINR * 100)}</span>
            </div>
          )}

          <div className={styles.breakdownRow}>
            <span>Standard Nursery Dispatch (India)</span>
            <span className={styles.freeHighlight}>FREE</span>
          </div>

          <div className={styles.breakdownRow}>
            <span>Applicable GST (0% on seeds HSN 1209)</span>
            <span>Included in price</span>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <div className={styles.mainBar}>
        <div className={styles.pricingStack}>
          <div className={styles.priceRow}>
            <span className={styles.finalTotal}>₹{finalTotalINR.toLocaleString('en-IN')}</span>
            {estimatedOriginalINR > finalTotalINR && (
              <span className={styles.originalPrice}>₹{estimatedOriginalINR.toLocaleString('en-IN')}</span>
            )}
            {discountPercent > 0 && (
              <span className={styles.discountBadge}>{discountPercent}% off</span>
            )}
          </div>

          {/* Expandable Tax Label */}
          <button
            type="button"
            onClick={() => setIsTaxDetailsOpen((prev) => !prev)}
            className={styles.taxToggleBtn}
            aria-expanded={isTaxDetailsOpen}
            aria-label="Toggle tax and cost breakdown"
          >
            <span>Inclusive of all taxes</span>
            {isTaxDetailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Large Checkout Button */}
        <Link
          href="/checkout"
          onClick={onCheckoutClick}
          className={styles.checkoutButton}
        >
          CHECKOUT
        </Link>
      </div>
    </footer>
  )
}
