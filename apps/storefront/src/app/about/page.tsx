import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Leaf,
  ShieldCheck,
  Sprout,
  Truck,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react'
import styles from './AboutPage.module.css'

export const metadata: Metadata = {
  title: 'Our Story & Farm-to-Home Mission — GLOROV Botanicals',
  description: 'Learn about GLOROV Botanicals, our Pune nursery propagation practices, non-GMO organic seeds, and sustainable living botany.',
}

export default function AboutPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>About Us</span>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Leaf size={14} aria-hidden="true" />
            <span>Farm-To-Home Living Botany</span>
          </div>
          <h1 className={styles.heroTitle}>Bringing Green Sanctuaries to Indian Homes</h1>
          <p className={styles.heroSubtitle}>
            Cultivated with patience at our Pune propagation nursery, delivered fresh to doorsteps across India with specialized moisture-shield transit protection.
          </p>
        </div>
      </section>

      {/* 3. Main Content */}
      <main className={styles.mainContent}>
        {/* Story Narrative Section */}
        <section className={styles.storySection} aria-label="Our Origin Story">
          <div className={styles.storyContent}>
            <p className={styles.sectionPreheading}>The GLOROV Journey</p>
            <h2 className={styles.sectionHeading}>Rooted in Pune’s Rich Horticultural Heritage</h2>
            <p className={styles.storyParagraph}>
              Founded in Maharashtra&apos;s renowned agricultural belt of Pune, GLOROV was born with a single guiding mission: to reconnect urban dwellers with living flora in their purest, most resilient form.
            </p>
            <p className={styles.storyParagraph}>
              Modern urban living often leaves homes surrounded by concrete and synthetic air. While retail nurseries frequently treat plants as transient decor, heavily dosing them with synthetic growth inhibitors, GLOROV takes a fundamentally different path.
            </p>
            <div className={styles.storyHighlight}>
              &quot;We don&apos;t just sell plants; we propagate living companions hardened for real home environments, accompanied by lifelong botanical guidance.&quot;
            </div>
            <p className={styles.storyParagraph}>
              From desi heirloom seeds preserved for generations to climate-resilient indoor air-purifying botanicals, every specimen is nurtured with organic vermicompost, beneficial soil microbes, and natural sunlight.
            </p>
          </div>

          <div className={styles.storyVisualCard}>
            <span className={styles.visualBadge}>Pune Propagation Facility</span>
            <h3 className={styles.visualTitle}>Conditioned for Climate Resilience</h3>
            <p className={styles.visualText}>
              Every botanical specimen is nurtured through seasonal acclimation cycles at PIN 411001 before receiving our green seal of dispatch readiness.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffd51f', fontWeight: 700, fontSize: '0.875rem' }}>
              <ShieldCheck size={18} />
              <span>48-Hour Live Arrival Guarantee</span>
            </div>
          </div>
        </section>

        {/* 4 Guiding Pillars */}
        <section className={styles.pillarsSection} aria-label="Our 4 Botanical Pillars">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionPreheading}>Our Commitments</p>
            <h2 className={styles.sectionHeading}>The Four Pillars of GLOROV Botany</h2>
          </div>

          <div className={styles.pillarsGrid}>
            <article className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <Leaf size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.pillarTitle}>Direct From Pune Nursery</h3>
              <p className={styles.pillarDesc}>
                Zero middlemen. Plants travel directly from our open-air shade houses to your doorstep, minimizing handling stress and root shock.
              </p>
            </article>

            <article className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <Sprout size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.pillarTitle}>Pure Desi &amp; Organic Seeds</h3>
              <p className={styles.pillarDesc}>
                Open-pollinated, non-GMO indigenous seeds with verified 80%+ germination rates. Zero statutory GST under agricultural HSN Code 1209.
              </p>
            </article>

            <article className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <Truck size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.pillarTitle}>Moisture-Shield Transit</h3>
              <p className={styles.pillarDesc}>
                Biodegradable coco-peat root hydration wrap and shock-absorbing aerated cartons engineered to withstand interstate express travel.
              </p>
            </article>

            <article className={styles.pillarCard}>
              <div className={styles.pillarIconWrap}>
                <HeartHandshake size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.pillarTitle}>Lifelong Expert Guidance</h3>
              <p className={styles.pillarDesc}>
                Our plant doctors in Pune are just a WhatsApp message away. From repotting timing to monsoon watering schedules, we guide your garden.
              </p>
            </article>
          </div>
        </section>

        {/* Stats Counter Section */}
        <section className={styles.statsSection} aria-label="Botanical Milestones">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50,000+</span>
              <span className={styles.statLabel}>Plants Delivered</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>19,000+</span>
              <span className={styles.statLabel}>PIN Codes Serviced</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Non-GMO Desi Seeds</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>0% GST</span>
              <span className={styles.statLabel}>Statutory HSN 1209</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection} aria-label="Explore Catalog Call to Action">
          <h2 className={styles.ctaTitle}>Ready to cultivate your green oasis?</h2>
          <p className={styles.ctaText}>
            Explore our curated catalog of air-purifying indoor plants and desi vegetable seeds, backed by our 48-Hour Live Arrival Guarantee.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/categories/live-plants" className={styles.primaryCta}>
              <span>Shop Living Plants</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/categories/seeds" className={styles.secondaryCta}>
              <span>Explore Desi Seeds</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
