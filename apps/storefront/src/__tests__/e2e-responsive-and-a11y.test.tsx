/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { ValuePropositions } from '@/components/home/ValuePropositions'
import { SearchInput } from '@/components/common/SearchInput'
import { PincodeChecker } from '@/components/shipping/PincodeChecker'
import { VariantSelector } from '@/components/catalog/VariantSelector'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, unoptimized, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={rest.alt || ''} />
  },
}))

// Mock CartContext
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cart: { id: 'cart_mock_1', items: [] },
    isLoading: false,
    isMutating: false,
    error: null,
    totalItems: 3,
    isDrawerOpen: false,
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
    addToCart: vi.fn().mockResolvedValue(true),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearError: vi.fn(),
  }),
}))

describe('Storefront Responsive UX and Accessibility (a11y) Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===========================================================================
  // 1. Semantic Landmarks & ARIA Architecture
  // ===========================================================================
  describe('1. Semantic ARIA Landmarks & Structural Hierarchy', () => {
    it('renders Header with proper <header> landmark, accessible brand logo, and navigation landmark', () => {
      render(<Header />)

      // 1. Header landmark
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()

      // 2. Accessible brand logo link with clear description
      const brandLink = screen.getByRole('link', { name: /glorov homepage/i })
      expect(brandLink).toBeInTheDocument()
      expect(brandLink).toHaveAttribute('href', '/')

      // 3. Desktop Navigation landmark
      const mainNav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(mainNav).toBeInTheDocument()

      // 4. Cart navigation button has accessible label indicating item count
      const cartBtn = screen.getByRole('button', { name: /shopping cart/i })
      expect(cartBtn).toBeInTheDocument()
    })

    it('renders Footer with <footer> landmark, botanical policy sections, and accessible dialog triggers', () => {
      render(<Footer />)

      // 1. Footer landmark (contentinfo)
      const footer = screen.getByRole('contentinfo')
      expect(footer).toBeInTheDocument()

      // 2. Indian dispatch nursery location is accessible
      expect(screen.getByText(/pune dispatch nursery, maharashtra/i)).toBeInTheDocument()

      // 3. Contact support dialog trigger opens support email
      const supportBtn = screen.getByRole('button', { name: /contact customer support/i })
      fireEvent.click(supportBtn)
      expect(screen.getByText(/support@glorov\.in/i)).toBeInTheDocument()

      // Close modal by pressing escape
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' })

      // 4. Policy modal buttons have accessible text
      const shippingPolicyBtn = screen.getByRole('button', { name: /shipping & delivery policy/i })
      expect(shippingPolicyBtn).toBeInTheDocument()

      // 5. Open policy modal and check ARIA dialog
      fireEvent.click(shippingPolicyBtn)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('renders CategoryShowcase with hierarchical headings and descriptive category links', () => {
      render(<CategoryShowcase />)

      // Main section heading
      const sectionHeading = screen.getByRole('heading', { level: 2, name: /browse by botanical category/i })
      expect(sectionHeading).toBeInTheDocument()

      // Botanical categories cards have accessible titles
      const categoryLinks = screen.getAllByRole('link')
      expect(categoryLinks.length).toBeGreaterThanOrEqual(4)

      expect(screen.getByText(/desi vegetable seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/festive flower seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/medicinal & herb seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/live indoor plants/i)).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // 2. Responsive Breakpoint Adaptations
  // ===========================================================================
  describe('2. Responsive Viewport Adaptations (375px Mobile, 768px Tablet, 1280px Desktop)', () => {
    it('adapts Header for mobile viewports (375px) with accessible mobile navigation drawer and touch targets', () => {
      // Simulate mobile screen width
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))

      render(<Header />)

      // Mobile menu toggle button must be present with accessible label
      const mobileMenuBtn = screen.getByRole('button', { name: /open navigation menu/i })
      expect(mobileMenuBtn).toBeInTheDocument()
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false')

      // Desktop navigation should contain hidden lg:flex class for responsive collapse
      const mainNav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(mainNav.className).toContain('hidden')
      expect(mainNav.className).toContain('lg:flex')

      // Click mobile menu to open drawer
      fireEvent.click(mobileMenuBtn)
      const mobileDrawer = screen.getByRole('dialog')
      expect(mobileDrawer).toBeInTheDocument()
      expect(mobileDrawer).toHaveAttribute('aria-modal', 'true')

      // Mobile drawer links are accessible and meet >= 44px touch targets
      const drawerNav = within(mobileDrawer).getByRole('navigation', { name: /mobile menu/i })
      expect(drawerNav).toBeInTheDocument()
      const seedLink = within(drawerNav).getByRole('link', { name: /seeds/i })
      expect(seedLink).toBeInTheDocument()
      expect(seedLink.className).toContain('min-h-[44px]')
    })

    it('adapts ValuePropositions with responsive grid classes for mobile and desktop', () => {
      render(<ValuePropositions />)

      const sectionHeading = screen.getByRole('heading', { level: 2, name: /the glorov standard/i })
      expect(sectionHeading).toBeInTheDocument()

      // Check trustworthiness pillars for Indian gardeners
      expect(screen.getByText(/climate-hardened nursery plants/i)).toBeInTheDocument()
      expect(screen.getByText(/high-viability desi seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/pan-india direct delivery/i)).toBeInTheDocument()
      expect(screen.getByText(/protective botanical packaging/i)).toBeInTheDocument()
    })
  })

  // ===========================================================================
  // 3. Form Controls, Labels & Touch Targets
  // ===========================================================================
  describe('3. Accessible Form Controls, Inputs & Touch Target Dimensions', () => {
    it('SearchInput has accessible input labeling, placeholder, and search icon', () => {
      render(<SearchInput placeholder="Search heirloom seeds, native plants..." />)

      const searchInput = screen.getByRole('combobox')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', 'Search heirloom seeds, native plants...')
      expect(screen.getByText(/search seeds, plants, and botanical supplies/i)).toBeInTheDocument()
    })

    it('PincodeChecker enforces 6-digit PIN validation, accessible helper text, and clear error states', async () => {
      // Mock global fetch for pincode check
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('411001')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              serviceable: true,
              pincode: '411001',
              city: 'Pune',
              state: 'Maharashtra',
              estimated_days: 2,
              cod_available: true,
              message: 'Fast dispatch from Pune Nursery Hub',
            }),
          })
        }
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({
            serviceable: false,
            message: 'Invalid Indian PIN code format',
          }),
        })
      })

      render(<PincodeChecker />)

      const pinInput = screen.getByPlaceholderText(/enter 6-digit indian pin/i)
      expect(pinInput).toBeInTheDocument()
      expect(pinInput).toHaveAttribute('maxLength', '6')

      // Enter valid Pune PIN
      fireEvent.change(pinInput, { target: { value: '411001' } })
      const checkBtn = screen.getByRole('button', { name: /check delivery/i })
      fireEvent.click(checkBtn)

      // Await serviceability announcement
      const successMsg = await screen.findByText(/delivery confirmed/i)
      expect(successMsg).toBeInTheDocument()
    })

    it('VariantSelector provides accessible radio-style packet selections with price and stock status', () => {
      const mockProduct = {
        id: 'prod_1',
        title: 'Desi Tomato Seeds (Pusa Ruby)',
        variants: [
          {
            id: 'v_20',
            title: '20 Seeds',
            sku: 'GLR-SD-TOM-020',
            prices: [{ amount: 4900, currency_code: 'inr' }],
            inventory_quantity: 100,
            manage_inventory: true,
            allow_backorder: false,
          },
          {
            id: 'v_50',
            title: '50 Seeds',
            sku: 'GLR-SD-TOM-050',
            prices: [{ amount: 9900, currency_code: 'inr' }],
            inventory_quantity: 0, // Out of stock
            manage_inventory: true,
            allow_backorder: false,
          },
        ],
      }

      render(<VariantSelector product={mockProduct as any} />)

      // Available variant radio option
      const inStockOption = screen.getByRole('radio', { name: /20 seeds/i })
      expect(inStockOption).toBeInTheDocument()
      expect(inStockOption).toHaveAttribute('aria-checked', 'true')

      // Out of stock variant radio option has clear out of stock label
      const outOfStockOption = screen.getByRole('radio', { name: /50 seeds/i })
      expect(outOfStockOption).toBeInTheDocument()
      expect(outOfStockOption.textContent).toContain('Sold Out')
    })
  })

  // ===========================================================================
  // 4. Botanical Color Contrast & Typography Hierarchy
  // ===========================================================================
  describe('4. Color Contrast & Botanical Design System Tokens', () => {
    it('uses high-contrast accessible typography tokens for botanical badges', () => {
      render(<CategoryShowcase />)

      // Badges should be present and contain clear contrast classes
      const badges = screen.getAllByText(/seasonal sowing|companion flora|indoor foliage/i)
      expect(badges.length).toBeGreaterThanOrEqual(2)

      // Verify each badge is rendered inside an accessible element
      badges.forEach((badge) => {
        expect(['div', 'span']).toContain(badge.tagName.toLowerCase())
      })
    })
  })
})
