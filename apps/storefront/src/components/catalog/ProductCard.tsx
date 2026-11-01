'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Sprout, Leaf, Check, Loader2, Zap, ShieldCheck } from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import {
  getProductLowestPriceINR,
  getProductStockSummary,
} from '@/lib/catalog'
import { useCart } from '@/context/CartContext'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: StoreCatalogProduct
  priority?: boolean
}

/**
 * Derives an authentic, descriptive botanical badge matching the reference design.
 * e.g., 'Culinary Herb', 'Desi Vegetable', 'Air Purifier', 'Festive Bloom'.
 */
export function getProductDisplayTag(product: StoreCatalogProduct): string {
  const metadata = (product.metadata || {}) as Record<string, unknown>
  const handle = (product.handle || '').toLowerCase()
  const title = (product.title || '').toLowerCase()
  const categoryHandle = (product.categories?.[0]?.handle || '').toLowerCase()
  const subCategory = typeof metadata.subCategory === 'string' ? metadata.subCategory.toLowerCase() : ''
  const tags = Array.isArray(metadata.tags)
    ? (metadata.tags as string[]).map((t) => String(t).toLowerCase())
    : []

  // Check explicit promotional badge if meaningful
  const rawBadges = Array.isArray(metadata.badges)
    ? (metadata.badges as unknown[]).map(String)
    : typeof metadata.badge === 'string'
    ? [metadata.badge]
    : typeof metadata.tag === 'string'
    ? [metadata.tag]
    : []
  if (rawBadges.length > 0 && rawBadges[0].trim()) {
    const custom = rawBadges[0].trim()
    const lower = custom.toLowerCase()
    if (!['retail-store', 'top-200-sku', 'flash', 'buy3', 'b2g1', 'score:100'].includes(lower)) {
      return custom
    }
  }

  // Culinary / Herb varieties (e.g. Arugula, Basil, Mint, Coriander, Thyme, etc.)
  if (
    tags.includes('herb-seeds') ||
    tags.includes('herb') ||
    tags.includes('culinary') ||
    tags.includes('aroma') ||
    handle.includes('arugula') ||
    handle.includes('basil') ||
    handle.includes('tulsi') ||
    handle.includes('coriander') ||
    handle.includes('mint') ||
    handle.includes('oregano') ||
    handle.includes('thyme') ||
    handle.includes('rosemary') ||
    handle.includes('methi') ||
    handle.includes('palak') ||
    handle.includes('spinach') ||
    title.includes('arugula') ||
    title.includes('basil') ||
    title.includes('coriander') ||
    title.includes('tulsi') ||
    title.includes('herb') ||
    title.includes('mint')
  ) {
    return 'Culinary Herb'
  }

  // Air Purifying Foliage
  if (
    tags.includes('air-purifying') ||
    handle.includes('snake-plant') ||
    handle.includes('peace-lily') ||
    handle.includes('zz-plant') ||
    handle.includes('spider-plant') ||
    handle.includes('areca') ||
    title.includes('peace lily') ||
    title.includes('snake plant') ||
    title.includes('areca palm') ||
    title.includes('spider plant') ||
    title.includes('zz plant')
  ) {
    return 'Air Purifier'
  }

  // Flowering Blooms
  if (
    tags.includes('flowering-plants') ||
    categoryHandle.includes('flower') ||
    subCategory.includes('flower') ||
    handle.includes('flower') ||
    handle.includes('marigold') ||
    handle.includes('zinnia') ||
    handle.includes('cosmos') ||
    handle.includes('aster') ||
    handle.includes('petunia') ||
    handle.includes('sunflower') ||
    handle.includes('morning-glory') ||
    handle.includes('dahlia') ||
    handle.includes('anthurium') ||
    title.includes('marigold') ||
    title.includes('flower') ||
    title.includes('petunia') ||
    title.includes('dahlia') ||
    title.includes('anthurium')
  ) {
    return 'Festive Bloom'
  }

  // Desi Vegetables
  if (
    tags.includes('vegetable-seeds') ||
    categoryHandle.includes('vegetable') ||
    subCategory.includes('vegetable') ||
    handle.includes('tomato') ||
    handle.includes('chilli') ||
    handle.includes('brinjal') ||
    handle.includes('bhindi') ||
    handle.includes('capsicum') ||
    handle.includes('cucumber') ||
    handle.includes('carrot') ||
    handle.includes('radish') ||
    handle.includes('beetroot') ||
    title.includes('tomato') ||
    title.includes('chilli') ||
    title.includes('brinjal') ||
    title.includes('vegetable')
  ) {
    return 'Desi Vegetable'
  }

  // Vastu / Good Luck
  if (
    tags.includes('vastu-friendly') ||
    tags.includes('lucky-feng') ||
    handle.includes('jade') ||
    handle.includes('money-plant') ||
    title.includes('jade') ||
    title.includes('money plant')
  ) {
    return 'Vastu & Luck'
  }

  // Low Maintenance
  if (tags.includes('low-maintenance') || tags.includes('easy-care') || tags.includes('long-living')) {
    return 'Easy Care'
  }

  // Fallback
  const isPerishable = Boolean(metadata.is_perishable)
  const isSeed = categoryHandle.includes('seed') || (!isPerishable && !categoryHandle.includes('plant'))
  return isSeed ? 'Heirloom Seed' : 'Indoor Plant'
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const priceInfo = getProductLowestPriceINR(product)
  const stockSummary = getProductStockSummary(product)

  // Botanical metadata from Medusa
  const metadata = (product.metadata || {}) as Record<string, unknown>
  const botanicalName = typeof metadata.botanical_name === 'string' ? metadata.botanical_name : undefined
  const isPerishable = Boolean(metadata.is_perishable)
  const season = typeof metadata.season === 'string' ? metadata.season : undefined
  const sunlight = typeof metadata.sunlight === 'string' ? metadata.sunlight : undefined

  // Customer Rating & Review Count
  const ratingScore =
    typeof metadata.rating === 'number'
      ? metadata.rating.toFixed(1)
      : typeof metadata.rating === 'string'
      ? metadata.rating
      : '4.8'
  const reviewCount =
    typeof metadata.reviews_count === 'number'
      ? metadata.reviews_count
      : typeof metadata.review_count === 'number'
      ? metadata.review_count
      : typeof metadata.reviews === 'number'
      ? metadata.reviews
      : 120

  // Category detection for botanical badging
  const categoryHandle = product.categories?.[0]?.handle || ''
  const isSeed = categoryHandle.includes('seed') || (!isPerishable && !categoryHandle.includes('plant'))

  // Count packet-size options if present
  const variantCount = product.variants?.length || 0

  // Calculate pricing & compare-at
  const unitPriceINR = priceInfo.minPricePaise ? Math.round(priceInfo.minPricePaise / 100) : 0
  const comparePaise =
    (product.variants?.[0]?.metadata?.compare_at_price as number) ||
    (metadata.compare_at_price as number) ||
    0
  const comparePriceINR =
    comparePaise > 0
      ? Math.round(comparePaise / 100)
      : (metadata.is_sale || metadata.badge || metadata.tag
      ? Math.round(unitPriceINR * 1.55)
      : 0)

  // Smart botanical badge text (e.g. "Culinary Herb")
  const displayTag = getProductDisplayTag(product)

  const handleQuickAction = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!stockSummary.hasStock || isAdding) return

    // If product has multiple variants with distinct choices, navigate to PDP
    if (variantCount > 1) {
      router.push(`/products/${product.handle}`)
      return
    }

    const variantId = product.variants?.[0]?.id
    if (!variantId) {
      router.push(`/products/${product.handle}`)
      return
    }

    setIsAdding(true)
    try {
      const ok = await addToCart(variantId, 1)
      if (ok) {
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1800)
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className={styles.card}>
      {/* 1. Media Area: Strict 1:1 Aspect Ratio with Floating Badges */}
      <div className={styles.mediaArea}>
        <Link
          href={`/products/${product.handle}`}
          className={styles.mediaLink}
          aria-label={`View ${product.title}`}
        >
          {product.thumbnail && !imageError ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              onError={() => setImageError(true)}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.fallbackImageWrap}>
              <div className={styles.fallbackIconCircle}>
                {isSeed ? (
                  <Sprout size={24} style={{ color: 'var(--ugaoo-maroon)' }} />
                ) : (
                  <Leaf size={24} style={{ color: 'var(--ugaoo-green)' }} />
                )}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ugaoo-text-dark)' }}>
                GLOROV Nursery
              </span>
            </div>
          )}
        </Link>

        {/* Top-Left Floating Tag Badge (Capsule style matching theme) */}
        <div className={styles.badgeContainer}>
          <span className={styles.tagBadge}>
            <Zap size={11} className={styles.tagIcon} aria-hidden="true" />
            <span>{displayTag}</span>
          </span>
        </div>

        {/* Floating Glassy Frosted Rating Badge (Bottom-Left) */}
        <div
          className={styles.ratingBadge}
          aria-label={`Rating ${ratingScore} out of 5 stars from ${reviewCount} reviews`}
        >
          <span className={styles.ratingScore}>{ratingScore}</span>
          <span className={styles.ratingStar} aria-hidden="true">★</span>
          <span className={styles.ratingDivider} aria-hidden="true">|</span>
          <span className={styles.ratingCount}>{reviewCount}</span>
        </div>

        {/* Out of Stock Backdrop Overlay */}
        {!stockSummary.hasStock && (
          <div className={styles.outOfStockOverlay}>
            <span className={styles.outOfStockLabel}>Out of Stock</span>
          </div>
        )}
      </div>

      {/* 2. Content Area: Titles, Botanical Taxonomy & Bottom Pricing Row */}
      <div className={styles.contentArea}>
        <div className={styles.topDetails}>
          {/* Scientific Botanical Name */}
          {botanicalName ? (
            <p className={styles.botanicalName}>
              {botanicalName}
            </p>
          ) : (
            <div className={styles.botanicalSpacer} aria-hidden="true" />
          )}

          {/* Product Title */}
          <h3 className={styles.title}>
            <Link href={`/products/${product.handle}`} className={styles.titleLink}>
              {product.title}
            </Link>
          </h3>

          {/* Botanical Specs & Variant Count */}
          <div className={styles.botanicalSpecs}>
            {variantCount > 1 ? (
              <span className={styles.optionBadge}>{variantCount} Options</span>
            ) : null}
            {season && <span>Season: {season}</span>}
            {season && sunlight && <span>•</span>}
            {sunlight && <span>{sunlight.replace('_', ' ')}</span>}
          </div>
        </div>

        {/* 3. Bottom Row: Price Stack + Add To Cart Pill Button */}
        <div className={styles.bottomRow}>
          <div className={styles.priceWrap}>
            <div className={styles.priceStack}>
              <span className={styles.currentPrice}>{priceInfo.formatted}</span>
              {comparePriceINR > unitPriceINR && (
                <span className={styles.comparePrice}>₹{comparePriceINR}</span>
              )}
            </div>
            <div className={styles.statusWrap}>
              {stockSummary.status === 'out_of_stock' ? (
                <span className={styles.soldOutText}>Sold Out</span>
              ) : (
                <span className={styles.stockStatus}>
                  <ShieldCheck size={11} aria-hidden="true" />
                  <span>In Stock</span>
                </span>
              )}
            </div>
          </div>

          {/* Add To Cart Pill Button */}
          {stockSummary.hasStock ? (
            <button
              type="button"
              onClick={handleQuickAction}
              disabled={isAdding}
              className={styles.addToCartBtn}
              aria-label={variantCount > 1 ? `Select Options for ${product.title}` : `Add ${product.title} to Cart`}
              title={variantCount > 1 ? 'Select Options' : 'Add to Cart'}
            >
              {isAdding ? (
                <>
                  <Loader2 size={13} className={styles.bagSpinner} aria-hidden="true" />
                  <span>Adding...</span>
                </>
              ) : isAdded ? (
                <>
                  <Check size={13} aria-hidden="true" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <span>{variantCount > 1 ? 'Select Options' : 'Add To Cart'}</span>
                  <span className={styles.srOnly}>Select Options</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/products/${product.handle}`}
              className={styles.soldOutButton}
              aria-label={`View details for ${product.title}`}
            >
              <span>Sold Out</span>
              <span className={styles.srOnly}>Select Options</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
