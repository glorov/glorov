'use client'

import React, { useState } from 'react'
import { ShoppingBag, Loader2, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './AddToCartButton.module.css'

interface AddToCartButtonProps {
  variantId: string
  label?: string
  className?: string
  disabled?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function AddToCartButton({
  variantId,
  label = 'Add to Cart',
  className = '',
  disabled = false,
  size = 'sm',
}: AddToCartButtonProps) {
  const { addToCart, openDrawer } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading || disabled) return

    setLoading(true)
    const success = await addToCart(variantId, 1)
    setLoading(false)

    if (success) {
      setAdded(true)
      openDrawer()
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const sizeClass =
    size === 'sm'
      ? styles.buttonSm
      : size === 'lg'
      ? styles.buttonLg
      : size === 'icon'
      ? styles.buttonIcon
      : ''

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || loading}
      className={`${styles.button} ${sizeClass} ${added ? styles.addedState : ''} ${className}`}
      aria-label={label}
    >
      {loading ? (
        <Loader2 size={16} className={styles.spinner} aria-hidden="true" />
      ) : added ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <ShoppingBag size={16} aria-hidden="true" />
      )}
      {size !== 'icon' && (
        <span>{added ? 'Added to Cart' : label}</span>
      )}
    </button>
  )
}
