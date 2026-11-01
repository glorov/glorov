import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SowingCalendarPage from '../app/sowing-calendar/page'
import { InteractiveSowingMatrix } from '../app/sowing-calendar/InteractiveSowingMatrix'
import { CartProvider } from '@/context/CartContext'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/sowing-calendar',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock cart-actions
vi.mock('@/lib/cart-actions', () => ({
  getOrInitializeCartAction: vi.fn().mockResolvedValue({
    success: true,
    cart: { id: 'cart_test_123', items: [], total: 0 },
  }),
  addToCartAction: vi.fn().mockResolvedValue({
    success: true,
    cart: {
      id: 'cart_test_123',
      items: [{ id: 'item_seed_1', variant_id: 'variant_palak_rabi', quantity: 1 }],
      total: 99,
    },
  }),
  updateCartItemAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
  removeFromCartAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
}))

describe('Indian Botanical Sowing Calendar Page', () => {
  it('renders hero title, season cards, and breadcrumb navigation', () => {
    render(
      <CartProvider>
        <SowingCalendarPage />
      </CartProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Indian Botanical Sowing Calendar/i })).toBeDefined()
    expect(screen.getByText(/Kharif Season/i)).toBeDefined()
    expect(screen.getByText(/Rabi Season/i)).toBeDefined()
    expect(screen.getByText(/Zaid Season/i)).toBeDefined()
    expect(screen.getAllByText(/Active Season/i).length).toBeGreaterThanOrEqual(1)

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders region selector and month tabs in the interactive matrix', () => {
    render(
      <CartProvider>
        <InteractiveSowingMatrix />
      </CartProvider>
    )

    expect(screen.getByText(/Western Deccan \(MH, GJ, Goa\)/i)).toBeDefined()
    expect(screen.getByText(/Northern Plains \(Delhi, PB, UP, HR\)/i)).toBeDefined()
    expect(screen.getByText(/Southern Tropical \(KA, TN, KL, AP\)/i)).toBeDefined()
    expect(screen.getByText(/Eastern & Coastal \(WB, OD, AS\)/i)).toBeDefined()

    // Month tabs
    expect(screen.getByRole('tab', { name: /Oct/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Jan/i })).toBeDefined()
  })

  it('filters seeds by month and category, rendering accurate vital stats', () => {
    render(
      <CartProvider>
        <InteractiveSowingMatrix />
      </CartProvider>
    )

    // Select October month tab
    const octTab = screen.getByRole('tab', { name: /Oct/i })
    fireEvent.click(octTab)

    // Verify Rabi varieties are visible
    expect(screen.getByText(/Desi All-Green Palak/i)).toBeDefined()
    expect(screen.getByText(/Kasuri Methi \(Fenugreek\)/i)).toBeDefined()
    expect(screen.getAllByText(/0% GST \(HSN 1209\)/i).length).toBeGreaterThanOrEqual(1)

    // Filter by "Medicinal Herbs"
    const herbsBtn = screen.getByRole('tab', { name: /Medicinal Herbs/i })
    fireEvent.click(herbsBtn)

    expect(screen.getByText(/Kasuri Methi \(Fenugreek\)/i)).toBeDefined()
    expect(screen.queryByText(/Desi All-Green Palak/i)).toBeNull()
  })

  it('adds seed variety to cart with interactive button feedback', async () => {
    render(
      <CartProvider>
        <InteractiveSowingMatrix />
      </CartProvider>
    )

    // Select October month tab
    const octTab = screen.getByRole('tab', { name: /Oct/i })
    fireEvent.click(octTab)

    // Click Add Seeds for Palak
    const addPalakBtn = screen.getByRole('button', {
      name: /Add Desi All-Green Palak seeds to cart for ₹99/i,
    })
    fireEvent.click(addPalakBtn)

    // Verify feedback state
    await waitFor(() => {
      expect(screen.getByText(/Added!/i)).toBeDefined()
    })
  })

  it('renders statutory 0% GST seed guarantee banner', () => {
    render(
      <CartProvider>
        <SowingCalendarPage />
      </CartProvider>
    )

    expect(screen.getByRole('heading', { level: 3, name: /85%\+ Germination Certified Seeds/i })).toBeDefined()
    expect(screen.getByText(/Explore All Desi Seeds Catalog →/i)).toBeDefined()
  })
})
