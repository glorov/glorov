import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  CustomerAuthProvider,
  useCustomerAuth,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../../src/context/CustomerAuthContext'
import { CartStickyCheckoutBar } from '../../src/components/cart/CartStickyCheckoutBar'
import { CartOrderSummary } from '../../src/components/cart/CartOrderSummary'
import { TaxBreakdownModal } from '../../src/components/cart/TaxBreakdownModal'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/account/notifications',
  useSearchParams: () => new URLSearchParams(),
}))

function TestNotificationConsumer() {
  const {
    notifications,
    notificationPreferences,
    updateNotificationPreferences,
    markNotificationAsRead,
    login,
  } = useCustomerAuth()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div>
      <span data-testid="unread-count">{unreadCount}</span>
      <span data-testid="pref-order">
        {notificationPreferences.order_updates ? 'enabled' : 'disabled'}
      </span>
      <span data-testid="pref-shipping">
        {notificationPreferences.shipping_alerts ? 'enabled' : 'disabled'}
      </span>
      <span data-testid="pref-tips">
        {notificationPreferences.botanical_tips ? 'enabled' : 'disabled'}
      </span>
      <span data-testid="pref-promo">
        {notificationPreferences.promotions ? 'enabled' : 'disabled'}
      </span>

      <button
        data-testid="login-demo"
        onClick={() => login('demo@glorov.in', 'password123')}
      >
        Login Demo
      </button>

      <button
        data-testid="toggle-order"
        onClick={() =>
          updateNotificationPreferences({
            order_updates: !notificationPreferences.order_updates,
          })
        }
      >
        Toggle Order
      </button>

      <button
        data-testid="mark-first-read"
        onClick={() => {
          if (notifications[0]) {
            markNotificationAsRead(notifications[0].id)
          }
        }}
      >
        Mark First Read
      </button>
    </div>
  )
}

describe('GLOROV-NOTIF-001 — Customer Notification Preferences & Persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/auth/session')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ authenticated: false }),
        })
      }
      if (url.includes('/api/customer/notifications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            preferences: DEFAULT_NOTIFICATION_PREFERENCES,
            notifications: [
              {
                id: 'notif_1',
                title: 'Order Confirmed (#GLR-101)',
                message: 'Your seed order is confirmed.',
                date: 'Today',
                isRead: false,
                category: 'order',
              },
              {
                id: 'notif_2',
                title: 'Sowing Guidance',
                message: 'Water morning only.',
                date: 'Yesterday',
                isRead: false,
                category: 'gardening_tip',
              },
            ],
            unreadCount: 2,
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    })
  })

  it('initializes with default notification preferences with all channels enabled', () => {
    render(
      <CustomerAuthProvider>
        <TestNotificationConsumer />
      </CustomerAuthProvider>
    )

    expect(screen.getByTestId('pref-order').textContent).toBe('enabled')
    expect(screen.getByTestId('pref-shipping').textContent).toBe('enabled')
    expect(screen.getByTestId('pref-tips').textContent).toBe('enabled')
    expect(screen.getByTestId('pref-promo').textContent).toBe('enabled')
  })

  it('updates notification preference channels and toggles state correctly', async () => {
    render(
      <CustomerAuthProvider>
        <TestNotificationConsumer />
      </CustomerAuthProvider>
    )

    fireEvent.click(screen.getByTestId('toggle-order'))
    await waitFor(() => {
      expect(screen.getByTestId('pref-order').textContent).toBe('disabled')
    })
  })

  it('correctly tracks and decrements unread notification count when marked as read', async () => {
    render(
      <CustomerAuthProvider>
        <TestNotificationConsumer />
      </CustomerAuthProvider>
    )

    fireEvent.click(screen.getByTestId('login-demo'))
    await waitFor(() => {
      const initialCount = Number(screen.getByTestId('unread-count').textContent)
      expect(initialCount).toBeGreaterThan(0)
    })

    const initialUnread = Number(screen.getByTestId('unread-count').textContent)
    fireEvent.click(screen.getByTestId('mark-first-read'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('unread-count').textContent)).toBe(initialUnread - 1)
    })
  })
})

describe('GLOROV-UI-001 — Honest Pricing & Elimination of Deceptive 35% Markup', () => {
  it('CartStickyCheckoutBar does NOT render fake strikethrough price when compareSubtotal <= total', () => {
    const { container } = render(
      <CartStickyCheckoutBar
        total={499}
        compareSubtotal={499}
        overallDiscountPercent={0}
      />
    )

    expect(screen.getByText('₹499')).toBeDefined()
    expect(container.querySelector('.line-through')).toBeNull()
    expect(screen.queryByText(/% off/i)).toBeNull()
  })

  it('CartStickyCheckoutBar renders strikethrough price ONLY when real catalog discount exists', () => {
    const { container } = render(
      <CartStickyCheckoutBar
        total={499}
        compareSubtotal={799}
        overallDiscountPercent={38}
      />
    )

    expect(screen.getByText('₹499')).toBeDefined()
    expect(container.querySelector('.line-through')?.textContent).toContain('₹799')
    expect(screen.getByText('38% off')).toBeDefined()
  })

  it('CartOrderSummary does NOT show strikethrough price or fake discount when no discount applies', () => {
    const { container } = render(
      <CartOrderSummary
        subtotal={999}
        compareSubtotal={999}
        discountAmount={0}
        shippingAmount={0}
        total={999}
        overallDiscountPercent={0}
      />
    )

    expect(screen.getAllByText('₹999').length).toBeGreaterThan(0)
    expect(container.querySelector('.line-through')).toBeNull()
    expect(screen.queryByText(/OFF\)/i)).toBeNull()
  })

  it('TaxBreakdownModal hides Original Catalog Value when no authentic discount exists', () => {
    render(
      <TaxBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        subtotal={350}
        compareSubtotal={350}
        discountAmount={0}
        shippingAmount={0}
        total={350}
      />
    )

    expect(screen.queryByText('Original Catalog Value')).toBeNull()
    expect(screen.queryByText(/You are saving/i)).toBeNull()
  })

  it('TaxBreakdownModal reveals Original Catalog Value and savings badge when authentic discount exists', () => {
    render(
      <TaxBreakdownModal
        isOpen={true}
        onClose={vi.fn()}
        subtotal={350}
        compareSubtotal={500}
        discountAmount={50}
        shippingAmount={0}
        total={300}
        appliedCoupon="DIWALI50"
      />
    )

    expect(screen.getByText('Original Catalog Value')).toBeDefined()
    expect(screen.getByText('₹500')).toBeDefined()
    expect(screen.getByText(/You are saving ₹200 on this order!/i)).toBeDefined()
  })
})
