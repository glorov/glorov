/**
 * Single line item in the shopping cart
 */
export interface CartItem {
  id: string
  productId: string
  variantId?: string
  title: string
  variantName?: string
  category?: string // e.g. 'Seeds', 'Live Plants', 'Planters & Pots', 'Plant Care & Soil'
  price: number // in INR
  originalPrice?: number // in INR
  quantity: number
  image: string
  inStock?: boolean
  availableStock?: number
  sku?: string
}

/**
 * Milestone coupon offer for in-cart discount incentives
 */
export interface MilestoneOffer {
  code: string
  title: string
  description: string
  minSpend: number
  discountPercent: number
  disclaimer?: string
  category?: string
  applicableCategories?: string[] // e.g. ['seeds'], ['live-plants'], ['planters']
  maxDiscount?: number
}

/**
 * Standard shipping options supported by GLOROV
 */
export interface ShippingOption {
  id: string
  name: string
  description: string
  amount: number // in INR
  estimatedDays: string
  isExpress?: boolean
}

/**
 * Calculation totals for cart and checkout
 */
export interface CartCalculation {
  subtotal: number
  discountAmount: number
  shippingTotal: number
  grandTotal: number
  appliedCoupon?: string
  freeShippingThreshold: number
  remainingForFreeShipping: number
  hasUnlockedFreeShipping: boolean
}
