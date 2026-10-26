import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PincodeChecker } from '../components/shipping/PincodeChecker'
import * as shippingLib from '../lib/shipping'

describe('PincodeChecker Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    if (typeof window !== 'undefined') {
      window.localStorage.clear()
    }
  })

  it('1. Renders the pincode checker input and submit button', () => {
    render(<PincodeChecker />)

    expect(screen.getByText(/Delivery Availability & Timeline/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Check Delivery/i })).toBeInTheDocument()
  })

  it('2. Disables the submit button until 6 digits are entered', () => {
    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)
    const button = screen.getByRole('button', { name: /Check Delivery/i })

    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: '4110' } })
    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: '411001' } })
    expect(button).not.toBeDisabled()
  })

  it('3. Rejects input starting with 0 with immediate validation message', () => {
    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)

    fireEvent.change(input, { target: { value: '012345' } })
    expect(screen.getByText(/Indian PIN codes cannot start with 0/i)).toBeInTheDocument()
  })

  it('4. Sanitizes non-numeric characters and limits length to 6 digits', () => {
    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i) as HTMLInputElement

    fireEvent.change(input, { target: { value: '411-001 ext 99' } })
    expect(input.value).toBe('411001')
  })

  it('5. Successfully verifies serviceable metro PIN and displays delivery estimate + COD badge', async () => {
    vi.spyOn(shippingLib, 'checkPincodeServiceability').mockResolvedValueOnce({
      pincode: '411001',
      serviceable: true,
      status: 'confirmed',
      city: 'Pune',
      state: 'Maharashtra',
      prepaid_eligible: true,
      cod_available: true,
      cod_eligible: true,
      cod_restriction_reason: null,
      estimated_days: 2,
      courier_name: 'Delhivery Air Botanical Express',
      rate_inr: 49,
      rate_source: 'configured_estimate',
      message: 'Serviceable via Express Botanical Air Corridor (2 business days)',
    })

    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)
    const button = screen.getByRole('button', { name: /Check Delivery/i })

    fireEvent.change(input, { target: { value: '411001' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Delivery Confirmed to Pune, Maharashtra/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/2 Business Days/i)).toBeInTheDocument()
    expect(screen.getByText(/Delhivery Air Botanical Express/i)).toBeInTheDocument()
    expect(screen.getByText(/✓ Cash on Delivery Available/i)).toBeInTheDocument()
    expect(screen.getByText(/₹49 Shipping/i)).toBeInTheDocument()
  })

  it('6. Clearly distinguishes unserviceable PIN from serviceable destination', async () => {
    vi.spyOn(shippingLib, 'checkPincodeServiceability').mockResolvedValueOnce({
      pincode: '999999',
      serviceable: false,
      status: 'rejected',
      prepaid_eligible: false,
      cod_available: false,
      cod_eligible: false,
      cod_restriction_reason: 'out_of_service_area',
      message: 'Delivery is currently unavailable to this PIN code region.',
    })

    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)
    const button = screen.getByRole('button', { name: /Check Delivery/i })

    fireEvent.change(input, { target: { value: '999999' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Delivery Unavailable to PIN 999999/i)).toBeInTheDocument()
    })

    expect(
      screen.getByText(/Our logistics partners do not currently service this postal PIN code/i)
    ).toBeInTheDocument()
  })

  it('7. Clearly distinguishes logistics API failure / timeout from unserviceable PIN', async () => {
    vi.spyOn(shippingLib, 'checkPincodeServiceability').mockResolvedValueOnce({
      pincode: '411001',
      serviceable: false,
      status: 'undetermined',
      prepaid_eligible: false,
      cod_available: false,
      cod_eligible: false,
      cod_restriction_reason: 'provider_error',
      message: 'Could not connect to shipping gateway. Please retry.',
    })

    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)
    const button = screen.getByRole('button', { name: /Check Delivery/i })

    fireEvent.change(input, { target: { value: '411001' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(
        screen.getByText(/Logistics Verification Temporarily Unavailable/i)
      ).toBeInTheDocument()
    })

    expect(
      screen.getByText(/Could not connect to the courier serviceability gateway/i)
    ).toBeInTheDocument()
  })

  it('8. Enforces COD restriction for perishable live plants on slow routes', async () => {
    vi.spyOn(shippingLib, 'checkPincodeServiceability').mockResolvedValueOnce({
      pincode: '282001',
      serviceable: true,
      status: 'confirmed',
      city: 'Agra',
      state: 'Uttar Pradesh',
      prepaid_eligible: true,
      cod_available: false,
      cod_eligible: false,
      cod_restriction_reason: 'perishable_transit_guardrail',
      estimated_days: 4,
      courier_name: 'BlueDart Surface Delivery',
      rate_inr: 79,
      rate_source: 'configured_estimate',
      message:
        'Serviceable via Standard Botanical Surface Transit (3-5 business days) — Note: Perishable live plants require prepaid express transit to ensure botanical survival.',
    })

    render(<PincodeChecker isPerishable={true} />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i)
    const button = screen.getByRole('button', { name: /Check Delivery/i })

    fireEvent.change(input, { target: { value: '282001' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Prepaid Orders Only/i)).toBeInTheDocument()
    })

    expect(
      screen.getByText(/Live plants require prepaid express air transit to guarantee botanical viability/i)
    ).toBeInTheDocument()
  })

  it('9. Allows clearing and rechecking with the Change button', async () => {
    vi.spyOn(shippingLib, 'checkPincodeServiceability').mockResolvedValueOnce({
      pincode: '411001',
      serviceable: true,
      status: 'confirmed',
      city: 'Pune',
      state: 'Maharashtra',
      prepaid_eligible: true,
      cod_available: true,
      cod_eligible: true,
      estimated_days: 2,
    })

    render(<PincodeChecker />)
    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i) as HTMLInputElement
    const button = screen.getByRole('button', { name: /Check Delivery/i })

    fireEvent.change(input, { target: { value: '411001' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Delivery Confirmed/i)).toBeInTheDocument()
    })

    const changeBtn = screen.getByRole('button', { name: /Change/i })
    fireEvent.click(changeBtn)

    expect(input.value).toBe('')
    expect(screen.queryByText(/Delivery Confirmed/i)).not.toBeInTheDocument()
  })

  it('10. Initializes with stored pincode from localStorage if available', () => {
    window.localStorage.setItem('glorov_delivery_pincode', '560001')
    render(<PincodeChecker />)

    const input = screen.getByPlaceholderText(/Enter 6-digit Indian PIN/i) as HTMLInputElement
    expect(input.value).toBe('560001')
  })
})
