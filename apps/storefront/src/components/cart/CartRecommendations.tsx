'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ShoppingBag, Loader2, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import {
  fetchCartRecommendations,
  type RecommendedProductItem,
  FALLBACK_RECOMMENDED_PRODUCTS,
} from '@/lib/recommendations'
import styles from './CartRecommendations.module.css'

interface CartRecommendationsProps {
  onItemAdded?: () => void
}

export function CartRecommendations({ onItemAdded }: CartRecommendationsProps) {
  const { cart, addToCart } = useCart()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [recommendations, setRecommendations] = useState<RecommendedProductItem[]>(
    FALLBACK_RECOMMENDED_PRODUCTS
  )
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null)
  const [addedVariantId, setAddedVariantId] = useState<string | null>(null)

  // Fetch contextual recommendations whenever cart items change
  useEffect(() => {
    let isMounted = true

    const cartHandles = (cart?.items || [])
      .map((item) => item.product_handle || '')
      .filter(Boolean)
    const cartTitles = (cart?.items || []).map((item) => item.title || '').filter(Boolean)

    fetchCartRecommendations({
      cartProductHandles: cartHandles,
      cartProductTitles: cartTitles,
      limit: 6,
    }).then((items) => {
      if (isMounted && items.length > 0) {
        setRecommendations(items)
      }
    })

    return () => {
      isMounted = false
    }
  }, [cart?.items])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -210, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 210, behavior: 'smooth' })
    }
  }

  const handleQuickAdd = async (variantId: string) => {
    setAddingVariantId(variantId)
    try {
      const ok = await addToCart(variantId, 1)
      if (ok) {
        setAddedVariantId(variantId)
        setTimeout(() => setAddedVariantId(null), 1800)
        onItemAdded?.()
      }
    } finally {
      setAddingVariantId(null)
    }
  }

  if (recommendations.length === 0) return null

  return (
    <section className={styles.recommendationsSection} aria-label="Recommended Botanical Products">
      {/* Header with Title and Scroll Controls */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Recommended Products</h3>
        <div className={styles.navControls}>
          <button
            type="button"
            onClick={scrollLeft}
            className={styles.arrowButton}
            aria-label="Previous recommended products"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className={styles.arrowButton}
            aria-label="Next recommended products"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div ref={scrollContainerRef} className={styles.carouselTrack}>
        {recommendations.map((prod) => {
          const isAdding = addingVariantId === prod.variantId
          const isJustAdded = addedVariantId === prod.variantId

          return (
            <div key={prod.id} className={styles.productCard}>
              {/* Image & Badges */}
              <div className={styles.imageWrap}>
                <Link href={`/products/${prod.handle}`} className={styles.imageLink}>
                  <Image
                    src={prod.thumbnail}
                    alt={prod.title}
                    fill
                    sizes="180px"
                    unoptimized
                    className={styles.productImage}
                  />
                </Link>

                {/* Top Badge (e.g. BESTSELLER) */}
                {prod.badge && (
                  <span className={styles.badgeBestseller}>{prod.badge}</span>
                )}

                {/* Rating Badge Overlay */}
                {prod.rating > 0 && (
                  <div className={styles.ratingBadge}>
                    <span>{prod.rating.toFixed(1)}</span>
                    <span className={styles.ratingDivider}>|</span>
                    <span>{prod.reviewCount}</span>
                  </div>
                )}
              </div>

              {/* Title & Pricing */}
              <div className={styles.cardInfo}>
                <Link
                  href={`/products/${prod.handle}`}
                  className={styles.productTitle}
                  title={prod.title}
                >
                  {prod.title}
                </Link>

                <div className={styles.priceRow}>
                  <div className={styles.priceGroup}>
                    <span className={styles.currentPrice}>₹{prod.price}</span>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                      <span className={styles.comparePrice}>₹{prod.compareAtPrice}</span>
                    )}
                  </div>

                  {/* Circular Quick Add Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(prod.variantId)}
                    disabled={isAdding}
                    className={`${styles.quickAddButton} ${isJustAdded ? styles.addedButton : ''}`}
                    aria-label={`Add ${prod.title} to cart`}
                  >
                    {isAdding ? (
                      <Loader2 size={14} className={styles.spinner} />
                    ) : isJustAdded ? (
                      <Check size={14} />
                    ) : (
                      <ShoppingBag size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
