'use client'

import React, { useState } from 'react'
import {
  Leaf,
  Bug,
  Droplets,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Sprout,
  Sun,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import styles from './PlantDoctorPage.module.css'

interface DiagnosisResult {
  title: string
  botanicalTerm: string
  severity: 'mild' | 'moderate' | 'critical'
  cause: string
  steps: string[]
}

interface SymptomOption {
  id: string
  label: string
  description: string
  result: DiagnosisResult
}

// Symptom matrix by Plant Category + Affected Part
const DIAGNOSTIC_DATABASE: Record<string, SymptomOption[]> = {
  'indoor_leaves': [
    {
      id: 'yellow_lower_leaves',
      label: 'Lower leaves turning pale yellow and soft',
      description: 'Older foliage at base loses green pigment and drops easily.',
      result: {
        title: 'Overwatering & Root Hypoxia',
        botanicalTerm: 'Suffocatio radicum (Anaerobic Root Saturation)',
        severity: 'moderate',
        cause:
          'Roots have been kept constantly waterlogged without an aeration cycle. Without oxygen in the potting medium, root hairs cannot absorb nitrogen.',
        steps: [
          'Halt watering immediately and allow the top 2 inches of potting medium to dry out completely.',
          'Verify container drainage holes are unblocked and clear any pooled water from saucers.',
          'Gently aerate the top layer of soil with a blunt wooden chopstick to reintroduce oxygen.',
          'Prune fully yellowed leaves at the stem node using sterilized shears.',
        ],
      },
    },
    {
      id: 'brown_crisp_tips',
      label: 'Crisp brown margins and tips on foliage',
      description: 'Leaves develop dry, crunchy edges while the center remains green.',
      result: {
        title: 'Low Ambient Humidity & Fluoride Burn',
        botanicalTerm: 'Acro-necrosis foliorum (Tip Desiccation)',
        severity: 'mild',
        cause:
          'Indoor air conditioning or dry weather dropped ambient humidity below 45%, or municipal tap water contains excess chlorine and mineral salts.',
        steps: [
          'Switch to watering with rested water (leave tap water in an open container for 24 hours).',
          'Group tropical specimens together or place on a pebble tray filled with water to elevate humidity.',
          'Keep foliage away from direct drafts of air conditioner vents and blowers.',
        ],
      },
    },
    {
      id: 'scorch_bleached_spots',
      label: 'Bleached white or tan paper-thin patches',
      description: 'Leaf surfaces look bleached, translucent, or crisp in irregular spots.',
      result: {
        title: 'Direct Solar Photobleaching (Sunburn)',
        botanicalTerm: 'Photo-oxidation solaris',
        severity: 'moderate',
        cause:
          'Under-canopy tropical plants lack sun-blocking carotenoids for direct tropical midday rays.',
        steps: [
          'Move specimen 3 to 5 feet back from direct unshaded southern or western windows.',
          'Filter sunlight with a sheer linen curtain to provide bright, indirect, dappled luminescence.',
          'Hydrate gently; sunburned leaf cells will not recover, but new foliage will emerge healthy.',
        ],
      },
    },
  ],
  'indoor_bugs': [
    {
      id: 'fine_spider_webs',
      label: 'Fine silky webs with tiny yellow stippling',
      description: 'Undersides of leaves show microscopic dust-like mites and faint webbing.',
      result: {
        title: 'Red Spider Mite Colonization',
        botanicalTerm: 'Tetranychidae infestation',
        severity: 'critical',
        cause:
          'Dry, warm indoor air allows spider mites to rapidly colonize vulnerable leaf undersides and suck chlorophyll.',
        steps: [
          'Isolate the infected plant immediately from neighboring botanical specimens.',
          'Wash both sides of all foliage thoroughly in a lukewarm shower to dislodge webs and nymphs.',
          'Spray foliage thoroughly with organic Cold-Pressed Neem Oil emulsion (5ml/L pure water + organic soap drop).',
          'Repeat organic neem wipe down every 4 days for 2 consecutive weeks.',
        ],
      },
    },
    {
      id: 'cottony_white_clusters',
      label: 'White cotton-like fuzzy clusters in stem leaf axils',
      description: 'Fluffy white sticky masses nestled in leaf joints and under veins.',
      result: {
        title: 'Mealybug Sap-Feeder Infestation',
        botanicalTerm: 'Pseudococcidae colonis',
        severity: 'critical',
        cause:
          'Soft scale insects thrive in protected stem joints, secreting sticky honeydew that invites sooty mold.',
        steps: [
          'Dip a cotton swab in 70% isopropyl rubbing alcohol and dab directly onto each visible white cluster.',
          'Spray thoroughly with diluted organic neem emulsion into deep leaf joints and petioles.',
          'Inspect neighboring botanical pots for hitchhiking nymphs.',
        ],
      },
    },
  ],
  'indoor_stems_roots': [
    {
      id: 'stem_rot_base',
      label: 'Stem mushy, blackened or collapsing at soil level',
      description: 'Base of plant feels squishy with an earthy sour odor.',
      result: {
        title: 'Basal Stem & Pythium Root Rot',
        botanicalTerm: 'Pythium & Phytophthora debaryanum',
        severity: 'critical',
        cause:
          'Fungal pathogens attacked roots drowned by excessive water and lack of oxygen.',
        steps: [
          'Unpot the plant immediately and inspect root system under running water.',
          'Trim away all black, slimy, mushy roots using alcohol-sterilized scissors, leaving only firm pale roots.',
          'Dust cut surfaces with organic cinnamon powder (natural botanical antifungal).',
          'Repot in fresh, highly porous soil mix (cocopeat, perlite, vermicompost) and withhold water for 3 days.',
        ],
      },
    },
  ],
  'succulent_leaves': [
    {
      id: 'succulent_translucent',
      label: 'Leaves turning squishy, yellow and translucent',
      description: 'Succulent plump leaves turn watery jelly and detach at a gentle touch.',
      result: {
        title: 'Cellular Edema & Overwatering',
        botanicalTerm: 'Hydro-edema succulentis',
        severity: 'critical',
        cause:
          'Succulent parenchyma tissue absorbed more water than cell walls could contain, rupturing cells.',
        steps: [
          'Stop all watering for at least 14 days; allow soil to dry completely bone-dry.',
          'Remove all squishy translucent leaves to prevent fungal infection from traveling to the main stem.',
          'Ensure the pot has drainage holes and place in 5-6 hours of bright light.',
        ],
      },
    },
    {
      id: 'succulent_shriveled',
      label: 'Wrinkled, dull and puckered leaves',
      description: 'Foliage feels soft, deflated and shows fine creases along the surface.',
      result: {
        title: 'Dehydration & Moisture Deficit',
        botanicalTerm: 'Dehydratio parenchyma',
        severity: 'mild',
        cause:
          'The succulent has depleted its stored water reserves during prolonged drought.',
        steps: [
          'Perform a thorough bottom-soak: place pot in a bowl with 2 inches of water for 25 minutes.',
          'Allow excess water to drain completely from bottom holes before placing back.',
          'Leaves will reinflate plump and firm within 24-48 hours.',
        ],
      },
    },
  ],
  'seeds_leaves': [
    {
      id: 'seedling_damping_off',
      label: 'Delicate seedlings collapsing at soil line overnight',
      description: 'Stems pinch thin like thread at soil level and fall flat.',
      result: {
        title: 'Seedling Damping-Off Fungus',
        botanicalTerm: 'Rhizoctonia & Pythium ultimum',
        severity: 'critical',
        cause:
          'High humidity, stagnant air, and overly wet seed-starting medium created ideal fungal conditions.',
        steps: [
          'Remove collapsed seedlings immediately to prevent fungal mycelium spread.',
          'Improve cross-ventilation with a gentle fan or open window.',
          'Dust remaining seed trays with organic Ceylon cinnamon powder.',
          'Water only from below or mist gently from a distance; never saturate seed trays.',
        ],
      },
    },
    {
      id: 'seedling_leggy_pale',
      label: 'Seedlings tall, spindly, pale and bending sideways',
      description: 'Stems are 3-4 inches tall with only 2 tiny leaves, leaning towards the light.',
      result: {
        title: 'Etiolation & Insufficient Sunlight',
        botanicalTerm: 'Etiolatio vegetativa',
        severity: 'moderate',
        cause:
          'Young sprouts are frantically stretching internodes to locate brighter photosynthetic photons.',
        steps: [
          'Move seed tray to your brightest sunlit windowsill or outdoor sheltered balcony immediately.',
          'Rotate the tray 180 degrees daily so seedlings straighten up.',
          'Gently mound extra organic cocopeat around the tall stems to provide structural anchoring.',
        ],
      },
    },
  ],
  'default': [
    {
      id: 'general_yellowing',
      label: 'Generalized pale yellow leaves throughout specimen',
      description: 'Entire plant appears light green or chlorotic with stalled growth.',
      result: {
        title: 'Nitrogen & Organic Nutrient Deficiency',
        botanicalTerm: 'Chlorosis nutritionalis',
        severity: 'moderate',
        cause:
          'Potting soil nutrients have been exhausted by root uptake or washed out through repeated waterings.',
        steps: [
          'Top-dress the root zone with 2-3 tablespoons of well-aged organic vermicompost.',
          'Water gently with diluted organic seaweed extract or compost tea.',
          'Resume natural growth cycle with bright indirect sunlight.',
        ],
      },
    },
  ],
}

export function PlantDoctorDiagnosticWizard() {
  const [step, setStep] = useState<number>(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('indoor')
  const [selectedPart, setSelectedPart] = useState<string>('leaves')
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomOption | null>(null)

  // Retrieve matching symptom options based on Category & Affected Part
  const lookupKey = `${selectedCategory}_${selectedPart}`
  const availableSymptoms = DIAGNOSTIC_DATABASE[lookupKey] || DIAGNOSTIC_DATABASE['indoor_leaves'] || DIAGNOSTIC_DATABASE['default']

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey)
    setStep(2)
  }

  const handlePartSelect = (partKey: string) => {
    setSelectedPart(partKey)
    setStep(3)
  }

  const handleSymptomSelect = (option: SymptomOption) => {
    setSelectedSymptom(option)
    setStep(4)
  }

  const handleReset = () => {
    setStep(1)
    setSelectedCategory('indoor')
    setSelectedPart('leaves')
    setSelectedSymptom(null)
  }

  const scrollToBooking = () => {
    const el = document.getElementById('consultation-booking')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.wizardCard}>
      {/* Visual Step Tracker */}
      <div className={styles.stepIndicator} aria-label="Diagnostic Wizard Progress">
        <div className={styles.stepProgressTrack}>
          <div
            className={styles.stepProgressBar}
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>

        <div className={styles.stepNode}>
          <div className={`${styles.stepCircle} ${step >= 1 ? (step > 1 ? styles.stepCircleDone : styles.stepCircleActive) : ''}`}>
            {step > 1 ? <CheckCircle2 size={18} /> : '1'}
          </div>
          <span className={`${styles.stepLabel} ${step === 1 ? styles.stepLabelActive : ''}`}>Plant Type</span>
        </div>

        <div className={styles.stepNode}>
          <div className={`${styles.stepCircle} ${step >= 2 ? (step > 2 ? styles.stepCircleDone : styles.stepCircleActive) : ''}`}>
            {step > 2 ? <CheckCircle2 size={18} /> : '2'}
          </div>
          <span className={`${styles.stepLabel} ${step === 2 ? styles.stepLabelActive : ''}`}>Affected Part</span>
        </div>

        <div className={styles.stepNode}>
          <div className={`${styles.stepCircle} ${step >= 3 ? (step > 3 ? styles.stepCircleDone : styles.stepCircleActive) : ''}`}>
            {step > 3 ? <CheckCircle2 size={18} /> : '3'}
          </div>
          <span className={`${styles.stepLabel} ${step === 3 ? styles.stepLabelActive : ''}`}>Symptom</span>
        </div>

        <div className={styles.stepNode}>
          <div className={`${styles.stepCircle} ${step === 4 ? styles.stepCircleActive : ''}`}>
            4
          </div>
          <span className={`${styles.stepLabel} ${step === 4 ? styles.stepLabelActive : ''}`}>Prescription</span>
        </div>
      </div>

      {/* STEP 1: Select Plant Category */}
      {step === 1 && (
        <div>
          <h3 className={styles.wizardQuestion}>Step 1: Which plant is showing signs of distress?</h3>
          <div className={styles.optionsGrid} role="radiogroup" aria-label="Select Plant Category">
            <button
              type="button"
              className={`${styles.optionButton} ${selectedCategory === 'indoor' ? styles.optionButtonActive : ''}`}
              onClick={() => handleCategorySelect('indoor')}
              aria-label="Indoor Foliage Plants"
            >
              <div className={styles.optionIconWrapper}>
                <Leaf size={22} />
              </div>
              <h4 className={styles.optionTitle}>Indoor Foliage Plants</h4>
              <p className={styles.optionDesc}>Monstera, Snake Plant, Areca Palm, ZZ Plant, Money Plant, Ferns.</p>
            </button>

            <button
              type="button"
              className={`${styles.optionButton} ${selectedCategory === 'succulent' ? styles.optionButtonActive : ''}`}
              onClick={() => handleCategorySelect('succulent')}
              aria-label="Succulents & Cacti"
            >
              <div className={styles.optionIconWrapper}>
                <Sun size={22} />
              </div>
              <h4 className={styles.optionTitle}>Succulents &amp; Cacti</h4>
              <p className={styles.optionDesc}>Jade Plant, Haworthia, Aloe Vera, Echeveria, Sansevieria dwarf.</p>
            </button>

            <button
              type="button"
              className={`${styles.optionButton} ${selectedCategory === 'seeds' ? styles.optionButtonActive : ''}`}
              onClick={() => handleCategorySelect('seeds')}
              aria-label="Vegetable & Seedling Starts"
            >
              <div className={styles.optionIconWrapper}>
                <Sprout size={22} />
              </div>
              <h4 className={styles.optionTitle}>Desi Seeds &amp; Seedlings</h4>
              <p className={styles.optionDesc}>Sprouting vegetables, culinary herbs, kitchen garden trays.</p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Affected Plant Area */}
      {step === 2 && (
        <div>
          <h3 className={styles.wizardQuestion}>Step 2: Where are the symptoms appearing?</h3>
          <div className={styles.optionsGrid} role="radiogroup" aria-label="Select Affected Plant Area">
            <button
              type="button"
              className={`${styles.optionButton} ${selectedPart === 'leaves' ? styles.optionButtonActive : ''}`}
              onClick={() => handlePartSelect('leaves')}
              aria-label="Leaves and Foliage"
            >
              <div className={styles.optionIconWrapper}>
                <Leaf size={22} />
              </div>
              <h4 className={styles.optionTitle}>Leaves &amp; Foliage</h4>
              <p className={styles.optionDesc}>Yellowing, brown crisp tips, translucent spots, drooping or curling.</p>
            </button>

            <button
              type="button"
              className={`${styles.optionButton} ${selectedPart === 'stems_roots' ? styles.optionButtonActive : ''}`}
              onClick={() => handlePartSelect('stems_roots')}
              aria-label="Stems and Roots"
            >
              <div className={styles.optionIconWrapper}>
                <Droplets size={22} />
              </div>
              <h4 className={styles.optionTitle}>Stems &amp; Roots</h4>
              <p className={styles.optionDesc}>Soft mushy stem base, root odor, leggy stretching or collapsing.</p>
            </button>

            <button
              type="button"
              className={`${styles.optionButton} ${selectedPart === 'bugs' ? styles.optionButtonActive : ''}`}
              onClick={() => handlePartSelect('bugs')}
              aria-label="Pests and Bugs"
            >
              <div className={styles.optionIconWrapper}>
                <Bug size={22} />
              </div>
              <h4 className={styles.optionTitle}>Pests &amp; Residue</h4>
              <p className={styles.optionDesc}>White cotton fuzz, tiny spider webs, sticky spots, flying gnats.</p>
            </button>
          </div>

          <div className={styles.wizardActions}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.resetBtn}
            >
              ← Back to Plant Type
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Observed Symptom */}
      {step === 3 && (
        <div>
          <h3 className={styles.wizardQuestion}>Step 3: What does the symptom look like?</h3>
          <div className={styles.optionsGrid} role="radiogroup" aria-label="Select Observed Symptom">
            {availableSymptoms.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.optionButton}
                onClick={() => handleSymptomSelect(option)}
                aria-label={option.label}
              >
                <div className={styles.optionIconWrapper}>
                  <AlertTriangle size={22} />
                </div>
                <h4 className={styles.optionTitle}>{option.label}</h4>
                <p className={styles.optionDesc}>{option.description}</p>
              </button>
            ))}
          </div>

          <div className={styles.wizardActions}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={styles.resetBtn}
            >
              ← Back to Affected Part
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Diagnosis & Horticultural Prescription */}
      {step === 4 && selectedSymptom && (
        <div className={styles.diagnosisBox}>
          <div className={styles.diagnosisTop}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={20} color="var(--ugaoo-green)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ugaoo-green)' }}>
                  Certified Pune Nursery Diagnosis
                </span>
              </div>
              <h3 className={styles.diagnosisIssueTitle}>{selectedSymptom.result.title}</h3>
              <span className={styles.diagnosisBotanicalTerm}>{selectedSymptom.result.botanicalTerm}</span>
            </div>

            <div>
              <span
                className={`${styles.severityPill} ${
                  selectedSymptom.result.severity === 'critical'
                    ? styles.severityCritical
                    : selectedSymptom.result.severity === 'moderate'
                    ? styles.severityModerate
                    : styles.severityMild
                }`}
              >
                Severity: {selectedSymptom.result.severity.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Root Cause from Agronomist */}
          <div className={styles.diagnosisCauseBox}>
            <h4 className={styles.diagnosisCauseHeading}>
              <span>🌱 Root Cause Analysis:</span>
            </h4>
            <p className={styles.diagnosisCauseText}>{selectedSymptom.result.cause}</p>
          </div>

          {/* Step-by-Step Care Protocol */}
          <div>
            <h4 className={styles.prescriptionHeading}>Step-by-Step Organic Care Protocol:</h4>
            <ol className={styles.prescriptionSteps}>
              {selectedSymptom.result.steps.map((st, idx) => (
                <li key={idx} className={styles.stepItem}>
                  <span className={styles.stepNumber}>{idx + 1}</span>
                  <p className={styles.stepText}>{st}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Row */}
          <div className={styles.wizardActions}>
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetBtn}
              aria-label="Start New Plant Diagnosis"
            >
              <RotateCcw size={16} />
              Start New Diagnosis
            </button>

            <button
              type="button"
              onClick={scrollToBooking}
              className={styles.consultDoctorActionBtn}
              aria-label="Book 1-on-1 Agronomist Consultation for this Issue"
            >
              <Calendar size={18} />
              Book 1-on-1 Agronomist Call
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
