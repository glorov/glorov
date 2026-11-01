'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { StoreCustomer } from '@/lib/customer'
import { getCurrentCustomerAction, logoutCustomerAction } from '@/lib/customer-actions'

interface CustomerContextType {
  customer: StoreCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await getCurrentCustomerAction()
      if (res.success && res.customer) {
        setCustomer(res.customer)
      } else {
        setCustomer(null)
      }
    } catch {
      setCustomer(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCustomer()
  }, [refreshCustomer])

  const logout = useCallback(async () => {
    try {
      await logoutCustomerAction()
    } finally {
      setCustomer(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/account/login'
      }
    }
  }, [])

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated: Boolean(customer),
        isLoading,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

const defaultCustomerContext: CustomerContextType = {
  customer: null,
  isAuthenticated: false,
  isLoading: false,
  logout: async () => {},
  refreshCustomer: async () => {},
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  return context || defaultCustomerContext
}
