'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sprout,
  Loader2,
  Tag,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartMilestoneMeter } from './CartMilestoneMeter'
import { CartRecommendations } from './CartRecommendations'
import { CartCouponCard } from './CartCouponCard'
import { AvailableOffersDrawer } from './AvailableOffersDrawer'
import { CartSummaryFooter } from './CartSummaryFooter'
import styles from './CartDrawer.module.css'

export function CartDrawer() {
  const {
    cart,
    isLoading,
    isMutating,
    error,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearError,
    appliedCoupon,
  } = useCart()

  // Handle Escape key listener and body scroll locking
  React.useEffect(() => {
    if (!isDrawerOpen) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  const items = cart?.items || []
  const subtotalPaise = cart?.item_subtotal || cart?.subtotal || 0
  const subtotalINR = Math.round(subtotalPaise / 100)

  return (
    <div
      className={styles.drawerBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={closeDrawer}
    >
      <div
        className={styles.drawerPanel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 id="cart-drawer-title" className={styles.drawerTitle}>
            Cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className={styles.closeButton}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Tiered Milestone Progress Bar */}
        {items.length > 0 && <CartMilestoneMeter subtotalINR={subtotalINR} />}

        {/* Error Notification */}
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className={styles.errorDismissBtn}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Drawer Body */}
        <div className={styles.drawerBody}>
          {isLoading && items.length === 0 ? (
            <div className={styles.loadingState}>
              <Loader2 size={32} className={styles.spinner} />
              <p>Loading your botanical cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <Sprout size={36} />
              </div>
              <h3 className={styles.emptyTitle}>Your botanical pouch is empty</h3>
              <p className={styles.emptySubtitle}>
                Add fresh heirloom seeds, air-purifying indoor plants, or enriched potting mix.
              </p>
              <Link
                href="/store"
                onClick={closeDrawer}
                className={styles.exploreStoreBtn}
              >
                Explore Botanical Store
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <ul className={styles.itemsList}>
                {items.map((item) => {
                  const unitPricePaise = item.unit_price || 0
                  const unitPriceINR = Math.round(unitPricePaise / 100)
                  const comparePriceINR = Math.round(unitPriceINR * 1.55)
                  const productHref = item.product_handle
                    ? `/products/${item.product_handle}`
                    : '/store'

                  // Applied coupon discount display
                  const hasDiscount = Boolean(appliedCoupon && appliedCoupon.discount_value > 0)
                  const discountedUnitINR = hasDiscount
                    ? Math.round(unitPriceINR * (1 - appliedCoupon!.discount_value / 100))
                    : unitPriceINR

                  return (
                    <li key={item.id} className={styles.cartItem}>
                      {/* Product Thumbnail */}
                      <Link
                        href={productHref}
                        onClick={closeDrawer}
                        className={styles.itemThumb}
                      >
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title || 'Botanical specimen'}
                            fill
                            sizes="76px"
                            unoptimized
                            className={styles.itemImage}
                          />
                        ) : (
                          <div className={styles.itemImageFallback}>
                            <Sprout size={28} />
                          </div>
                        )}
                      </Link>

                      {/* Details Column */}
                      <div className={styles.itemDetails}>
                        {/* Title and Top-Right Trash Icon */}
                        <div className={styles.itemTitleRow}>
                          <Link
                            href={productHref}
                            onClick={closeDrawer}
                            className={styles.itemTitle}
                          >
                            {item.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isMutating}
                            className={styles.deleteIconButton}
                            aria-label={`Remove ${item.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Pack Size / Variant Info */}
                        <div className={styles.itemSubRow}>
                          <span className={styles.itemPackSize}>
                            {item.variant_title || '1 gm'}
                          </span>
                        </div>

                        {/* Applied Promo Code Tag Badge */}
                        {appliedCoupon && (
                          <div className={styles.promoBadgeWrap}>
                            <span className={styles.appliedPromoBadge}>
                              <Tag size={10} />
                              <span>{appliedCoupon.code}</span>
                            </span>
                          </div>
                        )}

                        {/* Pricing & Pill Stepper Row */}
                        <div className={styles.itemBottomRow}>
                          <div className={styles.itemPriceStack}>
                            <span className={styles.itemSalePrice}>
                              ₹ {discountedUnitINR}
                            </span>
                            <span className={styles.itemComparePrice}>
                              ₹{hasDiscount ? unitPriceINR : comparePriceINR}
                            </span>
                          </div>

                          {/* Pill Quantity Stepper */}
                          <div className={styles.pillStepper}>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, (item.quantity || 1) - 1)
                              }
                              disabled={isMutating}
                              className={styles.stepperActionBtn}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className={styles.stepperCount}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, (item.quantity || 1) + 1)
                              }
                              disabled={isMutating}
                              className={styles.stepperActionBtn}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {/* Recommended Products Carousel */}
              <CartRecommendations onItemAdded={() => {}} />

              {/* Coupon Card Banner */}
              <CartCouponCard />
            </>
          )}
        </div>

        {/* Sticky Checkout Summary Footer */}
        {items.length > 0 && (
          <CartSummaryFooter onCheckoutClick={closeDrawer} />
        )}

        {/* Available Offers Modal / Slide-over Drawer */}
        <AvailableOffersDrawer />
      </div>
    </div>
  )
}
