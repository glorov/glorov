import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  Users,
  MapPin,
  ShieldCheck,
  Sprout,
  ArrowRight,
} from 'lucide-react'
import { CommunityGallery } from './CommunityGallery'
import styles from './CommunityPage.module.css'

export const metadata: Metadata = {
  title: 'Botanical Community Stories & Urban Sanctuaries | GLOROV Botanical Evergreen',
  description:
    'Explore authentic photos, living setups, and thriving stories from 100,000+ plant parents across India. Shop customer looks and share your green journey.',
}

export default function CommunityPage() {
  return (
    <main className={styles.pageContainer}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator} aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            Botanical Community
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Users size={14} />
          <span>Growing Together Across India</span>
        </div>

        <h1 className={styles.heroTitle}>
          India&apos;s Botanical Community &amp; Thriving Sanctuaries
        </h1>

        <p className={styles.heroSubtitle}>
          From compact Mumbai high-rise balconies to serene Bengaluru work desks and sunny Pune terraces, explore authentic living botanical journeys from plant parents nationwide.
        </p>

        {/* Community Trust Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Users size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>100,000+</p>
            <p className={styles.statLabel}>Plant Parents Thriving Nationwide</p>
          </div>

          <div className={styles.statCard}>
            <MapPin size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>500+</p>
            <p className={styles.statLabel}>Indian Cities &amp; Postal Codes Reached</p>
          </div>

          <div className={styles.statCard}>
            <ShieldCheck size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>98.4%</p>
            <p className={styles.statLabel}>Interstate Transit Survival Rate</p>
          </div>

          <div className={styles.statCard}>
            <Sprout size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>0% GST</p>
            <p className={styles.statLabel}>HSN 1209 Pure Living Seeds &amp; Plants</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.sectionWrapper}>
        <CommunityGallery />

        {/* Reassurance Banner */}
        <div className={styles.communityBanner}>
          <div>
            <h2 className={styles.bannerTitle}>Join the Glorov Botanical Green Routine™</h2>
            <p className={styles.bannerSubtitle}>
              Receive fresh seasonal heirloom seeds, live acclimatized nursery specimens, and personalized horticultural guidance delivered directly to your doorstep every month.
            </p>
          </div>
          <Link href="/subscriptions" className={styles.bannerBtn}>
            <span>Explore Subscriptions</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
