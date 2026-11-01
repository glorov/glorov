import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Store,
  Calendar,
  Sparkles,
  HeartHandshake,
  Sprout,
  Users,
} from 'lucide-react'
import { StoreLocatorList } from './StoreLocatorList'
import styles from './StoresPage.module.css'

export const metadata: Metadata = {
  title: 'GLOROV Botanical Studios | Store Locator & Experiential Green Centers',
  description:
    'Visit GLOROV botanical studios in Pune, Mumbai, Bengaluru, and New Delhi. Complimentary organic repotting bar, resident plant doctor, and exotic heirloom seed bank.',
  openGraph: {
    title: 'GLOROV Botanical Studios | Find Your Nearest Green Sanctuary',
    description:
      'Experience living plants in person. Free organic repotting, plant doctor consultations, and gardening workshops.',
  },
}

interface WorkshopEvent {
  id: string
  title: string
  city: string
  date: string
  time: string
  mentor: string
  description: string
}

const UPCOMING_WORKSHOPS: WorkshopEvent[] = [
  {
    id: 'ws_microgreens',
    title: 'Kitchen Microgreens & Seed Starting',
    city: 'Pune & Mumbai Studios',
    date: 'Saturday, Nov 8',
    time: '11:00 AM – 1:00 PM IST',
    mentor: 'Dr. Ramesh Patil (Chief Agronomist)',
    description:
      'Learn how to sow and harvest dense trays of organic radish, mustard, and methi microgreens on your kitchen windowsill using 100% organic cocopeat.',
  },
  {
    id: 'ws_bonsai',
    title: 'Ficus Bonsai Pruning & Root Training',
    city: 'Bengaluru Indiranagar Studio',
    date: 'Sunday, Nov 9',
    time: '3:00 PM – 5:00 PM IST',
    mentor: 'Suresh Hegde (Senior Horticulturist)',
    description:
      'Master the meditative art of structural branch wiring, root pruning, and organic soil balancing for tropical Ficus and Carmona bonsai.',
  },
  {
    id: 'ws_terrarium',
    title: 'Living Moss & Fern Terrarium Biomes',
    city: 'Delhi Saket Studio',
    date: 'Saturday, Nov 15',
    time: '2:00 PM – 4:00 PM IST',
    mentor: 'Kavita Chawla (Botanical Designer)',
    description:
      'Build your own self-sustaining sealed ecosystem using activated charcoal, drainage pebbles, tropical Fittonias, and living sheet moss.',
  },
]

export default function StoresPage() {
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
            Store Locator
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Store size={16} />
          Offline Botanical Experience Centers
        </div>

        <h1 className={styles.heroTitle}>Visit GLOROV Botanical Studios</h1>

        <p className={styles.heroSubtitle}>
          Step inside our experiential plant sanctuaries across Pune, Mumbai, Bengaluru, and New Delhi. Bring your plants for our complimentary repotting bar, consult with resident agronomists, and touch live foliage before bringing it home.
        </p>

        {/* Studio Amenities Reassurance Bar */}
        <div className={styles.amenitiesBar}>
          <div className={styles.amenityCard}>
            <div className={styles.amenityIconWrapper}>
              <Sprout size={22} />
            </div>
            <h3 className={styles.amenityTitle}>Free Organic Repotting</h3>
            <p className={styles.amenityDesc}>
              Bring any urban houseplant for a complimentary organic soil refresh and root aeration check.
            </p>
          </div>

          <div className={styles.amenityCard}>
            <div className={styles.amenityIconWrapper}>
              <HeartHandshake size={22} />
            </div>
            <h3 className={styles.amenityTitle}>Resident Plant Doctor</h3>
            <p className={styles.amenityDesc}>
              Walk in with leaf or soil samples for free diagnostic guidance from certified horticulturists.
            </p>
          </div>

          <div className={styles.amenityCard}>
            <div className={styles.amenityIconWrapper}>
              <Sparkles size={22} />
            </div>
            <h3 className={styles.amenityTitle}>Heirloom Seed Vault</h3>
            <p className={styles.amenityDesc}>
              Browse over 150+ varieties of 0% GST non-GMO desi vegetable, flower, and herb seeds.
            </p>
          </div>

          <div className={styles.amenityCard}>
            <div className={styles.amenityIconWrapper}>
              <Users size={22} />
            </div>
            <h3 className={styles.amenityTitle}>Hands-On Workshops</h3>
            <p className={styles.amenityDesc}>
              Weekend masterclasses in microgreens, terrarium crafting, and bonsai styling.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Store Locator & Filter */}
      <section className={styles.sectionWrapper} aria-labelledby="store-list-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Pan-India Studios</span>
          <h2 id="store-list-heading" className={styles.sectionTitle}>
            Find Your Nearest Botanical Studio
          </h2>
          <p className={styles.sectionSubtitle}>
            Filter by metropolitan city to view studio addresses, open hours, in-store services, and direct Google Maps navigation.
          </p>
        </div>

        <StoreLocatorList />
      </section>

      {/* 4. Upcoming In-Studio Gardening Workshops */}
      <section className={styles.sectionWrapper} aria-labelledby="workshops-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Community &amp; Learning</span>
          <h2 id="workshops-heading" className={styles.sectionTitle}>
            Upcoming Botanical Masterclasses
          </h2>
          <p className={styles.sectionSubtitle}>
            Join fellow urban plant parents for weekend interactive sessions guided by our nursery agronomists.
          </p>
        </div>

        <div className={styles.workshopsGrid}>
          {UPCOMING_WORKSHOPS.map((ws) => (
            <article key={ws.id} className={styles.workshopCard}>
              <span className={styles.workshopDateBadge}>
                <Calendar size={14} />
                {ws.date}
              </span>

              <h3 className={styles.workshopTitle}>{ws.title}</h3>
              <p className={styles.workshopDesc}>{ws.description}</p>

              <div className={styles.workshopMeta}>
                <div>
                  <div style={{ color: 'var(--ugaoo-maroon)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {ws.city}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ugaoo-text-muted)' }}>{ws.time}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ugaoo-green)', fontWeight: 700 }}>
                  Free Registration
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Visit Reassurance Banner */}
      <section className={styles.sectionWrapper}>
        <div className={styles.visitBanner}>
          <div className={styles.visitText}>
            <h3 className={styles.visitTitle}>Want to Visit Our 25-Acre Mother Nursery?</h3>
            <p className={styles.visitSubtitle}>
              Experience where all GLOROV botanicals originate. Tour our high-tech climate polyhouses, organic vermicompost beds, and tissue culture propagation labs in Hadapsar, Pune.
            </p>
          </div>

          <Link href="/nursery" className={styles.visitActionBtn}>
            Explore Pune Mother Nursery Tour →
          </Link>
        </div>
      </section>
    </main>
  )
}
