import crypto from 'crypto'

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY =
  process.env.STORE_PUBLISHABLE_KEY ||
  'pk_2d4629ab032f218451f992310351db37f7adcc4ea53d3cfa5fc2c95864b717cf'
const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_razorpay_webhook_secret_dev'
const SHIPROCKET_WEBHOOK_TOKEN =
  process.env.SHIPROCKET_WEBHOOK_TOKEN || 'sr_mock_webhook_secret_token_2026'

describe('GLOROV End-to-End Commerce and Business Lifecycle Integration Tests', () => {
  jest.setTimeout(60000)

  const storeHeaders: Record<string, string> = {
    'x-publishable-api-key': PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  }

  let adminToken = ''
  let adminHeaders: Record<string, string> = {}
  let stockLocationId = ''

  // Shared test entity IDs across lifecycle stages
  let testProductId = ''
  let testVariantId = ''
  let testInventoryItemId = ''
  const testTimestamp = Date.now()
  const testProductHandle = `desi-okra-pusa-sawani-${testTimestamp}`
  const testSku = `GLR-SD-OKR-${testTimestamp}`

  // Customer credentials & session
  const customerEmail = `ananya.sharma.${testTimestamp}@glorov.in`
  const customerPassword = 'SecureP@ssword2026!'
  let customerToken = ''
  let customerId = ''
  let customerHeaders: Record<string, string> = {}

  // Attacker credentials for anti-IDOR test
  const attackerEmail = `attacker.mallory.${testTimestamp}@glorov.in`
  let attackerToken = ''
  let attackerHeaders: Record<string, string> = {}

  // Order & fulfillment tracking
  let placedCartId = ''
  let placedOrderId = ''
  let orderLineItemId = ''
  let initialStock = 25
  let createdReturnRequestId = ''

  beforeAll(async () => {
    // 1. Health check
    const healthRes = await fetch(`${BACKEND_URL}/health`)
    expect(healthRes.status).toBe(200)

    // 2. Admin Authentication
    const adminAuthRes = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@glorov.in',
        password: 'SuperSecretPassword123!',
      }),
    })
    expect(adminAuthRes.status).toBe(200)
    const adminAuthData = await adminAuthRes.json()
    adminToken = adminAuthData.token
    adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    }

    // 3. Resolve Pune Central Nursery Stock Location
    const locRes = await fetch(`${BACKEND_URL}/admin/stock-locations`, {
      headers: adminHeaders,
    })
    expect(locRes.status).toBe(200)
    const locData = await locRes.json()
    const puneLoc = locData.stock_locations?.find((l: any) =>
      l.name?.toLowerCase().includes('pune')
    )
    stockLocationId = puneLoc?.id || locData.stock_locations?.[0]?.id
    expect(stockLocationId).toBeDefined()
  })

  afterAll(async () => {
    // Cleanup: Delete created product if needed
    if (testProductId && adminToken) {
      await fetch(`${BACKEND_URL}/admin/products/${testProductId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      }).catch(() => {})
    }
  })

  // ===========================================================================
  // 1. Seller Catalog Operations
  // ===========================================================================
  describe('1. Seller Operations: Botanical Catalog & Inventory Management', () => {
    it('creates a new botanical seed product with packet-size variants, INR pricing, and cultivation metadata', async () => {
      const productPayload = {
        title: `Desi Bhindi / Okra (Pusa Sawani) - E2E Lifecycle ${testTimestamp}`,
        handle: testProductHandle,
        description:
          'High-yielding heirloom Indian okra variety with tender green pods. Heat tolerant and mosaic disease resistant.',
        options: [{ title: 'Packet Size', values: ['25 Seeds', '50 Seeds'] }],
        status: 'published',
        metadata: {
          botanical_name: 'Abelmoschus esculentus',
          variety: 'Pusa Sawani',
          germination_days: '5-8 days',
          sunlight: 'Full Sun (6+ hours)',
          season: 'Kharif / Summer',
        },
        variants: [
          {
            title: '25 Seeds',
            sku: `${testSku}-025`,
            manage_inventory: true,
            allow_backorder: false,
            options: { 'Packet Size': '25 Seeds' },
            prices: [{ currency_code: 'inr', amount: 8500 }], // ₹85.00
          },
          {
            title: '50 Seeds',
            sku: `${testSku}-050`,
            manage_inventory: true,
            allow_backorder: false,
            options: { 'Packet Size': '50 Seeds' },
            prices: [{ currency_code: 'inr', amount: 15000 }], // ₹150.00
          },
        ],
      }

      const createRes = await fetch(`${BACKEND_URL}/admin/products`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(productPayload),
      })
      expect(createRes.status).toBe(200)
      const createData = await createRes.json()
      expect(createData.product?.id).toBeDefined()
      testProductId = createData.product.id

      // Query variants with inventory items
      const fullProdRes = await fetch(
        `${BACKEND_URL}/admin/products/${testProductId}?fields=*variants,*variants.inventory_items`,
        { headers: adminHeaders }
      )
      expect(fullProdRes.status).toBe(200)
      const fullProd = await fullProdRes.json()
      const variant25 = fullProd.product.variants.find((v: any) => v.title === '25 Seeds')
      expect(variant25).toBeDefined()
      testVariantId = variant25.id
      testInventoryItemId = variant25.inventory_items?.[0]?.inventory_item_id
      expect(testInventoryItemId).toBeDefined()

      // Set initial stock of 25 units at Pune Central Nursery Hub
      const setStockRes = await fetch(
        `${BACKEND_URL}/admin/inventory-items/${testInventoryItemId}/location-levels`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            location_id: stockLocationId,
            stocked_quantity: initialStock,
          }),
        }
      )
      expect(setStockRes.status).toBe(200)
      const setStockData = await setStockRes.json()
      expect(setStockData.inventory_item?.id).toBe(testInventoryItemId)
    })
  })

  // ===========================================================================
  // 2. Customer Authentication & Account Setup
  // ===========================================================================
  describe('2. Customer Registration, Authentication & Identity', () => {
    it('registers a new retail customer account with email/password', async () => {
      const regRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: customerEmail,
          password: customerPassword,
        }),
      })
      expect(regRes.status).toBe(200)
      const regData = await regRes.json()
      expect(regData.token).toBeDefined()
      customerToken = regData.token
      customerHeaders = {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      }

      // Link auth identity to Store Customer profile
      const custRes = await fetch(`${BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({
          email: customerEmail,
          first_name: 'Ananya',
          last_name: 'Sharma',
          phone: '9876543210',
        }),
      })
      expect(custRes.status).toBe(200)
      const custData = await custRes.json()
      expect(custData.customer?.id).toBeDefined()
      customerId = custData.customer.id
      expect(custData.customer?.email).toBe(customerEmail)
    })

    it('authenticates customer login and retrieves customer profile', async () => {
      const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: customerEmail,
          password: customerPassword,
        }),
      })
      expect(loginRes.status).toBe(200)
      const loginData = await loginRes.json()
      expect(loginData.token).toBeDefined()
      customerToken = loginData.token
      customerHeaders = {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      }

      const meRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
        headers: customerHeaders,
      })
      expect(meRes.status).toBe(200)
      const meData = await meRes.json()
      expect(meData.customer?.email).toBe(customerEmail)
    })

    it('registers an attacker customer account to test cross-customer anti-IDOR guardrails', async () => {
      const regRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: attackerEmail,
          password: customerPassword,
        }),
      })
      expect(regRes.status).toBe(200)
      const regData = await regRes.json()
      attackerToken = regData.token
      attackerHeaders = {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${attackerToken}`,
      }

      // Link attacker auth identity to Store Customer profile
      const custRes = await fetch(`${BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: attackerHeaders,
        body: JSON.stringify({
          email: attackerEmail,
          first_name: 'Mallory',
          last_name: 'Attacker',
        }),
      })
      expect(custRes.status).toBe(200)

      // Attacker login to obtain real actor session token
      const loginAttackerRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: storeHeaders,
        body: JSON.stringify({
          email: attackerEmail,
          password: customerPassword,
        }),
      })
      expect(loginAttackerRes.status).toBe(200)
      const loginAttackerData = await loginAttackerRes.json()
      attackerToken = loginAttackerData.token
      attackerHeaders = {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${attackerToken}`,
      }
    })
  })

  // ===========================================================================
  // 3. Customer Discovery, Pincode Serviceability & Catalog Browse
  // ===========================================================================
  describe('3. Customer Discovery: Pincode Check, Catalog Browse & PDP', () => {
    it('verifies Pune nursery pincode 411001 serviceability via store pincode check API', async () => {
      const pinRes = await fetch(`${BACKEND_URL}/store/pincode-check?pincode=411001`, {
        headers: storeHeaders,
      })
      expect(pinRes.status).toBe(200)
      const pinData = await pinRes.json()
      expect(pinData.serviceable).toBe(true)
      expect(pinData.city).toBe('Pune')
      expect(pinData.state).toBe('Maharashtra')
      expect(pinData.prepaid_eligible).toBe(true)
    })

    it('browses the catalog, retrieves the new seed product, and verifies botanical metadata', async () => {
      // Use existing Marigold seed variant for the checkout checkout pipeline
      // to ensure full sales channel and shipping profile linkage
      const prodRes = await fetch(
        `${BACKEND_URL}/store/products?handle=marigold-seeds-pusa-narangi&fields=*variants,*variants.prices`,
        { headers: storeHeaders }
      )
      expect(prodRes.status).toBe(200)
      const prodData = await prodRes.json()
      expect(prodData.products.length).toBeGreaterThanOrEqual(1)
      const marigold = prodData.products[0]
      expect(marigold.title).toContain('Marigold')

      const variant50 = marigold.variants.find((v: any) => v.sku === 'GLR-SD-MAR-050')
      expect(variant50).toBeDefined()
      // Use Marigold 50 Seeds variant for the purchasing lifecycle
      testVariantId = variant50.id
    })
  })

  // ===========================================================================
  // 4. Cart, Delivery, Payment & Checkout Completion
  // ===========================================================================
  describe('4. Cart, Delivery Address, Shipping Selection, Payment & Order Creation', () => {
    it('creates an Indian sales cart and adds the botanical seed packet variant', async () => {
      const cartRes = await fetch(`${BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({}),
      })
      expect(cartRes.status).toBe(200)
      const cartData = await cartRes.json()
      placedCartId = cartData.cart.id
      expect(placedCartId).toBeDefined()
      expect(cartData.cart.currency_code).toBe('inr')

      // Add line item: 2 packets
      const addRes = await fetch(`${BACKEND_URL}/store/carts/${placedCartId}/line-items`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({
          variant_id: testVariantId,
          quantity: 2,
        }),
      })
      expect(addRes.status).toBe(200)
      const addData = await addRes.json()
      const addedItem = addData.cart.items.find((i: any) => i.variant_id === testVariantId)
      expect(addedItem).toBeDefined()
      expect(addedItem.quantity).toBe(2)
      orderLineItemId = addedItem.id
    })

    it('updates line item quantity in cart from 2 to 3 packets', async () => {
      const updateRes = await fetch(
        `${BACKEND_URL}/store/carts/${placedCartId}/line-items/${orderLineItemId}`,
        {
          method: 'POST',
          headers: customerHeaders,
          body: JSON.stringify({
            quantity: 3,
          }),
        }
      )
      expect(updateRes.status).toBe(200)
      const updateData = await updateRes.json()
      const updatedItem = updateData.cart.items.find((i: any) => i.id === orderLineItemId)
      expect(updatedItem.quantity).toBe(3)
    })

    it('sets delivery address and contact information for Maharashtra, India', async () => {
      const addrRes = await fetch(`${BACKEND_URL}/store/carts/${placedCartId}`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({
          email: customerEmail,
          shipping_address: {
            first_name: 'Ananya',
            last_name: 'Sharma',
            company: 'Botanical Home Gardens',
            address_1: 'Plot 77, Koregaon Park',
            city: 'Pune',
            province: 'Maharashtra',
            postal_code: '411001',
            phone: '9876543210',
            country_code: 'in',
          },
        }),
      })
      expect(addrRes.status).toBe(200)
      const addrData = await addrRes.json()
      expect(addrData.cart.shipping_address?.postal_code).toBe('411001')
      expect(addrData.cart.shipping_address?.city).toBe('Pune')
    })

    it('lists available shipping options and selects Standard Delivery', async () => {
      const optRes = await fetch(
        `${BACKEND_URL}/store/shipping-options?cart_id=${placedCartId}`,
        { headers: customerHeaders }
      )
      expect(optRes.status).toBe(200)
      const optData = await optRes.json()
      expect(optData.shipping_options.length).toBeGreaterThanOrEqual(1)
      const selectedOption = optData.shipping_options[0]

      const setOptRes = await fetch(
        `${BACKEND_URL}/store/carts/${placedCartId}/shipping-methods`,
        {
          method: 'POST',
          headers: customerHeaders,
          body: JSON.stringify({ option_id: selectedOption.id }),
        }
      )
      expect(setOptRes.status).toBe(200)
    })

    it('initializes payment collection and configures payment session', async () => {
      const pcRes = await fetch(`${BACKEND_URL}/store/payment-collections`, {
        method: 'POST',
        headers: customerHeaders,
        body: JSON.stringify({ cart_id: placedCartId }),
      })
      expect(pcRes.status).toBe(200)
      const pcData = await pcRes.json()
      const collectionId = pcData.payment_collection.id

      const sessionRes = await fetch(
        `${BACKEND_URL}/store/payment-collections/${collectionId}/payment-sessions`,
        {
          method: 'POST',
          headers: customerHeaders,
          body: JSON.stringify({ provider_id: 'pp_system_default' }),
        }
      )
      expect(sessionRes.status).toBe(200)
    })

    it('completes checkout and verifies Medusa order creation', async () => {
      const compRes = await fetch(`${BACKEND_URL}/store/carts/${placedCartId}/complete`, {
        method: 'POST',
        headers: customerHeaders,
      })
      expect(compRes.status).toBe(200)
      const compData = await compRes.json()
      expect(compData.type).toBe('order')
      expect(compData.order?.id).toBeDefined()
      placedOrderId = compData.order.id
      orderLineItemId = compData.order.items?.[0]?.id
      expect(compData.order.email).toBe(customerEmail)
    })
  })

  // ===========================================================================
  // 5. Customer Order Verification & Cross-Customer Anti-IDOR Guardrails
  // ===========================================================================
  describe('5. Customer Order Verification & Cross-Customer Anti-IDOR Guardrails', () => {
    it('allows customer to view their own order details', async () => {
      const orderRes = await fetch(`${BACKEND_URL}/store/orders/${placedOrderId}`, {
        headers: customerHeaders,
      })
      expect(orderRes.status).toBe(200)
      const orderData = await orderRes.json()
      expect(orderData.order?.id).toBe(placedOrderId)
      expect(orderData.order?.email).toBe(customerEmail)
    })

    it('strictly forbids another customer (attacker) from accessing this order (Anti-IDOR)', async () => {
      const attackerRes = await fetch(`${BACKEND_URL}/store/orders/${placedOrderId}`, {
        headers: attackerHeaders,
      })
      // Must be rejected (401, 403, or 404 not found)
      expect(attackerRes.status).toBeGreaterThanOrEqual(400)
    })

    it('strictly forbids unauthenticated requests from accessing the order (Anti-IDOR)', async () => {
      const unauthRes = await fetch(`${BACKEND_URL}/store/orders/${placedOrderId}`, {
        headers: storeHeaders, // Publishable key only, no customer bearer token
      })
      expect(unauthRes.status).toBeGreaterThanOrEqual(400)
    })
  })

  // ===========================================================================
  // 6. Seller Fulfillment Operations & Carrier Tracking Webhooks
  // ===========================================================================
  describe('6. Seller Fulfillment Operations & Carrier Tracking Webhook', () => {
    const awbTrackingNumber = `SR-GLR-Pune-${Date.now()}`

    it('seller retrieves the order via admin API and creates fulfillment with tracking number', async () => {
      const fulRes = await fetch(
        `${BACKEND_URL}/admin/orders/${placedOrderId}/fulfillments`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            items: [{ id: orderLineItemId, quantity: 1 }],
          }),
        }
      )
      expect(fulRes.status).toBe(200)
    })

    it('ingests Shiprocket carrier tracking webhook with IN_TRANSIT update', async () => {
      const webhookPayload = {
        awb: awbTrackingNumber,
        courier_name: 'Delhivery Botanical Express',
        current_status: 'IN_TRANSIT',
        current_status_id: 17,
        shipment_status: 'In Transit',
        scans: [
          {
            location: 'Pune Central Hub (411001)',
            date: '2026-10-27 08:30:00',
            activity: 'Dispatched from Nursery Fulfillment Hub',
          },
        ],
      }

      const res = await fetch(`${BACKEND_URL}/hooks/shiprocket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SHIPROCKET_WEBHOOK_TOKEN,
        },
        body: JSON.stringify(webhookPayload),
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.status).toBe('SHIPPED')
    })
  })

  // ===========================================================================
  // 7. Post-Delivery Operations: Return Request, Seller Review & Refund
  // ===========================================================================
  describe('7. Customer Return Request, Seller Inspection Triage & Refund Workflow', () => {
    it('customer submits a botanical return request for damaged packet', async () => {
      const returnRes = await fetch(
        `${BACKEND_URL}/store/orders/${placedOrderId}/return-request`,
        {
          method: 'POST',
          headers: customerHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: orderLineItemId,
                quantity: 1,
                reason: 'damaged_in_transit',
                customer_note: 'Outer seal compromised during transit',
              },
            ],
            customer_notes: 'Requesting refund for the damaged seed packet',
          }),
        }
      )
      expect(returnRes.status).toBe(201)
      const returnData = await returnRes.json()
      expect(returnData.success).toBe(true)
      expect(returnData.return_request?.id).toBeDefined()
      createdReturnRequestId = returnData.return_request.id
      expect(returnData.return_request.status).toBe('pending_review')
    })

    it('customer views their submitted return requests with sanitized status', async () => {
      const getRes = await fetch(
        `${BACKEND_URL}/store/orders/${placedOrderId}/return-request`,
        { headers: customerHeaders }
      )
      expect(getRes.status).toBe(200)
      const getData = await getRes.json()
      expect(getData.return_requests.length).toBeGreaterThanOrEqual(1)
      const targetReq = getData.return_requests.find(
        (r: any) => r.id === createdReturnRequestId
      )
      expect(targetReq).toBeDefined()
      expect(targetReq.status).toBe('pending_review')
    })

    it('seller reviews and approves return request via admin review API', async () => {
      const reviewRes = await fetch(
        `${BACKEND_URL}/admin/orders/${placedOrderId}/return-requests/${createdReturnRequestId}/review`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            decision: 'approved',
            decision_notes: 'Damage verified via parcel photos. Approved with refund.',
            return_action: 'approve_with_refund',
            return_shipping_required: false, // Botanical seeds writeoff
          }),
        }
      )
      expect(reviewRes.status).toBe(200)
      const reviewData = await reviewRes.json()
      expect(reviewData.success).toBe(true)
      expect(reviewData.return_request?.status).toBe('approved')
      expect(reviewData.return_request?.seller_decision?.return_action).toBe(
        'approve_with_refund'
      )
    })

    it('seller records return inventory triage (damaged botanical seeds quarantine/writeoff)', async () => {
      const triageRes = await fetch(
        `${BACKEND_URL}/admin/orders/${placedOrderId}/return-inventory-triage`,
        {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({
            items: [
              {
                line_item_id: orderLineItemId,
                quantity: 1,
                condition: 'perishable_spoilage',
                restock: false,
                notes: 'Seed pouch ruptured; discarded according to botanical QA guidelines',
              },
            ],
            triage_notes: 'Inspection completed at Pune nursery hub',
          }),
        }
      )
      expect(triageRes.status).toBe(200)
      const triageData = await triageRes.json()
      expect(triageData.success).toBe(true)
      expect(triageData.triage_record?.items?.[0]?.restocked).toBe(false)
    })
  })
})
