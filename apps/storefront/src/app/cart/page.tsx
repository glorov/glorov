'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Sprout,
  Loader2,
  Tag,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import { PincodeChecker } from '@/components/shipping/PincodeChecker'
import { CartMilestoneMeter } from '@/components/cart/CartMilestoneMeter'
import { CartRecommendations } from '@/components/cart/CartRecommendations'
import { CartCouponCard } from '@/components/cart/CartCouponCard'
import { AvailableOffersDrawer } from '@/components/cart/AvailableOffersDrawer'
import { CartSummaryFooter } from '@/components/cart/CartSummaryFooter'
import styles from './CartPage.module.css'

export default function CartPage() {
  const {
    cart,
    isLoading,
    isMutating,
    error,
    totalItems,
    updateQuantity,
    removeItem,
    clearError,
    appliedCoupon,
    couponDiscountINR,
    openOffersDrawer,
  } = useCart()

  const items = cart?.items || []
  const subtotalPaise = cart?.item_subtotal || cart?.subtotal || 0
  const subtotalINR = Math.round(subtotalPaise / 100)

  // Calculate compare-at original price estimate (approx 40-50% higher)
  const estimatedOriginalINR = Math.max(
    subtotalINR,
    Math.round(
      items.reduce((acc, it) => {
        const unitPriceINR = Math.round((it.unit_price || 0) / 100)
        const compareUnitINR = Math.round(unitPriceINR * 1.5)
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

  const hasPerishable = items.some(
    (item) =>
      item.product_title?.toLowerCase().includes('plant') ||
      item.variant_title?.toLowerCase().includes('pot')
  )
  const cartWeightKg = Math.max(
    0.25,
    items.reduce((acc, item) => acc + (item.quantity || 1) * 0.2, 0)
  )

  if (isLoading && items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.mobileCartBar}>
          <Link href="/" className={styles.mobileBackBtn} aria-label="Back to store">
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Back to Store</span>
          </Link>
          <span className={styles.mobileBarTitle}>Shopping Cart</span>
        </div>

        <div className={styles.emptyCard}>
          <Loader2 size={36} className={styles.spinner} style={{ color: 'var(--ugaoo-green)' }} />
          <h2 className={styles.emptyHeading}>Loading your botanical cart...</h2>
          <p className={styles.emptyText}>Checking live stock and pricing with Medusa engine</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.mobileCartBar}>
          <Link href="/" className={styles.mobileBackBtn} aria-label="Back to store">
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Back to Store</span>
          </Link>
          <span className={styles.mobileBarTitle}>Shopping Cart</span>
        </div>

        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <Sprout size={40} />
          </div>
          <h1 className={styles.emptyHeading}>Your Shopping Cart is Empty</h1>
          <p className={styles.emptyText}>
            Your garden pouch is waiting. Explore our certified Desi heirloom seeds, low-light indoor plants, and organic potting mixes ready for pan-India dispatch.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            <Link href="/store" className={styles.browseBtn}>
              <span>Browse Botanical Store</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--ugaoo-border)',
                backgroundColor: 'var(--ugaoo-white)',
                color: 'var(--ugaoo-text-dark)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Mobile Top App Bar */}
      <div className={styles.mobileCartBar}>
        <Link href="/" className={styles.mobileBackBtn} aria-label="Back to store">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Store</span>
        </Link>
        <span className={styles.mobileBarTitle}>Cart ({totalItems})</span>
      </div>

      {/* Desktop Clean Top Header */}
      <div className={styles.desktopCartHeader}>
        <Link href="/" className={styles.desktopLogoLink} aria-label="GLOROV Homepage">
          <Image src="/glorov-logo.svg" alt="GLOROV" width={130} height={36} priority />
        </Link>
        <Link href="/store" className={styles.continueShoppingLink}>
          <span>← Continue Shopping</span>
        </Link>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <span>{error}</span>
          <button type="button" onClick={clearError} className={styles.dismissErrorBtn}>
            Dismiss
          </button>
        </div>
      )}

      {/* Desktop Page Title */}
      <div className={styles.desktopHeadingArea}>
        <h1 className={styles.pageTitle}>Your Botanical Shopping Cart</h1>
        <span className={styles.itemCountBadge}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for Pune nursery dispatch
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className={styles.cartLayout}>
        {/* Left Column: Progress Meter, Items & Recommendations */}
        <div className={styles.itemsSection}>
          {/* Milestone Target Meter Card */}
          <div className={styles.meterContainerCard}>
            <CartMilestoneMeter subtotalINR={subtotalINR} />
            <div className={styles.roadmapFooterRow}>
              <button
                type="button"
                onClick={openOffersDrawer}
                className={styles.roadmapTriggerBtn}
              >
                <Sparkles size={12} className={styles.sparkleIcon} />
                <span>Available Offers Roadmap: Free Delivery, 10%, 15%, 20%</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className={styles.itemsCard}>
            <ul className={styles.itemsList}>
              {items.map((item) => {
                const unitPricePaise = item.unit_price || 0
                const unitPriceINR = Math.round(unitPricePaise / 100)
                const comparePriceINR = Math.round(unitPriceINR * 1.5)
                const lineTotalINR = unitPriceINR * (item.quantity || 1)
                const productHref = item.product_handle ? `/products/${item.product_handle}` : '/store'

                const hasDiscount = Boolean(appliedCoupon && appliedCoupon.discount_value > 0)
                const discountedUnitINR = hasDiscount
                  ? Math.round(unitPriceINR * (1 - appliedCoupon!.discount_value / 100))
                  : unitPriceINR

                return (
                  <li key={item.id} className={styles.itemRow}>
                    {/* Square Thumbnail */}
                    <Link href={productHref} className={styles.thumbWrap}>
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title || 'Botanical product'}
                          fill
                          sizes="76px"
                          unoptimized
                          className={styles.thumbImg}
                        />
                      ) : (
                        <div className={styles.fallbackThumb}>
                          <Sprout size={24} />
                        </div>
                      )}
                    </Link>

                    {/* Item Details */}
                    <div className={styles.itemInfo}>
                      {/* Top Row: Title & Trash Button */}
                      <div className={styles.itemTitleRow}>
                        <Link href={productHref} className={styles.itemTitleLink}>
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isMutating}
                          className={styles.trashBtn}
                          aria-label={`Remove ${item.title}`}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Subtitle / Pack Size */}
                      <div className={styles.itemMetaRow}>
                        <span className={styles.variantTag}>
                          {item.variant_title || '1 gm'}
                        </span>

                        {appliedCoupon && (
                          <span className={styles.appliedCodeBadge}>
                            <Tag size={10} />
                            <span>{appliedCoupon.code}</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Price & Pill Stepper */}
                      <div className={styles.actionsRow}>
                        <div className={styles.priceGroup}>
                          <span className={styles.currentPrice}>
                            ₹{discountedUnitINR}
                          </span>
                          <span className={styles.comparePrice}>
                            ₹{hasDiscount ? unitPriceINR : comparePriceINR}
                          </span>
                          {item.quantity && item.quantity > 1 && (
                            <span className={styles.lineTotalText}>
                              ({formatINR(lineTotalINR * 100)} total)
                            </span>
                          )}
                        </div>

                        {/* Pill Stepper */}
                        <div className={styles.pillStepper}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={isMutating}
                            className={styles.stepperBtn}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className={styles.stepperQty}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={isMutating}
                            className={styles.stepperBtn}
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Delivery Pincode Checker */}
          <div className={styles.pincodeWrap}>
            <PincodeChecker
              isPerishable={hasPerishable}
              weightKg={cartWeightKg}
              declaredValueInr={subtotalINR}
              compact={true}
            />
          </div>

          {/* Recommended Products Carousel */}
          <div className={styles.recommendationsCard}>
            <CartRecommendations />
          </div>

          {/* Mobile In-Flow Coupon Card (Matches Screenshot #3) */}
          <div className={styles.mobileCouponWrap}>
            <CartCouponCard />
          </div>

          {/* Botanical Trust & Assurance Strip */}
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <CheckCircle2 size={14} className={styles.trustIcon} />
              <span>100% Certified Heirloom Seeds</span>
            </div>
            <div className={styles.trustItem}>
              <Truck size={14} className={styles.trustIcon} />
              <span>Express Pune Nursery Dispatch</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={14} className={styles.trustIcon} />
              <span>0% GST on Seeds (HSN 1209)</span>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop Only Sticky Sidebar) */}
        <div className={styles.desktopSummaryCard}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          {/* Coupon Voucher Component */}
          <div style={{ margin: '0 0 1rem 0' }}>
            <CartCouponCard />
          </div>

          <div className={styles.summaryStack}>
            <div className={styles.summaryLine}>
              <span className={styles.summaryLabel}>Botanical Subtotal</span>
              <span className={styles.summaryValue}>{formatINR(subtotalPaise)}</span>
            </div>

            {couponDiscountINR > 0 && (
              <div className={`${styles.summaryLine} ${styles.discountLine}`}>
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-{formatINR(couponDiscountINR * 100)}</span>
              </div>
            )}

            <div className={styles.summaryLine}>
              <span className={styles.summaryLabel}>Shipping (India)</span>
              <span className={styles.shippingValue}>
                {subtotalINR >= 499 ? 'FREE' : '₹99 (Free on ₹499+)'}
              </span>
            </div>

            <div className={styles.totalDivider} />

            <div className={styles.totalLine}>
              <div className={styles.totalLabelGroup}>
                <span className={styles.grandTotalLabel}>Grand Total</span>
                <span className={styles.inclusiveTaxNote}>Inclusive of all taxes</span>
              </div>
              <div className={styles.totalPriceGroup}>
                <span className={styles.finalGrandTotal}>₹{finalTotalINR.toLocaleString('en-IN')}</span>
                {estimatedOriginalINR > finalTotalINR && (
                  <span className={styles.originalCompareTotal}>₹{estimatedOriginalINR.toLocaleString('en-IN')}</span>
                )}
                {discountPercent > 0 && (
                  <span className={styles.pillDiscountTag}>{discountPercent}% off</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.gstBadge}>
            <ShieldCheck size={16} className={styles.gstIcon} />
            <span>0% GST on seeds (HSN 1209). Transit safe packaging guaranteed.</span>
          </div>

          <Link href="/checkout" className={styles.desktopCheckoutButton}>
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Mobile Sticky Bottom Checkout Bar (Matches Screenshot #1, #2, #3) */}
      <div className={styles.mobileStickyBarWrap}>
        <CartSummaryFooter />
      </div>

      {/* Available Offers Drawer Modal (Matches Screenshot #4) */}
      <AvailableOffersDrawer />
    </div>
  )
}
