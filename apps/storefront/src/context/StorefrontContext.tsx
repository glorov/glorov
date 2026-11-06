'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import type { GlorovProductItem, ProductVariantItem } from '../types/storefront'
import type { CartItem, MilestoneOffer, ShippingOption } from '../types/cart'
import type { DeliveryAddress, PlacedOrderReceipt } from '../types/checkout'
import {
  CartProvider,
  useCart,
  CartContext,
  DEFAULT_SHIPPING_OPTIONS,
  FREE_SHIPPING_THRESHOLD,
  MILESTONE_COUPONS,
  type ToastType,
  type ToastMessage,
} from './CartContext'

export type { ToastType, ToastMessage }
export {
  DEFAULT_SHIPPING_OPTIONS,
  FREE_SHIPPING_THRESHOLD,
  MILESTONE_COUPONS,
  CartProvider,
  useCart,
  CartContext,
}

export interface StorefrontContextValue {
  // Cart State (backward compatibility delegating to CartContext)
  cartItems: CartItem[]
  cartCount: number
  cartSubtotal: number
  compareSubtotal: number
  overallDiscountPercent: number
  cartTotal: number
  discountAmount: number
  shippingAmount: number
  appliedCoupon: string | null
  applyCoupon: (code: string) => Promise<boolean> | boolean
  removeCoupon: () => Promise<void> | void
  moveToWishlist: (itemId: string) => void
  selectedShippingOption: ShippingOption
  setSelectedShippingOption: (option: ShippingOption) => void
  shippingAddress: DeliveryAddress | null
  setShippingAddress: (address: DeliveryAddress) => void
  latestOrder: PlacedOrderReceipt | null
  setLatestOrder: (order: PlacedOrderReceipt | null) => void
  addToCart: (
    product: GlorovProductItem,
    quantity?: number,
    variant?: ProductVariantItem,
    options?: { silent?: boolean; actionLabel?: string; onAction?: () => void }
  ) => Promise<void> | void
  removeFromCart: (itemId: string) => Promise<void> | void
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void> | void
  clearCart: () => Promise<void> | void

  // Dynamic backend offers state
  activeOffers: MilestoneOffer[]
  welcomeBannerOffer: MilestoneOffer | Record<string, unknown> | null
  refreshOffers: () => Promise<void>

  // Wishlist State (kept in localStorage)
  wishlistIds: string[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string, productTitle?: string) => boolean

  // Toast Feedback State
  toasts: ToastMessage[]
  activeToast: ToastMessage | null
  showToast: (
    type: ToastType,
    message: string,
    options?: {
      title?: string
      duration?: number
      actionLabel?: string
      onAction?: () => void
      action?: { label: string; onClick: () => void }
    }
  ) => void
  dismissToast: (id?: string) => void

  // Mobile Navigation State
  isMobileMenuOpen: boolean
  openMobileMenu: () => void
  closeMobileMenu: () => void
}

export const StorefrontContext = createContext<StorefrontContextValue | undefined>(undefined)

const STORAGE_KEYS = {
  LATEST_ORDER: 'glorov_latest_order',
  WISHLIST: 'glorov_wishlist_ids',
}

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial Non-Cart State
  const [shippingAddress, setShippingAddressState] = useState<DeliveryAddress | null>(null)
  const [latestOrder, setLatestOrderState] = useState<PlacedOrderReceipt | null>(null)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null)
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastToastRef = React.useRef<{ message: string; timestamp: number } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [, setIsHydrated] = useState(false)

  // Hydrate non-cart state safely on client mount
  useEffect(() => {
    try {
      // Actively purge legacy localStorage address to ensure Medusa address API migration (GLOROV-ADDR-001)
      localStorage.removeItem('glorov_delivery_address')

      const storedOrder = localStorage.getItem(STORAGE_KEYS.LATEST_ORDER)
      if (storedOrder) setLatestOrderState(JSON.parse(storedOrder))

      const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST)
      if (storedWishlist) setWishlistIds(JSON.parse(storedWishlist))

      // Sync with customer account metadata if authenticated (GLOROV-WISH-001)
      fetch('/api/customer/wishlist', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
            setWishlistIds((prev) => {
              const merged = Array.from(new Set([...prev, ...data.wishlist]))
              try {
                localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(merged))
              } catch {}
              return merged
            })
          }
        })
        .catch(() => {})
    } catch {
      // Ignore storage read errors
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const setShippingAddress = useCallback((address: DeliveryAddress) => {
    setShippingAddressState(address)
  }, [])

  const setLatestOrder = useCallback((order: PlacedOrderReceipt | null) => {
    setLatestOrderState(order)
    try {
      if (order) {
        localStorage.setItem(STORAGE_KEYS.LATEST_ORDER, JSON.stringify(order))
      } else {
        localStorage.removeItem(STORAGE_KEYS.LATEST_ORDER)
      }
    } catch {}
  }, [])

  // Toast Helpers (Singleton Botanical Toast Overlay 100% matched with Flutter GlorovFeedback)
  const dismissToast = useCallback((id?: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    setActiveToast((prev) => {
      if (!id || (prev && prev.id === id)) {
        return null
      }
      return prev
    })
  }, [])

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      options?: {
        title?: string
        duration?: number
        actionLabel?: string
        onAction?: () => void
        action?: { label: string; onClick: () => void }
      }
    ) => {
      // Deduplicate rapid double triggers (within 250ms with identical message)
      const now = Date.now()
      if (
        lastToastRef.current &&
        lastToastRef.current.message === message &&
        now - lastToastRef.current.timestamp < 250
      ) {
        return
      }
      lastToastRef.current = { message, timestamp: now }

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
        toastTimerRef.current = null
      }

      const id = `toast-${now}-${Math.random().toString(36).substring(2, 7)}`
      const defaultDuration =
        type === 'error'
          ? 3200
          : type === 'warning'
            ? 2800
            : 2600

      const duration = options?.duration ?? defaultDuration
      const actionLabel = options?.actionLabel ?? options?.action?.label
      const onAction = options?.onAction ?? options?.action?.onClick

      const newToast: ToastMessage = {
        id,
        type,
        message,
        title: options?.title,
        duration,
        actionLabel,
        onAction,
        action: actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined,
      }

      setActiveToast(newToast)

      if (duration > 0) {
        toastTimerRef.current = setTimeout(() => {
          dismissToast(id)
        }, duration)
      }
    },
    [dismissToast]
  )

  const toasts = useMemo(() => (activeToast ? [activeToast] : []), [activeToast])

  // Wishlist Handlers (Kept strictly client-side localStorage per task instructions)
  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    (productId: string, productTitle?: string) => {
      const willBeSaved = !wishlistIds.includes(productId)
      const next = willBeSaved
        ? [...wishlistIds, productId]
        : wishlistIds.filter((id) => id !== productId)

      setWishlistIds(next)
      try {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(next))
      } catch {}

      // Sync updated wishlist with customer metadata if authenticated (GLOROV-WISH-001)
      fetch('/api/customer/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ wishlist: next }),
      }).catch(() => {})

      if (willBeSaved) {
        showToast(
          'success',
          productTitle
            ? `Added ${productTitle} to your Wishlist!`
            : 'Added item to your Wishlist!',
          {
            actionLabel: 'VIEW',
            onAction: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/account/wishlist'
              }
            },
          }
        )
      } else {
        showToast('info', 'Removed from your Wishlist')
      }
      return willBeSaved
    },
    [wishlistIds, showToast]
  )

  // Mobile Menu Handlers
  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const baseValue = useMemo<StorefrontContextValue>(
    () => ({
      // Default / fallback cart properties (overridden when consumed via useStorefront)
      cartItems: [],
      cartCount: 0,
      cartSubtotal: 0,
      compareSubtotal: 0,
      overallDiscountPercent: 0,
      cartTotal: 0,
      discountAmount: 0,
      shippingAmount: 0,
      appliedCoupon: null,
      applyCoupon: () => false,
      removeCoupon: () => {},
      moveToWishlist: () => {},
      selectedShippingOption: DEFAULT_SHIPPING_OPTIONS[0],
      setSelectedShippingOption: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      updateCartQuantity: () => {},
      clearCart: () => {},
      activeOffers: MILESTONE_COUPONS,
      welcomeBannerOffer: null,
      refreshOffers: async () => {},

      // Non-cart values
      shippingAddress,
      setShippingAddress,
      latestOrder,
      setLatestOrder,
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      activeToast,
      toasts,
      showToast,
      dismissToast,
      isMobileMenuOpen,
      openMobileMenu,
      closeMobileMenu,
    }),
    [
      shippingAddress,
      setShippingAddress,
      latestOrder,
      setLatestOrder,
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      activeToast,
      toasts,
      showToast,
      dismissToast,
      isMobileMenuOpen,
      openMobileMenu,
      closeMobileMenu,
    ]
  )

  return (
    <StorefrontContext.Provider value={baseValue}>
      <CartProvider showToast={showToast} onMoveToWishlist={toggleWishlist}>
        {children}
      </CartProvider>
    </StorefrontContext.Provider>
  )
}

const DEFAULT_CONTEXT_FALLBACK: StorefrontContextValue = {
  cartItems: [],
  cartCount: 0,
  cartSubtotal: 0,
  compareSubtotal: 0,
  overallDiscountPercent: 0,
  cartTotal: 0,
  discountAmount: 0,
  shippingAmount: 0,
  appliedCoupon: null,
  selectedShippingOption: DEFAULT_SHIPPING_OPTIONS[0],
  shippingAddress: null,
  latestOrder: null,
  wishlistIds: [],
  toasts: [],
  activeToast: null,
  activeOffers: MILESTONE_COUPONS,
  welcomeBannerOffer: null,
  refreshOffers: async () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartQuantity: () => {},
  clearCart: () => {},
  applyCoupon: () => false,
  removeCoupon: () => {},
  moveToWishlist: () => {},
  setSelectedShippingOption: () => {},
  setShippingAddress: () => {},
  setLatestOrder: () => {},
  isInWishlist: () => false,
  toggleWishlist: () => false,
  showToast: () => '',
  dismissToast: () => {},
  isMobileMenuOpen: false,
  openMobileMenu: () => {},
  closeMobileMenu: () => {},
}

export function useStorefront(): StorefrontContextValue {
  const sfContext = useContext(StorefrontContext) || DEFAULT_CONTEXT_FALLBACK
  const cartContext = useCart()

  return useMemo(
    () => ({
      ...sfContext,
      cartItems: cartContext.cartItems,
      cartCount: cartContext.cartCount,
      cartSubtotal: cartContext.cartSubtotal,
      compareSubtotal: cartContext.compareSubtotal,
      overallDiscountPercent: cartContext.overallDiscountPercent,
      cartTotal: cartContext.cartTotal,
      discountAmount: cartContext.discountAmount,
      shippingAmount: cartContext.shippingAmount,
      appliedCoupon: cartContext.appliedCoupon,
      applyCoupon: cartContext.applyCoupon,
      removeCoupon: cartContext.removeCoupon,
      moveToWishlist: cartContext.moveToWishlist,
      selectedShippingOption: cartContext.selectedShippingOption,
      setSelectedShippingOption: cartContext.setSelectedShippingOption,
      addToCart: cartContext.addToCart,
      removeFromCart: cartContext.removeFromCart,
      updateCartQuantity: cartContext.updateCartQuantity,
      clearCart: cartContext.clearCart,
      activeOffers: cartContext.activeOffers,
      welcomeBannerOffer: cartContext.welcomeBannerOffer,
      refreshOffers: cartContext.refreshOffers,
    }),
    [sfContext, cartContext]
  )
}

export function useWishlist() {
  const { wishlistIds, isInWishlist, toggleWishlist } = useStorefront()
  return { wishlistIds, isInWishlist, toggleWishlist }
}

export function useToast() {
  const { toasts, activeToast, showToast, dismissToast } = useStorefront()
  return { toasts, activeToast, showToast, dismissToast }
}

export function useCheckout() {
  const {
    shippingAddress,
    setShippingAddress,
    selectedShippingOption,
    setSelectedShippingOption,
    latestOrder,
    setLatestOrder,
  } = useStorefront()

  return {
    shippingAddress,
    setShippingAddress,
    selectedShippingOption,
    setSelectedShippingOption,
    latestOrder,
    setLatestOrder,
  }
}
