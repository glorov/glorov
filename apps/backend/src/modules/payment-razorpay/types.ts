export interface RazorpayModuleOptions {
  key_id?: string
  key_secret?: string
  webhook_secret?: string
  auto_capture?: boolean
  mock_mode?: boolean
}

export interface RazorpayOrderPayload {
  amount: number // in paise (e.g. 9800 for ₹98.00)
  currency: string // 'INR'
  receipt?: string
  notes?: Record<string, string>
  payment_capture?: 0 | 1
}

export interface RazorpayOrderResponse {
  id: string
  entity: 'order'
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: 'created' | 'attempted' | 'paid'
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export interface RazorpayPaymentResponse {
  id: string
  entity: 'payment'
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  order_id: string
  invoice_id?: string | null
  international: boolean
  method: 'card' | 'netbanking' | 'wallet' | 'emi' | 'upi'
  amount_refunded: number
  refund_status?: 'null' | 'partial' | 'full'
  captured: boolean
  description?: string
  card_id?: string | null
  bank?: string | null
  wallet?: string | null
  vpa?: string | null
  email: string
  contact: string
  fee?: number
  tax?: number
  error_code?: string | null
  error_description?: string | null
  notes?: Record<string, string>
  created_at: number
}

export interface RazorpayRefundResponse {
  id: string
  entity: 'refund'
  amount: number
  currency: string
  payment_id: string
  notes: Record<string, string>
  receipt?: string
  acquirer_data?: Record<string, unknown>
  created_at: number
  batch_id?: string | null
  status: 'pending' | 'processed' | 'failed'
  speed_processed: 'normal' | 'optimum'
  speed_requested: 'normal' | 'optimum'
}

export interface RazorpayWebhookPayload {
  entity: string
  account_id: string
  event:
    | 'payment.authorized'
    | 'payment.captured'
    | 'payment.failed'
    | 'order.paid'
    | 'refund.processed'
    | 'refund.failed'
  contains: string[]
  payload: {
    payment?: {
      entity: RazorpayPaymentResponse
    }
    order?: {
      entity: RazorpayOrderResponse
    }
    refund?: {
      entity: RazorpayRefundResponse
    }
  }
  created_at: number
}
