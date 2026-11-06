import crypto from 'crypto'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_razorpay_webhook_secret_dev'

describe('Medusa v2 Razorpay & COD Payment Integration Tests', () => {
  jest.setTimeout(30000)

  const storeHeaders: Record<string, string> = {
    'x-publishable-api-key': PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  }

  let adminToken = ''
  let adminHeaders: Record<string, string> = {}
  let inStockVariantId = ''

  beforeAll(async () => {
    // 1. Health check
    const healthRes = await fetch(`${BACKEND_URL}/health`)
    if (!healthRes.ok) {
      throw new Error(`Backend health check failed: ${healthRes.status}`)
    }

    // 2. Admin auth
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@glorov.in',
        password: 'SuperSecretPassword123!',
      }),
    })
    if (!authRes.ok) {
      throw new Error(`Admin auth failed: ${authRes.status}`)
    }
    const authData = await authRes.json()
    adminToken = authData.token
    adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    }

    // 3. Resolve product variant for testing (Marigold seeds)
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
      { headers: storeHeaders }
    )
    const prodData = await prodRes.json()
    inStockVariantId = prodData.products[0].variants[0].id
  }, 15000)

  describe('1. Store Payment Providers Listing', () => {
    it('returns enabled Indian payment providers (Razorpay and COD)', async () => {
      // First retrieve Indian region
      const regRes = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: storeHeaders,
      })
      expect(regRes.status).toBe(200)
      const regData = await regRes.json()
      const indiaRegion = regData.regions.find(
        (r: any) => r.currency_code === 'inr' || r.name.toLowerCase() === 'india'
      )
      expect(indiaRegion).toBeDefined()

      const res = await fetch(`${BACKEND_URL}/store/payment-providers?region_id=${indiaRegion.id}`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.payment_providers).toBeDefined()
      const providerIds = body.payment_providers.map((p: any) => p.id)
      expect(providerIds).toContain('pp_razorpay_razorpay')
      expect(providerIds).toContain('pp_cod_cod')
      expect(providerIds).toContain('pp_system_default')
    })
  })

  describe('2. POST /store/payment/razorpay/verify Cryptographic Verification', () => {
    it('rejects verification when required fields are missing', async () => {
      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: 'cart_123',
          // missing order_id, payment_id, signature
        }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Missing required verification fields')
    })

    it('rejects verification when signature is invalid or tampered', async () => {
      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: 'cart_123',
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'invalid_tampered_signature_string',
        }),
      })

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid payment signature')
    })

    it('successfully verifies valid signature', async () => {
      const orderId = 'order_mock_test'
      const paymentId = 'pay_mock_test'
      const signature = `mock_sig_${orderId}_${paymentId}`

      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: 'cart_mock_test',
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.verified).toBe(true)
    })
  })

  describe('3. POST /hooks/razorpay Webhook Security & Idempotency', () => {
    it('rejects webhooks with 401 when signature header is missing', async () => {
      const res = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'payment.captured' }),
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toContain('missing x-razorpay-signature')
    })

    it('rejects webhooks with 401 when signature is invalid', async () => {
      const res = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'invalid_forged_signature',
        },
        body: JSON.stringify({ event: 'payment.captured' }),
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toContain('invalid webhook signature')
    })

    it('processes authenticated payment.captured webhook idempotently', async () => {
      const payload = {
        event: 'payment.captured',
        entity: 'event',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_captured_01',
              order_id: 'order_test_captured_01',
              amount: 9800,
              notes: {
                cart_id: 'cart_test_01',
              },
            },
          },
        },
      }

      // First webhook delivery
      const res1 = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_wh_sig_valid',
        },
        body: JSON.stringify(payload),
      })

      expect(res1.status).toBe(200)
      const data1 = await res1.json()
      expect(data1.received).toBe(true)
      expect(data1.action_taken).toBe('payment_captured_recorded')

      // Second webhook delivery (duplicate replay)
      const res2 = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_wh_sig_valid',
        },
        body: JSON.stringify(payload),
      })

      expect(res2.status).toBe(200)
      const data2 = await res2.json()
      expect(data2.received).toBe(true)
    })

    it('handles payment.failed webhook safely without unhandled errors', async () => {
      const failPayload = {
        event: 'payment.failed',
        entity: 'event',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_failed_01',
              order_id: 'order_test_failed_01',
              amount: 9800,
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Payment was declined by issuing bank',
            },
          },
        },
      }

      const res = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_wh_sig_valid',
        },
        body: JSON.stringify(failPayload),
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.received).toBe(true)
      expect(data.action_taken).toBe('payment_failure_recorded')
    })
  })

  describe('4. Full Checkout Workflow with Razorpay (pp_razorpay_razorpay)', () => {
    it('creates cart, initializes Razorpay session, and places order', async () => {
      // Step 1: Create Cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      expect(cartRes.status).toBe(200)
      const { cart } = await cartRes.json()

      // Step 2: Add Line Item
      const itemRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          variant_id: inStockVariantId,
          quantity: 1,
        }),
      })
      expect(itemRes.status).toBe(200)

      // Step 3: Add Shipping Address
      const addrRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: 'vikram.mehta@example.in',
          shipping_address: {
            first_name: 'Vikram',
            last_name: 'Mehta',
            address_1: 'Plot 45, Koregaon Park',
            city: 'Pune',
            province: 'Maharashtra',
            postal_code: '411001',
            country_code: 'in',
            phone: '9876543210',
          },
        }),
      })
      expect(addrRes.status).toBe(200)

      // Step 4: Select Shipping Method
      const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
        headers: storeHeaders,
      })
      const { shipping_options } = await optRes.json()
      const shipMethodRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ option_id: shipping_options[0].id }),
      })
      expect(shipMethodRes.status).toBe(200)

      // Step 5: Initialize Payment Collection & Razorpay Session
      const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ cart_id: cart.id }),
      })
      expect(pcRes.status).toBe(200)
      const { payment_collection } = await pcRes.json()

      const psRes = await fetch(
        `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
        {
          method: 'POST',
          headers: storeHeaders,
          body: JSON.stringify({ provider_id: 'pp_razorpay_razorpay' }),
        }
      )
      expect(psRes.status).toBe(200)
      const psData = await psRes.json()
      const session = psData.payment_collection.payment_sessions.find(
        (s: any) => s.provider_id === 'pp_razorpay_razorpay'
      )
      expect(session).toBeDefined()
      expect(session.data.razorpay_order_id).toBeDefined()
      expect(session.data.currency).toBe('INR')

      // Step 6: Complete Cart Checkout
      const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: 'POST',
        headers: storeHeaders,
      })
      expect(completeRes.status).toBe(200)
      const completeData = await completeRes.json()
      expect(completeData.type).toBe('order')
      expect(completeData.order).toBeDefined()
      expect(completeData.order.id).toBeDefined()
      expect(completeData.order.currency_code).toBe('inr')

      // Verify in Admin API
      const adminOrderRes = await fetch(
        `${BACKEND_URL}/admin/orders/${completeData.order.id}?fields=+currency_code`,
        { headers: adminHeaders }
      )
      expect(adminOrderRes.status).toBe(200)
      const { order: adminOrder } = await adminOrderRes.json()
      expect(adminOrder.payment_status).toBe('authorized')
      expect(adminOrder.currency_code).toBe('inr')
    })
  })

  describe('5. Full Checkout Workflow with Cash on Delivery (pp_cod_cod)', () => {
    it('creates cart, initializes COD session, and confirms pending cash status', async () => {
      // Step 1: Create Cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      expect(cartRes.status).toBe(200)
      const { cart } = await cartRes.json()

      // Step 2: Add Line Item
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          variant_id: inStockVariantId,
          quantity: 1,
        }),
      })

      // Step 3: Add Shipping Address
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: 'sunil.sharma@example.in',
          shipping_address: {
            first_name: 'Sunil',
            last_name: 'Sharma',
            address_1: '12 B, Indiranagar',
            city: 'Bengaluru',
            province: 'Karnataka',
            postal_code: '560038',
            country_code: 'in',
            phone: '9812345678',
          },
        }),
      })

      // Step 4: Apply Shipping Option
      const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
        headers: storeHeaders,
      })
      const { shipping_options } = await optRes.json()
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ option_id: shipping_options[0].id }),
      })

      // Step 5: Initialize Payment Collection & COD Session
      const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ cart_id: cart.id }),
      })
      const { payment_collection } = await pcRes.json()

      const psRes = await fetch(
        `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
        {
          method: 'POST',
          headers: storeHeaders,
          body: JSON.stringify({ provider_id: 'pp_cod_cod' }),
        }
      )
      expect(psRes.status).toBe(200)
      const psData = await psRes.json()
      const codSession = psData.payment_collection.payment_sessions.find(
        (s: any) => s.provider_id === 'pp_cod_cod'
      )
      expect(codSession).toBeDefined()
      expect(codSession.data.payment_method).toBe('cod')
      expect(codSession.data.cash_collected).toBe(false)

      // Step 6: Complete Cart Checkout
      const completeRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: 'POST',
        headers: storeHeaders,
      })
      expect(completeRes.status).toBe(200)
      const { order } = await completeRes.json()
      expect(order.id).toBeDefined()
      expect(order.currency_code).toBe('inr')

      // Verify Order Payment State in Admin API is Authorized (NOT marked paid/captured)
      const adminOrderRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order.id}?fields=+currency_code`,
        { headers: adminHeaders }
      )
      expect(adminOrderRes.status).toBe(200)
      const { order: adminOrder } = await adminOrderRes.json()
      expect(adminOrder.payment_status).toBe('authorized')
      expect(adminOrder.currency_code).toBe('inr')
    })
  })
})
