'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import type { StoreCart } from '@/lib/cart'
import {
  getOrInitializeCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
} from '@/lib/cart-actions'

interface CartContextType {
  cart: StoreCart | null
  isLoading: boolean
  isMutating: boolean
  error: string | null
  totalItems: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<boolean>
  removeItem: (lineItemId: string) => Promise<boolean>
  refreshCart: () => Promise<void>
  clearCart: () => Promise<void>
  clearError: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isMutating, setIsMutating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getOrInitializeCartAction()
      if (res.success && res.cart) {
        setCart(res.cart)
        setError(null)
      } else if (res.error) {
        setError(res.error)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const totalItems =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  const addToCart = async (variantId: string, quantity: number = 1): Promise<boolean> => {
    setIsMutating(true)
    setError(null)
    try {
      const res = await addToCartAction(variantId, quantity)
      if (res.success && res.cart) {
        setCart(res.cart)
        setIsDrawerOpen(true)
        return true
      } else {
        setError(res.error || 'Failed to add item to cart')
        return false
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding to cart')
      return false
    } finally {
      setIsMutating(false)
    }
  }

  const updateQuantity = async (lineItemId: string, quantity: number): Promise<boolean> => {
    setIsMutating(true)
    setError(null)
    try {
      const res = await updateCartItemAction(lineItemId, quantity)
      if (res.success && res.cart) {
        setCart(res.cart)
        return true
      } else {
        setError(res.error || 'Failed to update item quantity')
        return false
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating quantity')
      return false
    } finally {
      setIsMutating(false)
    }
  }

  const removeItem = async (lineItemId: string): Promise<boolean> => {
    setIsMutating(true)
    setError(null)
    try {
      const res = await removeFromCartAction(lineItemId)
      if (res.success && res.cart) {
        setCart(res.cart)
        return true
      } else {
        setError(res.error || 'Failed to remove item')
        return false
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error removing item')
      return false
    } finally {
      setIsMutating(false)
    }
  }

  const clearCart = useCallback(async () => {
    setCart(null)
    await refreshCart()
  }, [refreshCart])

  const clearError = () => setError(null)
  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isMutating,
        error,
        totalItems,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
