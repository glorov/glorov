'use client'

import React, { useState } from 'react'
import {
  Thermometer,
  Calendar,
  Clock,
  Sun,
  Sprout,
  Salad,
  Flower2,
  Leaf,
  ShoppingBag,
  Check,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './SowingCalendarPage.module.css'

interface SeedVariety {
  id: string
  name: string
  botanicalName: string
  category: 'vegetables' | 'flowers' | 'herbs'
  price: number
  tempRange: string
  germinationDays: string
  harvestDays: string
  sunlight: string
  description: string
  companionTip: string
  suitableMonths: number[] // 1 - 12
  regions: ('western' | 'north' | 'south' | 'east')[]
  variantId: string
}

const SEED_VARIETIES: SeedVariety[] = [
  {
    id: 'seed_palak',
    name: 'Desi All-Green Palak',
    botanicalName: 'Spinacia oleracea (Desi Heirloom)',
    category: 'vegetables',
    price: 99,
    tempRange: '15°C – 25°C',
    germinationDays: '4 – 7 Days',
    harvestDays: '30 – 35 Days',
    sunlight: 'Full Sun to Partial Shade',
    description: 'Tender broad green leaves rich in iron and dietary fiber. Fast multi-cut harvesting variety.',
    companionTip: 'Interplant with heirloom radish or carrots to maximize raised bed space.',
    suitableMonths: [9, 10, 11, 12, 1, 2],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_palak_rabi',
  },
  {
    id: 'seed_methi',
    name: 'Kasuri Methi (Fenugreek)',
    botanicalName: 'Trigonella foenum-graecum',
    category: 'herbs',
    price: 89,
    tempRange: '12°C – 24°C',
    germinationDays: '3 – 5 Days',
    harvestDays: '25 – 30 Days',
    sunlight: 'Bright Direct Sunlight',
    description: 'Highly aromatic, quick-growing culinary microgreen and leafy green. Nitrogen-fixing root nodules.',
    companionTip: 'Fixes atmospheric nitrogen into the soil, benefiting neighboring brassicas.',
    suitableMonths: [10, 11, 12, 1, 2],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_methi_kasuri',
  },
  {
    id: 'seed_radish',
    name: 'Pusa Chetki Desi Mooli',
    botanicalName: 'Raphanus sativus var. longipinnatus',
    category: 'vegetables',
    price: 99,
    tempRange: '18°C – 28°C',
    germinationDays: '3 – 6 Days',
    harvestDays: '40 – 45 Days',
    sunlight: 'Full Sunlight (6+ Hours)',
    description: 'Crisp, pungent snow-white roots bred by IARI. Exceptional heat tolerance during early winter sowings.',
    companionTip: 'Deters cucumber beetles and squash bugs when sown along garden borders.',
    suitableMonths: [9, 10, 11, 12, 1, 2, 3],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_pusa_mooli',
  },
  {
    id: 'seed_tomato',
    name: 'Pusa Ruby Heirloom Tomato',
    botanicalName: 'Solanum lycopersicum (Desi Indeterminate)',
    category: 'vegetables',
    price: 119,
    tempRange: '20°C – 28°C',
    germinationDays: '6 – 8 Days',
    harvestDays: '65 – 75 Days',
    sunlight: 'Full Sun (6 – 8 Hours)',
    description: 'Juicy, deep-red heritage Indian tomatoes with rich tangy acidity. Prolific branching yields.',
    companionTip: 'Companion plant with Krishna Tulsi or Marigolds to naturally repel hornworms.',
    suitableMonths: [8, 9, 10, 11, 1, 2],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_pusa_ruby',
  },
  {
    id: 'seed_marigold',
    name: 'Royal Pusa Narangi Genda (Marigold)',
    botanicalName: 'Tagetes erecta',
    category: 'flowers',
    price: 109,
    tempRange: '18°C – 30°C',
    germinationDays: '4 – 7 Days',
    harvestDays: '55 – 65 Days',
    sunlight: 'Direct Full Sun',
    description: 'Vibrant festive orange blooms. Essential Indian garden companion releasing root nematicides.',
    companionTip: 'Roots exude alpha-terthienyl, naturally suppressing harmful root-knot nematodes.',
    suitableMonths: [7, 8, 9, 10, 11, 12],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_narangi_genda',
  },
  {
    id: 'seed_tulsi',
    name: 'Shyama Krishna Tulsi (Holy Basil)',
    botanicalName: 'Ocimum sanctum (Purple Krishna)',
    category: 'herbs',
    price: 99,
    tempRange: '20°C – 32°C',
    germinationDays: '5 – 9 Days',
    harvestDays: '45 – 50 Days',
    sunlight: 'Bright Dappled to Full Sun',
    description: 'Revered purple-veined sacred basil with spicy clove-like essential oil aroma. Strong pollinator attractor.',
    companionTip: 'Attracts beneficial Indian honeybees and acts as a biological barrier against thrips.',
    suitableMonths: [6, 7, 8, 9, 10, 11, 2, 3],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_krishna_tulsi',
  },
  {
    id: 'seed_coriander',
    name: 'Pant Haritima Desi Dhaniya',
    botanicalName: 'Coriandrum sativum',
    category: 'herbs',
    price: 89,
    tempRange: '15°C – 25°C',
    germinationDays: '7 – 12 Days',
    harvestDays: '35 – 40 Days',
    sunlight: 'Morning Sun / Filtered Light',
    description: 'Late-bolting Indian heirloom coriander with intense culinary aroma. Crush seeds gently before sowing.',
    companionTip: 'Plant near dill or chives to invite hoverflies that consume garden aphids.',
    suitableMonths: [10, 11, 12, 1, 2],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_desi_dhaniya',
  },
  {
    id: 'seed_bhindi',
    name: 'Pusa Sawani Desi Bhindi (Okra)',
    botanicalName: 'Abelmoschus esculentus',
    category: 'vegetables',
    price: 99,
    tempRange: '24°C – 35°C',
    germinationDays: '5 – 8 Days',
    harvestDays: '45 – 50 Days',
    sunlight: 'Intense Full Sun',
    description: 'Dark green spineless okra bred for yellow vein mosaic virus resistance. Thrives in warm monsoon air.',
    companionTip: 'Intercrop with cowpeas or summer melons for optimal solar canopy layering.',
    suitableMonths: [2, 3, 4, 5, 6, 7],
    regions: ['western', 'north', 'south', 'east'],
    variantId: 'variant_pusa_sawani',
  },
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function InteractiveSowingMatrix() {
  const currentMonthIndex = new Date().getMonth() + 1 // 1-12
  const [selectedRegion, setSelectedRegion] = useState<'western' | 'north' | 'south' | 'east'>('western')
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vegetables' | 'flowers' | 'herbs'>('all')
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({})

  const { addToCart, openDrawer } = useCart()

  // Filter varieties by Month, Region, and Category
  const matchingVarieties = SEED_VARIETIES.filter((variety) => {
    const monthMatch = variety.suitableMonths.includes(selectedMonth)
    const regionMatch = variety.regions.includes(selectedRegion)
    const categoryMatch = selectedCategory === 'all' || variety.category === selectedCategory
    return monthMatch && regionMatch && categoryMatch
  })

  const handleAddSeed = async (variety: SeedVariety) => {
    setAddedMap((prev) => ({ ...prev, [variety.id]: true }))
    try {
      if (addToCart) {
        await addToCart(variety.variantId, 1)
        if (openDrawer) {
          openDrawer()
        }
      }
    } catch {
      // Handled
    }
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [variety.id]: false }))
    }, 2500)
  }

  return (
    <div className={styles.matrixCard} id="sowing-matrix">
      {/* 1. Agro-Climatic Zone Selector */}
      <div className={styles.zoneSelector} role="radiogroup" aria-label="Select Agro-Climatic Region">
        <button
          type="button"
          role="radio"
          aria-checked={selectedRegion === 'western'}
          className={`${styles.zoneBtn} ${selectedRegion === 'western' ? styles.zoneBtnActive : ''}`}
          onClick={() => setSelectedRegion('western')}
        >
          <span>Western Deccan (MH, GJ, Goa)</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedRegion === 'north'}
          className={`${styles.zoneBtn} ${selectedRegion === 'north' ? styles.zoneBtnActive : ''}`}
          onClick={() => setSelectedRegion('north')}
        >
          <span>Northern Plains (Delhi, PB, UP, HR)</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedRegion === 'south'}
          className={`${styles.zoneBtn} ${selectedRegion === 'south' ? styles.zoneBtnActive : ''}`}
          onClick={() => setSelectedRegion('south')}
        >
          <span>Southern Tropical (KA, TN, KL, AP)</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedRegion === 'east'}
          className={`${styles.zoneBtn} ${selectedRegion === 'east' ? styles.zoneBtnActive : ''}`}
          onClick={() => setSelectedRegion('east')}
        >
          <span>Eastern &amp; Coastal (WB, OD, AS)</span>
        </button>
      </div>

      {/* 2. Month Selector Tabs */}
      <div className={styles.monthGrid} role="tablist" aria-label="Select Planting Month">
        {MONTH_NAMES.map((name, idx) => {
          const monthNum = idx + 1
          const isSelected = selectedMonth === monthNum
          const isCurrent = currentMonthIndex === monthNum

          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`${styles.monthBtn} ${isSelected ? styles.monthBtnActive : ''}`}
              onClick={() => setSelectedMonth(monthNum)}
            >
              <span>{name}</span>
              <span className={styles.monthSub}>
                {monthNum >= 6 && monthNum <= 9
                  ? 'Kharif'
                  : monthNum >= 10 || monthNum <= 2
                  ? 'Rabi'
                  : 'Zaid'}
              </span>
              {isCurrent && <span className={styles.nowDot} title="Current Month" />}
            </button>
          )
        })}
      </div>

      {/* 3. Category Filter Bar */}
      <div className={styles.categoryFilterBar}>
        <div className={styles.categoryTabs} role="tablist" aria-label="Filter by Crop Category">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <Sprout size={16} />
            <span>All Varieties ({matchingVarieties.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'vegetables'}
            className={`${styles.categoryBtn} ${selectedCategory === 'vegetables' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('vegetables')}
          >
            <Salad size={16} />
            <span>Desi Vegetables</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'flowers'}
            className={`${styles.categoryBtn} ${selectedCategory === 'flowers' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('flowers')}
          >
            <Flower2 size={16} />
            <span>Festive Flowers</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'herbs'}
            className={`${styles.categoryBtn} ${selectedCategory === 'herbs' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('herbs')}
          >
            <Leaf size={16} />
            <span>Medicinal Herbs</span>
          </button>
        </div>

        <div className={styles.currentSelectionSummary}>
          Sowing for: <strong>{MONTH_NAMES[selectedMonth - 1]}</strong> in{' '}
          <strong>
            {selectedRegion === 'western'
              ? 'Western Deccan'
              : selectedRegion === 'north'
              ? 'Northern Plains'
              : selectedRegion === 'south'
              ? 'Southern Peninsula'
              : 'Eastern & Coastal'}
          </strong>
        </div>
      </div>

      {/* 4. Varieties Recommendation Grid */}
      <div className={styles.varietiesGrid} aria-label="Recommended Seeds for Sowing">
        {matchingVarieties.map((variety) => {
          const isAdded = addedMap[variety.id]

          return (
            <article key={variety.id} className={styles.varietyCard}>
              <div className={styles.varietyTop}>
                <div>
                  <h3 className={styles.varietyName}>{variety.name}</h3>
                  <span className={styles.varietyBotanical}>{variety.botanicalName}</span>
                </div>
                <span className={styles.gstBadge}>0% GST (HSN 1209)</span>
              </div>

              {/* Sowing Vitals Grid */}
              <div className={styles.vitalsGrid}>
                <div className={styles.vitalItem}>
                  <Thermometer size={14} className={styles.vitalIcon} />
                  <span>Soil: {variety.tempRange}</span>
                </div>
                <div className={styles.vitalItem}>
                  <Clock size={14} className={styles.vitalIcon} />
                  <span>Sprouts: {variety.germinationDays}</span>
                </div>
                <div className={styles.vitalItem}>
                  <Calendar size={14} className={styles.vitalIcon} />
                  <span>Harvest: {variety.harvestDays}</span>
                </div>
                <div className={styles.vitalItem}>
                  <Sun size={14} className={styles.vitalIcon} />
                  <span>{variety.sunlight}</span>
                </div>
              </div>

              <p className={styles.varietyDesc}>{variety.description}</p>

              <div className={styles.companionTip}>
                <strong>Companion Tip:</strong> {variety.companionTip}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.priceTag}>₹{variety.price}</span>
                <button
                  type="button"
                  onClick={() => handleAddSeed(variety)}
                  className={styles.addSeedBtn}
                  aria-label={`Add ${variety.name} seeds to cart for ₹${variety.price}`}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      Add Seeds
                    </>
                  )}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
