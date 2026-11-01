import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Droplets,
  Calendar,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
} from 'lucide-react'
import { CareScheduleCalculator } from './CareScheduleCalculator'
import styles from './CareCompanionPage.module.css'

export const metadata: Metadata = {
  title: 'Digital Plant Care Companion & Watering Schedule Calculator | GLOROV Botanicals',
  description:
    'Calculate the exact watering frequency, misting protocol, and organic feeding schedule for your houseplant based on pot size, indoor sunlight, and Indian climate seasons.',
  openGraph: {
    title: 'Digital Plant Care Companion | GLOROV Botanicals',
    description:
      'Never overwater or underwater again. Personalized watering schedule calculator with calendar sync and WhatsApp reminders.',
  },
}

interface GoldenRule {
  num: number
  title: string
  desc: string
}

const GOLDEN_RULES: GoldenRule[] = [
  {
    num: 1,
    title: 'The 2-Inch Finger Moisture Test',
    desc: 'Never water on a rigid calendar alone. Insert your index finger 2 inches into the potting mix; if it feels cool and damp with soil sticking to your skin, wait 2 more days.',
  },
  {
    num: 2,
    title: 'Zero Standing Water in Saucers',
    desc: 'After hydrating, empty drainage trays and decorative cachepots within 15 minutes. Roots sitting in stagnant water succumb to anaerobic Pythium root rot within 72 hours.',
  },
  {
    num: 3,
    title: 'Rest Municipal Tap Water 24 Hours',
    desc: 'Indian municipal tap water often carries chlorine and fluoride salts that cause brown crisp leaf margins. Leaving water in an open pitcher for 24 hours allows gases to evaporate safely.',
  },
  {
    num: 4,
    title: 'Hydrate Exclusively in Morning Hours',
    desc: 'Water between 7:00 AM and 10:00 AM. Morning hydration fuels daytime photosynthesis and ensures any splashes on foliage evaporate under natural daylight, preventing fungal leaf spots.',
  },
]

export default function CareCompanionPage() {
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
            Care Companion
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Droplets size={16} />
          Certified Pune Mother Nursery Care Engine
        </div>

        <h1 className={styles.heroTitle}>Digital Plant Care Companion</h1>

        <p className={styles.heroSubtitle}>
          Stop guessing when to water. Calculate exact watering frequencies, misting protocols, and organic feeding cycles tailored specifically to your plant species, container size, home sunlight, and seasonal temperatures.
        </p>

        {/* 4 Feature Reassurance Cards */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Droplets size={22} />
            </div>
            <h3 className={styles.featureTitle}>Precise Hydration</h3>
            <p className={styles.featureDesc}>Dynamically calibrated for Indian seasonal climates.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Calendar size={22} />
            </div>
            <h3 className={styles.featureTitle}>Calendar Sync</h3>
            <p className={styles.featureDesc}>Export `.ics` recurring events to Google &amp; Apple iCal.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <ShieldCheck size={22} />
            </div>
            <h3 className={styles.featureTitle}>Root-Safe Protocols</h3>
            <p className={styles.featureDesc}>Developed by certified Pune nursery horticulturists.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <HeartPulse size={22} />
            </div>
            <h3 className={styles.featureTitle}>WhatsApp Reminders</h3>
            <p className={styles.featureDesc}>Never miss a thirsty plant alert on your phone.</p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Calculator Tool */}
      <section className={styles.sectionWrapper} aria-labelledby="calculator-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Interactive Watering Calculator</span>
          <h2 id="calculator-heading" className={styles.sectionTitle}>
            Configure Your Plant Environment
          </h2>
          <p className={styles.sectionSubtitle}>
            Adjust your plant variety and home conditions below to calculate your customized botanical care calendar.
          </p>
        </div>

        <CareScheduleCalculator />
      </section>

      {/* 4. Golden Rules of Plant Hydration */}
      <section className={styles.sectionWrapper} aria-labelledby="rules-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Horticultural Best Practices</span>
          <h2 id="rules-heading" className={styles.sectionTitle}>
            4 Golden Rules of Plant Hydration
          </h2>
          <p className={styles.sectionSubtitle}>
            Essential habits practiced at our 25-acre Pune propagation nursery to ensure thriving root architecture.
          </p>
        </div>

        <div className={styles.rulesGrid}>
          {GOLDEN_RULES.map((rule) => (
            <article key={rule.num} className={styles.ruleCard}>
              <div className={styles.ruleHeader}>
                <span className={styles.ruleNumber}>{rule.num}</span>
                <h3 className={styles.ruleTitle}>{rule.title}</h3>
              </div>
              <p className={styles.ruleDesc}>{rule.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Plant Doctor Reassurance Banner */}
      <section className={styles.sectionWrapper}>
        <div className={styles.plantDoctorBanner}>
          <div>
            <h3 className={styles.bannerTitle}>Seeing Yellow Leaves or Mystery Spots?</h3>
            <p className={styles.bannerSubtitle}>
              Our certified agronomists at the Pune Mother Nursery clinic are on standby to diagnose root rot, pest outbreaks, and nutrient chlorosis for free.
            </p>
          </div>

          <Link href="/plant-doctor" className={styles.consultDoctorBtn}>
            <Stethoscope size={18} />
            <span>Consult Plant Doctor Clinic →</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
