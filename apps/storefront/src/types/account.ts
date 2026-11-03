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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'authorized' | 'captured' | 'refunded'
  fulfillmentStatus: 'not_fulfilled' | 'fulfilled' | 'shipped'
  totalAmount: number
  itemCount: number
  items: CartItem[]
  shippingAddress: CustomerAddress
  trackingCode?: string
  carrierName?: string
  estimatedDeliveryDate?: string
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
