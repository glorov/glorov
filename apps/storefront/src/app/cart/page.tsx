'use client'

import React, { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '../../context/CartContext'
import { GlorovCustomIcons } from '../../components/common/GlorovIcons'
import { CartItemRow } from '../../components/cart/CartItemRow'
import { FreeShippingProgressBar } from '../../components/cart/FreeShippingProgressBar'
import { CouponVoucherCard } from '../../components/cart/CouponVoucherCard'
import { CartPincodeBox } from '../../components/cart/CartPincodeBox'
import { CartTransitGuarantee } from '../../components/cart/CartTransitGuarantee'
import { RecommendedProductsSection } from '../../components/cart/RecommendedProductsSection'
import { CartOrderSummary } from '../../components/cart/CartOrderSummary'
import { CartStickyCheckoutBar } from '../../components/cart/CartStickyCheckoutBar'
import { CartEmptyState } from '../../components/cart/CartEmptyState'
import { AvailableOffersModal } from '../../components/cart/AvailableOffersModal'
import { TaxBreakdownModal } from '../../components/cart/TaxBreakdownModal'
import { reportError } from '../../lib/error-reporter'

/**
 * GLOROV Botanical Shopping Cart Screen
 * 100% matched with Flutter `GlorovCartScreen`:
 * - Dedicated Top Bar with back arrow, Fraunces serif "Cart" title, counter pill, close action
 * - Botanical Milestone Roadmap (FREE at ₹499, 10% at ₹999, 15% at ₹1,599, 20% at ₹2,299)
 * - Compact cart items (56px thumbnail, variant chip, save-for-later, price strike, pill stepper)
 * - Recommended Products Carousel with 162px cards, bestseller badge, and circular quick-add
 * - In-flow mint coupon voucher with higher-offer upgrade banner
 * - Express delivery pincode box
 * - 3-pillar safe transit guarantee card
 * - Order summary with comparison catalog value & savings percent
 * - Mobile sticky checkout dock with tax breakdown trigger
 * - Available offers & tax breakdown modal sheets
 */
export default function CartPage(): React.ReactElement {
  const router = useRouter()
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    compareSubtotal,
    overallDiscountPercent,
    cartTotal,
    discountAmount,
    shippingAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    moveToWishlist,
    updateCartQuantity,
    removeFromCart,
    showToast,
    activeOffers,
    isHydrated,
  } = useCart()

  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false)
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false)

  const rawActiveOffers = useMemo(() => {
    return activeOffers.map((o) => ({
      id: o.code,
      code: o.code,
      title: o.title,
      description: o.description,
      discount_value: o.discountPercent,
      min_spend: o.minSpend,
      category: o.category,
      applicable_categories: o.applicableCategories,
      is_active: true,
    }))
  }, [activeOffers])

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      try {
        await applyCoupon(code)
      } catch (err: unknown) {
        reportError(err, { page: '/cart', action: 'apply-coupon', couponCode: code })
        showToast('error', 'Unable to apply coupon. Please try again.')
      }
    },
    [applyCoupon, showToast]
  )

  const handleUpdateQuantity = useCallback(
    (itemId: string, newQty: number) => {
      try {
        updateCartQuantity(itemId, newQty)
      } catch (err: unknown) {
        reportError(err, { page: '/cart', action: 'update-quantity', itemId, quantity: newQty })
        showToast('error', 'Unable to update item quantity.')
      }
    },
    [updateCartQuantity, showToast]
  )

  const handleRemove = useCallback(
    (itemId: string) => {
      removeFromCart(itemId)
    },
    [removeFromCart]
  )

  const handleMoveToWishlist = useCallback(
    (itemId: string) => {
      moveToWishlist(itemId)
    },
    [moveToWishlist]
  )

  return (
    <div className="w-full min-h-screen bg-[#F9FAF8] text-[#111827] flex flex-col">
      {/* 1. Clean Cart Top Bar (matching Flutter _buildTopHeader) */}
      <header className="w-full bg-white border-b border-[#EBEFEA] px-4 py-3 select-none flex-shrink-0">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleBack}
              className="p-1 rounded-full hover:bg-[#F2FAF5] text-[#0A4C36] transition-colors active:scale-90"
              aria-label="Back"
            >
              <GlorovCustomIcons.arrowBack size={20} />
            </button>
            <div className="w-2" />
            <h1 className="font-serif text-[21px] font-extrabold text-[#0A4C36] tracking-[-0.3px] leading-none">
              Cart
            </h1>
            {cartCount > 0 && (
              <>
                <div className="w-2" />
                <span className="px-[7px] py-[2px] rounded-[10px] bg-[#E8F5E9] text-[11px] font-extrabold text-[#0A4C36] leading-none">
                  {cartCount}
                </span>
              </>
            )}
          </div>

          <Link
            href="/"
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#4B5563] transition-colors active:scale-90"
            aria-label="Close cart"
          >
            <GlorovCustomIcons.close size={20} />
          </Link>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 w-full">
        {!isHydrated ? (
          <div className="w-full max-w-[1280px] mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 rounded-full border-2 border-[#0A4C36]/20 border-t-[#0A4C36] animate-spin mb-4" />
            <p className="text-sm font-medium text-stone-500 font-sans">Restoring your botanical bag...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="w-full max-w-[1280px] mx-auto px-2.5 sm:px-6 py-1.5 sm:py-4">
            {/* Desktop & Tablet Layout (>= 640px, matching Flutter _buildDesktopLayout & _buildTabletLayout) */}
            <div className="hidden sm:flex items-start gap-4 lg:gap-6">
              {/* Left Column: Milestone, Items, Recommendations */}
              <div className="flex-[12] lg:flex-[13] min-w-0 flex flex-col gap-2.5 lg:gap-3">
                <FreeShippingProgressBar
                  subtotal={cartSubtotal}
                  appliedCoupon={appliedCoupon}
                  offers={rawActiveOffers}
                  onOpenOffers={() => setIsOffersModalOpen(true)}
                  onApplyCoupon={handleApplyCoupon}
                  onShowNotice={(msg) => showToast('info', msg)}
                />

                <div className="flex flex-col">
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      appliedCoupon={appliedCoupon}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemove}
                      onMoveToWishlist={handleMoveToWishlist}
                    />
                  ))}
                </div>

                <div className="pt-2">
                  <RecommendedProductsSection />
                </div>
              </div>

              {/* Right Column: Coupon, Pincode, Order Summary, Guarantee */}
              <div className="flex-[9] lg:flex-[8] min-w-0 flex flex-col gap-3 lg:gap-3.5 sticky top-4">
                <CouponVoucherCard
                  appliedCoupon={appliedCoupon}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCoupon}
                  onOpenOffersModal={() => setIsOffersModalOpen(true)}
                  subtotal={cartSubtotal}
                  availableOffers={activeOffers}
                />

                <CartPincodeBox />

                <CartOrderSummary
                  subtotal={cartSubtotal}
                  compareSubtotal={compareSubtotal}
                  discountAmount={discountAmount}
                  shippingAmount={shippingAmount}
                  total={cartTotal}
                  overallDiscountPercent={overallDiscountPercent}
                  appliedCoupon={appliedCoupon}
                  checkoutHref="/checkout"
                />

                <CartTransitGuarantee />
              </div>
            </div>

            {/* Mobile Layout (< 640px, matching Flutter _buildMobileLayout: single column) */}
            <div className="flex sm:hidden flex-col gap-2.5 pb-28">
              {/* 1. Ultra-Compact Milestone Roadmap Progress Ribbon */}
              <FreeShippingProgressBar
                subtotal={cartSubtotal}
                appliedCoupon={appliedCoupon}
                offers={rawActiveOffers}
                onOpenOffers={() => setIsOffersModalOpen(true)}
                onApplyCoupon={handleApplyCoupon}
                onShowNotice={(msg) => showToast('info', msg)}
              />

              {/* 2. Compact Cart Items List */}
              <div className="flex flex-col">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    appliedCoupon={appliedCoupon}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    onMoveToWishlist={handleMoveToWishlist}
                  />
                ))}
              </div>

              {/* 3. Recommended Products Carousel (HIGH PRIORITY) */}
              <div className="py-1">
                <RecommendedProductsSection />
              </div>

              {/* 4. In-Flow Coupon Voucher Card */}
              <CouponVoucherCard
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={removeCoupon}
                onOpenOffersModal={() => setIsOffersModalOpen(true)}
                subtotal={cartSubtotal}
                availableOffers={activeOffers}
              />

              {/* 5. Express Delivery & Pincode Strip */}
              <CartPincodeBox />

              {/* 6. Safe Botanical Transit & Care Guarantee Strip */}
              <CartTransitGuarantee />
            </div>
          </div>
        )}
      </main>

      {/* 3. Mobile Sticky Checkout Dock (matching Flutter _buildStickyCheckoutBar) */}
      {cartItems.length > 0 && (
        <CartStickyCheckoutBar
          total={cartTotal}
          compareSubtotal={compareSubtotal}
          overallDiscountPercent={overallDiscountPercent}
          checkoutHref="/checkout"
          onOpenTaxBreakdown={() => setIsTaxModalOpen(true)}
        />
      )}

      {/* 4. Available Offers Modal Sheet */}
      <AvailableOffersModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        subtotal={cartSubtotal}
        appliedCoupon={appliedCoupon}
        offers={rawActiveOffers}
        onApplyCoupon={(code) => {
          applyCoupon(code)
          setIsOffersModalOpen(false)
        }}
        onRemoveCoupon={() => {
          removeCoupon()
          setIsOffersModalOpen(false)
        }}
      />

      {/* 5. Price & Tax Breakdown Modal Sheet */}
      <TaxBreakdownModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        subtotal={cartSubtotal}
        compareSubtotal={compareSubtotal}
        discountAmount={discountAmount}
        shippingAmount={shippingAmount}
        total={cartTotal}
        appliedCoupon={appliedCoupon}
      />
    </div>
  )
}
