import React from 'react'
import {
  Calendar,
  Layers,
  Droplets,
  Sun,
} from 'lucide-react'
import styles from './GardeningGuide.module.css'

const SEASONS = [
  {
    name: 'Kharif Sowing',
    timeline: 'June – October (Monsoon)',
    tag: 'Monsoon Cycle',
    crops: 'Tomato, Chilli, Brinjal, Okra, Cluster Beans',
    tip: 'Elevate containers and ensure unobstructed drainage holes to prevent root rot during torrential showers.',
  },
  {
    name: 'Rabi Sowing',
    timeline: 'October – March (Winter)',
    tag: 'Cool Weather',
    crops: 'Coriander, Spinach, Radish, Fenugreek, Marigold',
    tip: 'Cool nights and mild sun create ideal conditions for lush culinary herbs and high-viability brassicas.',
  },
  {
    name: 'Zaid Sowing',
    timeline: 'March – June (Summer)',
    tag: 'Warm Cycle',
    crops: 'Cucumber, Bitter Gourd, Watermelon, Sunflower',
    tip: 'Mulch container soil surfaces with coco-peat to retain precious moisture against afternoon tropical heat.',
  },
]

const RULES = [
  {
    icon: Layers,
    title: 'The 2× Depth Rule',
    description:
      'Sow seeds at a depth approximately 2 to 3 times their diameter. Fine seeds like Tulsi require light and should only be pressed gently onto moist topsoil.',
  },
  {
    icon: Droplets,
    title: 'Fine Mist Hydration',
    description:
      'Always mist newly sown seeds with a fine spray nozzle. A direct high-pressure hose displaces embryonic roots and buries seeds too deep.',
  },
  {
    icon: Sun,
    title: 'Filtered to Direct Sun',
    description:
      'Keep seed trays in warm, bright indirect light until true leaves develop. Transition gradually over 3–5 days to full outdoor sunlight.',
  },
]

export function GardeningGuide() {
  return (
    <section id="sowing-calendar" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Horticultural Knowledge</span>
          <h2 className={styles.title}>
            Indian Sowing &amp; Cultivation Calendar
          </h2>
          <p className={styles.subtitle}>
            Cultivate with confidence using seasonal guidelines calibrated specifically for Indian regional weather patterns and container gardening.
          </p>
        </div>

        {/* 3 Indian Agricultural Seasons */}
        <div className={styles.seasonsGrid}>
          {SEASONS.map((season) => (
            <div key={season.name} className={styles.seasonCard}>
              <div className={styles.seasonHeader}>
                <div className={styles.seasonMeta}>
                  <span className={styles.seasonTag}>{season.tag}</span>
                  <span className={styles.seasonTimeline}>
                    <Calendar size={13} color="var(--ugaoo-green)" />
                    {season.timeline}
                  </span>
                </div>
                <h3 className={styles.seasonName}>{season.name}</h3>
              </div>
              <div className={styles.seasonBody}>
                <div>
                  <span className={styles.cropsLabel}>Recommended Seeds:</span>
                  <p className={styles.cropsText}>{season.crops}</p>
                </div>
                <div className={styles.cultivationNote}>
                  <strong>Cultivation Note: </strong>
                  {season.tip}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Essential Botanical Germination Rules */}
        <div className={styles.rulesSection}>
          <h3 className={styles.rulesTitle}>Core Seed Sowing Foundations</h3>
          <div className={styles.rulesGrid}>
            {RULES.map((rule) => {
              const Icon = rule.icon
              return (
                <div key={rule.title} className={styles.ruleCard}>
                  <div className={styles.ruleIconWrapper}>
                    <Icon size={22} />
                  </div>
                  <div className={styles.ruleContent}>
                    <h4 className={styles.ruleHeading}>{rule.title}</h4>
                    <p className={styles.ruleDesc}>{rule.description}</p>
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
