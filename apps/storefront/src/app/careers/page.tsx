import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  Sparkles,
  Award,
  Heart,
  Gift,
  Trees,
} from 'lucide-react'
import { CareersInteractive } from './CareersInteractive'
import styles from './CareersPage.module.css'

export const metadata: Metadata = {
  title: 'Horticultural Careers & Opportunities | GLOROV Botanical Nursery',
  description:
    'Join India’s premier living botanical house. Explore full-time horticultural, nursery logistics, digital engineering, and experiential studio roles at GLOROV.',
}

const CULTURE_STATS = [
  { value: '25 Acres', label: 'Hadapsar Mother Nursery & Tissue Lab' },
  { value: '120+', label: 'Botanists, Agronomists & Technologists' },
  { value: '4 Studios', label: 'Biophilic Experiential Spaces (MUM & BLR)' },
  { value: '100% Organic', label: 'Zero Chemical Pesticides Policy' },
]

const BENEFIT_PILLARS = [
  {
    icon: Trees,
    title: 'Biophilic Working Sanctuaries',
    description:
      'Work amidst over 50,000 thriving living plants in high-oxygen green nurseries and studios engineered for restorative focus.',
  },
  {
    icon: Award,
    title: 'Master Botanical Mentorship',
    description:
      'Train directly under Dr. Ramesh Patil and veteran agronomists in soil biology, tissue culture, and heirloom seed genetics.',
  },
  {
    icon: Gift,
    title: 'Annual Green Allowance',
    description:
      'Every GLOROV team member receives ₹15,000 in annual botanical stipends to build their own urban indoor jungle and seed library.',
  },
  {
    icon: Heart,
    title: 'Holistic Health & Rest Protocols',
    description:
      'Comprehensive family healthcare coverage, mandatory outdoor nursery breaks, and generous wellness sabbaticals.',
  },
]

export default function CareersPage() {
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
          <li>
            <span className={styles.breadcrumbCurrent} aria-current="page">
              Careers
            </span>
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <header className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          <span>Horticultural Careers at GLOROV</span>
        </div>
        <h1 className={styles.heroTitle}>Grow Your Career With Living Nature</h1>
        <p className={styles.heroSubtitle}>
          We are horticulturalists, agronomists, software architects, and botanic stylists on a mission
          to reconnect urban India with authentic, pesticide-free living plants and heirloom seeds.
        </p>

        {/* Culture Stats */}
        <div className={styles.statsGrid}>
          {CULTURE_STATS.map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Interactive Open Roles Section */}
      <section className={styles.sectionWrapper} aria-labelledby="open-roles-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionPreheading}>Current Openings</div>
          <h2 id="open-roles-heading" className={styles.sectionTitle}>
            Find Your Calling in Our Green Family
          </h2>
          <p className={styles.sectionSubtitle}>
            Browse active roles across Hadapsar Mother Nursery, our regional distribution hubs, biophilic
            retail studios, and technology headquarters.
          </p>
        </div>

        <CareersInteractive />
      </section>

      {/* Culture & Benefits Pillars */}
      <section className={styles.sectionWrapper} aria-labelledby="culture-pillars-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionPreheading}>Life at GLOROV</div>
          <h2 id="culture-pillars-heading" className={styles.sectionTitle}>
            Rooted in Growth, Well-being & Passion
          </h2>
          <p className={styles.sectionSubtitle}>
            We believe that to cultivate healthy plants for our community, we must first cultivate
            an environment where every botanical practitioner can flourish.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {BENEFIT_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div key={idx} className={styles.pillarCard}>
                <div className={styles.pillarIconWrap}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDesc}>{pillar.description}</p>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
