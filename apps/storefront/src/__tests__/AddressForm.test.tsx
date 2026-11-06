import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AddressForm } from '../components/checkout/AddressForm'
import type { DeliveryAddress } from '../types/checkout'
import type { CustomerAddress } from '../types/account'

const mockInitialAddress: DeliveryAddress = {
  fullName: 'Priya Nair',
  phoneNumber: '9876543210',
  email: 'priya.nair@example.com',
  addressLine1: 'Flat 402, Green Meadows, Koregaon Park',
  addressLine2: 'Lane 5, Near Botanical Garden Gate 2',
  landmark: 'Next to Blossom Orchid Cafe',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411001',
  countryCode: 'in',
}

describe('AddressForm Component Tests (AddressForm.test.tsx)', () => {
  it('renders all Indian address input fields with labels', () => {
    const handleChange = vi.fn()

    render(
      <AddressForm
        initialAddress={mockInitialAddress}
        onChange={handleChange}
      />
    )

    expect(screen.getByLabelText(/full name/i)).toBeDefined()
    expect(screen.getByLabelText(/10-digit mobile phone/i)).toBeDefined()
    expect(screen.getByLabelText(/email for order receipt/i)).toBeDefined()
    expect(screen.getByLabelText(/flat, house no/i)).toBeDefined()
    expect(screen.getByLabelText(/pin code/i)).toBeDefined()
    expect(screen.getByLabelText(/city/i)).toBeDefined()
    expect(screen.getByLabelText(/state/i)).toBeDefined()
  })

  it('populates fields with initial address values', () => {
    render(
      <AddressForm
        initialAddress={mockInitialAddress}
        onChange={vi.fn()}
      />
    )

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    const phoneInput = screen.getByLabelText(/10-digit mobile phone/i) as HTMLInputElement
    const pinInput = screen.getByLabelText(/pin code/i) as HTMLInputElement
    const stateSelect = screen.getByLabelText(/state/i) as HTMLSelectElement

    expect(nameInput.value).toBe('Priya Nair')
    expect(phoneInput.value).toBe('9876543210')
    expect(pinInput.value).toBe('411001')
    expect(stateSelect.value).toBe('Maharashtra')
  })

  it('validates 6-digit Indian PIN code and displays error for invalid PIN', () => {
    const handleChange = vi.fn()

    render(
      <AddressForm
        initialAddress={mockInitialAddress}
        onChange={handleChange}
      />
    )

    const pinInput = screen.getByLabelText(/pin code/i)

    // Enter invalid PIN code starting with 0
    fireEvent.change(pinInput, { target: { value: '012345' } })
    expect(screen.getByText(/Must be a valid 6-digit PIN/i)).toBeDefined()
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pincode: '012345' }),
      false
    )

    // Enter valid PIN code
    fireEvent.change(pinInput, { target: { value: '560038' } })
    expect(screen.queryByText(/Must be a valid 6-digit PIN/i)).toBeNull()
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pincode: '560038' }),
      true
    )
  })

  it('validates 10-digit Indian phone number', () => {
    const handleChange = vi.fn()

    render(
      <AddressForm
        initialAddress={mockInitialAddress}
        onChange={handleChange}
      />
    )

    const phoneInput = screen.getByLabelText(/10-digit mobile phone/i)

    // Enter invalid phone (too short)
    fireEvent.change(phoneInput, { target: { value: '98765' } })
    expect(screen.getByText(/Must be a 10-digit Indian mobile number/i)).toBeDefined()
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ phoneNumber: '98765' }),
      false
    )

    // Enter valid 10-digit Indian phone
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    expect(screen.queryByText(/Must be a 10-digit Indian mobile number/i)).toBeNull()
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ phoneNumber: '9876543210' }),
      true
    )
  })

  it('validates state selection from recognized Indian states', () => {
    const handleChange = vi.fn()

    render(
      <AddressForm
        initialAddress={mockInitialAddress}
        onChange={handleChange}
      />
    )

    const stateSelect = screen.getByLabelText(/state/i)

    fireEvent.change(stateSelect, { target: { value: 'Karnataka' } })
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: 'Karnataka' }),
      true
    )
  })

  it('renders saved addresses selection for returning authenticated customer', () => {
    const savedAddresses: CustomerAddress[] = [
      {
        id: 'addr_saved_01',
        name: 'Home Nursery',
        fullName: 'Aarav Sharma',
        phoneNumber: '9876543210',
        addressLine1: '402 Green Meadows',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        countryCode: 'in',
        isDefault: true,
      },
    ]

    render(
      <AddressForm
        initialAddress={null}
        savedAddresses={savedAddresses}
        customerEmail="aarav@example.com"
        onChange={vi.fn()}
      />
    )

    // Saved address cards should appear
    expect(screen.getByText(/Deliver to this address/i)).toBeDefined()
    expect(screen.getByText('Aarav Sharma')).toBeDefined()
    expect(screen.getAllByText(/560038/).length).toBeGreaterThan(0)
  })
})
