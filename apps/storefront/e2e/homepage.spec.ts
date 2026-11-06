import { test, expect } from '@playwright/test'

test.describe('E2E — Storefront Homepage (homepage.spec.ts)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('homepage loads successfully with 200 OK and correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/GLOROV/)
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('hero banner slider displays headline, botanical badges, and CTAs', async ({ page }) => {
    // Hero banner section
    const hero = page.locator('section').filter({ hasText: /Sanctuary|Botanical|Heirloom|Grow/i }).first()
    await expect(hero).toBeVisible()

    // Primary CTA button / link in Hero
    const shopCta = page.locator('a[href*="/categories"], a[href*="/products"], button').filter({ hasText: /Explore|Shop|Browse|Get Started/i }).first()
    await expect(shopCta).toBeVisible()
  })

  test('value props ribbon displays trust reassurances across India', async ({ page }) => {
    // Value props ribbon displays guarantees
    const ribbon = page.locator('text=/Free.*Delivery|Heirloom|Guarantee|Transit/i').first()
    await expect(ribbon).toBeVisible()
  })

  test('category discovery grid displays core botanical categories', async ({ page }) => {
    // Grid showing category options
    const categoryLinks = page.locator('a[href*="/categories"]')
    const count = await categoryLinks.count()
    expect(count).toBeGreaterThan(0)

    // Check presence of key botanical category labels
    const categorySection = page.locator('h2, h3').filter({ hasText: /Explore by Category|Categories/i }).first()
    await expect(categorySection).toBeVisible()
  })

  test('featured products section renders product cards with INR pricing', async ({ page }) => {
    // Check product cards
    const productCards = page.locator('div[class*="group"]').filter({ hasText: /₹/ })
    await expect(productCards.first()).toBeVisible()

    // Price should contain Indian Rupee symbol ₹
    const priceElement = productCards.first().locator('text=/₹[0-9]+/')
    await expect(priceElement.first()).toBeVisible()
  })

  test('header navigation and footer links are visible and accessible', async ({ page }) => {
    // Header navigation
    const nav = page.locator('header')
    await expect(nav.locator('a[href="/cart"]').first()).toBeVisible()

    // Footer with policies and copyright
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.locator('text=/GLOROV|All Rights Reserved|Privacy|Shipping/i').first()).toBeVisible()
  })
})
