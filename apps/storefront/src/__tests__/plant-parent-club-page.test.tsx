import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlantParentClubPage from '../app/plant-parent-club/page'
import { RewardsClubInteractive } from '../app/plant-parent-club/RewardsClubInteractive'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/plant-parent-club',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Plant Parent Rewards Club Page', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders hero title, breadcrumb navigation, and join CTAs', () => {
    render(<PlantParentClubPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Glorov Plant Parent Club™/i })).toBeDefined()
    expect(screen.getByText(/Join the Club — Get 200 Free Coins/i)).toBeDefined()
    expect(screen.getByText(/Sign In to Check Balance/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders all 4 earning mechanism cards', () => {
    render(<PlantParentClubPage />)

    expect(screen.getByText(/Shop Plants & Seeds/i)).toBeDefined()
    expect(screen.getByText(/Plant Birthday Gift/i)).toBeDefined()
    expect(screen.getByText(/Review with Photo/i)).toBeDefined()
    expect(screen.getByText(/Refer Garden Friends/i)).toBeDefined()
    expect(screen.getByText(/5 Coins \/ ₹100/i)).toBeDefined()
  })

  it('renders all 3 membership tiers with perks', () => {
    render(<PlantParentClubPage />)

    expect(screen.getByRole('heading', { level: 3, name: /Sprout Parent/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Sapling Steward/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Banyan Elder/i })).toBeDefined()

    expect(screen.getByText(/Most Popular/i)).toBeDefined()
    expect(screen.getByText(/Free Air Courier/i)).toBeDefined()
    expect(screen.getByText(/VIP WhatsApp teleconsult with Dr\. Ramesh Patil/i)).toBeDefined()
  })

  it('interactively updates voucher discounts when clicking preset coin buttons', () => {
    render(<RewardsClubInteractive />)

    // Default preset is 500 coins -> ₹100 OFF
    expect(screen.getByText(/₹100 OFF/i)).toBeDefined()
    expect(screen.getByText(/SEED-REWARD-100/i)).toBeDefined()

    // Click 1000 Coins preset button
    const btn1000 = screen.getByRole('button', { name: /1000 Coins/i })
    fireEvent.click(btn1000)

    expect(screen.getByText(/₹250 OFF/i)).toBeDefined()
    expect(screen.getByText(/SEED-REWARD-250/i)).toBeDefined()

    // Click 2000 Coins preset button
    const btn2000 = screen.getByRole('button', { name: /2000 Coins/i })
    fireEvent.click(btn2000)

    expect(screen.getByText(/₹600 OFF/i)).toBeDefined()
    expect(screen.getByText(/SEED-REWARD-600/i)).toBeDefined()
  })

  it('supports copying voucher code and referral invite link', async () => {
    render(<RewardsClubInteractive />)

    // Copy Voucher Code
    const copyVoucherBtn = screen.getByRole('button', { name: /Copy Voucher Code/i })
    fireEvent.click(copyVoucherBtn)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SEED-REWARD-100')

    await waitFor(() => {
      expect(screen.getByText(/Code Copied to Clipboard!/i)).toBeDefined()
      expect(screen.getByText(/Paste this code at checkout/i)).toBeDefined()
    })

    // Copy Referral Link
    const copyReferralBtn = screen.getByRole('button', { name: /Copy Referral Link/i })
    fireEvent.click(copyReferralBtn)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://glorov.in/?ref=GREENFRIEND')

    await waitFor(() => {
      expect(screen.getByText(/Link Copied!/i)).toBeDefined()
    })
  })
})
