import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WishlistPage from '@/app/wishlist/page'
import { WishlistProvider } from '@/context/WishlistContext'

const mockAddToCart = vi.fn().mockResolvedValue(true)
const mockOpenDrawer = vi.fn()

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    openDrawer: mockOpenDrawer,
    isMutating: false,
  }),
}))

const mockItems = [
  {
    id: 'prod_peace_lily',
    title: 'Peace Lily Plant',
    handle: 'peace-lily-plant',
    thumbnail: '/ugaoo-assets/cat-plants.webp',
    pricePaise: 49900,
    variantId: 'var_lily_01',
    categoryName: 'Live Botanical',
  },
  {
    id: 'prod_tulsi_seeds',
    title: 'Desi Krishna Tulsi Seeds',
    handle: 'desi-krishna-tulsi-seeds',
    thumbnail: '/ugaoo-assets/cat-seeds.webp',
    pricePaise: 14900,
    variantId: 'var_tulsi_01',
    categoryName: 'Desi Seeds',
  },
]

describe('Botanical Wishlist Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('1. Renders empty state when no botanical specimens are saved', () => {
    render(
      <WishlistProvider>
        <WishlistPage />
      </WishlistProvider>
    )

    expect(
      screen.getByRole('heading', { level: 2, name: /Your Botanical Notebook is Empty/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Discover Living Botanicals/i })).toBeInTheDocument()
  })

  it('2. Renders saved specimens with titles, category tags, and formatted INR prices', () => {
    localStorage.setItem('glorov_botanical_wishlist', JSON.stringify(mockItems))

    render(
      <WishlistProvider>
        <WishlistPage />
      </WishlistProvider>
    )

    expect(screen.getByText('Peace Lily Plant')).toBeInTheDocument()
    expect(screen.getByText('Desi Krishna Tulsi Seeds')).toBeInTheDocument()
    expect(screen.getByText('₹499')).toBeInTheDocument()
    expect(screen.getByText('₹149')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Add all available wishlist specimens to cart/i })
    ).toBeInTheDocument()
  })

  it('3. Removes specimen from wishlist when delete button is clicked', async () => {
    localStorage.setItem('glorov_botanical_wishlist', JSON.stringify(mockItems))

    render(
      <WishlistProvider>
        <WishlistPage />
      </WishlistProvider>
    )

    const removeLilyBtn = screen.getByRole('button', {
      name: /Remove Peace Lily Plant from wishlist/i,
    })
    fireEvent.click(removeLilyBtn)

    await waitFor(() => {
      expect(screen.queryByText('Peace Lily Plant')).not.toBeInTheDocument()
      expect(screen.getByText('Desi Krishna Tulsi Seeds')).toBeInTheDocument()
    })
  })

  it('4. Adds single specimen to cart and triggers drawer', async () => {
    localStorage.setItem('glorov_botanical_wishlist', JSON.stringify(mockItems))

    render(
      <WishlistProvider>
        <WishlistPage />
      </WishlistProvider>
    )

    const addBtns = screen.getAllByRole('button', { name: /Add .* to cart/i })
    fireEvent.click(addBtns[0])

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('var_lily_01', 1)
      expect(mockOpenDrawer).toHaveBeenCalled()
    })
  })

  it('5. "Move All to Cart" adds all specimens sequentially and opens cart drawer', async () => {
    localStorage.setItem('glorov_botanical_wishlist', JSON.stringify(mockItems))

    render(
      <WishlistProvider>
        <WishlistPage />
      </WishlistProvider>
    )

    const moveAllBtn = screen.getByRole('button', {
      name: /Add all available wishlist specimens to cart/i,
    })
    fireEvent.click(moveAllBtn)

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('var_lily_01', 1)
      expect(mockAddToCart).toHaveBeenCalledWith('var_tulsi_01', 1)
      expect(mockOpenDrawer).toHaveBeenCalled()
    })
  })
})
