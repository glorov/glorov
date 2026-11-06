import { test, expect } from '@playwright/test'

test.describe('E2E — Full Checkout with Cash on Delivery (checkout-flow.spec.ts)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Intercept payment gateway calls (Razorpay checkout.js & api calls)
    await page.route('https://checkout.razorpay.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: 'window.Razorpay = function() { return { open: () => {}, on: () => {} }; };',
      })
    })

    await page.route('https://api.razorpay.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'rzp_mock_order_123', status: 'created' }),
      })
    })

    // 2. Intercept Medusa catalog products for variant resolution
    await page.route('**/store/products**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [{ id: 'prod_e2e_1', variants: [{ id: 'variant_e2e_1' }] }],
          product: { id: 'prod_e2e_1', variants: [{ id: 'variant_e2e_1' }] },
        }),
      })
    })

    // 3. Intercept shipping options
    await page.route('**/store/shipping-options**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          shipping_options: [
            { id: 'so_std_01', name: 'Standard Botanical Delivery', amount: 9900 },
            { id: 'so_exp_01', name: 'Express Climate-Controlled Delivery', amount: 14900 },
          ],
        }),
      })
    })

    // 4. Intercept Medusa v2 commerce endpoints for deterministic E2E test runs
    await page.route('**/store/carts**', async (route) => {
      const req = route.request()
      const method = req.method()
      const url = req.url()

      if (url.includes('/complete')) {
        // Step 6: Complete Medusa cart
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'order',
            order: {
              id: 'ord_medusa_e2e_999',
              display_id: 1042,
              status: 'pending',
              fulfillment_status: 'not_fulfilled',
              payment_status: 'authorized',
              currency_code: 'inr',
              total: 29700,
              subtotal: 19800,
              discount_total: 0,
              shipping_total: 9900,
              email: 'siddharth@example.com',
              created_at: new Date().toISOString(),
              shipping_address: {
                first_name: 'Siddharth',
                last_name: 'Rao',
                phone: '9876543210',
                address_1: 'Flat 301, Palm Grove Apartments',
                city: 'Bengaluru',
                province: 'Karnataka',
                postal_code: '560038',
                country_code: 'in',
              },
              items: [
                {
                  id: 'item_e2e_01',
                  title: 'Green Chilli Seeds (Heirloom)',
                  quantity: 2,
                  unit_price: 9900,
                  thumbnail: 'https://res.cloudinary.com/naodmm8w/image/upload/chilli.png',
                },
              ],
            },
          }),
        })
      }

      if (url.includes('/shipping-methods')) {
        // Step 2: Set shipping method
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            cart: {
              id: 'cart_medusa_e2e_123',
              shipping_methods: [{ id: 'sm_std_01', amount: 9900 }],
            },
          }),
        })
      }

      if (method === 'POST') {
        // Step 1: Create Medusa cart
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            cart: {
              id: 'cart_medusa_e2e_123',
              currency_code: 'inr',
              total: 19800,
              subtotal: 19800,
              items: [
                {
                  id: 'item_e2e_01',
                  title: 'Green Chilli Seeds (Heirloom)',
                  quantity: 2,
                  unit_price: 9900,
                  thumbnail: 'https://res.cloudinary.com/naodmm8w/image/upload/chilli.png',
                },
              ],
            },
          }),
        })
      }

      // Default GET cart
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cart: {
            id: 'cart_medusa_e2e_123',
            currency_code: 'inr',
            total: 19800,
            subtotal: 19800,
            items: [],
          },
        }),
      })
    })

    // 3. Intercept Medusa payment-collections and payment-sessions
    await page.route('**/store/payment-collections**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          payment_collection: {
            id: 'pay_col_e2e_123',
            payment_sessions: [
              {
                id: 'ps_cod_e2e_123',
                provider_id: 'pp_cod_cod',
                status: 'authorized',
                amount: 29700,
              },
            ],
          },
        }),
      })
    })

    // 5. Intercept fetchMedusaOrder
    await page.route('**/store/orders/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          order: {
            id: 'ord_medusa_e2e_999',
            display_id: 1042,
            status: 'pending',
            fulfillment_status: 'not_fulfilled',
            payment_status: 'authorized',
            currency_code: 'inr',
            total: 29700,
            subtotal: 19800,
            discount_total: 0,
            shipping_total: 9900,
            email: 'siddharth@example.com',
            created_at: new Date().toISOString(),
            shipping_address: {
              first_name: 'Siddharth',
              last_name: 'Rao',
              phone: '9876543210',
              address_1: 'Flat 301, Palm Grove Apartments',
              city: 'Bengaluru',
              province: 'Karnataka',
              postal_code: '560038',
              country_code: 'in',
            },
            items: [
              {
                id: 'item_e2e_01',
                title: 'Green Chilli Seeds (Heirloom)',
                quantity: 2,
                unit_price: 9900,
                thumbnail: 'https://res.cloudinary.com/naodmm8w/image/upload/chilli.png',
              },
            ],
          },
        }),
      })
    })
  })

  test('completes full checkout journey with Cash on Delivery (COD) and verifies order confirmation', async ({ page }) => {
    // 1. Add product to cart from PDP
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 25000 })
    const addBtn = page.locator('button:visible').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first()
    await addBtn.click()
    await page.waitForTimeout(600)

    // 2. Navigate to Checkout page
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveTitle(/Checkout|GLOROV/i)

    // Verify Order Summary displays
    const orderSummary = page.locator('text=/Order Summary/i').first()
    await expect(orderSummary).toBeVisible({ timeout: 15000 })

    // 3. Select Cash on Delivery (COD) Payment Method
    const codRadio = page.locator('button[role="radio"]').filter({ hasText: /Cash on Delivery|COD/i }).first()
    if (await codRadio.isVisible()) {
      await codRadio.click()
    }

    // 4. Click "Confirm & Place Order"
    const placeOrderBtn = page.locator('button:visible').filter({ hasText: /Confirm & Place Order|Place Order/i }).first()
    await expect(placeOrderBtn).toBeEnabled({ timeout: 10000 })
    await placeOrderBtn.click()

    // 5. Verify navigation to Order Confirmation page with real order ID
    await page.waitForURL('**/order/confirmation**', { timeout: 15000 })
    expect(page.url()).toContain('/order/confirmation')

    // 6. Verify Order Confirmation receipt details
    const confirmationHeading = page.locator('h1').first()
    await expect(confirmationHeading).toBeVisible({ timeout: 10000 })
    await expect(confirmationHeading).toContainText('Thank you')

    const confirmedBadge = page.locator('text=/Payment & Order Confirmed|Order Confirmed/i').first()
    await expect(confirmedBadge).toBeVisible()

    // Order receipt contains COD payment method
    const paymentMethodBadge = page.locator('text=/Cash on Delivery|COD/i').first()
    await expect(paymentMethodBadge).toBeVisible()
  })
})
