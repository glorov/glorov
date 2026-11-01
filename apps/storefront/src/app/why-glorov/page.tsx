import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  ShieldCheck,
  Award,
  Sprout,
  TreeDeciduous,
  PackageCheck,
  Stethoscope,
  ArrowRight,
} from 'lucide-react'
import { ComparisonMatrixInteractive } from './ComparisonMatrixInteractive'
import styles from './WhyGlorovPage.module.css'

export const metadata: Metadata = {
  title: 'Why GLOROV Botanicals | The Nursery Benchmark vs The Rest',
  description:
    'Discover why plants dispatched directly from our 25-acre Pune nursery thrive: 3-step quality checks, organic neem conditioning, 48-hour live plant guarantee, and 0% GST seeds.',
}

export default function WhyGlorovPage() {
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
            Why GLOROV
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Award size={14} />
          <span>The Pune Nursery Benchmark</span>
        </div>

        <h1 className={styles.heroTitle}>Why Choose GLOROV Botanicals?</h1>

        <p className={styles.heroSubtitle}>
          Not all plants are nurtured equal. Discover how our climate-conditioned living specimens and certified heirloom seeds outperform roadside stalls and generic marketplace dropshippers.
        </p>

        {/* Trust Stats Bar */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <ShieldCheck size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>3-Step</p>
            <p className={styles.statLabel}>Horticultural Quality Check</p>
          </div>

          <div className={styles.statCard}>
            <Sprout size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>100%</p>
            <p className={styles.statLabel}>Organic Neem Pest-Controlled</p>
          </div>

          <div className={styles.statCard}>
            <PackageCheck size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>48-Hour</p>
            <p className={styles.statLabel}>Live Plant Replacement Guarantee</p>
          </div>

          <div className={styles.statCard}>
            <Award size={24} color="var(--ugaoo-green, #0a4c36)" />
            <p className={styles.statValue}>0% GST</p>
            <p className={styles.statLabel}>HSN 1209 Certified Organic Seeds</p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className={styles.sectionWrapper} aria-label="Glorov vs The Rest Benchmark Matrix">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>The Botanical Benchmark</p>
          <h2 className={styles.sectionTitle}>GLOROV vs The Rest</h2>
          <p className={styles.sectionSubtitle}>
            A side-by-side comparison of our propagation practices, root mediums, and transit safety versus conventional roadside vendors and online aggregators.
          </p>
        </div>

        <ComparisonMatrixInteractive />
      </section>

      {/* Four Pillars of Excellence */}
      <section className={styles.sectionWrapper} aria-label="Four Pillars of Botanical Excellence">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>Our Uncompromising Standards</p>
          <h2 className={styles.sectionTitle}>Four Pillars of Botanical Excellence</h2>
        </div>

        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <TreeDeciduous size={26} />
            </div>
            <h3 className={styles.pillarTitle}>Direct Pune Nursery Dispatch</h3>
            <p className={styles.pillarDesc}>
              Zero warehouse holding or multi-tier middleman transfers. Every plant journeys directly from our high-tech propagation polyhouses in Hadapsar, Pune.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <PackageCheck size={26} />
            </div>
            <h3 className={styles.pillarTitle}>Moisture-Shield Crating</h3>
            <p className={styles.pillarDesc}>
              Engineered breathable corrugated boxes with custom root moisture locks that protect foliage against crushing, turbulence, and dehydration.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <Sprout size={26} />
            </div>
            <h3 className={styles.pillarTitle}>Bioactive Soil Chemistry</h3>
            <p className={styles.pillarDesc}>
              Formulated with aerated coco-peat, agricultural biochar, and aged vermicompost for maximum capillary root aeration and zero immediate repotting shock.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <Stethoscope size={26} />
            </div>
            <h3 className={styles.pillarTitle}>Lifetime Agronomist Support</h3>
            <p className={styles.pillarDesc}>
              Our relationship doesn&apos;t end at delivery. Consult Dr. Ramesh Patil and our clinic team anytime via WhatsApp or our digital Care Companion.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className={styles.ctaBanner}>
          <div>
            <h2 className={styles.ctaTitle}>Experience the Nursery Difference</h2>
            <p className={styles.ctaSubtitle}>
              Join over 100,000 plant parents across India who trust GLOROV for healthy, thriving, and pesticide-free living plants and organic seeds.
            </p>
          </div>
          <Link href="/store" className={styles.ctaBtn}>
            <span>Explore Botanical Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
