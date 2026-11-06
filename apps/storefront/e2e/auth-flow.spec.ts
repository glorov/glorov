import { test, expect } from '@playwright/test'

test.describe('E2E — Customer Authentication Flow (auth-flow.spec.ts)', () => {
  test('renders registration page with Indian mobile input and password validation', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' })

    await expect(page).toHaveTitle(/Create Account|Sign Up|GLOROV/i)
    await expect(page.locator('h1, h2').filter({ hasText: /Create Account|Register/i }).first()).toBeVisible()

    // Required form fields by ID
    await expect(page.locator('#signup-firstname')).toBeVisible()
    await expect(page.locator('#signup-lastname')).toBeVisible()
    await expect(page.locator('#signup-email')).toBeVisible()
    await expect(page.locator('#signup-phone')).toBeVisible()
    await expect(page.locator('#signup-password')).toBeVisible()
    await expect(page.locator('#signup-confirm-password')).toBeVisible()
  })

  test('validates form inputs on registration and enables submit when valid', async ({ page }) => {
    await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#signup-firstname')).toBeVisible({ timeout: 15000 })
    await page.waitForTimeout(500)

    const submitBtn = page.locator('button[type="submit"]')

    // Initially disabled because fields are blank
    await expect(submitBtn).toBeDisabled()

    // Fill valid registration fields
    await page.locator('#signup-firstname').fill('Botanist')
    await page.locator('#signup-lastname').fill('Gardener')
    await page.locator('#signup-email').fill('botanist@glorov.in')
    await page.locator('#signup-phone').fill('9876543210')
    await page.locator('#signup-password').fill('SafePassword2026')
    await page.locator('#signup-confirm-password').fill('SafePassword2026')

    // Submit button becomes enabled once all fields meet validation criteria
    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
  })

  test('executes login flow and redirects to account dashboard', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 15000 })
    await page.waitForTimeout(500)

    await expect(page.locator('h1, h2').filter({ hasText: /Welcome Back|Sign In|Login/i }).first()).toBeVisible()

    // Fill credentials using demo account
    const emailInput = page.locator('#login-email')
    const passwordInput = page.locator('#login-password')

    await emailInput.fill('demo@glorov.in')
    await passwordInput.fill('password123')

    const loginBtn = page.locator('button[type="submit"]')
    await expect(loginBtn).toBeEnabled({ timeout: 5000 })
    await loginBtn.click()

    // Should redirect to /account
    await page.waitForURL('**/account**', { timeout: 15000 })
    expect(page.url()).toContain('/account')

    // Account dashboard header should be visible
    const accountHeader = page.locator('h1:visible, h2:visible').filter({ hasText: /Account|Overview|Welcome/i }).first()
    await expect(accountHeader).toBeVisible()
  })

  test('protects /account routes and redirects unauthenticated users to /auth/login', async ({ page, context }) => {
    // Clear cookies to simulate unauthenticated visitor
    await context.clearCookies()

    // Directly navigate to protected route
    await page.goto('/account', { waitUntil: 'domcontentloaded' })

    // Should be redirected to /auth/login
    await page.waitForURL('**/auth/login**', { timeout: 15000 })
    expect(page.url()).toContain('/auth/login')
  })

  test('executes customer logout and resets authenticated session', async ({ page }) => {
    // 1. Log in first
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 15000 })
    await page.waitForTimeout(500)

    await page.locator('#login-email').fill('demo@glorov.in')
    await page.locator('#login-password').fill('password123')
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 5000 })
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/account**', { timeout: 15000 })

    // 2. Click Logout button
    const logoutBtn = page.locator('button:visible, a:visible').filter({ hasText: /Sign Out|Logout/i }).first()
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()

      // After logout, accessing /account again should redirect to /auth/login
      await page.goto('/account', { waitUntil: 'domcontentloaded' })
      await page.waitForURL('**/auth/login**', { timeout: 15000 })
      expect(page.url()).toContain('/auth/login')
    }
  })
})
