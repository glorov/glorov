'use client'

import React from 'react'
import Link from 'next/link'
import { Sprout, RotateCcw } from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { ProductCard } from './ProductCard'
import styles from './ProductGrid.module.css'

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
      <div className={styles.emptyState}>
        <div className={styles.emptyIconCircle}>
          <Sprout size={32} />
        </div>
        <div>
          <h3 className={styles.emptyTitle}>No Botanical Items Found</h3>
          <p className={styles.emptyDescription}>{emptyMessage}</p>
        </div>
        {resetHref && (
          <Link href={resetHref} className={styles.resetButton}>
            <RotateCcw size={14} />
            <span>Reset Filters &amp; View All</span>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className={styles.gridContainer}>
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
