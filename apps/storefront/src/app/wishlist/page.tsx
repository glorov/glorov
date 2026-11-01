'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import styles from './WishlistPage.module.css'

export default function WishlistPage() {
  const { items, totalItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart, openDrawer } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({})
  const [isAddingAll, setIsAddingAll] = useState(false)

  const handleAddToCart = async (item: {
    id: string
    variantId?: string
    title: string
  }) => {
    if (!item.variantId || addingId) return

    setAddingId(item.id)
    try {
      const success = await addToCart(item.variantId, 1)
      if (success) {
        setAddedIds((prev) => ({ ...prev, [item.id]: true }))
        openDrawer()
        setTimeout(() => {
          setAddedIds((prev) => ({ ...prev, [item.id]: false }))
        }, 2000)
      }
    } catch (e) {
      console.error('Failed to add wishlist item to cart:', e)
    } finally {
      setAddingId(null)
    }
  }

  const handleAddAllToCart = async () => {
    if (items.length === 0 || isAddingAll) return

    setIsAddingAll(true)
    try {
      for (const item of items) {
        if (item.variantId) {
          await addToCart(item.variantId, 1)
        }
      }
      openDrawer()
    } catch (e) {
      console.error('Failed to add all wishlist items to cart:', e)
    } finally {
      setIsAddingAll(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Botanical Wishlist</span>
      </nav>

      {/* 2. Header Toolbar */}
      <header className={styles.toolbar}>
        <div className={styles.titleArea}>
          <div className={styles.badge}>
            <Heart size={13} style={{ fill: 'currentColor' }} aria-hidden="true" />
            <span>Saved Specimens</span>
          </div>
          <h1 className={styles.title}>Botanical Notebook</h1>
          <p className={styles.subtitle}>
            {totalItems === 0
              ? 'Your garden notebook is currently empty.'
              : `${totalItems} living botanical specimen${totalItems === 1 ? '' : 's'} earmarked for your home.`}
          </p>
        </div>

        {totalItems > 0 && (
          <div className={styles.actionsRow}>
            <button
              type="button"
              onClick={handleAddAllToCart}
              disabled={isAddingAll}
              className={styles.addAllBtn}
              aria-label="Add all available wishlist specimens to cart"
            >
              {isAddingAll ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Adding All...</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span>Move All to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearWishlist}
              className={styles.clearBtn}
              aria-label="Clear all saved specimens"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Clear Notebook</span>
            </button>
          </div>
        )}
      </header>

      {/* 3. Items Grid or Empty State */}
      {totalItems > 0 ? (
        <div className={styles.grid} role="region" aria-label="Saved botanical items">
          {items.map((item) => {
            const isAdding = addingId === item.id
            const isAdded = !!addedIds[item.id]
            const thumbUrl = item.thumbnail || '/ugaoo-assets/cat-plants.webp'

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageWrap}>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className={styles.removeBtn}
                    aria-label={`Remove ${item.title} from wishlist`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>

                  <Link href={`/products/${item.handle}`} tabIndex={-1}>
                    <Image
                      src={thumbUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>
                </div>

                <div className={styles.cardBody}>
                  {item.categoryName && (
                    <span className={styles.categoryTag}>{item.categoryName}</span>
                  )}

                  <Link href={`/products/${item.handle}`} className={styles.productTitle}>
                    {item.title}
                  </Link>

                  <div className={styles.price}>{formatINR(item.pricePaise)}</div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    disabled={isAdding || isAdded || !item.variantId}
                    className={`${styles.addToCartBtn} ${isAdded ? styles.addedNotice : ''}`}
                    aria-label={`Add ${item.title} to cart`}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        <span>Adding...</span>
                      </>
                    ) : isAdded ? (
                      <>
                        <Check size={15} aria-hidden="true" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} aria-hidden="true" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Heart size={30} aria-hidden="true" />
          </div>
          <h2 className={styles.emptyTitle}>Your Botanical Notebook is Empty</h2>
          <p className={styles.emptyDesc}>
            Save your favorite indoor living plants, bonsai, and heirloom seeds while browsing our Pune nursery collection to review, compare, and cultivate them later.
          </p>
          <Link href="/store" className={styles.browseBtn}>
            <span>Discover Living Botanicals</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
