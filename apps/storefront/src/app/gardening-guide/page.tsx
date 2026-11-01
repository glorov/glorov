import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Sun,
  Droplets,
  Layers,
  Sparkles,
  CloudRain,
  Snowflake,
  Flame,
  MessageCircle,
  ExternalLink,
  AlertTriangle,
  Leaf,
} from 'lucide-react'
import styles from './GardeningGuidePage.module.css'

export const metadata: Metadata = {
  title: 'Indian Horticultural & Gardening Guide — GLOROV Botanicals',
  description: 'Seasonal sowing calendar for India (Kharif, Rabi, Zaid), sunlight calculator, potting soil mix ratios, and troubleshooting plant symptoms.',
}

export default function GardeningGuidePage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Horticultural Guide</span>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Leaf size={14} aria-hidden="true" />
            <span>Pune Nursery Botanical Knowledge</span>
          </div>
          <h1 className={styles.heroTitle}>Indian Horticultural &amp; Gardening Guide</h1>
          <p className={styles.heroSubtitle}>
            Cultivation calendars, tropical sunlight profiles, potting media chemistry, and troubleshooting tips tailored for Indian urban growers.
          </p>
        </div>
      </section>

      {/* 3. Main Content */}
      <main className={styles.mainContent}>
        {/* Seasonal Sowing Calendar */}
        <section className={styles.seasonSection} aria-label="Indian Seasonal Sowing Calendar">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionPreheading}>Agronomic Calendar</p>
            <h2 className={styles.sectionHeading}>The Three Indian Agricultural Sowing Cycles</h2>
            <p className={styles.sectionSubtitle}>
              Align your seed sowing and repotting schedule with India&apos;s distinct climatic seasons.
            </p>
          </div>

          <div className={styles.seasonGrid}>
            {/* Kharif */}
            <article className={styles.seasonCard}>
              <span className={styles.seasonBadge} style={{ backgroundColor: '#e6f6ee', color: '#0a4c36' }}>
                <CloudRain size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Monsoon Cycle
              </span>
              <h3 className={styles.seasonTitle}>Kharif Season</h3>
              <p className={styles.seasonMonths}>June – October</p>
              <p className={styles.seasonDesc}>
                High atmospheric humidity and warm ambient temperatures. Ideal for sowing fruiting vegetables and propagating tropical foliage cuttings.
              </p>
              <p className={styles.cropsHeading}>Recommended Desi Seeds:</p>
              <div className={styles.cropPills}>
                <span className={styles.cropPill}>Desi Bhindi (Okra)</span>
                <span className={styles.cropPill}>Pusa Ruby Tomato</span>
                <span className={styles.cropPill}>Jwala Green Chili</span>
                <span className={styles.cropPill}>Bottle Gourd</span>
                <span className={styles.cropPill}>Brinjal</span>
              </div>
            </article>

            {/* Rabi */}
            <article className={styles.seasonCard}>
              <span className={styles.seasonBadge} style={{ backgroundColor: '#e8f4fd', color: '#0b57d0' }}>
                <Snowflake size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Winter Cycle
              </span>
              <h3 className={styles.seasonTitle}>Rabi Season</h3>
              <p className={styles.seasonMonths}>October – March</p>
              <p className={styles.seasonDesc}>
                Crisp mornings, pleasant daytime sunshine, and cool nights. The golden season for leafy greens, crisp root vegetables, and fragrant winter blossoms.
              </p>
              <p className={styles.cropsHeading}>Recommended Desi Seeds:</p>
              <div className={styles.cropPills}>
                <span className={styles.cropPill}>All Green Palak (Spinach)</span>
                <span className={styles.cropPill}>Kasuri Methi</span>
                <span className={styles.cropPill}>Pusa Kesar Carrot</span>
                <span className={styles.cropPill}>White Radish (Mooli)</span>
                <span className={styles.cropPill}>Genda (Marigold)</span>
              </div>
            </article>

            {/* Zaid */}
            <article className={styles.seasonCard}>
              <span className={styles.seasonBadge} style={{ backgroundColor: '#fef8ec', color: '#b25e00' }}>
                <Flame size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Summer Cycle
              </span>
              <h3 className={styles.seasonTitle}>Zaid Season</h3>
              <p className={styles.seasonMonths}>March – June</p>
              <p className={styles.seasonDesc}>
                Intense tropical sunshine and dry afternoon heat. Requires mulch protection and early morning watering for rapid-maturing vine crops.
              </p>
              <p className={styles.cropsHeading}>Recommended Desi Seeds:</p>
              <div className={styles.cropPills}>
                <span className={styles.cropPill}>Desi Kheera (Cucumber)</span>
                <span className={styles.cropPill}>Bitter Gourd (Karela)</span>
                <span className={styles.cropPill}>Watermelon</span>
                <span className={styles.cropPill}>Pudina (Mint)</span>
                <span className={styles.cropPill}>Zinnia</span>
              </div>
            </article>
          </div>
        </section>

        {/* 4 Core Care Principles */}
        <section className={styles.principlesSection} aria-label="Core Horticultural Rules">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionPreheading}>Nursery Disciplines</p>
            <h2 className={styles.sectionHeading}>The Four Pillars of Thriving Botanicals</h2>
          </div>

          <div className={styles.principlesGrid}>
            <article className={styles.principleCard}>
              <div className={styles.principleIconWrap}>
                <Sun size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.principleTitle}>Sunlight Exposure</h3>
              <p className={styles.principleText}>
                Identify your home light zones: Bright Indirect (within 3–5 feet of east/north windows) for Peace Lilies and Monsteras; Direct Sunlight (balcony/terrace) for Jade, Jasmine, and vegetable gardens.
              </p>
            </article>

            <article className={styles.principleCard}>
              <div className={styles.principleIconWrap}>
                <Droplets size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.principleTitle}>The Soil Hydration Test</h3>
              <p className={styles.principleText}>
                Never water on a rigid calendar. Insert your finger 2 inches into the potting substrate. If cool and damp, delay watering. If dry and crumbly, hydrate thoroughly until water emerges from bottom drainage holes.
              </p>
            </article>

            <article className={styles.principleCard}>
              <div className={styles.principleIconWrap}>
                <Layers size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.principleTitle}>Optimal Potting Substrate</h3>
              <p className={styles.principleText}>
                Avoid dense, heavy garden clay that suffocates roots. Our Pune nursery formula: <strong>40% Aerated Coco-Peat</strong>, <strong>30% Organic Vermicompost</strong>, <strong>20% Perlite/Pumice</strong>, and <strong>10% Soil</strong>.
              </p>
            </article>

            <article className={styles.principleCard}>
              <div className={styles.principleIconWrap}>
                <Sparkles size={24} aria-hidden="true" />
              </div>
              <h3 className={styles.principleTitle}>Organic Nutrition</h3>
              <p className={styles.principleText}>
                Feed plants gently during active growth (March to October). Use organic seaweed extract or cold-pressed neem cake every 3 weeks. Zero chemical salt burn, 100% safe for indoor microclimates.
              </p>
            </article>
          </div>
        </section>

        {/* Troubleshooting Symptoms Section */}
        <section className={styles.troubleSection} aria-label="Plant Symptom Diagnostics">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionPreheading}>Doctor Consultation</p>
            <h2 className={styles.sectionHeading}>Common Plant Symptoms &amp; Home Remedies</h2>
            <p className={styles.sectionSubtitle}>
              Diagnose and revive your botanical companions before issues progress.
            </p>
          </div>

          <div className={styles.troubleGrid}>
            <div className={styles.troubleCard}>
              <h3 className={styles.symptomTitle}>
                <AlertTriangle size={18} color="#b25e00" />
                <span>Yellowing Lower Leaves</span>
              </h3>
              <p className={styles.troubleText}>
                <strong>Root Cause:</strong> Usually overwatering or compacted soil that limits root aeration.<br />
                <strong>Remedy:</strong> Pause watering until top 2 inches dry out completely. Ensure bottom drainage holes are unobstructed.
              </p>
            </div>

            <div className={styles.troubleCard}>
              <h3 className={styles.symptomTitle}>
                <AlertTriangle size={18} color="#b25e00" />
                <span>Crispy Brown Leaf Tips</span>
              </h3>
              <p className={styles.troubleText}>
                <strong>Root Cause:</strong> Low indoor humidity (AC rooms) or high salts/fluoride in municipal tap water.<br />
                <strong>Remedy:</strong> Group plants together to create a micro-humidity bubble or place a pebble moisture tray beneath the pot.
              </p>
            </div>

            <div className={styles.troubleCard}>
              <h3 className={styles.symptomTitle}>
                <AlertTriangle size={18} color="#b25e00" />
                <span>Sudden Drooping &amp; Wilting</span>
              </h3>
              <p className={styles.troubleText}>
                <strong>Root Cause:</strong> Extreme root dehydration or severe transit stress shock.<br />
                <strong>Remedy:</strong> Bottom-water the pot in a basin for 20 minutes until the root ball rehydrates, then return to a shaded, well-ventilated spot.
              </p>
            </div>

            <div className={styles.troubleCard}>
              <h3 className={styles.symptomTitle}>
                <AlertTriangle size={18} color="#b25e00" />
                <span>Stretched &amp; Leggy Stems</span>
              </h3>
              <p className={styles.troubleText}>
                <strong>Root Cause:</strong> Inadequate light intensity prompting the plant to stretch toward illumination.<br />
                <strong>Remedy:</strong> Move the plant 2–3 feet closer to a sunny window or balcony with bright diffused daylight.
              </p>
            </div>
          </div>
        </section>

        {/* WhatsApp Helpdesk Banner */}
        <section className={styles.helpdeskBanner} aria-label="Plant Doctor WhatsApp Consultation">
          <h2 className={styles.helpdeskTitle}>Still unsure about your plant’s health?</h2>
          <p className={styles.helpdeskSubtitle}>
            Send a photograph of your plant or seedling to our Pune nursery experts on WhatsApp for instant diagnosis and care instructions.
          </p>
          <a
            href="https://wa.me/918087087224?text=Hi!+I+need+help+diagnosing+my+plant+from+GLOROV"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>Consult a Plant Doctor on WhatsApp</span>
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </section>
      </main>
    </div>
  )
}
