import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import NurseryPage from '@/app/nursery/page'

describe('Pune Nursery & Experiential Studios Page', () => {
  it('1. Renders hero title, nursery origin story, and facility statistics', () => {
    render(<NurseryPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Where Green Vitality Begins: Our Pune Mother Nursery/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('25 Acres')).toBeInTheDocument()
    expect(screen.getByText('105+')).toBeInTheDocument()
    expect(screen.getByText('50k+')).toBeInTheDocument()
  })

  it('2. Renders 4 in-person nursery experiential services', () => {
    render(<NurseryPage />)

    expect(screen.getByText('Polyhouse Selection Walk')).toBeInTheDocument()
    expect(screen.getByText('Free Organic Repotting')).toBeInTheDocument()
    expect(screen.getByText('Weekend Gardening Workshops')).toBeInTheDocument()
    expect(screen.getByText('Drop-In Plant Doctor')).toBeInTheDocument()
  })

  it('3. Renders flagship locations in Pune, Mumbai, and Bengaluru with Google Maps links', () => {
    render(<NurseryPage />)

    expect(screen.getByText('Pune Mother Propagation Hub')).toBeInTheDocument()
    expect(screen.getByText(/Hadapsar-Manjri Green Belt, Pune/i)).toBeInTheDocument()

    expect(screen.getByText('Mumbai Botanical Studio')).toBeInTheDocument()
    expect(screen.getByText(/Near Bandra Station West/i)).toBeInTheDocument()

    expect(screen.getByText('Bengaluru Garden Loft')).toBeInTheDocument()
    expect(screen.getByText(/Indiranagar, Bengaluru/i)).toBeInTheDocument()

    const directionLinks = screen.getAllByRole('link', { name: /Get directions to/i })
    expect(directionLinks.length).toBe(3)
  })
})
