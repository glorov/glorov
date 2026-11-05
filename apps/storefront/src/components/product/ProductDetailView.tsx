'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { GlorovProductItem, ProductVariantItem } from '@/types/storefront'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { useCart, useToast, useWishlist } from '@/context/StorefrontContext'
import { ProductGallery } from './ProductGallery'
import { ProductVariantSelector } from './ProductVariantSelector'
import { BotanicalMetricCards } from './BotanicalMetricCards'
import { OffersCarousel } from './OffersCarousel'
import { TrustReassuranceBadges } from './TrustReassuranceBadges'
import { PincodeChecker } from './PincodeChecker'
import { ProductSpecificationsAccordion } from './ProductSpecificationsAccordion'
import { BotanicalLifecycleTabs } from './BotanicalLifecycleTabs'
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether'
import { BotanicalStoryBanner } from './BotanicalStoryBanner'
import { ProductFaqSection } from './ProductFaqSection'
import { ProductReviewsSection } from './ProductReviewsSection'
import { MobileStickyPurchaseBar } from './MobileStickyPurchaseBar'
import { ProductCard } from './ProductCard'
import { QuantitySelector } from '../common/QuantitySelector'

export interface ProductDetailViewProps {
  product: GlorovProductItem
  relatedProducts?: GlorovProductItem[]
}

/**
 * GLOROV ProductDetailView
 * High-craft client coordinator for PDP matching Flutter `GlorovProductDetailsScreen`:
 * - Mobile (< 1024px): Title above gallery, full-width components, scroll-reactive sticky bottom bar
 * - Desktop (>= 1024px): 2-Column buying section with sticky gallery and synchronized purchase console
 * - Contextual botanical metrics, variant selector chips, offers carousel, trust reassurance badges,
 *   frequently bought together 3-item bundle, botanical growing tabs, brand story, reviews, and FAQs.
 */
export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts = [],
}) => {
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | undefined>(defaultVariant)
  const [quantity, setQuantity] = useState<number>(1)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isGiftOptionSelected, setIsGiftOptionSelected] = useState<boolean>(false)

  const isSaved = isInWishlist(product.id)

  // Pricing calculations
  // In GLOROV domain model, product.price is MRP (original price), discountPrice is selling price
  const effectivePrice = selectedVariant
    ? selectedVariant.discountPrice ?? selectedVariant.price
    : product.discountPrice ?? product.price

  const originalPrice = (() => {
    if (selectedVariant?.discountPrice && selectedVariant.price > selectedVariant.discountPrice) {
      return selectedVariant.price
    }
    if (product.discountPrice && product.price > product.discountPrice) {
      if (selectedVariant && product.discountPrice > 0) {
        const ratio = product.price / product.discountPrice
        return Math.round(effectivePrice * ratio)
      }
      return product.price
    }
    if (product.price > effectivePrice) {
      return product.price
    }
    return undefined
  })()

  const discountPercent =
    originalPrice && originalPrice > effectivePrice
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : product.discountPercent

  const isInStock = selectedVariant ? selectedVariant.inStock !== false : product.inStock

  const handleAddToCart = (navigateToCart: boolean = false): void => {
    if (!isInStock || isAdding) return
    setIsAdding(true)

    const itemToAdd: GlorovProductItem = {
      ...product,
      price: originalPrice ?? effectivePrice,
      discountPrice: originalPrice ? effectivePrice : undefined,
      title: selectedVariant ? `${product.title} - ${selectedVariant.name}` : product.title,
    }

    setTimeout(() => {
      addToCart(itemToAdd, quantity)
      setIsAdding(false)
      if (navigateToCart && typeof window !== 'undefined') {
        window.location.href = '/cart'
      }
    }, 250)
  }

  // Fallback related products for frequently bought together & recommendation grid
  const compProducts =
    relatedProducts && relatedProducts.length >= 2
      ? relatedProducts
      : MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 2)

  // Handle copy share link matching Flutter _handleShareProduct with Web Share API
  const handleShareProduct = async () => {
    if (typeof window === 'undefined') return
    const shareUrl = window.location.href
    const effectivePrice = product.discountPrice ?? product.price
    const shareData = {
      title: `${product.title} | GLOROV`,
      text: `Discover ${product.title} (₹${effectivePrice}) on GLOROV: ${product.shortDescription || 'Authentic botanical quality with 100% transit guarantee.'}`,
      url: shareUrl,
    }

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      showToast('success', `Copied link for "${product.title}" to clipboard!`, {
        title: 'Link Copied',
        duration: 3000,
      })
    }
  }

  // Title and Social Proof header row matching Flutter _buildTitleAndSocialProof
  const renderTitleAndSocialProof = () => (
    <div className="w-full">
      <div className="flex items-start justify-between gap-2.5">
        <h1 className="flex-1 font-serif text-[22px] sm:text-2xl lg:text-[26px] xl:text-[28px] font-extrabold text-[#111827] leading-tight">
          {product.title}
        </h1>

        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          {/* Circular Wishlist Button matching Flutter pdp_wishlist_toggle */}
          <button
            type="button"
            onClick={() => {
              toggleWishlist(product.id, product.title)
            }}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
              isSaved
                ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#E11D48]'
                : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#4B5563] hover:text-[#111827]'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
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

          {/* 1-Tap Circular Share Button matching Flutter pdp_header_share_button */}
          <button
            type="button"
            onClick={handleShareProduct}
            className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            aria-label="Share product"
          >
            <svg width={18} height={18} className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Social Proof & In Stock Status matching Flutter lines 1481-1551 */}
      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
        {product.reviewCount === 0 ? (
          <div className="inline-flex items-center gap-1 text-[#16A34A] font-bold shrink-0 whitespace-nowrap">
            <svg width={16} height={16} className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Brand New • Be the first to review</span>
          </div>
        ) : (
          <a
            href="#reviews"
            className="inline-flex items-center gap-1 font-bold text-[#1E293B] hover:underline shrink-0 whitespace-nowrap"
          >
            <svg width={18} height={18} className="w-[18px] h-[18px] text-[#EAB308] fill-current shrink-0" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="whitespace-nowrap">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </a>
        )}

        <span className="text-[#CBD5E1] shrink-0">•</span>

        <div className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
          {isInStock ? (
            <>
              <svg width={14} height={14} className="w-3.5 h-3.5 text-[#16A34A] fill-none stroke-current shrink-0" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-[12.5px] font-semibold text-[#15803D] whitespace-nowrap">
                In Stock
              </span>
            </>
          ) : (
            <>
              <svg width={14} height={14} className="w-3.5 h-3.5 text-[#DC2626] fill-none stroke-current shrink-0" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
              </svg>
              <span className="text-[12.5px] font-semibold text-[#DC2626] whitespace-nowrap">
                Out of Stock
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // In-Page Add to Cart and Buy Now Console
  const renderPurchaseConsole = () => (
    <div className="w-full flex flex-col gap-2.5 pt-1">
      {/* Desktop Layout: Stepper + Add To Cart + Buy Now on 1 line */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Quantity Stepper (Size LG matching 48px height & 10px radius) */}
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
          size="lg"
        />

        {/* Green Add to Cart Button */}
        <button
          type="button"
          disabled={!isInStock || isAdding}
          onClick={() => handleAddToCart(false)}
          className="flex-1 h-12 rounded-[10px] bg-[#1B4332] text-white font-bold text-sm tracking-wide shadow-sm hover:bg-[#143427] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer overflow-hidden"
        >
          <svg width={18} height={18} className="w-[18px] h-[18px] text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="truncate">{isAdding ? 'Adding...' : isInStock ? 'Add To Cart' : 'Out of Stock'}</span>
        </button>

        {/* Warm Amber Buy Now Button */}
        <button
          type="button"
          disabled={!isInStock || isAdding}
          onClick={() => handleAddToCart(true)}
          className="flex-[0.8] h-12 rounded-[10px] bg-[#D97706] text-white font-bold text-sm tracking-wide shadow-sm hover:bg-[#B45309] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer overflow-hidden"
        >
          <svg width={18} height={18} className="w-[18px] h-[18px] text-white fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
          </svg>
          <span className="truncate">Buy Now</span>
        </button>
      </div>

      {/* Mobile Layout: Row 1 (Stepper + Add To Cart), Row 2 (Buy Now) */}
      <div className="flex sm:hidden flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
            size="lg"
            className="h-11 rounded-lg"
          />

          <button
            type="button"
            disabled={!isInStock || isAdding}
            onClick={() => handleAddToCart(false)}
            className="flex-1 h-11 rounded-lg bg-[#1B4332] text-white font-bold text-xs tracking-wide shadow-sm hover:bg-[#143427] active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-50 overflow-hidden"
          >
            <svg width={16} height={16} className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="truncate">{isAdding ? 'Adding...' : isInStock ? 'Add To Cart' : 'Out of Stock'}</span>
          </button>
        </div>

        <button
          type="button"
          disabled={!isInStock || isAdding}
          onClick={() => handleAddToCart(true)}
          className="w-full h-11 rounded-lg bg-[#D97706] text-white font-bold text-xs tracking-wide shadow-sm hover:bg-[#B45309] active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-50 overflow-hidden"
        >
          <svg width={16} height={16} className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
          </svg>
          <span className="truncate">Buy Now</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* ------------------------------------------------------------- */}
      {/* Primary 2-Column Buying Section */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full flex flex-col lg:flex-row items-start gap-6 lg:gap-8 xl:gap-10">
        {/* Mobile Header: Title rendered above gallery (< 768px) matching Flutter _buildStackedLayout */}
        <div className="w-full md:hidden mb-1">
          {renderTitleAndSocialProof()}
        </div>

        {/* Left Column: Product Gallery with Flutter fixed desktop width and comfortable sticky top offset below fixed header */}
        <div className="w-full lg:w-[410px] xl:w-[520px] 2xl:w-[620px] flex-shrink-0 self-start lg:sticky lg:top-[120px]">
          <ProductGallery
            title={product.title}
            images={product.imageUrls}
            primaryImage={product.primaryImage}
            badges={product.badges}
          />
        </div>

        {/* Right Column: Buying Details Console taking remaining flex width */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
          {/* Tablet & Desktop Title: Below gallery on Tablet (768-1023px), Right column top on Desktop (>=1024px) */}
          <div className="w-full hidden md:block">
            {renderTitleAndSocialProof()}
          </div>

          {/* Variant Size Selector Chips */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariant?.id || ''}
              onSelectVariant={(variant) => setSelectedVariant(variant)}
              productType={product.productType}
            />
          )}

          {/* Pricing & Tax Note matching Flutter _buildPricingSection */}
          <div className="pt-1">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="font-sans text-3xl font-black text-[#111827]">
                ₹{effectivePrice}
              </span>

              {originalPrice && (
                <span className="font-sans text-base text-[#9CA3AF] line-through font-medium">
                  ₹{originalPrice}
                </span>
              )}

              {discountPercent && discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded bg-[#FEF2F2] border border-[#FCA5A5] font-bold text-[11px] text-[#DC2626]">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">
              Inclusive of all taxes.
            </p>
          </div>

          {/* Gift Option Checkbox */}
          <label className="flex items-center gap-2 text-xs text-[#374151] cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={isGiftOptionSelected}
              onChange={(e) => setIsGiftOptionSelected(e.target.checked)}
              className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332] focus:ring-[#1B4332] cursor-pointer shrink-0"
            />
            <span className="leading-tight">
              <strong className="text-[#111827]">Make this a gift</strong> • Add a hand-written note free
            </span>
          </label>

          {/* Quantity Stepper & In-Page Purchase Buttons */}
          {renderPurchaseConsole()}

          {/* "Offers for you:" Coupon Cards Carousel */}
          <OffersCarousel />

          {/* Trust & Guarantee Badges */}
          <TrustReassuranceBadges productType={product.productType} />

          {/* Delivery Estimate Pincode Checker */}
          <PincodeChecker />

          {/* Contextual Botanical Metric Cards */}
          <BotanicalMetricCards
            productType={product.productType}
            specs={product.botanicalSpecs}
            badges={product.badges}
          />

          {/* Product Specifications Collapsible Accordion */}
          <ProductSpecificationsAccordion
            productType={product.productType}
            category={product.category}
            subcategory={product.subcategory}
            botanicalName={product.botanicalName}
            specs={product.botanicalSpecs}
          />

          {/* Botanical Growing Lifecycle Stages (Matching image 3 & 4) */}
          <div className="pt-2">
            <BotanicalLifecycleTabs />
          </div>

          {/* Frequently Bought Together Bundle Upsell (Matching image 3 & 4) */}
          {compProducts.length >= 2 && (
            <div className="pt-2">
              <FrequentlyBoughtTogether
                mainProduct={product}
                complementaryProducts={compProducts}
              />
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Full-Width Discovery & Post-Purchase Information Sections */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-8 space-y-8">
        {/* 1. "From a seed..." Editorial Brand Story Banner */}
        <section>
          <BotanicalStoryBanner />
        </section>

        {/* 4. "You May Also Like" Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#111827]">
                You may also like
              </h2>
              <Link
                href={`/categories/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="text-xs font-semibold text-[#1B4332] hover:underline"
              >
                View Catalog →
              </Link>
            </div>

            {/* Horizontal Carousel matching Flutter _buildYouMayAlsoLikeSection */}
            <div className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-none no-scrollbar">
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="w-[195px] sm:w-[215px] flex-shrink-0">
                  <ProductCard product={rel} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Customer Ratings & Reviews Section */}
        <section id="reviews" className="pt-2">
          <ProductReviewsSection
            summary={product.reviewsSummary}
            reviews={product.customerReviews}
            productTitle={product.title}
          />
        </section>

        {/* 6. Frequently Asked Questions */}
        <section className="pt-2">
          <ProductFaqSection
            productTitle={product.title}
            productType={product.productType}
            plantingSeason={product.botanicalSpecs?.plantingSeason}
            sunlightRequirement={product.botanicalSpecs?.sunlightRequirement}
            sowingDepth={product.botanicalSpecs?.sowingDepth}
            wateringNeeds={product.botanicalSpecs?.wateringNeeds}
            isPetFriendly={product.botanicalSpecs?.isPetFriendly}
          />
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Mobile Sticky Bottom Purchase Bar (< 768px) */}
      {/* ------------------------------------------------------------- */}
      <MobileStickyPurchaseBar
        title={product.title}
        price={effectivePrice}
        discountPrice={originalPrice && originalPrice > effectivePrice ? originalPrice : undefined}
        discountPercent={discountPercent}
        thumbnailUrl={product.primaryImage}
        inStock={isInStock}
        onAddToCart={() => handleAddToCart(false)}
        isAdding={isAdding}
        productId={product.id}
        variantName={selectedVariant?.name || 'Standard Pack'}
      />
    </div>
  )
}
