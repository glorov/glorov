'use client'

import React from 'react'
import {
  Sun,
  Droplets,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  Package,
  Shield,
  HelpCircle,
  Maximize2,
  Hourglass,
  Tag,
  Info,
} from 'lucide-react'
import type { SeedMetadata } from '@glorov/types'
import styles from './BotanicalSpecs.module.css'

interface BotanicalSpecsProps {
  metadata?: SeedMetadata
}

export function BotanicalSpecs({ metadata = {} }: BotanicalSpecsProps) {
  // Format sunlight label cleanly
  const getSunlightLabel = (val?: string) => {
    switch (val) {
      case 'full_sun':
        return 'Full Direct Sun (6+ hours)'
      case 'partial_shade':
        return 'Partial Shade / Filtered Light'
      case 'low_light':
        return 'Indirect or Low Light'
      default:
        return val ? val.replace(/_/g, ' ') : null
    }
  }

  // Format watering label cleanly
  const getWateringLabel = (val?: string) => {
    switch (val) {
      case 'daily':
        return 'Daily Moisture (Gentle Spray)'
      case 'alternate_days':
        return 'Alternate Days (Check Soil)'
      case 'weekly':
        return 'Weekly (Allow Soil to Dry)'
      case 'dry':
        return 'Sparse / Drought Tolerant'
      default:
        return val ? val.replace(/_/g, ' ') : null
    }
  }

  // Format season label cleanly
  const getSeasonLabel = (val?: string) => {
    switch (val) {
      case 'kharif':
        return 'Kharif Season (Monsoon: June – October)'
      case 'rabi':
        return 'Rabi Season (Winter: October – March)'
      case 'zaid':
        return 'Zaid Season (Summer: March – June)'
      case 'all_season':
        return 'All-Season Sowing'
      default:
        return val ? val.replace(/_/g, ' ') : null
    }
  }

  // Collect only fields that have verified, truthy values
  const specItems = [
    {
      icon: Tag,
      label: 'Common Vernacular Name',
      value: metadata.common_name,
    },
    {
      icon: Sparkles,
      label: 'Botanical Binomial',
      value: metadata.botanical_name,
      isItalic: true,
    },
    {
      icon: Sparkles,
      label: 'Variety / Cultivar',
      value: metadata.variety,
    },
    {
      icon: Sparkles,
      label: 'Seed Classification',
      value: metadata.seed_type,
    },
    {
      icon: Clock,
      label: 'Germination Time',
      value: metadata.germination_time_range,
    },
    {
      icon: Layers,
      label: 'Sowing Depth',
      value: metadata.sowing_depth,
    },
    {
      icon: Maximize2,
      label: 'Plant Spacing',
      value: metadata.spacing,
    },
    {
      icon: Sun,
      label: 'Sunlight Exposure',
      value: getSunlightLabel(metadata.sunlight),
    },
    {
      icon: Calendar,
      label: 'Optimal Sowing Season',
      value: getSeasonLabel(metadata.season),
    },
    {
      icon: Droplets,
      label: 'Watering Regimen',
      value: getWateringLabel(metadata.watering),
    },
    {
      icon: Hourglass,
      label: 'Estimated Days to Harvest',
      value: metadata.days_to_harvest,
    },
    {
      icon: Shield,
      label: 'Cultivation Difficulty',
      value: metadata.difficulty ? `${metadata.difficulty.toUpperCase()} FRIENDLY` : null,
    },
    {
      icon: HelpCircle,
      label: 'Approx. Seeds per Packet',
      value: metadata.approx_seeds_per_packet ? `${metadata.approx_seeds_per_packet} seeds` : null,
    },
  ].filter((item) => Boolean(item.value && String(item.value).trim()))

  const hasPlantingInstructions = Boolean(metadata.planting_instructions && metadata.planting_instructions.trim())
  const hasPackagingNotes = Boolean(metadata.packaging_notes && metadata.packaging_notes.trim())

  // If completely empty metadata, omit the whole section cleanly rather than showing empty blocks
  if (specItems.length === 0 && !hasPlantingInstructions && !hasPackagingNotes) {
    return null
  }

  return (
    <section aria-labelledby="botanical-specs-heading" className={styles.section}>
      <div className={styles.header}>
        <h2
          id="botanical-specs-heading"
          className={styles.title}
        >
          Botanical &amp; Cultivation Specifications
        </h2>
        <p className={styles.subtitle}>
          Verified agricultural parameters and growing guidelines calibrated for Indian domestic climates.
        </p>
      </div>

      {/* Grid of Verified Botanical Parameters */}
      {specItems.length > 0 && (
        <div
          role="region"
          aria-label="Botanical specifications grid"
          className={styles.specsGrid}
        >
          {specItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className={styles.specCard}>
                <div className={styles.specHeader}>
                  <div className={styles.specIconWrap}>
                    <Icon size={14} aria-hidden="true" />
                  </div>
                  <span className={styles.specLabel}>
                    {item.label}
                  </span>
                </div>
                <p className={`${styles.specValue} ${item.isItalic ? styles.italic : ''}`}>
                  {item.value}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Sowing Guidelines & Packaging Shield Cards */}
      <div className={styles.guidelineGrid}>
        {hasPlantingInstructions && (
          <div className={styles.guidelineCard}>
            <div className={styles.guidelineHeader}>
              <div className={styles.specIconWrap}>
                <BookOpen size={16} aria-hidden="true" />
              </div>
              <h3 className={styles.guidelineTitle}>Sowing &amp; Propagation Guidelines</h3>
            </div>
            <p className={styles.guidelineText}>
              {metadata.planting_instructions}
            </p>
          </div>
        )}

        {hasPackagingNotes && (
          <div className={styles.guidelineCard}>
            <div className={styles.guidelineHeader}>
              <div className={styles.specIconWrap}>
                <Package size={16} aria-hidden="true" />
              </div>
              <h3 className={styles.guidelineTitle}>Packaging &amp; Safe Viability Shield</h3>
            </div>
            <p className={styles.guidelineText}>
              {metadata.packaging_notes}
            </p>
          </div>
        )}
      </div>

      {/* Realistic Germination Notice */}
      <div className={styles.cultivationNotice}>
        <Info size={16} style={{ color: 'var(--ugaoo-green)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
        <p className={styles.noticeText}>
          <strong style={{ color: 'var(--ugaoo-green)' }}>Cultivation Notice:</strong> Germination time and plant performance depend on local weather, ambient temperature, soil moisture, and correct sowing depth. While GLOROV batches are viability-tested at our Pune hub, results vary naturally based on individual gardening care.
        </p>
      </div>
    </section>
  )
}
