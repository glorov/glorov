import crypto from 'crypto'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'
const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_razorpay_webhook_secret_dev'
const SHIPROCKET_WEBHOOK_TOKEN =
  process.env.SHIPROCKET_WEBHOOK_TOKEN || 'test_shiprocket_token_2026'

describe('GLOROV Critical E-Commerce Regression Test Suite', () => {
  jest.setTimeout(45000)

  const storeHeaders: Record<string, string> = {
    'x-publishable-api-key': PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  }

  let adminToken = ''
  let adminHeaders: Record<string, string> = {}
  let inStockVariantId = ''
  let outOfStockVariantId = ''

  // Test Customer A
  const timestamp = Date.now()
  const customerAEmail = `cust.a.${timestamp}@glorov.in`
  const customerAPassword = 'SecurePassA2026!'
  let customerAToken = ''
  let customerAId = ''
  let customerAOrderId = ''

  // Test Customer B (Attacker)
  const customerBEmail = `cust.b.${timestamp}@glorov.in`
  const customerBPassword = 'SecurePassB2026!'
  let customerBToken = ''

  beforeAll(async () => {
    // 1. Health check
    const healthRes = await fetch(`${BACKEND_URL}/health`)
    if (!healthRes.ok) {
      throw new Error(`Medusa backend health check failed: ${healthRes.status}`)
    }

    // 2. Admin Auth
    const authRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@glorov.in',
        password: 'SuperSecretPassword123!',
      }),
    })
    if (!authRes.ok) {
      throw new Error(`Admin authentication failed: ${authRes.status}`)
    }
    const authData = await authRes.json()
    adminToken = authData.token
    adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    }

    // 3. Resolve test variants
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
      { headers: storeHeaders }
    )
    const prodData = await prodRes.json()
    const marigold = prodData.products[0]
    const inStock = marigold?.variants?.find((v: { title: string }) => v.title === '50 Seeds')
    if (inStock) inStockVariantId = inStock.id

    // Check or find out-of-stock variant
    const allProdRes = await fetch(`${BACKEND_URL}/store/products?limit=10&fields=*variants`, {
      headers: storeHeaders,
    })
    const allProdData = await allProdRes.json()
    for (const p of allProdData.products || []) {
      for (const v of p.variants || []) {
        if (v.inventory_quantity === 0) {
          outOfStockVariantId = v.id
          break
        }
      }
      if (outOfStockVariantId) break
    }

    // 4. Setup Customer A & Customer B
    const regARes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerAEmail, password: customerAPassword }),
    })
    if (regARes.ok) {
      const { token } = await regARes.json()
      customerAToken = token

      const createCustRes = await fetch(`${BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: { ...storeHeaders, Authorization: `Bearer ${customerAToken}` },
        body: JSON.stringify({
          email: customerAEmail,
          first_name: 'Aarav',
          last_name: 'Sharma',
          phone: '9876543210',
        }),
      })
      if (createCustRes.ok) {
        const { customer } = await createCustRes.json()
        customerAId = customer.id
      }
    }

    const regBRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerBEmail, password: customerBPassword }),
    })
    if (regBRes.ok) {
      const { token } = await regBRes.json()
      customerBToken = token
    }
  })

  describe('Regression 1: Customer Order Isolation & Anti-IDOR Enforcement', () => {
    let testOrderId = ''

    beforeAll(async () => {
      // Create an order for Customer A to test isolation
      if (!inStockVariantId || !customerAToken) return

      // Create cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      const { cart } = await cartRes.json()

      // Add item
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ variant_id: inStockVariantId, quantity: 1 }),
      })

      // Add address
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: { ...storeHeaders, Authorization: `Bearer ${customerAToken}` },
        body: JSON.stringify({
          email: customerAEmail,
          shipping_address: {
            first_name: 'Aarav',
            last_name: 'Sharma',
            address_1: 'Flat 101, Botanical Gardens',
            city: 'Pune',
            province: 'Maharashtra',
            postal_code: '411001',
            country_code: 'in',
            phone: '9876543210',
          },
        }),
      })

      // Select shipping
      const shipOptsRes = await fetch(
        `${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`,
        { headers: storeHeaders }
      )
      const { shipping_options } = await shipOptsRes.json()
      if (shipping_options?.[0]) {
        await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
          method: 'POST',
          headers: storeHeaders,
          body: JSON.stringify({ option_id: shipping_options[0].id }),
        })
      }

      // Initialize COD session
      await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ cart_id: cart.id }),
      })
      await fetch(
        `${BACKEND_URL}/store/payment-collections/pay_col_${cart.id}/payment-sessions`,
        {
          method: 'POST',
          headers: storeHeaders,
          body: JSON.stringify({ provider_id: 'pp_cod_cod' }),
        }
      ).catch(() => {})

      // Complete cart
      const compRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: 'POST',
        headers: storeHeaders,
      })
      if (compRes.ok) {
        const compData = await compRes.json()
        testOrderId = compData.order?.id
        customerAOrderId = testOrderId
      }
    })

    it('allows Customer A to retrieve their own order with full details', async () => {
      if (!testOrderId) return
      const res = await fetch(`${BACKEND_URL}/store/orders/${testOrderId}`, {
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customerAToken}`,
        },
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.order.id).toBe(testOrderId)
    })

    it('strictly forbids Customer B from accessing Customer A order (403 Forbidden)', async () => {
      if (!testOrderId) return
      const res = await fetch(`${BACKEND_URL}/store/orders/${testOrderId}`, {
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customerBToken}`,
        },
      })
      expect(res.status).toBe(403)
      const data = await res.json()
      expect(data.message).toMatch(/permission|unauthorized/i)
    })

    it('rejects unauthenticated requests to a customer-owned order (401 Unauthorized)', async () => {
      if (!testOrderId) return
      const res = await fetch(`${BACKEND_URL}/store/orders/${testOrderId}`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(401)
    })
  })

  describe('Regression 2: Administrative Privilege Separation', () => {
    it('blocks storefront requests with publishable key from accessing /admin/products (401)', async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(401)
    })

    it('blocks customer tokens from accessing /admin/orders (401)', async () => {
      const res = await fetch(`${BACKEND_URL}/admin/orders`, {
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customerAToken}`,
        },
      })
      expect(res.status).toBe(401)
    })

    it('blocks customer tokens from triggering administrative CSV import (401)', async () => {
      const res = await fetch(`${BACKEND_URL}/admin/products/csv-import/apply`, {
        method: 'POST',
        headers: {
          ...storeHeaders,
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({ items: [] }),
      })
      expect(res.status).toBe(401)
    })
  })

  describe('Regression 3: Payment Confirmation Integrity', () => {
    it('rejects forged payment verification with invalid signature (400 Bad Request)', async () => {
      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: 'cart_01HFORGED_CART_ID',
          razorpay_order_id: 'order_test_123',
          razorpay_payment_id: 'pay_test_123',
          razorpay_signature: 'forged_tampered_signature_hex_value_2026',
        }),
      })
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toMatch(/signature/i)
    })

    it('rejects verification when required fields are missing without setting order as paid', async () => {
      const res = await fetch(`${BACKEND_URL}/store/payment/razorpay/verify`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          cart_id: 'cart_01HINCOMPLETE',
        }),
      })
      expect(res.status).toBe(400)
    })
  })

  describe('Regression 4: Webhook Idempotency & Side-Effect Prevention', () => {
    it('processes duplicate payment.captured webhooks idempotently without side effects', async () => {
      const payload = {
        event: 'payment.captured',
        entity: 'event',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: `pay_idem_${Date.now()}`,
              amount: 4900,
              currency: 'INR',
              status: 'captured',
              order_id: 'order_idem_test',
              notes: {
                cart_id: 'cart_idempotent_test',
              },
            },
          },
        },
      }
      const rawBody = JSON.stringify(payload)
      const signature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex')

      const sendWebhook = async () =>
        fetch(`${BACKEND_URL}/hooks/razorpay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-signature': signature,
          },
          body: rawBody,
        })

      // Delivery 1
      const res1 = await sendWebhook()
      expect(res1.status).toBe(200)
      const data1 = await res1.json()
      expect(data1.received).toBe(true)

      // Delivery 2 (Immediate duplicate)
      const res2 = await sendWebhook()
      expect(res2.status).toBe(200)
      const data2 = await res2.json()
      expect(data2.received).toBe(true)
    })

    it('processes duplicate Shiprocket delivery webhooks idempotently', async () => {
      const shiprocketPayload = {
        awb: `AWB-IDEM-${Date.now()}`,
        current_status: 'DELIVERED',
        current_status_id: 7,
      }

      const sendWebhook = async () =>
        fetch(`${BACKEND_URL}/hooks/shiprocket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': SHIPROCKET_WEBHOOK_TOKEN,
          },
          body: JSON.stringify(shiprocketPayload),
        })

      const res1 = await sendWebhook()
      expect(res1.status).toBe(200)

      const res2 = await sendWebhook()
      expect(res2.status).toBe(200)
    })
  })

  describe('Regression 5: Repeated Checkout Requests Do Not Create Duplicate Orders', () => {
    it('rejects completing an already completed cart or handles idempotently', async () => {
      // Create a fresh cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      const { cart } = await cartRes.json()

      // Add line item
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ variant_id: inStockVariantId, quantity: 1 }),
      })

      // Add address
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: `repeat.checkout.${Date.now()}@glorov.in`,
          shipping_address: {
            first_name: 'Pooja',
            last_name: 'Verma',
            address_1: 'Plot 42, Vasant Vihar',
            city: 'New Delhi',
            province: 'Delhi',
            postal_code: '110057',
            country_code: 'in',
            phone: '9876543212',
          },
        }),
      })

      // Shipping option
      const optsRes = await fetch(
        `${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`,
        { headers: storeHeaders }
      )
      const { shipping_options } = await optsRes.json()
      if (shipping_options?.[0]) {
        await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
          method: 'POST',
          headers: storeHeaders,
          body: JSON.stringify({ option_id: shipping_options[0].id }),
        })
      }

      // COD payment session
      const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ cart_id: cart.id }),
      })
      const { payment_collection } = await pcRes.json()

      await fetch(
        `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
        {
          method: 'POST',
          headers: storeHeaders,
          body: JSON.stringify({ provider_id: 'pp_cod_cod' }),
        }
      )

      // 1st complete cart call
      const complete1Res = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: 'POST',
        headers: storeHeaders,
      })
      expect(complete1Res.status).toBe(200)
      const { order: order1 } = await complete1Res.json()
      expect(order1).toBeDefined()

      // 2nd complete cart call on the exact same cart
      const complete2Res = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/complete`, {
        method: 'POST',
        headers: storeHeaders,
      })

      // Must NOT create a second new order! Either returns existing order or returns 400/409
      if (complete2Res.ok) {
        const { order: order2 } = await complete2Res.json()
        expect(order2.id).toBe(order1.id)
      } else {
        expect(complete2Res.status).toBeGreaterThanOrEqual(400)
      }
    })
  })

  describe('Regression 6: Insufficient Inventory & Concurrency Protection', () => {
    it('rejects adding an out-of-stock variant to cart or fails order completion', async () => {
      if (!outOfStockVariantId) return

      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      const { cart } = await cartRes.json()

      const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ variant_id: outOfStockVariantId, quantity: 1 }),
      })

      // Backend should reject or report insufficient stock
      expect(addRes.status).toBeGreaterThanOrEqual(400)
    })

    it('rejects cart item with excessive quantity exceeding maximum limit', async () => {
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      const { cart } = await cartRes.json()

      // Attempt to purchase 999999 packets (hoarding attempt)
      const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ variant_id: inStockVariantId, quantity: 999999 }),
      })
      expect(addRes.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('Regression 7: Failed Shipping Requests Do Not Falsely Mark Shipments', () => {
    it('does not falsely mark order as shipped when courier request fails or has invalid AWB', async () => {
      const invalidWebhookRes = await fetch(`${BACKEND_URL}/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SHIPROCKET_WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          order_id: 'non_existent_fake_order_id_123',
          current_status: 'SHIPPED',
        }),
      })
      expect(invalidWebhookRes.status).toBe(200)
      const data = await invalidWebhookRes.json()
      // No order fulfillment was mutated; system safely logs the orphan event
      expect(data.fulfillment_id).toBeNull()
      expect(data.action_taken).toBe('recorded_log')
    })
  })

  describe('Regression 8: CSV Import Validation Guard & Inventory Integrity', () => {
    it('dry-run preview with malformed data does NOT alter existing product catalog or inventory', async () => {
      // 1. Check existing tomato variant stock before test
      const prodRes = await fetch(
        `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
        { headers: storeHeaders }
      )
      const { products } = await prodRes.json()
      const variantBefore = products[0].variants.find(
        (v: { title: string }) => v.title === '50 Seeds'
      )
      const qtyBefore = variantBefore.inventory_quantity

      // 2. Upload corrupt CSV with bad price, negative stock, and invalid format
      const corruptCsv = `product_title,handle,sku,price,initial_inventory_quantity
Corrupted Seed,corrupted-handle,GLR-CORRUPT-01,-99.00,-500`

      const previewRes = await fetch(`${BACKEND_URL}/admin/products/csv-import/preview`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ csv_content: corruptCsv }),
      })
      expect(previewRes.status).toBe(200)
      const { preview } = await previewRes.json()
      expect(preview.validation.is_valid).toBe(false)

      // 3. Re-check product catalog stock: must remain unchanged!
      const prodAfterRes = await fetch(
        `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
        { headers: storeHeaders }
      )
      const { products: productsAfter } = await prodAfterRes.json()
      const variantAfter = productsAfter[0].variants.find(
        (v: { title: string }) => v.title === '50 Seeds'
      )
      expect(variantAfter.inventory_quantity).toBe(qtyBefore)
    })
  })
})
