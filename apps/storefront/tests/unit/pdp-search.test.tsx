import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductGallery } from '../../src/components/product/ProductGallery'
import { ProductVariantSelector } from '../../src/components/product/ProductVariantSelector'
import { PincodeChecker } from '../../src/components/product/PincodeChecker'
import { BotanicalSpecsTable } from '../../src/components/product/BotanicalSpecsTable'
import { ProductReviewsSection } from '../../src/components/product/ProductReviewsSection'
import { SearchClientView } from '../../src/components/search/SearchClientView'
import { StorefrontProvider } from '../../src/context/StorefrontContext'
import { MOCK_PRODUCTS } from '../../src/lib/mock-data'

const mockParams = new URLSearchParams('')
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/products/green-chilli-seeds',
  useSearchParams: () => mockParams,
}))

const mockProduct = MOCK_PRODUCTS[0]

describe('PDP — ProductGallery', () => {
  it('renders primary image, thumbnails, and badges', () => {
    render(
      <ProductGallery
        title={mockProduct.title}
        images={mockProduct.imageUrls.slice(0, 3)}
        primaryImage={mockProduct.primaryImage}
        badges={['HEIRLOOM']}
      />
    )

    expect(screen.getByText('HEIRLOOM')).toBeDefined()
    expect(screen.getByLabelText(/View image 2 of 3/i)).toBeDefined()
    expect(screen.getByText(/1 \/ 3/i)).toBeDefined()
  })

  it('switches image when next arrow is clicked', () => {
    render(
      <ProductGallery
        title={mockProduct.title}
        images={mockProduct.imageUrls.slice(0, 3)}
        primaryImage={mockProduct.primaryImage}
      />
    )

    const nextBtn = screen.getByLabelText('Next product image')
    fireEvent.click(nextBtn)
    expect(screen.getByText(/2 \/ 3/i)).toBeDefined()
  })

  it('opens and closes zoom preview modal', async () => {
    render(
      <ProductGallery
        title={mockProduct.title}
        images={mockProduct.imageUrls}
        primaryImage={mockProduct.primaryImage}
      />
    )

    const zoomBtn = screen.getByLabelText('Zoom image')
    fireEvent.click(zoomBtn)

    expect(screen.getByRole('dialog')).toBeDefined()

    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})

describe('PDP — ProductVariantSelector', () => {
  it('renders all variants and highlights active selection', () => {
    const onSelect = vi.fn()
    const variants = [
      { id: 'var-1', name: '50 Seeds Packet', price: 99, discountPrice: 79, inStock: true },
      { id: 'var-2', name: '100 Seeds Value Pack', price: 149, discountPrice: 99, inStock: true },
    ]

    render(
      <ProductVariantSelector
        variants={variants}
        selectedVariantId={variants[0].id}
        onSelectVariant={onSelect}
      />
    )

    expect(screen.getAllByText('50 Seeds Packet').length).toBeGreaterThan(0)
    expect(screen.getByText('100 Seeds Value Pack')).toBeDefined()

    fireEvent.click(screen.getByText('100 Seeds Value Pack'))
    expect(onSelect).toHaveBeenCalledWith(variants[1])
  })
})

describe('PDP — PincodeChecker', () => {
  it('validates 6-digit pin code and shows delivery estimate', async () => {
    const onValidated = vi.fn()
    render(<PincodeChecker onValidated={onValidated} />)

    const input = screen.getByPlaceholderText(/Enter 6-digit Pincode/i)
    fireEvent.change(input, { target: { value: '400001' } })

    const submitBtn = screen.getByRole('button', { name: /check/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Delivering to/i)).toBeDefined()
      expect(screen.getByText('400001')).toBeDefined()
    })
    expect(onValidated).toHaveBeenCalledWith('400001')
  })

  it('rejects invalid or non-deliverable pin code', async () => {
    render(<PincodeChecker />)

    const input = screen.getByPlaceholderText(/Enter 6-digit Pincode/i)
    // 000000 is 6 digits but invalid since Indian pincodes start with 1-9
    fireEvent.change(input, { target: { value: '000000' } })

    const submitBtn = screen.getByRole('button', { name: /check/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid 6-digit Indian pincode/i)).toBeDefined()
    })
  })
})

describe('PDP — BotanicalSpecsTable', () => {
  it('renders growing metrics and difficulty level', () => {
    render(
      <BotanicalSpecsTable
        specs={mockProduct.botanicalSpecs}
        botanicalName={mockProduct.botanicalName}
      />
    )

    expect(screen.getByText('Botanical Growing & Care Guide')).toBeDefined()
    expect(screen.getByText(/Capsicum annuum/i)).toBeDefined()
    expect(screen.getByText('5 — 8 Days')).toBeDefined()
    expect(screen.getByText('Beginner Friendly')).toBeDefined()
  })
})

describe('PDP — ProductReviewsSection', () => {
  it('renders star summary and verified customer testimonials', () => {
    render(
      <ProductReviewsSection
        summary={mockProduct.reviewsSummary}
        reviews={mockProduct.customerReviews}
        productTitle={mockProduct.title}
      />
    )

    expect(screen.getByText('Customer Ratings & Reviews')).toBeDefined()
    expect(screen.getAllByText('4.8').length).toBeGreaterThan(0)
    expect(screen.getByText('Sunita Sharma')).toBeDefined()
    expect(screen.getByText(/Outstanding germination on my Mumbai balcony/i)).toBeDefined()
    expect(screen.getByText(/Why gardeners praise these green chilli seeds/i)).toBeDefined()
  })
})

describe('Search — SearchClientView', () => {
  it('renders search input, trending searches, and popular botanical picks', () => {
    render(
      <StorefrontProvider>
        <SearchClientView />
      </StorefrontProvider>
    )

    expect(screen.getByPlaceholderText(/Search plants, seeds, fertilizers, pots\.\.\./i)).toBeDefined()
    expect(screen.getByText('Trending Searches')).toBeDefined()
    expect(screen.getByText('Monstera Deliciosa')).toBeDefined()
    expect(screen.getByText('Popular Botanical Picks')).toBeDefined()
  })

  it('filters by query, displays closest match or matching products, and allows clearing', async () => {
    render(
      <StorefrontProvider>
        <SearchClientView />
      </StorefrontProvider>
    )

    const input = screen.getByPlaceholderText(/Search plants, seeds, fertilizers, pots\.\.\./i)
    fireEvent.change(input, { target: { value: 'Chilli' } })

    await waitFor(() => {
      expect(screen.getAllByText(/Green Chilli Seeds/i).length).toBeGreaterThan(0)
    })

    const clearBtn = screen.getByLabelText('Clear search query')
    fireEvent.click(clearBtn)

    expect(input).toHaveProperty('value', '')
  })
})
