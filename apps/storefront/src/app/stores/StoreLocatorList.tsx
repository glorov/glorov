'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
} from 'lucide-react'
import styles from './StoresPage.module.css'

export interface BotanicalStudio {
  id: string
  city: 'pune' | 'mumbai' | 'bengaluru' | 'delhi'
  cityName: string
  name: string
  address: string
  landmark: string
  timings: string
  phone: string
  flagship: boolean
  mapsUrl: string
  amenities: string[]
}

const STUDIOS_DATA: BotanicalStudio[] = [
  {
    id: 'pune_kp',
    city: 'pune',
    cityName: 'Pune',
    name: 'Pune Koregaon Park Botanical Studio',
    address: 'Plot 14, Lane 7, Koregaon Park, Pune, Maharashtra 411001',
    landmark: 'Near North Main Road Junction',
    timings: '10:00 AM – 9:00 PM IST (Open All 7 Days)',
    phone: '+91 20 2615 4800',
    flagship: true,
    mapsUrl: 'https://maps.google.com/?q=Koregaon+Park+Pune',
    amenities: [
      'Free Organic Repotting Bar',
      'In-Store Plant Doctor',
      'Exotic Seed Bank',
      'Mother Nursery Pickup Point',
    ],
  },
  {
    id: 'mumbai_bandra',
    city: 'mumbai',
    cityName: 'Mumbai',
    name: 'Mumbai Bandra Botanical Studio',
    address: '354 Linking Road, Near Khar Telephone Exchange, Bandra West, Mumbai 400052',
    landmark: 'Opposite Marks & Spencer',
    timings: '10:30 AM – 9:30 PM IST (Open All 7 Days)',
    phone: '+91 22 2640 1200',
    flagship: false,
    mapsUrl: 'https://maps.google.com/?q=Linking+Road+Bandra+West+Mumbai',
    amenities: [
      'Free Organic Repotting Bar',
      'Plant Doctor Desk',
      'Balcony Garden Styling',
      'Coastal Foliage Collection',
    ],
  },
  {
    id: 'blr_indiranagar',
    city: 'bengaluru',
    cityName: 'Bengaluru',
    name: 'Bengaluru Indiranagar Botanical Studio',
    address: '742, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    landmark: 'Near 12th Main Junction',
    timings: '10:00 AM – 9:00 PM IST (Open All 7 Days)',
    phone: '+91 80 4120 7800',
    flagship: false,
    mapsUrl: 'https://maps.google.com/?q=100+Feet+Road+Indiranagar+Bengaluru',
    amenities: [
      'Free Organic Repotting Bar',
      'Terrarium Crafting Station',
      'Desi Vegetable Seed Vault',
      'Indoor Air-Purifying Display',
    ],
  },
  {
    id: 'delhi_saket',
    city: 'delhi',
    cityName: 'Delhi NCR',
    name: 'Delhi Saket Botanical Studio',
    address: 'Ground Floor, South Court Mall, District Centre, Saket, New Delhi 110017',
    landmark: 'Adjacent to Select CITYWALK',
    timings: '11:00 AM – 9:30 PM IST (Open All 7 Days)',
    phone: '+91 11 4050 3300',
    flagship: false,
    mapsUrl: 'https://maps.google.com/?q=District+Centre+Saket+New+Delhi',
    amenities: [
      'Free Organic Repotting Bar',
      'Anti-Pollution NASA Display',
      'Plant Doctor Desk',
      'Organic Seed Germination Kits',
    ],
  },
]

export function StoreLocatorList() {
  const [selectedCity, setSelectedCity] = useState<string>('all')

  const filteredStudios =
    selectedCity === 'all'
      ? STUDIOS_DATA
      : STUDIOS_DATA.filter((s) => s.city === selectedCity)

  return (
    <div>
      {/* City Filter Tabs */}
      <div className={styles.filterTabs} role="tablist" aria-label="Filter Studios by City">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCity === 'all'}
          className={`${styles.filterBtn} ${selectedCity === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCity('all')}
        >
          <span>All Studios (4)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCity === 'pune'}
          className={`${styles.filterBtn} ${selectedCity === 'pune' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCity('pune')}
        >
          <span>Pune Flagship</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCity === 'mumbai'}
          className={`${styles.filterBtn} ${selectedCity === 'mumbai' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCity('mumbai')}
        >
          <span>Mumbai</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCity === 'bengaluru'}
          className={`${styles.filterBtn} ${selectedCity === 'bengaluru' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCity('bengaluru')}
        >
          <span>Bengaluru</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedCity === 'delhi'}
          className={`${styles.filterBtn} ${selectedCity === 'delhi' ? styles.filterBtnActive : ''}`}
          onClick={() => setSelectedCity('delhi')}
        >
          <span>Delhi NCR</span>
        </button>
      </div>

      {/* Studio Cards Grid */}
      <div className={styles.studioGrid} aria-label="Botanical Studios List">
        {filteredStudios.map((studio) => (
          <article key={studio.id} className={styles.studioCard}>
            {studio.flagship && <span className={styles.flagshipBadge}>Mother Nursery Flagship</span>}

            <div className={styles.studioHeader}>
              <span className={styles.studioCity}>{studio.cityName}</span>
              <h3 className={styles.studioName}>{studio.name}</h3>
            </div>

            <div className={styles.studioInfoList}>
              <div className={styles.studioInfoItem}>
                <MapPin size={18} className={styles.infoIcon} />
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{studio.address}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--ugaoo-text-muted)' }}>
                    Landmark: {studio.landmark}
                  </p>
                </div>
              </div>

              <div className={styles.studioInfoItem}>
                <Clock size={18} className={styles.infoIcon} />
                <span>{studio.timings}</span>
              </div>

              <div className={styles.studioInfoItem}>
                <Phone size={18} className={styles.infoIcon} />
                <span>{studio.phone}</span>
              </div>
            </div>

            {/* In-Store Amenities */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ugaoo-green)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                Studio Amenities:
              </div>
              <div className={styles.amenityTags}>
                {studio.amenities.map((am, idx) => (
                  <span key={idx} className={styles.amenityTag}>
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.studioActions}>
              <a
                href={studio.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directionBtn}
                aria-label={`Get directions to ${studio.name}`}
              >
                <Navigation size={18} />
                Get Directions
              </a>

              <a
                href={`tel:${studio.phone.replace(/[^0-9+]/g, '')}`}
                className={styles.callBtn}
                aria-label={`Call ${studio.name}`}
              >
                <Phone size={18} />
                Call Studio
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
