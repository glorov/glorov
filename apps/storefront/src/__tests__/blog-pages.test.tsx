import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BlogIndexPage from '@/app/blog/page'
import BlogPostPage from '@/app/blog/[slug]/page'
import { BlogList } from '@/app/blog/BlogList'
import { BlogProductEmbed } from '@/app/blog/[slug]/BlogProductEmbed'

const mockAddToCart = vi.fn().mockResolvedValue(true)
const mockOpenDrawer = vi.fn()

vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    openDrawer: mockOpenDrawer,
    isMutating: false,
  }),
}))

describe('Botanical Blog & Chronicles Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. Renders Blog Index with header, category tabs, and featured guide', () => {
    render(<BlogIndexPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Plant Care Chronicles & Guides/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /All Guides/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Desi Seeds & Sowing/i })).toBeInTheDocument()
    expect(
      screen.getByText(/Top 7 Air-Purifying Indoor Plants Recommended by NASA/i)
    ).toBeInTheDocument()
  })

  it('2. Filters articles by category tabs in BlogList', () => {
    render(<BlogList />)

    const seedsTab = screen.getByRole('tab', { name: /Desi Seeds & Sowing/i })
    fireEvent.click(seedsTab)

    expect(
      screen.getByText(/The Complete Kharif Monsoon Sowing Guide/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Top 7 Air-Purifying Indoor Plants/i)
    ).not.toBeInTheDocument()
  })

  it('3. Renders full Article Post page by slug with author, headings, and lead text', async () => {
    const Component = await BlogPostPage({
      params: Promise.resolve({ slug: 'top-air-purifying-plants-indian-homes' }),
    })
    render(Component)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Top 7 Air-Purifying Indoor Plants Recommended by NASA/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Dr. Arvind Kulkarni')).toBeInTheDocument()
    expect(screen.getByText(/Indoor air in urban Indian metropolitan apartments/i)).toBeInTheDocument()
    expect(screen.getByText(/1. Peace Lily \(Spathiphyllum wallisii\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Featured in this guide/i)).toBeInTheDocument()
  })

  it('4. Allows adding embedded specimen directly to cart from article', async () => {
    render(
      <BlogProductEmbed
        title="Peace Lily Indoor Plant"
        handle="peace-lily-plant"
        price="₹499"
        variantId="var_lily_01"
        thumbnail="/ugaoo-assets/cat-plants.webp"
        categoryName="Living NASA Air-Purifier"
      />
    )

    const addBtn = screen.getByRole('button', { name: /Add Peace Lily Indoor Plant to cart/i })
    fireEvent.click(addBtn)

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('var_lily_01', 1)
      expect(mockOpenDrawer).toHaveBeenCalled()
    })
  })
})
