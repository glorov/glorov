'use client'

import React, { useState } from 'react'
import { ShoppingBag, Loader2, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'

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
  const { addToCart } = useCart()
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
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={disabled || loading}
      variant="botanical"
      size={size}
      className={`relative gap-1.5 transition-all ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Adding...</span>
        </>
      ) : added ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-300" />
          <span>Added!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{label}</span>
        </>
      )}
    </Button>
  )
}
