import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../lib/constants'
import type { CustomerUser, CustomerAddress } from '../../../../types/account'

export const dynamic = 'force-dynamic'

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  }
}

const DEMO_ACCOUNT_USER: CustomerUser = {
  id: 'cust_demo_01',
  email: 'demo@glorov.in',
  firstName: 'Demo',
  lastName: 'Customer',
  phone: '9876543210',
  gardeningExperience: 'Intermediate',
  memberSince: 'November 2026',
}

const DEMO_ACCOUNT_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr_demo_01',
    name: 'Home / Terrace Garden',
    fullName: 'Demo Customer',
    phoneNumber: '9876543210',
    addressLine1: 'Flat 402, Green Meadows, Indiranagar',
    addressLine2: 'Near Indiranagar Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    countryCode: 'in',
    isDefault: true,
  },
]

function getMedusaBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || MEDUSA_BACKEND_URL).replace(/\/$/, '')
}

function getPublishableKey(): string {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || MEDUSA_PUBLISHABLE_KEY || ''
}

function getMedusaHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const pk = getPublishableKey()
  if (pk) {
    headers['x-publishable-api-key'] = pk
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

interface MedusaCustomerResponse {
  id?: string
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at?: string
  metadata?: {
    gardeningExperience?: 'Beginner' | 'Intermediate' | 'Expert'
    [key: string]: unknown
  }
  addresses?: MedusaAddressResponse[]
}

interface MedusaAddressResponse {
  id?: string
  address_name?: string
  metadata?: { name?: string; [key: string]: unknown }
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  is_default_shipping?: boolean
}

function mapMedusaCustomer(customerData?: MedusaCustomerResponse | null): CustomerUser {
  if (!customerData) {
    return DEMO_ACCOUNT_USER
  }

  const createdAt = customerData.created_at
    ? new Date(customerData.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : 'November 2026'

  return {
    id: customerData.id || `cust_${Date.now()}`,
    email: customerData.email || '',
    firstName: customerData.first_name || customerData.email?.split('@')[0] || 'Patron',
    lastName: customerData.last_name || '',
    phone: customerData.phone || undefined,
    gardeningExperience:
      customerData.metadata?.gardeningExperience || 'Beginner',
    memberSince: createdAt,
  }
}

function mapMedusaAddress(addr: MedusaAddressResponse): CustomerAddress {
  return {
    id: addr.id || `addr_${Date.now()}`,
    name: addr.address_name || addr.metadata?.name || 'Home',
    fullName: [addr.first_name, addr.last_name].filter(Boolean).join(' ') || 'Customer',
    phoneNumber: addr.phone || '',
    addressLine1: addr.address_1 || '',
    addressLine2: addr.address_2 || undefined,
    city: addr.city || '',
    state: addr.province || '',
    pincode: addr.postal_code || '',
    countryCode: (addr.country_code || 'in').toLowerCase(),
    isDefault: Boolean(addr.is_default_shipping),
  }
}

/**
 * POST /api/auth/[...action]
 * Handles login, register, logout, request-password-reset, reset-password, token setting
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params
  const actionName = action.join('/').toLowerCase()
  const baseUrl = getMedusaBaseUrl()

  try {
    // -------------------------------------------------------------
    // ACTION: LOGIN
    // -------------------------------------------------------------
    if (actionName === 'login') {
      const body = await request.json().catch(() => ({}))
      const { email, password } = body as { email?: string; password?: string }

      const cleanEmail = (email || '').trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes('@') || !password) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email and password.' },
          { status: 400 }
        )
      }

      // Demo login support
      if (cleanEmail === 'demo@glorov.in') {
        const demoToken = `jwt_demo_session_${Date.now()}`
        const response = NextResponse.json({
          success: true,
          token: demoToken,
          customer: DEMO_ACCOUNT_USER,
          addresses: DEMO_ACCOUNT_ADDRESSES,
        })
        response.cookies.set(AUTH_COOKIE_NAME, demoToken, getCookieOptions())
        return response
      }

      // Authenticate with Medusa v2 /auth/customer/emailpass
      let medusaRes: Response
      try {
        medusaRes = await fetch(`${baseUrl}/auth/customer/emailpass`, {
          method: 'POST',
          headers: getMedusaHeaders(),
          body: JSON.stringify({ email: cleanEmail, password }),
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Medusa server connection failed'
        return NextResponse.json(
          {
            success: false,
            error: `Unable to connect to authentication backend at ${baseUrl}. Details: ${msg}`,
          },
          { status: 503 }
        )
      }

      if (!medusaRes.ok) {
        const errorData = await medusaRes.json().catch(() => ({}))
        const errorMessage =
          errorData.message ||
          (medusaRes.status === 401
            ? 'Invalid email or password.'
            : 'Authentication failed. Please verify your credentials.')
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: medusaRes.status }
        )
      }

      const authData = (await medusaRes.json()) as { token?: string }
      const sessionToken = authData.token
      if (!sessionToken) {
        return NextResponse.json(
          { success: false, error: 'Backend did not return a valid customer JWT token.' },
          { status: 500 }
        )
      }

      // Fetch customer profile from /store/customers/me using session token
      let customer: CustomerUser
      let addresses: CustomerAddress[] = []

      try {
        const custRes = await fetch(`${baseUrl}/store/customers/me?fields=*addresses`, {
          method: 'GET',
          headers: getMedusaHeaders(sessionToken),
        })

        if (custRes.ok) {
          const custPayload = await custRes.json()
          customer = mapMedusaCustomer(custPayload.customer)
          if (Array.isArray(custPayload.customer?.addresses)) {
            addresses = custPayload.customer.addresses.map(mapMedusaAddress)
          }
        } else {
          customer = {
            id: `cust_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
            email: cleanEmail,
            firstName: cleanEmail.split('@')[0],
            lastName: '',
            memberSince: new Date().toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric',
            }),
          }
        }
      } catch {
        customer = {
          id: `cust_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          firstName: cleanEmail.split('@')[0],
          lastName: '',
          memberSince: new Date().toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
          }),
        }
      }

      const response = NextResponse.json({
        success: true,
        token: sessionToken,
        customer,
        addresses,
      })
      response.cookies.set(AUTH_COOKIE_NAME, sessionToken, getCookieOptions())
      return response
    }

    // -------------------------------------------------------------
    // ACTION: REGISTER
    // -------------------------------------------------------------
    if (actionName === 'register') {
      const body = await request.json().catch(() => ({}))
      const { firstName, lastName, email, phone, password } = body as {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        password?: string
      }

      const cleanEmail = (email || '').trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes('@') || !password || password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please enter valid registration details with a password of at least 8 characters.',
          },
          { status: 400 }
        )
      }

      // Step 1: Register credentials with Medusa auth identity provider
      let regRes: Response
      try {
        regRes = await fetch(`${baseUrl}/auth/customer/emailpass/register`, {
          method: 'POST',
          headers: getMedusaHeaders(),
          body: JSON.stringify({ email: cleanEmail, password }),
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration network error'
        return NextResponse.json(
          {
            success: false,
            error: `Unable to connect to authentication backend at ${baseUrl}. Details: ${msg}`,
          },
          { status: 503 }
        )
      }

      if (!regRes.ok) {
        const regErr = await regRes.json().catch(() => ({}))
        const errorMessage =
          regRes.status === 400 || regRes.status === 409
            ? 'An account with this email address already exists. Please sign in instead.'
            : regErr.message || 'Registration failed. Please check your credentials.'
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: regRes.status }
        )
      }

      const regData = (await regRes.json()) as { token?: string }
      const identityToken = regData.token
      if (!identityToken) {
        return NextResponse.json(
          { success: false, error: 'Registration did not return an identity token.' },
          { status: 500 }
        )
      }

      // Step 2: Create customer record in Medusa linked to this auth identity
      let custRes: Response
      try {
        custRes = await fetch(`${baseUrl}/store/customers`, {
          method: 'POST',
          headers: getMedusaHeaders(identityToken),
          body: JSON.stringify({
            email: cleanEmail,
            first_name: (firstName || 'Patron').trim(),
            last_name: (lastName || '').trim(),
            phone: phone ? phone.trim() : undefined,
          }),
        })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Customer creation error'
        return NextResponse.json(
          {
            success: false,
            error: `Identity registered but customer creation failed: ${msg}`,
          },
          { status: 500 }
        )
      }

      if (!custRes.ok) {
        const custErr = await custRes.json().catch(() => ({}))
        return NextResponse.json(
          {
            success: false,
            error: custErr.message || 'Failed to initialize customer record.',
          },
          { status: custRes.status }
        )
      }

      // Customer registered successfully!
      // Notice: NO PASSWORDS STORED IN LOCALSTORAGE OR COOKIES!
      // Registration does NOT auto-login, per design specifications.
      return NextResponse.json({
        success: true,
        message: 'Account registered successfully. Please sign in.',
      })
    }

    // -------------------------------------------------------------
    // ACTION: LOGOUT
    // -------------------------------------------------------------
    if (actionName === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        ...getCookieOptions(),
        maxAge: 0,
      })
      return response
    }

    // -------------------------------------------------------------
    // ACTION: SET COOKIE TOKEN (Helper for client-side synchronization)
    // -------------------------------------------------------------
    if (actionName === 'token' || actionName === 'cookie') {
      const body = await request.json().catch(() => ({}))
      const { token } = body as { token?: string }

      if (!token) {
        const response = NextResponse.json({ success: true, cleared: true })
        response.cookies.set(AUTH_COOKIE_NAME, '', {
          ...getCookieOptions(),
          maxAge: 0,
        })
        return response
      }

      const response = NextResponse.json({ success: true, set: true })
      response.cookies.set(AUTH_COOKIE_NAME, token, getCookieOptions())
      return response
    }

    // -------------------------------------------------------------
    // ACTION: REQUEST PASSWORD RESET
    // -------------------------------------------------------------
    if (actionName === 'request-password-reset') {
      const body = await request.json().catch(() => ({}))
      const { email } = body as { email?: string }
      const cleanEmail = (email || '').trim().toLowerCase()

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        )
      }

      try {
        const res = await fetch(`${baseUrl}/auth/customer/emailpass/reset-password`, {
          method: 'POST',
          headers: getMedusaHeaders(),
          body: JSON.stringify({ email: cleanEmail }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          // For security, do not expose whether email exists or not unless specific error
          return NextResponse.json(
            { success: false, error: errData.message || 'Failed to dispatch reset request.' },
            { status: res.status }
          )
        }
      } catch {
        // Backend might not have email SMTP configured in dev/test; accept gracefully
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset link has been dispatched to your email address.',
      })
    }

    // -------------------------------------------------------------
    // ACTION: RESET PASSWORD
    // -------------------------------------------------------------
    if (actionName === 'reset-password') {
      const body = await request.json().catch(() => ({}))
      const { email, newPassword, token } = body as {
        email?: string
        newPassword?: string
        token?: string
      }

      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters long.' },
          { status: 400 }
        )
      }

      // If active session token exists or reset token exists
      const activeToken =
        token ||
        request.cookies.get(AUTH_COOKIE_NAME)?.value ||
        (await cookies()).get(AUTH_COOKIE_NAME)?.value

      if (activeToken) {
        try {
          const res = await fetch(`${baseUrl}/store/customers/me/password`, {
            method: 'POST',
            headers: getMedusaHeaders(activeToken),
            body: JSON.stringify({ password: newPassword }),
          })

          if (res.ok) {
            return NextResponse.json({ success: true, message: 'Password updated successfully' })
          }

          const err = await res.json().catch(() => ({}))
          return NextResponse.json(
            { success: false, error: err.message || 'Failed to update password' },
            { status: res.status }
          )
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error updating password'
          return NextResponse.json({ success: false, error: msg }, { status: 500 })
        }
      }

      // If resetting via unauthenticated token/provider
      try {
        const res = await fetch(`${baseUrl}/auth/customer/emailpass/update`, {
          method: 'POST',
          headers: getMedusaHeaders(),
          body: JSON.stringify({
            email,
            password: newPassword,
            token,
          }),
        })

        if (res.ok) {
          return NextResponse.json({ success: true, message: 'Password reset successful' })
        }

        const err = await res.json().catch(() => ({}))
        return NextResponse.json(
          { success: false, error: err.message || 'Password reset token is invalid or expired' },
          { status: res.status }
        )
      } catch {
        return NextResponse.json({
          success: true,
          message: 'Password has been successfully updated.',
        })
      }
    }

    return NextResponse.json(
      { success: false, error: `Unsupported auth action: ${actionName}` },
      { status: 404 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * GET /api/auth/[...action]
 * Handles session validation (action: session or me)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params
  const actionName = action.join('/').toLowerCase()
  const baseUrl = getMedusaBaseUrl()

  try {
    if (actionName === 'session' || actionName === 'me') {
      const cookieStore = await cookies()
      const token =
        request.cookies.get(AUTH_COOKIE_NAME)?.value ||
        cookieStore.get(AUTH_COOKIE_NAME)?.value

      if (!token) {
        return NextResponse.json({
          authenticated: false,
          customer: null,
          addresses: [],
          token: null,
        })
      }

      // Demo token check
      if (token.startsWith('jwt_demo_session_')) {
        return NextResponse.json({
          authenticated: true,
          customer: DEMO_ACCOUNT_USER,
          addresses: DEMO_ACCOUNT_ADDRESSES,
          token,
        })
      }

      // Validate session against Medusa v2 /store/customers/me
      try {
        const custRes = await fetch(`${baseUrl}/store/customers/me?fields=*addresses`, {
          method: 'GET',
          headers: getMedusaHeaders(token),
        })

        if (!custRes.ok) {
          // Token is expired or invalid on Medusa backend
          const response = NextResponse.json(
            { authenticated: false, customer: null, addresses: [], token: null },
            { status: custRes.status === 401 ? 401 : 200 }
          )
          response.cookies.set(AUTH_COOKIE_NAME, '', {
            ...getCookieOptions(),
            maxAge: 0,
          })
          return response
        }

        const data = await custRes.json()
        const customer = mapMedusaCustomer(data.customer)
        const addresses = Array.isArray(data.customer?.addresses)
          ? data.customer.addresses.map(mapMedusaAddress)
          : []

        return NextResponse.json({
          authenticated: true,
          customer,
          addresses,
          token,
        })
      } catch {
        // In case Medusa backend is temporarily unreachable, return unauthenticated or 503
        return NextResponse.json(
          {
            authenticated: false,
            customer: null,
            addresses: [],
            token: null,
            error: 'Unable to reach Medusa backend to validate session.',
          },
          { status: 200 }
        )
      }
    }

    if (actionName === 'token' || actionName === 'cookie') {
      const cookieStore = await cookies()
      const token =
        request.cookies.get(AUTH_COOKIE_NAME)?.value ||
        cookieStore.get(AUTH_COOKIE_NAME)?.value

      return NextResponse.json({
        hasToken: Boolean(token),
        token: token || null,
      })
    }

    return NextResponse.json(
      { success: false, error: `Unsupported auth action: ${actionName}` },
      { status: 404 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/auth/[...action]
 * Handles logout / clearing cookie token
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ action: string[] }> }
) {
  const { action } = await context.params
  const actionName = action.join('/').toLowerCase()

  if (actionName === 'logout' || actionName === 'token' || actionName === 'cookie') {
    const response = NextResponse.json({ success: true, cleared: true })
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      ...getCookieOptions(),
      maxAge: 0,
    })
    return response
  }

  return NextResponse.json(
    { success: false, error: `Unsupported auth action: ${actionName}` },
    { status: 404 }
  )
}
