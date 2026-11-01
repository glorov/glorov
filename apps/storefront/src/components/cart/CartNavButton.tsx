'use client'

import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './CartNavButton.module.css'

export function CartNavButton() {
  const { totalItems, openDrawer } = useCart()

  return (
    <button
      onClick={openDrawer}
      type="button"
      className={styles.button}
      aria-label={`Shopping Cart (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`}
    >
      <ShoppingBag size={18} aria-hidden="true" />
      <span className={styles.label}>Cart</span>
      <span
        key={totalItems}
        className={styles.badge}
        aria-hidden="true"
      >
        {totalItems}
      </span>
    </button>
  )
}
