'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import styles from './Hero.module.css'

interface HeroProps {
  backendOnline?: boolean
}

export function Hero({ backendOnline }: HeroProps = {}) {
  return (
    <section className={styles.heroSection}>
      {backendOnline === false && <span className={styles.srOnly}>Nursery offline</span>}
      <div className={styles.heroContainer}>
        {/* 1. Top Head with Green Rating Bar & Authentic Headline */}
        <div className={styles.topHead}>
          <div className={styles.heroRatingBar}>
            <div className={styles.heroRatingStars}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
            </div>
            <span className={styles.heroRatingText}>
              Rated 4.9 by 1,00,000+ Plant Parents Across India
            </span>
          </div>

          <h1 className={styles.heroHeading}>
            India&apos;s One-Stop Gardening <em>Shop.</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ugaoo-text-muted)', margin: '0.35rem 0 0 0', fontWeight: 500 }}>
            Living Botanicals &amp; Pure Seeds • Nursery Direct
          </p>
        </div>

        {/* 2. Asymmetric Content Row (0.91fr 0.3fr Split) */}
        <div className={styles.heroContentRow}>
          {/* Left Main Visual Hero Banner */}
          <div className={styles.heroVisualBanner}>
            <picture className={styles.picture}>
              <source
                media="(max-width: 768px)"
                srcSet="/ugaoo-assets/hero-mobile.jpg"
              />
              <img
                src="/ugaoo-assets/hero-desktop.jpg"
                alt="GLOROV Indian Botanical Living Plants & Seeds"
                className={styles.heroImage}
              />
            </picture>

            <div className={styles.gradientOverlay} />

            <div className={styles.bannerOverlayContent}>
              <span className={styles.bannerTag}>
                <Sparkles size={13} />
                Monsoon &amp; Winter Sowing Season Open
              </span>
              <h2 className={styles.bannerTitle}>
                Living Greenery Delivered To Your Doorstep
              </h2>
              <p className={styles.bannerDesc}>
                Heirloom Varieties cultivated at Pune Hub with climate-proof packaging and Pan-India Dispatch to 19,000+ PIN codes.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/categories/seeds" className={styles.bannerCta}>
                  <span>Explore Seeds Collection</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/store"
                  className={styles.bannerCta}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: 'none' }}
                >
                  <span>All Botanicals</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Stacked Editorial Promo Cards */}
          <div className={styles.heroCardsCol}>
            {/* Card 1: Green Card (Beginner Friendly / Indoor Plants) */}
            <Link
              href="/categories/live-plants"
              className={`${styles.heroCard} ${styles.heroCardGreen}`}
            >
              <div>
                <div className={styles.heroCardBadge}>
                  <span className={styles.badgeDot} />
                  <span>New To Plants?</span>
                </div>
                <h3 className={styles.heroCardTitle}>
                  Shop Beginner Friendly Plants
                </h3>
              </div>
              <div className={styles.heroCardFooter}>
                <span>Shop Indoor Plants • Under ₹549</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* Card 2: Butter Yellow Card (New Arrivals / Seeds) */}
            <Link
              href="/categories/seeds"
              className={`${styles.heroCard} ${styles.heroCardButter}`}
            >
              <div>
                <div className={styles.heroCardBadge} style={{ color: '#8c4b18' }}>
                  <span className={styles.badgeDot} />
                  <span>Already A Plant Parent?</span>
                </div>
                <h3 className={styles.heroCardTitle}>
                  Explore Desi Seeds &amp; New Arrivals
                </h3>
              </div>
              <div className={styles.heroCardFooter}>
                <span>Shop Seeds Now</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>

        {/* 3. Bottom Reassurance Trust Bar */}
        <div className={styles.trustBar}>
          <div className={styles.trustBarItem}>
            <div className={styles.trustIconBox}>
              <Image
                src="/ugaoo-assets/trust-soil.png"
                alt=""
                width={20}
                height={20}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span>90-Day Pre Fertilised Soil</span>
          </div>

          <div className={styles.trustBarItem}>
            <div className={styles.trustIconBox}>
              <Image
                src="/ugaoo-assets/trust-healthy.png"
                alt=""
                width={20}
                height={20}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span>Arrives Healthy &amp; Bushy</span>
          </div>

          <div className={styles.trustBarItem}>
            <div className={styles.trustIconBox}>
              <RotateCcw size={18} />
            </div>
            <span>48-Hour Free Replacement</span>
          </div>

          <div className={styles.trustBarItem}>
            <div className={styles.trustIconBox}>
              <ShieldCheck size={18} />
            </div>
            <span>Expert Plant Care Support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
