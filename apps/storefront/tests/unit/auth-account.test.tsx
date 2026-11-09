import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccountNavSidebar } from '../../src/components/account/AccountNavSidebar'
import { AddressCard } from '../../src/components/account/AddressCard'
import { AddressModal } from '../../src/components/account/AddressModal'
import { OrderHistoryCard } from '../../src/components/account/OrderHistoryCard'
import { CustomerAuthProvider, useCustomerAuth } from '../../src/context/CustomerAuthContext'
import type { CustomerAddress, CustomerOrder } from '../../src/types/account'
import LoginPage from '../../src/app/auth/login/page'
import SignupPage from '../../src/app/auth/signup/page'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/account',
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirect' ? '/account' : null),
  }),
}))

const sampleAddress: CustomerAddress = {
  id: 'addr_test_01',
  name: 'Home / Terrace Garden',
  fullName: 'Aarav Sharma',
  phoneNumber: '9876543210',
  addressLine1: 'Flat 402, Green Meadows, Indiranagar',
  addressLine2: 'Near Indiranagar Metro Station',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  countryCode: 'in',
  isDefault: true,
}

const sampleOrder: CustomerOrder = {
  id: 'ord_test_01',
  displayId: 'GLR-881920',
  createdAt: '28 Oct 2026, 03:45 PM',
  status: 'shipped',
  paymentStatus: 'captured',
  fulfillmentStatus: 'shipped',
  totalAmount: 763,
  itemCount: 2,
  items: [
    {
      id: 'item-01',
      productId: 'green-chilli-seeds',
      title: 'Green Chilli Seeds (Heirloom)',
      variantName: '100 Seeds Value Pack',
      price: 99,
      quantity: 2,
      image: 'https://res.cloudinary.com/naodmm8w/image/upload/v1793571735/glorov/products/vegetable-seeds/green-chilli-seeds-1.png',
    },
  ],
  shippingAddress: sampleAddress,
  carrierName: 'Shiprocket Botanical Cold-Chain',
  trackingCode: 'SR-GLR-9921820',
  estimatedDeliveryDate: '04 Nov 2026',
}

describe('Account — AccountNavSidebar', () => {
  it('renders guest mode for unauthenticated visitors and navigation tabs', () => {
    render(
      <CustomerAuthProvider>
        <AccountNavSidebar />
      </CustomerAuthProvider>
    )

    expect(screen.getByText('Guest Customer')).toBeDefined()
    expect(screen.getByText('Sign in to access your botanical profile')).toBeDefined()
    expect(screen.getByText('Sign In / Register →')).toBeDefined()
    expect(screen.getByText('Account Overview')).toBeDefined()
    expect(screen.getByText('Personal Profile')).toBeDefined()
    expect(screen.getByText('Delivery Addresses')).toBeDefined()
    expect(screen.getByText('Order History & Tracking')).toBeDefined()
    expect(screen.getByText('Botanical Wishlist')).toBeDefined()
    expect(screen.getByText('Notifications')).toBeDefined()
  })
})

describe('Account — AddressCard', () => {
  it('renders address details, default badge, and handles edit/delete triggers', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <AddressCard
        address={sampleAddress}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Home / Terrace Garden')).toBeDefined()
    expect(screen.getByText('Aarav Sharma')).toBeDefined()
    expect(screen.getByText('Flat 402, Green Meadows, Indiranagar')).toBeDefined()
    expect(screen.getByText('Default')).toBeDefined()

    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith(sampleAddress)

    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('addr_test_01')
  })
})

describe('Account — AddressModal', () => {
  it('validates form fields and calls onSave', async () => {
    const onSave = vi.fn().mockResolvedValue(true)
    const onClose = vi.fn()

    render(
      <AddressModal
        isOpen={true}
        onClose={onClose}
        onSave={onSave}
      />
    )

    // Fill form
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Priya Patel' } })
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9123456789' } })
    fireEvent.change(screen.getByLabelText(/Address Line 1/i), { target: { value: '12 Gardenia Road' } })
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Mumbai' } })
    fireEvent.change(screen.getByLabelText(/Pincode/i), { target: { value: '400001' } })

    fireEvent.click(screen.getByText('Save Address'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })
})

describe('Account — OrderHistoryCard & OrderTrackingModal', () => {
  it('renders order summary and opens tracking modal on click', () => {
    render(<OrderHistoryCard order={sampleOrder} />)

    expect(screen.getByText('GLR-881920')).toBeDefined()
    expect(screen.getByText('shipped')).toBeDefined()
    expect(screen.getByText('Green Chilli Seeds (Heirloom)')).toBeDefined()
    expect(screen.getByText('₹198')).toBeDefined()

    const trackBtn = screen.getByText('Track Order')
    fireEvent.click(trackBtn)

    // Modal content should now be visible
    expect(screen.getByText('Consignment Journey')).toBeDefined()
    expect(screen.getByText('Order Confirmed & Verified')).toBeDefined()
    expect(screen.getByText('Botanical Quality Check & Hydro-Packed')).toBeDefined()
    expect(screen.getByText('Cold-Chain Dispatch & In Transit')).toBeDefined()
    expect(screen.getByText('Shiprocket Botanical Cold-Chain')).toBeDefined()
    expect(screen.getByText('AWB: SR-GLR-9921820')).toBeDefined()
  })
})

describe('CustomerAuthContext — State Management & CRUD', () => {
  function TestAuthConsumer() {
    const {
      customer,
      login,
      updateProfile,
      addresses,
      addAddress,
      deleteAddress,
      notifications,
      markNotificationAsRead,
    } = useCustomerAuth()

    return (
      <div>
        <span data-testid="user-name">{customer?.firstName || 'Guest'}</span>
        <button
          onClick={() => login('demo@glorov.in', 'password123')}
          data-testid="demo-login-btn"
        >
          Demo Login
        </button>
        <button
          onClick={() => updateProfile({ firstName: 'Rohan' })}
          data-testid="update-btn"
        >
          Update
        </button>

        <span data-testid="address-count">{addresses.length}</span>
        <button
          onClick={() =>
            addAddress({
              name: 'Farmhouse',
              fullName: 'Demo Customer',
              phoneNumber: '9876543210',
              addressLine1: 'NH-44 Farm Lane',
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '562157',
              countryCode: 'in',
              isDefault: false,
            })
          }
          data-testid="add-addr-btn"
        >
          Add Address
        </button>
        <button
          onClick={() => deleteAddress(addresses[0]?.id || '')}
          data-testid="del-addr-btn"
        >
          Delete Address
        </button>

        <span data-testid="notif-read-status">
          {notifications[0]?.isRead ? 'read' : 'unread'}
        </span>
        <button
          onClick={() => markNotificationAsRead(notifications[0]?.id || '')}
          data-testid="mark-notif-btn"
        >
          Mark Notif
        </button>
      </div>
    )
  }

  it('handles customer profile update, address CRUD, and notification reads', async () => {
    render(
      <CustomerAuthProvider>
        <TestAuthConsumer />
      </CustomerAuthProvider>
    )

    // Initial visitor is guest
    expect(screen.getByTestId('user-name').textContent).toBe('Guest')

    // Perform login (demo account)
    fireEvent.click(screen.getByTestId('demo-login-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Demo')
    })

    // Profile update
    fireEvent.click(screen.getByTestId('update-btn'))
    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Rohan')
    })

    // Address addition
    const initialCount = Number(screen.getByTestId('address-count').textContent)
    fireEvent.click(screen.getByTestId('add-addr-btn'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('address-count').textContent)).toBe(initialCount + 1)
    })

    // Address deletion
    fireEvent.click(screen.getByTestId('del-addr-btn'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('address-count').textContent)).toBe(initialCount)
    })

    // Notification read
    expect(screen.getByTestId('notif-read-status').textContent).toBe('unread')
    fireEvent.click(screen.getByTestId('mark-notif-btn'))
    expect(screen.getByTestId('notif-read-status').textContent).toBe('read')
  })
})

describe('Auth Pages — Login and Registration', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('renders login page with email/password inputs and handles demo login', async () => {
    render(
      <CustomerAuthProvider>
        <LoginPage />
      </CustomerAuthProvider>
    )

    expect(screen.getByText('Welcome Back')).toBeDefined()
    expect(screen.getByLabelText('Email Address')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()

    // Fill credentials and sign in
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'demo@glorov.in' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/account')
    })
  })

  it('renders registration page and validates required fields', () => {
    render(
      <CustomerAuthProvider>
        <SignupPage />
      </CustomerAuthProvider>
    )

    expect(screen.getAllByText('Create Account').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('First Name *')).toBeDefined()
    expect(screen.getByLabelText('Last Name *')).toBeDefined()
    expect(screen.getByLabelText('Email Address *')).toBeDefined()
    expect(screen.getByLabelText('Mobile Phone *')).toBeDefined()
    expect(screen.getByLabelText('Password (min 8 chars) *')).toBeDefined()
    expect(screen.getByLabelText('Confirm Password *')).toBeDefined()
  })

  it('navigates seamlessly between Step 1 (Personal Details) and Step 2 (Password) preserving data', async () => {
    render(
      <CustomerAuthProvider>
        <SignupPage />
      </CustomerAuthProvider>
    )

    // Initial state: Step 1 active
    expect(screen.getByText('1. Personal Details')).toBeDefined()
    expect(screen.getByText('2. Set Password')).toBeDefined()

    const firstNameInput = screen.getByLabelText('First Name *')
    const lastNameInput = screen.getByLabelText('Last Name *')
    const emailInput = screen.getByLabelText('Email Address *')
    const phoneInput = screen.getByLabelText('Mobile Phone *')
    const nextBtn = screen.getByRole('button', { name: /continue to set password/i })

    // Next button is disabled initially
    expect((nextBtn as HTMLButtonElement).disabled).toBe(true)

    // Fill Step 1 fields
    fireEvent.change(firstNameInput, { target: { value: 'Sourav' } })
    fireEvent.change(lastNameInput, { target: { value: 'Patron' } })
    fireEvent.change(emailInput, { target: { value: 'sourav@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })

    // Now Step 1 button is enabled
    expect((nextBtn as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(nextBtn)

    // Step 2 shows summary pill and back button
    expect(screen.getByText(/Sourav Patron/)).toBeDefined()
    expect(screen.getByText(/sourav@example.com • \+91 9876543210/)).toBeDefined()

    // Test going back to Step 1
    const backBtn = screen.getByRole('button', { name: /← back/i })
    fireEvent.click(backBtn)

    // Data should be preserved
    expect((screen.getByLabelText('First Name *') as HTMLInputElement).value).toBe('Sourav')
    expect((screen.getByLabelText('Email Address *') as HTMLInputElement).value).toBe('sourav@example.com')

    // Advance to Step 2 again
    fireEvent.click(screen.getByRole('button', { name: /continue to set password/i }))

    // Fill password in Step 2
    const passwordInput = screen.getByLabelText('Password (min 8 chars) *')
    const confirmInput = screen.getByLabelText('Confirm Password *')
    fireEvent.change(passwordInput, { target: { value: 'StrongBotanicalPass123' } })
    fireEvent.change(confirmInput, { target: { value: 'StrongBotanicalPass123' } })

    expect(screen.getByText(/✓ Match/i)).toBeDefined()
    const submitBtn = screen.getByRole('button', { name: /create patron account/i })
    expect((submitBtn as HTMLButtonElement).disabled).toBe(false)
  })
})
