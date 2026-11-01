import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, Sparkles, Sprout, CheckCircle2 } from 'lucide-react'
import styles from './SeasonalSpotlight.module.css'

export function SeasonalSpotlight() {
  return (
    <section className={styles.section}>
      <div className={styles.bloomLeft} aria-hidden="true" />
      <div className={styles.bloomRight} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Content */}
          <div className={styles.content}>
            <div className={styles.badgeRow}>
              <span className={styles.activeBadge}>
                <Sparkles size={14} color="#f59e0b" />
                <span>Seasonal Planting Window Active</span>
              </span>
              <span className={styles.cycleTag}>
                <Calendar size={13} />
                Rabi &amp; Monsoon Cycle
              </span>
            </div>

            <h2 className={styles.title}>
              All-Season Indian Sowing Window
            </h2>

            <p className={styles.description}>
              Now is the ideal time to sow cold-hardy brassicas, heirloom desi tomatoes, vibrant winter marigolds, and aromatic culinary herbs across India. All varieties undergo germination batch testing before dispatch.
            </p>

            <div className={styles.features}>
              <span className={styles.featureItem}>
                <CheckCircle2 size={16} />
                95%+ Viability Tested Batch
              </span>
              <span className={styles.featureItem}>
                <CheckCircle2 size={16} />
                Non-GMO Desi Heirlooms
              </span>
              <span className={styles.featureItem}>
                <CheckCircle2 size={16} />
                0% Agricultural GST (HSN 1209)
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className={styles.actions}>
            <Link href="/categories/seeds" className={styles.primaryBtn}>
              <Sprout size={18} />
              <span>Shop Seasonal Seeds</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="#sowing-calendar" className={styles.secondaryBtn}>
              <span>View Sowing Calendar</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
