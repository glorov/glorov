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

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
  actionLabel?: string
  onAction?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export const FREE_SHIPPING_THRESHOLD = 499

export const MILESTONE_COUPONS: MilestoneOffer[] = [
  {
    code: 'DIWALI10',
    title: '10% OFF',
    description: 'On orders above ₹999',
    minSpend: 999,
    discountPercent: 10,
    category: 'sitewide',
    applicableCategories: ['*'],
  },
  {
    code: 'DIWALI15',
    title: '15% OFF',
    description: 'On orders above ₹1,599',
    minSpend: 1599,
    discountPercent: 15,
    category: 'sitewide',
    applicableCategories: ['*'],
  },
  {
    code: 'DIWALI20',
    title: '20% OFF',
    description: 'On orders above ₹2,299',
    minSpend: 2299,
    discountPercent: 20,
    category: 'sitewide',
    applicableCategories: ['*'],
  },
  {
    code: 'HEIRLOOM20',
    title: '20% OFF Desi Seeds',
    description: '20% off on all heirloom seeds above ₹499',
    minSpend: 499,
    discountPercent: 20,
    category: 'seeds',
    applicableCategories: ['seeds'],
  },
]

export const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'so_standard',
    name: 'Standard Botanical Delivery',
    description: 'Delivered in 2-3 business days • Free on orders above ₹499',
    amount: 99,
    estimatedDays: '2 — 3 Days',
    isExpress: false,
  },
  {
    id: 'so_express',
    name: 'Express Climate-Controlled Delivery',
    description: 'Delivered in 1-2 business days with ventilated thermal packing',
    amount: 99,
    estimatedDays: '1 — 2 Days',
    isExpress: true,
  },
]

export interface StorefrontContextValue {
  // Cart State
  cartItems: CartItem[]
  cartCount: number
  cartSubtotal: number
  compareSubtotal: number
  overallDiscountPercent: number
  cartTotal: number
  discountAmount: number
  shippingAmount: number
  appliedCoupon: string | null
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
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
  ) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void

  // Dynamic backend offers state
  activeOffers: MilestoneOffer[]
  welcomeBannerOffer: any | null
  refreshOffers: () => Promise<void>

  // Wishlist State
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
  CART: 'glorov_cart_items',
  COUPON: 'glorov_applied_coupon',
  ADDRESS: 'glorov_delivery_address',
  LATEST_ORDER: 'glorov_latest_order',
  WISHLIST: 'glorov_wishlist_ids',
}

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial State from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption>(
    DEFAULT_SHIPPING_OPTIONS[0]
  )
  const [shippingAddress, setShippingAddressState] = useState<DeliveryAddress | null>(null)
  const [latestOrder, setLatestOrderState] = useState<PlacedOrderReceipt | null>(null)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null)
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastToastRef = React.useRef<{ message: string; timestamp: number } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [activeOffers, setActiveOffers] = useState<MilestoneOffer[]>(MILESTONE_COUPONS)
  const [welcomeBannerOffer, setWelcomeBannerOffer] = useState<any | null>(null)

  const refreshOffers = useCallback(async () => {
    try {
      const res = await fetch('/api/offers', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data && Array.isArray(data.offers) && data.offers.length > 0) {
        const mapped: MilestoneOffer[] = data.offers.map((o: any) => ({
          code: o.code,
          title: o.title,
          description: o.description,
          minSpend: o.min_spend ?? 0,
          discountPercent: o.discount_value ?? 0,
          category: o.category,
          applicableCategories: o.applicable_categories,
        }))
        setActiveOffers(mapped)
      }
      if (data && data.welcome_offer && data.welcome_offer.is_active && data.welcome_offer.is_highlighted) {
        setWelcomeBannerOffer(data.welcome_offer)
      } else {
        setWelcomeBannerOffer(null)
      }
    } catch {
      // Ignore network errors
    }
  }, [])

  useEffect(() => {
    refreshOffers()
  }, [refreshOffers])

  // Hydrate state from localStorage safely on client mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEYS.CART)
      if (storedCart) setCartItems(JSON.parse(storedCart))

      const storedCoupon = localStorage.getItem(STORAGE_KEYS.COUPON)
      if (storedCoupon) {
        try {
          const parsed = JSON.parse(storedCoupon)
          if (parsed && typeof parsed === 'object' && parsed.code) {
            setAppliedCoupon(String(parsed.code))
          } else if (typeof parsed === 'string') {
            setAppliedCoupon(parsed)
          } else {
            setAppliedCoupon(storedCoupon)
          }
        } catch {
          setAppliedCoupon(storedCoupon)
        }
      }

      const storedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS)
      if (storedAddress) setShippingAddressState(JSON.parse(storedAddress))

      const storedOrder = localStorage.getItem(STORAGE_KEYS.LATEST_ORDER)
      if (storedOrder) setLatestOrderState(JSON.parse(storedOrder))

      const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST)
      if (storedWishlist) setWishlistIds(JSON.parse(storedWishlist))
    } catch {
      // Ignore storage read errors
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Sync state back to localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems))
    } catch {}
  }, [cartItems, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
      if (appliedCoupon) {
        localStorage.setItem(STORAGE_KEYS.COUPON, appliedCoupon)
      } else {
        localStorage.removeItem(STORAGE_KEYS.COUPON)
      }
    } catch {}
  }, [appliedCoupon, isHydrated])

  const setShippingAddress = useCallback((address: DeliveryAddress) => {
    setShippingAddressState(address)
    try {
      localStorage.setItem(STORAGE_KEYS.ADDRESS, JSON.stringify(address))
    } catch {}
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
      // 1. Deduplicate rapid double triggers (within 250ms with identical message)
      const now = Date.now()
      if (
        lastToastRef.current &&
        lastToastRef.current.message === message &&
        now - lastToastRef.current.timestamp < 250
      ) {
        return
      }
      lastToastRef.current = { message, timestamp: now }

      // 2. Clear any running toast dismiss timer (Flutter singleton overlay model)
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
        toastTimerRef.current = null
      }

      const id = `toast-${now}-${Math.random().toString(36).substring(2, 7)}`
      // Durations matching Flutter GlorovFeedback exactly:
      // success: 2600ms, warning: 2800ms, error: 3200ms, info: 2600ms
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

      // Smoothly replace active toast
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

  // Cart Calculations
  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  )

  const compareSubtotal = useMemo(() => {
    const raw = cartItems.reduce(
      (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
      0
    )
    return raw > 0 ? raw : Math.round(cartSubtotal * 1.35)
  }, [cartItems, cartSubtotal])

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  )

  const activeOffer = useMemo(
    () => activeOffers.find((c) => c.code.toUpperCase() === appliedCoupon?.toUpperCase()),
    [activeOffers, appliedCoupon]
  )

  const discountAmount = useMemo(() => {
    if (!activeOffer) return 0
    const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

    // If offer is restricted to specific categories, only discount matching items
    if (activeOffer.applicableCategories && activeOffer.applicableCategories.length > 0) {
      const targets = activeOffer.applicableCategories.map(norm)
      const matchingItems = cartItems.filter((item) => {
        const cat = norm(item.category)
        const tit = norm(item.title)
        return targets.some((t) => cat.includes(t) || t.includes(cat) || tit.includes(t))
      })

      const eligibleSubtotal = matchingItems.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      )

      if (eligibleSubtotal < activeOffer.minSpend) return 0
      return Math.round((eligibleSubtotal * activeOffer.discountPercent) / 100)
    }

    if (cartSubtotal < activeOffer.minSpend) return 0
    return Math.round((cartSubtotal * activeOffer.discountPercent) / 100)
  }, [activeOffer, cartItems, cartSubtotal])

  const shippingAmount = useMemo(() => {
    if (cartItems.length === 0) return 0
    return cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99
  }, [cartItems.length, cartSubtotal])

  const cartTotal = useMemo(
    () => Math.max(0, cartSubtotal - discountAmount + shippingAmount),
    [cartSubtotal, discountAmount, shippingAmount]
  )

  const overallDiscountPercent = useMemo(() => {
    if (compareSubtotal <= 0 || compareSubtotal <= cartTotal) return 0
    return Math.round(((compareSubtotal - cartTotal) / compareSubtotal) * 100)
  }, [compareSubtotal, cartTotal])

  // Auto-validate coupon when cart items, subtotal, or active offers change
  useEffect(() => {
    if (!appliedCoupon) return
    const found = activeOffers.find(
      (c) => c.code.toUpperCase() === appliedCoupon.toUpperCase()
    )
    if (!found) {
      setAppliedCoupon(null)
      showToast(
        'warning',
        `Coupon "${appliedCoupon}" is no longer active or valid on storefront.`
      )
      return
    }

    const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

    if (found.applicableCategories && found.applicableCategories.length > 0 && !found.applicableCategories.includes('*')) {
      const targets = found.applicableCategories.map(norm)
      const matchingItems = cartItems.filter((item) => {
        const cat = norm(item.category)
        const tit = norm(item.title)
        return targets.some((t) => cat.includes(t) || t.includes(cat) || tit.includes(t))
      })

      if (matchingItems.length === 0) {
        setAppliedCoupon(null)
        showToast(
          'warning',
          `Coupon "${found.code}" removed: No eligible ${found.applicableCategories.join('/')} items in your bag.`
        )
        return
      }

      const eligibleSubtotal = matchingItems.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      )
      if (eligibleSubtotal < found.minSpend) {
        setAppliedCoupon(null)
        showToast(
          'warning',
          `Coupon "${found.code}" removed: Minimum order of ₹${found.minSpend} required on ${found.applicableCategories.join('/')}.`
        )
        return
      }
    } else {
      if (cartSubtotal < found.minSpend) {
        setAppliedCoupon(null)
        showToast(
          'warning',
          `Coupon "${found.code}" removed: Minimum order of ₹${found.minSpend.toLocaleString('en-IN')} required.`
        )
      }
    }
  }, [activeOffers, cartItems, cartSubtotal, appliedCoupon, showToast])

  // Cart Handlers
  const addToCart = useCallback(
    (
      product: GlorovProductItem,
      quantity = 1,
      variant?: ProductVariantItem,
      options?: { silent?: boolean; actionLabel?: string; onAction?: () => void }
    ) => {
      const targetVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined)
      const effectivePrice = targetVariant ? targetVariant.discountPrice ?? targetVariant.price : product.discountPrice ?? product.price
      const originalPrice = targetVariant ? (targetVariant.discountPrice ? targetVariant.price : undefined) : (product.discountPrice ? product.price : undefined)
      const itemKey = targetVariant ? `${product.id}_${targetVariant.id}` : product.id

      // Anti-Hacker input sanitizer
      const cleanQuantity = Math.max(1, Math.min(50, Math.floor(quantity)))

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === itemKey)
        if (existingIndex > -1) {
          const updated = [...prev]
          const existing = updated[existingIndex]
          if (existing) {
            updated[existingIndex] = {
              ...existing,
              quantity: Math.min(50, existing.quantity + cleanQuantity),
            }
          }
          return updated
        }

        const newItem: CartItem = {
          id: itemKey,
          productId: product.id,
          variantId: targetVariant?.id,
          variantName: targetVariant?.name,
          title: product.title,
          category: product.category,
          price: effectivePrice,
          originalPrice,
          quantity: cleanQuantity,
          image: product.primaryImage,
          inStock: targetVariant?.inStock ?? product.inStock,
        }
        return [...prev, newItem]
      })

      if (!options?.silent) {
        showToast(
          'success',
          `Added ${cleanQuantity} x ${product.title} to your bag!`,
          {
            actionLabel: options?.actionLabel ?? 'VIEW BAG',
            onAction: options?.onAction ?? (() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/cart'
              }
            }),
          }
        )
      }
    },
    [showToast]
  )

  const removeFromCart = useCallback(
    (itemId: string) => {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId))
      showToast('info', 'Item removed from your cart')
    },
    [showToast]
  )

  const updateCartQuantity = useCallback(
    (itemId: string, quantity: number) => {
      // Anti-Hacker: disallow negative, zero, float, or excessive quantities
      const sanitizedQty = Math.floor(quantity)
      if (sanitizedQty <= 0) {
        removeFromCart(itemId)
        return
      }
      const boundedQty = Math.min(50, sanitizedQty)
      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: boundedQty } : item))
      )
    },
    [removeFromCart]
  )

  const clearCart = useCallback(() => {
    setCartItems([])
    setAppliedCoupon(null)
  }, [])

  const applyCoupon = useCallback(
    (code: string): boolean => {
      const cleanCode = code.trim().toUpperCase()
      const found = activeOffers.find((c) => c.code === cleanCode)
      if (!found) {
        showToast('error', `Coupon "${cleanCode}" is invalid, inactive, or expired.`, { title: 'Invalid Voucher' })
        return false
      }

      const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

      // Category-Aware Verification
      if (found.applicableCategories && found.applicableCategories.length > 0 && !found.applicableCategories.includes('*')) {
        const targets = found.applicableCategories.map(norm)
        const matchingItems = cartItems.filter((item) => {
          const cat = norm(item.category)
          const tit = norm(item.title)
          return targets.some((t) => cat.includes(t) || t.includes(cat) || tit.includes(t))
        })

        if (matchingItems.length === 0) {
          const catLabel = found.applicableCategories
            .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
            .join(' or ')
          showToast(
            'warning',
            `Coupon "${cleanCode}" is only valid for ${catLabel}. Your bag does not contain any eligible items.`,
            { title: 'Category Restricted Offer' }
          )
          return false
        }

        const eligibleSubtotal = matchingItems.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        )

        if (eligibleSubtotal < found.minSpend) {
          const needed = found.minSpend - eligibleSubtotal
          showToast(
            'warning',
            `Add ₹${needed.toLocaleString('en-IN')} more worth of ${found.applicableCategories.join('/')} to unlock coupon "${cleanCode}".`,
            { title: 'Category Minimum Spend' }
          )
          return false
        }
      } else {
        if (cartSubtotal < found.minSpend) {
          showToast(
            'warning',
            `Add items worth ₹${(found.minSpend - cartSubtotal).toLocaleString('en-IN')} more to unlock coupon "${cleanCode}".`,
            { title: 'Milestone Goal Spend Required' }
          )
          return false
        }
      }

      setAppliedCoupon(cleanCode)
      showToast(
        'success',
        `Coupon "${cleanCode}" applied! You saved ${found.discountPercent}%${
          found.category ? ` on ${found.category}` : ''
        }.`,
        { title: 'Coupon Applied' }
      )
      return true
    },
    [activeOffers, cartItems, cartSubtotal, showToast]
  )

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
    showToast('info', 'Coupon voucher removed')
  }, [showToast])

  const moveToWishlist = useCallback(
    (itemId: string) => {
      const item = cartItems.find((i) => i.id === itemId)
      if (!item) return
      setCartItems((prev) => prev.filter((i) => i.id !== itemId))
      setWishlistIds((prev) => (prev.includes(item.productId) ? prev : [...prev, item.productId]))
      showToast('success', `Moved "${item.title}" to wishlist`, { title: 'Wishlist' })
    },
    [cartItems, showToast]
  )

  // Wishlist Handlers
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

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      compareSubtotal,
      overallDiscountPercent,
      cartTotal,
      discountAmount,
      shippingAmount,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      moveToWishlist,
      selectedShippingOption,
      setSelectedShippingOption,
      shippingAddress,
      setShippingAddress,
      latestOrder,
      setLatestOrder,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
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
      activeOffers,
      welcomeBannerOffer,
      refreshOffers,
    }),
    [
      cartItems,
      cartCount,
      cartSubtotal,
      compareSubtotal,
      overallDiscountPercent,
      cartTotal,
      discountAmount,
      shippingAmount,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      moveToWishlist,
      selectedShippingOption,
      shippingAddress,
      setShippingAddress,
      latestOrder,
      setLatestOrder,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
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
      activeOffers,
      welcomeBannerOffer,
      refreshOffers,
    ]
  )

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>
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
  const context = useContext(StorefrontContext)
  return context || DEFAULT_CONTEXT_FALLBACK
}

export function useCart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    compareSubtotal,
    overallDiscountPercent,
    cartTotal,
    discountAmount,
    shippingAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    moveToWishlist,
    selectedShippingOption,
    setSelectedShippingOption,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    showToast,
    activeOffers,
    welcomeBannerOffer,
    refreshOffers,
  } = useStorefront()

  return {
    cartItems,
    cartCount,
    cartSubtotal,
    compareSubtotal,
    overallDiscountPercent,
    cartTotal,
    discountAmount,
    shippingAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    moveToWishlist,
    selectedShippingOption,
    setSelectedShippingOption,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    showToast,
    activeOffers,
    welcomeBannerOffer,
    refreshOffers,
  }
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
