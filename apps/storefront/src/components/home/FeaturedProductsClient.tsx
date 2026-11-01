'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Sprout, Leaf } from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import styles from './FeaturedProducts.module.css'

interface FeaturedProductsClientProps {
  initialProducts: StoreCatalogProduct[]
}

type TabKey = 'all' | 'plants' | 'seeds'

const SUB_CATEGORY_PILLS = [
  { label: 'Desi Vegetable Seeds', href: '/categories/vegetable-seeds' },
  { label: 'Festive Flower Seeds', href: '/categories/flower-seeds' },
  { label: 'Indoor Foliage Plants', href: '/categories/live-plants' },
  { label: 'Medicinal Herbs', href: '/categories/seeds' },
]

export function FeaturedProductsClient({ initialProducts }: FeaturedProductsClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  // Categorize products into live plants vs seeds
  const { livePlants, seeds, curatedAll } = useMemo(() => {
    const plantsList: StoreCatalogProduct[] = []
    const seedsList: StoreCatalogProduct[] = []

    for (const product of initialProducts) {
      const handle = product.handle || ''
      const catHandle = product.categories?.[0]?.handle || ''
      const isPerishable = Boolean((product.metadata || {}).is_perishable)
      const isSeed =
        catHandle.includes('seed') ||
        handle.includes('seed') ||
        (!isPerishable && !catHandle.includes('plant'))

      if (isSeed) {
        seedsList.push(product)
      } else {
        plantsList.push(product)
      }
    }

    // Prioritize popular botanical staples like Arugula (Culinary Herb) and Basil
    seedsList.sort((a, b) => {
      const aScore = a.handle?.includes('arugula') ? 10 : a.handle?.includes('basil') ? 5 : 0
      const bScore = b.handle?.includes('arugula') ? 10 : b.handle?.includes('basil') ? 5 : 0
      return bScore - aScore
    })

    // Curate a balanced 8 products for "All": 4 plants + 4 seeds
    const mixed: StoreCatalogProduct[] = []
    const maxHalf = 4
    const halfPlants = plantsList.slice(0, maxHalf)
    const halfSeeds = seedsList.slice(0, maxHalf)

    const maxLength = Math.max(halfPlants.length, halfSeeds.length)
    for (let i = 0; i < maxLength; i++) {
      if (i < halfPlants.length) mixed.push(halfPlants[i])
      if (i < halfSeeds.length) mixed.push(halfSeeds[i])
    }

    if (mixed.length < 8) {
      const remaining = initialProducts.filter((p) => !mixed.some((m) => m.id === p.id))
      mixed.push(...remaining.slice(0, 8 - mixed.length))
    }

    return {
      livePlants: plantsList.slice(0, 8),
      seeds: seedsList.slice(0, 8),
      curatedAll: mixed.slice(0, 8),
    }
  }, [initialProducts])

  // Get current active products — strictly capped at 8 items max
  const displayedProducts = useMemo(() => {
    if (activeTab === 'plants') return livePlants.slice(0, 8)
    if (activeTab === 'seeds') return seeds.slice(0, 8)
    return curatedAll.slice(0, 8)
  }, [activeTab, livePlants, seeds, curatedAll])

  return (
    <section id="catalog" className={styles.section} aria-label="Featured Seeds and Plants">
      <div className={styles.container}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div className={styles.headerInfo}>
            <div className={styles.badgeRow}>
              <span className={styles.bestsellerBadge}>
                <Sparkles size={12} style={{ color: '#ffd51f', flexShrink: 0 }} aria-hidden="true" />
                <span>Nursery Bestsellers</span>
              </span>
              <span className={styles.testedBadge}>95%+ Germination Tested • Pan-India Dispatch</span>
            </div>
            <h2 className={styles.heading}>
              Featured Seeds &amp; Botanicals
            </h2>
            <p className={styles.subtitle}>
              Hand-picked selection of high-viability Desi seeds and climate-hardened live plants.
            </p>
          </div>

          <Link href="/store" className={styles.viewAllBtn}>
            <span>View Full Catalog</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Interactive Curated Tabs Bar */}
        <div className={styles.filterChipsBar} role="tablist" aria-label="Catalog Collection Switcher">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`${styles.filterChip} ${activeTab === 'all' ? styles.filterChipActive : ''}`}
          >
            <Sparkles size={13} style={{ marginRight: '6px' }} aria-hidden="true" />
            <span>All Featured ({curatedAll.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'plants'}
            onClick={() => setActiveTab('plants')}
            className={`${styles.filterChip} ${activeTab === 'plants' ? styles.filterChipActive : ''}`}
          >
            <Leaf size={13} style={{ marginRight: '6px' }} aria-hidden="true" />
            <span>Live Plants ({livePlants.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'seeds'}
            onClick={() => setActiveTab('seeds')}
            className={`${styles.filterChip} ${activeTab === 'seeds' ? styles.filterChipActive : ''}`}
          >
            <Sprout size={13} style={{ marginRight: '6px' }} aria-hidden="true" />
            <span>Heirloom Seeds ({seeds.length})</span>
          </button>

          {/* Quick link chips to category pages */}
          {SUB_CATEGORY_PILLS.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className={`${styles.filterChip} ${styles.filterChipLink}`}
            >
              {pill.label}
            </Link>
          ))}
        </div>

        {/* Product Grid — strictly capped to 8 curated products */}
        <ProductGrid
          products={displayedProducts}
          emptyMessage="Connect your Medusa backend to populate live botanical catalog products."
          resetHref="/store"
        />

        {/* Clean Bottom Explore Catalog Banner */}
        <div className={styles.bottomExploreCard}>
          <div className={styles.bottomExploreContent}>
            <div className={styles.bottomExploreTag}>
              <Sprout size={13} aria-hidden="true" />
              <span>Explore Complete Botanical Bank</span>
            </div>
            <h3 className={styles.bottomExploreTitle}>
              Looking for more specific varieties?
            </h3>
            <p className={styles.bottomExploreDesc}>
              Discover over 150+ indigenous heirloom seeds, climate-adapted live indoor plants, and organic potting mixes in our full catalog.
            </p>
          </div>
          <Link href="/store" className={styles.bottomExploreBtn}>
            <span>Browse All 150+ Varieties</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
