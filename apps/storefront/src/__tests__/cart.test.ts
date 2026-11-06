import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  CartProvider,
  useCart,
  FREE_SHIPPING_THRESHOLD,
} from '../context/CartContext'
import type { GlorovProductItem } from '../types/storefront'
import { CART_COOKIE_NAME } from '../lib/api/cart'

const sampleProductA: GlorovProductItem = {
  id: 'prod_chilli_seeds',
  slug: 'green-chilli-seeds',
  title: 'Green Chilli Seeds (Heirloom)',
  category: 'Seeds',
  price: 149,
  discountPrice: 99,
  rating: 4.9,
  reviewCount: 42,
  imageUrls: ['https://res.cloudinary.com/naodmm8w/image/upload/chilli.png'],
  primaryImage: 'https://res.cloudinary.com/naodmm8w/image/upload/chilli.png',
  inStock: true,
  variants: [
    {
      id: 'var_chilli_100',
      name: '100 Seeds Value Pack',
      price: 149,
      discountPrice: 99,
      inStock: true,
    },
  ],
}

const sampleProductB: GlorovProductItem = {
  id: 'prod_monstera',
  slug: 'monstera-deliciosa',
  title: 'Monstera Deliciosa (Swiss Cheese Plant)',
  category: 'Live Houseplants',
  price: 699,
  discountPrice: 599,
  rating: 4.8,
  reviewCount: 19,
  imageUrls: ['https://res.cloudinary.com/naodmm8w/image/upload/monstera.png'],
  primaryImage: 'https://res.cloudinary.com/naodmm8w/image/upload/monstera.png',
  inStock: true,
  variants: [
    {
      id: 'var_monstera_ceramic',
      name: 'White Ceramic Planter',
      price: 699,
      discountPrice: 599,
      inStock: true,
    },
  ],
}

describe('Cart Operations Unit Tests (cart.test.ts)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    localStorage.clear()
    document.cookie = `${CART_COOKIE_NAME}=; Path=/; Max-Age=0`
    vi.clearAllMocks()

    // Default mock fetch for Medusa cart endpoints to succeed locally
    global.fetch = vi.fn().mockImplementation((url: string | URL | Request, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('/store/carts')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            cart: {
              id: 'cart_test_mock_medusa',
              currency_code: 'inr',
              total: 0,
              subtotal: 0,
              items: [],
            },
          }),
        } as Response)
      }
      if (urlStr.includes('/api/offers')) {
        let subtotal = 0
        try {
          if (init?.body) {
            const parsed = JSON.parse(String(init.body))
            subtotal = Number(parsed.cart_subtotal) || 0
          }
        } catch {
          // ignore
        }

        if (subtotal < 999) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              valid: false,
              error: 'Order subtotal does not meet minimum spend of ₹999.',
            }),
          } as Response)
        }

        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            valid: true,
            discount_percent: 10,
            offer: {
              code: 'DIWALI10',
              title: 'Diwali Festive Discount',
              min_spend: 999,
              discount_value: 10,
            },
          }),
        } as Response)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(CartProvider, null, children)
  )

  it('initializes with empty cart and default shipping option', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartSubtotal).toBe(0)
    expect(result.current.cartTotal).toBe(0)
    expect(result.current.appliedCoupon).toBeNull()
    expect(result.current.selectedShippingOption.amount).toBe(99)
  })

  it('adds items to cart and updates count and subtotal', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addToCart(sampleProductA, 2, sampleProductA.variants![0])
    })

    expect(result.current.cartItems.length).toBe(1)
    expect(result.current.cartItems[0].title).toBe('Green Chilli Seeds (Heirloom)')
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.cartItems[0].price).toBe(99)
    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartSubtotal).toBe(198) // 99 * 2
  })

  it('increments quantity when adding the same product variant again', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addToCart(sampleProductA, 1, sampleProductA.variants![0])
    })
    expect(result.current.cartCount).toBe(1)

    await act(async () => {
      await result.current.addToCart(sampleProductA, 3, sampleProductA.variants![0])
    })

    expect(result.current.cartItems.length).toBe(1)
    expect(result.current.cartItems[0].quantity).toBe(4)
    expect(result.current.cartCount).toBe(4)
    expect(result.current.cartSubtotal).toBe(396) // 99 * 4
  })

  it('updates cart line item quantity and recalculates totals', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addToCart(sampleProductA, 1, sampleProductA.variants![0])
    })

    const itemId = result.current.cartItems[0].id

    await act(async () => {
      await result.current.updateCartQuantity(itemId, 5)
    })

    expect(result.current.cartItems[0].quantity).toBe(5)
    expect(result.current.cartCount).toBe(5)
    expect(result.current.cartSubtotal).toBe(495) // 99 * 5
  })

  it('removes line item when updateCartQuantity is called with 0', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addToCart(sampleProductA, 2, sampleProductA.variants![0])
    })

    const itemId = result.current.cartItems[0].id

    await act(async () => {
      await result.current.updateCartQuantity(itemId, 0)
    })

    expect(result.current.cartItems.length).toBe(0)
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartSubtotal).toBe(0)
  })

  it('removes item directly via removeFromCart()', async () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await result.current.addToCart(sampleProductA, 1, sampleProductA.variants![0])
      await result.current.addToCart(sampleProductB, 1, sampleProductB.variants![0])
    })

    expect(result.current.cartItems.length).toBe(2)
    const firstItemId = result.current.cartItems[0].id

    await act(async () => {
      await result.current.removeFromCart(firstItemId)
    })

    expect(result.current.cartItems.length).toBe(1)
    expect(result.current.cartItems[0].productId).toBe('prod_monstera')
  })

  describe('Shipping and Total Calculations', () => {
    it('applies ₹99 shipping fee when subtotal is below ₹499 threshold', async () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      await act(async () => {
        // ₹99 * 3 = ₹297 (< ₹499)
        await result.current.addToCart(sampleProductA, 3, sampleProductA.variants![0])
      })

      expect(result.current.cartSubtotal).toBe(297)
      expect(result.current.cartSubtotal).toBeLessThan(FREE_SHIPPING_THRESHOLD)
      expect(result.current.shippingAmount).toBe(99)
      expect(result.current.cartTotal).toBe(297 + 99) // ₹396
    })

    it('waives shipping fee (FREE shipping ₹0) when subtotal is >= ₹499', async () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      await act(async () => {
        // Monstera is ₹599 (>= ₹499)
        await result.current.addToCart(sampleProductB, 1, sampleProductB.variants![0])
      })

      expect(result.current.cartSubtotal).toBe(599)
      expect(result.current.cartSubtotal).toBeGreaterThanOrEqual(FREE_SHIPPING_THRESHOLD)
      expect(result.current.shippingAmount).toBe(0)
      expect(result.current.cartTotal).toBe(599)
    })
  })

  describe('Milestone Coupon Application & Discounts', () => {
    it('applies valid coupon when order meets minimum spend requirement', async () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      await act(async () => {
        // Add 2 Monsteras = ₹1198 (qualifies for DIWALI10 with minSpend ₹999)
        await result.current.addToCart(sampleProductB, 2, sampleProductB.variants![0])
      })

      expect(result.current.cartSubtotal).toBe(1198)

      await act(async () => {
        const applied = await result.current.applyCoupon('DIWALI10')
        expect(applied).toBe(true)
      })

      expect(result.current.appliedCoupon).toBe('DIWALI10')
      // 10% of 1198 = 119.8 rounded to 120
      expect(result.current.discountAmount).toBe(120)
      expect(result.current.cartTotal).toBe(1198 - 120) // ₹1078 (free shipping)
    })

    it('rejects coupon if order subtotal does not meet minimum spend', async () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      await act(async () => {
        // Only ₹99 in cart
        await result.current.addToCart(sampleProductA, 1, sampleProductA.variants![0])
      })

      await act(async () => {
        const applied = await result.current.applyCoupon('DIWALI10')
        expect(applied).toBe(false)
      })

      expect(result.current.appliedCoupon).toBeNull()
      expect(result.current.discountAmount).toBe(0)
    })

    it('removes applied coupon and restores full total', async () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      await act(async () => {
        await result.current.addToCart(sampleProductB, 2, sampleProductB.variants![0])
      })

      await act(async () => {
        await result.current.applyCoupon('DIWALI10')
      })

      expect(result.current.appliedCoupon).toBe('DIWALI10')
      expect(result.current.discountAmount).toBeGreaterThan(0)

      await act(async () => {
        await result.current.removeCoupon()
      })

      expect(result.current.appliedCoupon).toBeNull()
      expect(result.current.discountAmount).toBe(0)
      expect(result.current.cartTotal).toBe(1198)
    })
  })

  describe('clearCart()', () => {
    it('resets all cart items, discounts, and totals', async () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      await act(async () => {
        await result.current.addToCart(sampleProductA, 2, sampleProductA.variants![0])
        await result.current.addToCart(sampleProductB, 1, sampleProductB.variants![0])
      })

      expect(result.current.cartItems.length).toBe(2)

      await act(async () => {
        await result.current.clearCart()
      })

      expect(result.current.cartItems).toEqual([])
      expect(result.current.cartCount).toBe(0)
      expect(result.current.cartSubtotal).toBe(0)
      expect(result.current.cartTotal).toBe(0)
      expect(result.current.appliedCoupon).toBeNull()
    })
  })
})
