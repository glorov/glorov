'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Check, Loader2, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './BlogPost.module.css'

interface BlogProductEmbedProps {
  title: string
  handle: string
  price: string
  variantId: string
  thumbnail: string
  categoryName: string
}

export function BlogProductEmbed({
  title,
  handle,
  price,
  variantId,
  thumbnail,
  categoryName,
}: BlogProductEmbedProps) {
  const { addToCart, openDrawer } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = async () => {
    if (isAdding) return
    setIsAdding(true)
    try {
      const ok = await addToCart(variantId, 1)
      if (ok) {
        setAdded(true)
        openDrawer()
        setTimeout(() => setAdded(false), 2200)
      }
    } catch (e) {
      console.error('Failed to add article product to cart:', e)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className={styles.productEmbedCard} role="region" aria-label={`Featured specimen: ${title}`}>
      <div className={styles.productEmbedThumb}>
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="100px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className={styles.productEmbedDetails}>
        <span className={styles.productEmbedBadge}>
          <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} aria-hidden="true" />
          Featured in this guide
        </span>
        <Link href={`/products/${handle}`} className={styles.productEmbedTitle}>
          {title}
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span className={styles.productEmbedPrice}>{price}</span>
          <span style={{ fontSize: '11px', color: 'var(--ugaoo-text-muted)' }}>
            ({categoryName})
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdding || added}
        className={`${styles.productEmbedBuyBtn} ${added ? styles.embedAddedNotice : ''}`}
        aria-label={`Add ${title} to cart for ${price}`}
      >
        {isAdding ? (
          <>
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            <span>Adding...</span>
          </>
        ) : added ? (
          <>
            <Check size={15} aria-hidden="true" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingBag size={15} aria-hidden="true" />
            <span>Add Specimen to Cart</span>
          </>
        )}
      </button>
    </div>
  )
}
