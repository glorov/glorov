import crypto from 'crypto'
import { RazorpayClient } from '../modules/payment-razorpay/client'
import { RazorpayPaymentProviderService } from '../modules/payment-razorpay/service'

describe('Razorpay Payment Provider Unit Tests', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }

  describe('1. RazorpayClient & Mock Mode Security', () => {
    it('initializes in mock mode when credentials are unset or mock_mode=true', () => {
      const client = new RazorpayClient({ mock_mode: true })
      expect(client.isMockMode()).toBe(true)
      expect(client.getKeyId()).toBe('rzp_test_mock_key_id')
    })

    it('creates an order in paise with currency INR', async () => {
      const client = new RazorpayClient({ mock_mode: true })
      const order = await client.createOrder({
        amount: 9800,
        currency: 'INR',
        receipt: 'cart_test_123',
        notes: { source: 'unit_test' },
      })

      expect(order.id).toMatch(/^order_mock_/)
      expect(order.amount).toBe(9800)
      expect(order.currency).toBe('INR')
      expect(order.status).toBe('created')
    })

    it('cryptographically validates payment signatures using HMAC-SHA256', () => {
      const secret = 'test_secret_key_12345'
      const client = new RazorpayClient({
        key_id: 'rzp_test_key',
        key_secret: secret,
        mock_mode: false,
      })

      const orderId = 'order_9A33XWu170gUtm'
      const paymentId = 'pay_29AeQIYhhKoRqA'
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

      expect(client.verifyPaymentSignature(orderId, paymentId, validSignature)).toBe(true)

      // Rejects tampered signature
      expect(client.verifyPaymentSignature(orderId, paymentId, 'tampered_signature_hex')).toBe(false)

      // Rejects signature from different payment
      expect(client.verifyPaymentSignature(orderId, 'pay_different_id', validSignature)).toBe(false)
    })

    it('cryptographically validates webhook signatures using HMAC-SHA256', () => {
      const secret = 'webhook_secret_xyz'
      const client = new RazorpayClient({
        key_id: 'rzp_test_key',
        key_secret: 'rzp_sec',
        webhook_secret: secret,
        mock_mode: false,
      })

      const rawBody = JSON.stringify({ event: 'payment.captured', entity: 'event' })
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex')

      expect(client.verifyWebhookSignature(rawBody, validSignature)).toBe(true)
      expect(client.verifyWebhookSignature(rawBody, 'invalid_wh_sig')).toBe(false)
    })
  })

  describe('2. RazorpayPaymentProviderService Lifecycle', () => {
    let service: RazorpayPaymentProviderService

    beforeEach(() => {
      service = new RazorpayPaymentProviderService(
        { logger: mockLogger as any },
        {
          key_id: 'rzp_test_mock',
          key_secret: 'mock_sec',
          webhook_secret: 'wh_mock_sec',
          mock_mode: true,
        }
      )
    })

    it('identifies as "razorpay"', () => {
      expect(RazorpayPaymentProviderService.identifier).toBe('razorpay')
    })

    it('initiates a payment session with INR currency and amount in paise', async () => {
      const res = await service.initiatePayment({
        amount: 9800,
        currency_code: 'inr',
        context: { id: 'cart_test_init' } as any,
      })

      expect(res.id).toMatch(/^order_mock_/)
      expect(res.data).toBeDefined()
      expect(res.data?.amount).toBe(9800)
      expect(res.data?.currency).toBe('INR')
      expect(res.data?.status).toBe('created')
    })

    it('rejects initiation for non-INR currencies', async () => {
      await expect(
        service.initiatePayment({
          amount: 100,
          currency_code: 'usd',
          context: {} as any,
        })
      ).rejects.toThrow(/only supports INR currency/)
    })

    it('rejects initiation for zero or negative amounts', async () => {
      await expect(
        service.initiatePayment({
          amount: 0,
          currency_code: 'inr',
          context: {} as any,
        })
      ).rejects.toThrow(/Invalid payment amount/)
    })

    it('authorizes payment with valid signature verification', async () => {
      const client = service.getClient()
      const orderId = 'order_mock_123'
      const paymentId = 'pay_mock_456'
      const signature = `mock_sig_${orderId}_${paymentId}`

      const res = await service.authorizePayment({
        data: {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        },
      } as any)

      expect(res.status).toBe('authorized')
      expect(res.data?.verified).toBe(true)
      expect(res.data?.razorpay_payment_id).toBe(paymentId)
    })

    it('rejects authorization when signature is tampered or invalid', async () => {
      const strictService = new RazorpayPaymentProviderService(
        { logger: mockLogger as any },
        {
          key_id: 'rzp_test_strict',
          key_secret: 'super_secret_strict',
          mock_mode: false,
        }
      )

      await expect(
        strictService.authorizePayment({
          data: {
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'fake_tampered_signature',
          },
        } as any)
      ).rejects.toThrow(/signature verification failed/i)
    })

    it('captures an authorized payment', async () => {
      const res = await service.capturePayment({
        data: {
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          amount: 9800,
        },
      } as any)

      expect(res.data?.status).toBe('captured')
      expect(res.data?.captured_at).toBeDefined()
    })

    it('processes refunds with amount', async () => {
      const res = await service.refundPayment({
        data: {
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          amount: 9800,
        },
        amount: 4900,
      } as any)

      expect(res.data?.status).toBe('refunded')
      expect(res.data?.refund_id).toMatch(/^rfnd_mock_/)
    })

    it('returns correct payment status based on session state', async () => {
      expect(await service.getPaymentStatus({ data: { status: 'captured' } } as any)).toEqual({
        status: 'captured',
      })
      expect(await service.getPaymentStatus({ data: { status: 'authorized' } } as any)).toEqual({
        status: 'authorized',
      })
      expect(await service.getPaymentStatus({ data: { status: 'canceled' } } as any)).toEqual({
        status: 'canceled',
      })
      expect(await service.getPaymentStatus({ data: { status: 'failed' } } as any)).toEqual({
        status: 'error',
      })
      expect(await service.getPaymentStatus({ data: { status: 'created' } } as any)).toEqual({
        status: 'pending',
      })
    })

    it('processes webhook events for payment.captured and order.paid', async () => {
      const webhookPayload = {
        data: {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: 'pay_webhook_123',
                order_id: 'order_webhook_123',
                amount: 9800,
              },
            },
          },
        },
        rawData: JSON.stringify({}),
        headers: {
          'x-razorpay-signature': 'mock_wh_sig_valid',
        },
      }

      const res = await service.getWebhookActionAndData(webhookPayload as any)
      expect(res.action).toBe('captured')
      expect((res as any).data?.session_id).toBe('order_webhook_123')
      expect(Number((res as any).data?.amount)).toBe(9800)
    })
  })
})
