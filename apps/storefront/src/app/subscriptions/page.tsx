import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Package,
  ShieldCheck,
  Truck,
  Sparkles,
  HeartHandshake,
  Sprout,
  HelpCircle,
} from 'lucide-react'
import { SubscriptionPlanPicker } from './SubscriptionPlanPicker'
import styles from './SubscriptionsPage.module.css'

export const metadata: Metadata = {
  title: 'GLOROV Botanical Green Routine™ | Plant & Seed Subscription Boxes',
  description:
    'Experience the joy of monthly greenery. Handpicked nursery plants, heirloom organic seeds, and expert care guides dispatched directly from our Pune nursery.',
  openGraph: {
    title: 'GLOROV Green Routine Subscription | Monthly Living Plants & Seeds',
    description:
      'Curated monthly botanical deliveries with 48-Hour Live Plant Guarantee and free Plant Doctor consultations.',
  },
}

interface UnboxingStep {
  step: number
  title: string
  description: string
  icon: React.ElementType
}

const UNBOXING_JOURNEY: UnboxingStep[] = [
  {
    step: 1,
    title: 'Nursery Curation',
    description:
      'Our horticulturists hand-select top 5% thriving specimens from our 25-acre Pune polyhouses 24 hours prior to dispatch.',
    icon: Sprout,
  },
  {
    step: 2,
    title: 'Moisture-Shield Crating',
    description:
      'Roots are enclosed in aerated coco-peat wraps and suspended in ventilated, shock-absorbing crush-proof cartons.',
    icon: Package,
  },
  {
    step: 3,
    title: 'Delivered Fresh',
    description:
      'Dedicated express air couriers deliver living plants to your doorstep within 48 to 72 hours pan-India.',
    icon: Truck,
  },
  {
    step: 4,
    title: 'Ongoing Mentorship',
    description:
      'Scan the botanical passport QR code on the planter for monthly watering reminders and free Plant Doctor WhatsApp triage.',
    icon: HeartHandshake,
  },
]

interface SubscriptionFaq {
  question: string
  answer: string
}

const SUBSCRIPTION_FAQS: SubscriptionFaq[] = [
  {
    question: 'How do you ensure living plants survive interstate transit?',
    answer:
      'Every specimen is conditioned in our climate-controlled packing house in Pune. Roots are hydrated with natural root stimulants and secured in breathable moisture-lock coco membranes that sustain hydration for up to 8 transit days. We back every shipment with our 48-Hour Live Plant Guarantee.',
  },
  {
    question: 'Can I pause, skip, or cancel my botanical subscription?',
    answer:
      'Yes, absolutely. You can pause or skip upcoming monthly boxes at any time directly through your GLOROV customer account or by messaging our Pune concierge team before the 25th of the month.',
  },
  {
    question: 'When will my monthly botanical box arrive?',
    answer:
      'All subscription parcels are dispatched on the 1st business day of each month to avoid weekend courier layovers. Depending on your pin code, delivery takes 2 to 4 business days.',
  },
  {
    question: 'What if a plant arrives damaged or severely wilted?',
    answer:
      'Living botanicals can experience temporary travel shock. If your specimen arrives damaged, wilted beyond recovery, or broken, share an unboxing photo within 48 hours and we will dispatch a replacement free of charge or credit your account.',
  },
  {
    question: 'Are the heirloom seeds suitable for beginners?',
    answer:
      'Yes! Every box includes certified organic, non-GMO heirloom seeds (0% GST, HSN 1209) with germination rates exceeding 85%, accompanied by clear step-by-step seasonal sowing instructions.',
  },
  {
    question: 'Can I send a Green Routine subscription as a gift?',
    answer:
      'Yes! During checkout, simply select "This is a Gift" and provide the recipient\'s delivery address. We include a personalized botanical greeting card with their first box.',
  },
]

export default function SubscriptionsPage() {
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
            Green Routine Subscription
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Sparkles size={16} />
          Certified Pune Mother Nursery Green Routine™
        </div>

        <h1 className={styles.heroTitle}>A Living Botanical Ritual Delivered Monthly</h1>

        <p className={styles.heroSubtitle}>
          Receive nursery-grown live plants, seasonal heirloom seeds, and curated horticultural care chronicles delivered fresh from our Pune polyhouses to your doorstep.
        </p>

        {/* Value Propositions Bar */}
        <div className={styles.valuePropsGrid}>
          <div className={styles.valuePropCard}>
            <div className={styles.valuePropIconWrapper}>
              <Sprout size={22} />
            </div>
            <h3 className={styles.valuePropTitle}>25-Acre Nursery Fresh</h3>
            <p className={styles.valuePropDesc}>Direct from Pune Mother Nursery with zero middlemen warehouse delays.</p>
          </div>

          <div className={styles.valuePropCard}>
            <div className={styles.valuePropIconWrapper}>
              <ShieldCheck size={22} />
            </div>
            <h3 className={styles.valuePropTitle}>48-Hour Live Guarantee</h3>
            <p className={styles.valuePropDesc}>Guaranteed arrival in lush root-safe condition or free replacement.</p>
          </div>

          <div className={styles.valuePropCard}>
            <div className={styles.valuePropIconWrapper}>
              <Package size={22} />
            </div>
            <h3 className={styles.valuePropTitle}>100% Organic &amp; 0% GST</h3>
            <p className={styles.valuePropDesc}>HSN 1209 certified non-GMO seeds and eco-friendly coco-root wraps.</p>
          </div>

          <div className={styles.valuePropCard}>
            <div className={styles.valuePropIconWrapper}>
              <HeartHandshake size={22} />
            </div>
            <h3 className={styles.valuePropTitle}>Free VIP Plant Doctor</h3>
            <p className={styles.valuePropDesc}>Dedicated WhatsApp horticultural guidance with Dr. Ramesh Patil.</p>
          </div>
        </div>
      </section>

      {/* 3. Subscription Plan Picker */}
      <section className={styles.sectionWrapper} aria-labelledby="plan-picker-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Curated Monthly Rituals</span>
          <h2 id="plan-picker-heading" className={styles.sectionTitle}>
            Choose Your Botanical Routine
          </h2>
          <p className={styles.sectionSubtitle}>
            Select your preferred box theme and pre-pay duration to unlock up to 20% savings. Pause, skip, or cancel anytime.
          </p>
        </div>

        <SubscriptionPlanPicker />
      </section>

      {/* 4. The Unboxing Journey */}
      <section className={styles.sectionWrapper} aria-labelledby="unboxing-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Farm to Urban Home</span>
          <h2 id="unboxing-heading" className={styles.sectionTitle}>
            The Monthly Unboxing Journey
          </h2>
          <p className={styles.sectionSubtitle}>
            How our botanical specimens travel safely from Pune polyhouses directly into your home.
          </p>
        </div>

        <div className={styles.unboxingGrid}>
          {UNBOXING_JOURNEY.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.step} className={styles.unboxingStepCard}>
                <span className={styles.stepBadge}>{item.step}</span>
                <div className={styles.valuePropIconWrapper} style={{ width: 50, height: 50, marginTop: '0.5rem' }}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.unboxingTitle}>{item.title}</h3>
                <p className={styles.unboxingDesc}>{item.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Subscription FAQ Accordion */}
      <section className={styles.sectionWrapper} aria-labelledby="faq-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Clear &amp; Transparent</span>
          <h2 id="faq-heading" className={styles.sectionTitle}>
            Frequently Asked Questions
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to know about our recurring botanical memberships, deliveries, and care policies.
          </p>
        </div>

        <div className={styles.faqGrid}>
          {SUBSCRIPTION_FAQS.map((faq, index) => (
            <div key={index} className={styles.faqCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={18} color="var(--ugaoo-green)" />
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
              </div>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Reassurance CTA Banner */}
      <section className={styles.sectionWrapper}>
        <div className={styles.guaranteeBanner}>
          <div className={styles.guaranteeText}>
            <h3 className={styles.guaranteeTitle}>48-Hour Live Plant Transit Guarantee</h3>
            <p className={styles.guaranteeSubtitle}>
              Every live plant dispatched in our Green Routine subscription box is conditioned for transit. If your plant arrives stressed or damaged, our Pune nursery sends an immediate replacement at zero cost.
            </p>
          </div>

          <Link
            href="#plan-selection"
            className={styles.subscribeNowBtn}
            style={{ backgroundColor: 'var(--ugaoo-yellow-badge)', color: 'var(--ugaoo-green-dark)' }}
          >
            Start Your Botanical Routine →
          </Link>
        </div>
      </section>
    </main>
  )
}
