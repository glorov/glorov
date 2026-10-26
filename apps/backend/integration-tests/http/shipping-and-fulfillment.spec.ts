const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'
const WEBHOOK_TOKEN =
  process.env.SHIPROCKET_WEBHOOK_TOKEN || 'glorov_sr_webhook_secret_2026'

describe('Medusa v2 Shipping, Pincode Serviceability, and Shiprocket Fulfillment Integration Tests', () => {
  const storeHeaders: Record<string, string> = {
    'x-publishable-api-key': PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  }

  let adminToken = ''
  let adminHeaders: Record<string, string> = {}
  let inStockVariantId = ''

  beforeAll(async () => {
    // 1. Backend health check
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

    // 3. Resolve test seed variant (use Marigold seeds to keep Tomato seeds inventory isolated)
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
      { headers: storeHeaders }
    )
    const prodData = await prodRes.json()
    inStockVariantId = prodData.products[0].variants[0].id
  }, 15000)

  describe('1. GET /store/pincode-check Indian Serviceability API', () => {
    it('returns serviceability, city, state, and COD availability for valid metro PIN 411001', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=411001`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.pincode).toBe('411001')
      expect(body.serviceable).toBe(true)
      expect(body.city).toBe('Pune')
      expect(body.state).toBe('Maharashtra')
      expect(body.cod_available).toBe(true)
      expect(body.estimated_days).toBe(2)
      expect(body.courier_name).toBeDefined()
    })

    it('returns serviceability for non-metro PIN 282001 with surface courier estimate', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=282001`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.pincode).toBe('282001')
      expect(body.serviceable).toBe(true)
      expect(body.cod_available).toBe(true)
      expect(body.estimated_days).toBeGreaterThanOrEqual(3)
    })

    it('disallows COD for perishable live plants (is_perishable=true) on routes > 2 days', async () => {
      const res = await fetch(
        `${BACKEND_URL}/store/pincode-check?pincode=282001&is_perishable=true`,
        { headers: storeHeaders }
      )
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.serviceable).toBe(true)
      // Botanical guardrail: perishable plants on slow routes disallow COD to protect viability
      expect(body.cod_available).toBe(false)
      expect(body.message.toLowerCase()).toContain('perishable')
    })

    it('returns remote corridor serviceability with extended transit and restricted COD for North East PIN 790001', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=790001`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.pincode).toBe('790001')
      expect(body.serviceable).toBe(true)
      expect(body.state).toBe('Assam / North East')
      expect(body.estimated_days).toBe(5)
      expect(body.cod_available).toBe(false)
      expect(body.message).toContain('Remote Transit Corridor')
    })

    it('rejects invalid PIN starting with 0 with 400 Bad Request', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=012345`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(400)

      const body = await res.json()
      expect(body.serviceable).toBe(false)
      expect(body.message).toContain('6 digits and cannot start with 0')
    })

    it('rejects short PIN code with 400 Bad Request', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=41100`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(400)
    })

    it('rejects missing pincode query parameter with 400 Bad Request', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.message).toContain('query parameter is required')
    })

    it('returns unserviceable response for non-serviced remote PIN prefix 999999', async () => {
      const res = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=999999`, {
        headers: storeHeaders,
      })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.serviceable).toBe(false)
      expect(body.cod_available).toBe(false)
      expect(body.message).toContain('unavailable')
    })
  })

  describe('2. POST /api/hooks/shiprocket Webhook Security & Idempotency', () => {
    it('rejects webhook request with invalid authentication token with 401', async () => {
      const res = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'unauthorized-token',
        },
        body: JSON.stringify({
          awb: 'SR999000111',
          current_status: 'DELIVERED',
        }),
      })
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.message).toContain('Unauthorized')
    })

    it('rejects empty or non-JSON webhook payload with 400', async () => {
      const res = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.message).toContain('missing')
    })

    it('accepts valid authenticated webhook payload and records tracking event', async () => {
      const res = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          awb: 'SR123456789',
          courier_name: 'Delhivery Botanical Express',
          current_status: 'IN_TRANSIT',
          current_status_id: 18,
          scans: [
            {
              date: new Date().toISOString(),
              activity: 'Dispatched from Pune Hub',
              location: 'Pune',
            },
          ],
        }),
      })
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.status).toBe('SHIPPED')
      expect(body.awb).toBe('SR123456789')
    })

    it('handles duplicate webhook payloads idempotently', async () => {
      const payload = {
        awb: 'SR987654321',
        courier_name: 'BlueDart Surface Delivery',
        current_status: 'DELIVERED',
        current_status_id: 7,
      }

      // First call
      const res1 = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify(payload),
      })
      expect(res1.status).toBe(200)

      // Duplicate second call
      const res2 = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify(payload),
      })
      expect(res2.status).toBe(200)
      const body2 = await res2.json()
      expect(body2.success).toBe(true)
    })
  })

  describe('3. End-to-End Fulfillment Lifecycle: Order -> Shiprocket Fulfillment -> Webhook Delivery', () => {
    let orderId = ''
    let lineItemId = ''
    let fulfillmentId = ''
    let awbCode = ''

    it('step 1: customer places order selecting Shiprocket shipping option', async () => {
      // Create cart
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      const { cart } = await cartRes.json()

      // Add 1 packet of Desi Tomato seeds
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          variant_id: inStockVariantId,
          quantity: 1,
        }),
      })

      // Add Indian delivery address
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: 'fulfillment.lifecycle@glorov.in',
          shipping_address: {
            first_name: 'Ananya',
            last_name: 'Deshmukh',
            address_1: 'Plot 108, Nilgiri Heights',
            city: 'Pune',
            province: 'Maharashtra',
            postal_code: '411001',
            phone: '9876543210',
            country_code: 'in',
          },
        }),
      })

      // Fetch shipping options and pick Shiprocket option
      const optRes = await fetch(
        `${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`,
        { headers: storeHeaders }
      )
      const { shipping_options } = await optRes.json()
      const srOption = shipping_options.find(
        (o: { provider_id: string }) => o.provider_id === 'shiprocket_shiprocket'
      )
      expect(srOption).toBeDefined()
      expect(srOption.amount).toBe(4900) // ₹49

      // Select shipping method
      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ option_id: srOption.id }),
      })

      // Create payment session
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
          body: JSON.stringify({ provider_id: 'pp_system_default' }),
        }
      )

      // Complete cart to generate order
      const completeRes = await fetch(
        `${BACKEND_URL}/store/carts/${cart.id}/complete`,
        {
          method: 'POST',
          headers: storeHeaders,
        }
      )
      expect(completeRes.status).toBe(200)

      const completeData = await completeRes.json()
      expect(completeData.type).toBe('order')
      expect(completeData.order).toBeDefined()

      orderId = completeData.order.id
      lineItemId = completeData.order.items[0].id

      // Verify initial fulfillment status via admin API
      const adminOrderRes = await fetch(
        `${BACKEND_URL}/admin/orders/${orderId}?fields=+fulfillment_status`,
        { headers: adminHeaders }
      )
      const { order: adminOrder } = await adminOrderRes.json()
      expect(adminOrder.fulfillment_status).toBe('not_fulfilled')
    })

    it('step 2: seller reviews order and creates fulfillment using Shiprocket provider', async () => {
      // Admin calls POST /admin/orders/:id/fulfillments
      const fulRes = await fetch(
        `${BACKEND_URL}/admin/orders/${orderId}/fulfillments`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            items: [{ id: lineItemId, quantity: 1 }],
          }),
        }
      )
      expect(fulRes.status).toBe(200)

      // Verify order now contains fulfillment with Shiprocket tracking metadata
      const adminOrderRes = await fetch(
        `${BACKEND_URL}/admin/orders/${orderId}?fields=*fulfillments,*fulfillments.labels`,
        { headers: adminHeaders }
      )
      const { order: adminOrder } = await adminOrderRes.json()

      expect(adminOrder.fulfillments).toHaveLength(1)
      const ful = adminOrder.fulfillments[0]
      fulfillmentId = ful.id

      // Verify Shiprocket provider data was stored
      expect(ful.data).toBeDefined()
      expect(ful.data.shiprocket_order_id).toBeDefined()
      expect(ful.data.shiprocket_shipment_id).toBeDefined()
      expect(ful.data.awb_code).toMatch(/^SR\d+/)
      expect(ful.data.courier_name).toBeDefined()
      expect(ful.data.tracking_url).toContain('https://shiprocket.co/tracking/')
      expect(ful.data.label_url).toBeDefined()

      // Verify labels array
      expect(ful.labels).toHaveLength(1)
      awbCode = ful.labels[0].tracking_number
      expect(awbCode).toBe(ful.data.awb_code)
      expect(ful.labels[0].tracking_url).toContain(awbCode)
    })

    it('step 3: Shiprocket webhook reports DELIVERED status and updates order experience', async () => {
      // Webhook payload from Shiprocket notifying delivery
      const whRes = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          order_id: orderId,
          awb: awbCode,
          courier_name: 'Delhivery Botanical Express',
          current_status: 'DELIVERED',
          current_status_id: 7,
          scans: [
            {
              date: new Date().toISOString(),
              activity: 'Delivered to consignee',
              location: 'Pune',
            },
          ],
        }),
      })
      expect(whRes.status).toBe(200)

      const whBody = await whRes.json()
      expect(whBody.success).toBe(true)
      expect(whBody.status).toBe('DELIVERED')

      // Verify fulfillment was marked as delivered in Medusa
      const checkRes = await fetch(
        `${BACKEND_URL}/admin/orders/${orderId}?fields=*fulfillments,+fulfillment_status`,
        { headers: adminHeaders }
      )
      const { order: updatedOrder } = await checkRes.json()
      expect(updatedOrder.fulfillments[0].delivered_at).toBeDefined()
      expect(updatedOrder.fulfillment_status).toBe('delivered')
    })

    it('step 4: Shiprocket webhook with ONLY awb (no order_id) resolves order and handles duplicate idempotently', async () => {
      const whRes = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          awb: awbCode, // Omit order_id completely to verify AWB-to-Order reverse lookup
          current_status: 'DELIVERED',
          current_status_id: 7,
        }),
      })
      expect(whRes.status).toBe(200)

      const whBody = await whRes.json()
      expect(whBody.success).toBe(true)
      expect(whBody.order_id).toBe(orderId)
      expect(whBody.fulfillment_id).toBe(fulfillmentId)
      expect(whBody.action_taken).toBe('idempotent_skip_already_delivered')
    })

    it('step 5: Shiprocket webhook with CANCELLED status cancels order fulfillment cleanly', async () => {
      // 1. Create a second cart and order to test cancellation flow
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      const { cart } = await cartRes.json()

      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ variant_id: inStockVariantId, quantity: 1 }),
      })

      await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: 'cancel.flow@glorov.in',
          shipping_address: {
            first_name: 'Rohit',
            last_name: 'Verma',
            address_1: 'Plot 7, Nursery Road',
            city: 'Pune',
            province: 'Maharashtra',
            postal_code: '411001',
            phone: '9876543210',
            country_code: 'in',
          },
        }),
      })

      const optRes = await fetch(
        `${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`,
        { headers: storeHeaders }
      )
      const { shipping_options } = await optRes.json()
      const srOption = shipping_options.find(
        (o: { provider_id: string }) => o.provider_id === 'shiprocket_shiprocket'
      )

      await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({ option_id: srOption.id }),
      })

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
          body: JSON.stringify({ provider_id: 'pp_system_default' }),
        }
      )

      const completeRes = await fetch(
        `${BACKEND_URL}/store/carts/${cart.id}/complete`,
        { method: 'POST', headers: storeHeaders }
      )
      const { order: order2 } = await completeRes.json()

      // 2. Admin creates fulfillment for order2
      const fulRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order2.id}/fulfillments`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            items: [{ id: order2.items[0].id, quantity: 1 }],
          }),
        }
      )
      expect(fulRes.status).toBe(200)

      const adminOrderRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order2.id}?fields=*fulfillments`,
        { headers: adminHeaders }
      )
      const { order: adminOrder2 } = await adminOrderRes.json()
      const awb2 = adminOrder2.fulfillments[0].data.awb_code
      expect(awb2).toBeDefined()

      // 3. Webhook sends CANCELLED status for awb2
      const whCancelRes = await fetch(`${BACKEND_URL}/api/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          awb: awb2,
          current_status: 'CANCELLED',
          current_status_id: 8,
        }),
      })
      expect(whCancelRes.status).toBe(200)

      const whCancelBody = await whCancelRes.json()
      expect(whCancelBody.success).toBe(true)
      expect(whCancelBody.action_taken).toBe('cancelled_order_fulfillment')

      // 4. Verify fulfillment is marked canceled in Medusa
      const checkCancelRes = await fetch(
        `${BACKEND_URL}/admin/orders/${order2.id}?fields=*fulfillments`,
        { headers: adminHeaders }
      )
      const { order: finalOrder2 } = await checkCancelRes.json()
      expect(finalOrder2.fulfillments[0].canceled_at).toBeDefined()

      // Clean up order2
      await fetch(`${BACKEND_URL}/admin/orders/${order2.id}/cancel`, {
        method: 'POST',
        headers: adminHeaders,
      })
    })

    afterAll(async () => {
      if (orderId) {
        // Clean up test order
        await fetch(`${BACKEND_URL}/admin/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: adminHeaders,
        })
      }
    })
  })
})
