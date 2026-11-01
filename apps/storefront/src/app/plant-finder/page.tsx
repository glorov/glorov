import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { PlantFinderQuiz } from './PlantFinderQuiz'
import styles from './PlantFinder.module.css'

export const metadata: Metadata = {
  title: 'Plant Finder & Green Thumb Matcher | GLOROV Botanicals',
  description:
    'Take our 60-second interactive botanical matching quiz. Answer 4 quick questions about your sunlight, room space, and care routine to discover the ideal living plants and heirloom seeds from our Pune nursery.',
  keywords: [
    'plant finder quiz',
    'which plant to buy online',
    'indoor plant recommendation',
    'low light plants India',
    'pet friendly plants',
    'best plants for beginner gardeners',
  ],
}

export default function PlantFinderPage() {
  return (
    <div className={styles.container}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Plant Finder Quiz</span>
      </nav>

      {/* 2. Hero Header */}
      <header className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={14} aria-hidden="true" />
          <span>Interactive Horticultural Guidance</span>
        </div>
        <h1 className={styles.title}>Find Your Perfect Botanical Match</h1>
        <p className={styles.subtitle}>
          Not sure where to begin your green parenting journey? Answer 4 simple questions about your space,
          sunlight exposure, and daily routine. We will curate living plants guaranteed to flourish in your home.
        </p>
      </header>

      {/* 3. Interactive Quiz Component */}
      <PlantFinderQuiz />
    </div>
  )
}
