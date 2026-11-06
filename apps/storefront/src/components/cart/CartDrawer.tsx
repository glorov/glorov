'use client'

import React from 'react'
import Link from 'next/link'
import type { CartItem } from '../../types/cart'
import { Drawer } from '../ui/Drawer'
import { Button } from '../ui/Button'
import { GlorovImage } from '../ui/GlorovImage'
import { GlorovCustomIcons } from '../common/GlorovIcons'
import { formatINR } from '../../lib/utils/currency'
import { useCart, FREE_SHIPPING_THRESHOLD } from '../../context/CartContext'

export interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  /**
   * Optional items override for component testing / isolated rendering.
   * If omitted, consumes active CartContext.
   */
  items?: CartItem[]
  subtotal?: number
  total?: number
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  onRemoveItem?: (itemId: string) => void
  onCheckout?: () => void
}

export function CartDrawer({
  isOpen,
  onClose,
  items: propsItems,
  subtotal: propsSubtotal,
  total: propsTotal,
  onUpdateQuantity: propsUpdateQuantity,
  onRemoveItem: propsRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  // Gracefully fallback to CartContext if rendered inside CartProvider
  let contextItems: CartItem[] = []
  let contextSubtotal = 0
  let contextTotal = 0
  let contextUpdateQuantity: (id: string, q: number) => void = () => {}
  let contextRemoveItem: (id: string) => void = () => {}

  try {
    const cart = useCart()
    if (cart) {
      contextItems = cart.cartItems || []
      contextSubtotal = cart.cartSubtotal || 0
      contextTotal = cart.cartTotal || 0
      contextUpdateQuantity = cart.updateCartQuantity
      contextRemoveItem = cart.removeFromCart
    }
  } catch {
    // Rendered outside CartProvider (e.g. isolated component unit test)
  }

  const items = propsItems !== undefined ? propsItems : contextItems
  const subtotal = propsSubtotal !== undefined ? propsSubtotal : contextSubtotal
  const total = propsTotal !== undefined ? propsTotal : (contextTotal || subtotal)
  const updateQuantity = propsUpdateQuantity || contextUpdateQuantity
  const removeItem = propsRemoveItem || contextRemoveItem

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      title={
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-forest-deep text-lg">Your Cart</span>
          {itemCount > 0 && (
            <span
              data-testid="drawer-cart-count"
              className="bg-[#E8F5E9] text-[#1B4332] text-xs font-bold px-2 py-0.5 rounded-full"
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      }
      footer={
        items.length > 0 ? (
          <div className="w-full flex flex-col gap-3 pt-3 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between text-sm text-[#4B5563]">
              <span>Subtotal</span>
              <span data-testid="drawer-subtotal" className="font-semibold text-[#111827]">
                {formatINR(subtotal * 100)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#4B5563]">
              <span>Delivery</span>
              <span data-testid="drawer-shipping" className="font-medium text-[#0A4C36]">
                {isFreeShipping ? 'FREE' : formatINR(99 * 100)}
              </span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-forest-deep pt-1 border-t border-[#F3F4F6]">
              <span>Estimated Total</span>
              <span data-testid="drawer-total">{formatINR(total * 100)}</span>
            </div>
            {onCheckout ? (
              <Button
                variant="primary"
                onClick={onCheckout}
                className="w-full min-h-[48px] text-base"
                data-testid="drawer-checkout-btn"
              >
                Proceed to Checkout →
              </Button>
            ) : (
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center min-h-[48px] bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-lg transition-colors text-base"
                data-testid="drawer-checkout-btn"
              >
                Proceed to Checkout →
              </Link>
            )}
          </div>
        ) : null
      }
    >
      <div className="flex flex-col h-full">
        {/* Free shipping threshold prompt */}
        {items.length > 0 && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#F2FAF5] border border-[#D8F3DC] text-xs text-[#1B4332]">
            {isFreeShipping ? (
              <p className="font-semibold flex items-center gap-1.5">
                <span>🌱</span> Unlocked FREE Botanical Delivery across India!
              </p>
            ) : (
              <p>
                Add <span className="font-bold">{formatINR(amountToFreeShipping * 100)}</span> more
                for FREE delivery!
              </p>
            )}
          </div>
        )}

        {/* Cart items list */}
        {items.length === 0 ? (
          <div
            data-testid="drawer-empty-state"
            className="flex-1 flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#F2FAF5] flex items-center justify-center text-[#1B4332] mb-3">
              <GlorovCustomIcons.cart size={28} />
            </div>
            <h3 className="font-serif font-bold text-lg text-forest-deep mb-1">
              Your cart is empty
            </h3>
            <p className="text-xs text-[#6B7280] max-w-[240px] mb-4">
              Explore heirloom seeds, live indoor plants, and handcrafted planters.
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs min-h-[36px]"
              data-testid="drawer-shop-now-btn"
            >
              Start Gardening
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1" data-testid="drawer-items-list">
            {items.map((item) => (
              <div
                key={item.id}
                data-testid={`drawer-item-${item.id}`}
                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-[#E5E7EB]"
              >
                <div className="relative w-14 h-14 rounded-md overflow-hidden bg-[#E8F5E9] flex-shrink-0">
                  <GlorovImage
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    fallbackTitle={item.title}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#111827] truncate">{item.title}</h4>
                  {item.variantName && (
                    <p className="text-[11px] text-[#6B7280] truncate">{item.variantName}</p>
                  )}
                  <p className="text-xs font-semibold text-[#1B4332] mt-0.5">
                    {formatINR(item.price * 100)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center border border-[#D1D5DB] rounded-md bg-[#F9FAFB]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="px-2 py-0.5 text-xs text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] transition-colors"
                      data-testid={`drawer-qty-dec-${item.id}`}
                    >
                      −
                    </button>
                    <span
                      data-testid={`drawer-qty-val-${item.id}`}
                      className="px-2 text-xs font-semibold text-[#111827]"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="px-2 py-0.5 text-xs text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] transition-colors"
                      data-testid={`drawer-qty-inc-${item.id}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="text-[10px] text-[#DC2626] hover:underline"
                    data-testid={`drawer-remove-${item.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default CartDrawer
