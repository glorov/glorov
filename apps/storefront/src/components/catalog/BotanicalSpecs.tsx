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
      icon: Calendar,
      label: 'Sowing Season',
      value: getSeasonLabel(metadata.season),
    },
    {
      icon: Sun,
      label: 'Sunlight Requirement',
      value: getSunlightLabel(metadata.sunlight),
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
    <section aria-labelledby="botanical-specs-heading" className="space-y-8">
      <div>
        <h2
          id="botanical-specs-heading"
          className="text-xl sm:text-2xl font-black text-botanical-950 tracking-tight"
        >
          Botanical &amp; Cultivation Specifications
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Verified agricultural parameters and growing guidelines calibrated for Indian domestic climates.
        </p>
      </div>

      {/* Grid of Verified Botanical Parameters */}
      {specItems.length > 0 && (
        <div
          role="region"
          aria-label="Botanical specifications grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {specItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-card shadow-2xs hover:border-botanical-300 transition-colors"
              >
                <div className="flex items-center gap-2 text-botanical-700 mb-1.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                    {item.label}
                  </span>
                </div>
                <p
                  className={`font-semibold text-sm text-botanical-950 ${
                    item.isItalic ? 'font-serif italic' : ''
                  }`}
                >
                  {item.value}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Sowing Guidelines & Packaging Shield Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasPlantingInstructions && (
          <div className="p-6 rounded-2xl border border-botanical-200 bg-botanical-50/50 space-y-3">
            <div className="flex items-center gap-2 text-botanical-900">
              <BookOpen className="h-5 w-5 text-botanical-700" aria-hidden="true" />
              <h3 className="font-bold text-base">Sowing &amp; Propagation Guidelines</h3>
            </div>
            <p className="text-xs sm:text-sm text-botanical-950/85 leading-relaxed whitespace-pre-line">
              {metadata.planting_instructions}
            </p>
          </div>
        )}

        {hasPackagingNotes && (
          <div className="p-6 rounded-2xl border border-earth-300 bg-earth-50/70 space-y-3">
            <div className="flex items-center gap-2 text-botanical-900">
              <Package className="h-5 w-5 text-botanical-700" aria-hidden="true" />
              <h3 className="font-bold text-base">Packaging &amp; Safe Viability Shield</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {metadata.packaging_notes}
            </p>
          </div>
        )}
      </div>

      {/* Realistic Germination & Cultivation Notice */}
      <div className="p-4 rounded-xl border border-border/80 bg-earth-50/50 text-xs text-muted-foreground flex items-start gap-3">
        <Info className="h-4 w-4 text-botanical-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-foreground">Cultivation Notice:</strong> Germination time and plant performance depend on local weather, ambient temperature, soil moisture, and correct sowing depth. While GLOROV batches are viability-tested at our Pune hub, results vary naturally based on individual gardening care.
        </p>
      </div>
    </section>
  )
}
