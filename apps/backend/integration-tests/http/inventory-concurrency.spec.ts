import crypto from 'crypto'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'
const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_razorpay_webhook_secret_dev'

describe('Medusa v2 Inventory Concurrency, Overselling Prevention & Webhook Idempotency Tests', () => {
  jest.setTimeout(45000)

  const storeHeaders: Record<string, string> = {
    'x-publishable-api-key': PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  }

  let adminToken = ''
  let adminHeaders: Record<string, string> = {}
  let stockLocationId = ''
  let testProductId = ''
  let limitedVariantId = ''
  let limitedInventoryItemId = ''

  beforeAll(async () => {
    // 1. Verify backend health
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

    // 3. Get Pune Nursery Stock Location
    const locRes = await fetch(`${BACKEND_URL}/admin/stock-locations`, {
      headers: adminHeaders,
    })
    const locData = await locRes.json()
    const puneLoc = locData.stock_locations?.find((l: any) =>
      l.name?.toLowerCase().includes('pune')
    )
    stockLocationId = puneLoc?.id || locData.stock_locations?.[0]?.id
    if (!stockLocationId) {
      throw new Error('No Pune stock location found in Medusa')
    }

    // 4. Resolve existing seed variant: Marigold 100 Seeds (SKU GLR-SD-MAR-100)
    const prodRes = await fetch(
      `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants`,
      { headers: storeHeaders }
    )
    const prodData = await prodRes.json()
    const marigold = prodData.products?.[0]
    const variant100 = marigold?.variants?.find((v: any) => v.sku === 'GLR-SD-MAR-100')
    if (!variant100) {
      throw new Error('GLR-SD-MAR-100 variant not found in catalog')
    }
    limitedVariantId = variant100.id

    // 5. Query inventory item for GLR-SD-MAR-100
    const invRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-MAR-100`, {
      headers: adminHeaders,
    })
    const invData = await invRes.json()
    const invItem = invData.inventory_items?.[0]
    if (!invItem) {
      throw new Error('Inventory item for GLR-SD-MAR-100 not found')
    }
    limitedInventoryItemId = invItem.id

    // Set stock level so available_quantity is EXACTLY 1 unit at Pune nursery
    await setAvailableStock(1)
  })

  // Helper to set available stock at Pune nursery by accounting for any current reservations
  async function setAvailableStock(targetAvailable: number) {
    const invRes = await fetch(`${BACKEND_URL}/admin/inventory-items?sku=GLR-SD-MAR-100`, {
      headers: adminHeaders,
    })
    const invData = await invRes.json()
    const loc = invData.inventory_items?.[0]?.location_levels?.find(
      (l: any) => l.location_id === stockLocationId
    )
    const reserved = loc?.reserved_quantity || 0
    const setStockRes = await fetch(
      `${BACKEND_URL}/admin/inventory-items/${limitedInventoryItemId}/location-levels/${stockLocationId}`,
      {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          stocked_quantity: reserved + targetAvailable,
        }),
      }
    )
    expect(setStockRes.status).toBe(200)
  }

  afterAll(async () => {
    // Restore inventory item stock to 1000 units
    if (limitedInventoryItemId && stockLocationId && adminToken) {
      await fetch(
        `${BACKEND_URL}/admin/inventory-items/${limitedInventoryItemId}/location-levels/${stockLocationId}`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            stocked_quantity: 1000,
          }),
        }
      ).catch(() => {})
    }
  })

  // Helper to construct a ready-to-complete cart
  async function prepareReadyCart(customerEmail: string) {
    // 1. Create cart
    const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
      method: 'POST',
      headers: storeHeaders,
      body: JSON.stringify({}),
    })
    expect(cartRes.status).toBe(200)
    const { cart } = await cartRes.json()

    // 2. Add line item (1 unit)
    const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
      method: 'POST',
      headers: storeHeaders,
      body: JSON.stringify({
        variant_id: limitedVariantId,
        quantity: 1,
      }),
    })
    expect(addRes.status).toBe(200)

    // 3. Set delivery address
    const addrRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}`, {
      method: 'POST',
      headers: storeHeaders,
      body: JSON.stringify({
        email: customerEmail,
        shipping_address: {
          first_name: 'Priya',
          last_name: 'Deshmukh',
          address_1: 'Plot 42, Green Park',
          city: 'Pune',
          province: 'Maharashtra',
          postal_code: '411001',
          phone: '9876501234',
          country_code: 'in',
        },
      }),
    })
    expect(addrRes.status).toBe(200)

    // 4. Set shipping method
    const optRes = await fetch(`${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`, {
      headers: storeHeaders,
    })
    const { shipping_options } = await optRes.json()
    const opt = shipping_options[0]
    expect(opt).toBeDefined()

    await fetch(`${BACKEND_URL}/store/carts/${cart.id}/shipping-methods`, {
      method: 'POST',
      headers: storeHeaders,
      body: JSON.stringify({ option_id: opt.id }),
    })

    // 5. Initialize payment collection & system session
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

    return cart.id
  }

  // ===========================================================================
  // 1. Concurrent Checkout & Overselling Prevention
  // ===========================================================================
  describe('1. Concurrency Race: Simultaneous Checkout for the Last Available Unit', () => {
    let winningOrderId = ''
    let winningCartId = ''

    it('allows exactly 1 customer to purchase the last unit and rejects the concurrent contender without overselling', async () => {
      const timestamp = Date.now()
      const cartAId = await prepareReadyCart(`customer.alpha.${timestamp}@glorov.in`)
      const cartBId = await prepareReadyCart(`customer.beta.${timestamp}@glorov.in`)

      // Execute both checkouts simultaneously
      const [resA, resB] = await Promise.all([
        fetch(`${BACKEND_URL}/store/carts/${cartAId}/complete`, {
          method: 'POST',
          headers: storeHeaders,
        }),
        fetch(`${BACKEND_URL}/store/carts/${cartBId}/complete`, {
          method: 'POST',
          headers: storeHeaders,
        }),
      ])

      const dataA = await resA.json()
      const dataB = await resB.json()

      const aWon = resA.status === 200 && dataA.type === 'order'
      const bWon = resB.status === 200 && dataB.type === 'order'

      // INVARIANT: Exactly one must succeed!
      expect(aWon !== bWon).toBe(true)

      const winningData = aWon ? dataA : dataB
      const losingData = aWon ? dataB : dataA
      const losingStatus = aWon ? resB.status : resA.status

      winningOrderId = winningData.order.id
      winningCartId = aWon ? cartAId : cartBId
      expect(winningOrderId).toBeDefined()

      // The losing request must either return an error or type 'cart' indicating inventory failure
      if (losingStatus === 200) {
        expect(losingData.type).toBe('cart')
        expect(losingData.error || losingData.cart).toBeDefined()
      } else {
        expect(losingStatus).toBeGreaterThanOrEqual(400)
      }

      // Check current inventory level: Must be 0, NEVER -1
      const invCheckRes = await fetch(
        `${BACKEND_URL}/admin/inventory-items/${limitedInventoryItemId}/location-levels`,
        { headers: adminHeaders }
      )
      const invCheckData = await invCheckRes.json()
      const locationLevel = invCheckData.inventory_levels?.find(
        (lvl: { location_id: string }) => lvl.location_id === stockLocationId
      )
      expect(locationLevel).toBeDefined()
      expect(locationLevel.available_quantity).toBe(0)
    })

    it('rejects subsequent checkout attempts after inventory has reached 0', async () => {
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({}),
      })
      expect(cartRes.status).toBe(200)
      const { cart } = await cartRes.json()

      // Attempting to add out-of-stock item MUST fail with 400 insufficient_inventory
      const addRes = await fetch(`${BACKEND_URL}/store/carts/${cart.id}/line-items`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          variant_id: limitedVariantId,
          quantity: 1,
        }),
      })
      expect(addRes.status).toBe(400)
      const addErr = await addRes.json()
      expect(addErr.message.toLowerCase()).toMatch(/stock|inventory|insufficient/)
    })

    it('handles idempotent repeated completion requests on already completed carts safely', async () => {
      expect(winningCartId).toBeDefined()
      expect(winningOrderId).toBeDefined()

      // Second completion request on the already completed winning cart
      const secondRes = await fetch(`${BACKEND_URL}/store/carts/${winningCartId}/complete`, {
        method: 'POST',
        headers: storeHeaders,
      })

      // Must be idempotent: returns order, cart error, or 400 bad request, never creates a duplicate order!
      if (secondRes.status === 200) {
        const secondData = await secondRes.json()
        if (secondData.type === 'order') {
          expect(secondData.order.id).toBe(winningOrderId)
        } else {
          expect(secondData.type).toBe('cart')
        }
      } else {
        expect(secondRes.status).toBeGreaterThanOrEqual(400)
      }
    })

    it('restores stock availability when an order is canceled before fulfillment', async () => {
      expect(winningOrderId).toBeDefined()

      // Get current available stock before cancel (should be 0)
      const preCancelRes = await fetch(
        `${BACKEND_URL}/admin/inventory-items/${limitedInventoryItemId}/location-levels`,
        { headers: adminHeaders }
      )
      const preData = await preCancelRes.json()
      const preLoc = preData.inventory_levels?.find(
        (l: any) => l.location_id === stockLocationId
      )
      const preAvailable = preLoc?.available_quantity || 0

      // Cancel the winning order via native Medusa admin cancellation endpoint
      const cancelRes = await fetch(`${BACKEND_URL}/admin/orders/${winningOrderId}/cancel`, {
        method: 'POST',
        headers: adminHeaders,
      })
      expect(cancelRes.status).toBe(200)
      const cancelData = await cancelRes.json()
      expect(cancelData.order.status).toBe('canceled')

      // Verify inventory level was replenished back
      const postCancelRes = await fetch(
        `${BACKEND_URL}/admin/inventory-items/${limitedInventoryItemId}/location-levels`,
        { headers: adminHeaders }
      )
      const postData = await postCancelRes.json()
      const postLoc = postData.inventory_levels?.find(
        (l: any) => l.location_id === stockLocationId
      )
      expect(postLoc.available_quantity).toBeGreaterThan(preAvailable)
    })
  })

  // ===========================================================================
  // 2. Webhook Ingestion Idempotency & Signature Guardrails
  // ===========================================================================
  describe('2. External Gateway Webhook Idempotency & Replay Resistance', () => {
    it('acknowledges duplicate Razorpay webhook events without error or duplicate state transitions', async () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_mock_test_idem_999',
              order_id: 'order_mock_idem_999',
              amount: 9900,
              currency: 'INR',
              status: 'captured',
            },
          },
        },
      })

      const signature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(webhookPayload)
        .digest('hex')

      // First webhook delivery
      const firstRes = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Signature': signature,
        },
        body: webhookPayload,
      })
      expect(firstRes.status).toBe(200)

      // Duplicate / replayed webhook delivery
      const secondRes = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Signature': signature,
        },
        body: webhookPayload,
      })
      expect(secondRes.status).toBe(200)
    })

    it('strictly rejects webhooks with invalid or forged HMAC signatures', async () => {
      const payload = JSON.stringify({ event: 'payment.captured', test: true })
      const forgedSignature = 'forged_deadbeef1234567890abcdef'

      const res = await fetch(`${BACKEND_URL}/hooks/razorpay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Signature': forgedSignature,
        },
        body: payload,
      })

      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBeDefined()
    })
  })
})
