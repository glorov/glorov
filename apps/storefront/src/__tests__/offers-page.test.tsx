import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OffersPage from '../app/offers/page'
import { CouponVaultInteractive } from '../app/offers/CouponVaultInteractive'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/offers',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Botanical Offers & Coupon Vault Page', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders hero title, breadcrumbs, and trust reassurance cards', () => {
    render(<OffersPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Botanical Offers & Coupon Vault/i })
    ).toBeDefined()

    expect(screen.getByText(/0% Statutory GST/i)).toBeDefined()
    expect(screen.getByText(/48-Hour Live Plant Guarantee/i)).toBeDefined()
    expect(screen.getByText(/Free Express Delivery/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders category filter tabs and all active coupons by default', () => {
    render(<CouponVaultInteractive />)

    // Check tabs
    expect(screen.getByRole('tab', { name: /All Offers/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Sitewide Codes/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /0% GST Seeds/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Live Plants/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /UPI & Bank Offers/i })).toBeDefined()

    // Default: both sitewide and bank codes present
    expect(screen.getByText(/Monsoon Thunder Sale/i)).toBeDefined()
    expect(screen.getByText(/Razorpay UPI Instant Cashback/i)).toBeDefined()
  })

  it('filters coupons when category tab is clicked', () => {
    render(<CouponVaultInteractive />)

    // Click '0% GST Seeds' tab
    const seedsTab = screen.getByRole('tab', { name: /0% GST Seeds/i })
    fireEvent.click(seedsTab)

    // Desi Heirloom Seed Fest should be visible
    expect(screen.getByText(/Desi Heirloom Seed Fest/i)).toBeDefined()
    expect(screen.getByText(/HEIRLOOM20/i)).toBeDefined()

    // Monsoon Thunder Sale should be filtered out
    expect(screen.queryByText(/Monsoon Thunder Sale/i)).toBeNull()
  })

  it('copies coupon code to clipboard and updates button state', async () => {
    render(<CouponVaultInteractive />)

    const copyButtons = screen.getAllByRole('button', { name: /Copy coupon code/i })
    expect(copyButtons.length).toBeGreaterThan(0)

    fireEvent.click(copyButtons[0])

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('THUNDER15')

    await waitFor(() => {
      expect(screen.getByText(/Code Copied!/i)).toBeDefined()
    })
  })
})
