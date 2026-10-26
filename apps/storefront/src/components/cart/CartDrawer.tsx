'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

export function CartDrawer() {
  const {
    cart,
    isLoading,
    isMutating,
    error,
    totalItems,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearError,
  } = useCart()

  // Handle Escape key listener and body scroll locking
  React.useEffect(() => {
    if (!isDrawerOpen) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDrawerOpen, closeDrawer])

  if (!isDrawerOpen) return null

  const items = cart?.items || []
  const subtotal = cart?.item_subtotal || cart?.subtotal || 0

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-background shadow-2xl flex flex-col border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-earth-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-botanical-700" />
              <h2 id="cart-drawer-title" className="font-bold text-lg text-botanical-950">
                Your Botanical Cart ({totalItems})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-earth-100 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="text-red-900 font-bold ml-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading && items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-botanical-600" />
                <p className="text-sm">Loading your garden cart...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 gap-4">
                <div className="h-16 w-16 rounded-full bg-botanical-50 flex items-center justify-center text-botanical-700">
                  <Sprout className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-botanical-950">Your seed pouch is empty</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Explore high-viability vegetable seeds, flowering companion plants, and nursery supplies.
                  </p>
                </div>
                <Button
                  onClick={closeDrawer}
                  asChild
                  variant="botanical"
                  className="rounded-full mt-2"
                >
                  <Link href="/store">Explore Botanical Store</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const unitPrice = item.unit_price || 0
                  const lineTotal = item.subtotal || unitPrice * (item.quantity || 1)
                  return (
                    <li key={item.id} className="py-4 flex gap-4">
                      {/* Thumbnail */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-earth-50 relative">
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
                          <div className="h-full w-full flex items-center justify-center text-botanical-300">
                            <Sprout className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold text-botanical-950 line-clamp-1">
                              {item.title}
                            </h4>
                            <span className="text-sm font-bold text-botanical-900 whitespace-nowrap">
                              {formatINR(lineTotal)}
                            </span>
                          </div>
                          {item.variant_title && (
                            <p className="text-xs text-botanical-700 font-medium mt-0.5">
                              Variant: {item.variant_title}
                            </p>
                          )}
                          {item.variant_sku && (
                            <p className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">
                              SKU: {item.variant_sku}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatINR(unitPrice)} each
                          </p>
                        </div>

                        {/* Quantity Controls & Delete */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-earth-100">
                          <div className="flex items-center border border-border rounded-md bg-background overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                              disabled={isMutating}
                              className="h-8 w-8 flex items-center justify-center hover:bg-earth-100 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 disabled:opacity-50"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-botanical-950 min-w-[1.75rem] text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                              disabled={isMutating}
                              className="h-8 w-8 flex items-center justify-center hover:bg-earth-100 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 disabled:opacity-50"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isMutating}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 p-1.5 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border px-6 py-4 bg-earth-50/60 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-botanical-950 text-base">{formatINR(subtotal)}</span>
                </div>
                {(cart?.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatINR(cart?.discount_total || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping (India)</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Seeds are 0% GST exempt (HSN 1209). Secure Pune hub dispatch.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  onClick={closeDrawer}
                  asChild
                  variant="outline"
                  className="w-full text-xs"
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button
                  onClick={closeDrawer}
                  asChild
                  variant="botanical"
                  className="w-full text-xs gap-1.5 font-bold shadow-md"
                >
                  <Link href="/checkout">
                    <span>Checkout</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
