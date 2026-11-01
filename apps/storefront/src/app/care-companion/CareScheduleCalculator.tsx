'use client'

import React, { useState } from 'react'
import {
  Droplets,
  Sun,
  Wind,
  Download,
  Send,
  Sparkles,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import styles from './CareCompanionPage.module.css'

interface PlantProfile {
  id: string
  name: string
  botanical: string
  baseWaterDays: number
  mistingFreq: string
  aerationDays: number
  feedingRule: string
  soilCheckTip: string
}

const PLANT_PROFILES: Record<string, PlantProfile> = {
  monstera: {
    id: 'monstera',
    name: 'Monstera Deliciosa (Swiss Cheese Plant)',
    botanical: 'Monstera deliciosa Liebm.',
    baseWaterDays: 7,
    mistingFreq: '2 times weekly (Morning misting)',
    aerationDays: 30,
    feedingRule: 'Top-dress with 3 tbsp aged vermicompost every 60 days.',
    soilCheckTip: 'Insert finger 2 inches into soil; water only when completely dry to touch.',
  },
  snake_plant: {
    id: 'snake_plant',
    name: 'Sansevieria Trifasciata (Snake Plant)',
    botanical: 'Dracaena trifasciata (Laurentii)',
    baseWaterDays: 14,
    mistingFreq: 'None (Keep foliage strictly dry)',
    aerationDays: 45,
    feedingRule: 'Light vermicompost sprinkle twice a year (March & September).',
    soilCheckTip: 'Allow potting medium to dry 100% bone-dry between waterings.',
  },
  peace_lily: {
    id: 'peace_lily',
    name: 'Peace Lily (White Spathe Air Purifier)',
    botanical: 'Spathiphyllum wallisii',
    baseWaterDays: 5,
    mistingFreq: '3 times weekly (Thrives in ambient humidity)',
    aerationDays: 20,
    feedingRule: 'Diluted organic compost tea once every 45 days.',
    soilCheckTip: 'Water when top 1 inch feels dry or when leaves subtly begin to soften.',
  },
  money_plant: {
    id: 'money_plant',
    name: 'Golden Pothos (Desi Money Plant)',
    botanical: 'Epipremnum aureum',
    baseWaterDays: 6,
    mistingFreq: '2 times weekly along aerial roots',
    aerationDays: 30,
    feedingRule: '2 tbsp vermicompost monthly during growth cycles.',
    soilCheckTip: 'Check top 1.5 inches of cocopeat; hydrate before soil pulls away from rim.',
  },
  areca_palm: {
    id: 'areca_palm',
    name: 'Areca Palm (Butterfly Palm)',
    botanical: 'Dypsis lutescens',
    baseWaterDays: 5,
    mistingFreq: 'Daily morning foliage misting',
    aerationDays: 25,
    feedingRule: 'Organic seaweed tonic monthly in warm weather.',
    soilCheckTip: 'Keep root zone evenly moist but never sitting in pooled water.',
  },
  zz_plant: {
    id: 'zz_plant',
    name: 'Zamioculcas Zamiifolia (ZZ Plant)',
    botanical: 'Zamioculcas zamiifolia',
    baseWaterDays: 16,
    mistingFreq: 'None (Underground rhizomes store moisture)',
    aerationDays: 60,
    feedingRule: 'Minimal organic feed once every 4 months.',
    soilCheckTip: 'Allow pot to feel very light before watering; water drought-style.',
  },
  jade_plant: {
    id: 'jade_plant',
    name: 'Jade Succulent (Crassula Ovata)',
    botanical: 'Crassula ovata',
    baseWaterDays: 12,
    mistingFreq: 'None (Prefers dry, breezy air)',
    aerationDays: 40,
    feedingRule: 'Sprinkle vermicompost in early spring and post-monsoon.',
    soilCheckTip: 'Water only when lower fleshy leaves feel slightly soft to gentle squeeze.',
  },
}

export function CareScheduleCalculator() {
  const [selectedPlantId, setSelectedPlantId] = useState<string>('monstera')
  const [selectedPotSize, setSelectedPotSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [selectedLight, setSelectedLight] = useState<'direct' | 'bright_indirect' | 'medium' | 'low'>('bright_indirect')
  const [selectedSeason, setSelectedSeason] = useState<'winter' | 'summer' | 'monsoon'>('winter')

  const [reminderContact, setReminderContact] = useState<string>('')
  const [reminderSubscribed, setReminderSubscribed] = useState<boolean>(false)

  const profile = PLANT_PROFILES[selectedPlantId] || PLANT_PROFILES.monstera

  // Multiplier logic
  const potMultiplier = selectedPotSize === 'small' ? 0.8 : selectedPotSize === 'large' ? 1.3 : 1.0
  const lightMultiplier =
    selectedLight === 'direct'
      ? 0.75
      : selectedLight === 'bright_indirect'
      ? 1.0
      : selectedLight === 'medium'
      ? 1.25
      : 1.5
  const seasonMultiplier =
    selectedSeason === 'summer'
      ? 0.7
      : selectedSeason === 'monsoon'
      ? 1.3
      : 1.4 // winter default

  const calculatedDays = Math.max(
    3,
    Math.round(profile.baseWaterDays * potMultiplier * lightMultiplier * seasonMultiplier)
  )

  // Generate next 4 watering milestone dates
  const nextDates: string[] = []
  const now = new Date()
  for (let i = 1; i <= 4; i++) {
    const future = new Date(now.getTime() + i * calculatedDays * 86400000)
    nextDates.push(
      future.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    )
  }

  // Handle iCal (.ics) download
  const handleDownloadCalendar = () => {
    const startDate = new Date(now.getTime() + calculatedDays * 86400000)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z'

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GLOROV Botanicals//Plant Care Companion//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Water ${profile.name} (GLOROV Care Reminder)
DESCRIPTION:Check topsoil moisture and hydrate ${profile.name}. ${profile.soilCheckTip}
DTSTART:${startDate}
RRULE:FREQ=DAILY;INTERVAL=${calculatedDays}
STATUS:CONFIRMED
TRANSP:TRANSPARENT
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `${profile.id}-watering-schedule.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reminderContact.trim()) {
      setReminderSubscribed(true)
    }
  }

  return (
    <div className={styles.calculatorCard} id="care-calculator">
      {/* 4 Interactive Dropdown Inputs */}
      <div className={styles.calculatorFormGrid}>
        {/* 1. Plant Species */}
        <div className={styles.inputGroup}>
          <label htmlFor="calc-plant" className={styles.inputLabel}>
            <Droplets size={16} color="var(--ugaoo-green)" />
            <span>Select Your Botanical Specimen</span>
          </label>
          <select
            id="calc-plant"
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
            className={styles.selectField}
          >
            <option value="monstera">Monstera Deliciosa (Swiss Cheese)</option>
            <option value="snake_plant">Sansevieria Trifasciata (Snake Plant)</option>
            <option value="peace_lily">Spathiphyllum (Peace Lily)</option>
            <option value="money_plant">Golden Pothos (Desi Money Plant)</option>
            <option value="areca_palm">Dypsis Lutescens (Areca Palm)</option>
            <option value="zz_plant">Zamioculcas (ZZ Plant)</option>
            <option value="jade_plant">Crassula Ovata (Jade Succulent)</option>
          </select>
        </div>

        {/* 2. Pot Size */}
        <div className={styles.inputGroup}>
          <label htmlFor="calc-pot" className={styles.inputLabel}>
            <Layers size={16} color="var(--ugaoo-green)" />
            <span>Planter / Pot Size</span>
          </label>
          <select
            id="calc-pot"
            value={selectedPotSize}
            onChange={(e) => setSelectedPotSize(e.target.value as 'small' | 'medium' | 'large')}
            className={styles.selectField}
          >
            <option value="small">Compact (4 to 6 inches) • Quick Drying</option>
            <option value="medium">Standard (7 to 9 inches) • Balanced</option>
            <option value="large">Substantial (10 to 14 inches) • High Water Retention</option>
          </select>
        </div>

        {/* 3. Sunlight Environment */}
        <div className={styles.inputGroup}>
          <label htmlFor="calc-light" className={styles.inputLabel}>
            <Sun size={16} color="var(--ugaoo-green)" />
            <span>Indoor Lighting Exposure</span>
          </label>
          <select
            id="calc-light"
            value={selectedLight}
            onChange={(e) =>
              setSelectedLight(e.target.value as 'direct' | 'bright_indirect' | 'medium' | 'low')
            }
            className={styles.selectField}
          >
            <option value="bright_indirect">Bright Indirect Sunlight (Near Window)</option>
            <option value="direct">Intense Direct Sunlight (Unshaded Balcony)</option>
            <option value="medium">Filtered / Medium Light (3-5 ft from Window)</option>
            <option value="low">Low Light / Office Fluorescent Lighting</option>
          </select>
        </div>

        {/* 4. Current Season */}
        <div className={styles.inputGroup}>
          <label htmlFor="calc-season" className={styles.inputLabel}>
            <Wind size={16} color="var(--ugaoo-green)" />
            <span>Season &amp; Ambient Climate</span>
          </label>
          <select
            id="calc-season"
            value={selectedSeason}
            onChange={(e) =>
              setSelectedSeason(e.target.value as 'winter' | 'summer' | 'monsoon')
            }
            className={styles.selectField}
          >
            <option value="winter">Rabi / Winter (Cool &amp; Dry Air)</option>
            <option value="summer">Zaid / Summer (Hot, Arid &amp; High Evaporation)</option>
            <option value="monsoon">Kharif / Monsoon (High Humidity &amp; Rain)</option>
          </select>
        </div>
      </div>

      {/* COMPUTED RESULT BOX */}
      <div className={styles.resultBox} aria-live="polite" aria-atomic="true">
        <div className={styles.resultHeader}>
          <div>
            <h3 className={styles.resultPlantName}>{profile.name}</h3>
            <span className={styles.resultBotanicalTerm}>{profile.botanical}</span>
          </div>

          <div>
            <span className={styles.frequencyPill}>
              <Droplets size={16} />
              Water Every {calculatedDays} Days
            </span>
          </div>
        </div>

        {/* 3 Key Care Metric Cards */}
        <div className={styles.careMetricsGrid}>
          {/* Hydration */}
          <div className={styles.careMetricCard}>
            <span className={styles.careMetricTitle}>
              <Droplets size={14} />
              Hydration Protocol
            </span>
            <p className={styles.careMetricVal}>Every {calculatedDays} Days</p>
            <p className={styles.careMetricTip}>{profile.soilCheckTip}</p>
          </div>

          {/* Misting */}
          <div className={styles.careMetricCard}>
            <span className={styles.careMetricTitle}>
              <Wind size={14} />
              Foliage Misting
            </span>
            <p className={styles.careMetricVal}>{profile.mistingFreq}</p>
            <p className={styles.careMetricTip}>Prevents tip browning and deters spider mites.</p>
          </div>

          {/* Aeration & Feeding */}
          <div className={styles.careMetricCard}>
            <span className={styles.careMetricTitle}>
              <Sparkles size={14} />
              Organic Feeding
            </span>
            <p className={styles.careMetricVal}>Every {profile.aerationDays} Days</p>
            <p className={styles.careMetricTip}>{profile.feedingRule}</p>
          </div>
        </div>

        {/* Next 4 Milestones Timeline */}
        <div className={styles.timelineSection}>
          <h4 className={styles.timelineHeading}>Next 4 Scheduled Hydration Dates:</h4>
          <div className={styles.scheduleList}>
            {nextDates.map((dateStr, idx) => (
              <div key={idx} className={styles.scheduleNode}>
                <span className={styles.nodeIndex}>Hydration #{idx + 1}</span>
                <span className={styles.nodeDate}>{dateStr}</span>
                <span className={styles.nodeAction}>Soil check &amp; soak</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Download Button */}
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={handleDownloadCalendar}
            className={styles.calendarDownloadBtn}
            aria-label={`Download .ics recurring calendar schedule for ${profile.name}`}
          >
            <Download size={18} />
            <span>Add Schedule to Google Calendar / Apple iCal (.ics)</span>
          </button>
        </div>

        {/* WhatsApp & Email Reminder Form */}
        <div className={styles.reminderFormWrapper}>
          <div className={styles.reminderText}>
            <h4 className={styles.reminderTitle}>Never Forget to Water Again</h4>
            <p className={styles.reminderSubtitle}>
              Get free WhatsApp or email watering alerts every {calculatedDays} days straight from our Pune nursery desk.
            </p>
          </div>

          {reminderSubscribed ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#03543f',
                backgroundColor: '#def7ec',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Care alerts active for {profile.name}!</span>
            </div>
          ) : (
            <form onSubmit={handleReminderSubmit} className={styles.reminderInputGroup}>
              <input
                type="text"
                required
                value={reminderContact}
                onChange={(e) => setReminderContact(e.target.value)}
                placeholder="+91 WhatsApp or Email"
                className={styles.reminderInput}
                aria-label="WhatsApp Number or Email for Care Reminders"
              />
              <button
                type="submit"
                className={styles.subscribeAlertBtn}
                aria-label="Activate Care Alerts"
              >
                <Send size={16} />
                <span>Activate</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
