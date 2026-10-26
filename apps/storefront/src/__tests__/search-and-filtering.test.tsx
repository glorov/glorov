/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { SearchInput } from '../components/common/SearchInput'
import { CatalogFilters } from '../components/catalog/CatalogFilters'
import { ProductGrid } from '../components/catalog/ProductGrid'
import type { StoreCatalogCategory, StoreCatalogProduct } from '@glorov/types'

// Setup router mock
const mockPush = vi.fn()
const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()
let mockPathname = '/store'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

describe('GLOROV Product Discovery — Search, Filtering, and Sorting Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    mockPathname = '/store'
    global.fetch = vi.fn()
  })

  const mockCategories: StoreCatalogCategory[] = [
    { id: 'cat_seeds', name: 'Seeds', handle: 'seeds' },
    { id: 'cat_veg', name: 'Vegetable Seeds', handle: 'vegetable-seeds', parent_category_id: 'cat_seeds' },
    { id: 'cat_flower', name: 'Flower Seeds', handle: 'flower-seeds', parent_category_id: 'cat_seeds' },
    { id: 'cat_plants', name: 'Live Plants', handle: 'live-plants' },
  ]

  const mockProducts: StoreCatalogProduct[] = [
    {
      id: 'prod_tomato',
      title: 'Tomato Seeds (Desi / Pusa Ruby)',
      handle: 'tomato-seeds-desi',
      description: 'Heirloom Indian tomato with balanced acidity.',
      status: 'published',
      thumbnail: null,
      variants: [
        {
          id: 'v_1',
          title: '20 Seeds',
          sku: 'GLR-SD-TOM-020',
          manage_inventory: true,
          allow_backorder: false,
          inventory_quantity: 100,
          prices: [{ id: 'p_1', currency_code: 'inr', amount: 4900 }],
        },
      ],
      categories: [{ id: 'cat_veg', name: 'Vegetable Seeds', handle: 'vegetable-seeds' }],
      metadata: {
        common_name: 'Desi Tomato',
        variety: 'Pusa Ruby',
        seed_type: 'Heirloom',
        season: 'kharif',
      },
    },
    {
      id: 'prod_marigold',
      title: 'Marigold Seeds (Pusa Narangi)',
      handle: 'marigold-seeds-pusa-narangi',
      description: 'Bright festive flowers.',
      status: 'published',
      thumbnail: null,
      variants: [
        {
          id: 'v_2',
          title: '50 Seeds',
          sku: 'GLR-SD-MAR-050',
          manage_inventory: true,
          allow_backorder: false,
          inventory_quantity: 50,
          prices: [{ id: 'p_2', currency_code: 'inr', amount: 3900 }],
        },
      ],
      categories: [{ id: 'cat_flower', name: 'Flower Seeds', handle: 'flower-seeds' }],
      metadata: {
        common_name: 'Marigold',
        variety: 'Pusa Narangi',
        seed_type: 'Open-Pollinated',
        season: 'all_season',
      },
    },
  ]

  describe('1. Search Input and Submission', () => {
    it('renders accessible search field with proper combobox semantics', () => {
      render(<SearchInput placeholder="Search seeds, plants..." id="test-search" />)

      const input = screen.getByRole('combobox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Search seeds, plants...')
      expect(input).toHaveAttribute('id', 'test-search')
    })

    it('submits search query and redirects to /store?q=...', () => {
      const onSubmitted = vi.fn()
      render(<SearchInput onSearchSubmitted={onSubmitted} />)

      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'marigold' } })
      fireEvent.submit(input.closest('form')!)

      expect(mockPush).toHaveBeenCalledWith('/store?q=marigold')
      expect(onSubmitted).toHaveBeenCalledTimes(1)
    })

    it('submitting empty or whitespace query redirects to /store', () => {
      render(<SearchInput />)

      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.submit(input.closest('form')!)

      expect(mockPush).toHaveBeenCalledWith('/store')
    })

    it('clears search input when clear button (X) is clicked', () => {
      render(<SearchInput initialQuery="tomato" />)

      const clearButton = screen.getByRole('button', { name: /clear search query/i })
      expect(clearButton).toBeInTheDocument()

      fireEvent.click(clearButton)

      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('fetches live suggestions and displays dropdown when user types', async () => {
      const mockSuggestions = [
        {
          id: 'prod_tomato',
          title: 'Tomato Seeds (Desi / Pusa Ruby)',
          handle: 'tomato-seeds-desi',
          thumbnail: null,
          commonName: 'Desi Tomato',
          variety: 'Pusa Ruby',
          categoryName: 'Vegetable Seeds',
          categoryHandle: 'vegetable-seeds',
          priceFormatted: '₹49',
          hasStock: true,
          status: 'in_stock',
        },
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 1,
          products: mockSuggestions,
        }),
      })

      render(<SearchInput />)

      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'tomato' } })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
        expect(screen.getByText('Tomato Seeds (Desi / Pusa Ruby)')).toBeInTheDocument()
        expect(screen.getByText('Pusa Ruby')).toBeInTheDocument()
        expect(screen.getByText('₹49')).toBeInTheDocument()
        expect(screen.getByText('In Stock')).toBeInTheDocument()
      })
    })

    it('closes suggestions dropdown on Escape key', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 1,
          products: [
            {
              id: 'p1',
              title: 'Tomato Seeds',
              handle: 'tomato-seeds',
              thumbnail: null,
              commonName: 'Tomato',
              variety: null,
              categoryName: 'Seeds',
              categoryHandle: 'seeds',
              priceFormatted: '₹49',
              hasStock: true,
              status: 'in_stock',
            },
          ],
        }),
      })

      render(<SearchInput />)

      const input = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: 'tomato' } })

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      fireEvent.keyDown(input, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('2. Filter Selection, Combinations, and Clearing', () => {
    it('renders specimen count, sort control, and in-stock chip', () => {
      render(
        <CatalogFilters
          categories={mockCategories}
          totalCount={12}
          currentSort="featured"
        />
      )

      expect(screen.getByText('12 Specimens')).toBeInTheDocument()
      expect(screen.getByText('In Stock Only')).toBeInTheDocument()
      expect(screen.getByLabelText(/sort products catalog/i)).toBeInTheDocument()
    })

    it('toggles in-stock filter and updates URL query', () => {
      render(<CatalogFilters categories={mockCategories} totalCount={10} />)

      const stockBtn = screen.getByText('In Stock Only')
      fireEvent.click(stockBtn)

      expect(mockPush).toHaveBeenCalledWith('/store?in_stock=true')
    })

    it('changes sort option and preserves pathname', () => {
      render(<CatalogFilters categories={mockCategories} currentSort="featured" />)

      const sortSelect = screen.getByLabelText(/sort products catalog/i)
      fireEvent.change(sortSelect, { target: { value: 'price_asc' } })

      expect(mockPush).toHaveBeenCalledWith('/store?sort=price_asc')
    })

    it('renders active filter pills and removes individual filter on click (X)', () => {
      mockSearchParams = new URLSearchParams('q=tomato&in_stock=true&sort=price_asc')

      render(
        <CatalogFilters
          categories={mockCategories}
          totalCount={1}
          activeFilters={{
            q: 'tomato',
            in_stock: true,
            sort: 'price_asc',
          }}
        />
      )

      expect(screen.getByText(/active filters \(2\):/i)).toBeInTheDocument()
      expect(screen.getByText(/search: “tomato”/i)).toBeInTheDocument()
      expect(screen.getByText('In Stock Only')).toBeInTheDocument()

      const removeSearchBtn = screen.getByLabelText('Remove search term filter')
      fireEvent.click(removeSearchBtn)

      expect(mockPush).toHaveBeenCalledWith('/store?in_stock=true&sort=price_asc')
    })

    it('clears all active filters when Clear All Filters is clicked', () => {
      mockSearchParams = new URLSearchParams('q=tomato&in_stock=true&season=kharif&sort=price_asc')

      render(
        <CatalogFilters
          categories={mockCategories}
          totalCount={1}
          activeFilters={{
            q: 'tomato',
            in_stock: true,
            season: 'kharif',
            sort: 'price_asc',
          }}
        />
      )

      const clearAllBtn = screen.getByRole('button', { name: /clear all filters/i })
      fireEvent.click(clearAllBtn)

      expect(mockPush).toHaveBeenCalledWith('/store?sort=price_asc')
    })

    it('renders desktop expandable filter drawer and toggles filters', () => {
      render(<CatalogFilters categories={mockCategories} totalCount={15} />)

      const moreFiltersBtn = screen.getByRole('button', { name: /more filters/i })
      expect(moreFiltersBtn).toBeInTheDocument()

      fireEvent.click(moreFiltersBtn)

      // Verify filter sections appear
      expect(screen.getByText('Seed / Plant Type')).toBeInTheDocument()
      expect(screen.getByText('Sowing Season')).toBeInTheDocument()
      expect(screen.getByText('Packet / Pot Size')).toBeInTheDocument()
      expect(screen.getByText('Price Range (₹ INR)')).toBeInTheDocument()

      // Click Heirloom seed type
      const heirloomBtn = screen.getByRole('button', { name: 'Heirloom' })
      fireEvent.click(heirloomBtn)

      expect(mockPush).toHaveBeenCalledWith('/store?seed_type=heirloom')
    })

    it('applies preset price filter when clicked in drawer', () => {
      render(<CatalogFilters categories={mockCategories} totalCount={15} />)

      // Open drawer
      fireEvent.click(screen.getByRole('button', { name: /more filters/i }))

      const presetBtn = screen.getByRole('button', { name: '₹50 – ₹100' })
      fireEvent.click(presetBtn)

      expect(mockPush).toHaveBeenCalledWith('/store?min_price=50&max_price=100')
    })
  })

  describe('3. Mobile Search and Filter Drawer', () => {
    it('renders mobile filter button with active filter counter', () => {
      mockSearchParams = new URLSearchParams('season=rabi&in_stock=true')

      render(
        <CatalogFilters
          categories={mockCategories}
          totalCount={5}
          activeFilters={{
            season: 'rabi',
            in_stock: true,
          }}
        />
      )

      // Mobile Filters dialog trigger button
      const filterBtn = screen.getByRole('button', { name: /^filters/i })
      expect(filterBtn).toBeInTheDocument()
      const badges = screen.getAllByText('2')
      expect(badges.length).toBeGreaterThanOrEqual(1) // 2 active filters badge
    })
  })

  describe('4. Product Grid and Empty States', () => {
    it('renders product cards with titles and formatted prices', () => {
      render(<ProductGrid products={mockProducts} />)

      expect(screen.getByText('Tomato Seeds (Desi / Pusa Ruby)')).toBeInTheDocument()
      expect(screen.getByText('Marigold Seeds (Pusa Narangi)')).toBeInTheDocument()
      expect(screen.getByText('₹49')).toBeInTheDocument()
      expect(screen.getByText('₹39')).toBeInTheDocument()
    })

    it('renders empty state when zero products match criteria', () => {
      render(
        <ProductGrid
          products={[]}
          emptyMessage='No botanical items found matching "xyz".'
          resetHref="/store"
        />
      )

      expect(screen.getByText('No Botanical Items Found')).toBeInTheDocument()
      expect(screen.getByText('No botanical items found matching "xyz".')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /reset filters/i })).toHaveAttribute('href', '/store')
    })
  })
})
