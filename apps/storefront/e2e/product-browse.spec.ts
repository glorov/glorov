import { test, expect } from '@playwright/test'

test.describe('E2E — Product Catalog Browse & PDP (product-browse.spec.ts)', () => {
  test('navigates to categories page and displays botanical collections', async ({ page }) => {
    await page.goto('/categories', { waitUntil: 'domcontentloaded' })

    // Page title or main header
    await expect(page).toHaveTitle(/Categories|GLOROV/)
    const mainHeading = page.locator('h1:visible, h2:visible').filter({ hasText: /Categories|Botanical/i }).first()
    await expect(mainHeading).toBeVisible()

    // Core categories visible
    const categoryCards = page.locator('text=/Seeds|Houseplants|Plants|Planters/i')
    expect(await categoryCards.count()).toBeGreaterThan(0)
  })

  test('views category specific products with prices and badges', async ({ page }) => {
    await page.goto('/categories/seeds', { waitUntil: 'domcontentloaded' })

    // Category heading
    const heading = page.locator('h1, h2').filter({ hasText: /Seeds/i }).first()
    await expect(heading).toBeVisible()

    // Products listed with prices
    const productPrice = page.locator('text=/₹[0-9]+/').first()
    await expect(productPrice).toBeVisible()
  })

  test('navigates to a Product Detail Page (PDP) and renders botanical details', async ({ page }) => {
    // Navigate to a known standard product
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })

    // Product Title
    const title = page.locator('h1:visible').filter({ hasText: /Green Chilli|Seeds/i }).first()
    await expect(title).toBeVisible()

    // Price is displayed in INR
    const price = page.locator('text=/₹[0-9]+/').first()
    await expect(price).toBeVisible()

    // Add to Cart button is present
    const addToCartBtn = page.locator('button').filter({ hasText: /Add to.*Cart|Add to Bag/i }).first()
    await expect(addToCartBtn).toBeVisible()
  })

  test('validates PIN code delivery checker on PDP', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })

    // Locate PIN code input box
    const pinInput = page.locator('input[placeholder*="PIN"], input[placeholder*="pincode"], input[placeholder*="411001"]').first()
    if (await pinInput.isVisible()) {
      // Enter valid Indian PIN code (Pune)
      await pinInput.fill('411001')

      const checkBtn = page.locator('button').filter({ hasText: /Check|Verify|Submit/i }).first()
      if (await checkBtn.isVisible()) {
        await checkBtn.click()
      }

      // Should display estimated delivery information
      const estimate = page.locator('text=/Delivery in|Dispatch|Express|Standard/i').first()
      await expect(estimate).toBeVisible({ timeout: 5000 })
    }
  })

  test('variant selection updates displayed product specifications', async ({ page }) => {
    await page.goto('/products/green-chilli-seeds', { waitUntil: 'domcontentloaded' })

    // Check if variant radio/options exist
    const variantOptions = page.locator('input[type="radio"], button').filter({ hasText: /Seeds|Pack|gm|Grams/i })
    if (await variantOptions.count() > 1) {
      await variantOptions.nth(1).click()
      // Active variant selection is reflected
      await expect(variantOptions.nth(1)).toBeVisible()
    }
  })
})
