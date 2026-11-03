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
  updateProfile: (data: Partial<CustomerUser>) => Promise<boolean>
  addresses: CustomerAddress[]
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => Promise<boolean>
  updateAddress: (id: string, addr: Partial<CustomerAddress>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  orders: CustomerOrder[]
  notifications: CustomerNotification[]
  markNotificationAsRead: (id: string) => void
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | undefined>(undefined)

const DEFAULT_SAMPLE_USER: CustomerUser = {
  id: 'cust_aarav_sharma_01',
  email: 'aarav.sharma@glorov.in',
  firstName: 'Aarav',
  lastName: 'Sharma',
  phone: '9876543210',
  gardeningExperience: 'Intermediate',
  memberSince: 'March 2026',
}

const DEFAULT_SAMPLE_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr_01',
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
  },
  {
    id: 'addr_02',
    name: 'Nursery Workshop & Studio',
    fullName: 'Aarav Sharma',
    phoneNumber: '9876543210',
    addressLine1: 'Plot 18, Botanical Enclave, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    countryCode: 'in',
    isDefault: false,
  },
]

const DEFAULT_SAMPLE_ORDERS: CustomerOrder[] = [
  {
    id: 'ord_sample_01',
    displayId: 'GLR-881920',
    createdAt: '28 Oct 2026, 03:45 PM',
    status: 'shipped',
    paymentStatus: 'captured',
    fulfillmentStatus: 'shipped',
    totalAmount: 763,
    itemCount: 3,
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
    shippingAddress: DEFAULT_SAMPLE_ADDRESSES[0],
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
    shippingAddress: DEFAULT_SAMPLE_ADDRESSES[0],
    carrierName: 'BlueDart Express',
    trackingCode: 'BD-88410291',
    estimatedDeliveryDate: '16 Sep 2026',
  },
]

const DEFAULT_SAMPLE_NOTIFICATIONS: CustomerNotification[] = [
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
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(DEFAULT_SAMPLE_USER)
  const [token, setToken] = useState<string | null>('demo_customer_token_jwt')
  const [addresses, setAddresses] = useState<CustomerAddress[]>(DEFAULT_SAMPLE_ADDRESSES)
  const [orders, setOrders] = useState<CustomerOrder[]>(DEFAULT_SAMPLE_ORDERS)
  const [notifications, setNotifications] = useState<CustomerNotification[]>(
    DEFAULT_SAMPLE_NOTIFICATIONS
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // Safe client-side hydration
  useEffect(() => {
    try {
      const isGuest = localStorage.getItem('glorov_guest_mode') === 'true'
      if (isGuest) {
        setCustomer(null)
        setToken(null)
        return
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      if (storedUser) {
        setCustomer(JSON.parse(storedUser))
      } else {
        // Auto-initialize demo authenticated patron for testing
        setCustomer(DEFAULT_SAMPLE_USER)
      }

      if (storedToken) {
        setToken(storedToken)
      } else {
        setToken('demo_customer_token_jwt')
      }

      const storedAddrs = localStorage.getItem(STORAGE_KEYS.ADDRESSES)
      if (storedAddrs) setAddresses(JSON.parse(storedAddrs))

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (storedOrders) setOrders(JSON.parse(storedOrders))

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFS)
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs))
    } catch {
      // Fallback to defaults
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

      // Simulate authentication validation
      await new Promise((resolve) => setTimeout(resolve, 350))

      if (!email.includes('@') || password.length < 6) {
        setIsLoading(false)
        const error = 'Invalid credentials. Password must be at least 6 characters.'
        setAuthError(error)
        return { success: false, error }
      }

      const user: CustomerUser = {
        id: `cust_${Date.now()}`,
        email: email.trim().toLowerCase(),
        firstName: email.split('@')[0] || 'Gardener',
        lastName: '',
        phone: '9876543210',
        gardeningExperience: 'Intermediate',
        memberSince: 'November 2026',
      }

      const generatedToken = `jwt_mock_${Date.now()}`
      try {
        localStorage.removeItem('glorov_guest_mode')
      } catch {}
      setCustomer(user)
      setToken(generatedToken)
      setIsLoading(false)
      return { success: true }
    },
    []
  )

  // Registration handler
  const register = useCallback(
    async (input: RegisterCustomerInput): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true)
      setAuthError(null)

      await new Promise((resolve) => setTimeout(resolve, 400))

      if (!input.email || !input.password || input.password.length < 6) {
        setIsLoading(false)
        const error = 'Please enter valid details and a password with at least 6 characters.'
        setAuthError(error)
        return { success: false, error }
      }

      const user: CustomerUser = {
        id: `cust_${Date.now()}`,
        email: input.email.trim().toLowerCase(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        gardeningExperience: 'Beginner',
        memberSince: 'Today',
      }

      const generatedToken = `jwt_mock_${Date.now()}`
      try {
        localStorage.removeItem('glorov_guest_mode')
      } catch {}
      setCustomer(user)
      setToken(generatedToken)
      setIsLoading(false)
      return { success: true }
    },
    []
  )

  // Logout handler
  const logout = useCallback(() => {
    setCustomer(null)
    setToken(null)
    try {
      localStorage.setItem('glorov_guest_mode', 'true')
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
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
