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
} from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getVariantStockAvailability, getVariantPriceINR } from '@/lib/catalog'

interface VariantSelectorProps {
  product: StoreCatalogProduct
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const variants = useMemo(() => product.variants || [], [product.variants])
  const { addToCart, error: cartError, clearError, totalItems } = useCart()

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

  // Variant metadata (e.g., packet_size_label, approx_seeds_per_packet, weight_grams)
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
      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>No purchasable options are currently active for this botanical product.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Price & Stock Status Banner */}
      <div className="pb-4 border-b border-border space-y-2">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-botanical-950 tracking-tight">
              {priceFormatted}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              (0% GST on agricultural seeds / HSN 1209)
            </span>
          </div>

          <div>
            {availability.status === 'out_of_stock' ? (
              <Badge variant="destructive" className="text-xs font-bold gap-1 py-1 px-2.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Out of Stock</span>
              </Badge>
            ) : availability.status === 'low_stock' ? (
              <Badge variant="warning" className="text-xs font-bold gap-1 py-1 px-2.5">
                <span>Low Stock: Only {availability.availableQuantity} left</span>
              </Badge>
            ) : (
              <Badge variant="botanical" className="text-xs font-semibold gap-1 py-1 px-2.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>In Stock &amp; Verified</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Selected Variant SKU & Details */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
          {selectedVariant?.sku && (
            <span className="font-mono uppercase bg-earth-100 px-2 py-0.5 rounded border border-border">
              SKU: {selectedVariant.sku}
            </span>
          )}

          {(approxSeeds || weightGrams || packetLabel) && (
            <div className="flex items-center gap-2 text-botanical-800 font-medium">
              <Sparkles className="h-3 w-3 text-botanical-600" />
              {approxSeeds && <span>Approx. {approxSeeds} Seeds</span>}
              {approxSeeds && weightGrams && <span>•</span>}
              {weightGrams && <span>{weightGrams}g Net</span>}
              {packetLabel && !approxSeeds && !weightGrams && <span>{packetLabel}</span>}
            </div>
          )}
        </div>
      </div>

      {/* 2. Option / Variant Selection Cards */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-botanical-900 mb-2.5">
          Select Variant / Packet Size:
        </label>
        <div
          role="radiogroup"
          aria-label="Product Variants and Packet Sizes"
          className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
        >
          {variants.map((v) => {
            const isSelected = v.id === selectedVariantId
            const vAvail = getVariantStockAvailability(v)
            const vPrice = getVariantPriceINR(v)

            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${v.title} - ${vPrice}${!vAvail.isAvailable ? ' - Sold Out' : ''}`}
                onClick={() => handleVariantChange(v.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 cursor-pointer ${
                  isSelected
                    ? 'border-botanical-700 bg-botanical-50/80 ring-1 ring-botanical-700 shadow-xs'
                    : 'border-border bg-background hover:border-botanical-300 hover:bg-earth-50/40'
                } ${!vAvail.isAvailable ? 'opacity-65 bg-earth-100/40' : ''}`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="font-bold text-xs sm:text-sm text-botanical-950">
                    {v.title}
                  </span>
                  {!vAvail.isAvailable && (
                    <span className="text-[9px] font-bold text-destructive uppercase tracking-wider bg-destructive/10 px-1.5 py-0.5 rounded">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-border/40 text-xs">
                  <span className="font-semibold text-botanical-900">{vPrice}</span>
                  {vAvail.isAvailable && vAvail.status === 'low_stock' && (
                    <span className="text-[10px] text-amber-700 font-medium">
                      {vAvail.availableQuantity} left
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Quantity & Add to Cart Actions */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <label htmlFor="variant-quantity" className="text-xs font-bold uppercase tracking-wider text-botanical-900 shrink-0">
            Quantity:
          </label>

          <div className="flex items-center border border-border rounded-lg bg-background shadow-xs">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || !availability.isAvailable || isAdding}
              className="p-2 hover:bg-earth-100 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span
              id="variant-quantity"
              className="px-4 text-sm font-bold text-botanical-950 min-w-[2.5rem] text-center select-none"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={
                !availability.isAvailable ||
                quantity >= maxAvailable ||
                isAdding
              }
              className="p-2 hover:bg-earth-100 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-xs text-muted-foreground">
            {availability.isAvailable
              ? `Max ${maxAvailable} per order`
              : 'Variant unavailable'}
          </span>
        </div>

        {/* Error Notification */}
        {(localError || cartError) && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{localError || cartError}</span>
          </div>
        )}

        {/* Add to Cart Button & Success Feedback */}
        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={!availability.isAvailable || isAdding}
            variant="botanical"
            size="lg"
            className="w-full py-6 font-bold text-sm shadow-md gap-2 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking Pune Hub Stock...</span>
              </>
            ) : addSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Added {quantity} to Botanical Cart!</span>
              </>
            ) : !availability.isAvailable ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Selected Variant Out of Stock</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Botanical Cart • {priceFormatted}</span>
              </>
            )}
          </Button>

          {/* Quick Cart Navigation CTA upon success */}
          {addSuccess && (
            <div className="p-3 rounded-xl bg-botanical-50 border border-botanical-200 flex items-center justify-between text-xs animate-in fade-in-0 duration-150">
              <span className="text-botanical-900 font-semibold flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>{selectedVariant.title} is now in your cart.</span>
              </span>
              <Button asChild variant="outline" size="sm" className="h-7 text-xs border-botanical-300 gap-1 bg-white">
                <Link href="/cart">
                  <span>View Cart ({totalItems})</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Fulfillment & Assurance Micro-Features */}
      <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-botanical-700 shrink-0" />
          <span>Dispatched from Pune Hub (PIN 411001)</span>
        </div>
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-botanical-700 shrink-0" />
          <span>Moisture-sealed protective barrier pouch</span>
        </div>
      </div>
    </div>
  )
}
