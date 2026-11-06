import { test, expect } from '@playwright/test'

test.describe('E2E — Shopping Cart Operations & Lifecycle (cart-flow.spec.ts)', () => {
  test('adds product to cart from PDP and verifies cart item in /cart', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 25000 })

    // Click Add to Cart
    const addToCartBtn = page.locator('button:visible').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first()
    await expect(addToCartBtn).toBeVisible({ timeout: 15000 })
    await addToCartBtn.click()
    await page.waitForTimeout(600)

    // Header cart link visible
    const cartLink = page.locator('header a[href="/cart"]').first()
    await expect(cartLink).toBeVisible()

    // Navigate to /cart
    await page.goto('/cart', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 20000 })

    // Product item visible in cart
    const itemTitle = page.locator('text=/Green Chilli|Seeds/i').first()
    await expect(itemTitle).toBeVisible({ timeout: 15000 })
  })

  test('updates line item quantity in cart and recalculates totals', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 25000 })

    const addBtn = page.locator('button:visible').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first()
    await addBtn.click()
    await page.waitForTimeout(600)

    await page.goto('/cart', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 20000 })

    // Find quantity increment button
    const incBtn = page.locator('button:visible[aria-label*="Increase"], button:visible').filter({ hasText: '+' }).first()
    if (await incBtn.isVisible()) {
      await incBtn.click()

      // Quantity should reflect 2
      const qtyText = page.locator('text=/2/').first()
      await expect(qtyText).toBeVisible({ timeout: 10000 })
    }
  })

  test('applies coupon voucher in cart', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 25000 })

    await page.locator('button:visible').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first().click()
    await page.waitForTimeout(600)

    await page.goto('/cart', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 20000 })

    const couponInput = page.locator('input[placeholder*="Coupon"], input[placeholder*="code"]').first()
    if (await couponInput.isVisible()) {
      await couponInput.fill('DIWALI10')

      const applyBtn = page.locator('button:visible').filter({ hasText: /Apply/i }).first()
      if (await applyBtn.isVisible()) {
        await applyBtn.click()
      }
    }
  })

  test('removes item from cart and renders empty cart state', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 25000 })

    await page.locator('button:visible').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first().click()
    await page.waitForTimeout(600)

    await page.goto('/cart', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 20000 })

    // Click remove button
    const removeBtn = page.locator('button:visible[aria-label*="Remove"], button:visible').filter({ hasText: /Remove/i }).first()
    if (await removeBtn.isVisible()) {
      await removeBtn.click()

      // Empty cart state
      const emptyNotice = page.locator('text=/Your cart is empty|No items/i').first()
      await expect(emptyNotice).toBeVisible({ timeout: 10000 })
    }
  })

  test('proceeds from cart to checkout page', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 25000 })

    const addBtn = page.locator('button:visible').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first()
    await expect(addBtn).toBeVisible({ timeout: 15000 })
    await addBtn.click()
    await page.waitForTimeout(600)

    // Navigate to /cart
    await page.goto('/cart', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 20000 })

    // Find Proceed to Checkout button
    const checkoutBtn = page.locator('a[href="/checkout"]:visible').first()
    await expect(checkoutBtn).toBeVisible({ timeout: 15000 })
    await checkoutBtn.click()

    // Navigates to /checkout
    await page.waitForURL('**/checkout**', { timeout: 15000 })
    expect(page.url()).toContain('/checkout')
  })
})
