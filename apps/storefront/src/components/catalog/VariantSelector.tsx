'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Loader2,
  AlertCircle,
  ShieldCheck,
  PackageCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Heart,
} from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { getVariantStockAvailability, getVariantPriceINR } from '@/lib/catalog'
import styles from './VariantSelector.module.css'

interface VariantSelectorProps {
  product: StoreCatalogProduct
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const variants = useMemo(() => product.variants || [], [product.variants])
  const { addToCart, error: cartError, clearError, totalItems, openDrawer } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isFavorited = isInWishlist(product.id)

  // Select first in-stock variant by default, or the first variant
  const initialVariantId = useMemo(() => {
    if (variants.length === 0) return ''
    const firstInStock = variants.find((v) => {
      const avail = getVariantStockAvailability(v)
      return avail.isAvailable
    })
    return firstInStock ? firstInStock.id : variants[0].id
  }, [variants])

  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariantId)
  const [quantity, setQuantity] = useState<number>(1)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [addSuccess, setAddSuccess] = useState<boolean>(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const actionContainerRef = React.useRef<HTMLDivElement>(null)
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false)

  React.useEffect(() => {
    const el = actionContainerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.id === selectedVariantId) || variants[0]
  }, [variants, selectedVariantId])

  const availability = useMemo(() => {
    if (!selectedVariant) {
      return {
        isAvailable: false,
        status: 'out_of_stock' as const,
        manageInventory: true,
        allowBackorder: false,
        stockedQuantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
      }
    }
    return getVariantStockAvailability(selectedVariant)
  }, [selectedVariant])

  const priceFormatted = selectedVariant ? getVariantPriceINR(selectedVariant) : 'Price on request'

  // Dynamic Total Price Calculation
  const inrPrice = selectedVariant?.prices?.find((p) => p.currency_code?.toLowerCase() === 'inr')
  const unitAmountPaise = inrPrice ? inrPrice.amount : 0
  const totalAmountPaise = unitAmountPaise * quantity
  const totalPriceFormatted = unitAmountPaise > 0 ? `₹${(totalAmountPaise / 100).toFixed(0)}` : priceFormatted

  // Variant metadata
  const variantMetadata = (selectedVariant?.metadata || {}) as Record<string, unknown>
  const approxSeeds = variantMetadata.approx_seeds_per_packet
    ? Number(variantMetadata.approx_seeds_per_packet)
    : undefined
  const weightGrams = variantMetadata.weight_grams
    ? Number(variantMetadata.weight_grams)
    : undefined
  const packetLabel = typeof variantMetadata.packet_size_label === 'string'
    ? variantMetadata.packet_size_label
    : undefined

  // Cap quantity to stock limit (max 10)
  const maxAvailable = availability.manageInventory
    ? Math.min(Math.max(1, availability.availableQuantity), 10)
    : 10

  const handleVariantChange = (variantId: string) => {
    if (variantId === selectedVariantId) return
    setSelectedVariantId(variantId)
    setQuantity(1)
    setAddSuccess(false)
    setLocalError(null)
    clearError()
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta
      if (next < 1) return 1
      if (availability.manageInventory && next > maxAvailable) return maxAvailable
      return next
    })
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || !availability.isAvailable || isAdding) return
    setIsAdding(true)
    setLocalError(null)
    clearError()

    try {
      const success = await addToCart(selectedVariant.id, quantity)
      if (success) {
        setAddSuccess(true)
        openDrawer()
        setTimeout(() => setAddSuccess(false), 4000)
      } else {
        setLocalError(cartError || 'Could not add variant to cart. Check stock availability.')
      }
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Error adding to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (variants.length === 0) {
    return (
      <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--ugaoo-sale-red)', backgroundColor: '#fff5f5', color: 'var(--ugaoo-sale-red)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        <span>No purchasable options are currently active for this botanical product.</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 1. Price & Stock Status Banner */}
      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--ugaoo-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className={styles.priceSection}>
          <span className={styles.currentPrice}>
            {priceFormatted}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ugaoo-green)', backgroundColor: 'var(--ugaoo-cream-light)', padding: '0.25rem 0.625rem', borderRadius: '9999px', border: '1px solid var(--ugaoo-border)' }}>
            0% GST on agricultural seeds / HSN 1209
          </span>

          <div style={{ marginLeft: 'auto' }}>
            {availability.status === 'out_of_stock' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--ugaoo-sale-red)', backgroundColor: '#fff0f0', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #ffd0d0' }}>
                <AlertCircle size={14} />
                <span>Out of Stock</span>
              </span>
            ) : availability.status === 'low_stock' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#b45309', backgroundColor: '#fffbeb', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #fef3c7' }}>
                <span>Low Stock: Only {availability.availableQuantity} left</span>
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--ugaoo-green)', backgroundColor: 'var(--ugaoo-cream)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--ugaoo-border)' }}>
                <ShieldCheck size={14} />
                <span>In Stock &amp; Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Selected Variant SKU & Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '11px', color: 'var(--ugaoo-text-muted)', flexWrap: 'wrap' }}>
          {selectedVariant?.sku && (
            <span className={styles.skuLabel}>
              SKU: {selectedVariant.sku}
            </span>
          )}

          {(approxSeeds || weightGrams || packetLabel) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ugaoo-text-dark)', fontWeight: 600 }}>
              <Sparkles size={12} style={{ color: 'var(--ugaoo-maroon)' }} />
              {approxSeeds && <span>Approx. {approxSeeds} Seeds</span>}
              {approxSeeds && weightGrams && <span>•</span>}
              {weightGrams && <span>{weightGrams}g Net</span>}
              {packetLabel && !approxSeeds && !weightGrams && <span>{packetLabel}</span>}
            </div>
          )}
        </div>
      </div>

      {/* 2. Variant Selection Grid */}
      <div className={styles.variantGridSection}>
        <label className={styles.sectionLabel}>
          Select Variant / Packet Size:
        </label>
        <div
          role="radiogroup"
          aria-label="Product Variants and Packet Sizes"
          className={styles.variantGrid}
        >
          {variants.map((v, vIdx) => {
            const isSelected = v.id === selectedVariantId
            const vAvail = getVariantStockAvailability(v)
            const vPrice = getVariantPriceINR(v)
            const vMeta = (v.metadata || {}) as Record<string, unknown>
            const vApprox = vMeta.approx_seeds_per_packet ? Number(vMeta.approx_seeds_per_packet) : undefined
            const vWt = vMeta.weight_grams ? Number(vMeta.weight_grams) : undefined

            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                tabIndex={isSelected ? 0 : -1}
                aria-checked={isSelected}
                aria-label={`${v.title} - ${vPrice}${!vAvail.isAvailable ? ' - Sold Out' : ''}`}
                onClick={() => handleVariantChange(v.id)}
                onKeyDown={(e) => {
                  let nextIdx = vIdx
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    nextIdx = (vIdx + 1) % variants.length
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    nextIdx = (vIdx - 1 + variants.length) % variants.length
                  }
                  if (nextIdx !== vIdx) {
                    handleVariantChange(variants[nextIdx].id)
                    const parent = e.currentTarget.parentElement
                    const radios = parent?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
                    radios?.[nextIdx]?.focus()
                  }
                }}
                className={`${styles.variantCard} ${isSelected ? styles.variantSelected : ''} ${!vAvail.isAvailable ? styles.variantDisabled : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span className={styles.variantTitle}>{v.title}</span>
                  {!vAvail.isAvailable ? (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--ugaoo-sale-red)', textTransform: 'uppercase', backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '9999px' }}>
                      Sold Out
                    </span>
                  ) : vAvail.status === 'low_stock' ? (
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '9999px' }}>
                      {vAvail.availableQuantity} left
                    </span>
                  ) : isSelected ? (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--ugaoo-green)' }} aria-hidden="true" />
                  ) : null}
                </div>

                {(vApprox || vWt) && (
                  <div style={{ fontSize: '10px', color: 'var(--ugaoo-text-muted)', marginTop: '2px' }}>
                    {vApprox && <span>~{vApprox} Seeds</span>}
                    {vApprox && vWt && <span> • </span>}
                    {vWt && <span>{vWt}g</span>}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid var(--ugaoo-border)', width: '100%', fontSize: '12px' }}>
                  <span className={styles.variantPrice}>{vPrice}</span>
                  {vAvail.isAvailable && (
                    <span style={{ fontSize: '10px', color: 'var(--ugaoo-green)', fontWeight: 600 }}>Verified</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Screen Reader Live Region */}
      <div className={styles.srOnly} aria-live="polite" role="status">
        {selectedVariant
          ? `Selected variant ${selectedVariant.title}, price ${priceFormatted}, ${
              availability.isAvailable ? 'In stock' : 'Out of stock'
            }`
          : ''}
      </div>

      {/* 3. Action Row: Quantity Stepper + Add to Cart */}
      <div ref={actionContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className={styles.actionRow}>
          {/* Stepper */}
          <div className={styles.quantityStepper}>
            <span id="variant-quantity-label" className={styles.srOnly}>Quantity:</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || !availability.isAvailable || isAdding}
              className={styles.stepperBtn}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <div
              role="group"
              aria-labelledby="variant-quantity-label"
              style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'baseline', gap: '2px' }}
            >
              <span
                id="variant-quantity"
                aria-live="polite"
                aria-atomic="true"
                className={styles.stepperValue}
              >
                {quantity}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--ugaoo-text-muted)' }}>
                {quantity === 1 ? 'pack' : 'packs'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={!availability.isAvailable || quantity >= maxAvailable || isAdding}
              className={styles.stepperBtn}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add To Cart CTA Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!availability.isAvailable || isAdding}
            className={`${styles.addToCartBtn} ${addSuccess ? styles.addedFeedback : ''}`}
            aria-label={
              isAdding
                ? 'Checking stock'
                : !availability.isAvailable
                ? 'Selected Variant Out of Stock'
                : `Add to Botanical Cart • ${totalPriceFormatted}`
            }
          >
            {isAdding ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                <span>Checking Pune Hub Stock...</span>
              </>
            ) : addSuccess ? (
              <>
                <Check size={16} />
                <span>Added {quantity} to Botanical Cart!</span>
              </>
            ) : !availability.isAvailable ? (
              <>
                <AlertCircle size={16} />
                <span>Selected Variant Out of Stock</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Botanical Cart • {totalPriceFormatted}</span>
              </>
            )}
          </button>

          {/* Wishlist / Favorite Button on PDP */}
          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: product.id,
                title: product.title,
                handle: product.handle || '',
                thumbnail: product.thumbnail,
                pricePaise: unitAmountPaise || 0,
                variantId: selectedVariant?.id,
                categoryName: product.categories?.[0]?.name || 'Botanical',
              })
            }
            className={`${styles.wishlistBtnPdp} ${isFavorited ? styles.wishlistBtnPdpActive : ''}`}
            aria-label={
              isFavorited
                ? `Remove ${product.title} from wishlist`
                : `Add ${product.title} to wishlist`
            }
            title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              size={20}
              style={{
                fill: isFavorited ? '#e53935' : 'none',
                color: isFavorited ? '#e53935' : 'currentColor',
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ugaoo-text-muted)', padding: '0 4px' }}>
          <span>{availability.isAvailable ? `Max ${maxAvailable} packets per order` : 'Variant unavailable'}</span>
          <span style={{ color: 'var(--ugaoo-green)', fontWeight: 600 }}>Free shipping on orders above ₹499</span>
        </div>

        {/* Error Notification */}
        {(localError || cartError) && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: 'var(--ugaoo-sale-red)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{localError || cartError}</span>
          </div>
        )}

        {/* Quick Cart Navigation CTA upon success */}
        {addSuccess && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: 'var(--ugaoo-cream)', border: '1px solid var(--ugaoo-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--ugaoo-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} />
              <span>{selectedVariant.title} is now in your cart.</span>
            </span>
            <Link
              href="/cart"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--ugaoo-white)', border: '1px solid var(--ugaoo-border)', color: 'var(--ugaoo-text-dark)', fontWeight: 600, textDecoration: 'none' }}
            >
              <span>View Cart ({totalItems})</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* 4. Fulfillment Micro-Features */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--ugaoo-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '12px', color: 'var(--ugaoo-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--ugaoo-cream)', color: 'var(--ugaoo-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={16} aria-hidden="true" />
          </div>
          <span>Dispatched from Pune Hub (PIN 411001)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--ugaoo-cream)', color: 'var(--ugaoo-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PackageCheck size={16} aria-hidden="true" />
          </div>
          <span>Moisture-sealed protective barrier pouch</span>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {showStickyBar && (
        <div
          role="region"
          aria-label="Quick Add Sticky Bar"
          className={styles.stickyBottomBar}
        >
          <div className={styles.stickyInfo}>
            <div className={styles.stickyTitle}>
              {selectedVariant?.title || product.title}
            </div>
            <div className={styles.stickyPrice}>
              {totalPriceFormatted}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!availability.isAvailable || isAdding}
              className={styles.stickyBtn}
            >
              {isAdding ? 'Adding...' : addSuccess ? 'Added!' : `Add • ${totalPriceFormatted}`}
            </button>

            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  title: product.title,
                  handle: product.handle || '',
                  thumbnail: product.thumbnail,
                  pricePaise: unitAmountPaise || 0,
                  variantId: selectedVariant?.id,
                  categoryName: product.categories?.[0]?.name || 'Botanical',
                })
              }
              className={`${styles.wishlistBtnPdp} ${isFavorited ? styles.wishlistBtnPdpActive : ''}`}
              style={{ width: '40px', height: '40px', minWidth: '40px' }}
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
      )}
    </div>
  )
}
