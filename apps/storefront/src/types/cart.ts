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

/**
 * Medusa v2 raw line item representation
 */
export interface MedusaLineItem {
  id: string
  title: string
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price: number // in paise (e.g. 4900 = ₹49)
  compare_at_unit_price?: number | null
  variant_id?: string
  product_id?: string
  product_title?: string
  variant_title?: string
  variant_sku?: string
  variant?: {
    id: string
    title: string
    sku?: string
    product_id?: string
    product?: {
      id: string
      title: string
      handle?: string
      thumbnail?: string
      categories?: Array<{ id: string; name: string }>
      metadata?: Record<string, unknown>
    }
  }
  product?: {
    id: string
    title: string
    handle?: string
    thumbnail?: string
    categories?: Array<{ id: string; name: string }>
    metadata?: Record<string, unknown>
  }
  metadata?: Record<string, unknown>
  subtotal?: number
  total?: number
  original_total?: number
  discount_total?: number
}

/**
 * Medusa v2 raw cart promotion representation
 */
export interface MedusaPromotion {
  id: string
  code: string
  is_automatic?: boolean
  is_tax_inclusive?: boolean
  application_method?: {
    value?: number
    type?: string
    currency_code?: string
  }
}

/**
 * Medusa v2 raw cart response representation
 */
export interface MedusaCart {
  id: string
  currency_code: string
  email?: string | null
  customer_id?: string | null
  region_id?: string | null
  region?: {
    id: string
    name: string
    currency_code: string
  }
  items?: MedusaLineItem[]
  subtotal?: number // in paise
  total?: number // in paise
  item_subtotal?: number // in paise
  item_total?: number // in paise
  original_item_total?: number // in paise
  original_total?: number // in paise
  discount_total?: number // in paise
  discount_subtotal?: number // in paise
  shipping_total?: number // in paise
  shipping_subtotal?: number // in paise
  tax_total?: number // in paise
  promotions?: MedusaPromotion[]
  shipping_methods?: Array<{
    id: string
    shipping_option_id: string
    amount: number
    name?: string
  }>
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    phone?: string
    country_code?: string
  }
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  completed_at?: string | null
}

