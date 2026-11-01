import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SubscriptionsPage from '../app/subscriptions/page'
import { SubscriptionPlanPicker } from '../app/subscriptions/SubscriptionPlanPicker'
import { CartProvider } from '@/context/CartContext'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/subscriptions',
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
      items: [{ id: 'item_1', variant_id: 'variant_sub_indoor_sanctuary_3m', quantity: 1 }],
      total: 2157,
    },
  }),
  updateCartItemAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
  removeFromCartAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
}))

describe('Green Routine Subscription Page', () => {
  it('renders hero title, value propositions, and breadcrumb navigation', () => {
    render(
      <CartProvider>
        <SubscriptionsPage />
      </CartProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /A Living Botanical Ritual Delivered Monthly/i })).toBeDefined()
    expect(screen.getByText(/25-Acre Nursery Fresh/i)).toBeDefined()
    expect(screen.getByText(/48-Hour Live Guarantee/i)).toBeDefined()
    expect(screen.getByText(/100% Organic & 0% GST/i)).toBeDefined()
    expect(screen.getByText(/Free VIP Plant Doctor/i)).toBeDefined()

    // Breadcrumb navigation
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders all 3 subscription plans in the plan picker', () => {
    render(
      <CartProvider>
        <SubscriptionPlanPicker />
      </CartProvider>
    )

    expect(screen.getByRole('heading', { level: 3, name: 'The Indoor Sanctuary Box' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'Desi Kitchen Sowing Club' })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: 'Exotic & Rare Collector Box' })).toBeDefined()
    expect(screen.getByText(/Most Loved/i)).toBeDefined()
  })

  it('dynamically recalculates prices and discounts when duration tab is switched', () => {
    render(
      <CartProvider>
        <SubscriptionPlanPicker />
      </CartProvider>
    )

    // Default duration is 3 Months (10% discount) -> ₹799 becomes ₹719
    expect(screen.getByText('719')).toBeDefined()
    expect(screen.getByText(/SAVE 10%/i)).toBeDefined()

    // Switch to 1 Month -> standard ₹799
    const oneMonthBtn = screen.getByRole('tab', { name: /1 Month \(Monthly Billed\)/i })
    fireEvent.click(oneMonthBtn)
    expect(screen.getByText('799')).toBeDefined()

    // Switch to 6 Months (20% discount) -> ₹799 becomes ₹639
    const sixMonthsBtn = screen.getByRole('tab', { name: /6 Months Pre-Paid/i })
    fireEvent.click(sixMonthsBtn)
    expect(screen.getByText('639')).toBeDefined()
    expect(screen.getByText(/SAVE 20%/i)).toBeDefined()
  })

  it('selects a different plan and adds to cart with feedback', async () => {
    render(
      <CartProvider>
        <SubscriptionPlanPicker />
      </CartProvider>
    )

    // Select "Desi Kitchen Sowing Club"
    const kitchenPlanCard = screen.getByRole('radio', { name: /Desi Kitchen Sowing Club/i })
    fireEvent.click(kitchenPlanCard)

    // Verify summary updates
    expect(screen.getByText(/Desi Kitchen Sowing Club • 3-Month Ritual/i)).toBeDefined()

    // Click subscribe button
    const subscribeBtn = screen.getByRole('button', {
      name: /Subscribe to Desi Kitchen Sowing Club for 3 months/i,
    })
    fireEvent.click(subscribeBtn)

    // Verify status feedback message
    await waitFor(() => {
      expect(screen.getByText(/Added Desi Kitchen Sowing Club/i)).toBeDefined()
    })
  })

  it('renders the unboxing journey and FAQ items on page', () => {
    render(
      <CartProvider>
        <SubscriptionsPage />
      </CartProvider>
    )

    expect(screen.getByRole('heading', { level: 2, name: /The Monthly Unboxing Journey/i })).toBeDefined()
    expect(screen.getByText(/Moisture-Shield Crating/i)).toBeDefined()
    expect(screen.getByText(/How do you ensure living plants survive interstate transit\?/i)).toBeDefined()
    expect(screen.getByText(/Can I pause, skip, or cancel my botanical subscription\?/i)).toBeDefined()
  })
})
