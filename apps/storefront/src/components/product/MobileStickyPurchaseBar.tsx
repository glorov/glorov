'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useWishlist } from '../../context/StorefrontContext'
import { cn } from '../../lib/utils/cn'

export interface MobileStickyPurchaseBarProps {
  title: string
  price: number
  discountPrice?: number
  discountPercent?: number
  thumbnailUrl?: string
  inStock: boolean
  onAddToCart: () => void
  isAdding?: boolean
  productId?: string
  variantName?: string
}

/**
 * GLOROV MobileStickyPurchaseBar
 * Dynamic scroll-reactive purchase dock for mobile (< 768px),
 * directly migrated from Flutter `_buildMobileStickyBottomBar()` in `glorov_product_details_screen.dart`:
 * - Hidden at the top of the PDP (scrollY <= 350px)
 * - Slides up smoothly into view once scrolled past 350px (past the in-page add to cart button)
 * - Displays dynamic pricing, variant specification, wishlist toggle heart, and primary CTA
 */
export const MobileStickyPurchaseBar: React.FC<MobileStickyPurchaseBarProps> = ({
  title,
  price,
  discountPrice,
  discountPercent,
  inStock,
  onAddToCart,
  isAdding = false,
  productId,
  variantName,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const isVisibleRef = useRef(false)
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isSaved = productId ? isInWishlist(productId) : false

  const finalPrice = price
  const originalPrice = discountPrice && discountPrice > price ? discountPrice : null

  useEffect(() => {
    let ticking = false

    const updateVisibility = () => {
      const scrollEl = typeof document !== 'undefined' ? document.getElementById('glorov-page-scroll') : null
      const scrollY = scrollEl ? scrollEl.scrollTop : (typeof window !== 'undefined' ? window.scrollY : 0)
      const nextVisible = scrollY > 350
      if (nextVisible !== isVisibleRef.current) {
        isVisibleRef.current = nextVisible
        setIsVisible(nextVisible)
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          updateVisibility()
          ticking = false
        })
      }
    }

    const scrollEl = typeof document !== 'undefined' ? document.getElementById('glorov-page-scroll') : null
    if (scrollEl) {
      scrollEl.addEventListener('scroll', onScroll, { passive: true })
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    updateVisibility()

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', onScroll)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [])

  return (
    <aside
      aria-label="Quick buy dock"
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform',
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left: Price and Variant Tag */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[20px] font-black text-[#111827] leading-none">
              ₹{finalPrice}
            </span>
            {originalPrice && (
              <span className="text-[12px] text-[#9CA3AF] line-through font-medium leading-none">
                ₹{originalPrice}
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#FEF2F2] border border-[#FCA5A5] font-bold text-[10px] text-[#DC2626] leading-none">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280] truncate mt-0.5 max-w-[130px]">
            {variantName || 'Standard Pack'}
          </p>
        </div>

        {/* Center: Mobile Wishlist Toggle Button matching Flutter */}
        {productId && (
          <button
            type="button"
            onClick={() => toggleWishlist(productId, title)}
            className={cn(
              'p-2.5 rounded-full border transition-transform active:scale-90 shrink-0 cursor-pointer',
              isSaved
                ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#E11D48]'
                : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#4B5563]'
            )}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <svg width={20} height={20} className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              {isSaved ? (
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              ) : (
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              )}
            </svg>
          </button>
        )}

        {/* Right: Signature Forest Deep Add to Cart Button */}
        <button
          type="button"
          disabled={!inStock || isAdding}
          onClick={onAddToCart}
          className="flex-1 py-3 px-4 rounded-[10px] bg-[#1B4332] text-white font-extrabold text-[13.5px] tracking-wide uppercase hover:bg-[#2D6A4F] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isAdding ? 'ADDING...' : inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
        </button>
      </div>
    </aside>
  )
}
