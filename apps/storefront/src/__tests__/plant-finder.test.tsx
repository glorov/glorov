import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PlantFinderPage from '@/app/plant-finder/page'
import { PlantFinderQuiz } from '@/app/plant-finder/PlantFinderQuiz'
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

describe('Plant Finder Quiz & Matcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('1. Renders hero title and Question 1 with lighting options', () => {
    render(
      <WishlistProvider>
        <PlantFinderPage />
      </WishlistProvider>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /Find Your Perfect Botanical Match/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Where will your botanical specimen live\?/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Bright Indirect Sunlight')).toBeInTheDocument()
    expect(screen.getByText('Low Ambient Natural Light')).toBeInTheDocument()
  })

  it('2. Navigates forward and backward through the 4-step wizard', () => {
    render(
      <WishlistProvider>
        <PlantFinderQuiz />
      </WishlistProvider>
    )

    // Step 1 -> Click Next
    const nextBtn = screen.getByRole('button', { name: /Next Question/i })
    fireEvent.click(nextBtn)

    // Step 2 Question
    expect(
      screen.getByRole('heading', { level: 2, name: /What is your gardening schedule & experience\?/i })
    ).toBeInTheDocument()

    // Click Previous
    const prevBtn = screen.getByRole('button', { name: /Previous/i })
    fireEvent.click(prevBtn)

    // Back to Step 1
    expect(
      screen.getByRole('heading', { level: 2, name: /Where will your botanical specimen live\?/i })
    ).toBeInTheDocument()
  })

  it('3. Completes all 4 questions and displays curated botanical match results', async () => {
    render(
      <WishlistProvider>
        <PlantFinderQuiz />
      </WishlistProvider>
    )

    // Step 1: Select Low Ambient Light
    fireEvent.click(screen.getByRole('radio', { name: /Low Ambient Natural Light/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }))

    // Step 2: Select Busy Traveler
    fireEvent.click(screen.getByRole('radio', { name: /Busy \/ Frequent Traveler/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }))

    // Step 3: Select Air Purification
    fireEvent.click(screen.getByRole('radio', { name: /Active Air Purification/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }))

    // Step 4: Select Clean Air and Submit
    fireEvent.click(screen.getByRole('radio', { name: /Fresh & Clean Breathing Air/i }))
    fireEvent.click(screen.getByRole('button', { name: /See My Botanical Matches/i }))

    // Results View
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /Your Ideal Botanical Companions/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/Sansevieria Golden Hahnii/i)).toBeInTheDocument()
      expect(screen.getByText(/98% Match/i)).toBeInTheDocument()
    })
  })

  it('4. Allows adding a matched recommendation directly to cart', async () => {
    render(
      <WishlistProvider>
        <PlantFinderQuiz />
      </WishlistProvider>
    )

    // Advance to end with defaults
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Next Question/i }))
    }
    fireEvent.click(screen.getByRole('button', { name: /See My Botanical Matches/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: /Your Ideal Botanical Companions/i })
      ).toBeInTheDocument()
    })

    const addCartBtns = screen.getAllByRole('button', { name: /Add matched .* to cart/i })
    fireEvent.click(addCartBtns[0])

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalled()
      expect(mockOpenDrawer).toHaveBeenCalled()
    })
  })
})
