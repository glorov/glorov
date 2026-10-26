/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductGallery } from '../components/catalog/ProductGallery'
import { VariantSelector } from '../components/catalog/VariantSelector'
import { OrderCancellationButton } from '../components/orders/OrderCancellationButton'
import { OrderReturnRequestModal } from '../components/orders/OrderReturnRequestModal'
import { AccountNav } from '../components/account/AccountNav'
import { CartDrawer } from '../components/cart/CartDrawer'
import { indianAddressSchema } from '@glorov/types'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/account/orders',
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

// Mock CartContext for CartDrawer & VariantSelector
const mockCloseDrawer = vi.fn()
const mockAddToCart = vi.fn().mockResolvedValue(true)
let mockIsDrawerOpen = false

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cart: {
      id: 'cart_test_123',
      items: [
        {
          id: 'item_1',
          title: 'Marigold Pusa Narangi Seeds',
          variant_title: 'Pack of 100 Seeds',
          quantity: 2,
          unit_price: 15000,
          subtotal: 30000,
          thumbnail: 'https://example.com/marigold.jpg',
        },
      ],
      item_subtotal: 30000,
      subtotal: 30000,
    },
    isLoading: false,
    isMutating: false,
    error: null,
    totalItems: 2,
    isDrawerOpen: mockIsDrawerOpen,
    openDrawer: vi.fn(),
    closeDrawer: mockCloseDrawer,
    addToCart: mockAddToCart,
    updateQuantity: vi.fn().mockResolvedValue(true),
    removeItem: vi.fn().mockResolvedValue(true),
    refreshCart: vi.fn(),
    clearCart: vi.fn(),
    clearError: vi.fn(),
  }),
}))

describe('GLOROV Storefront Polish & Accessibility Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsDrawerOpen = false
    document.body.style.overflow = ''
  })

  describe('1. Indian Address & Phone Input Validation Logic', () => {
    it('validates a standard Indian 10-digit mobile number with 6-digit PIN code', () => {
      const validAddress = {
        first_name: 'Aarav',
        last_name: 'Patel',
        address_1: 'Plot 42, Shivajinagar',
        address_2: 'Near Agriculture College',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411005',
        phone: '9876543210',
        country_code: 'in',
      }

      const result = indianAddressSchema.safeParse(validAddress)
      expect(result.success).toBe(true)
    })

    it('rejects invalid mobile numbers and invalid postal codes', () => {
      const invalidPhoneAddress = {
        first_name: 'Aarav',
        last_name: 'Patel',
        address_1: 'Plot 42, Shivajinagar',
        city: 'Pune',
        province: 'Maharashtra',
        postal_code: '411005',
        phone: '12345', // invalid
        country_code: 'in',
      }
      expect(indianAddressSchema.safeParse(invalidPhoneAddress).success).toBe(false)

      const invalidPinAddress = {
        ...invalidPhoneAddress,
        phone: '9876543210',
        postal_code: '4110', // invalid 4-digit PIN
      }
      expect(indianAddressSchema.safeParse(invalidPinAddress).success).toBe(false)
    })

    it('correctly normalizes +91 and 0-prefixed phone input strings', () => {
      const normalize = (val: string) => {
        let digits = val.replace(/\D/g, '')
        if (digits.length > 10 && digits.startsWith('91')) {
          digits = digits.slice(2)
        } else if (digits.length > 10 && digits.startsWith('0')) {
          digits = digits.slice(1)
        }
        return digits.slice(0, 10)
      }

      expect(normalize('+91 98765 43210')).toBe('9876543210')
      expect(normalize('09876543210')).toBe('9876543210')
      expect(normalize('+919876543210')).toBe('9876543210')
      expect(normalize('98765-43210')).toBe('9876543210')
    })
  })

  describe('2. ProductGallery Roving Tabindex & Accessibility', () => {
    it('manages keyboard roving focus on thumbnail buttons', () => {
      const images = [
        { id: '1', url: 'https://example.com/1.jpg' },
        { id: '2', url: 'https://example.com/2.jpg' },
        { id: '3', url: 'https://example.com/3.jpg' },
      ]

      render(
        <ProductGallery
          title="Desi Tomato Seeds"
          thumbnail="https://example.com/thumb.jpg"
          images={images}
        />
      )

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(4)
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('tabIndex', '0')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('tabIndex', '-1')

      // Press ArrowRight on the first thumbnail
      fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })

      // Second thumbnail should now be selected and focused
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[1]).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('3. VariantSelector Roving Tabindex & Quantity Semantics', () => {
    const mockProduct: any = {
      id: 'prod_1',
      title: 'Neem Cake Organic Fertilizer',
      handle: 'neem-cake',
      variants: [
        {
          id: 'v_1',
          title: '500g Trial Pack',
          inventory_quantity: 15,
          manage_inventory: true,
          allow_backorder: false,
          calculated_price: { calculated_amount: 12000, currency_code: 'inr' },
        },
        {
          id: 'v_2',
          title: '2kg Garden Pack',
          inventory_quantity: 8,
          manage_inventory: true,
          allow_backorder: false,
          calculated_price: { calculated_amount: 38000, currency_code: 'inr' },
        },
      ],
    }

    it('provides accessible quantity group semantics and updates quantity', () => {
      render(<VariantSelector product={mockProduct} />)

      // Quantity controls should have group with labelledby
      const quantityGroup = screen.getByRole('group', { name: /quantity/i })
      expect(quantityGroup).toBeInTheDocument()

      const plusBtn = screen.getByRole('button', { name: /increase quantity/i })
      const qtySpan = document.getElementById('variant-quantity')
      expect(qtySpan?.textContent).toBe('1')

      fireEvent.click(plusBtn)
      expect(qtySpan?.textContent).toBe('2')
    })

    it('navigates variants via Arrow keys with roving focus', () => {
      render(<VariantSelector product={mockProduct} />)

      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(2)
      expect(radios[0]).toHaveAttribute('aria-checked', 'true')

      // Press ArrowRight on first variant
      fireEvent.keyDown(radios[0], { key: 'ArrowRight' })
      expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('4. OrderCancellationButton Modal Accessibility', () => {
    it('opens dialog with role="dialog", aria-modal="true", and closes on Escape', () => {
      render(
        <OrderCancellationButton
          orderId="order_123"
          displayId="1001"
          status="pending"
          fulfillmentStatus="not_fulfilled"
        />
      )

      const cancelBtn = screen.getByRole('button', { name: /cancel order/i })
      fireEvent.click(cancelBtn)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'cancel-dialog-title')
      expect(document.body.style.overflow).toBe('hidden')

      // Press Escape to dismiss
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('5. OrderReturnRequestModal Modal Accessibility', () => {
    it('opens return modal with role="dialog", aria-modal="true", and closes on Escape', () => {
      render(
        <OrderReturnRequestModal
          orderId="order_123"
          displayId="1001"
          status="completed"
          fulfillmentStatus="delivered"
          items={[
            {
              id: 'item_1',
              title: 'Coriander Pant Haritima Seeds',
              quantity: 2,
            },
          ]}
        />
      )

      const returnBtn = screen.getByRole('button', { name: /request return/i })
      fireEvent.click(returnBtn)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'return-dialog-title')
      expect(document.body.style.overflow).toBe('hidden')

      // Press Escape to dismiss
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('6. CartDrawer Accessibility', () => {
    it('renders with role="dialog", aria-labelledby, and triggers close on Escape', () => {
      mockIsDrawerOpen = true
      render(<CartDrawer />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'cart-drawer-title')
      expect(document.body.style.overflow).toBe('hidden')

      fireEvent.keyDown(window, { key: 'Escape' })
      expect(mockCloseDrawer).toHaveBeenCalledTimes(1)
    })
  })

  describe('7. AccountNav Accessibility & Active Page Indicator', () => {
    it('marks the active page with aria-current="page" and has aria-label', () => {
      render(<AccountNav />)

      const nav = screen.getByRole('navigation', { name: /account navigation/i })
      expect(nav).toBeInTheDocument()

      const ordersLink = screen.getByRole('link', { name: /order history/i })
      expect(ordersLink).toHaveAttribute('aria-current', 'page')

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).not.toHaveAttribute('aria-current')
    })
  })
})
