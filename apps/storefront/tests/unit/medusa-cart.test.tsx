import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  CartProvider,
  useCart,
} from '../../src/context/CartContext'
import {
  getCartIdCookie,
  setCartIdCookie,
  clearCartIdCookie,
  transformMedusaLineItem,
  transformMedusaCart,
  CART_COOKIE_NAME,
} from '../../src/lib/api/cart'
import type { MedusaCart } from '../../src/types/cart'
import type { GlorovProductItem } from '../../src/types/storefront'
import { CustomerAuthContext, type CustomerAuthContextValue } from '../../src/context/CustomerAuthContext'

const mockMedusaCart: MedusaCart = {
  id: 'cart_01MEDUSA_TEST_CART',
  currency_code: 'inr',
  total: 9800, // ₹98 in paise
  subtotal: 9800,
  item_subtotal: 9800,
  item_total: 9800,
  discount_total: 0,
  shipping_total: 0,
  original_item_total: 14800, // ₹148 compare at (74 * 2)
  promotions: [],
  items: [
    {
      id: 'item_01LINE_ITEM',
      title: 'Tomato Seeds (Desi / Pusa Ruby)',
      quantity: 2,
      unit_price: 4900, // ₹49
      compare_at_unit_price: 7400, // ₹74
      variant_id: 'variant_01TOMATO_20',
      product_id: 'prod_tomato_seeds',
      product_title: 'Tomato Seeds (Desi / Pusa Ruby)',
      variant_title: '20 Seeds',
      variant_sku: 'GLR-SD-TOM-020',
      thumbnail: 'https://res.cloudinary.com/naodmm8w/image/upload/tomato.jpg',
      product: {
        id: 'prod_tomato_seeds',
        title: 'Tomato Seeds (Desi / Pusa Ruby)',
        categories: [{ id: 'cat_seeds', name: 'Seeds' }],
      },
    },
  ],
}

const mockProductItem: GlorovProductItem = {
  id: 'prod_tomato_seeds',
  slug: 'tomato-seeds-desi',
  title: 'Tomato Seeds (Desi / Pusa Ruby)',
  category: 'Seeds',
  price: 74,
  discountPrice: 49,
  rating: 4.8,
  reviewCount: 30,
  imageUrls: ['https://res.cloudinary.com/naodmm8w/image/upload/tomato.jpg'],
  primaryImage: 'https://res.cloudinary.com/naodmm8w/image/upload/tomato.jpg',
  inStock: true,
  variants: [
    {
      id: 'variant_01TOMATO_20',
      name: '20 Seeds',
      price: 74,
      discountPrice: 49,
      inStock: true,
    },
  ],
}

describe('Medusa Cart Cookie Helpers', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    document.cookie = `${CART_COOKIE_NAME}=; Path=/; Max-Age=0`
    document.cookie = 'glorov_cart_id=; Path=/; Max-Age=0'
    localStorage.clear()
  })

  it('sets and retrieves cart_id cookie', () => {
    setCartIdCookie('cart_test_12345')
    const retrieved = getCartIdCookie()
    expect(retrieved).toBe('cart_test_12345')
  })

  it('falls back to localStorage if cookie is absent', () => {
    localStorage.setItem('glorov_cart_id', 'cart_fallback_storage')
    expect(getCartIdCookie()).toBe('cart_fallback_storage')
  })

  it('clears cart_id cookie and storage', () => {
    setCartIdCookie('cart_to_clear')
    expect(getCartIdCookie()).toBe('cart_to_clear')

    clearCartIdCookie()
    expect(getCartIdCookie()).toBeNull()
  })
})

describe('Medusa Data Transformers', () => {
  it('transformMedusaLineItem converts paise to INR and extracts metadata', () => {
    const rawItem = mockMedusaCart.items![0]
    const transformed = transformMedusaLineItem(rawItem)

    expect(transformed.id).toBe('item_01LINE_ITEM')
    expect(transformed.productId).toBe('prod_tomato_seeds')
    expect(transformed.variantId).toBe('variant_01TOMATO_20')
    expect(transformed.price).toBe(49) // 4900 paise -> ₹49
    expect(transformed.originalPrice).toBe(74) // 7400 paise -> ₹74
    expect(transformed.quantity).toBe(2)
    expect(transformed.category).toBe('Seeds')
    expect(transformed.variantName).toBe('20 Seeds')
    expect(transformed.sku).toBe('GLR-SD-TOM-020')
  })

  it('transformMedusaCart computes server totals in INR', () => {
    const transformed = transformMedusaCart(mockMedusaCart)

    expect(transformed.cartItems).toHaveLength(1)
    expect(transformed.cartCount).toBe(2)
    expect(transformed.cartSubtotal).toBe(98) // 9800 paise -> ₹98
    expect(transformed.compareSubtotal).toBe(148) // 14800 paise -> ₹148
    expect(transformed.overallDiscountPercent).toBe(34) // (148 - 98) / 148 = ~34%
    expect(transformed.discountAmount).toBe(0)
    expect(transformed.shippingAmount).toBe(0)
  })
})

describe('Medusa CartProvider Integration', () => {
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    document.cookie = `${CART_COOKIE_NAME}=; Path=/; Max-Age=0`
    document.cookie = 'glorov_cart_id=; Path=/; Max-Age=0'
    localStorage.clear()
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('1. On first visit: POST /store/carts creates server cart and stores cart_id in cookie', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/store/carts') && init?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              id: 'cart_first_visit_001',
              currency_code: 'inr',
              total: 0,
              subtotal: 0,
              items: [],
            },
          }),
        }
      }
      return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
    })
    global.fetch = fetchMock

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    // Wait for mount cart initialization
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(result.current.cartId).toBe('cart_first_visit_001')
    expect(getCartIdCookie()).toBe('cart_first_visit_001')
    expect(result.current.cartCount).toBe(0)
  })

  it('2. On return visit: GET /store/carts/:id restores existing cart', async () => {
    setCartIdCookie('cart_return_visit_777')

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/store/carts/cart_return_visit_777')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_return_visit_777',
            },
          }),
        }
      }
      return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
    })
    global.fetch = fetchMock

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    expect(result.current.cartId).toBe('cart_return_visit_777')
    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartSubtotal).toBe(98)
    expect(result.current.cartCount).toBe(2)
  })

  it('3. addToCart calls POST /store/carts/:id/line-items and updates server totals', async () => {
    setCartIdCookie('cart_active_001')

    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/store/carts/cart_active_001/line-items') && init?.method === 'POST') {
        const body = JSON.parse(init.body as string)
        expect(body.variant_id).toBe('variant_01TOMATO_20')
        expect(body.quantity).toBe(2)

        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_active_001',
            },
          }),
        }
      }
      if (url.includes('/store/carts/cart_active_001')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              id: 'cart_active_001',
              currency_code: 'inr',
              total: 0,
              subtotal: 0,
              items: [],
            },
          }),
        }
      }
      return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
    })
    global.fetch = fetchMock

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30))
    })

    await act(async () => {
      await result.current.addToCart(mockProductItem, 2)
    })

    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartSubtotal).toBe(98)
  })

  it('4. updateCartQuantity calls POST /store/carts/:id/line-items/:line_id and updates quantity', async () => {
    setCartIdCookie('cart_active_002')

    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/store/carts/cart_active_002/line-items/item_01LINE_ITEM') && init?.method === 'POST') {
        const body = JSON.parse(init.body as string)
        expect(body.quantity).toBe(4)

        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_active_002',
              total: 19600, // 4 x 4900
              subtotal: 19600,
              item_subtotal: 19600,
              items: [
                {
                  ...mockMedusaCart.items![0],
                  quantity: 4,
                },
              ],
            },
          }),
        }
      }
      if (url.includes('/store/carts/cart_active_002')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_active_002',
            },
          }),
        }
      }
      return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
    })
    global.fetch = fetchMock

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30))
    })

    await act(async () => {
      await result.current.updateCartQuantity('item_01LINE_ITEM', 4)
    })

    expect(result.current.cartCount).toBe(4)
    expect(result.current.cartSubtotal).toBe(196) // 19600 paise -> ₹196
  })

  it('5. removeFromCart calls DELETE /store/carts/:id/line-items/:line_id', async () => {
    setCartIdCookie('cart_active_003')

    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/store/carts/cart_active_003/line-items/item_01LINE_ITEM') && init?.method === 'DELETE') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            id: 'item_01LINE_ITEM',
            object: 'line-item',
            deleted: true,
            parent: {
              id: 'cart_active_003',
              currency_code: 'inr',
              total: 0,
              subtotal: 0,
              items: [],
            },
          }),
        }
      }
      if (url.includes('/store/carts/cart_active_003')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_active_003',
            },
          }),
        }
      }
      return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
    })
    global.fetch = fetchMock

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30))
    })

    expect(result.current.cartCount).toBe(2)

    await act(async () => {
      await result.current.removeFromCart('item_01LINE_ITEM')
    })

    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('6. Guest cart merges with customer account on login via POST /store/carts/:id/customer', async () => {
    setCartIdCookie('cart_guest_to_transfer')

    let customerTransferCalled = false

    const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/store/carts/cart_guest_to_transfer/customer') && init?.method === 'POST') {
        customerTransferCalled = true
        expect(init.headers).toBeDefined()
        const authHeader = (init.headers as Record<string, string>)['Authorization']
        expect(authHeader).toBe('Bearer customer_jwt_token_123')

        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_guest_to_transfer',
              customer_id: 'cust_priya_001',
              email: 'priya@example.com',
            },
          }),
        }
      }
      if (url.includes('/store/carts/cart_guest_to_transfer')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            cart: {
              ...mockMedusaCart,
              id: 'cart_guest_to_transfer',
            },
          }),
        }
      }
      return { ok: false, status: 404, headers: new Headers(), json: async () => ({}) }
    })
    global.fetch = fetchMock

    const mockAuthContext: CustomerAuthContextValue = {
      customer: {
        id: 'cust_priya_001',
        email: 'priya@example.com',
        firstName: 'Priya',
        lastName: 'Nair',
        gardeningExperience: 'Intermediate',
        memberSince: 'Nov 2026',
      },
      token: 'customer_jwt_token_123',
      isAuthenticated: true,
      isLoading: false,
      authError: null,
      login: async () => ({ success: true }),
      register: async () => ({ success: true }),
      logout: () => {},
      requestPasswordReset: async () => ({ success: true }),
      resetPassword: async () => ({ success: true }),
      updateProfile: async () => true,
      addresses: [],
      addAddress: async () => true,
      updateAddress: async () => true,
      deleteAddress: async () => true,
      setDefaultAddress: async () => true,
      refreshAddresses: async () => {},
      orders: [],
      refreshOrders: async () => {},
      notifications: [],
      markNotificationAsRead: () => {},
      notificationPreferences: {
        order_updates: true,
        shipping_alerts: true,
        promotions: true,
        botanical_tips: true,
      },
      updateNotificationPreferences: async () => true,
      refreshNotifications: async () => {},
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CustomerAuthContext.Provider value={mockAuthContext}>
        <CartProvider>{children}</CartProvider>
      </CustomerAuthContext.Provider>
    )

    renderHook(() => useCart(), { wrapper })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60))
    })

    expect(customerTransferCalled).toBe(true)
  })
})
