import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  CustomerAuthProvider,
  useCustomerAuth,
  DEMO_ACCOUNT_USER,
} from '../context/CustomerAuthContext'

describe('Auth Context Unit Tests (auth.test.ts)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(CustomerAuthProvider, null, children)
  )

  it('initializes with unauthenticated guest state when no active session exists', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ authenticated: false }),
    } as Response)

    const { result } = renderHook(() => useCustomerAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.customer).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('restores authenticated customer session from /api/auth/session on mount', async () => {
    const mockCustomer = {
      id: 'cust_real_01',
      email: 'botanist@glorov.in',
      firstName: 'Kavya',
      lastName: 'Iyer',
      phone: '9876543210',
    }

    global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('/api/auth/session')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            authenticated: true,
            customer: mockCustomer,
            token: 'jwt_mock_token_123',
            addresses: [],
          }),
        } as Response)
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response)
    })

    const { result } = renderHook(() => useCustomerAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    expect(result.current.customer?.email).toBe('botanist@glorov.in')
    expect(result.current.customer?.firstName).toBe('Kavya')
    expect(result.current.token).toBe('jwt_mock_token_123')
  })

  describe('login()', () => {
    it('rejects invalid or blank email and password inputs', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ authenticated: false }),
      } as Response)

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.login('', '')
        expect(res.success).toBe(false)
        expect(res.error).toContain('Please enter a valid email and password')
      })

      await act(async () => {
        const res = await result.current.login('notanemail', 'password123')
        expect(res.success).toBe(false)
        expect(res.error).toContain('Please enter a valid email and password')
      })

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('handles fast-path demo login for demo@glorov.in', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.login('demo@glorov.in', 'anyPassword123')
        expect(res.success).toBe(true)
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.customer?.email).toBe(DEMO_ACCOUNT_USER.email)
      expect(result.current.token).toMatch(/^jwt_demo_session_/)
      expect(result.current.addresses.length).toBeGreaterThan(0)
    })

    it('invokes /api/auth/login with credentials and sets customer state on success', async () => {
      const mockCustomer = {
        id: 'cust_999',
        email: 'user@example.com',
        firstName: 'Ananya',
        lastName: 'Sharma',
        phone: '9988776655',
      }

      global.fetch = vi.fn().mockImplementation((url: string | URL | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/api/auth/login')) {
          const body = JSON.parse(init?.body as string)
          if (body.email === 'user@example.com' && body.password === 'SecurePassword123') {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: async () => ({
                success: true,
                customer: mockCustomer,
                token: 'jwt_server_customer_token',
                addresses: [],
              }),
            } as Response)
          }
        }
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ success: false, error: 'Invalid email or password.' }),
        } as Response)
      })

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.login('user@example.com', 'SecurePassword123')
        expect(res.success).toBe(true)
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.customer?.firstName).toBe('Ananya')
      expect(result.current.token).toBe('jwt_server_customer_token')
    })

    it('handles authentication failure with 401 status and error message', async () => {
      global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/api/auth/login')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({ success: false, error: 'Invalid email or password.' }),
          } as Response)
        }
        return Promise.resolve({ ok: false, status: 401, json: async () => ({}) } as Response)
      })

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.login('wrong@example.com', 'wrongpassword')
        expect(res.success).toBe(false)
        expect(res.error).toBe('Invalid email or password.')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.authError).toBe('Invalid email or password.')
    })
  })

  describe('register()', () => {
    it('validates minimum password length of 8 characters and email format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as Response)

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.register({
          email: 'test@example.com',
          password: 'short',
          firstName: 'Botanist',
          lastName: 'User',
          phone: '9876543210',
        })
        expect(res.success).toBe(false)
        expect(res.error).toContain('at least 8 characters')
      })
    })

    it('calls /api/auth/register and returns success without auto-login', async () => {
      let registerCalled = false

      global.fetch = vi.fn().mockImplementation((url: string | URL | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/api/auth/register')) {
          registerCalled = true
          const body = JSON.parse(init?.body as string)
          expect(body.email).toBe('newbotanist@glorov.in')
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true }),
          } as Response)
        }
        return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
      })

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.register({
          email: 'newbotanist@glorov.in',
          password: 'SafePassword2026',
          firstName: 'Siddharth',
          lastName: 'Mehta',
          phone: '9876543210',
        })
        expect(res.success).toBe(true)
      })

      expect(registerCalled).toBe(true)
      // Per GLOROV-AUTH-001 specification: Registration does NOT auto-login
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('handles duplicate customer registration error (409 conflict)', async () => {
      global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/api/auth/register')) {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: async () => ({
              success: false,
              error: 'An account with this email address already exists. Please sign in instead.',
            }),
          } as Response)
        }
        return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
      })

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.register({
          email: 'existing@glorov.in',
          password: 'SafePassword2026',
          firstName: 'Existing',
          lastName: 'User',
          phone: '9876543210',
        })
        expect(res.success).toBe(false)
        expect(res.error).toContain('already exists')
      })
    })
  })

  describe('logout()', () => {
    it('clears customer state, token, addresses, orders, and triggers /api/auth/logout', async () => {
      let logoutApiCalled = false

      global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/api/auth/logout')) {
          logoutApiCalled = true
          return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response)
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) } as Response)
      })

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      // First login with demo
      await act(async () => {
        await result.current.login('demo@glorov.in', 'password123')
      })
      expect(result.current.isAuthenticated).toBe(true)

      // Execute logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.customer).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.addresses).toEqual([])
      expect(result.current.orders).toEqual([])
      expect(logoutApiCalled).toBe(true)
    })
  })

  describe('password reset workflows', () => {
    it('validates email for requestPasswordReset and calls server route', async () => {
      let resetReqCalled = false

      global.fetch = vi.fn().mockImplementation((url: string | URL | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/api/auth/request-password-reset')) {
          resetReqCalled = true
          const body = JSON.parse(init?.body as string)
          expect(body.email).toBe('recover@glorov.in')
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true }),
          } as Response)
        }
        return Promise.resolve({ ok: false, json: async () => ({}) } as Response)
      })

      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.requestPasswordReset('recover@glorov.in')
        expect(res.success).toBe(true)
      })

      expect(resetReqCalled).toBe(true)
    })

    it('rejects short passwords in resetPassword()', async () => {
      const { result } = renderHook(() => useCustomerAuth(), { wrapper })

      await act(async () => {
        const res = await result.current.resetPassword('recover@glorov.in', '123')
        expect(res.success).toBe(false)
        expect(res.error).toContain('at least 8 characters')
      })
    })
  })
})
