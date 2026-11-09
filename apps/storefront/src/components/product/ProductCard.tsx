'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { GlorovProductItem } from '../../types/storefront'
import { GlorovImage } from '../ui/GlorovImage'
import { WishlistButton } from './WishlistButton'
import { AddToCartButton } from './AddToCartButton'
import { useRestockNotification } from '../../lib/hooks/useRestockNotification'
import { cn } from '../../lib/utils/cn'

export interface ProductCardProps {
  product: GlorovProductItem
  showWishlist?: boolean
  showSubtitle?: boolean
  forceCircularAction?: boolean
  className?: string
}

/**
 * @component ProductCard
 *
 * @description
 * Reusable GLOROV Botanical Product Card migrated directly from Flutter `GlorovProductCard`.
 * Premium e-commerce card with editorial serif typography, image overlays,
 * sale badging, frosted glass rating chips, and responsive action button styles:
 * - Mobile (< 640px): 12px radius, 13.5px title, 15.5px price, circular green shopping bag button.
 * - Tablet (640-1024px): 16px radius, 16.5px title, 17.5px price, pill 'Add To Cart' button.
 * - Desktop (>= 1024px): 20px radius, 18.5px title, 19.5px price, prominent 'Add To Cart' button.
 */
export function ProductCard({
  product,
  showWishlist = false,
  showSubtitle = false,
  forceCircularAction = false,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isSoldOut = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)
  const isLowStock = !isSoldOut && product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 3

  const { isSubscribed, subscribeToRestock, isLoading: isNotifyLoading } = useRestockNotification()
  const subscribed = isSubscribed(product.id)

  const handleNotifyClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (subscribed || isNotifyLoading) return
    await subscribeToRestock({ id: product.id, title: product.title, slug: product.slug })
  }

  const primaryBadge = (() => {
    if (product.badges && product.badges.length > 0 && product.badges[0].trim()) {
      return product.badges[0].trim()
    }
    if (product.isBestSeller) {
      return 'Best Seller'
    }
    if (product.isFeatured) {
      return 'Featured'
    }
    if (product.discountPercent && product.discountPercent >= 20) {
      return 'Summer Sale'
    }
    return null
  })()

  const effectivePrice = product.discountPrice ?? product.price
  const originalPrice = product.discountPrice ? product.price : undefined
  const hasDiscount = originalPrice !== undefined && originalPrice > effectivePrice
  const discountPercent =
    product.discountPercent ??
    (hasDiscount && originalPrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : undefined)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col bg-white rounded-[12px] sm:rounded-[16px] lg:rounded-[20px] border border-[#E5E7EB] hover:border-[#1B4332]/50 overflow-hidden transition-colors duration-200 select-none',
        className
      )}
    >
      {/* 1. Top Media Area with Overlays (Aspect Ratio ~1.05 matching Flutter) */}
      <div className="relative aspect-[1.05/1] w-full overflow-hidden bg-[#E8F5E9]">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full relative"
          aria-label={`View details for ${product.title}`}
        >
          <GlorovImage
            src={product.primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-300 ease-out',
              isHovered && !isSoldOut && 'scale-[1.04]',
              isSoldOut && 'opacity-85 grayscale-[20%]'
            )}
            containerClassName="w-full h-full"
            fallbackTitle={product.title}
          />
        </Link>

        {/* Top-Left Badge: Sold Out badge takes priority if product is out of stock */}
        {isSoldOut ? (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 bg-[#1F2937]/95 backdrop-blur-sm text-white text-[9.5px] sm:text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm border border-white/20 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse shrink-0" />
              <span>Sold Out</span>
            </span>
          </div>
        ) : primaryBadge ? (
          <div className="absolute top-0 left-0 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-[3px] bg-[#0C2340] text-white text-[9.5px] font-extrabold tracking-[0.4px] uppercase px-2 py-[3.5px] rounded-tl-[inherit] rounded-tr-[8px] rounded-br-[8px] rounded-bl-0 select-none">
              <svg width={11} height={11} className="w-[11px] h-[11px] text-[#F9C74F] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{primaryBadge}</span>
            </span>
          </div>
        ) : null}

        {/* Top-Right Wishlist Heart Button */}
        {showWishlist && (
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              productId={product.id}
              productTitle={product.title}
              size="sm"
            />
          </div>
        )}

        {/* Bottom-Left Translucent Frosted Glass Rating Pill (matching Flutter) */}
        <div className="absolute bottom-1.5 left-1.5 z-10 pointer-events-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-white/95 border border-stone-200/90 text-[11px] leading-none">
            {product.reviewCount === 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[#16A34A] font-bold">
                <svg className="w-3 h-3 text-[#16A34A] fill-current" viewBox="0 0 24 24">
                  <path d="M12 3c-1.5 3-4.5 5-7 5 0 3 1.5 6 4 7 0 3 2 6 3 6s3-3 3-6c2.5-1 4-4 4-7-2.5 0-5.5-2-7-5z" />
                </svg>
                <span>New</span>
              </span>
            ) : (
              <>
                <span className="font-extrabold text-[#0F172A] text-[11.5px]">
                  {product.rating.toFixed(1)}
                </span>
                <svg width={12} height={12} className="w-3 h-3 text-[#16A34A] fill-current shrink-0" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[#CBD5E1] text-[10px]">|</span>
                <span className="text-[#475569] font-semibold text-[11px]">
                  {product.reviewCount}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Card Body: Title, Subtitle, Price & Responsive Action */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 lg:p-3.5 justify-between gap-1.5 sm:gap-2">
        <div className="flex flex-col gap-1">
          <Link href={`/products/${product.slug}`} className="group/link block">
            {/* Title */}
            <h3 className="font-serif font-bold text-[13.5px] sm:text-[16.5px] lg:text-[18.5px] text-[#0F2F24] leading-[1.22] tracking-[-0.2px] line-clamp-2 group-hover/link:text-[#1B4332] transition-colors">
              {product.title}
            </h3>

            {/* Subtitle / Short Description (if explicitly requested) */}
            {showSubtitle && product.shortDescription && (
              <p className="hidden sm:block text-[11.5px] lg:text-[12.5px] text-[#6B7280] line-clamp-1 mt-0.5 font-normal">
                {product.shortDescription}
              </p>
            )}
          </Link>

          {/* Low Stock Urgency Pill (strictly inside the product card body) */}
          {isLowStock && (
            <div className="flex items-center pt-0.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-full leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse shrink-0" />
                <span>
                  {product.stockQuantity === 1
                    ? 'Only 1 stock remaining'
                    : `Only ${product.stockQuantity} stocks remaining`}
                </span>
              </span>
            </div>
          )}

          {/* Sold Out / Out of Stock subtle state inside card body */}
          {isSoldOut && (
            <div className="flex items-center pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded-full leading-none">
                <span>Out of Stock</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom Row: Price on Left, Action on Right */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {/* Pricing Stack with MRP and Discount Percentage */}
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            <span className="font-serif font-extrabold text-[15.5px] sm:text-[17.5px] lg:text-[19.5px] text-[#111827] leading-none">
              ₹{effectivePrice}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-[11px] sm:text-[12.5px] lg:text-[13.5px] text-[#94A3B8] line-through font-medium leading-none">
                ₹{originalPrice}
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="text-[10px] sm:text-[10.5px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5]/60 px-1.5 py-0.5 rounded leading-none shrink-0">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Responsive Action Button: In-Stock AddToCart vs. Sold-Out Notify Button */}
          <div className="shrink-0">
            {isSoldOut ? (
              forceCircularAction ? (
                // Force circular Notify/Alert Set
                subscribed ? (
                  <button
                    type="button"
                    disabled
                    title="Restock notification alert set"
                    aria-label="Restock notification alert set"
                    className="flex items-center justify-center w-9 h-9 min-w-[36px] rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] cursor-default select-none shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNotifyClick}
                    disabled={isNotifyLoading}
                    title="Notify me when restocked"
                    aria-label={`Notify me when ${product.title} is restocked`}
                    className="flex items-center justify-center w-9 h-9 min-w-[36px] rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D] hover:bg-[#FEF3C7] active:scale-90 transition-all cursor-pointer shadow-sm"
                  >
                    {isNotifyLoading ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#B45309] border-t-transparent animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                )
              ) : (
                <>
                  {/* Mobile (< 640px): Circular Notify button */}
                  <div className="sm:hidden">
                    {subscribed ? (
                      <button
                        type="button"
                        disabled
                        title="Restock notification alert set"
                        aria-label="Restock notification alert set"
                        className="flex items-center justify-center w-9 h-9 min-w-[36px] rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] cursor-default select-none shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNotifyClick}
                        disabled={isNotifyLoading}
                        title="Notify me when restocked"
                        aria-label={`Notify me when ${product.title} is restocked`}
                        className="flex items-center justify-center w-9 h-9 min-w-[36px] rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D] hover:bg-[#FEF3C7] active:scale-90 transition-all cursor-pointer shadow-sm"
                      >
                        {isNotifyLoading ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#B45309] border-t-transparent animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Tablet & Desktop (>= 640px): Pill Notify Me button */}
                  <div className="hidden sm:block">
                    {subscribed ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-[12px] font-bold rounded-full bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] cursor-default select-none min-h-[36px]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Alert Set</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNotifyClick}
                        disabled={isNotifyLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-[12px] font-bold rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D] hover:bg-[#FEF3C7] active:scale-95 transition-all shadow-sm min-h-[36px] cursor-pointer"
                        aria-label={`Notify me when ${product.title} is restocked`}
                      >
                        {isNotifyLoading ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#B45309] border-t-transparent animate-spin" />
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                        <span>Notify Me</span>
                      </button>
                    )}
                  </div>
                </>
              )
            ) : forceCircularAction ? (
              <AddToCartButton product={product} variant="circular" />
            ) : (
              <>
                <div className="sm:hidden">
                  <AddToCartButton product={product} variant="circular" />
                </div>
                <div className="hidden sm:block">
                  <AddToCartButton product={product} variant="pill" size="md" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
