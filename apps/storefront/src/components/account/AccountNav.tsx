'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, User, LogOut } from 'lucide-react'
import { logoutCustomerAction } from '@/lib/customer-actions'
import styles from './AccountNav.module.css'

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Order History', icon: Package },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile Settings', icon: User },
]

export function AccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutCustomerAction()
      router.push('/account/login')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav aria-label="Customer account navigation" className={styles.navContainer}>
      <div className={styles.navSectionHeader}>Account Navigation</div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/account'
            ? pathname === '/account'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Icon className={styles.navIcon} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        )
      })}

      <hr className={styles.divider} aria-hidden="true" />

      <button
        type="button"
        disabled={isLoggingOut}
        onClick={handleLogout}
        className={styles.logoutBtn}
        aria-label="Sign out of customer account"
      >
        <LogOut className={styles.navIcon} aria-hidden="true" />
        <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
      </button>
    </nav>
  )
}
