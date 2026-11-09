import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  INDIAN_STATES,
  isValidPinCode,
  isValidIndianPhone,
  isValidIndianState,
  validateIndianAddress,
} from '../../src/lib/validation/address'
import {
  mapMedusaAddress,
  toMedusaAddressPayload,
} from '../../src/lib/api/addresses'
import { AddressCard } from '../../src/components/account/AddressCard'
import { AddressModal } from '../../src/components/account/AddressModal'
import { CheckoutAddressForm } from '../../src/components/checkout/CheckoutAddressForm'
import { CustomerAuthProvider, useCustomerAuth } from '../../src/context/CustomerAuthContext'
import type { CustomerAddress } from '../../src/types/account'

describe('Indian Address Validation (GLOROV-ADDR-001)', () => {
  it('validates 6-digit PIN code matching /^[1-9][0-9]{5}$/', () => {
    // Valid Indian PINs (first digit 1-9, exactly 6 digits)
    expect(isValidPinCode('560001')).toBe(true)
    expect(isValidPinCode('411001')).toBe(true)
    expect(isValidPinCode('110001')).toBe(true)
    expect(isValidPinCode('700001')).toBe(true)

    // Invalid PINs
    expect(isValidPinCode('012345')).toBe(false) // Leading 0 is invalid in Indian postal code
    expect(isValidPinCode('56000')).toBe(false) // 5 digits
    expect(isValidPinCode('5600001')).toBe(false) // 7 digits
    expect(isValidPinCode('ABCDEF')).toBe(false) // Non-numeric
    expect(isValidPinCode('')).toBe(false)
    expect(isValidPinCode(null)).toBe(false)
    expect(isValidPinCode(undefined)).toBe(false)
  })

  it('validates 10-digit Indian mobile numbers', () => {
    // Valid 10-digit mobile numbers
    expect(isValidIndianPhone('9876543210')).toBe(true)
    expect(isValidIndianPhone('8123456789')).toBe(true)
    expect(isValidIndianPhone('7001234567')).toBe(true)
    expect(isValidIndianPhone('6234567890')).toBe(true)
    expect(isValidIndianPhone('+919876543210')).toBe(true)

    // Invalid phone numbers
    expect(isValidIndianPhone('12345')).toBe(false)
    expect(isValidIndianPhone('987654321000')).toBe(false)
    expect(isValidIndianPhone('')).toBe(false)
    expect(isValidIndianPhone(null)).toBe(false)
  })

  it('validates Indian state and union territory names', () => {
    expect(INDIAN_STATES.length).toBe(36)
    expect(isValidIndianState('Karnataka')).toBe(true)
    expect(isValidIndianState('karnataka')).toBe(true) // Case insensitive
    expect(isValidIndianState('Maharashtra')).toBe(true)
    expect(isValidIndianState('Delhi')).toBe(true)
    expect(isValidIndianState('Jammu and Kashmir')).toBe(true)
    expect(isValidIndianState('Ladakh')).toBe(true)

    // Invalid state
    expect(isValidIndianState('California')).toBe(false)
    expect(isValidIndianState('London')).toBe(false)
    expect(isValidIndianState('')).toBe(false)
  })

  it('validateIndianAddress enforces all required rules', () => {
    const invalidResult = validateIndianAddress({
      fullName: 'A',
      phoneNumber: '12345',
      addressLine1: 'Way',
      city: '',
      state: 'UnknownState',
      pincode: '012345',
    })
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.errors.fullName).toBeDefined()
    expect(invalidResult.errors.phoneNumber).toBeDefined()
    expect(invalidResult.errors.addressLine1).toBeDefined()
    expect(invalidResult.errors.city).toBeDefined()
    expect(invalidResult.errors.state).toBeDefined()
    expect(invalidResult.errors.pincode).toBeDefined()

    const validResult = validateIndianAddress({
      fullName: 'Siddharth Rao',
      phoneNumber: '9876543210',
      addressLine1: 'Flat 102, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
    })
    expect(validResult.isValid).toBe(true)
    expect(Object.keys(validResult.errors).length).toBe(0)
  })
})

describe('Medusa Address Mapping & Payload Transformation', () => {
  it('maps Medusa customer address response to storefront CustomerAddress', () => {
    const rawMedusa = {
      id: 'addr_medusa_01',
      address_name: 'Garden Terrace',
      first_name: 'Aarav',
      last_name: 'Sharma',
      phone: '9876543210',
      address_1: 'Flat 402, Green Meadows',
      address_2: 'Indiranagar',
      city: 'Bengaluru',
      province: 'Karnataka',
      postal_code: '560038',
      country_code: 'in',
      is_default_shipping: true,
    }

    const mapped = mapMedusaAddress(rawMedusa)
    expect(mapped.id).toBe('addr_medusa_01')
    expect(mapped.name).toBe('Garden Terrace')
    expect(mapped.fullName).toBe('Aarav Sharma')
    expect(mapped.phoneNumber).toBe('9876543210')
    expect(mapped.addressLine1).toBe('Flat 402, Green Meadows')
    expect(mapped.addressLine2).toBe('Indiranagar')
    expect(mapped.city).toBe('Bengaluru')
    expect(mapped.state).toBe('Karnataka')
    expect(mapped.pincode).toBe('560038')
    expect(mapped.countryCode).toBe('in')
    expect(mapped.isDefault).toBe(true)
  })

  it('transforms storefront CustomerAddress to Medusa address payload', () => {
    const storefrontAddress: Omit<CustomerAddress, 'id'> = {
      name: 'Farmhouse',
      fullName: 'Sunita Menon',
      phoneNumber: '9123456789',
      addressLine1: 'Plot 15, Botanical Orchard',
      addressLine2: 'Off Bannerghatta Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560083',
      countryCode: 'in',
      isDefault: true,
    }

    const payload = toMedusaAddressPayload(storefrontAddress)
    expect(payload.address_name).toBe('Farmhouse')
    expect(payload.first_name).toBe('Sunita')
    expect(payload.last_name).toBe('Menon')
    expect(payload.phone).toBe('9123456789')
    expect(payload.address_1).toBe('Plot 15, Botanical Orchard')
    expect(payload.address_2).toBe('Off Bannerghatta Road')
    expect(payload.city).toBe('Bengaluru')
    expect(payload.province).toBe('Karnataka')
    expect(payload.postal_code).toBe('560083')
    expect(payload.country_code).toBe('in')
    expect(payload.is_default_shipping).toBe(true)
  })
})

describe('AddressCard & Default Address Setting', () => {
  const sampleCardAddress: CustomerAddress = {
    id: 'addr_card_01',
    name: 'Home',
    fullName: 'Priya Nair',
    phoneNumber: '9876543210',
    addressLine1: 'Flat 101, Orchids Avenue',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    countryCode: 'in',
    isDefault: false,
  }

  it('renders Set as Default button for non-default address and triggers callback', () => {
    const onSetDefault = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <AddressCard
        address={sampleCardAddress}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
      />
    )

    const setDefaultBtn = screen.getByText('Set as Default')
    expect(setDefaultBtn).toBeDefined()
    fireEvent.click(setDefaultBtn)
    expect(onSetDefault).toHaveBeenCalledWith('addr_card_01')
  })

  it('renders Default badge and hides Set as Default button for default address', () => {
    const defaultAddress = { ...sampleCardAddress, isDefault: true }
    const onSetDefault = vi.fn()

    render(
      <AddressCard
        address={defaultAddress}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onSetDefault={onSetDefault}
      />
    )

    expect(screen.getByText('Default')).toBeDefined()
    expect(screen.queryByText('Set as Default')).toBeNull()
  })
})

describe('AddressModal Form Validation', () => {
  it('blocks submission and highlights errors for invalid PIN code', async () => {
    const onSave = vi.fn()

    render(
      <AddressModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />
    )

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Rohan Sharma' } })
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } })
    fireEvent.change(screen.getByLabelText(/Address Line 1/i), { target: { value: '102 Green Acres' } })
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Pune' } })
    fireEvent.change(screen.getByLabelText(/Pincode/i), { target: { value: '012345' } }) // Invalid leading 0

    fireEvent.click(screen.getByText('Save Address'))

    expect(screen.getByText(/Must be a 6-digit Indian PIN code/i)).toBeDefined()
    expect(onSave).not.toHaveBeenCalled()
  })
})

describe('CheckoutAddressForm Saved Address Selection', () => {
  const savedTestAddresses: CustomerAddress[] = [
    {
      id: 'addr_saved_01',
      name: 'Primary Residence',
      fullName: 'Aarav Sharma',
      phoneNumber: '9876543210',
      addressLine1: 'Flat 402, Green Meadows',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      countryCode: 'in',
      isDefault: true,
    },
    {
      id: 'addr_saved_02',
      name: 'Studio Nursery',
      fullName: 'Aarav Sharma',
      phoneNumber: '9123456789',
      addressLine1: 'Plot 88, Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      countryCode: 'in',
      isDefault: false,
    },
  ]

  it('renders address selection cards and selects address with 1 click', () => {
    const onChange = vi.fn()

    render(
      <CheckoutAddressForm
        initialAddress={null}
        onChange={onChange}
        savedAddresses={savedTestAddresses}
        customerEmail="aarav@glorov.in"
      />
    )

    expect(screen.getByText('Select Delivery Location')).toBeDefined()
    expect(screen.getByText('Primary Residence')).toBeDefined()
    expect(screen.getByText('Studio Nursery')).toBeDefined()

    // Click on Studio Nursery
    fireEvent.click(screen.getByText('Studio Nursery'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Aarav Sharma',
        pincode: '560066',
        addressLine1: 'Plot 88, Whitefield Main Road',
      }),
      true
    )
  })

  it('allows switching to enter a new delivery address with Indian format validation', () => {
    const onChange = vi.fn()

    render(
      <CheckoutAddressForm
        initialAddress={null}
        onChange={onChange}
        savedAddresses={savedTestAddresses}
        customerEmail="aarav@glorov.in"
      />
    )

    const newAddrBtn = screen.getByText('+ Deliver to a New Address')
    fireEvent.click(newAddrBtn)

    expect(screen.getByText(/Entering a new shipping destination/i)).toBeDefined()
    expect(screen.getByLabelText(/Flat, House No., Building, Street/i)).toBeDefined()
  })

  it('calls onSetDefaultAddress when "Set as Default" button is clicked on a non-default address card', () => {
    const onChange = vi.fn()
    const onSetDefault = vi.fn().mockResolvedValue(true)

    render(
      <CheckoutAddressForm
        initialAddress={null}
        onChange={onChange}
        savedAddresses={savedTestAddresses}
        customerEmail="aarav@glorov.in"
        onSetDefaultAddress={onSetDefault}
      />
    )

    // Studio Nursery is not default, so it should have a 'Set as Default' button
    const setDefaultBtn = screen.getByText('Set as Default')
    expect(setDefaultBtn).toBeDefined()

    fireEvent.click(setDefaultBtn)
    expect(onSetDefault).toHaveBeenCalledWith('addr_saved_02')
  })
})

describe('CustomerAuthContext Address State & Default Management', () => {
  function TestAddressesConsumer() {
    const {
      addresses,
      addAddress,
      deleteAddress,
      setDefaultAddress,
      login,
    } = useCustomerAuth()

    return (
      <div>
        <button onClick={() => login('demo@glorov.in', 'password123')} data-testid="login-btn">
          Login
        </button>
        <span data-testid="addr-count">{addresses.length}</span>
        <span data-testid="default-addr-id">
          {addresses.find((a) => a.isDefault)?.id || 'none'}
        </span>
        <button
          data-testid="add-second-addr"
          onClick={() =>
            addAddress({
              name: 'Office',
              fullName: 'Demo Customer',
              phoneNumber: '9876543210',
              addressLine1: 'Flora Tech Park',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              countryCode: 'in',
              isDefault: false,
            })
          }
        >
          Add Second
        </button>
        <button
          data-testid="set-default-btn"
          onClick={() => {
            const nonDefault = addresses.find((a) => !a.isDefault)
            if (nonDefault) setDefaultAddress(nonDefault.id)
          }}
        >
          Set Other Default
        </button>
        <button
          data-testid="delete-btn"
          onClick={() => {
            if (addresses.length > 0) deleteAddress(addresses[0].id)
          }}
        >
          Delete First
        </button>
      </div>
    )
  }

  it('supports address addition, setting default, and deletion', async () => {
    render(
      <CustomerAuthProvider>
        <TestAddressesConsumer />
      </CustomerAuthProvider>
    )

    // Log into demo
    fireEvent.click(screen.getByTestId('login-btn'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('addr-count').textContent)).toBeGreaterThanOrEqual(1)
    })

    const initialCount = Number(screen.getByTestId('addr-count').textContent)
    const initialDefaultId = screen.getByTestId('default-addr-id').textContent

    // Add second address
    fireEvent.click(screen.getByTestId('add-second-addr'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('addr-count').textContent)).toBe(initialCount + 1)
    })

    // Set other address as default
    fireEvent.click(screen.getByTestId('set-default-btn'))
    await waitFor(() => {
      const newDefaultId = screen.getByTestId('default-addr-id').textContent
      expect(newDefaultId).not.toBe('none')
      expect(newDefaultId).not.toBe(initialDefaultId)
    })

    // Delete address
    const countBeforeDel = Number(screen.getByTestId('addr-count').textContent)
    fireEvent.click(screen.getByTestId('delete-btn'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('addr-count').textContent)).toBe(countBeforeDel - 1)
    })
  })
})
