'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type {
  CustomerUser,
  CustomerAddress,
  CustomerOrder,
  CustomerNotification,
  RegisterCustomerInput,
} from '../types/account'

export interface CustomerAuthContextValue {
  customer: CustomerUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (input: RegisterCustomerInput) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (
    email: string,
    newPassword: string,
    token?: string
  ) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<CustomerUser>) => Promise<boolean>
  addresses: CustomerAddress[]
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => Promise<boolean>
  updateAddress: (id: string, addr: Partial<CustomerAddress>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  orders: CustomerOrder[]
  notifications: CustomerNotification[]
  markNotificationAsRead: (id: string) => void
}

export const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined)

export const DEMO_ACCOUNT_USER: CustomerUser = {
  id: 'cust_demo_01',
  email: 'demo@glorov.in',
  firstName: 'Demo',
  lastName: 'Customer',
  phone: '9876543210',
  gardeningExperience: 'Intermediate',
  memberSince: 'November 2026',
}

export const DEMO_ACCOUNT_ADDRESSES: CustomerAddress[] = [
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

export const DEMO_ACCOUNT_ORDERS: CustomerOrder[] = [
  {
    id: 'ord_demo_01',
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
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571735/glorov/products/vegetable-seeds/green-chilli-seeds-1.png',
      },
      {
        id: 'item-02',
        productId: 'monstera-deliciosa',
        title: 'Monstera Deliciosa (Swiss Cheese Plant)',
        price: 649,
        quantity: 1,
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516598/glorov/banners/banner_plant_seed_desktop.png',
      },
    ],
    shippingAddress: DEMO_ACCOUNT_ADDRESSES[0],
    carrierName: 'Shiprocket Botanical Cold-Chain',
    trackingCode: 'SR-GLR-9921820',
    estimatedDeliveryDate: '04 Nov 2026',
  },
  {
    id: 'ord_sample_02',
    displayId: 'GLR-554210',
    createdAt: '12 Sep 2026, 11:15 AM',
    status: 'delivered',
    paymentStatus: 'captured',
    fulfillmentStatus: 'fulfilled',
    totalAmount: 1299,
    itemCount: 1,
    items: [
      {
        id: 'item-03',
        productId: 'diamond-ceramic-pot',
        title: 'Diamond Hand-Painted Ceramic Pot (8")',
        price: 1299,
        quantity: 1,
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516593/glorov/banners/banner_garden_begins_desktop.png',
      },
    ],
    shippingAddress: DEMO_ACCOUNT_ADDRESSES[0],
    carrierName: 'BlueDart Express',
    trackingCode: 'BD-88410291',
    estimatedDeliveryDate: '16 Sep 2026',
  },
]

export const DEFAULT_SAMPLE_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: 'notif_01',
    title: 'Order Dispatched!',
    message: 'Your Green Chilli Seeds & Monstera have left our nursery in temperature-safe packaging.',
    date: 'Today, 10:30 AM',
    isRead: false,
    category: 'order',
    link: '/account/orders',
  },
  {
    id: 'notif_02',
    title: 'Autumn Pruning & Sowing Tip',
    message: 'Winter flowering annuals like Chrysanthemums and Marigolds should be watered in the morning.',
    date: 'Yesterday',
    isRead: false,
    category: 'gardening_tip',
  },
  {
    id: 'notif_03',
    title: 'Wishlist Item on Sale!',
    message: 'Peace Lily Indoor Air-Purifier is currently available at 25% discount.',
    date: '3 days ago',
    isRead: true,
    category: 'wishlist',
    link: '/account/wishlist',
  },
]

const STORAGE_KEYS = {
  USER: 'glorov_customer_user',
  TOKEN: 'glorov_customer_token',
  ADDRESSES: 'glorov_customer_addresses',
  ORDERS: 'glorov_customer_orders',
  NOTIFS: 'glorov_customer_notifs',
  REGISTERED_USERS: 'glorov_registered_users',
  RESET_TOKENS: 'glorov_reset_tokens',
}

interface StoredRegisteredUser {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  phone: string
  gardeningExperience: 'Beginner' | 'Intermediate' | 'Expert'
  memberSince: string
}

function getStoredRegisteredUsers(): StoredRegisteredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredRegisteredUsers(users: StoredRegisteredUser[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users))
  } catch {}
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  // Standard E-Commerce Model: Default state for all first-time visitors is unauthenticated / guest
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // Safe client-side hydration from localStorage only if real session exists
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser)
          // Actively purge any legacy mock auto-login (e.g. Aarav Sharma)
          if (
            parsedUser?.id === 'cust_aarav_sharma_01' ||
            parsedUser?.email === 'aarav.sharma@glorov.in'
          ) {
            localStorage.removeItem(STORAGE_KEYS.USER)
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.ADDRESSES)
            localStorage.removeItem(STORAGE_KEYS.ORDERS)
            localStorage.removeItem(STORAGE_KEYS.NOTIFS)
            localStorage.removeItem('glorov_guest_mode')
            setCustomer(null)
            setToken(null)
            setAddresses([])
            setOrders([])
            setNotifications([])
            return
          }

          setCustomer(parsedUser)
          setToken(storedToken)

          const storedAddrs = localStorage.getItem(STORAGE_KEYS.ADDRESSES)
          if (storedAddrs) setAddresses(JSON.parse(storedAddrs))

          const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
          if (storedOrders) setOrders(JSON.parse(storedOrders))

          const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFS)
          if (storedNotifs) setNotifications(JSON.parse(storedNotifs))
          return
        } catch {
          // If parse fails, clear corrupt session
          localStorage.removeItem(STORAGE_KEYS.USER)
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
        }
      }

      // Default for first-time visits: Guest (unauthenticated)
      setCustomer(null)
      setToken(null)
      setAddresses([])
      setOrders([])
      setNotifications([])
    } catch {
      setCustomer(null)
      setToken(null)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Sync state to localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      if (customer) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(customer))
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER)
      }
    } catch {}
  }, [customer, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
      }
    } catch {}
  }, [token, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses))
    } catch {}
  }, [addresses, isHydrated])

  // Login handler
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true)
      setAuthError(null)

      // Simulate authentication validation latency
      await new Promise((resolve) => setTimeout(resolve, 350))

      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes('@') || !password) {
        setIsLoading(false)
        const error = 'Please enter a valid email and password.'
        setAuthError(error)
        return { success: false, error }
      }

      if (cleanEmail === 'fail@test.com' || password === 'wrong_password') {
        setIsLoading(false)
        const error = 'Invalid email or password.'
        setAuthError(error)
        return { success: false, error }
      }

      // Check registered users list first
      const storedUsers = getStoredRegisteredUsers()
      const registeredUser = storedUsers.find((u) => u.email === cleanEmail)
      if (registeredUser) {
        if (registeredUser.passwordHash !== password) {
          setIsLoading(false)
          const error = 'Incorrect password. Please verify your credentials or reset password.'
          setAuthError(error)
          return { success: false, error }
        }

        const user: CustomerUser = {
          id: registeredUser.id,
          email: registeredUser.email,
          firstName: registeredUser.firstName,
          lastName: registeredUser.lastName,
          phone: registeredUser.phone,
          gardeningExperience: registeredUser.gardeningExperience,
          memberSince: registeredUser.memberSince,
        }

        const generatedToken = `jwt_session_${Date.now()}`
        try {
          localStorage.removeItem('glorov_guest_mode')
        } catch {}
        setCustomer(user)
        setToken(generatedToken)
        setIsLoading(false)
        return { success: true }
      }

      const isDemo = cleanEmail === 'demo@glorov.in'
      const rawUsername = cleanEmail.split('@')[0] || 'patron'
      const capitalized = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1)

      const user: CustomerUser = isDemo
        ? DEMO_ACCOUNT_USER
        : {
            id: `cust_${Date.now()}`,
            email: cleanEmail,
            firstName: capitalized,
            lastName: '',
            phone: '9876543210',
            gardeningExperience: 'Intermediate',
            memberSince: 'November 2026',
          }

      const generatedToken = `jwt_session_${Date.now()}`
      try {
        localStorage.removeItem('glorov_guest_mode')
      } catch {}
      setCustomer(user)
      setToken(generatedToken)
      if (isDemo) {
        setAddresses(DEMO_ACCOUNT_ADDRESSES)
        setOrders(DEMO_ACCOUNT_ORDERS)
        setNotifications(DEFAULT_SAMPLE_NOTIFICATIONS)
      }
      setIsLoading(false)
      return { success: true }
    },
    []
  )

  // Registration handler: Registers user record WITHOUT auto-login!
  // User must explicitly log in afterwards on /auth/login.
  const register = useCallback(
    async (input: RegisterCustomerInput): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true)
      setAuthError(null)

      await new Promise((resolve) => setTimeout(resolve, 380))

      const cleanEmail = input.email.trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes('@') || !input.password || input.password.length < 8) {
        setIsLoading(false)
        const error = 'Please enter valid details with a password of at least 8 characters.'
        setAuthError(error)
        return { success: false, error }
      }

      // Check if already registered or if email is existing@test.com
      const storedUsers = getStoredRegisteredUsers()
      if (
        cleanEmail === 'existing@test.com' ||
        storedUsers.some((u) => u.email === cleanEmail)
      ) {
        setIsLoading(false)
        const error = 'An account with this email address already exists. Please sign in instead.'
        setAuthError(error)
        return { success: false, error }
      }

      const newRecord: StoredRegisteredUser = {
        id: `cust_${Date.now()}`,
        email: cleanEmail,
        passwordHash: input.password,
        firstName: input.firstName.trim() || 'Patron',
        lastName: input.lastName.trim() || '',
        phone: input.phone.trim() || '9876543210',
        gardeningExperience: 'Beginner',
        memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      }

      saveStoredRegisteredUsers([...storedUsers, newRecord])

      // CRITICAL: DO NOT AUTO-LOGIN!
      // Customer session remains unauthenticated so user explicitly signs in.
      setIsLoading(false)
      return { success: true }
    },
    []
  )

  // Request Password Reset handler
  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true)
      setAuthError(null)

      await new Promise((resolve) => setTimeout(resolve, 400))

      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setIsLoading(false)
        const error = 'Please enter a valid email address.'
        setAuthError(error)
        return { success: false, error }
      }

      if (cleanEmail === 'unknown@test.com') {
        setIsLoading(false)
        const error = 'No GLOROV account found for this email address.'
        setAuthError(error)
        return { success: false, error }
      }

      // Generate a simulated recovery token
      const token = `rst_${Math.random().toString(36).substring(2, 10)}`
      try {
        const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}')
        resetTokens[cleanEmail] = { token, expiresAt: Date.now() + 3600000 }
        localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens))
      } catch {}

      setIsLoading(false)
      return { success: true }
    },
    []
  )

  // Reset Password with New Password handler
  const resetPassword = useCallback(
    async (
      email: string,
      newPassword: string,
      _token?: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true)
      setAuthError(null)

      await new Promise((resolve) => setTimeout(resolve, 400))

      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setIsLoading(false)
        return { success: false, error: 'Invalid email address.' }
      }

      if (!newPassword || newPassword.length < 8) {
        setIsLoading(false)
        return { success: false, error: 'Password must be at least 8 characters long.' }
      }

      // Update in registered users list
      const users = getStoredRegisteredUsers()
      const existingIndex = users.findIndex((u) => u.email === cleanEmail)
      if (existingIndex >= 0) {
        users[existingIndex].passwordHash = newPassword
        saveStoredRegisteredUsers(users)
      } else {
        users.push({
          id: `cust_${Date.now()}`,
          email: cleanEmail,
          passwordHash: newPassword,
          firstName: cleanEmail.split('@')[0],
          lastName: '',
          phone: '9876543210',
          gardeningExperience: 'Beginner',
          memberSince: 'November 2026',
        })
        saveStoredRegisteredUsers(users)
      }

      try {
        const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}')
        delete resetTokens[cleanEmail]
        localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(resetTokens))
      } catch {}

      setIsLoading(false)
      return { success: true }
    },
    []
  )

  // Logout handler
  const logout = useCallback(() => {
    setCustomer(null)
    setToken(null)
    setAddresses([])
    setOrders([])
    setNotifications([])
    try {
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.ADDRESSES)
      localStorage.removeItem(STORAGE_KEYS.ORDERS)
      localStorage.removeItem(STORAGE_KEYS.NOTIFS)
      localStorage.removeItem('glorov_guest_mode')
    } catch {}
  }, [])

  // Profile update
  const updateProfile = useCallback(
    async (data: Partial<CustomerUser>): Promise<boolean> => {
      if (!customer) return false
      const updated = { ...customer, ...data }
      setCustomer(updated)
      return true
    },
    [customer]
  )

  // Address CRUD
  const addAddress = useCallback(
    async (addr: Omit<CustomerAddress, 'id'>): Promise<boolean> => {
      const newAddr: CustomerAddress = {
        ...addr,
        id: `addr_${Date.now()}`,
      }
      setAddresses((prev) => [newAddr, ...prev])
      return true
    },
    []
  )

  const updateAddress = useCallback(
    async (id: string, addr: Partial<CustomerAddress>): Promise<boolean> => {
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...addr } : a))
      )
      return true
    },
    []
  )

  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      return true
    },
    []
  )

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  const value = useMemo(
    () => ({
      customer,
      token,
      isAuthenticated: Boolean(customer),
      isLoading,
      authError,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      addresses,
      addAddress,
      updateAddress,
      deleteAddress,
      orders,
      notifications,
      markNotificationAsRead,
    }),
    [
      customer,
      token,
      isLoading,
      authError,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      addresses,
      addAddress,
      updateAddress,
      deleteAddress,
      orders,
      notifications,
      markNotificationAsRead,
    ]
  )

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
