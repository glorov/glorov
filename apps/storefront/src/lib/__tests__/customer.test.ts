import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  customerRegistrationSchema,
  customerLoginSchema,
  customerProfileUpdateSchema,
  customerAddressInputSchema,
  customerPasswordUpdateSchema,
  customerPasswordResetSchema,
} from '@glorov/types'
import {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  updateCustomerProfile,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  getCustomerOrders,
  getCustomerOrder,
  associateCartWithCustomer,
  requestPasswordReset,
  updateCustomerPassword,
  resetCustomerPassword,
} from '../customer'
import { getOrder } from '../cart'
import { medusaClient } from '../medusa-client'

// Mock medusaClient for cart/order tests
vi.mock('../medusa-client', () => ({
  MEDUSA_BACKEND_URL: 'http://localhost:9000',
  MEDUSA_PUBLISHABLE_KEY: 'pk_test',
  medusaClient: {
    store: {
      order: {
        retrieve: vi.fn(),
      },
    },
  },
}))

// Mock global fetch
const globalFetch = vi.fn()
global.fetch = globalFetch

describe('Storefront Customer Authentication & Account System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. Zod Input Validation Schemas', () => {
    it('accepts valid registration input', () => {
      const valid = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: 'AARAV.SHARMA@EXAMPLE.COM',
        password: 'Password123!',
        phone: '9876543210',
      }
      const res = customerRegistrationSchema.safeParse(valid)
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.email).toBe('aarav.sharma@example.com')
      }
    })

    it('rejects registration with short password (<8 characters)', () => {
      const invalid = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: 'aarav@example.com',
        password: 'pass',
      }
      const res = customerRegistrationSchema.safeParse(invalid)
      expect(res.success).toBe(false)
      if (!res.success) {
        expect(res.error.errors[0].message).toContain('at least 8 characters')
      }
    })

    it('rejects registration with invalid email format', () => {
      const invalid = {
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: 'not-an-email',
        password: 'Password123!',
      }
      const res = customerRegistrationSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it('accepts valid login input and lowercases email', () => {
      const res = customerLoginSchema.safeParse({
        email: 'Customer@Glorov.in',
        password: 'SecurePassword123!',
      })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.email).toBe('customer@glorov.in')
      }
    })

    it('rejects login with empty password', () => {
      const res = customerLoginSchema.safeParse({
        email: 'customer@glorov.in',
        password: '',
      })
      expect(res.success).toBe(false)
    })

    it('validates customer address schema with Indian PIN code and 10-digit mobile', () => {
      const validAddress = {
        address_name: 'Home Nursery',
        first_name: 'Priya',
        last_name: 'Nair',
        address_1: 'Flat 402, Green Meadows, MG Road',
        address_2: 'Near Botanical Park',
        city: 'Bengaluru',
        province: 'Karnataka',
        postal_code: '560001',
        phone: '9876543210',
        country_code: 'in' as const,
        is_default_shipping: true,
      }
      const res = customerAddressInputSchema.safeParse(validAddress)
      expect(res.success).toBe(true)
    })

    it('rejects address with invalid 6-digit Indian PIN code starting with 0', () => {
      const invalid = {
        first_name: 'Priya',
        last_name: 'Nair',
        address_1: 'Flat 402, Green Meadows',
        city: 'Bengaluru',
        province: 'Karnataka',
        postal_code: '060001',
        phone: '9876543210',
      }
      const res = customerAddressInputSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it('rejects address with non-cellular Indian phone number', () => {
      const invalid = {
        first_name: 'Priya',
        last_name: 'Nair',
        address_1: 'Flat 402, Green Meadows',
        city: 'Bengaluru',
        province: 'Karnataka',
        postal_code: '560001',
        phone: '1234567890',
      }
      const res = customerAddressInputSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it('validates customer profile update schema', () => {
      const res = customerProfileUpdateSchema.safeParse({
        first_name: 'Aarav',
        last_name: 'Sharma',
        phone: '9876543210',
        company_name: 'Glorov Nursery',
      })
      expect(res.success).toBe(true)
    })

    it('rejects registration with invalid non-empty Indian mobile number', () => {
      const res = customerRegistrationSchema.safeParse({
        first_name: 'Aarav',
        last_name: 'Sharma',
        email: 'aarav@example.com',
        password: 'Password123!',
        phone: '1234567890',
      })
      expect(res.success).toBe(false)
    })

    it('validates password update schema requiring 8+ chars and matching confirm', () => {
      const valid = customerPasswordUpdateSchema.safeParse({
        password: 'NewSecurePassword123!',
        confirm_password: 'NewSecurePassword123!',
      })
      expect(valid.success).toBe(true)

      const mismatch = customerPasswordUpdateSchema.safeParse({
        password: 'NewSecurePassword123!',
        confirm_password: 'DifferentPassword123!',
      })
      expect(mismatch.success).toBe(false)
    })

    it('validates password reset schema requiring token and matching passwords', () => {
      const valid = customerPasswordResetSchema.safeParse({
        token: 'reset-token-xyz',
        password: 'NewSecurePassword123!',
        confirm_password: 'NewSecurePassword123!',
      })
      expect(valid.success).toBe(true)

      const missingToken = customerPasswordResetSchema.safeParse({
        token: '',
        password: 'NewSecurePassword123!',
        confirm_password: 'NewSecurePassword123!',
      })
      expect(missingToken.success).toBe(false)
    })
  })


  describe('2. Customer Registration Flow', () => {
    it('executes 3-step registration: auth register -> store customer create -> auth login', async () => {
      // 1. Auth register response
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-identity-token' }),
      })
      // 2. Store customer create response
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          customer: {
            id: 'cus_123',
            email: 'newuser@glorov.in',
            first_name: 'Rohan',
            last_name: 'Mehta',
            addresses: [],
          },
        }),
      })
      // 3. Auth login response
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-session-token' }),
      })
      // 4. Customer profile retrieve
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          customer: {
            id: 'cus_123',
            email: 'newuser@glorov.in',
            first_name: 'Rohan',
            last_name: 'Mehta',
            addresses: [],
          },
        }),
      })

      const result = await registerCustomer({
        first_name: 'Rohan',
        last_name: 'Mehta',
        email: 'newuser@glorov.in',
        password: 'Password123!',
        phone: '9876543210',
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('mock-session-token')
      expect(result.customer?.id).toBe('cus_123')
      expect(globalFetch).toHaveBeenCalledTimes(4)
    })

    it('returns error when email is already registered', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Identity with email already exists' }),
      })

      const result = await registerCustomer({
        first_name: 'Rohan',
        last_name: 'Mehta',
        email: 'existing@glorov.in',
        password: 'Password123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })
  })

  describe('3. Customer Login & Session Handling', () => {
    it('authenticates customer and returns actor session token with profile', async () => {
      // 1. Auth login
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'session-jwt-token' }),
      })
      // 2. Profile retrieve
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          customer: {
            id: 'cus_123',
            email: 'aarav@glorov.in',
            first_name: 'Aarav',
            last_name: 'Sharma',
            addresses: [],
          },
        }),
      })

      const res = await loginCustomer({
        email: 'aarav@glorov.in',
        password: 'Password123!',
      })

      expect(res.success).toBe(true)
      expect(res.token).toBe('session-jwt-token')
      expect(res.customer?.email).toBe('aarav@glorov.in')
    })

    it('handles invalid credentials with clear error message', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid email or password' }),
      })

      const res = await loginCustomer({
        email: 'aarav@glorov.in',
        password: 'wrongpassword',
      })

      expect(res.success).toBe(false)
      expect(res.error).toBe('Invalid email or password')
    })

    it('handles expired session on getCurrentCustomer with 401 response', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Token expired' }),
      })

      const res = await getCurrentCustomer('expired-token')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Session expired')
    })
  })

  describe('4. Profile & Address Management', () => {
    it('updates customer profile information', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          customer: {
            id: 'cus_123',
            email: 'aarav@glorov.in',
            first_name: 'Aarav Dev',
            last_name: 'Sharma',
            phone: '9876543211',
          },
        }),
      })

      const res = await updateCustomerProfile(
        {
          first_name: 'Aarav Dev',
          last_name: 'Sharma',
          phone: '9876543211',
        },
        'valid-token'
      )

      expect(res.success).toBe(true)
      expect(res.data?.first_name).toBe('Aarav Dev')
    })

    it('adds customer address with Indian delivery fields', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          customer: {
            id: 'cus_123',
            addresses: [
              {
                id: 'cuaddr_123',
                address_1: 'Flat 402, Green Meadows',
                city: 'Bengaluru',
                province: 'Karnataka',
                postal_code: '560001',
                phone: '9876543210',
                is_default_shipping: true,
              },
            ],
          },
        }),
      })

      const res = await addCustomerAddress(
        {
          first_name: 'Aarav',
          last_name: 'Sharma',
          address_1: 'Flat 402, Green Meadows',
          city: 'Bengaluru',
          province: 'Karnataka',
          postal_code: '560001',
          phone: '9876543210',
          country_code: 'in',
          is_default_shipping: true,
        },
        'valid-token'
      )

      expect(res.success).toBe(true)
      expect(res.data?.addresses).toHaveLength(1)
      expect(res.data?.addresses[0].postal_code).toBe('560001')
    })

    it('updates existing customer address', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          customer: {
            id: 'cus_123',
            addresses: [
              {
                id: 'cuaddr_123',
                address_1: 'Flat 405, Updated Green Meadows',
                city: 'Bengaluru',
                province: 'Karnataka',
                postal_code: '560001',
                phone: '9876543210',
              },
            ],
          },
        }),
      })

      const res = await updateCustomerAddress(
        'cuaddr_123',
        { address_1: 'Flat 405, Updated Green Meadows' },
        'valid-token'
      )
      expect(res.success).toBe(true)
      expect(res.data?.addresses[0].address_1).toBe('Flat 405, Updated Green Meadows')
    })

    it('deletes saved address', async () => {

      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'cuaddr_123', object: 'address', deleted: true }),
      })

      const res = await deleteCustomerAddress('cuaddr_123', 'valid-token')
      expect(res.success).toBe(true)
    })
  })

  describe('5. Order History & Security Access Control', () => {
    it('retrieves customer order list', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          orders: [
            {
              id: 'order_123',
              display_id: 101,
              total: 9800,
              status: 'completed',
              items: [{ id: 'item_1', title: 'Tomato Seeds', quantity: 2, unit_price: 4900 }],
            },
          ],
          count: 1,
        }),
      })

      const res = await getCustomerOrders('valid-token')
      expect(res.success).toBe(true)
      expect(res.orders).toHaveLength(1)
      expect(res.orders[0].display_id).toBe(101)
    })

    it('rejects cross-customer access attempt with 403 Forbidden', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          message: 'Unauthorized access: you do not have permission to access this order',
        }),
      })

      const res = await getCustomerOrder('order_belongs_to_other', 'customer-token')
      expect(res.success).toBe(false)
      expect(res.status).toBe(403)
      expect(res.error).toContain('permission')
    })

    it('rejects unauthenticated order retrieval with 401 Unauthorized', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Authentication required to access customer order' }),
      })

      const res = await getCustomerOrder('order_123', null)
      expect(res.success).toBe(false)
      expect(res.status).toBe(401)
      expect(res.error).toContain('Authentication required')
    })
  })

  describe('6. Cart Preservation & Association', () => {
    it('associates active guest cart with authenticated customer', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart_123',
            customer_id: 'cus_123',
            email: 'aarav@glorov.in',
          },
        }),
      })

      const res = await associateCartWithCustomer('cart_123', 'aarav@glorov.in', 'auth-token')
      expect(res.success).toBe(true)
      expect(globalFetch).toHaveBeenCalledWith(
        expect.stringContaining('/store/carts/cart_123'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
        })
      )
    })

    it('requests password reset instructions', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Created',
      })

      const res = await requestPasswordReset('aarav@glorov.in')
      expect(res.success).toBe(true)
      expect(res.message).toContain('instructions have been sent')
    })

    it('updateCustomerPassword sends new password with customer token to update endpoint', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const res = await updateCustomerPassword('NewSecurePass2026!', 'valid-session-token')
      expect(res.success).toBe(true)
      expect(globalFetch).toHaveBeenCalledWith(
        expect.stringContaining('/store/customers/me/password'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-session-token',
          }),
          body: JSON.stringify({ password: 'NewSecurePass2026!' }),
        })
      )
    })

    it('resetCustomerPassword sends reset token in Authorization header to update endpoint', async () => {
      globalFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const res = await resetCustomerPassword('jwt-reset-token-xyz', 'BrandNewPassword123!')
      expect(res.success).toBe(true)
      expect(globalFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/customer/emailpass/update'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer jwt-reset-token-xyz',
          }),
          body: JSON.stringify({ password: 'BrandNewPassword123!' }),
        })
      )
    })

    it('getOrder passes customer token in custom headers for order confirmation', async () => {
      const mockOrder = { id: 'order_cust_123', total: 4900 }
      vi.mocked(medusaClient.store.order.retrieve).mockResolvedValueOnce({
        order: mockOrder,
      } as unknown as Awaited<ReturnType<typeof medusaClient.store.order.retrieve>>)

      const res = await getOrder('order_cust_123', 'customer-token-123')
      expect(res.success).toBe(true)
      expect(medusaClient.store.order.retrieve).toHaveBeenCalledWith(
        'order_cust_123',
        expect.any(Object),
        { Authorization: 'Bearer customer-token-123' }
      )
    })
  })
})

