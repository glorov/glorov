'use client'

import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'

export function CartNavButton() {
  const { totalItems, openDrawer } = useCart()

  return (
    <Button
      onClick={openDrawer}
      type="button"
      variant="botanical"
      size="sm"
      className="relative gap-1.5 rounded-full px-3 cursor-pointer shadow-xs"
      aria-label={`Shopping Cart (${totalItems} items)`}
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline text-xs font-semibold">Cart</span>
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-botanical-950 transition-transform">
        {totalItems}
      </span>
    </Button>
  )
}
