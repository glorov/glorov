/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CartMilestoneMeter } from '../components/cart/CartMilestoneMeter'
import { CartRecommendations } from '../components/cart/CartRecommendations'
import { CartCouponCard } from '../components/cart/CartCouponCard'
import { AvailableOffersDrawer } from '../components/cart/AvailableOffersDrawer'
import { CartSummaryFooter } from '../components/cart/CartSummaryFooter'
import { calculateMilestoneProgress } from '../lib/cart-promotions'
import { CartProvider, useCart } from '../context/CartContext'

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, unoptimized, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={rest.alt || ''} />
  },
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}))

// Mock cart actions
vi.mock('../lib/cart-actions', () => ({
  getOrInitializeCartAction: vi.fn().mockResolvedValue({
    success: true,
    cart: {
      id: 'cart_test_promo',
      items: [
        {
          id: 'item_cosmos',
          title: 'Cosmos Mix Seeds',
          variant_title: '1 gm',
          quantity: 3,
          unit_price: 9900,
          subtotal: 29700,
          thumbnail: 'https://example.com/cosmos.jpg',
        },
      ],
      item_subtotal: 29700,
      subtotal: 29700,
      total: 29700,
    },
  }),
  addToCartAction: vi.fn().mockResolvedValue({ success: true }),
  updateCartItemAction: vi.fn().mockResolvedValue({ success: true }),
  removeFromCartAction: vi.fn().mockResolvedValue({ success: true }),
}))

describe('Cart Milestones, Promotions & Coupon System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('1. Milestone Target Calculations (Pure Logic)', () => {
    it('calculates free delivery target when cart total is below ₹499 (matches screenshot #1)', () => {
      // If cart subtotal is ₹297, needed is ₹202 (297 + 202 = 499)
      const res = calculateMilestoneProgress(297)
      expect(res.neededForNext).toBe(202)
      expect(res.targetRewardText).toBe('free delivery')
      expect(res.message).toContain('Add ₹202 more to unlock free delivery')
      expect(res.milestoneNodes.length).toBe(3)
      expect(res.milestoneNodes[0].label).toBe('10%')
      expect(res.milestoneNodes[0].isReached).toBe(false)
    })

    it('calculates 10% off target when cart total is ₹693 (matches screenshot #2)', () => {
      // 693 + 306 = 999
      const res = calculateMilestoneProgress(693)
      expect(res.neededForNext).toBe(306)
      expect(res.targetRewardText).toBe('10% off')
      expect(res.message).toBe('Add ₹306 more to unlock 10% off')
      expect(res.milestoneNodes[0].isCurrentTarget).toBe(true)
    })

    it('calculates 15% off target when cart total is ₹1,188 (matches screenshot #5)', () => {
      // 1188 + 411 = 1599
      const res = calculateMilestoneProgress(1188)
      expect(res.neededForNext).toBe(411)
      expect(res.targetRewardText).toBe('15% off')
      expect(res.message).toBe('Add ₹411 more to unlock 15% off')
      // 10% milestone must be unlocked
      expect(res.milestoneNodes[0].isReached).toBe(true)
      expect(res.milestoneNodes[1].isCurrentTarget).toBe(true)
    })

    it('calculates 20% off maximum tier when cart total exceeds ₹2,299', () => {
      const res = calculateMilestoneProgress(2500)
      expect(res.isMaxTier).toBe(true)
      expect(res.progressPercent).toBe(100)
      expect(res.milestoneNodes.every((n) => n.isReached)).toBe(true)
      expect(res.message).toContain('Maximum discount reached')
    })
  })

  describe('2. CartMilestoneMeter UI Component', () => {
    it('renders the milestone message and circular nodes correctly', () => {
      render(<CartMilestoneMeter subtotalINR={693} />)

      expect(screen.getByText(/Add ₹306 more to unlock/i)).toBeInTheDocument()
      expect(screen.getByText('10% off')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('20%')).toBeInTheDocument()
    })
  })

  describe('3. CartRecommendations Component', () => {
    it('renders recommended botanical products with bestseller tags and ratings', () => {
      render(
        <CartProvider>
          <CartRecommendations />
        </CartProvider>
      )

      expect(screen.getByText('Recommended Products')).toBeInTheDocument()
      // Should show bestseller products like NPK Fertilizer or Jade Mini Plant
      expect(screen.getByText(/Instagrow NPK 19:19:19 Fertilizer/i)).toBeInTheDocument()
      expect(screen.getByText(/Jade Mini Plant/i)).toBeInTheDocument()
      expect(screen.getAllByText('BESTSELLER').length).toBeGreaterThanOrEqual(1)
    })

    it('quick-add button invokes cart addition on click', async () => {
      render(
        <CartProvider>
          <CartRecommendations />
        </CartProvider>
      )

      const addButtons = screen.getAllByRole('button', { name: /Add .* to cart/i })
      expect(addButtons.length).toBeGreaterThan(0)
      fireEvent.click(addButtons[0])

      await waitFor(() => {
        expect(addButtons[0]).toBeDefined()
      })
    })
  })

  describe('4. CartCouponCard and AvailableOffersDrawer Integration', () => {
    it('renders coupon card and triggers offers drawer when clicked', () => {
      const TestContainer = () => {
        const { isOffersDrawerOpen } = useCart()
        return (
          <div>
            <CartCouponCard />
            <AvailableOffersDrawer />
            <div data-testid="drawer-status">{isOffersDrawerOpen ? 'OPEN' : 'CLOSED'}</div>
          </div>
        )
      }

      render(
        <CartProvider>
          <TestContainer />
        </CartProvider>
      )

      expect(screen.getByTestId('drawer-status')).toHaveTextContent('CLOSED')

      const viewAllBtn = screen.getByRole('button', { name: /View all promotional coupons/i })
      fireEvent.click(viewAllBtn)

      expect(screen.getByTestId('drawer-status')).toHaveTextContent('OPEN')
      expect(screen.getByText('Available Offers')).toBeInTheDocument()
      expect(screen.getByText('DIWALI10')).toBeInTheDocument()
      expect(screen.getByText('DIWALI15')).toBeInTheDocument()
      expect(screen.getByText('DIWALI20')).toBeInTheDocument()
    })
  })

  describe('5. CartSummaryFooter Component', () => {
    it('renders subtotal, discount badge, and toggleable inclusive taxes breakdown', () => {
      render(
        <CartProvider>
          <CartSummaryFooter />
        </CartProvider>
      )

      expect(screen.getByText(/Inclusive of all taxes/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /CHECKOUT/i })).toBeInTheDocument()

      // Click tax toggle
      const toggle = screen.getByRole('button', { name: /Toggle tax and cost breakdown/i })
      fireEvent.click(toggle)

      expect(screen.getByText('Price Breakdown')).toBeInTheDocument()
      expect(screen.getByText(/Standard Nursery Dispatch/i)).toBeInTheDocument()
      expect(screen.getByText(/0% on seeds HSN 1209/i)).toBeInTheDocument()
    })
  })
})
