'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingBag, Check, Loader2, Heart } from 'lucide-react'
import type { StoreCatalogProduct, StoreCatalogVariant } from '@glorov/types'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatINR } from '@/lib/utils'
import styles from './StickyAddToCartBar.module.css'

interface StickyAddToCartBarProps {
  product: StoreCatalogProduct
  selectedVariant?: StoreCatalogVariant | null
  targetSentinelId?: string
}

export function StickyAddToCartBar({
  product,
  selectedVariant,
  targetSentinelId = 'main-add-to-cart-container',
}: StickyAddToCartBarProps) {
  const { addToCart, isMutating: cartLoading, openDrawer } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [isVisible, setIsVisible] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isFavorited = isInWishlist(product.id)

  // Use the passed variant or fallback to first variant
  const activeVariant = selectedVariant || product.variants?.[0]

  // Extract price
  const inrPrice = activeVariant?.prices?.find(
    (p) => p.currency_code?.toLowerCase() === 'inr'
  )
  const pricePaise = inrPrice?.amount ?? 0
  const formattedPrice = formatINR(pricePaise)

  const isAvailable =
    typeof activeVariant?.inventory_quantity === 'number'
      ? activeVariant.inventory_quantity > 0
      : true

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sentinel = document.getElementById(targetSentinelId)
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      // Fallback scroll listener if sentinel not found or IntersectionObserver unavailable (e.g. test env)
      const handleScroll = () => {
        setIsVisible(window.scrollY > 450)
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is NOT intersecting (scrolled past), show sticky bar
        setIsVisible(!entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-50px 0px 0px 0px',
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [targetSentinelId])

  const handleAddToCart = async () => {
    if (!activeVariant?.id || isAdding) return

    setIsAdding(true)
    try {
      const success = await addToCart(activeVariant.id, 1)
      if (success) {
        setAdded(true)
        openDrawer()
        setTimeout(() => setAdded(false), 2000)
      }
    } catch (err) {
      console.error('Failed to add to cart:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const thumbUrl = product.thumbnail || product.images?.[0]?.url || '/ugaoo-assets/cat-plants.webp'

  return (
    <div
      className={`${styles.stickyBar} ${isVisible ? styles.stickyBarVisible : ''}`}
      role="region"
      aria-label="Quick Add to Cart Bar"
    >
      <div className={styles.innerContainer}>
        {/* Product Details */}
        <div className={styles.productInfo}>
          <div className={styles.thumbWrap}>
            <Image
              src={thumbUrl}
              alt={product.title}
              fill
              sizes="48px"
              className={styles.thumbImage}
            />
          </div>
          <div className={styles.textGroup}>
            <p className={styles.productTitle}>{product.title}</p>
            <span className={styles.variantLabel}>
              {activeVariant?.title || 'Selected Specimen'}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className={styles.actionsGroup}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{formattedPrice}</span>
            <span className={styles.taxNote}>Incl. All Taxes</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdding || cartLoading}
            className={styles.addBtn}
            aria-label={`Add ${product.title} to cart for ${formattedPrice}`}
          >
            {isAdding ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Adding...</span>
              </>
            ) : added ? (
              <>
                <Check size={16} aria-hidden="true" />
                <span>Added!</span>
              </>
            ) : !isAvailable ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag size={16} aria-hidden="true" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: product.id,
                title: product.title,
                handle: product.handle || '',
                thumbnail: product.thumbnail,
                pricePaise: pricePaise || 0,
                variantId: activeVariant?.id,
                categoryName: product.categories?.[0]?.name || 'Botanical',
              })
            }
            className={`${styles.wishlistStickyBtn} ${isFavorited ? styles.wishlistStickyBtnActive : ''}`}
            aria-label={
              isFavorited
                ? `Remove ${product.title} from wishlist`
                : `Add ${product.title} to wishlist`
            }
          >
            <Heart
              size={18}
              style={{
                fill: isFavorited ? '#e53935' : 'none',
                color: isFavorited ? '#e53935' : 'currentColor',
              }}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
