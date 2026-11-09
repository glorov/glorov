'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import type { CartItem, MilestoneOffer, ShippingOption, MedusaCart } from '../types/cart'
import type { GlorovProductItem, ProductVariantItem } from '../types/storefront'
import {
  getCartIdCookie,
  setCartIdCookie,
  clearCartIdCookie,
  createMedusaCart,
  getMedusaCart,
  addMedusaLineItem,
  updateMedusaLineItem,
  deleteMedusaLineItem,
  transferMedusaCartCustomer,
  updateMedusaCart,
  applyMedusaPromotion,
  removeMedusaPromotion,
  transformMedusaCart,
} from '../lib/api/cart'
import { CustomerAuthContext } from './CustomerAuthContext'

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
  {
    code: 'SEEDS20',
    title: '20% OFF Seeds',
    description: '20% off on vegetable & flower seeds above ₹599',
    minSpend: 599,
    discountPercent: 20,
    category: 'seeds',
    applicableCategories: ['seeds'],
  },
  {
    code: 'GLOROV10',
    title: '10% OFF Welcome',
    description: '10% off on orders above ₹499',
    minSpend: 499,
    discountPercent: 10,
    category: 'sitewide',
    applicableCategories: ['*'],
  },
]

export const getKnownCouponMinSpend = (code: string): number => {
  const clean = code.trim().toUpperCase()
  switch (clean) {
    case 'DIWALI20':
      return 2299
    case 'DIWALI15':
      return 1599
    case 'DIWALI10':
      return 999
    case 'SEEDS20':
      return 599
    case 'HEIRLOOM20':
    case 'GLOROV10':
      return 499
    default:
      return 0
  }
}

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

export interface CartContextValue {
  // Medusa Raw & State
  cart: MedusaCart | null
  cartId: string | null
  cartItems: CartItem[]
  cartCount: number
  cartSubtotal: number
  compareSubtotal: number
  overallDiscountPercent: number
  cartTotal: number
  discountAmount: number
  shippingAmount: number
  appliedCoupon: string | null
  isLoading: boolean
  isHydrated: boolean

  // Shipping
  selectedShippingOption: ShippingOption
  setSelectedShippingOption: (option: ShippingOption) => void

  // Cart operations
  addToCart: (
    product: GlorovProductItem,
    quantity?: number,
    variant?: ProductVariantItem,
    options?: { silent?: boolean; actionLabel?: string; onAction?: () => void }
  ) => Promise<void> | void
  removeFromCart: (itemId: string) => Promise<void> | void
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void> | void
  clearCart: () => Promise<void> | void
  applyCoupon: (code: string) => Promise<boolean> | boolean
  removeCoupon: () => Promise<void> | void
  moveToWishlist: (itemId: string) => void
  refreshCart: () => Promise<void>
  flushPendingCartUpdates?: () => Promise<void>

  // Dynamic offers
  activeOffers: MilestoneOffer[]
  welcomeBannerOffer: MilestoneOffer | Record<string, unknown> | null
  refreshOffers: () => Promise<void>
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
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEYS = {
  CART_ITEMS: 'glorov_cart_items',
  APPLIED_COUPON: 'glorov_applied_coupon',
  CART_ID: 'glorov_cart_id',
}

export interface CartProviderProps {
  children: React.ReactNode
  showToast?: (
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
  onMoveToWishlist?: (productId: string, title?: string) => void
}

export function CartProvider({
  children,
  showToast: externalShowToast,
  onMoveToWishlist,
}: CartProviderProps) {
  // Auth context integration (safe lookup without throwing outside provider)
  const authContext = useContext(CustomerAuthContext)
  const customerToken = authContext?.token ?? null
  const customerUser = authContext?.customer ?? null
  const isAuthenticated = authContext?.isAuthenticated ?? false

  // Fallback toast function if not provided by parent StorefrontProvider
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
      if (externalShowToast) {
        externalShowToast(type, message, options)
      }
    },
    [externalShowToast]
  )

  // State
  const [cart, setCart] = useState<MedusaCart | null>(null)
  const [cartId, setCartId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption>(
    DEFAULT_SHIPPING_OPTIONS[0]
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // Immediate synchronous client hydration from localStorage
  useEffect(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.CART_ITEMS)
      if (local) {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed)
        }
      }
      const localCoupon = localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON)
      if (localCoupon) {
        setAppliedCoupon(localCoupon)
      }
    } catch {}
    setIsHydrated(true)
  }, [])

  // Dynamic offers state
  const [activeOffers, setActiveOffers] = useState<MilestoneOffer[]>(MILESTONE_COUPONS)
  const [welcomeBannerOffer, setWelcomeBannerOffer] = useState<MilestoneOffer | Record<string, unknown> | null>(null)

  // Guard against duplicate customer transfer calls
  const transferredCustomerIdRef = useRef<string | null>(null)

  // Guard against duplicate cart creations in flight
  const cartCreationPromiseRef = useRef<Promise<string | null> | null>(null)

  // Sequential FIFO queue for background cart mutations to eliminate Medusa concurrency lock 500s
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve())

  // Debounce timers for per-item quantity mutations to prevent network stampedes
  const updateDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  // Track latest requested optimistic quantity per item id to prevent stale server responses from rolling back UI
  const pendingItemQuantitiesRef = useRef<Map<string, number>>(new Map())

  // Cleanup pending debounce timers on unmount
  useEffect(() => {
    const timers = updateDebounceTimersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  // 1. Fetch Dynamic Promotional Offers from backend
  const refreshOffers = useCallback(async () => {
    try {
      const res = await fetch('/api/offers', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data && Array.isArray(data.offers) && data.offers.length > 0) {
        const mapped: MilestoneOffer[] = data.offers.map((o: {
          code: string
          title: string
          description?: string
          min_spend?: number
          discount_value?: number
          category?: string
          applicable_categories?: string[]
        }) => ({
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
      if (
        data &&
        data.welcome_offer &&
        data.welcome_offer.is_active &&
        data.welcome_offer.is_highlighted
      ) {
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

  // Persist cart items to localStorage whenever cartItems updates post-hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cartItems))
    } catch {}
  }, [cartItems, isHydrated])

  // 2. Helper to sync raw Medusa cart response into React state without ever dropping local items
  const syncServerCart = useCallback((serverCart: MedusaCart) => {
    setCart(serverCart)
    setCartId(serverCart.id)
    setCartIdCookie(serverCart.id)

    const transformed = transformMedusaCart(serverCart)
    if (transformed.cartItems.length > 0) {
      setCartItems((prevItems) => {
        // Collect server line item identifiers
        const serverKeys = new Set(transformed.cartItems.map((item) => item.id))
        const serverProductIds = new Set(
          transformed.cartItems.map((item) => item.productId).filter(Boolean)
        )

        // Reconcile server line items with pending optimistic state
        const reconciledServerItems = transformed.cartItems.map((serverItem) => {
          const pendingQty = pendingItemQuantitiesRef.current.get(serverItem.id)
          if (pendingQty !== undefined) {
            return { ...serverItem, quantity: pendingQty }
          }
          const localItem = prevItems.find((p) => p.id === serverItem.id || (p.productId && p.productId === serverItem.productId))
          if (
            localItem &&
            localItem.quantity !== serverItem.quantity &&
            pendingItemQuantitiesRef.current.has(serverItem.id)
          ) {
            return { ...serverItem, quantity: localItem.quantity }
          }
          return serverItem
        })

        // CRITICAL: Retain optimistic local items that have not yet been synced to the server!
        const unSyncedLocalItems = prevItems.filter(
          (localItem) =>
            !serverKeys.has(localItem.id) &&
            (!localItem.productId || !serverProductIds.has(localItem.productId))
        )

        const merged = [...reconciledServerItems, ...unSyncedLocalItems]
        try {
          localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(merged))
        } catch {}
        return merged
      })
    }

    if (transformed.appliedCoupon) {
      setAppliedCoupon(transformed.appliedCoupon)
    }
  }, [])

  // 3. Eagerly create or restore Medusa Cart on mount (Requirements 3.a & 3.b)
  useEffect(() => {
    let isCancelled = false

    async function initializeCart() {
      try {
        // Step a: Check if cart_id exists in cookie or localStorage
        const existingCartId = getCartIdCookie()

        if (existingCartId) {
          // Return visit: GET /store/carts/:id to restore cart
          const res = await getMedusaCart(existingCartId, customerToken || undefined)
          if (!isCancelled) {
            if (res.success && res.data?.cart && !res.data.cart.completed_at) {
              syncServerCart(res.data.cart)
              setIsHydrated(true)
              return
            }
            // If cart is missing, completed, or invalid, clear cookie and create fresh cart
            clearCartIdCookie()
          }
        }

        // First visit or invalid cart: POST /store/carts to create a new cart
        const createRes = await createMedusaCart(customerToken || undefined)
        if (!isCancelled) {
          if (createRes.success && createRes.data?.cart) {
            setCart(createRes.data.cart)
            setCartId(createRes.data.cart.id)
            setCartIdCookie(createRes.data.cart.id)

            const transformed = transformMedusaCart(createRes.data.cart)
            if (transformed.cartItems.length > 0) {
              setCartItems(transformed.cartItems)
            } else {
              // Restore local items if available and cart is currently empty
              setCartItems((current) => {
                if (current.length > 0) return current
                try {
                  const localItems = localStorage.getItem(STORAGE_KEYS.CART_ITEMS)
                  if (localItems) {
                    const parsed = JSON.parse(localItems)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return parsed
                    }
                  }
                } catch {}
                return current
              })
            }
          } else {
            // Offline fallback: load local items if available
            setCartItems((current) => {
              if (current.length > 0) return current
              try {
                const localItems = localStorage.getItem(STORAGE_KEYS.CART_ITEMS)
                if (localItems) {
                  const parsed = JSON.parse(localItems)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed
                  }
                }
              } catch {}
              return current
            })
            try {
              const localCoupon = localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON)
              if (localCoupon) {
                setAppliedCoupon(localCoupon)
              }
            } catch {}
          }
        }
      } catch {
        // Fallback for disconnected / offline test environments
        setCartItems((current) => {
          if (current.length > 0) return current
          try {
            const localItems = localStorage.getItem(STORAGE_KEYS.CART_ITEMS)
            if (localItems) {
              return JSON.parse(localItems)
            }
          } catch {}
          return current
        })
      } finally {
        if (!isCancelled) {
          setIsHydrated(true)
        }
      }
    }

    initializeCart()

    return () => {
      isCancelled = true
    }
  }, [customerToken, syncServerCart])

  // 4. Ensure we have a valid cart_id before calling cart mutations (deduplicated against parallel calls)
  const getOrCreateCartId = useCallback(
    async (forceNew = false): Promise<string | null> => {
      if (!forceNew && cartId) return cartId

      const existingCartId = !forceNew ? getCartIdCookie() : null
      if (existingCartId) {
        setCartId(existingCartId)
        return existingCartId
      }

      // Reuse in-flight promise to prevent concurrent duplicate cart creations
      if (cartCreationPromiseRef.current) {
        return cartCreationPromiseRef.current
      }

      cartCreationPromiseRef.current = (async () => {
        try {
          const res = await createMedusaCart(customerToken || undefined)
          if (res.success && res.data?.cart) {
            setCart(res.data.cart)
            setCartId(res.data.cart.id)
            setCartIdCookie(res.data.cart.id)
            return res.data.cart.id
          }
        } catch {} finally {
          cartCreationPromiseRef.current = null
        }
        return null
      })()

      return cartCreationPromiseRef.current
    },
    [cartId, customerToken]
  )

  // 5. Transfer / Merge guest cart with customer cart after login (Requirement 3.g)
  useEffect(() => {
    if (!isAuthenticated || !customerUser || !customerToken || !cartId) return

    // Prevent duplicate transfer runs for same customer
    if (transferredCustomerIdRef.current === customerUser.id) return
    transferredCustomerIdRef.current = customerUser.id

    async function mergeCustomerCart() {
      try {
        // Call Medusa v2 POST /store/carts/:id/customer
        const transferRes = await transferMedusaCartCustomer(cartId!, customerToken!)
        if (transferRes.success && transferRes.data?.cart) {
          syncServerCart(transferRes.data.cart)
        } else {
          // Also associate email on cart
          if (customerUser?.email) {
            await updateMedusaCart(cartId!, { email: customerUser.email }, customerToken!)
          }
        }
      } catch {
        // Ignore network errors
      }
    }

    mergeCustomerCart()
  }, [isAuthenticated, customerUser, customerToken, cartId, syncServerCart])

  // 6. Calculations from cart items (immediate 0ms optimistic) & server metadata
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cartItems])

  const compareSubtotal = useMemo(() => {
    const raw = cartItems.reduce(
      (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
      0
    )
    return raw > 0 ? raw : cartSubtotal
  }, [cartItems, cartSubtotal])

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  )

  const activeOffer = useMemo(() => {
    if (!appliedCoupon) return undefined
    const clean = appliedCoupon.toUpperCase().trim()
    return (
      activeOffers.find((c) => c.code.toUpperCase() === clean) ||
      MILESTONE_COUPONS.find((c) => c.code.toUpperCase() === clean)
    )
  }, [activeOffers, appliedCoupon])

  const discountAmount = useMemo(() => {
    if (!activeOffer) {
      if (cart && typeof cart.discount_total === 'number' && cart.discount_total > 0) {
        return cart.discount_total > 500
          ? Math.round(cart.discount_total / 100)
          : cart.discount_total
      }
      return 0
    }

    const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

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
  }, [cart, activeOffer, cartItems, cartSubtotal])

  const shippingAmount = useMemo(() => {
    if (cartItems.length === 0) return 0
    return cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99
  }, [cartItems.length, cartSubtotal])

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + shippingAmount)
  }, [cartSubtotal, discountAmount, shippingAmount])

  const overallDiscountPercent = useMemo(() => {
    if (compareSubtotal <= 0 || compareSubtotal <= cartSubtotal) return 0
    return Math.round(((compareSubtotal - cartSubtotal) / compareSubtotal) * 100)
  }, [compareSubtotal, cartSubtotal])

  // 6b. Automatically revoke applied coupon if cart subtotal drops below required minimum spend
  useEffect(() => {
    if (!appliedCoupon) return
    if (cartItems.length === 0) {
      setAppliedCoupon(null)
      try {
        localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON)
      } catch {}
      return
    }
    const minSpend = activeOffer?.minSpend || getKnownCouponMinSpend(appliedCoupon)
    const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    let isEligible = true

    if (
      activeOffer?.applicableCategories &&
      activeOffer.applicableCategories.length > 0 &&
      !activeOffer.applicableCategories.includes('*')
    ) {
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
      if (matchingItems.length === 0 || eligibleSubtotal < minSpend) {
        isEligible = false
      }
    } else {
      if (cartSubtotal < minSpend) {
        isEligible = false
      }
    }

    if (!isEligible) {
      const revokedCode = appliedCoupon
      setAppliedCoupon(null)
      try {
        localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON)
      } catch {}

      if (cartId) {
        removeMedusaPromotion(cartId, revokedCode, customerToken || undefined).catch(() => {})
      }

      showToast(
        'info',
        `Coupon ${revokedCode} removed: Minimum order of ₹${minSpend.toLocaleString('en-IN')} required.`
      )
    }
  }, [cartSubtotal, cartItems, appliedCoupon, activeOffer, cartId, customerToken, showToast])

  // 7. addToCart handler (Requirement 3.c)
  const addToCart = useCallback(
    async (
      product: GlorovProductItem,
      quantity = 1,
      variant?: ProductVariantItem,
      options?: { silent?: boolean; actionLabel?: string; onAction?: () => void }
    ) => {
      const cleanQuantity = Math.max(1, Math.min(50, Math.floor(quantity)))
      const targetVariant =
        variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined)

      const effectivePrice = targetVariant
        ? targetVariant.discountPrice ?? targetVariant.price
        : product.discountPrice ?? product.price
      const originalPrice = targetVariant
        ? targetVariant.discountPrice
          ? targetVariant.price
          : undefined
        : product.discountPrice
        ? product.price
        : undefined

      const localItemKey = targetVariant
        ? `${product.id}_${targetVariant.id}`
        : product.id

      // Step 1: Optimistic local state update (ensures instant UI feedback & sync test compatibility)
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.id === localItemKey || item.productId === product.id
        )
        let updated: CartItem[]
        if (existingIndex > -1) {
          updated = [...prev]
          const existing = updated[existingIndex]
          if (existing) {
            updated[existingIndex] = {
              ...existing,
              quantity: Math.min(50, existing.quantity + cleanQuantity),
            }
          }
        } else {
          const newItem: CartItem = {
            id: localItemKey,
            productId: product.id,
            variantId: targetVariant?.id,
            variantName: targetVariant?.name,
            title: product.title,
            category: product.category,
            price: effectivePrice,
            originalPrice,
            quantity: cleanQuantity,
            image: product.primaryImage || '/og-image.jpg',
            inStock: targetVariant?.inStock ?? product.inStock,
          }
          updated = [...prev, newItem]
        }
        try {
          localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(updated))
        } catch {}
        return updated
      })

      // Toast feedback
      if (!options?.silent) {
        showToast('success', `Added ${cleanQuantity} x ${product.title} to your bag!`, {
          actionLabel: options?.actionLabel ?? 'VIEW BAG',
          onAction:
            options?.onAction ??
            (() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/cart'
              }
            }),
        })
      }

      // Step 2: Background / Async Medusa v2 Cart API call chained sequentially on syncQueue
      syncQueueRef.current = syncQueueRef.current
        .then(async () => {
          try {
            const currentCartId = await getOrCreateCartId()

            // Resolve Medusa Variant ID
            let resolvedVariantId = targetVariant?.id

            if (!resolvedVariantId && (product.slug || product.id)) {
              if (Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id) {
                resolvedVariantId = product.variants[0].id
              } else {
                try {
                  const res = await fetch(`/api/products?handle=${encodeURIComponent(product.slug || product.id)}&limit=1`)
                  if (res.ok) {
                    const data = await res.json()
                    const found = Array.isArray(data.products) ? data.products[0] : (data.product || data)
                    if (found?.variants && found.variants.length > 0) {
                      resolvedVariantId = found.variants[0].id
                    }
                  }
                } catch {}
              }
            }

            if (currentCartId && resolvedVariantId) {
              const res = await addMedusaLineItem(
                currentCartId,
                resolvedVariantId,
                cleanQuantity,
                customerToken || undefined
              )

              if (res.success && res.data?.cart) {
                syncServerCart(res.data.cart)
              }
            }
          } catch {
            // Optimistic state remains in place safely if background API fails
          }
        })
        .catch(() => {})
    },
    [customerToken, getOrCreateCartId, showToast, syncServerCart]
  )

  // 8. removeFromCart handler (Requirement 3.e)
  const removeFromCart = useCallback(
    async (itemId: string) => {
      // Clear any pending debounce timer for this item
      const existingTimer = updateDebounceTimersRef.current.get(itemId)
      if (existingTimer) {
        clearTimeout(existingTimer)
        updateDebounceTimersRef.current.delete(itemId)
      }
      pendingItemQuantitiesRef.current.delete(itemId)

      // Step 1: Instant optimistic state update
      setCartItems((prev) => {
        const updated = prev.filter((item) => item.id !== itemId)
        try {
          localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(updated))
        } catch {}
        return updated
      })
      showToast('info', 'Item removed from your cart')

      // Step 2: Background call Medusa v2 API chained sequentially
      if (cartId) {
        syncQueueRef.current = syncQueueRef.current
          .then(async () => {
            try {
              const res = await deleteMedusaLineItem(
                cartId,
                itemId,
                customerToken || undefined
              )
              if (res.success) {
                const data = res.data as { parent?: MedusaCart; cart?: MedusaCart } | null
                if (data?.parent) {
                  syncServerCart(data.parent)
                } else if (data?.cart) {
                  syncServerCart(data.cart)
                } else {
                  // Refresh cart from server
                  const refreshed = await getMedusaCart(cartId, customerToken || undefined)
                  if (refreshed.success && refreshed.data?.cart) {
                    syncServerCart(refreshed.data.cart)
                  }
                }
              }
            } catch {
              // Keep optimistic state
            }
          })
          .catch(() => {})
      }
    },
    [cartId, customerToken, showToast, syncServerCart]
  )

  // 9. updateCartQuantity handler (Optimistic 0ms update + 300ms debounced backend sync)
  const updateCartQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const sanitizedQty = Math.floor(quantity)
      if (sanitizedQty <= 0) {
        void removeFromCart(itemId)
        return
      }
      const boundedQty = Math.min(50, sanitizedQty)

      // Record latest requested quantity for this item
      pendingItemQuantitiesRef.current.set(itemId, boundedQty)

      // Step 1: Instant synchronous optimistic state update (0ms perceived latency)
      setCartItems((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId ? { ...item, quantity: boundedQty } : item
        )
        try {
          localStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(updated))
        } catch {}
        return updated
      })

      // Step 2: Clear any pending debounce timer for this line item
      const existingTimer = updateDebounceTimersRef.current.get(itemId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      if (!cartId) return

      // Step 3: Debounce backend sync by 300ms so rapid clicks don't flood the server
      const timer = setTimeout(() => {
        updateDebounceTimersRef.current.delete(itemId)
        const targetQty = pendingItemQuantitiesRef.current.get(itemId) ?? boundedQty

        syncQueueRef.current = syncQueueRef.current
          .then(async () => {
            try {
              const res = await updateMedusaLineItem(
                cartId,
                itemId,
                targetQty,
                customerToken || undefined
              )
              if (res.success && res.data?.cart) {
                const currentPending = pendingItemQuantitiesRef.current.get(itemId)
                if (currentPending === undefined || currentPending === targetQty) {
                  pendingItemQuantitiesRef.current.delete(itemId)
                  syncServerCart(res.data.cart)
                }
              }
            } catch {
              // Keep optimistic state intact on error
            }
          })
          .catch(() => {})
      }, 300)

      updateDebounceTimersRef.current.set(itemId, timer)
    },
    [cartId, customerToken, removeFromCart, syncServerCart]
  )

  // Helper to flush all pending debounced updates before critical operations like checkout
  const flushPendingCartUpdates = useCallback(async () => {
    if (updateDebounceTimersRef.current.size === 0) return
    const promises: Promise<unknown>[] = []
    updateDebounceTimersRef.current.forEach((timer, itemId) => {
      clearTimeout(timer)
      const targetQty = pendingItemQuantitiesRef.current.get(itemId)
      if (cartId && targetQty !== undefined) {
        promises.push(
          updateMedusaLineItem(cartId, itemId, targetQty, customerToken || undefined)
            .then((res) => {
              if (res.success && res.data?.cart) {
                syncServerCart(res.data.cart)
              }
            })
            .catch(() => {})
        )
      }
    })
    updateDebounceTimersRef.current.clear()
    await Promise.all(promises)
  }, [cartId, customerToken, syncServerCart])

  // 10. clearCart handler
  const clearCart = useCallback(async () => {
    setCartItems([])
    setCart(null)
    setAppliedCoupon(null)
    clearCartIdCookie()

    try {
      localStorage.removeItem(STORAGE_KEYS.CART_ITEMS)
      localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON)
    } catch {}

    // Create a fresh cart for subsequent operations
    await getOrCreateCartId(true)
  }, [getOrCreateCartId])

  // 11. applyCoupon handler: Validates with Medusa backend (POST /store/offers/validate)
  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      const cleanCode = code.trim().toUpperCase()

      // Primary: Server-side validation via Medusa Offers API
      try {
        const valRes = await fetch('/api/offers/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: cleanCode,
            cart_subtotal: cartSubtotal,
            cart_id: cartId || undefined,
            items: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              category: item.category,
              price: item.price,
              quantity: item.quantity,
            })),
          }),
        })

        if (valRes.ok) {
          const valData = await valRes.json()
          if (!valData.valid) {
            showToast('error', valData.error || `Coupon "${cleanCode}" is invalid.`, {
              title: 'Coupon Error',
            })
            return false
          }

          // Register returned offer into activeOffers state
          if (valData.offer) {
            const bo = valData.offer
            const mappedOffer: MilestoneOffer = {
              code: bo.code,
              title: bo.title,
              description: bo.description,
              minSpend: bo.min_spend ?? 0,
              discountPercent: bo.discount_value ?? valData.discount_percent ?? 0,
              category: bo.category,
              applicableCategories: bo.applicable_categories,
            }
            setActiveOffers((prev) => {
              if (prev.some((p) => p.code === mappedOffer.code)) {
                return prev.map((p) => (p.code === mappedOffer.code ? mappedOffer : p))
              }
              return [...prev, mappedOffer]
            })
          }

          setAppliedCoupon(cleanCode)

          if (cartId) {
            try {
              const promoRes = await applyMedusaPromotion(
                cartId,
                cleanCode,
                customerToken || undefined
              )
              if (promoRes.success && promoRes.data?.cart) {
                syncServerCart(promoRes.data.cart)
              }
            } catch {
              // Local state maintained
            }
          }

          showToast(
            'success',
            `Coupon "${cleanCode}" applied! ${
              valData.discount_percent
                ? `You saved ${valData.discount_percent}%.`
                : valData.discount_amount
                ? `You saved ₹${valData.discount_amount}.`
                : ''
            }`,
            { title: 'Coupon Applied' }
          )
          return true
        } else if (valRes.status === 400) {
          const valData = await valRes.json().catch(() => ({}))
          showToast('error', valData.error || `Coupon "${cleanCode}" is invalid or ineligible.`, {
            title: 'Coupon Ineligible',
          })
          return false
        }
      } catch {
        // Fall back to client-side validation below if network fails
      }

      // Secondary: In-memory fallback validation for offline/demo operation
      const found = activeOffers.find((c) => c.code === cleanCode)

      if (!found) {
        showToast('error', `Coupon "${cleanCode}" is invalid, inactive, or expired.`, {
          title: 'Invalid Voucher',
        })
        return false
      }

      const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

      // Validate category restrictions
      if (
        found.applicableCategories &&
        found.applicableCategories.length > 0 &&
        !found.applicableCategories.includes('*')
      ) {
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

      // Sync with Medusa backend promotion API if cartId is available
      if (cartId) {
        try {
          const promoRes = await applyMedusaPromotion(
            cartId,
            cleanCode,
            customerToken || undefined
          )
          if (promoRes.success && promoRes.data?.cart) {
            syncServerCart(promoRes.data.cart)
          }
        } catch {
          // Keep local applied coupon
        }
      }

      showToast(
        'success',
        `Coupon "${cleanCode}" applied! You saved ${found.discountPercent}%${
          found.category ? ` on ${found.category}` : ''
        }.`,
        { title: 'Coupon Applied' }
      )
      return true
    },
    [activeOffers, cartItems, cartSubtotal, cartId, customerToken, showToast, syncServerCart]
  )

  // 12. removeCoupon handler
  const removeCoupon = useCallback(async () => {
    const previousCode = appliedCoupon
    setAppliedCoupon(null)

    if (cartId && previousCode) {
      try {
        const delPromoRes = await removeMedusaPromotion(
          cartId,
          previousCode,
          customerToken || undefined
        )
        if (delPromoRes.success && delPromoRes.data?.cart) {
          syncServerCart(delPromoRes.data.cart)
        }
      } catch {
        // Fallback
      }
    }

    showToast('info', 'Coupon voucher removed')
  }, [appliedCoupon, cartId, customerToken, showToast, syncServerCart])

  // 13. moveToWishlist handler
  const moveToWishlist = useCallback(
    (itemId: string) => {
      const item = cartItems.find((i) => i.id === itemId)
      if (!item) return
      removeFromCart(itemId)
      if (item.productId && onMoveToWishlist) {
        onMoveToWishlist(item.productId, item.title)
      }
      showToast('success', `Moved "${item.title}" to wishlist`, { title: 'Wishlist' })
    },
    [cartItems, removeFromCart, onMoveToWishlist, showToast]
  )

  // 14. refreshCart handler
  const refreshCart = useCallback(async () => {
    if (!cartId) return
    setIsLoading(true)
    try {
      const res = await getMedusaCart(cartId, customerToken || undefined)
      if (res.success && res.data?.cart) {
        syncServerCart(res.data.cart)
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false)
    }
  }, [cartId, customerToken, syncServerCart])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartId,
      cartItems,
      cartCount,
      cartSubtotal,
      compareSubtotal,
      overallDiscountPercent,
      cartTotal,
      discountAmount,
      shippingAmount,
      appliedCoupon,
      isLoading,
      isHydrated,
      selectedShippingOption,
      setSelectedShippingOption,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      moveToWishlist,
      refreshCart,
      flushPendingCartUpdates,
      activeOffers,
      welcomeBannerOffer,
      refreshOffers,
      showToast,
    }),
    [
      cart,
      cartId,
      cartItems,
      cartCount,
      cartSubtotal,
      compareSubtotal,
      overallDiscountPercent,
      cartTotal,
      discountAmount,
      shippingAmount,
      appliedCoupon,
      isLoading,
      isHydrated,
      selectedShippingOption,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      moveToWishlist,
      refreshCart,
      flushPendingCartUpdates,
      activeOffers,
      welcomeBannerOffer,
      refreshOffers,
      showToast,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    // Provide a resilient fallback so isolated components outside CartProvider don't break
    return {
      cart: null,
      cartId: null,
      cartItems: [],
      cartCount: 0,
      cartSubtotal: 0,
      compareSubtotal: 0,
      overallDiscountPercent: 0,
      cartTotal: 0,
      discountAmount: 0,
      shippingAmount: 0,
      appliedCoupon: null,
      isLoading: false,
      isHydrated: false,
      selectedShippingOption: DEFAULT_SHIPPING_OPTIONS[0],
      setSelectedShippingOption: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      updateCartQuantity: () => {},
      clearCart: () => {},
      applyCoupon: () => false,
      removeCoupon: () => {},
      moveToWishlist: () => {},
      refreshCart: async () => {},
      flushPendingCartUpdates: async () => {},
      activeOffers: MILESTONE_COUPONS,
      welcomeBannerOffer: null,
      refreshOffers: async () => {},
      showToast: () => '',
    }
  }
  return context
}
