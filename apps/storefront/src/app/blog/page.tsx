import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen } from 'lucide-react'
import { BlogList } from './BlogList'
import styles from './BlogIndex.module.css'

export const metadata: Metadata = {
  title: 'Plant Care Chronicles & Gardening Guides | GLOROV Botanicals',
  description:
    'Horticultural wisdom from our Pune propagation nursery. Explore comprehensive guides on NASA air-purifying indoor plants, non-GMO desi seeds sowing, potting mix formulas, and leaf diagnostics.',
  keywords: [
    'gardening guides India',
    'indoor plant care blog',
    'how to sow desi seeds',
    'yellow leaves diagnosis plant',
    'Kharif sowing calendar India',
    'NASA clean air study plants',
  ],
}

export default function BlogIndexPage() {
  return (
    <div className={styles.container}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Botanical Chronicles</span>
      </nav>

      {/* 2. Hero Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <BookOpen size={14} aria-hidden="true" />
          <span>Pune Nursery Horticultural Library</span>
        </div>
        <h1 className={styles.title}>Plant Care Chronicles &amp; Guides</h1>
        <p className={styles.subtitle}>
          Cultivate your green thumb with practical, science-backed guidance authored by our Pune agronomists.
          From monsoon seed germination to indoor low-light care, we help your home garden flourish.
        </p>
      </header>

      {/* 3. Filterable Article List */}
      <BlogList />
    </div>
  )
}
