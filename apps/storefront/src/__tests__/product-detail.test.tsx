import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { VariantSelector } from '../components/catalog/VariantSelector'
import { BotanicalSpecs } from '../components/catalog/BotanicalSpecs'
import { ProductGallery } from '../components/catalog/ProductGallery'
import { ProductTrustAndPolicies } from '../components/catalog/ProductTrustAndPolicies'
import type { StoreCatalogProduct, SeedMetadata } from '@glorov/types'

// Mock Cart Context
const mockAddToCart = vi.fn().mockResolvedValue(true)
const mockClearError = vi.fn()

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cart: null,
    totalItems: 2,
    isLoading: false,
    isMutating: false,
    error: null,
    addToCart: mockAddToCart,
    clearError: mockClearError,
  }),
}))

describe('GLOROV Product Detail Experience — Seeds & Plants Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockTomatoProduct: StoreCatalogProduct = {
    id: 'prod_tomato_pusa_ruby',
    title: 'Tomato Seeds (Desi / Pusa Ruby)',
    handle: 'tomato-seeds-desi',
    description: 'Authentic Indian heirloom tomato with rich flavour and high heat tolerance.',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
    images: [
      { id: 'img_1', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea' },
      { id: 'img_2', url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651' },
    ],
    categories: [
      { id: 'cat_veg', name: 'Vegetable Seeds', handle: 'vegetable-seeds' },
    ],
    variants: [
      {
        id: 'var_tom_20',
        title: '20 Seeds',
        sku: 'GLR-SD-TOM-020',
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 100,
        prices: [{ id: 'p_20', currency_code: 'inr', amount: 4900 }], // ₹49
        metadata: {
          packet_size_label: '20 Seeds Home Garden Pack',
          approx_seeds_per_packet: 20,
          weight_grams: 5,
        },
      },
      {
        id: 'var_tom_50',
        title: '50 Seeds',
        sku: 'GLR-SD-TOM-050',
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 45,
        prices: [{ id: 'p_50', currency_code: 'inr', amount: 9900 }], // ₹99
        metadata: {
          packet_size_label: '50 Seeds Standard Pack',
          approx_seeds_per_packet: 50,
          weight_grams: 12,
        },
      },
      {
        id: 'var_tom_100',
        title: '100 Seeds',
        sku: 'GLR-SD-TOM-100',
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 0, // Sold out
        prices: [{ id: 'p_100', currency_code: 'inr', amount: 17900 }], // ₹179
        metadata: {
          packet_size_label: '100 Seeds Grower Bulk Pack',
          approx_seeds_per_packet: 100,
          weight_grams: 25,
        },
      },
    ],
    metadata: {
      common_name: 'Desi Tomato / Tamatar',
      botanical_name: 'Solanum lycopersicum',
      variety: 'Pusa Ruby',
      seed_type: 'Heirloom / Open-Pollinated',
      germination_time_range: '6-10 days',
      sowing_depth: '0.5 cm',
      spacing: '45-60 cm',
      sunlight: 'full_sun',
      watering: 'daily',
      season: 'kharif',
      difficulty: 'beginner',
      days_to_harvest: '65-75 days',
      planting_instructions: 'Sow seeds 0.5 cm deep in seedling trays. Transplant at 4-6 leaves.',
      packaging_notes: 'Hermetically heat-sealed foil pouch with moisture desiccant.',
    },
  }

  const mockLivePlantProduct: StoreCatalogProduct = {
    id: 'prod_snake_plant',
    title: 'Snake Plant Golden Hahnii (Sansevieria)',
    handle: 'snake-plant-golden-hahnii',
    description: 'Variegated dwarf snake plant suited for indoor light conditions.',
    status: 'published',
    thumbnail: null, // Test missing thumbnail fallback
    images: [],
    categories: [
      { id: 'cat_indoor', name: 'Indoor Plants', handle: 'indoor-plants' },
    ],
    variants: [
      {
        id: 'var_sp_4in',
        title: '4-inch Nursery Pot',
        sku: 'GLR-PL-SNK-004',
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 8, // Low stock
        prices: [{ id: 'p_sp_4', currency_code: 'inr', amount: 19900 }], // ₹199
      },
    ],
    metadata: {
      common_name: 'Snake Plant Golden Hahnii',
      botanical_name: 'Sansevieria trifasciata',
      is_perishable: true,
      sunlight: 'low_light',
      watering: 'weekly',
      season: 'all_season',
    },
  }

  describe('1. Variant Selection & Pricing Dynamics', () => {
    it('initializes with the first in-stock variant selected', () => {
      render(<VariantSelector product={mockTomatoProduct} />)

      // 20 Seeds is selected initially (₹49)
      const prices = screen.getAllByText('₹49')
      expect(prices.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('SKU: GLR-SD-TOM-020')).toBeInTheDocument()
      expect(screen.getByText('In Stock & Verified')).toBeInTheDocument()
    })

    it('updates displayed price, SKU, and packet metadata when a different variant is clicked', () => {
      render(<VariantSelector product={mockTomatoProduct} />)

      // Click "50 Seeds" variant card
      const var50Btn = screen.getByRole('radio', { name: /50 seeds/i })
      fireEvent.click(var50Btn)

      // Price should update to ₹99
      const prices = screen.getAllByText('₹99')
      expect(prices.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('SKU: GLR-SD-TOM-050')).toBeInTheDocument()
      expect(screen.getByText(/approx\. 50 seeds/i)).toBeInTheDocument()
      expect(screen.getByText(/12g net/i)).toBeInTheDocument()
    })

    it('marks out-of-stock variant as Sold Out and disables Add to Cart when selected', () => {
      render(<VariantSelector product={mockTomatoProduct} />)

      // Click "100 Seeds" variant (inventory_quantity = 0)
      const var100Btn = screen.getByRole('radio', { name: /100 seeds/i })
      fireEvent.click(var100Btn)

      // Price updates to ₹179
      const prices = screen.getAllByText('₹179')
      expect(prices.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('SKU: GLR-SD-TOM-100')).toBeInTheDocument()

      // Out of stock badge displayed
      expect(screen.getAllByText(/out of stock/i).length).toBeGreaterThanOrEqual(1)

      // Add to Cart button disabled with appropriate label
      const addBtn = screen.getByRole('button', { name: /selected variant out of stock/i })
      expect(addBtn).toBeDisabled()
    })

    it('renders low stock badge when inventory is 10 or fewer', () => {
      render(<VariantSelector product={mockLivePlantProduct} />)

      // 8 left in stock
      expect(screen.getByText(/low stock: only 8 left/i)).toBeInTheDocument()
    })
  })

  describe('2. Shopping Actions & Cart Invariant Integrity', () => {
    it('adds the EXACT selected variant ID to the cart', async () => {
      render(<VariantSelector product={mockTomatoProduct} />)

      // Select 50 Seeds variant (var_tom_50)
      fireEvent.click(screen.getByRole('radio', { name: /50 seeds/i }))

      // Increase quantity to 2
      const plusBtn = screen.getByRole('button', { name: /increase quantity/i })
      fireEvent.click(plusBtn)

      expect(screen.getByText('2')).toBeInTheDocument()

      // Click Add to Cart
      const addBtn = screen.getByRole('button', { name: /add to botanical cart/i })
      fireEvent.click(addBtn)

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith('var_tom_50', 2)
      })

      // Must NOT add the default var_tom_20 or var_tom_100
      expect(mockAddToCart).not.toHaveBeenCalledWith('var_tom_20', expect.anything())
      expect(mockAddToCart).not.toHaveBeenCalledWith('var_tom_100', expect.anything())
    })

    it('prevents duplicate submissions when Add to Cart is clicked repeatedly while pending', async () => {
      // Mock delayed add to cart
      mockAddToCart.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 200))
      )

      render(<VariantSelector product={mockTomatoProduct} />)

      const addBtn = screen.getByRole('button', { name: /add to botanical cart/i })

      // Rapidly click twice
      fireEvent.click(addBtn)
      fireEvent.click(addBtn)

      // Second click should be ignored because button is disabled during isAdding
      expect(mockAddToCart).toHaveBeenCalledTimes(1)
    })

    it('renders success feedback and View Cart link after adding product', async () => {
      render(<VariantSelector product={mockTomatoProduct} />)

      const addBtn = screen.getByRole('button', { name: /add to botanical cart/i })
      fireEvent.click(addBtn)

      await waitFor(() => {
        expect(screen.getByText(/added 1 to botanical cart!/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /view cart/i })).toHaveAttribute('href', '/cart')
      })
    })

    it('constrains quantity selection between 1 and available stock limit', () => {
      render(<VariantSelector product={mockTomatoProduct} />)

      const minusBtn = screen.getByRole('button', { name: /decrease quantity/i })
      expect(minusBtn).toBeDisabled() // Cannot go below 1

      const plusBtn = screen.getByRole('button', { name: /increase quantity/i })
      // Rapidly click plus 12 times; should cap at 10
      for (let i = 0; i < 12; i++) {
        fireEvent.click(plusBtn)
      }

      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  describe('3. Botanical Specifications & Clean Field Omission', () => {
    it('displays all verified seed specifications cleanly', () => {
      render(<BotanicalSpecs metadata={mockTomatoProduct.metadata as SeedMetadata} />)

      expect(screen.getByText('Solanum lycopersicum')).toBeInTheDocument()
      expect(screen.getByText('Desi Tomato / Tamatar')).toBeInTheDocument()
      expect(screen.getByText('Pusa Ruby')).toBeInTheDocument()
      expect(screen.getByText('6-10 days')).toBeInTheDocument()
      expect(screen.getByText('0.5 cm')).toBeInTheDocument()
      expect(screen.getByText('45-60 cm')).toBeInTheDocument()
      expect(screen.getByText('65-75 days')).toBeInTheDocument()
      expect(screen.getByText('Full Direct Sun (6+ hours)')).toBeInTheDocument()
      expect(screen.getByText('Daily Moisture (Gentle Spray)')).toBeInTheDocument()
      expect(screen.getByText(/kharif season/i)).toBeInTheDocument()
      expect(screen.getByText('Sowing & Propagation Guidelines')).toBeInTheDocument()
      expect(screen.getByText('Packaging & Safe Viability Shield')).toBeInTheDocument()
    })

    it('cleanly hides unavailable optional fields without showing blank placeholders or N/A', () => {
      const partialMetadata: SeedMetadata = {
        common_name: 'Desi Mustard',
        season: 'rabi',
      }

      render(<BotanicalSpecs metadata={partialMetadata} />)

      // Verified present fields
      expect(screen.getByText('Desi Mustard')).toBeInTheDocument()
      expect(screen.getByText(/rabi season/i)).toBeInTheDocument()

      // Missing specification grid labels MUST NOT appear in the DOM
      expect(screen.queryByText(/^sowing depth$/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/^germination time$/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/^estimated days to harvest$/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/n\/a/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/not specified/i)).not.toBeInTheDocument()
    })

    it('returns null and renders nothing when metadata is completely empty', () => {
      const { container } = render(<BotanicalSpecs metadata={{}} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('4. Product Imagery & Fallback Handling', () => {
    it('renders main image and responsive thumbnail bar for multi-image products', () => {
      render(
        <ProductGallery
          title={mockTomatoProduct.title}
          thumbnail={mockTomatoProduct.thumbnail}
          images={mockTomatoProduct.images}
        />
      )

      const mainImage = screen.getByAltText(`${mockTomatoProduct.title} - Photograph 1`)
      expect(mainImage).toBeInTheDocument()

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(2)
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('switches active photograph when thumbnail button is clicked', () => {
      render(
        <ProductGallery
          title={mockTomatoProduct.title}
          thumbnail={mockTomatoProduct.thumbnail}
          images={mockTomatoProduct.images}
        />
      )

      const thumbnail2 = screen.getByRole('tab', { name: /view photo 2 of 2/i })
      fireEvent.click(thumbnail2)

      expect(screen.getByText('2 / 2')).toBeInTheDocument()
      expect(screen.getByAltText(`${mockTomatoProduct.title} - Photograph 2`)).toBeInTheDocument()
    })

    it('renders botanical placeholder fallback when image URL is null or fails to load', () => {
      render(
        <ProductGallery
          title={mockLivePlantProduct.title}
          thumbnail={null}
          images={[]}
        />
      )

      expect(screen.getByText('GLOROV Botanical Specimen')).toBeInTheDocument()
      expect(screen.getByText('Photograph verification pending')).toBeInTheDocument()
    })
  })

  describe('5. Helpful Customer Information & Store Policies', () => {
    it('renders accessible accordion sections for shipping, returns, and support', () => {
      render(<ProductTrustAndPolicies isPerishable={false} categoryName="Seeds" />)

      expect(screen.getByText(/shipping logistics & transit expectations/i)).toBeInTheDocument()
      expect(screen.getByText(/transit damage replacement & perishables policy/i)).toBeInTheDocument()
      expect(screen.getByText(/gardening helpdesk & order support/i)).toBeInTheDocument()
    })

    it('toggles accordion section and reveals policy details upon click', () => {
      render(<ProductTrustAndPolicies isPerishable={false} categoryName="Seeds" />)

      // Returns policy header button
      const returnsBtn = screen.getByRole('button', {
        name: /transit damage replacement & perishables policy/i,
      })
      fireEvent.click(returnsBtn)

      expect(screen.getByText(/48 hours of delivery/i)).toBeInTheDocument()
      expect(screen.getByText('support@glorov.in')).toBeInTheDocument()
      expect(screen.getByText(/final refund and warranty claims are governed by glorov terms of service/i)).toBeInTheDocument()
    })
  })
})
