import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GardeningGuidePage from '../app/gardening-guide/page'

describe('GardeningGuidePage Component Tests', () => {
  it('1. Renders gardening guide with Indian agricultural sowing cycles', () => {
    render(<GardeningGuidePage />)

    expect(screen.getByRole('heading', { level: 1, name: /Indian Horticultural & Gardening Guide/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Kharif Season/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Rabi Season/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Zaid Season/i })).toBeInTheDocument()
  })

  it('2. Renders 4 core care principles and symptoms', () => {
    render(<GardeningGuidePage />)

    expect(screen.getByRole('heading', { level: 3, name: /Sunlight Exposure/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /The Soil Hydration Test/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Yellowing Lower Leaves/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Crispy Brown Leaf Tips/i })).toBeInTheDocument()
  })

  it('3. Renders WhatsApp plant doctor consultation button', () => {
    render(<GardeningGuidePage />)

    const waBtn = screen.getByRole('link', { name: /Consult a Plant Doctor on WhatsApp/i })
    expect(waBtn).toBeInTheDocument()
    expect(waBtn).toHaveAttribute('href', expect.stringContaining('wa.me/918087087224'))
  })
})
