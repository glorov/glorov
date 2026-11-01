import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Calendar,
  CloudRain,
  Snowflake,
  Sun,
  Sprout,
} from 'lucide-react'
import { InteractiveSowingMatrix } from './InteractiveSowingMatrix'
import styles from './SowingCalendarPage.module.css'

export const metadata: Metadata = {
  title: 'Indian Botanical Sowing Calendar | Seasonal Kharif, Rabi & Zaid Planting Guide',
  description:
    'Complete month-by-month Indian seed sowing calendar. Filter by agro-climatic region to find the best heirloom vegetables, festive flowers, and medicinal herbs to sow today.',
  openGraph: {
    title: 'Indian Sowing Calendar | GLOROV Botanicals',
    description:
      'Discover which seeds to sow this month across Indian climate zones with direct farm-to-table planting instructions.',
  },
}

export default function SowingCalendarPage() {
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const isRabi = currentMonth >= 10 || currentMonth <= 2
  const isKharif = currentMonth >= 6 && currentMonth <= 9
  const isZaid = currentMonth >= 3 && currentMonth <= 5

  return (
    <main className={styles.pageContainer}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            Indian Sowing Calendar
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Calendar size={16} />
          Certified Pune Mother Nursery Sowing Calendar
        </div>

        <h1 className={styles.heroTitle}>Indian Botanical Sowing Calendar</h1>

        <p className={styles.heroSubtitle}>
          Align your gardening journey with India&apos;s traditional seasonal cycles. Discover the exact desi vegetable seeds, vibrant festive blooms, and culinary herbs conditioned to germinate successfully in your climate zone.
        </p>

        {/* 3 Seasons Overview Cards */}
        <div className={styles.seasonsGrid}>
          {/* Kharif */}
          <div className={`${styles.seasonCard} ${isKharif ? styles.activeSeasonCard : ''}`}>
            {isKharif && <span className={styles.currentSeasonBadge}>Active Season</span>}
            <div className={styles.seasonIconWrapper}>
              <CloudRain size={24} />
            </div>
            <h3 className={styles.seasonName}>Kharif Season</h3>
            <span className={styles.seasonTiming}>Monsoon (June – September)</span>
            <p className={styles.seasonDesc}>
              Warm soil and rain-fed hydration. Perfect for Desi Bhindi, Gourds (Lauki, Karela), Marigold, and Krishna Tulsi.
            </p>
          </div>

          {/* Rabi */}
          <div className={`${styles.seasonCard} ${isRabi ? styles.activeSeasonCard : ''}`}>
            {isRabi && <span className={styles.currentSeasonBadge}>Active Season</span>}
            <div className={styles.seasonIconWrapper}>
              <Snowflake size={24} />
            </div>
            <h3 className={styles.seasonName}>Rabi Season</h3>
            <span className={styles.seasonTiming}>Winter (October – February)</span>
            <p className={styles.seasonDesc}>
              Mild dry sunshine and cool nights. Prime window for Palak, Kasuri Methi, Pusa Mooli, Heirloom Tomatoes, and Winter Petunias.
            </p>
          </div>

          {/* Zaid */}
          <div className={`${styles.seasonCard} ${isZaid ? styles.activeSeasonCard : ''}`}>
            {isZaid && <span className={styles.currentSeasonBadge}>Active Season</span>}
            <div className={styles.seasonIconWrapper}>
              <Sun size={24} />
            </div>
            <h3 className={styles.seasonName}>Zaid Season</h3>
            <span className={styles.seasonTiming}>Summer (March – May)</span>
            <p className={styles.seasonDesc}>
              High solar radiation and rapid transpiration. Ideal for Crisp Cucumbers, Watermelons, Garden Mint, and Sunflowers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Sowing Matrix Tool */}
      <section className={styles.sectionWrapper} aria-labelledby="interactive-matrix-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Interactive Planting Tool</span>
          <h2 id="interactive-matrix-heading" className={styles.sectionTitle}>
            Find Seeds to Sow This Month
          </h2>
          <p className={styles.sectionSubtitle}>
            Select your agro-climatic region and target month below to filter open-pollinated, high-germination heirloom varieties certified 0% GST (HSN 1209).
          </p>
        </div>

        <InteractiveSowingMatrix />
      </section>

      {/* 4. Sowing Quality Reassurance Banner */}
      <section className={styles.sectionWrapper}>
        <div className={styles.guaranteeBanner}>
          <div className={styles.guaranteeText}>
            <h3 className={styles.guaranteeTitle}>85%+ Germination Certified Seeds</h3>
            <p className={styles.guaranteeSubtitle}>
              Every seed packet from GLOROV is batch-tested in our Hadapsar seed laboratory for vigour and purity. Packaged in moisture-resistant foil sachets with 0% GST under statutory HSN 1209.
            </p>
          </div>

          <Link
            href="/categories/seeds"
            className={styles.seedShopBtn}
          >
            <Sprout size={18} />
            Explore All Desi Seeds Catalog →
          </Link>
        </div>
      </section>
    </main>
  )
}
