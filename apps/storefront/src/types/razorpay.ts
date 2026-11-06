/**
 * Razorpay Web Checkout TypeScript Definitions
 * Used by GLOROV Next.js storefront for client-side payment processing.
 */

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayPaymentFailureDetails {
  code: string
  description: string
  source?: string
  step?: string
  reason?: string
  metadata?: {
    order_id?: string
    payment_id?: string
  }
}

export interface RazorpayPaymentFailedPayload {
  error: RazorpayPaymentFailureDetails
}

export interface RazorpayPrefill {
  name?: string
  email?: string
  contact?: string
}

export interface RazorpayTheme {
  color?: string
  backdrop_color?: string
  hide_topbar?: boolean
}

export interface RazorpayModalOptions {
  ondismiss?: () => void
  escape?: boolean
  backdropclose?: boolean
  confirm_close?: boolean
  animation?: boolean
}

export interface RazorpayOptions {
  key: string
  amount: number // in minor units (paise for INR)
  currency: string // 'INR'
  name: string // 'GLOROV'
  order_id: string // Razorpay order ID (e.g. 'order_xxx')
  description?: string
  image?: string
  handler?: (response: RazorpayPaymentSuccessPayload) => void | Promise<void>
  prefill?: RazorpayPrefill
  notes?: Record<string, string>
  theme?: RazorpayTheme
  modal?: RazorpayModalOptions
  retry?: {
    enabled?: boolean
    max_count?: number
  }
}

export interface RazorpayInstance {
  open: () => void
  close?: () => void
  on: <T = RazorpayPaymentFailedPayload>(event: string, callback: (response: T) => void) => void
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

/**
 * Medusa v2 Payment Session Data Structure
 */
export interface MedusaPaymentSessionData {
  razorpay_order_id?: string
  id?: string
  order_id?: string
  amount?: number
  currency?: string
  key_id?: string
  status?: string
  cart_id?: string
  [key: string]: unknown
}

export interface MedusaPaymentSession {
  id: string
  provider_id: string
  amount?: number
  data?: MedusaPaymentSessionData
  status?: string
}

export interface MedusaPaymentCollection {
  id: string
  amount?: number
  currency_code?: string
  payment_sessions?: MedusaPaymentSession[]
}
