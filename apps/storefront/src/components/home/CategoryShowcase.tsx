'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sprout,
  Flower2,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import styles from './CategoryShowcase.module.css'

const STORY_CIRCLES = [
  {
    name: 'Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/cat-plants.webp',
  },
  {
    name: 'Seeds',
    href: '/categories/seeds',
    image: '/ugaoo-assets/cat-seeds.webp',
  },
  {
    name: 'Indoor Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/cat-plants.webp',
  },
  {
    name: 'Flower Seeds',
    href: '/categories/seeds',
    image: '/ugaoo-assets/cat-seeds.webp',
  },
  {
    name: 'Aromatic Herbs',
    href: '/categories/seeds',
    image: '/ugaoo-assets/cat-seeds.webp',
  },
  {
    name: 'Air Purifiers',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/cat-plants.webp',
  },
  {
    name: 'Vegetable Seeds',
    href: '/categories/seeds',
    image: '/ugaoo-assets/cat-seeds.webp',
  },
  {
    name: 'Flowering Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/cat-plants.webp',
  },
]

const CATEGORIES = [
  {
    title: 'Desi Vegetable Seeds',
    handle: 'vegetable-seeds',
    fallbackHref: '/categories/seeds',
    description: 'Indigenous high-yield heirloom tomato, chilli, and seasonal vegetable varieties.',
    icon: Sprout,
    badge: 'Seasonal Sowing',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Festive Flower Seeds',
    handle: 'flower-seeds',
    fallbackHref: '/categories/seeds',
    description: 'Vibrant marigold and pollinator-friendly garden blooms.',
    icon: Flower2,
    badge: 'Companion Flora',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Medicinal & Herb Seeds',
    handle: 'herb-seeds',
    fallbackHref: '/categories/seeds',
    description: 'Krishna Tulsi, aromatic coriander, and culinary herb seeds.',
    icon: Sparkles,
    badge: 'Herb Garden',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Live Indoor Plants',
    handle: 'indoor-plants',
    fallbackHref: '/categories/live-plants',
    description: 'Sansevieria and resilient potted foliage plants adapted for domestic spaces.',
    icon: Leaf,
    badge: 'Indoor Foliage',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Air-Purifying Botanicals',
    handle: 'air-purifying',
    fallbackHref: '/categories/live-plants',
    description: 'NASA-evaluated air-purifying foliage including Peace Lily, Snake Plant, and ZZ.',
    icon: Leaf,
    badge: 'Clean Air Specimen',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'All Garden Seeds',
    handle: 'seeds',
    fallbackHref: '/categories/seeds',
    description: 'Explore the complete seed bank of vegetable, flower, and medicinal varieties.',
    icon: ShieldCheck,
    badge: 'Complete Seed Bank',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  },
]

export function CategoryShowcase() {
  return (
    <>
      {/* 1. Ugaoo-Style Circular Category Stories Rail */}
      <section className={styles.storyRailSection}>
        <div className={styles.storyRailContainer}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#1a1a1a', margin: 0 }}>
              Our Categories
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--ugaoo-text-muted)', fontWeight: 500 }}>
              Scroll to explore
            </span>
          </div>

          <div className={styles.storyTrack}>
            {STORY_CIRCLES.map((story) => (
              <Link key={story.name} href={story.href} className={styles.storyItem}>
                <div className={styles.circleAvatar}>
                  <div className={styles.circleAvatarInner}>
                    <Image
                      src={story.image}
                      alt={story.name}
                      width={80}
                      height={80}
                      unoptimized
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                    />
                  </div>
                </div>
                <span className={styles.storyLabel}>{story.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Detailed Taxonomy Showcase Cards Grid */}
      <section className={styles.taxonomySection}>
        <div className={styles.taxonomyContainer}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ backgroundColor: 'var(--top-tag-dark-blue, #0c2340)', color: 'var(--top-tag-text-white, #ffffff)', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}>
                Botanical Taxonomy
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ugaoo-text-muted)', fontWeight: 500 }}>
                Pan-India Dispatch
              </span>
            </div>
            <h2 className={styles.sectionHeading}>
              Browse by Botanical Category
            </h2>
            <p className={styles.sectionSubtitle}>
              From indigenous Desi seeds to climate-hardened live houseplants, explore our specialized nursery collections.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className={styles.cardsGrid}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.handle}
                  href={`/categories/${cat.handle}`}
                  className={`${styles.categoryCard} min-h-[44px]`}
                >
                  <div className={styles.cardImageWrap}>
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.cardImage}
                    />
                  </div>

                  <div className={styles.cardContent}>
                    <div>
                      <div className={styles.cardTitleRow}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--ugaoo-butter)', color: 'var(--ugaoo-maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={20} aria-hidden="true" />
                        </div>
                        <span style={{ backgroundColor: '#ffd51f', color: '#042018', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
                          {cat.badge}
                        </span>
                      </div>

                      <h3 className={styles.cardTitle} style={{ marginTop: '0.65rem' }}>
                        {cat.title}
                      </h3>
                      <p className={styles.cardDesc} style={{ marginTop: '0.35rem' }}>
                        {cat.description}
                      </p>
                    </div>

                    <div className={styles.exploreLink}>
                      <span>Shop Varieties</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
