import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  MapPin,
  Clock,
  Phone,
  Sparkles,
  Sprout,
  Leaf,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import styles from './NurseryPage.module.css'

export const metadata: Metadata = {
  title: 'Pune Propagation Nursery & Botanical Studios | GLOROV Botanicals',
  description:
    'Visit our 25-acre mother propagation nursery in Pune, Maharashtra. Experience climate-controlled polyhouses, free organic repotting, horticultural workshops, and Plant Doctor consultations.',
  keywords: [
    'Pune plant nursery',
    'visit plant nursery Pune Hadapsar',
    'botanical experiential garden',
    'free plant repotting station',
    'indoor plants Mumbai studio',
    'GLOROV botanical hub',
  ],
}

interface StudioLocation {
  id: string
  name: string
  tag: string
  address: string
  hours: string
  phone: string
  image: string
  mapsUrl: string
}

const STUDIOS: StudioLocation[] = [
  {
    id: 'pune-mother-hub',
    name: 'Pune Mother Propagation Hub',
    tag: 'Flagship 25-Acre Nursery',
    address: 'Survey No. 42, Hadapsar-Manjri Green Belt, Pune, Maharashtra — 411001',
    hours: 'Mon – Sun: 8:00 AM – 6:30 PM IST',
    phone: '+91 80870 87224',
    image: '/ugaoo-assets/farm-1.webp',
    mapsUrl: 'https://maps.google.com/?q=Hadapsar+Pune',
  },
  {
    id: 'mumbai-studio',
    name: 'Mumbai Botanical Studio',
    tag: 'Urban Experiential Center',
    address: 'Hill Road, Near Bandra Station West, Mumbai, Maharashtra — 400050',
    hours: 'Tue – Sun: 10:00 AM – 8:30 PM IST (Mon Closed)',
    phone: '+91 80870 87224',
    image: '/ugaoo-assets/farm-2.webp',
    mapsUrl: 'https://maps.google.com/?q=Bandra+West+Mumbai',
  },
  {
    id: 'bengaluru-studio',
    name: 'Bengaluru Garden Loft',
    tag: 'Botanical Concept Studio',
    address: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka — 560038',
    hours: 'Tue – Sun: 10:30 AM – 8:30 PM IST (Mon Closed)',
    phone: '+91 80870 87224',
    image: '/ugaoo-assets/farm-3.webp',
    mapsUrl: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
  },
]

export default function NurseryPage() {
  return (
    <div className={styles.container}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Pune Nursery &amp; Studios</span>
      </nav>

      {/* 2. Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Farm to Home Botanical Origin</span>
          </div>
          <h1 className={styles.heroTitle}>
            Where Green Vitality Begins: Our Pune Mother Nursery
          </h1>
          <p className={styles.heroSubtitle}>
            Step into our 25-acre propagation grounds nestled in the fertile black-cotton soil of Pune,
            Maharashtra. Every living plant and heirloom seed packet is lovingly nurtured, hardened, and
            tested here before embarking on its journey to your home.
          </p>
        </div>

        <div className={styles.heroStatsGrid}>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNum}>25 Acres</span>
            <span className={styles.heroStatLabel}>State-of-the-art Shade &amp; Polyhouses</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNum}>105+</span>
            <span className={styles.heroStatLabel}>Vetted Plant &amp; Heirloom Seed Varieties</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNum}>50k+</span>
            <span className={styles.heroStatLabel}>Healthy Direct-Nursery Dispatches</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNum}>100%</span>
            <span className={styles.heroStatLabel}>Chemical-Free Organic Soil Mixes</span>
          </div>
        </div>
      </header>

      {/* 3. In-Person Nursery Experiences */}
      <section aria-labelledby="experiences-title" style={{ marginBottom: '3.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSupertitle}>Experiential Greenery</span>
          <h2 id="experiences-title" className={styles.sectionTitle}>
            Experiences at Our Pune Nursery
          </h2>
          <p className={styles.sectionDesc}>
            More than just a nursery, our Pune facility is an interactive learning haven for plant lovers of all ages.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <div className={styles.serviceIconWrap}>
              <Sprout size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.serviceTitle}>Polyhouse Selection Walk</h3>
            <p className={styles.serviceText}>
              Stroll through thousands of lush indoor botanicals, rare variegated specimens, and bonsai mother trees with guidance from our botanists.
            </p>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceIconWrap}>
              <Leaf size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.serviceTitle}>Free Organic Repotting</h3>
            <p className={styles.serviceText}>
              Bring in any plant bought from us for complimentary root aeration, pruning, and top-dressing with our 40-30-20-10 organic vermicompost potting mix.
            </p>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceIconWrap}>
              <Calendar size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.serviceTitle}>Weekend Gardening Workshops</h3>
            <p className={styles.serviceText}>
              Join hands-on Saturday workshops covering desi seed germination, monsoon propagation techniques, and natural pest remedies.
            </p>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceIconWrap}>
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.serviceTitle}>Drop-In Plant Doctor</h3>
            <p className={styles.serviceText}>
              Facing stubborn leaf yellowing or root shock? Bring photos or samples for a free personalized prescription from our chief agronomist.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Nursery & Studio Locations Grid */}
      <section aria-labelledby="studios-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSupertitle}>Visit Our Locations</span>
          <h2 id="studios-title" className={styles.sectionTitle}>
            Flagship Nursery &amp; Concept Studios
          </h2>
          <p className={styles.sectionDesc}>
            Experience GLOROV in person. Discover curated indoor greenery, speak with plant parents, and bring nature into your home.
          </p>
        </div>

        <div className={styles.studiosGrid}>
          {STUDIOS.map((studio) => (
            <div key={studio.id} className={styles.studioCard}>
              <div className={styles.studioImageWrap}>
                <span className={styles.studioBadge}>{studio.tag}</span>
                <Image
                  src={studio.image}
                  alt={studio.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div className={styles.studioBody}>
                <h3 className={styles.studioName}>{studio.name}</h3>

                <div className={styles.studioDetailRow}>
                  <MapPin size={16} className={styles.studioDetailIcon} aria-hidden="true" />
                  <span>{studio.address}</span>
                </div>

                <div className={styles.studioDetailRow}>
                  <Clock size={16} className={styles.studioDetailIcon} aria-hidden="true" />
                  <span>{studio.hours}</span>
                </div>

                <div className={styles.studioDetailRow}>
                  <Phone size={16} className={styles.studioDetailIcon} aria-hidden="true" />
                  <span>{studio.phone}</span>
                </div>

                <a
                  href={studio.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsBtn}
                  aria-label={`Get directions to ${studio.name}`}
                >
                  <span>Get Google Maps Directions</span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
