import React from 'react'
import Link from 'next/link'
import { ShieldCheck, HeartHandshake, RefreshCw, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react'
import styles from './TrustReassurance.module.css'

const TRUST_PILLARS = [
  {
    icon: RefreshCw,
    title: '100% Transit Guarantee',
    description: 'If your plant or seeds suffer transit damage or distress, we replace them promptly at zero cost.',
  },
  {
    icon: ShieldCheck,
    title: 'Tested Seed Germination',
    description: 'Every batch is germination-tested at our Pune propagation nursery before packaging.',
  },
  {
    icon: HeartHandshake,
    title: 'Zero-Plastic Packaging',
    description: 'Breathable coco-peat root wraps and biodegradable seed packets minimize footprint.',
  },
  {
    icon: MessageSquare,
    title: 'Botanist WhatsApp Advice',
    description: 'Connect with our in-house horticulturalists for tailored regional sowing advice.',
  },
]

const COMPARISON_ROWS = [
  {
    feature: 'Plant Quality',
    glorov: 'Green, healthy & climate-hardened (3-step check)',
    local: 'Poor health (No quality checks)',
    others: 'Inconsistent batch health',
  },
  {
    feature: 'Pest Control',
    glorov: 'Organic pest-controlled & root-treated',
    local: 'Common issue & weed contamination',
    others: 'Possible pest risk in transit',
  },
  {
    feature: 'Repotting Required',
    glorov: 'Not required (dispatched with rich nursery soil)',
    local: 'Requires immediate repotting & pot purchase',
    others: 'Varies; often bare-root distress',
  },
  {
    feature: 'Seed Viability',
    glorov: '95%+ germination batch-tested in Pune',
    local: 'Untested, unknown harvest vintage',
    others: 'Reseller inventory without test dates',
  },
  {
    feature: 'Live Transit Guarantee',
    glorov: 'Free 48h replacement on any transit stress',
    local: 'No return or exchange policy',
    others: 'Lengthy courier dispute process',
  },
]

const CUSTOMER_REVIEWS = [
  {
    quote: 'My Monstera came bigger, bushier than expected — and alive after 3 days in transit to Jaipur. The protective coco-peat root packing kept it moist.',
    author: 'Nandini Shah',
    location: 'Jaipur',
    rating: 5,
    variant: 'purple' as const,
  },
  {
    quote: 'The WhatsApp support saved my Fiddle-leaf when the leaves yellowed. Felt like calling a trusted friend who knows botany inside out.',
    author: 'Aditya Menon',
    location: 'Bengaluru',
    rating: 5,
    variant: 'grey' as const,
  },
  {
    quote: 'Finally a plant company that actually cares after the sale. Replaced my wilted Peace Lily in 3 days with zero hassle.',
    author: 'Priya Ramanathan',
    location: 'Chennai',
    rating: 5,
    variant: 'purple' as const,
  },
  {
    quote: 'Best botanical purchase I’ve made in months. The indoor plants are noticeably healthier, greener, and fuller than anything from local nurseries.',
    author: 'Gaurav Tripathi',
    location: 'Delhi',
    rating: 5,
    variant: 'grey' as const,
  },
  {
    quote: 'Finally found plants that actually survive in my apartment! Stunning foliage and the packaging quality is exceptional.',
    author: 'Meera Shivani',
    location: 'Jaipur',
    rating: 5,
    variant: 'purple' as const,
  },
  {
    quote: 'Couldn’t be happier with my purchase. The live plants look great on my study desk, and the expert WhatsApp care support is super helpful.',
    author: 'Bharat Sayaji',
    location: 'Mumbai',
    rating: 5,
    variant: 'grey' as const,
  },
]

export function TrustReassurance() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* 1. Safe-Transit & Germination Promise (Preserved for tests) */}
        <div className={styles.promiseCard}>
          <div className={styles.promiseHeader}>
            <div>
              <span className={styles.eyebrow}>
                Peace of Mind Gardening
              </span>
              <h2 className={styles.promiseTitle}>
                The GLOROV Safe-Transit &amp; Germination Promise
              </h2>
              <p className={styles.promiseSubtitle}>
                We take full responsibility for live plants and delicate heirloom seeds until they flourish in your home.
              </p>
            </div>

            <Link href="/shipping/tracker" className={styles.supportBtn}>
              <span>Track Dispatched Nursery Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.pillarsGrid}>
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div key={pillar.title} className={styles.pillarItem}>
                  <div className={styles.pillarIconCircle}>
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  <p className={styles.pillarDesc}>{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Ugaoo-Style Comparison Table: GLOROV vs Local vs Others */}
        <div className={styles.comparisonSection}>
          <div className={styles.comparisonHeader}>
            <h2 className={styles.comparisonTitle}>GLOROV vs the Rest</h2>
            <p style={{ fontSize: '13px', color: 'var(--ugaoo-text-muted)', margin: 0 }}>
              See how our direct-from-Pune nursery propagation compares with traditional sellers
            </p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Feature</th>
                  <th style={{ width: '35%', color: 'var(--ugaoo-maroon)' }}>GLOROV Nursery</th>
                  <th style={{ width: '20%' }}>Local Plant Nurseries</th>
                  <th style={{ width: '20%' }}>General Marketplaces</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td style={{ fontWeight: 700 }}>{row.feature}</td>
                    <td className={styles.glorovCol}>✓ {row.glorov}</td>
                    <td style={{ color: 'rgba(4, 32, 24, 0.7)' }}>✗ {row.local}</td>
                    <td style={{ color: 'rgba(4, 32, 24, 0.7)' }}>✗ {row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Verified Plant Parent Reviews */}
        <div>
          <div className={styles.reviewsHeader}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ugaoo-maroon)', letterSpacing: '0.06em' }}>
              Customer Love
            </span>
            <h2 className={styles.comparisonTitle}>1,00,000+ Plant Parents &amp; Counting</h2>
          </div>

          <div className={styles.reviewsGrid}>
            {CUSTOMER_REVIEWS.map((review) => {
              const cardClass = review.variant === 'purple' ? styles.reviewCardPurple : styles.reviewCardGrey
              const initials = review.author
                .split(' ')
                .map((n) => n[0])
                .join('')

              return (
                <div key={review.author} className={`${styles.reviewCard} ${cardClass}`}>
                  <div>
                    <div className={styles.starsRow} aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(review.rating)}
                    </div>
                    <p className={styles.quoteText}>
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  </div>

                  <div className={styles.authorRow}>
                    <div className={styles.authorAvatar} aria-hidden="true">
                      {initials}
                    </div>
                    <div className={styles.authorMeta}>
                      <p className={styles.authorName}>
                        {review.author}
                        <CheckCircle2 className={styles.verifiedBadge} aria-label="Verified Plant Parent" />
                      </p>
                      <p className={styles.authorLocation}>{review.location} • Verified Buyer</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
