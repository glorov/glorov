import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY, AUTH_COOKIE_NAME } from '../../../../lib/constants'
import type { CustomerNotification } from '../../../../types/account'

export const dynamic = 'force-dynamic'

export interface NotificationPreferences {
  order_updates: boolean
  shipping_alerts: boolean
  promotions: boolean
  botanical_tips: boolean
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  order_updates: true,
  shipping_alerts: true,
  promotions: true,
  botanical_tips: true,
}

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

/**
 * Format date nicely for customer notifications
 */
function formatNotificationDate(isoString?: string): string {
  if (!isoString) return 'Recent'
  try {
    const d = new Date(isoString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return 'Recent'
  }
}

/**
 * GET /api/customer/notifications
 * Retrieves real notifications and preferences persisted in Medusa customer metadata & orders.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        preferences: DEFAULT_NOTIFICATION_PREFERENCES,
        notifications: [],
        unreadCount: 0,
      })
    }

    // Demo account fallback
    if (token.startsWith('jwt_demo_session_')) {
      const demoNotifications: CustomerNotification[] = [
        {
          id: 'demo_notif_01',
          title: 'Order Confirmed (#GLR-98412)',
          message: 'Your Green Chilli Seeds & Monstera order is confirmed and being prepared.',
          date: 'Today, 10:30 AM',
          isRead: false,
          category: 'order',
          link: '/account/orders',
        },
        {
          id: 'demo_notif_02',
          title: 'Seasonal Aeration & Sowing Tip',
          message: 'Sow indigenous winter annuals in morning hours for optimal germination vigor.',
          date: 'Yesterday',
          isRead: true,
          category: 'gardening_tip',
        },
      ]
      return NextResponse.json({
        success: true,
        authenticated: true,
        preferences: DEFAULT_NOTIFICATION_PREFERENCES,
        notifications: demoNotifications,
        unreadCount: demoNotifications.filter((n) => !n.isRead).length,
      })
    }

    const baseUrl = getMedusaBaseUrl()

    // 1. Fetch customer metadata for preferences and read history
    const customerRes = await fetch(`${baseUrl}/store/customers/me`, {
      headers: getMedusaHeaders(token),
      cache: 'no-store',
    })

    if (!customerRes.ok) {
      return NextResponse.json({
        success: false,
        preferences: DEFAULT_NOTIFICATION_PREFERENCES,
        notifications: [],
        unreadCount: 0,
      })
    }

    const customerData = await customerRes.json()
    const customer = customerData.customer || customerData
    const meta = (customer.metadata || {}) as Record<string, unknown>

    const savedPrefs = (meta.notification_preferences as Partial<NotificationPreferences>) || {}
    const preferences: NotificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...savedPrefs,
    }

    const readIds = new Set<string>(
      Array.isArray(meta.notification_read_ids) ? (meta.notification_read_ids as string[]) : []
    )

    // 2. Fetch real orders to generate milestone notifications
    const notifications: CustomerNotification[] = []

    try {
      const ordersRes = await fetch(
        `${baseUrl}/store/orders?limit=10&fields=id,display_id,status,fulfillment_status,created_at,items,fulfillments`,
        {
          headers: getMedusaHeaders(token),
          cache: 'no-store',
        }
      )

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const orders = Array.isArray(ordersData.orders) ? ordersData.orders : []

        for (const order of orders) {
          const displayId = order.display_id ? `#${order.display_id}` : `#${order.id.slice(-6)}`
          const itemsCount = Array.isArray(order.items) ? order.items.length : 1

          // Order Confirmed Notification
          if (preferences.order_updates) {
            const notifId = `ord_conf_${order.id}`
            notifications.push({
              id: notifId,
              title: `Order ${displayId} Confirmed`,
              message: `We received your order for ${itemsCount} botanical item${itemsCount > 1 ? 's' : ''}. Our nursery is preparing your package.`,
              date: formatNotificationDate(order.created_at),
              isRead: readIds.has(notifId),
              category: 'order',
              link: `/account/orders/${order.id}`,
            })
          }

          // Shipping & Delivery Milestones
          if (preferences.shipping_alerts) {
            const fulfillments = Array.isArray(order.fulfillments) ? order.fulfillments : []
            for (const f of fulfillments) {
              if (f.delivered_at || order.fulfillment_status === 'delivered') {
                const notifId = `ord_deliv_${order.id}`
                notifications.push({
                  id: notifId,
                  title: `Order ${displayId} Delivered 🎉`,
                  message: 'Your botanical specimens have been safely delivered. Unbox carefully and hydrate your plants.',
                  date: formatNotificationDate(f.delivered_at || order.created_at),
                  isRead: readIds.has(notifId),
                  category: 'order',
                  link: `/account/orders/${order.id}`,
                })
              } else if (f.shipped_at || order.fulfillment_status === 'shipped') {
                const notifId = `ord_ship_${order.id}`
                notifications.push({
                  id: notifId,
                  title: `Order ${displayId} Dispatched`,
                  message: 'Your botanical package has departed our nursery in temperature-controlled packaging.',
                  date: formatNotificationDate(f.shipped_at || order.created_at),
                  isRead: readIds.has(notifId),
                  category: 'order',
                  link: `/account/orders/${order.id}`,
                })
              }
            }
          }

          // Cancellation notice
          if (order.status === 'canceled' || order.status === 'cancelled') {
            const notifId = `ord_canc_${order.id}`
            notifications.push({
              id: notifId,
              title: `Order ${displayId} Cancelled`,
              message: 'Your order has been cancelled and any refund has been initiated to your original payment method.',
              date: formatNotificationDate(order.created_at),
              isRead: readIds.has(notifId),
              category: 'order',
              link: `/account/orders/${order.id}`,
            })
          }
        }
      }
    } catch {
      // Order fetch non-blocking
    }

    // 3. Optional Botanical Tip if preference is active
    if (preferences.botanical_tips) {
      const tipId = 'tip_seasonal_cultivation'
      notifications.push({
        id: tipId,
        title: 'Seasonal Nursery Guidance',
        message: 'Ensure potted balcony greens receive morning sunlight and drain trays are emptied after evening watering.',
        date: 'This week',
        isRead: readIds.has(tipId),
        category: 'gardening_tip',
      })
    }

    // 4. Restock Alerts from customer metadata
    const stockAlerts = Array.isArray(meta.stock_alerts)
      ? (meta.stock_alerts as Array<{ productId: string; productTitle: string; requestedAt?: string }>)
      : []
    for (const alert of stockAlerts) {
      if (!alert.productId) continue
      const notifId = `stock_alert_${alert.productId}`
      notifications.push({
        id: notifId,
        title: `Restock Alert: ${alert.productTitle || 'Botanical Specimen'}`,
        message: `You will be notified immediately when ${alert.productTitle || 'this item'} returns to GLOROV nursery stock.`,
        date: formatNotificationDate(alert.requestedAt),
        isRead: readIds.has(notifId),
        category: 'stock_alert',
        link: `/products/${alert.productId}`,
      })
    }

    // 5. Optional Promotions if preference is active
    if (preferences.promotions) {
      const promoId = 'promo_monsoon_flora'
      notifications.push({
        id: promoId,
        title: 'Botanical Sanctuary Privilege',
        message: 'Enjoy complimentary express transit on all live plants and heirloom seed orders above ₹499.',
        date: 'Active',
        isRead: readIds.has(promoId),
        category: 'wishlist',
        link: '/offers',
      })
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return NextResponse.json({
      success: true,
      authenticated: true,
      preferences,
      stockAlerts,
      notifications,
      unreadCount,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch customer notifications'
    return NextResponse.json(
      {
        success: false,
        error: msg,
        preferences: DEFAULT_NOTIFICATION_PREFERENCES,
        notifications: [],
        unreadCount: 0,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customer/notifications
 * Updates customer notification preferences and read states in Medusa customer metadata.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token =
      request.cookies.get(AUTH_COOKIE_NAME)?.value ||
      cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to update preferences' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const {
      preferences,
      readNotificationId,
      markAllRead,
      notificationIds,
      restockAlert,
      removeRestockAlertId,
    } = body

    // Demo account fast-path
    if (token.startsWith('jwt_demo_session_')) {
      return NextResponse.json({
        success: true,
        preferences: preferences ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...preferences } : DEFAULT_NOTIFICATION_PREFERENCES,
        stockAlerts: restockAlert ? [restockAlert] : [],
      })
    }

    const baseUrl = getMedusaBaseUrl()

    // 1. Fetch current customer metadata
    const getRes = await fetch(`${baseUrl}/store/customers/me`, {
      headers: getMedusaHeaders(token),
      cache: 'no-store',
    })

    if (!getRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to access customer profile' },
        { status: getRes.status }
      )
    }

    const currentCustomerData = await getRes.json()
    const currentCustomer = currentCustomerData.customer || currentCustomerData
    const currentMeta = (currentCustomer.metadata || {}) as Record<string, unknown>

    // 2. Compute updated metadata
    const currentPrefs = (currentMeta.notification_preferences as Partial<NotificationPreferences>) || {}
    const updatedPreferences: NotificationPreferences = preferences
      ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...currentPrefs, ...preferences }
      : { ...DEFAULT_NOTIFICATION_PREFERENCES, ...currentPrefs }

    let updatedReadIds: string[] = Array.isArray(currentMeta.notification_read_ids)
      ? [...(currentMeta.notification_read_ids as string[])]
      : []

    if (readNotificationId && !updatedReadIds.includes(readNotificationId)) {
      updatedReadIds.push(readNotificationId)
    }

    if (markAllRead && Array.isArray(notificationIds)) {
      const set = new Set([...updatedReadIds, ...notificationIds])
      updatedReadIds = Array.from(set)
    }

    // Keep read IDs to a reasonable limit (latest 100)
    if (updatedReadIds.length > 100) {
      updatedReadIds = updatedReadIds.slice(-100)
    }

    // Handle restock alerts list
    let updatedStockAlerts: Array<{ productId: string; productTitle: string; requestedAt: string }> =
      Array.isArray(currentMeta.stock_alerts)
        ? [...(currentMeta.stock_alerts as Array<{ productId: string; productTitle: string; requestedAt: string }>)]
        : []

    if (restockAlert && restockAlert.productId) {
      updatedStockAlerts = updatedStockAlerts.filter((a) => a.productId !== restockAlert.productId)
      updatedStockAlerts.push({
        productId: String(restockAlert.productId),
        productTitle: String(restockAlert.productTitle || 'Botanical Product'),
        requestedAt: new Date().toISOString(),
      })
    }

    if (removeRestockAlertId) {
      updatedStockAlerts = updatedStockAlerts.filter((a) => a.productId !== removeRestockAlertId)
    }

    // 3. Persist to Medusa
    const patchRes = await fetch(`${baseUrl}/store/customers/me`, {
      method: 'POST',
      headers: getMedusaHeaders(token),
      body: JSON.stringify({
        metadata: {
          ...currentMeta,
          notification_preferences: updatedPreferences,
          notification_read_ids: updatedReadIds,
          stock_alerts: updatedStockAlerts,
        },
      }),
    })

    if (!patchRes.ok) {
      const errText = await patchRes.text().catch(() => '')
      return NextResponse.json(
        { success: false, error: `Medusa update failed: ${errText}` },
        { status: patchRes.status }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      readIds: updatedReadIds,
      stockAlerts: updatedStockAlerts,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update preferences'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
