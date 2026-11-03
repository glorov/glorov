import React from 'react'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}))
import { Breadcrumbs } from '../../src/components/layout/Breadcrumbs'
import { ProductPrice, formatINR } from '../../src/components/product/ProductPrice'
import { RatingStars } from '../../src/components/product/RatingStars'
import { ProductBadge } from '../../src/components/product/ProductBadge'
import { QuantitySelector } from '../../src/components/common/QuantitySelector'
import { Pagination } from '../../src/components/common/Pagination'
import { ProductCard } from '../../src/components/product/ProductCard'
import { StorefrontProvider, useCart, useWishlist, useToast } from '../../src/context/StorefrontContext'
import type { GlorovProductItem } from '../../src/types/storefront'

const mockProduct: GlorovProductItem = {
  id: 'test-seed-1',
  slug: 'test-chilli-seeds',
  title: 'Test Chilli Seeds',
  shortDescription: 'High germination test seeds.',
  category: 'Seeds',
  price: 199,
  discountPrice: 149,
  rating: 4.8,
  reviewCount: 25,
  imageUrls: ['https://example.com/test.jpg'],
  primaryImage: 'https://example.com/test.jpg',
  inStock: true,
  badges: ['HEIRLOOM'],
}

describe('Shared Components — ProductPrice', () => {
  it('formats INR prices correctly without decimals', () => {
    expect(formatINR(499)).toContain('499')
    expect(formatINR(1250)).toContain('1,250')
  })

  it('renders effective and original strikethrough price', () => {
    render(<ProductPrice price={149} originalPrice={199} showDiscountBadge />)
    expect(screen.getByText(/149/)).toBeDefined()
    expect(screen.getByText(/199/)).toBeDefined()
    expect(screen.getByText(/25% OFF/)).toBeDefined()
  })
})

describe('Shared Components — RatingStars', () => {
  it('renders rating score and total review count', () => {
    render(<RatingStars rating={4.8} reviewCount={64} />)
    expect(screen.getByText('4.8')).toBeDefined()
    expect(screen.getByText('(64)')).toBeDefined()
  })

  it('sets accessible aria-label on rating wrapper', () => {
    const { container } = render(<RatingStars rating={5.0} reviewCount={10} />)
    const el = container.querySelector('[aria-label*="Rating: 5.0"]')
    expect(el).not.toBeNull()
  })
})

describe('Shared Components — ProductBadge', () => {
  it('renders promotional tag with lightning bolt and uppercase text', () => {
    render(<ProductBadge variant="promotional">HEIRLOOM</ProductBadge>)
    expect(screen.getByText('HEIRLOOM')).toBeDefined()
  })

  it('renders in-stock status indicator', () => {
    render(<ProductBadge variant="in-stock">Available</ProductBadge>)
    expect(screen.getByText('In Stock')).toBeDefined()
  })
})

describe('Shared Components — QuantitySelector', () => {
  it('increments and decrements within bounds', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={2} onChange={onChange} min={1} max={5} />)

    const decrementBtn = screen.getByLabelText('Decrease quantity')
    const incrementBtn = screen.getByLabelText('Increase quantity')

    fireEvent.click(decrementBtn)
    expect(onChange).toHaveBeenCalledWith(1)

    fireEvent.click(incrementBtn)
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disables decrement button when at minimum', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={1} onChange={onChange} min={1} max={5} />)
    const decrementBtn = screen.getByLabelText('Decrease quantity') as HTMLButtonElement
    expect(decrementBtn.disabled).toBe(true)
  })
})

describe('Shared Components — Pagination', () => {
  it('renders page numbers and triggers onPageChange', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)

    const page3 = screen.getByLabelText('Page 3')
    fireEvent.click(page3)
    expect(onPageChange).toHaveBeenCalledWith(3)

    const prevBtn = screen.getByLabelText('Go to previous page')
    fireEvent.click(prevBtn)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})

describe('Shared Components — Breadcrumbs', () => {
  it('renders navigation trails and current page', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Seeds', href: '/seeds' },
          { label: 'Chilli Seeds' },
        ]}
      />
    )

    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Seeds')).toBeDefined()
    const current = screen.getByText('Chilli Seeds')
    expect(current.getAttribute('aria-current')).toBe('page')
  })
})

describe('Shared Components — ProductCard', () => {
  it('renders product title, price, and badges', () => {
    render(
      <StorefrontProvider>
        <ProductCard product={mockProduct} />
      </StorefrontProvider>
    )

    expect(screen.getByText('Test Chilli Seeds')).toBeDefined()
    expect(screen.getByText(/149/)).toBeDefined()
    expect(screen.getByText('HEIRLOOM')).toBeDefined()
    expect(screen.getByText('4.8')).toBeDefined()
  })
})

describe('Storefront Context — Cart, Wishlist, Toast', () => {
  it('manages cart items and totals', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StorefrontProvider>{children}</StorefrontProvider>
    )

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartCount).toBe(0)

    act(() => {
      result.current.addToCart(mockProduct, 2)
    })

    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartSubtotal).toBe(149 * 2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.cartCount).toBe(0)
  })

  it('manages wishlist toggling', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StorefrontProvider>{children}</StorefrontProvider>
    )

    const { result } = renderHook(() => useWishlist(), { wrapper })

    expect(result.current.isInWishlist('test-seed-1')).toBe(false)

    act(() => {
      result.current.toggleWishlist('test-seed-1')
    })

    expect(result.current.isInWishlist('test-seed-1')).toBe(true)

    act(() => {
      result.current.toggleWishlist('test-seed-1')
    })

    expect(result.current.isInWishlist('test-seed-1')).toBe(false)
  })

  it('triggers toast notifications', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StorefrontProvider>{children}</StorefrontProvider>
    )

    const { result } = renderHook(() => useToast(), { wrapper })

    expect(result.current.toasts.length).toBe(0)

    act(() => {
      result.current.showToast('success', 'Order created successfully!', {
        title: 'Success',
      })
    })

    expect(result.current.toasts.length).toBe(1)
    expect(result.current.toasts[0]?.message).toBe('Order created successfully!')
  })
})
