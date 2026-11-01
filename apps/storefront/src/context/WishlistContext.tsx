'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

export interface WishlistItem {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  pricePaise: number
  variantId?: string
  categoryName?: string
}

interface WishlistContextType {
  items: WishlistItem[]
  totalItems: number
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (item: WishlistItem) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
}

const defaultWishlistContext: WishlistContextType = {
  items: [],
  totalItems: 0,
  isInWishlist: () => false,
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
  clearWishlist: () => {},
}

const WishlistContext = createContext<WishlistContextType>(defaultWishlistContext)

const WISHLIST_STORAGE_KEY = 'glorov_botanical_wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load wishlist from localStorage:', e)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Sync to localStorage whenever items change after initial hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage:', e)
    }
  }, [items, isHydrated])

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.id === productId)
    },
    [items]
  )

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      } else {
        return [item, ...prev]
      }
    })
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId))
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [])

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext)
  return context || defaultWishlistContext
}
