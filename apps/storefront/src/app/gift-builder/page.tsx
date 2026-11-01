import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Gift,
  ShieldCheck,
  Truck,
  Sprout,
} from 'lucide-react'
import { BotanicalGiftCustomizer } from './BotanicalGiftCustomizer'
import styles from './GiftBuilderPage.module.css'

export const metadata: Metadata = {
  title: 'Build Your Custom Botanical Gift Hamper | GLOROV Living Gifts',
  description:
    'Customize a personalized living plant and heirloom seed gift hamper. Include plantable seed-paper cards with handwritten greetings, luxury gift packaging, and express pan-India dispatch.',
  openGraph: {
    title: 'Custom Botanical Gift Hamper Builder | GLOROV Botanicals',
    description:
      'Craft a living botanical gift with nursery plants, certified organic seeds, and custom plantable greeting cards.',
  },
}

export default function GiftBuilderPage() {
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
          <li>
            <Link href="/gifting" className={styles.breadcrumbLink}>
              Gifting
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            Custom Hamper Builder
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Gift size={16} />
          Personalized Living Plant &amp; Seed Hampers
        </div>

        <h1 className={styles.heroTitle}>Craft a Living Botanical Gift</h1>

        <p className={styles.heroSubtitle}>
          Give the gift that grows. Pair a thriving nursery plant with organic seeds, write a personal message on plantable seed paper, and delight friends, family, or colleagues with sustainable green prosperity.
        </p>
      </section>

      {/* 3. Interactive Hamper Builder Tool */}
      <section aria-label="Interactive Gift Hamper Builder">
        <BotanicalGiftCustomizer />
      </section>

      {/* 4. Trust & Gifting Assurance */}
      <div style={{ maxWidth: 1200, margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--ugaoo-border)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <ShieldCheck size={28} color="var(--ugaoo-green)" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ugaoo-green)' }}>
              48-Hour Live Plant Guarantee
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ugaoo-text-muted)' }}>
              Conditioned for interstate air travel with coco-root hydration.
            </p>
          </div>

          <div>
            <Sprout size={28} color="var(--ugaoo-green)" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ugaoo-green)' }}>
              Plantable Seed-Paper Card
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ugaoo-text-muted)' }}>
              Greeting note embedded with wild basil seeds to sow in soil after reading.
            </p>
          </div>

          <div>
            <Truck size={28} color="var(--ugaoo-green)" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ugaoo-green)' }}>
              Pan-India Express Dispatch
            </h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ugaoo-text-muted)' }}>
              Shipped directly from our Pune nursery to over 19,000 PIN codes.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
