export interface SmtpConfig {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  password?: string
}

export interface EmailNotificationOptions {
  channels?: string[]
  from?: string
  from_name?: string
  reply_to?: string
  smtp?: SmtpConfig
  mock_mode?: boolean
}

export interface DeliveryAttemptRecord {
  id: string
  toMasked: string
  template?: string
  status: 'success' | 'failure'
  error?: string
  timestamp: Date
}

export interface SentEmailRecord {
  id: string
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
  text: string
  template?: string
  idempotencyKey?: string
  timestamp: Date
  metadata?: Record<string, unknown>
}


export interface OrderItemDetail {
  id?: string
  title: string
  variant_title?: string
  quantity: number
  unit_price: number
  total?: number
  thumbnail?: string
}

export interface ShippingAddressDetail {
  first_name?: string
  last_name?: string
  company?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
}

export interface OrderNotificationData {
  id: string
  display_id?: string | number
  email?: string
  currency_code?: string
  total?: number
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  discount_total?: number
  items?: OrderItemDetail[]
  shipping_address?: ShippingAddressDetail
  created_at?: string | Date
}

export interface PaymentNotificationData {
  id: string
  amount: number
  currency_code?: string
  provider_id?: string
  order?: OrderNotificationData
}

export interface ShipmentNotificationData {
  id: string
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  items?: OrderItemDetail[]
  order?: OrderNotificationData
}

export interface DeliveryNotificationData {
  id: string
  delivered_at?: string | Date
  order?: OrderNotificationData
}

export interface RefundNotificationData {
  id: string
  amount: number
  currency_code?: string
  reason?: string
  note?: string
  order?: OrderNotificationData
}

export interface PaymentFailureNotificationData {
  order_id?: string
  display_id?: string | number
  customer_email?: string
  amount?: number
  currency_code?: string
  error_code?: string
  error_description?: string
  retry_url?: string
}

export interface RenderedTemplate {
  subject: string
  html: string
  text: string
}
