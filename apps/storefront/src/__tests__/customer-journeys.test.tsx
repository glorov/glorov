/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Hero } from '../components/home/Hero'
import { CategoryShowcase } from '../components/home/CategoryShowcase'
import { GardeningGuide } from '../components/home/GardeningGuide'
import { ValuePropositions } from '../components/home/ValuePropositions'
import { ProductCard } from '../components/catalog/ProductCard'
import { VariantSelector } from '../components/catalog/VariantSelector'
import { BotanicalSpecs } from '../components/catalog/BotanicalSpecs'
import { AddToCartButton } from '../components/cart/AddToCartButton'
import { CartNavButton } from '../components/cart/CartNavButton'
import { MobileNav } from '../components/common/MobileNav'
import { AccountNav } from '../components/account/AccountNav'
import {
  indianAddressSchema,
  customerRegistrationSchema,
  customerLoginSchema,
} from '@glorov/types'

const mockAddToCart = vi.fn().mockResolvedValue(true)
const mockOpenDrawer = vi.fn()

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cart: null,
    isLoading: false,
    isMutating: false,
    error: null,
    totalItems: 3,
    isDrawerOpen: false,
    openDrawer: mockOpenDrawer,
    closeDrawer: vi.fn(),
    addToCart: mockAddToCart,
    updateQuantity: vi.fn().mockResolvedValue(true),
    removeItem: vi.fn().mockResolvedValue(true),
    refreshCart: vi.fn(),
    clearCart: vi.fn(),
    clearError: vi.fn(),
  }),
}))

describe('GLOROV Storefront Customer Journey & Component Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. Homepage Customer Journey', () => {
    it('renders Hero banner with headline, Indian botanical tagline and CTA links', () => {
      render(<Hero />)

      // Main branding and headline
      expect(screen.getByText(/Living Botanicals & Pure Seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/Monsoon & Winter Sowing Season Open/i)).toBeInTheDocument()

      // Primary Call to Action buttons
      const exploreBtn = screen.getByRole('link', { name: /Explore Seeds Collection/i })
      expect(exploreBtn).toBeInTheDocument()
      expect(exploreBtn).toHaveAttribute('href', '/categories/seeds')

      const livePlantsBtn = screen.getByRole('link', { name: /Shop Indoor Plants/i })
      expect(livePlantsBtn).toBeInTheDocument()
      expect(livePlantsBtn).toHaveAttribute('href', '/categories/live-plants')

      // Trust badges
      expect(screen.getByText(/Heirloom Varieties/i)).toBeInTheDocument()
      expect(screen.getByText(/Pune Hub/i)).toBeInTheDocument()
      expect(screen.getByText(/Pan-India Dispatch/i)).toBeInTheDocument()
    })

    it('renders CategoryShowcase displaying core Indian botanical categories', () => {
      render(<CategoryShowcase />)

      expect(screen.getByText(/Desi Vegetable Seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/Festive Flower Seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/Medicinal & Herb Seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/Live Indoor Plants/i)).toBeInTheDocument()
    })

    it('renders GardeningGuide with Indian planting seasons (Kharif, Rabi, Zaid)', () => {
      render(<GardeningGuide />)

      expect(screen.getByText(/Kharif Sowing/i)).toBeInTheDocument()
      expect(screen.getByText(/Rabi Sowing/i)).toBeInTheDocument()
      expect(screen.getByText(/Zaid Sowing/i)).toBeInTheDocument()
      expect(screen.getByText(/The 2× Depth Rule/i)).toBeInTheDocument()
      expect(screen.getByText(/Fine Mist Hydration/i)).toBeInTheDocument()
    })

    it('renders ValuePropositions showcasing Indian botanical quality guarantees', () => {
      render(<ValuePropositions />)

      expect(screen.getByText(/The GLOROV Standard/i)).toBeInTheDocument()
      expect(screen.getByText(/Climate-Hardened Nursery Plants/i)).toBeInTheDocument()
      expect(screen.getByText(/High-Viability Desi Seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/Pan-India Direct Delivery/i)).toBeInTheDocument()
      expect(screen.getByText(/Protective Botanical Packaging/i)).toBeInTheDocument()
    })
  })

  describe('2. Catalog & Product Card Display Journey', () => {
    const mockInStockProduct = {
      id: 'prod_tomato_01',
      title: 'Desi Pusa Ruby Tomato Seeds',
      handle: 'tomato-seeds-pusa-ruby',
      thumbnail: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
      description: 'Heirloom desi tomato variety high in lycopene.',
      categories: [{ id: 'cat_seeds', handle: 'vegetable-seeds', name: 'Vegetable Seeds' }],
      metadata: {
        botanical_name: 'Solanum lycopersicum',
        season: 'kharif',
        is_perishable: false,
      },
      variants: [
        {
          id: 'var_01',
          title: '20 Seeds',
          prices: [{ amount: 4900, currency_code: 'inr' }],
          manage_inventory: true,
          inventory_quantity: 50,
        },
        {
          id: 'var_02',
          title: '50 Seeds',
          prices: [{ amount: 9900, currency_code: 'inr' }],
          manage_inventory: true,
          inventory_quantity: 30,
        },
      ],
    }

    const mockOutOfStockProduct = {
      id: 'prod_rare_02',
      title: 'Rare Himalayan Blue Poppy Seeds',
      handle: 'rare-poppy-seeds',
      categories: [{ id: 'cat_seeds', handle: 'flower-seeds', name: 'Flower Seeds' }],
      metadata: {
        botanical_name: 'Meconopsis betonicifolia',
        is_perishable: false,
      },
      variants: [
        {
          id: 'var_03',
          title: '25 Seeds',
          prices: [{ amount: 19900, currency_code: 'inr' }],
          manage_inventory: true,
          inventory_quantity: 0,
        },
      ],
    }

    it('renders product card with title, botanical name, packet options and INR price', () => {
      render(<ProductCard product={mockInStockProduct as any} />)

      expect(screen.getByText('Desi Pusa Ruby Tomato Seeds')).toBeInTheDocument()
      expect(screen.getByText('Solanum lycopersicum')).toBeInTheDocument()
      expect(screen.getByText('From ₹49')).toBeInTheDocument()
      expect(screen.getByText('In Stock')).toBeInTheDocument()
      expect(screen.getByText('Select Options')).toBeInTheDocument()

      const link = screen.getByRole('link', { name: /View Desi Pusa Ruby Tomato Seeds/i })
      expect(link).toHaveAttribute('href', '/products/tomato-seeds-pusa-ruby')
    })

    it('displays out of stock badge when all variants are unavailable', () => {
      render(<ProductCard product={mockOutOfStockProduct as any} />)

      expect(screen.getByText('Rare Himalayan Blue Poppy Seeds')).toBeInTheDocument()
      expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    })
  })

  describe('3. Product Detail & Variant Selection Journey', () => {
    const mockProductWithVariants = {
      id: 'prod_01',
      title: 'Desi Pusa Ruby Tomato Seeds',
      handle: 'tomato-seeds-pusa-ruby',
      metadata: {
        botanical_name: 'Solanum lycopersicum',
      },
      variants: [
        {
          id: 'var_20',
          title: '20 Seeds',
          sku: 'GLR-TOM-020',
          prices: [{ amount: 4900, currency_code: 'inr' }],
          manage_inventory: true,
          inventory_quantity: 50,
          metadata: { approx_seeds_per_packet: 20, packet_size_label: '20 Seeds' },
        },
        {
          id: 'var_50',
          title: '50 Seeds',
          sku: 'GLR-TOM-050',
          prices: [{ amount: 9900, currency_code: 'inr' }],
          manage_inventory: true,
          inventory_quantity: 20,
          metadata: { approx_seeds_per_packet: 50, packet_size_label: '50 Seeds' },
        },
        {
          id: 'var_100',
          title: '100 Seeds (Bulk Pack)',
          sku: 'GLR-TOM-100',
          prices: [{ amount: 17900, currency_code: 'inr' }],
          manage_inventory: true,
          inventory_quantity: 0, // Out of stock
          metadata: { approx_seeds_per_packet: 100, packet_size_label: '100 Seeds' },
        },
      ],
    }

    it('renders VariantSelector, updates variant selection, adjusts quantity, and adds to cart', async () => {
      render(<VariantSelector product={mockProductWithVariants as any} />)

      // Verify packet size labels
      expect(screen.getByText(/Select Variant \/ Packet Size/i)).toBeInTheDocument()
      expect(screen.getByText('20 Seeds')).toBeInTheDocument()
      expect(screen.getByText('50 Seeds')).toBeInTheDocument()
      expect(screen.getByText('100 Seeds (Bulk Pack)')).toBeInTheDocument()

      // Default variant price is shown
      expect(screen.getAllByText('₹49').length).toBeGreaterThan(0)

      // Click 50 Seeds variant
      const variant50Btn = screen.getByRole('radio', { name: /50 Seeds/i })
      fireEvent.click(variant50Btn)

      // Price updates to ₹99
      expect(screen.getAllByText('₹99').length).toBeGreaterThan(0)

      // Quantity increment button
      const plusBtn = screen.getByRole('button', { name: /Increase quantity/i })
      fireEvent.click(plusBtn)

      // Add to Cart button reflects updated state
      const addToCartBtn = screen.getByRole('button', { name: /Add to Botanical Cart/i })
      fireEvent.click(addToCartBtn)

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith('var_50', 2)
      })
    })

    it('disables add to cart when out-of-stock variant is selected', () => {
      render(<VariantSelector product={mockProductWithVariants as any} />)

      // Click 100 Seeds (out of stock)
      const variant100Btn = screen.getByRole('radio', { name: /100 Seeds/i })
      fireEvent.click(variant100Btn)

      // Add to cart button should show Out of Stock and be disabled
      const outOfStockBtn = screen.getByRole('button', { name: /Selected Variant Out of Stock/i })
      expect(outOfStockBtn).toBeDisabled()
    })

    it('renders BotanicalSpecs metadata table for gardeners', () => {
      const botanicalMetadata = {
        common_name: 'Desi Pusa Ruby Tomato',
        botanical_name: 'Solanum lycopersicum',
        season: 'kharif' as const,
        sunlight: 'full_sun' as const,
        watering: 'alternate_days' as const,
        difficulty: 'beginner' as const,
        germination_time_range: '6-10 days',
        sowing_depth: '0.5 cm',
        spacing: '45 x 60 cm',
        planting_instructions: 'Start in seedling trays, transplant at 4 weeks.',
      }

      render(<BotanicalSpecs metadata={botanicalMetadata as any} />)

      expect(screen.getByText(/Botanical & Cultivation Specifications/i)).toBeInTheDocument()
      expect(screen.getByText('Full Direct Sun (6+ hours)')).toBeInTheDocument()
      expect(screen.getByText('Alternate Days (Check Soil)')).toBeInTheDocument()
      expect(screen.getByText('6-10 days')).toBeInTheDocument()
      expect(screen.getByText(/Start in seedling trays, transplant at 4 weeks/i)).toBeInTheDocument()
    })
  })

  describe('4. Add-to-Cart & Navigation Badge Interactions', () => {
    it('renders AddToCartButton and triggers cart context update on click', async () => {
      render(<AddToCartButton variantId="var_test_01" />)

      const button = screen.getByRole('button', { name: /Add to Cart/i })
      expect(button).not.toBeDisabled()

      fireEvent.click(button)

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith('var_test_01', 1)
      })
    })

    it('renders disabled AddToCartButton when disabled prop is true', () => {
      render(<AddToCartButton variantId="var_test_02" disabled={true} label="Out of Stock" />)

      const button = screen.getByRole('button', { name: /Out of Stock/i })
      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(mockAddToCart).not.toHaveBeenCalled()
    })

    it('renders CartNavButton with badge indicator showing total cart items and opens drawer on click', () => {
      render(<CartNavButton />)

      expect(screen.getByText('3')).toBeInTheDocument()
      const cartBtn = screen.getByRole('button', { name: /Shopping Cart \(3 items\)/i })
      fireEvent.click(cartBtn)
      expect(mockOpenDrawer).toHaveBeenCalledTimes(1)
    })
  })

  describe('5. Mobile Navigation & Account Navigation Journeys', () => {
    it('toggles MobileNav open and closed on hamburger click', () => {
      render(<MobileNav />)

      // Open button
      const openBtn = screen.getByRole('button', { name: /Open navigation menu/i })
      expect(openBtn).toBeInTheDocument()

      // Open mobile drawer
      fireEvent.click(openBtn)

      // Menu links should be rendered
      expect(screen.getByText('All Botanical Store')).toBeInTheDocument()
      expect(screen.getByText('Seeds (Desi & Hybrid)')).toBeInTheDocument()
      expect(screen.getByText('Live Indoor Plants')).toBeInTheDocument()
      expect(screen.getByText('Plant Doctor Clinic')).toBeInTheDocument()
      expect(screen.getByText('My Account & Orders')).toBeInTheDocument()
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument()

      // Close button closes menu
      const closeBtn = screen.getByRole('button', { name: /Close navigation menu/i })
      fireEvent.click(closeBtn)
    })

    it('renders AccountNav with customer portal sections', () => {
      render(<AccountNav />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Order History')).toBeInTheDocument()
      expect(screen.getByText('Saved Addresses')).toBeInTheDocument()
      expect(screen.getByText('Profile Settings')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
  })

  describe('6. Checkout & Customer Authentication Form Validation Journeys', () => {
    it('validates Indian delivery addresses with 6-digit PIN code and 10-digit phone', () => {
      const validAddress = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        address_1: 'Flat 402, Green Meadows',
        city: 'Bengaluru',
        province: 'Karnataka',
        postal_code: '560001',
        phone: '9876543210',
        country_code: 'in' as const,
      }
      expect(indianAddressSchema.safeParse(validAddress).success).toBe(true)

      // Invalid PIN code starting with 0
      expect(
        indianAddressSchema.safeParse({ ...validAddress, postal_code: '012345' }).success
      ).toBe(false)

      // 5-digit PIN code rejected
      expect(
        indianAddressSchema.safeParse({ ...validAddress, postal_code: '56001' }).success
      ).toBe(false)

      // Invalid phone prefix (starts with 5 instead of 6-9)
      expect(
        indianAddressSchema.safeParse({ ...validAddress, phone: '5123456789' }).success
      ).toBe(false)
    })

    it('validates customer registration credentials with secure password requirements', () => {
      const validReg = {
        first_name: 'Neha',
        last_name: 'Patel',
        email: 'neha.patel@glorov.in',
        password: 'SecurePassword123!',
        phone: '9876543211',
      }
      expect(customerRegistrationSchema.safeParse(validReg).success).toBe(true)

      // Short password (< 8 chars) rejected
      expect(
        customerRegistrationSchema.safeParse({ ...validReg, password: 'short' }).success
      ).toBe(false)

      // Malformed email rejected
      expect(
        customerRegistrationSchema.safeParse({ ...validReg, email: 'not-an-email' }).success
      ).toBe(false)
    })

    it('validates customer login input format', () => {
      expect(
        customerLoginSchema.safeParse({
          email: 'customer@glorov.in',
          password: 'Password123!',
        }).success
      ).toBe(true)

      // Empty password rejected
      expect(
        customerLoginSchema.safeParse({
          email: 'customer@glorov.in',
          password: '',
        }).success
      ).toBe(false)
    })
  })
})
