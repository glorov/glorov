'use client'

import React from 'react'
import Link from 'next/link'
import { Sprout, RotateCcw } from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'

interface ProductGridProps {
  products: StoreCatalogProduct[]
  emptyMessage?: string
  resetHref?: string
}

export function ProductGrid({
  products,
  emptyMessage = 'No botanical specimens or seeds found matching your criteria.',
  resetHref = '/store',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 px-4 rounded-2xl border border-dashed border-border bg-earth-50/50 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700">
          <Sprout className="h-8 w-8" />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="text-lg font-bold text-botanical-950">No Botanical Items Found</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {emptyMessage}
          </p>
        </div>
        {resetHref && (
          <Button asChild variant="outline" size="sm" className="gap-2 text-xs">
            <Link href={resetHref}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters &amp; View All</span>
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  )
}
