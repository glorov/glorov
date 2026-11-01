import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ContactPage from '../app/contact/page'

describe('ContactPage Component Tests', () => {
  it('1. Renders contact page with title, quick cards, and inquiry form', () => {
    render(<ContactPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Get in Touch with our Plant Experts/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /WhatsApp Helpline/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Email Inquiries/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Full Name \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Your Message \*/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Inquiry/i })).toBeInTheDocument()
  })

  it('2. Submits inquiry form and displays confirmation message', () => {
    render(<ContactPage />)

    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'Aarav Mehta' } })
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'aarav@example.com' } })
    fireEvent.change(screen.getByLabelText(/Your Message \*/i), { target: { value: 'I need guidance on Monstera watering in monsoon.' } })

    fireEvent.click(screen.getByRole('button', { name: /Submit Inquiry/i }))

    expect(screen.getByRole('heading', { level: 3, name: /Inquiry Received!/i })).toBeInTheDocument()
    expect(screen.getByText(/Thank you,/i)).toBeInTheDocument()
    expect(screen.getByText(/Aarav Mehta/i)).toBeInTheDocument()
  })
})
