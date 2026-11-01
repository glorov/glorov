import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FaqPage from '@/app/faq/page'
import { FaqFilter } from '@/app/faq/FaqFilter'

describe('Horticultural Care & FAQ Page', () => {
  it('1. Renders header, search input, category filters, and initial open FAQ questions', () => {
    render(<FaqPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Frequently Asked Questions/i })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Search by topic, e.g. watering, yellow leaves/i)
    ).toBeInTheDocument()

    // Default open question
    expect(
      screen.getByText(/What should I do immediately when my live plant parcel arrives\?/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Unbox the plant gently in a shaded area/i)).toBeInTheDocument()
  })

  it('2. Filters questions dynamically when user types a search query', () => {
    render(<FaqFilter />)

    const searchInput = screen.getByPlaceholderText(/Search by topic/i)
    fireEvent.change(searchInput, { target: { value: 'finger test' } })

    expect(
      screen.getByText(/How do I know when it is the exact right time to water my plant\?/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Why are live botanical parcels dispatched only Monday through Thursday\?/i)
    ).not.toBeInTheDocument()
  })

  it('3. Filters questions by category pill tabs', () => {
    render(<FaqFilter />)

    const packagingTab = screen.getByRole('tab', { name: /Moisture-Shield Packaging/i })
    fireEvent.click(packagingTab)

    expect(
      screen.getByText(/How do live plants survive up to 5 days of transit inside a closed carton\?/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Why is there 0% GST on all GLOROV agricultural and flower seeds\?/i)
    ).not.toBeInTheDocument()
  })

  it('4. Allows toggling accordion item open and closed', () => {
    render(<FaqFilter />)

    const toggleBtn = screen.getByRole('button', {
      name: /How do live plants survive up to 5 days of transit inside a closed carton\?/i,
    })

    // It was open initially, click to close
    fireEvent.click(toggleBtn)
    expect(screen.queryByText(/aerated coco-peat root encasing/i)).not.toBeInTheDocument()

    // Click again to reopen
    fireEvent.click(toggleBtn)
    expect(screen.getByText(/aerated coco-peat root encasing/i)).toBeInTheDocument()
  })

  it('5. Displays friendly empty state when no questions match search', () => {
    render(<FaqFilter />)

    const searchInput = screen.getByPlaceholderText(/Search by topic/i)
    fireEvent.change(searchInput, { target: { value: 'xyzrandomquerythatmatchesnothing' } })

    expect(
      screen.getByText(/No questions matching “xyzrandomquerythatmatchesnothing”/i)
    ).toBeInTheDocument()
  })
})
