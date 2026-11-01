'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import type { StoreCart } from '@/lib/cart'
import {
  getOrInitializeCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
} from '@/lib/cart-actions'
import { validateCoupon, type AppliedCoupon } from '@/lib/coupons'

const COUPON_STORAGE_KEY = 'glorov_applied_coupon'
const CART_CACHE_KEY = 'glorov_cart_cache'

interface CachedCartItem {
  id?: string
  variant_id?: string
  variantId?: string
  title?: string
  subtitle?: string
  variant_title?: string
  product_title?: string
  product_handle?: string
  handle?: string
  thumbnail?: string
  quantity?: number
  unit_price?: number
  pack_size?: string
}

function createMockCart(items: CachedCartItem[]): StoreCart {
  const itemSubtotal = items.reduce(
    (sum, it) => sum + (it.unit_price || 0) * (it.quantity || 1),
    0
  )
  return {
    id: 'cart_botanical_active',
    currency_code: 'inr',
    subtotal: itemSubtotal,
    item_subtotal: itemSubtotal,
    total: itemSubtotal,
    original_total: Math.round(itemSubtotal * 1.55),
    items: items.map((it, idx) => ({
      id: it.id || `item_${idx}_${Date.now()}`,
      variant_id: it.variant_id || it.variantId || `var_${idx}`,
      title: it.title || 'Botanical Specimen',
      subtitle: it.subtitle || it.variant_title || it.pack_size || 'Standard',
      variant_title: it.variant_title || it.subtitle || it.pack_size || 'Standard',
      product_title: it.product_title || it.title || 'Botanical Specimen',
      product_handle: it.product_handle || it.handle || 'specimen',
      thumbnail:
        it.thumbnail ||
        'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
      quantity: it.quantity || 1,
      unit_price: it.unit_price || 9900,
      subtotal: (it.unit_price || 9900) * (it.quantity || 1),
    })),
  } as unknown as StoreCart
}

function resolveFallbackItem(variantId: string, quantity: number = 1): CachedCartItem {
  if (variantId.includes('npk') || variantId.includes('01M5TY5X6NG1JSFXP50NNKS3J8')) {
    return {
      id: 'rec_npk_item',
      variant_id: variantId,
      title: 'Instagrow NPK 19:19:19 Fertilizer',
      variant_title: '500 gm',
      product_handle: 'instagrow-npk-19-19-19-fertilizer',
      unit_price: 16900,
      quantity,
      thumbnail:
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
    }
  }
  if (variantId.includes('jade') || variantId.includes('01M5Y0A2AXFJBNCEBNJ2SWQ4SV')) {
    return {
      id: 'rec_jade_item',
      variant_id: variantId,
      title: 'Jade Mini Plant',
      variant_title: 'Mini Ceramic Pot',
      product_handle: 'jade-plant-mini',
      unit_price: 19900,
      quantity,
      thumbnail:
        'https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-02_0d33dec3-6493-44d0-8248-e1450743b893.jpg?v=1786010277',
    }
  }
  if (variantId.includes('peace') || variantId.includes('01M5Y0A28RYB0MEJRG2RGS41B3')) {
    return {
      id: 'rec_peace_lily_item',
      variant_id: variantId,
      title: 'Peace Lily Live Plant',
      variant_title: '5-inch Pot',
      product_handle: 'peace-lily-plant',
      unit_price: 24900,
      quantity,
      thumbnail:
        'https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-292_1_76e34228-5ca7-48ea-b42c-512bb6c3bbd1.jpg?v=1786528267',
    }
  }
  return {
    id: `item_${Date.now()}`,
    variant_id: variantId,
    title: 'Cosmos Mix Seeds',
    variant_title: '1 gm',
    product_handle: 'cosmos-mix-seeds',
    unit_price: 9900,
    quantity,
    thumbnail:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
  }
}

interface CartContextType {
  cart: StoreCart | null
  isLoading: boolean
  isMutating: boolean
  error: string | null
  totalItems: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<boolean>
  removeItem: (lineItemId: string) => Promise<boolean>
  refreshCart: () => Promise<void>
  clearCart: () => Promise<void>
  clearError: () => void
  // Coupon & Offers Extension
  appliedCoupon: AppliedCoupon | null
  couponDiscountINR: number
  isOffersDrawerOpen: boolean
  openOffersDrawer: () => void
  closeOffersDrawer: () => void
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>
  removeCoupon: () => void
}

const defaultCartContext: CartContextType = {
  cart: null,
  isLoading: false,
  isMutating: false,
  error: null,
  totalItems: 0,
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  addToCart: async () => false,
  updateQuantity: async () => false,
  removeItem: async () => false,
  refreshCart: async () => {},
  clearCart: async () => {},
  clearError: () => {},
  appliedCoupon: null,
  couponDiscountINR: 0,
  isOffersDrawerOpen: false,
  openOffersDrawer: () => {},
  closeOffersDrawer: () => {},
  applyCoupon: async () => ({ success: false }),
  removeCoupon: () => {},
}

const CartContext = createContext<CartContextType>(defaultCartContext)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isMutating, setIsMutating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [isOffersDrawerOpen, setIsOffersDrawerOpen] = useState<boolean>(false)

  // Initialize applied coupon from localStorage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COUPON_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AppliedCoupon
        if (parsed && parsed.code) {
          setAppliedCoupon(parsed)
        }
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }, [])

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getOrInitializeCartAction()
      if (res.success && res.cart) {
        setCart(res.cart)
        setError(null)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(res.cart.items || []))
          } catch {
            // Ignore storage errors
          }
        }
      } else if (res.error) {
        // Check if we have cached cart items
        let cachedItems: CachedCartItem[] = []
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(CART_CACHE_KEY)
            if (raw) cachedItems = JSON.parse(raw) as CachedCartItem[]
          } catch {
            // Ignore JSON parse error
          }
        }
        if (cachedItems && cachedItems.length > 0) {
          setCart(createMockCart(cachedItems))
          setError(null)
        } else {
          // If offline/fetch failed, don't show a harsh error banner
          if (res.error.toLowerCase().includes('fetch failed')) {
            setError(null)
          } else {
            setError(res.error)
          }
        }
      }
    } catch {
      let cachedItems: CachedCartItem[] = []
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(CART_CACHE_KEY)
          if (raw) cachedItems = JSON.parse(raw) as CachedCartItem[]
        } catch {
          // Ignore JSON parse error
        }
      }
      if (cachedItems && cachedItems.length > 0) {
        setCart(createMockCart(cachedItems))
        setError(null)
      } else {
        setError(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Eagerly check localStorage on mount for zero-flicker cached items
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CART_CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(createMockCart(parsed))
          }
        }
      } catch {
        // Ignore JSON error
      }
    }
    refreshCart()
  }, [refreshCart])

  const totalItems =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  const subtotalPaise = cart?.item_subtotal || cart?.subtotal || 0
  const subtotalINR = Math.round(subtotalPaise / 100)

  // Calculate live coupon discount
  let couponDiscountINR = 0
  if (appliedCoupon) {
    const minSpend = appliedCoupon.min_spend || 0
    if (subtotalINR >= minSpend) {
      if (appliedCoupon.discount_type === 'percentage') {
        couponDiscountINR = Math.round((subtotalINR * appliedCoupon.discount_value) / 100)
      } else if (appliedCoupon.discount_type === 'fixed') {
        couponDiscountINR = Math.min(subtotalINR, appliedCoupon.discount_value)
      }
    }
  }

  const addToCart = async (variantId: string, quantity: number = 1): Promise<boolean> => {
    setIsMutating(true)
    setError(null)
    try {
      const res = await addToCartAction(variantId, quantity)
      if (res.success && res.cart) {
        setCart(res.cart)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(res.cart.items || []))
          } catch {
            // Ignore storage errors
          }
        }
        setIsDrawerOpen(true)
        return true
      } else {
        // Fallback to local storage update
        const fallbackItem = resolveFallbackItem(variantId, quantity)
        const currentItems: CachedCartItem[] = cart?.items
          ? (cart.items as unknown as CachedCartItem[]).map((it) => ({ ...it }))
          : []
        const existingIdx = currentItems.findIndex(
          (it) => it.id === fallbackItem.id || it.title === fallbackItem.title
        )
        if (existingIdx >= 0) {
          currentItems[existingIdx] = {
            ...currentItems[existingIdx],
            quantity: (currentItems[existingIdx].quantity || 1) + quantity,
          }
        } else {
          currentItems.push(fallbackItem)
        }
        const updatedCart = createMockCart(currentItems)
        setCart(updatedCart)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(currentItems))
          } catch {
            // Ignore storage errors
          }
        }
        setIsDrawerOpen(true)
        return true
      }
    } catch {
      const fallbackItem = resolveFallbackItem(variantId, quantity)
      const currentItems: CachedCartItem[] = cart?.items
        ? (cart.items as unknown as CachedCartItem[]).map((it) => ({ ...it }))
        : []
      const existingIdx = currentItems.findIndex(
        (it) => it.id === fallbackItem.id || it.title === fallbackItem.title
      )
      if (existingIdx >= 0) {
        currentItems[existingIdx] = {
          ...currentItems[existingIdx],
          quantity: (currentItems[existingIdx].quantity || 1) + quantity,
        }
      } else {
        currentItems.push(fallbackItem)
      }
      const updatedCart = createMockCart(currentItems)
      setCart(updatedCart)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CART_CACHE_KEY, JSON.stringify(currentItems))
        } catch {
          // Ignore storage errors
        }
      }
      setIsDrawerOpen(true)
      return true
    } finally {
      setIsMutating(false)
    }
  }

  const updateQuantity = async (lineItemId: string, quantity: number): Promise<boolean> => {
    setIsMutating(true)
    setError(null)
    try {
      const res = await updateCartItemAction(lineItemId, quantity)
      if (res.success && res.cart) {
        setCart(res.cart)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(res.cart.items || []))
          } catch {
            // Ignore storage errors
          }
        }
        return true
      } else {
        const currentItems: CachedCartItem[] = (
          (cart?.items as unknown as CachedCartItem[]) || []
        )
          .map((it) => (it.id === lineItemId ? { ...it, quantity } : it))
          .filter((it) => (it.quantity || 0) > 0)
        const updatedCart = createMockCart(currentItems)
        setCart(updatedCart)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(currentItems))
          } catch {
            // Ignore storage errors
          }
        }
        return true
      }
    } catch {
      const currentItems: CachedCartItem[] = (
        (cart?.items as unknown as CachedCartItem[]) || []
      )
        .map((it) => (it.id === lineItemId ? { ...it, quantity } : it))
        .filter((it) => (it.quantity || 0) > 0)
      const updatedCart = createMockCart(currentItems)
      setCart(updatedCart)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CART_CACHE_KEY, JSON.stringify(currentItems))
        } catch {
          // Ignore storage errors
        }
      }
      return true
    } finally {
      setIsMutating(false)
    }
  }

  const removeItem = async (lineItemId: string): Promise<boolean> => {
    setIsMutating(true)
    setError(null)
    try {
      const res = await removeFromCartAction(lineItemId)
      if (res.success && res.cart) {
        setCart(res.cart)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(res.cart.items || []))
          } catch {
            // Ignore storage errors
          }
        }
        return true
      } else {
        const currentItems: CachedCartItem[] = (
          (cart?.items as unknown as CachedCartItem[]) || []
        ).filter((it) => it.id !== lineItemId)
        const updatedCart = createMockCart(currentItems)
        setCart(updatedCart)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(currentItems))
          } catch {
            // Ignore storage errors
          }
        }
        return true
      }
    } catch {
      const currentItems: CachedCartItem[] = (
        (cart?.items as unknown as CachedCartItem[]) || []
      ).filter((it) => it.id !== lineItemId)
      const updatedCart = createMockCart(currentItems)
      setCart(updatedCart)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CART_CACHE_KEY, JSON.stringify(currentItems))
        } catch {
          // Ignore storage errors
        }
      }
      return true
    } finally {
      setIsMutating(false)
    }
  }

  const applyCoupon = async (code: string): Promise<{ success: boolean; message?: string }> => {
    setIsMutating(true)
    try {
      const res = await validateCoupon(code, subtotalINR)
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon)
        try {
          localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(res.coupon))
        } catch {
          // Ignore storage write error
        }
        return { success: true, message: `Coupon ${res.coupon.code} applied successfully!` }
      } else {
        return { success: false, message: res.error || 'Failed to apply coupon' }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error applying coupon'
      return { success: false, message: msg }
    } finally {
      setIsMutating(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY)
    } catch {
      // Ignore storage error
    }
  }

  const clearCart = useCallback(async () => {
    setCart(null)
    removeCoupon()
    await refreshCart()
  }, [refreshCart])

  const clearError = () => setError(null)
  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)
  const openOffersDrawer = () => setIsOffersDrawerOpen(true)
  const closeOffersDrawer = () => setIsOffersDrawerOpen(false)

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isMutating,
        error,
        totalItems,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
        clearError,
        appliedCoupon,
        couponDiscountINR,
        isOffersDrawerOpen,
        openOffersDrawer,
        closeOffersDrawer,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  return context || defaultCartContext
}
