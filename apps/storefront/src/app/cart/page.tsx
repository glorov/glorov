'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Sprout,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD_INR } from '@/lib/constants'
import { PincodeChecker } from '@/components/shipping/PincodeChecker'

export default function CartPage() {
  const {
    cart,
    isLoading,
    isMutating,
    error,
    totalItems,
    updateQuantity,
    removeItem,
    clearError,
  } = useCart()

  const items = cart?.items || []
  const subtotal = cart?.item_subtotal || cart?.subtotal || 0
  const discountTotal = cart?.discount_total || 0
  const shippingTotal = cart?.shipping_total || 0
  const taxTotal = cart?.tax_total || 0
  const cartTotal = cart?.total || Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal)
  const subtotalINR = subtotal / 100
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD_INR - subtotalINR)

  const hasPerishable = items.some(
    (item) =>
      item.product_title?.toLowerCase().includes('plant') ||
      item.variant_title?.toLowerCase().includes('pot')
  )
  const cartWeightKg = Math.max(
    0.25,
    items.reduce((acc, item) => acc + (item.quantity || 1) * 0.2, 0)
  )

  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-botanical-600" />
        <h2 className="text-xl font-bold text-botanical-950">Loading your botanical cart...</h2>
        <p className="text-sm text-muted-foreground">Checking live stock and pricing with Medusa engine</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full bg-botanical-50 flex items-center justify-center text-botanical-700 mb-6 shadow-inner">
          <Sprout className="h-10 w-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950 tracking-tight">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Explore our certified Desi seeds, low-light indoor plants, and natural potting mixes ready for pan-India dispatch.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button asChild variant="botanical" size="lg" className="rounded-full shadow-md gap-2">
            <Link href="/store">
              <span>Browse Botanical Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-botanical-950 flex items-center gap-3">
            <span>Shopping Cart</span>
            <Badge variant="botanical" className="text-xs font-semibold">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Prices validated by Medusa backend engine. Direct dispatch from our Pune nursery hub.
          </p>
        </div>

        <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto text-xs text-botanical-700 hover:text-botanical-800">
          <Link href="/store">← Continue Shopping</Link>
        </Button>
      </div>

      {/* Free Shipping Meter */}
      <div className="my-6 p-4 rounded-xl border border-botanical-200 bg-botanical-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-botanical-600 text-white flex items-center justify-center flex-shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            {freeShippingRemaining === 0 ? (
              <p className="text-sm font-bold text-botanical-950 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>You qualify for FREE Standard Delivery across India!</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-botanical-950">
                Add <span className="font-bold text-botanical-800">{formatINR(freeShippingRemaining * 100)}</span> more of gardening supplies for <span className="font-bold text-botanical-800">FREE delivery</span>!
              </p>
            )}
            <p className="text-xs text-muted-foreground">Standard dispatch threshold is ₹{FREE_SHIPPING_THRESHOLD_INR}.</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-xs font-bold text-red-900 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid Layout: Items Table vs Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-6">
        {/* Left: Items List */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="hidden sm:grid grid-cols-12 px-6 py-3 bg-earth-50/80 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Botanical Item</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            <ul className="divide-y divide-border">
              {items.map((item) => {
                const unitPrice = item.unit_price || 0
                const lineTotal = item.subtotal || unitPrice * (item.quantity || 1)

                return (
                  <li key={item.id} className="p-4 sm:p-6 hover:bg-earth-50/30 transition-colors">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="sm:col-span-6 flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 rounded-lg border border-border bg-earth-100 overflow-hidden relative">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title || 'Product'}
                              width={80}
                              height={80}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-botanical-400">
                              <Sprout className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-sm text-botanical-950 hover:text-botanical-700">
                            {item.title}
                          </h3>
                          {item.variant_title && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-[11px] py-0 px-2 font-medium bg-earth-50">
                                {item.variant_title}
                              </Badge>
                            </div>
                          )}
                          {item.variant_sku && (
                            <span className="text-[10px] font-mono text-muted-foreground mt-1 uppercase">
                              SKU: {item.variant_sku}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unit Price (Desktop) */}
                      <div className="sm:col-span-2 text-center text-sm font-semibold text-botanical-900 hidden sm:block">
                        {formatINR(unitPrice)}
                      </div>

                      {/* Quantity Modifier */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-center gap-2">
                        <span className="sm:hidden text-xs text-muted-foreground">Quantity:</span>
                        <div className="flex items-center border border-border rounded-lg bg-background shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={isMutating}
                            className="p-1.5 hover:bg-earth-100 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-botanical-950 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={isMutating}
                            className="p-1.5 hover:bg-earth-100 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Mobile Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isMutating}
                          className="sm:hidden text-red-600 p-1.5 hover:bg-red-50 rounded"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Subtotal & Desktop Delete */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 text-right">
                        <span className="sm:hidden text-xs text-muted-foreground">Line Total:</span>
                        <div>
                          <div className="text-sm font-bold text-botanical-950">
                            {formatINR(lineTotal)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isMutating}
                            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 mt-1 hover:underline disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-botanical-950 border-b border-border pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Subtotal</span>
                <span className="font-semibold text-botanical-950">{formatINR(subtotal)}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Botanical Discount</span>
                  <span className="font-semibold">-{formatINR(discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold text-botanical-950">
                  {shippingTotal > 0 ? formatINR(shippingTotal) : 'Calculated at checkout'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <span className="font-semibold">Agricultural GST (HSN 1209)</span>
                {taxTotal > 0 ? (
                  <span className="font-bold text-botanical-950">{formatINR(taxTotal)}</span>
                ) : (
                  <span className="font-bold">0% (Exempt)</span>
                )}
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-botanical-950">Estimated Total</span>
                  <p className="text-[11px] text-muted-foreground">INR Currency (₹)</p>
                </div>
                <span className="text-2xl font-black text-botanical-950 tracking-tight">
                  {formatINR(cartTotal)}
                </span>
              </div>
            </div>

            {/* Pincode Serviceability & Speed Check */}
            <PincodeChecker
              compact={true}
              isPerishable={hasPerishable}
              weightKg={cartWeightKg}
              declaredValueInr={subtotalINR}
            />

            <Button
              asChild
              variant="botanical"
              size="lg"
              className="w-full rounded-xl py-6 font-bold text-sm shadow-md gap-2"
            >
              <Link href="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            {/* Assurance Trust Points */}
            <div className="pt-2 border-t border-earth-100 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-botanical-700 flex-shrink-0" />
                <span>Heirloom Desi cultivars &amp; climate-hardened live plants</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-botanical-700 flex-shrink-0" />
                <span>Express dispatch from Pune Central Nursery Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
