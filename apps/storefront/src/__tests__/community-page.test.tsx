import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CommunityPage from '../app/community/page'
import { CommunityGallery } from '../app/community/CommunityGallery'
import { CartProvider } from '@/context/CartContext'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/community',
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
      items: [{ id: 'item_community_1', variant_id: 'variant_monstera_std', quantity: 1 }],
      total: 699,
    },
  }),
  updateCartItemAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
  removeFromCartAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
}))

describe('Botanical Community Gallery & Customer Stories Page', () => {
  it('renders hero title, breadcrumb navigation, and community trust stats', () => {
    render(
      <CartProvider>
        <CommunityPage />
      </CartProvider>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /India's Botanical Community & Thriving Sanctuaries/i })
    ).toBeDefined()

    // Trust stat cards
    expect(screen.getByText(/100,000\+/i)).toBeDefined()
    expect(screen.getByText(/Plant Parents Thriving Nationwide/i)).toBeDefined()
    expect(screen.getByText(/500\+/i)).toBeDefined()
    expect(screen.getByText(/98\.4%/i)).toBeDefined()
    expect(screen.getByText(/0% GST/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders filter tabs and filters stories by botanical room setting', () => {
    render(
      <CartProvider>
        <CommunityGallery />
      </CartProvider>
    )

    // All tabs exist
    expect(screen.getByRole('tab', { name: /All Stories/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Living Room/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Balcony Garden/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Work Desk/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Kitchen Garden/i })).toBeDefined()

    // Initially Ananya Roy (living_room) and Rohan & Preeti Deshmukh (balcony) are both present
    expect(screen.getByText(/Ananya Roy/i)).toBeDefined()
    expect(screen.getByText(/Rohan & Preeti Deshmukh/i)).toBeDefined()

    // Click 'Balcony Garden' tab
    fireEvent.click(screen.getByRole('tab', { name: /Balcony Garden/i }))

    // Rohan & Preeti Deshmukh and Kartik & Shruti Iyer should remain visible
    expect(screen.getByText(/Rohan & Preeti Deshmukh/i)).toBeDefined()
    expect(screen.getByText(/Kartik & Shruti Iyer/i)).toBeDefined()

    // Ananya Roy (living room) should be filtered out
    expect(screen.queryByText(/Ananya Roy/i)).toBeNull()
  })

  it('supports "Shop This Look" specimen add-to-cart action', async () => {
    render(
      <CartProvider>
        <CommunityGallery />
      </CartProvider>
    )

    const shopButtons = screen.getAllByRole('button', { name: /Shop/i })
    expect(shopButtons.length).toBeGreaterThan(0)

    fireEvent.click(shopButtons[0])

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Shop/i }).length).toBeGreaterThan(0)
    })
  })

  it('opens story submission modal, submits story, and shows ₹100 seed voucher', async () => {
    render(
      <CartProvider>
        <CommunityGallery />
      </CartProvider>
    )

    // Click trigger button
    const shareBtn = screen.getByRole('button', { name: /Share Your Plant Story/i })
    fireEvent.click(shareBtn)

    // Modal is open
    expect(screen.getByRole('heading', { level: 3, name: /Share Your Botanical Journey/i })).toBeDefined()

    // Fill form
    const nameInput = screen.getByLabelText(/Your Name \*/i)
    const locationInput = screen.getByLabelText(/City & State \*/i)
    const plantInput = screen.getByLabelText(/Living Plant Specimen \*/i)
    const storyInput = screen.getByLabelText(/Your Plant Care Story \*/i)

    fireEvent.change(nameInput, { target: { value: 'Kavita Sundaram' } })
    fireEvent.change(locationInput, { target: { value: 'Hyderabad, Telangana' } })
    fireEvent.change(plantInput, { target: { value: 'Fiddle Leaf Fig' } })
    fireEvent.change(storyInput, {
      target: {
        value: 'This Fiddle Leaf Fig has grown 2 feet in 12 months under morning Hyderabad sunlight! Super healthy foliage.',
      },
    })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Story & Claim ₹100 Voucher/i })
    fireEvent.click(submitBtn)

    // Voucher receipt displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /Story Submitted Successfully!/i })).toBeDefined()
      expect(screen.getByText(/GREEN-PARENT-100/i)).toBeDefined()
      expect(screen.getByText(/Kavita Sundaram/i)).toBeDefined()
    })

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Back to Community Gallery/i })
    fireEvent.click(closeBtn)

    // Modal closed
    expect(screen.queryByText(/Story Submitted Successfully!/i)).toBeNull()
  })
})
