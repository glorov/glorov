'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Sprout,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  ShoppingBag,
  Sparkle,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './CategoriesPage.module.css'

export interface CuratedCategoryVisual {
  handle: string
  title: string
  group: string
  badge: string
  image: string
  description: string
  subcategories: { name: string; handle: string; image?: string }[]
  launches?: { name: string; handle: string; image: string; tag: string }[]
}

interface CategoriesClientProps {
  categories: CuratedCategoryVisual[]
}

interface MobileRailCategory {
  id: string
  title: string
  handle: string
  image: string
  isSpecial?: boolean
  subcategories: { name: string; handle: string; image: string }[]
  launches: { name: string; handle: string; image: string; tag: string }[]
}

// STRICTLY Seeded Botanical Categories + "For You" Overview (Zero unseeded items)
const MOBILE_CATEGORIES: MobileRailCategory[] = [
  {
    id: 'for-you',
    title: 'For You',
    handle: 'for-you',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80',
    isSpecial: true,
    subcategories: [
      {
        name: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Flower Seeds',
        handle: 'flower-seeds',
        image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Indoor Plants',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Air-Purifying',
        handle: 'air-purifying-plants',
        image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Ceramic Pots',
        handle: 'ceramic-planters',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Potting Mix',
        handle: 'potting-mix-fertilizers',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
      },
    ],
    launches: [
      {
        name: 'Desi Heirloom Tomato',
        handle: 'vegetable-seeds',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Pusa Narangi Marigold',
        handle: 'flower-seeds',
        image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'NASA Peace Lily',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1593482874117-89e9f15577ac?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Snake Plant Zeylanica',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Artisan Ceramic Pot',
        handle: 'planters-pots',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Organic Potting Mix 5kg',
        handle: 'plant-care-soil',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
        tag: 'SALE IS LIVE',
      },
    ],
  },
  {
    id: 'seeds',
    title: 'Seeds',
    handle: 'seeds',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
    subcategories: [
      {
        name: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Flower Seeds',
        handle: 'flower-seeds',
        image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Herb Seeds',
        handle: 'herb-seeds',
        image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=80',
      },
    ],
    launches: [
      {
        name: 'Kashi Amrit Desi Tomato',
        handle: 'vegetable-seeds',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Pusa Narangi Marigold',
        handle: 'flower-seeds',
        image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Krishna Tulsi Seeds',
        handle: 'herb-seeds',
        image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Guntur Green Chilli',
        handle: 'vegetable-seeds',
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Desi Bhindi / Okra',
        handle: 'vegetable-seeds',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Sweet Italian Basil',
        handle: 'herb-seeds',
        image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=80',
        tag: 'SALE IS LIVE',
      },
    ],
  },
  {
    id: 'live-plants',
    title: 'Live Plants',
    handle: 'live-plants',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80',
    subcategories: [
      {
        name: 'Indoor Plants',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Air-Purifying',
        handle: 'air-purifying-plants',
        image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Flowering Plants',
        handle: 'flowering-plants',
        image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Succulents & Bonsai',
        handle: 'succulents-bonsai',
        image: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=80',
      },
    ],
    launches: [
      {
        name: 'Golden Pothos in Pot',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Sansevieria Snake Plant',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'NASA Peace Lily',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1593482874117-89e9f15577ac?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Red Anthurium Bloom',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Mini Jade Crassula',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'ZZ Zanzibar Gem',
        handle: 'indoor-plants',
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
        tag: 'SALE IS LIVE',
      },
    ],
  },
  {
    id: 'planters-pots',
    title: 'Planters & Pots',
    handle: 'planters-pots',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
    subcategories: [
      {
        name: 'Ceramic Pots',
        handle: 'ceramic-planters',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Terracotta Pots',
        handle: 'terracotta-pots',
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80',
      },
    ],
    launches: [
      {
        name: 'Glazed Ceramic Pot 6"',
        handle: 'planters-pots',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Raw Terracotta Planter',
        handle: 'planters-pots',
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Balcony Hanging Pot',
        handle: 'planters-pots',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Artisan Ceramic Vase',
        handle: 'planters-pots',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Drainage Saucer Base',
        handle: 'planters-pots',
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80',
        tag: 'SALE IS LIVE',
      },
    ],
  },
  {
    id: 'plant-care-soil',
    title: 'Plant Care & Soil',
    handle: 'plant-care-soil',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
    subcategories: [
      {
        name: 'Potting Mix & Fertilizers',
        handle: 'potting-mix-fertilizers',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
      },
      {
        name: 'Gardening Tools & Kits',
        handle: 'gardening-tools',
        image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=400&q=80',
      },
    ],
    launches: [
      {
        name: 'Organic Potting Mix 5kg',
        handle: 'plant-care-soil',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Enriched Vermicompost',
        handle: 'plant-care-soil',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Cold-Pressed Neem Oil',
        handle: 'plant-care-soil',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Brass Garden Trowel',
        handle: 'plant-care-soil',
        image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=400&q=80',
        tag: 'BUY NOW',
      },
      {
        name: 'Bypass Bypass Pruner',
        handle: 'plant-care-soil',
        image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=400&q=80',
        tag: 'SALE IS LIVE',
      },
    ],
  },
]

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter()
  const { totalItems, openDrawer } = useCart()
  const [selectedMobileIndex, setSelectedMobileIndex] = useState(0)

  const activeMobileCat = MOBILE_CATEGORIES[selectedMobileIndex] || MOBILE_CATEGORIES[0]

  return (
    <>
      {/* =========================================================================
          1. MOBILE DUAL-COLUMN VIEW (Matching User Reference Image)
          Visible only on screens < 768px
      ========================================================================= */}
      <div className={styles.mobileLayout}>
        {/* Mobile Clean Top App Bar */}
        <header className={styles.mobileHeader}>
          <div className={styles.mobileHeaderLeft}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.mobileHeaderButton}
              aria-label="Go Back"
            >
              <ArrowLeft size={20} color="#111827" />
            </button>
            <h1 className={styles.mobileHeaderTitle}>All Categories</h1>
          </div>

          <div className={styles.mobileHeaderRight}>
            <Link
              href="/store?q="
              className={styles.mobileHeaderButton}
              aria-label="Search Catalog"
            >
              <Search size={20} color="#111827" />
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              className={styles.mobileHeaderButton}
              aria-label={`Shopping Cart (${totalItems} items)`}
            >
              <div className={styles.cartIconWrapper}>
                <ShoppingBag size={20} color="#111827" />
                {totalItems > 0 && (
                  <span className={styles.mobileCartBadge}>{totalItems}</span>
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Split Two-Column Body */}
        <div className={styles.mobileBody}>
          {/* Left Category Rail */}
          <nav aria-label="Category Selector Rail" className={styles.mobileLeftRail}>
            {MOBILE_CATEGORIES.map((cat, idx) => {
              const isSelected = idx === selectedMobileIndex
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedMobileIndex(idx)}
                  className={`${styles.mobileRailItem} ${
                    isSelected ? styles.mobileRailItemActive : ''
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && <div className={styles.mobileRailIndicator} />}

                  {/* Thumbnail Avatar */}
                  <div
                    className={`${styles.mobileRailAvatar} ${
                      cat.isSpecial ? styles.mobileRailSpecialAvatar : ''
                    }`}
                  >
                    {cat.isSpecial ? (
                      <div className={styles.forYouIconBadge}>
                        <Sparkle size={20} color="#2563eb" fill="#dbeafe" />
                      </div>
                    ) : (
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        sizes="48px"
                        className={styles.mobileRailImg}
                      />
                    )}
                  </div>

                  <span
                    className={`${styles.mobileRailLabel} ${
                      isSelected ? styles.mobileRailLabelActive : ''
                    }`}
                  >
                    {cat.title}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Right Scrollable Subcategory & Launches Content */}
          <main className={styles.mobileRightContent}>
            {/* Section 1: Subcategories Grid */}
            <div className={styles.mobileSection}>
              <h2 className={styles.mobileSectionTitle}>
                {activeMobileCat.isSpecial
                  ? 'Popular Categories'
                  : `${activeMobileCat.title} Subcategories`}
              </h2>

              <div className={styles.mobileSubgrid}>
                {activeMobileCat.subcategories.map((sub, sIdx) => (
                  <Link
                    key={sIdx}
                    href={`/categories/${sub.handle}`}
                    className={styles.mobileSubCard}
                  >
                    <div className={styles.mobileSubCardImageWrap}>
                      <Image
                        src={sub.image}
                        alt={sub.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 120px"
                        className={styles.mobileCardImg}
                      />
                    </div>
                    <span className={styles.mobileSubCardTitle}>{sub.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section 2: New & Upcoming Launches */}
            <div className={styles.mobileSection}>
              <h2 className={styles.mobileSectionTitle}>New &amp; Upcoming Launches</h2>

              <div className={styles.mobileLaunchGrid}>
                {activeMobileCat.launches.map((launch, lIdx) => (
                  <Link
                    key={lIdx}
                    href={`/store?q=${encodeURIComponent(launch.name)}`}
                    className={styles.mobileLaunchCard}
                  >
                    <div className={styles.mobileLaunchImageWrap}>
                      <Image
                        src={launch.image}
                        alt={launch.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 120px"
                        className={styles.mobileCardImg}
                      />
                      <span className={styles.mobileLaunchBadge}>{launch.tag}</span>
                    </div>
                    <span className={styles.mobileLaunchTitle}>{launch.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP EXPANSIVE VIEW
          Visible only on screens >= 768px
      ========================================================================= */}
      <div className={styles.desktopLayout}>
        <div className={styles.container}>
          {/* 1. Breadcrumbs */}
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className={styles.breadcrumbCurrent}>Categories</span>
          </nav>

          {/* 2. Hero Banner */}
          <div className={styles.heroBanner}>
            <div className={styles.heroBadgeRow}>
              <span className={styles.nurseryBadge}>
                <Sprout size={13} aria-hidden="true" />
                Pune Central Nursery Dispatch
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)' }}>
                • Botanical Category Directory
              </span>
            </div>

            <div>
              <h1 className={styles.heroTitle}>Explore Botanical Categories</h1>
              <p className={styles.heroSubtitle}>
                From indigenous Desi heirloom seeds to climate-hardened live houseplants, discover our specialized collections curated for Indian homes and gardens.
              </p>
            </div>

            <div className={styles.statChipsRow}>
              <div className={styles.statChip}>
                <ShieldCheck size={14} color="#d4e79e" />
                <span>100+ Verified Varieties</span>
              </div>
              <div className={styles.statChip}>
                <Truck size={14} color="#d4e79e" />
                <span>Safe Transit Delivery</span>
              </div>
              <div className={styles.statChip}>
                <Sparkles size={14} color="#d4e79e" />
                <span>7-Day Botanical Replacement</span>
              </div>
            </div>
          </div>

          {/* 3. Filter Pills Navigation Bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterPills}>
              <Link href="/categories" className={`${styles.filterPill} ${styles.filterPillActive}`}>
                All Collections ({categories.length})
              </Link>
              <Link href="/categories/seeds" className={styles.filterPill}>
                Seeds Bank
              </Link>
              <Link href="/categories/live-plants" className={styles.filterPill}>
                Live Houseplants
              </Link>
              <Link href="/categories/planters-pots" className={styles.filterPill}>
                Pots &amp; Planters
              </Link>
              <Link href="/categories/plant-care-soil" className={styles.filterPill}>
                Plant Care &amp; Soil
              </Link>
              <Link href="/store" className={styles.filterPill}>
                All Products Store
              </Link>
            </div>

            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              Showing <strong>{categories.length}</strong> botanical categories
            </div>
          </div>

          {/* 4. Category Cards Grid */}
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.handle}
                href={`/categories/${cat.handle}`}
                className={styles.categoryCard}
              >
                <div className={styles.imageWrap}>
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.cardImage}
                  />
                  <div className={styles.scrimOverlay} />
                  <div className={styles.badgeTopLeft}>{cat.badge}</div>
                  <div className={styles.countTopRight}>{cat.group}</div>
                </div>

                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{cat.title}</h2>
                  <p className={styles.cardDescription}>{cat.description}</p>

                  {cat.subcategories.length > 0 && (
                    <div className={styles.subcategoriesRow}>
                      {cat.subcategories.slice(0, 4).map((sub, idx) => (
                        <span key={idx} className={styles.subChip}>
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <span>Explore Collection</span>
                    <div className={styles.arrowCircle}>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 5. Seasonal Sowing Spotlight Callout */}
          <div className={styles.seasonalBanner}>
            <div>
              <span className={styles.seasonalTag}>Seasonal Sowing Calendar</span>
              <h2 className={styles.seasonalTitle}>Need Help Choosing What to Sow This Season?</h2>
              <p className={styles.seasonalDesc}>
                Access our month-by-month Indian sowing calendar covering Kharif, Rabi, and Zaid crops across tropical and sub-tropical agro-climatic zones.
              </p>
            </div>

            <Link href="/sowing-calendar" className={styles.seasonalCta}>
              <span>View Sowing Calendar</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
