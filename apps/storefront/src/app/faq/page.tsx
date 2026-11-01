import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, HelpCircle, Phone, Sparkles } from 'lucide-react'
import { FaqFilter } from './FaqFilter'
import styles from './FaqPage.module.css'

export const metadata: Metadata = {
  title: 'Plant Care & Horticultural FAQ | GLOROV Botanicals',
  description:
    'Got questions about live plant unboxing, watering finger tests, moisture-shield transit packaging, non-GMO heirloom seeds, or our 48-Hour Live Plant Guarantee? Explore comprehensive answers from our Pune nursery.',
  keywords: [
    'plant care FAQ',
    'live plant transit questions',
    'how to water indoor plants',
    'moisture shield packaging Pune',
    'heirloom seeds germination guarantee',
    'live plant delivery guarantee India',
  ],
}

export default function FaqPage() {
  return (
    <div className={styles.container}>
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Horticultural Care &amp; FAQ</span>
      </nav>

      {/* 2. Header Hero */}
      <header className={styles.faqHero}>
        <div className={styles.badge}>
          <HelpCircle size={14} aria-hidden="true" />
          <span>Horticultural Knowledge Base</span>
        </div>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Everything you need to know about caring for live botanicals, moisture-shield packaging,
          heirloom seeds germination, and transit guarantees from our Pune propagation nursery.
        </p>
      </header>

      {/* 3. Interactive Filter & Accordions */}
      <section aria-label="Questions and Answers">
        <FaqFilter />
      </section>

      {/* 4. Plant Doctor WhatsApp Helpline Banner */}
      <aside className={styles.doctorBanner} aria-label="Plant Specialist Consultation">
        <div className={styles.doctorTextCol}>
          <div className={styles.doctorBadge}>
            <Sparkles size={12} aria-hidden="true" />
            <span>Dedicated Botanical Support</span>
          </div>
          <h2 className={styles.doctorTitle}>Still Have Plant Care Questions?</h2>
          <p className={styles.doctorDesc}>
            Send unboxing photos or leaf diagnostic queries directly to our Pune horticultural specialists on WhatsApp. We provide free lifetime plant parenting advice.
          </p>
        </div>
        <a
          href="https://wa.me/918087087224?text=Hi%20GLOROV%20Plant%20Doctor%2C%20I%20have%20a%20question%20about%20my%20plants"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.doctorCtaBtn}
        >
          <Phone size={16} aria-hidden="true" />
          <span>Chat with Plant Doctor</span>
        </a>
      </aside>
    </div>
  )
}
