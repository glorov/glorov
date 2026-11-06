import { CartItem } from './cart'

/**
 * Customer profile conforming to Medusa v2 customer schema
 */
export interface CustomerUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  gardeningExperience?: 'Beginner' | 'Intermediate' | 'Expert'
  memberSince: string
}

/**
 * Customer saved address conforming to Medusa customer address
 */
export interface CustomerAddress {
  id: string
  name: string // e.g. "Home", "Office", "Farmhouse"
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  countryCode: string
  isDefault: boolean
}

/**
 * Customer order history summary
 */
export interface CustomerOrder {
  id: string
  displayId: string
  createdAt: string
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'canceled'
    | 'completed'
    | 'requires_action'
    | 'archived'
    | string
  paymentStatus:
    | 'authorized'
    | 'captured'
    | 'refunded'
    | 'not_paid'
    | 'partially_refunded'
    | 'canceled'
    | 'awaiting'
    | string
  fulfillmentStatus:
    | 'not_fulfilled'
    | 'fulfilled'
    | 'shipped'
    | 'partially_fulfilled'
    | 'partially_shipped'
    | 'partially_delivered'
    | 'delivered'
    | 'canceled'
    | string
  totalAmount: number
  itemCount: number
  items: CartItem[]
  shippingAddress: CustomerAddress
  trackingCode?: string
  carrierName?: string
  trackingUrl?: string
  estimatedDeliveryDate?: string
  email?: string
  subtotal?: number
  discountAmount?: number
  shippingAmount?: number
  currencyCode?: string
  fulfillments?: OrderFulfillment[]
  metadata?: Record<string, unknown>
}

export interface OrderFulfillment {
  id?: string
  shipped_at?: string | null
  delivered_at?: string | null
  canceled_at?: string | null
  labels?: Array<{ tracking_number?: string; tracking_url?: string; label_url?: string }>
  data?: Record<string, unknown>
  [key: string]: unknown
}

export interface MedusaRawAddress {
  id?: string
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  address_name?: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface MedusaRawOrderItem {
  id: string
  product_id?: string
  variant_id?: string
  title?: string
  product_title?: string
  variant_title?: string
  subtitle?: string
  thumbnail?: string
  quantity?: number
  unit_price?: number
  variant_sku?: string
  sku?: string
  variant?: {
    id?: string
    title?: string
    product_id?: string
    sku?: string
    product?: {
      thumbnail?: string
    }
  }
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface MedusaRawOrder {
  id?: string
  display_id?: string | number
  total?: number
  subtotal?: number
  item_subtotal?: number
  discount_total?: number
  shipping_total?: number
  items?: MedusaRawOrderItem[]
  shipping_address?: MedusaRawAddress
  shipping_methods?: Array<{
    id?: string
    name?: string
    amount?: number
    price?: number
    [key: string]: unknown
  }>
  fulfillments?: OrderFulfillment[]
  payment_collections?: Array<{
    payments?: Array<{ provider_id?: string }>
    payment_sessions?: Array<{ provider_id?: string; status?: string }>
  }>
  status?: string
  fulfillment_status?: string
  payment_status?: string
  created_at?: string
  currency_code?: string
  email?: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Live botanical tracking event scan
 */
export interface OrderTrackingScan {
  date: string
  activity: string
  location: string
}

/**
 * Botanical Cold-Chain Tracking details returned by GET /store/orders/:id/tracking
 */
export interface OrderTrackingInfo {
  order_id: string
  display_id?: number | string
  fulfillment_status?: string
  shipping_status:
    | 'processing'
    | 'dispatched'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'rto'
    | 'exception'
    | string
  awb: string | null
  courier_name: string | null
  tracking_url: string | null
  origin: string
  destination_city: string
  destination_state: string
  destination_pincode: string
  is_perishable: boolean
  moisture_shield_status: string
  scans: OrderTrackingScan[]
  message?: string
}

/**
 * Return request item record
 */
export interface ReturnRequestItemRecord {
  line_item_id: string
  title: string
  variant_title?: string
  sku?: string
  quantity: number
  unit_price?: number
  reason: string
  customer_note?: string
}

/**
 * Return request record for an order
 */
export interface ReturnRequestRecord {
  id: string
  created_at: string
  status: 'pending_review' | 'approved' | 'rejected'
  items: ReturnRequestItemRecord[]
  customer_notes?: string | null
  seller_decision?: {
    decision: 'approved' | 'rejected'
    decided_at: string
    decided_by?: string
    customer_note?: string | null
    decision_notes?: string | null
    return_action?: string | null
    return_shipping_required?: boolean
  } | null
  refund_status: 'not_applicable' | 'pending' | 'refunded' | 'rejected'
  refund_amount_inr?: number | null
  tracking_number?: string
}

/**
 * In-app notification
 */
export interface CustomerNotification {
  id: string
  title: string
  message: string
  date: string
  isRead: boolean
  category: 'order' | 'gardening_tip' | 'wishlist' | 'announcement'
  link?: string
}

/**
 * Authentication form inputs
 */
export interface RegisterCustomerInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}
