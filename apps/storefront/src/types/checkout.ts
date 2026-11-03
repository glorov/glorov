import { CartItem } from './cart'

/**
 * Customer delivery address for Indian shipments
 */
export interface DeliveryAddress {
  fullName: string
  phoneNumber: string // 10 numeric digits
  email: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  pincode: string // 6 numeric digits
  countryCode: string // 'in'
}

/**
 * Payment method supported by GLOROV backend
 */
export type PaymentMethodType = 'cod' | 'upi' | 'card' | 'razorpay'

export interface PaymentOption {
  id: PaymentMethodType
  providerId: string // e.g. 'pp_cod_cod' or 'pp_razorpay_razorpay'
  title: string
  subtitle: string
  icon: 'cod' | 'razorpay' | 'upi' | 'card'
  isAvailable: boolean
}

/**
 * Placed order confirmation data structure
 */
export interface PlacedOrderReceipt {
  id: string
  displayId: string
  createdAt: string
  email: string
  customerName: string
  shippingAddress: DeliveryAddress
  shippingMethodName: string
  paymentMethodTitle: string
  items: CartItem[]
  subtotal: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number
  currency: string
  estimatedDeliveryDate: string
  paymentStatus: 'authorized' | 'captured' | 'pending'
  fulfillmentStatus: 'not_fulfilled' | 'processing'
}

/**
 * Razorpay verification payload sent to backend
 */
export interface RazorpayVerificationRequest {
  cart_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayVerificationResponse {
  success: boolean
  verified?: boolean
  error?: string
  cart_id?: string
  razorpay_payment_id?: string
}
