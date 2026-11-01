'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Plus, ShoppingBag, Check, Sparkles, Loader2, Tag } from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import styles from './FrequentlyBoughtTogether.module.css'

interface FrequentlyBoughtTogetherProps {
  mainProduct: StoreCatalogProduct
  companionProduct: StoreCatalogProduct
}

export function FrequentlyBoughtTogether({
  mainProduct,
  companionProduct,
}: FrequentlyBoughtTogetherProps) {
  const { addToCart, openDrawer } = useCart()
  const [mainChecked, setMainChecked] = useState(true)
  const [companionChecked, setCompanionChecked] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // Extract variant and price for main product
  const mainVariant = mainProduct.variants?.[0]
  const mainPriceInr = mainVariant?.prices?.find(
    (p) => p.currency_code?.toLowerCase() === 'inr'
  )
  const mainPricePaise = mainPriceInr?.amount ?? 49900

  // Extract variant and price for companion product
  const companionVariant = companionProduct.variants?.[0]
  const companionPriceInr = companionVariant?.prices?.find(
    (p) => p.currency_code?.toLowerCase() === 'inr'
  )
  const companionPricePaise = companionPriceInr?.amount ?? 14900

  // Calculate sum and combo discount (10% discount when both selected)
  const bothSelected = mainChecked && companionChecked
  const rawSumPaise =
    (mainChecked ? mainPricePaise : 0) + (companionChecked ? companionPricePaise : 0)

  const finalPaise = bothSelected
    ? Math.round(rawSumPaise * 0.9) // 10% combo discount
    : rawSumPaise

  const savingsPaise = bothSelected ? rawSumPaise - finalPaise : 0

  const handleAddBundle = async () => {
    if ((!mainChecked && !companionChecked) || isAdding) return

    setIsAdding(true)
    try {
      if (mainChecked && mainVariant?.id) {
        await addToCart(mainVariant.id, 1)
      }
      if (companionChecked && companionVariant?.id) {
        await addToCart(companionVariant.id, 1)
      }
      setAdded(true)
      openDrawer()
      setTimeout(() => setAdded(false), 2200)
    } catch (err) {
      console.error('Failed to add bundle to cart:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const mainThumb =
    mainProduct.thumbnail || mainProduct.images?.[0]?.url || '/ugaoo-assets/cat-plants.webp'
  const companionThumb =
    companionProduct.thumbnail ||
    companionProduct.images?.[0]?.url ||
    '/ugaoo-assets/cat-seeds.webp'

  return (
    <section className={styles.container} aria-labelledby="frequently-bought-title">
      <div className={styles.header}>
        <div className={styles.badge}>
          <Sparkles size={12} aria-hidden="true" />
          <span>Botanical Pairing Duo</span>
        </div>
        <h2 id="frequently-bought-title" className={styles.title}>
          Frequently Sown &amp; Grown Together
        </h2>
        <p className={styles.subtitle}>
          Cultivate a symbiotic garden. Pair this specimen with a companion botanical and save 10% on the bundle.
        </p>
      </div>

      <div className={styles.bundleLayout}>
        {/* 1. Visual Images Chain */}
        <div className={styles.imagesChain}>
          <div
            className={`${styles.imageBox} ${!mainChecked ? styles.imageBoxDisabled : ''}`}
          >
            <Image
              src={mainThumb}
              alt={mainProduct.title}
              fill
              sizes="90px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className={styles.plusSign} aria-hidden="true">
            <Plus size={16} />
          </div>

          <div
            className={`${styles.imageBox} ${!companionChecked ? styles.imageBoxDisabled : ''}`}
          >
            <Image
              src={companionThumb}
              alt={companionProduct.title}
              fill
              sizes="90px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* 2. Items Checklist */}
        <div className={styles.itemsList}>
          <label className={styles.itemRow}>
            <input
              type="checkbox"
              checked={mainChecked}
              onChange={(e) => setMainChecked(e.target.checked)}
              className={styles.checkbox}
              aria-label={`Select ${mainProduct.title} (${formatINR(mainPricePaise)})`}
            />
            <div className={styles.itemText}>
              <p className={styles.itemTitle}>
                <span className={styles.itemRoleBadge}>This Item</span>
                <span>{mainProduct.title}</span>
              </p>
              <span className={styles.itemPrice}>{formatINR(mainPricePaise)}</span>
            </div>
          </label>

          <label className={styles.itemRow}>
            <input
              type="checkbox"
              checked={companionChecked}
              onChange={(e) => setCompanionChecked(e.target.checked)}
              className={styles.checkbox}
              aria-label={`Select ${companionProduct.title} (${formatINR(companionPricePaise)})`}
            />
            <div className={styles.itemText}>
              <p className={styles.itemTitle}>
                <span className={`${styles.itemRoleBadge} ${styles.companionBadge}`}>
                  Companion Specimen
                </span>
                <span>{companionProduct.title}</span>
              </p>
              <span className={styles.itemPrice}>{formatINR(companionPricePaise)}</span>
            </div>
          </label>
        </div>

        {/* 3. Price & Action Box */}
        <div className={styles.summaryBox}>
          {bothSelected && (
            <div className={styles.savingsPill}>
              <Tag size={12} aria-hidden="true" />
              <span>Save 10% Bundle Discount</span>
            </div>
          )}

          <div className={styles.priceDisplay}>
            <span className={styles.totalLabel}>
              Total for {mainChecked && companionChecked ? '2 Items' : '1 Item'}:
            </span>
            <span className={styles.finalPrice}>{formatINR(finalPaise)}</span>
            {bothSelected && savingsPaise > 0 && (
              <span className={styles.strikePrice}>{formatINR(rawSumPaise)}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddBundle}
            disabled={(!mainChecked && !companionChecked) || isAdding}
            className={`${styles.bundleBtn} ${added ? styles.bundleSuccess : ''}`}
            aria-label={`Add ${bothSelected ? 'both items' : 'selected item'} to cart for ${formatINR(finalPaise)}`}
          >
            {isAdding ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Adding to Cart...</span>
              </>
            ) : added ? (
              <>
                <Check size={16} aria-hidden="true" />
                <span>Added Bundle to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} aria-hidden="true" />
                <span>
                  {bothSelected ? 'Add Both to Cart' : 'Add Selected to Cart'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
