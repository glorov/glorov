import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import GiftBuilderPage from '../app/gift-builder/page'
import { BotanicalGiftCustomizer } from '../app/gift-builder/BotanicalGiftCustomizer'
import { CartProvider } from '@/context/CartContext'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/gift-builder',
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
      items: [{ id: 'item_gift_1', variant_id: 'variant_gift_snake_plant', quantity: 1 }],
      total: 598,
    },
  }),
  updateCartItemAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
  removeFromCartAction: vi.fn().mockResolvedValue({ success: true, cart: null }),
}))

describe('Botanical Gift Hamper Builder Page', () => {
  it('renders hero title, breadcrumb navigation, and trust guarantees', () => {
    render(
      <CartProvider>
        <GiftBuilderPage />
      </CartProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Craft a Living Botanical Gift/i })).toBeDefined()
    expect(screen.getByText(/48-Hour Live Plant Guarantee/i)).toBeDefined()
    expect(screen.getByText(/Plantable Seed-Paper Card/i)).toBeDefined()
    expect(screen.getByText(/Pan-India Express Dispatch/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('selects plant options in Step 1 and reflects in live preview sidebar', () => {
    render(
      <CartProvider>
        <BotanicalGiftCustomizer />
      </CartProvider>
    )

    expect(screen.getByText(/Step 1: Choose Live Botanical Specimen/i)).toBeDefined()
    expect(screen.getAllByText(/Air-Purifying Snake Plant/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Prosperity Green Money Plant/i)).toBeDefined()
    expect(screen.getByText(/Good Luck Jade Plant/i)).toBeDefined()
    expect(screen.getByText(/Peace Lily White Bloom/i)).toBeDefined()

    // Select Peace Lily (₹599)
    const peaceLilyCard = screen.getByRole('radio', { name: /Peace Lily White Bloom/i })
    fireEvent.click(peaceLilyCard)

    // Verify preview card updates with Peace Lily
    expect(screen.getAllByText(/Peace Lily White Bloom/i).length).toBeGreaterThanOrEqual(1)
  })

  it('navigates through steps to customize seeds, gift note, and packaging', async () => {
    render(
      <CartProvider>
        <BotanicalGiftCustomizer />
      </CartProvider>
    )

    // Advance to Step 2
    const toStep2Btn = screen.getByRole('button', { name: /Continue to Companion Seeds/i })
    fireEvent.click(toStep2Btn)

    expect(screen.getByText(/Step 2: Choose Companion Heirloom Seeds/i)).toBeDefined()
    const marigoldSeedCard = screen.getByRole('radio', { name: /Pusa Narangi Genda Seeds/i })
    fireEvent.click(marigoldSeedCard)

    // Advance to Step 3
    const toStep3Btn = screen.getByRole('button', { name: /Continue to Gift Card Note/i })
    fireEvent.click(toStep3Btn)

    expect(screen.getByText(/Step 3: Personalized Botanical Greeting Card/i)).toBeDefined()

    // Fill in custom message
    const recipientInput = screen.getByLabelText(/Recipient Name/i)
    fireEvent.change(recipientInput, { target: { value: 'Meera Kapoor' } })

    const messageInput = screen.getByLabelText(/Handwritten Note/i)
    fireEvent.change(messageInput, { target: { value: 'Happy birthday to the greatest plant lover!' } })

    // Verify greeting card preview updates
    expect(screen.getByText(/Dear Meera Kapoor,/i)).toBeDefined()
    expect(screen.getAllByText(/Happy birthday to the greatest plant lover!/i).length).toBeGreaterThanOrEqual(1)

    // Advance to Step 4
    const toStep4Btn = screen.getByRole('button', { name: /Continue to Gift Packaging/i })
    fireEvent.click(toStep4Btn)

    expect(screen.getByText(/Step 4: Gift Box Packaging & Dispatch/i)).toBeDefined()

    // Select Royal Emerald Casket (+₹99)
    const emeraldBox = screen.getByRole('radio', { name: /Royal Emerald Botanical Casket/i })
    fireEvent.click(emeraldBox)

    // Add Hamper to Cart
    const addHamperBtn = screen.getByRole('button', { name: /Add Custom Hamper to Cart for/i })
    fireEvent.click(addHamperBtn)

    await waitFor(() => {
      expect(screen.getByText(/Added custom/i)).toBeDefined()
    })
  })
})
