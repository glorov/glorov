'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './MobileDock.module.css'

export function MobileDock() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  const isHome = pathname === '/'
  const isCategories = pathname.startsWith('/categories') || pathname.startsWith('/category')
  const isCart = pathname === '/cart' || pathname.startsWith('/cart')
  const isCheckout = pathname.startsWith('/checkout')
  const isAccount = pathname.startsWith('/account')

  // When inside cart or checkout funnel, hide the mobile nav dock so checkout actions are unobstructed
  if (isCart || isCheckout) {
    return null
  }

  return (
    <nav aria-label="Mobile Navigation Dock" className={styles.mobileDock}>
      {/* 1. Home */}
      <Link
        href="/"
        className={`${styles.dockItem} ${isHome ? styles.dockItemActive : ''}`}
        aria-label="Home"
      >
        <div className={styles.iconWrapper}>
          <Home className={styles.dockIcon} aria-hidden="true" />
        </div>
        <span>Home</span>
      </Link>

      {/* 2. Categories */}
      <Link
        href="/categories"
        className={`${styles.dockItem} ${isCategories ? styles.dockItemActive : ''}`}
        aria-label="Categories"
      >
        <div className={styles.iconWrapper}>
          <LayoutGrid className={styles.dockIcon} aria-hidden="true" />
        </div>
        <span>Categories</span>
      </Link>

      {/* 3. Account */}
      <Link
        href="/account"
        className={`${styles.dockItem} ${isAccount ? styles.dockItemActive : ''}`}
        aria-label="Account"
      >
        <div className={styles.iconWrapper}>
          <User className={styles.dockIcon} aria-hidden="true" />
        </div>
        <span>Account</span>
      </Link>

      {/* 4. Cart */}
      <Link
        href="/cart"
        className={`${styles.dockItem} ${isCart ? styles.dockItemActive : ''}`}
        aria-label={`Cart (${totalItems} items)`}
      >
        <div className={styles.iconWrapper}>
          <ShoppingBag className={styles.dockIcon} aria-hidden="true" />
          {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
        </div>
        <span>Cart</span>
      </Link>
    </nav>
  )
}
