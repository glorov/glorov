import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  Tag,
  ShieldCheck,
  Truck,
  Sprout,
} from 'lucide-react'
import { CouponVaultInteractive } from './CouponVaultInteractive'
import styles from './OffersPage.module.css'

export const metadata: Metadata = {
  title: 'Botanical Offers, Coupons & Bank Discounts | GLOROV Botanicals',
  description:
    'Verified coupons, festival discount codes, and UPI cashback for living indoor plants and organic seeds. Save extra on conditioned specimens dispatched from Pune.',
}

export default function OffersPage() {
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
            Offers &amp; Coupons
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Tag size={14} />
          <span>Verified Botanical Deals &amp; Discounts</span>
        </div>

        <h1 className={styles.heroTitle}>Botanical Offers &amp; Coupon Vault</h1>

        <p className={styles.heroSubtitle}>
          Explore active promotional codes, seasonal discounts, and UPI bank offers. Copy your code with a single tap and apply it at checkout to green your sanctuary for less.
        </p>
      </section>

      {/* Coupon Interactive Section */}
      <section className={styles.sectionWrapper}>
        <CouponVaultInteractive />

        {/* Reassurance Grid */}
        <div className={styles.reassuranceGrid}>
          <div className={styles.reassuranceCard}>
            <div className={styles.reassuranceIcon}>
              <Sprout size={24} />
            </div>
            <div>
              <h3 className={styles.reassuranceTitle}>0% Statutory GST</h3>
              <p className={styles.reassuranceDesc}>
                All agricultural seeds are exempt from GST under HSN code 1209.
              </p>
            </div>
          </div>

          <div className={styles.reassuranceCard}>
            <div className={styles.reassuranceIcon}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className={styles.reassuranceTitle}>48-Hour Live Plant Guarantee</h3>
              <p className={styles.reassuranceDesc}>
                Every plant is moisture-conditioned for interstate courier transit.
              </p>
            </div>
          </div>

          <div className={styles.reassuranceCard}>
            <div className={styles.reassuranceIcon}>
              <Truck size={24} />
            </div>
            <div>
              <h3 className={styles.reassuranceTitle}>Free Express Delivery</h3>
              <p className={styles.reassuranceDesc}>
                Complimentary delivery on all qualifying botanical orders above ₹499.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
