import crypto from 'crypto'
import { MedusaError } from '@medusajs/framework/utils'
import type {
  RazorpayModuleOptions,
  RazorpayOrderPayload,
  RazorpayOrderResponse,
  RazorpayPaymentResponse,
  RazorpayRefundResponse,
} from './types'

export class RazorpayClient {
  private keyId: string
  private keySecret: string
  private webhookSecret: string
  private baseUrl = 'https://api.razorpay.com/v1'
  private mockMode: boolean
  private timeoutMs = 10000

  constructor(options: RazorpayModuleOptions) {
    this.keyId = options.key_id || process.env.RAZORPAY_KEY_ID || ''
    this.keySecret = options.key_secret || process.env.RAZORPAY_KEY_SECRET || ''
    this.webhookSecret =
      options.webhook_secret ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      ''
    this.mockMode =
      Boolean(options.mock_mode) ||
      !this.keyId ||
      !this.keySecret ||
      process.env.NODE_ENV === 'test'
  }

  public isMockMode(): boolean {
    return this.mockMode
  }

  public getKeyId(): string {
    return this.mockMode && !this.keyId ? 'rzp_test_mock_key_id' : this.keyId
  }

  /**
   * Cryptographically verify payment signature returned after checkout modal success:
   * HMAC-SHA256(order_id + "|" + payment_id, secret) === signature
   */
  public verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (this.mockMode && (!this.keySecret || signature.startsWith('mock_sig_'))) {
      return signature === `mock_sig_${orderId}_${paymentId}` || signature === 'valid_mock_signature'
    }

    if (!this.keySecret) {
      return false
    }

    const payload = `${orderId}|${paymentId}`
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex')

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(signature, 'utf8')
      )
    } catch {
      return false
    }
  }

  /**
   * Cryptographically verify webhook signature:
   * HMAC-SHA256(raw_body, webhook_secret) === x-razorpay-signature
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.webhookSecret || this.keySecret
    if (this.mockMode && (!secret || signature.startsWith('mock_wh_sig_'))) {
      return signature === 'mock_wh_sig_valid' || signature === `mock_wh_sig_${rawBody.length}`
    }

    if (!secret || !signature) {
      return false
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(signature, 'utf8')
      )
    } catch {
      return false
    }
  }

  /**
   * Create an order in Razorpay (amount in paise)
   */
  public async createOrder(payload: RazorpayOrderPayload): Promise<RazorpayOrderResponse> {
    if (this.mockMode) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      return {
        id: mockOrderId,
        entity: 'order',
        amount: payload.amount,
        amount_paid: 0,
        amount_due: payload.amount,
        currency: payload.currency.toUpperCase(),
        receipt: payload.receipt || `rcpt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: payload.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      }
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: payload.amount,
          currency: payload.currency.toUpperCase(),
          receipt: payload.receipt,
          notes: payload.notes,
          payment_capture: payload.payment_capture ?? 1,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as {
          error?: { description?: string; code?: string }
        }
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          errJson.error?.description ||
            `Razorpay order creation failed with HTTP ${res.status}`
        )
      }

      return (await res.json()) as RazorpayOrderResponse
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  public async retrievePayment(paymentId: string): Promise<RazorpayPaymentResponse> {
    if (this.mockMode) {
      return {
        id: paymentId,
        entity: 'payment',
        amount: 9800,
        currency: 'INR',
        status: 'captured',
        order_id: `order_mock_${paymentId}`,
        invoice_id: null,
        international: false,
        method: 'upi',
        amount_refunded: 0,
        refund_status: 'null',
        captured: true,
        email: 'customer@example.in',
        contact: '+919876543210',
        created_at: Math.floor(Date.now() / 1000),
      }
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Razorpay payment retrieval failed with HTTP ${res.status}`
        )
      }

      return (await res.json()) as RazorpayPaymentResponse
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Capture an authorized payment (if manual capture is used)
   */
  public async capturePayment(
    paymentId: string,
    amount: number,
    currency: string = 'INR'
  ): Promise<RazorpayPaymentResponse> {
    if (this.mockMode) {
      return {
        id: paymentId,
        entity: 'payment',
        amount,
        currency: currency.toUpperCase(),
        status: 'captured',
        order_id: `order_mock_${paymentId}`,
        international: false,
        method: 'card',
        amount_refunded: 0,
        captured: true,
        email: 'customer@example.in',
        contact: '+919876543210',
        created_at: Math.floor(Date.now() / 1000),
      }
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: currency.toUpperCase(),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Razorpay capture failed with HTTP ${res.status}`
        )
      }

      return (await res.json()) as RazorpayPaymentResponse
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Refund a captured payment
   */
  public async refundPayment(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>
  ): Promise<RazorpayRefundResponse> {
    if (this.mockMode) {
      return {
        id: `rfnd_mock_${Date.now()}`,
        entity: 'refund',
        amount: amount || 9800,
        currency: 'INR',
        payment_id: paymentId,
        notes: notes || {},
        status: 'processed',
        speed_processed: 'normal',
        speed_requested: 'normal',
        created_at: Math.floor(Date.now() / 1000),
      }
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          notes,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Razorpay refund failed with HTTP ${res.status}`
        )
      }

      return (await res.json()) as RazorpayRefundResponse
    } finally {
      clearTimeout(timeout)
    }
  }
}
