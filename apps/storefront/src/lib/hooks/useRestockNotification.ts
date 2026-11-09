'use client'

import { useState, useEffect, useCallback, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerAuthContext } from '../../context/CustomerAuthContext'
import { useToast } from '../../context/StorefrontContext'

const LOCAL_STORAGE_KEY = 'glorov_restock_alerts'

interface StockAlertCacheItem {
  productId: string
  productTitle: string
  subscribedAt: string
}

export function useRestockNotification() {
  const router = useRouter()
  const authContext = useContext(CustomerAuthContext)
  const isAuthenticated = Boolean(authContext?.isAuthenticated)
  const refreshNotifications = authContext?.refreshNotifications

  const { showToast } = useToast()
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(() => new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Hydrate from localStorage on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        const parsed: StockAlertCacheItem[] = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setSubscribedIds(new Set(parsed.map((item) => item.productId)))
        }
      }
    } catch {
      // Ignore storage error
    }
  }, [])

  // If user is authenticated, sync with server
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return
    let isMounted = true

    const fetchServerAlerts = async () => {
      try {
        const res = await fetch('/api/customer/notifications', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data && Array.isArray(data.stockAlerts) && isMounted) {
          const serverAlerts: Array<{ productId: string; productTitle: string }> = data.stockAlerts
          setSubscribedIds((prev) => {
            const next = new Set(prev)
            serverAlerts.forEach((a) => {
              if (a.productId) next.add(a.productId)
            })
            return next
          })
        }
      } catch {
        // Non-blocking
      }
    }

    fetchServerAlerts()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const isSubscribed = useCallback(
    (productId?: string): boolean => {
      if (!productId) return false
      return subscribedIds.has(productId)
    },
    [subscribedIds]
  )

  const subscribeToRestock = useCallback(
    async (product: { id: string; title: string; slug?: string }): Promise<{ success: boolean; requiresAuth?: boolean }> => {
      if (!product || !product.id) return { success: false }

      // 1. Unauthenticated users MUST sign in first
      if (!isAuthenticated) {
        showToast('info', `Please sign in to receive restock notifications for "${product.title}".`, {
          title: 'Sign In Required',
          duration: 4000,
        })

        if (typeof window !== 'undefined') {
          const currentUrl = window.location.pathname + window.location.search
          const targetUrl = `/auth/login?redirect=${encodeURIComponent(currentUrl)}&reason=${encodeURIComponent('Please sign in to receive restock notifications.')}`
          if (router) {
            router.push(targetUrl)
          } else {
            window.location.href = targetUrl
          }
        }
        return { success: false, requiresAuth: true }
      }

      // 2. Authenticated user: persist to backend
      setIsLoading(true)
      try {
        const res = await fetch('/api/customer/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restockAlert: {
              productId: product.id,
              productTitle: product.title,
            },
          }),
        })

        if (!res.ok) {
          throw new Error('Could not register restock notification.')
        }

        // Update local cache
        setSubscribedIds((prev) => {
          const next = new Set(prev)
          next.add(product.id)
          return next
        })

        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
            const current: StockAlertCacheItem[] = raw ? JSON.parse(raw) : []
            const filtered = current.filter((item) => item.productId !== product.id)
            filtered.push({
              productId: product.id,
              productTitle: product.title,
              subscribedAt: new Date().toISOString(),
            })
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
          } catch {}
        }

        showToast('success', `We will notify you immediately once fresh stock of "${product.title}" is ready!`, {
          title: 'Restock Alert Active',
          duration: 4000,
        })

        // Refresh background notification list
        if (refreshNotifications) {
          refreshNotifications().catch(() => {})
        }

        return { success: true }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to set restock alert'
        showToast('error', msg, { title: 'Alert Registration Error' })
        return { success: false }
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, router, showToast, refreshNotifications]
  )

  return {
    isSubscribed,
    subscribeToRestock,
    isLoading,
  }
}
