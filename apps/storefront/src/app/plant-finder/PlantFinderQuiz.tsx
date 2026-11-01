'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShoppingBag,
  Droplets,
  ShieldCheck,
  RefreshCw,
  Home,
  Briefcase,
  Sprout,
  Leaf,
  PawPrint,
  Wind,
  Flower2,
  Salad,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import styles from './PlantFinder.module.css'

interface QuizAnswers {
  placement: string
  experience: string
  safety: string
  goal: string
}

interface PlantRecommendation {
  id: string
  title: string
  handle: string
  category: string
  matchPercentage: number
  pricePaise: number
  variantId: string
  image: string
  sunlight: string
  watering: string
  reason: string
}

const QUESTIONS = [
  {
    step: 1,
    title: 'Where will your botanical specimen live?',
    description: 'Select the primary lighting condition and room type where the plant will be placed.',
    options: [
      {
        id: 'bright-indirect',
        label: 'Bright Indirect Sunlight',
        subtext: 'Living rooms or balconies with plenty of gentle natural light but no harsh burning rays.',
        icon: Sun,
      },
      {
        id: 'low-light',
        label: 'Low Ambient Natural Light',
        subtext: 'Bedrooms, hallways, or bathrooms with small windows or filtered indirect light.',
        icon: Moon,
      },
      {
        id: 'direct-sun',
        label: 'Open Direct Sunlight',
        subtext: 'Sunny open balconies, terraces, or sills with 4–6+ hours of intense Indian sunshine.',
        icon: Sun,
      },
      {
        id: 'office-desk',
        label: 'Workstation / Desk Lights',
        subtext: 'Indoor offices and workstations illuminated primarily by ceiling LED or fluorescent lights.',
        icon: Briefcase,
      },
    ],
  },
  {
    step: 2,
    title: 'What is your gardening schedule & experience?',
    description: 'Be honest about how often you remember to hydrate and care for your green companions.',
    options: [
      {
        id: 'beginner',
        label: 'Complete First-Timer',
        subtext: 'I want an ultra-forgiving plant that can bounce back easily if I make small mistakes.',
        icon: Sprout,
      },
      {
        id: 'busy-traveler',
        label: 'Busy / Frequent Traveler',
        subtext: 'I often travel or forget to water. I need a specimen that can survive 10–14 days unattended.',
        icon: ShieldCheck,
      },
      {
        id: 'daily-nurturer',
        label: 'Hands-On Plant Parent',
        subtext: 'I love observing new shoots, wiping leaves, misting foliage, and regular horticultural care.',
        icon: Droplets,
      },
      {
        id: 'seed-sower',
        label: 'Heirloom Seed Sower',
        subtext: 'I am excited about germinating desi organic seeds and harvesting fresh homegrown herbs.',
        icon: Salad,
      },
    ],
  },
  {
    step: 3,
    title: 'Any specific safety or environmental preferences?',
    description: 'Tell us if you have pets or specific air quality requirements.',
    options: [
      {
        id: 'air-purifying',
        label: 'Active Air Purification',
        subtext: 'NASA-recommended botanicals proven to absorb toxic VOCs, benzene, and carbon dioxide.',
        icon: Wind,
      },
      {
        id: 'pet-friendly',
        label: 'Pet & Child Safe',
        subtext: '100% non-toxic foliage safe around curious dogs, cats, and toddlers.',
        icon: PawPrint,
      },
      {
        id: 'hardy-climate',
        label: 'Indian Climate Resilient',
        subtext: 'Conditioned in our Pune nursery to endure summer dry spells and monsoon humidity.',
        icon: Leaf,
      },
      {
        id: 'compact-footprint',
        label: 'Compact Footprint',
        subtext: 'Fits easily on narrow window sills, bedside tables, or compact desk spaces.',
        icon: Home,
      },
    ],
  },
  {
    step: 4,
    title: 'What is your ultimate gardening ambition?',
    description: 'What feeling or outcome do you want your new living addition to cultivate?',
    options: [
      {
        id: 'clean-air',
        label: 'Fresh & Clean Breathing Air',
        subtext: 'Breathe cleaner indoor oxygen while working, resting, and sleeping.',
        icon: Wind,
      },
      {
        id: 'lush-jungle',
        label: 'Lush Tropical Aesthetics',
        subtext: 'Bring vibrant cascading emerald foliage into my modern home interior.',
        icon: Leaf,
      },
      {
        id: 'kitchen-edible',
        label: 'Homegrown Desi Harvest',
        subtext: 'Cultivate fresh desi herbs and organic kitchen vegetables from heirloom seeds.',
        icon: Salad,
      },
      {
        id: 'zen-wellness',
        label: 'Mindful Stress Relief & Zen',
        subtext: 'Create a calming sanctuary of natural tranquility to unwind after long work days.',
        icon: Flower2,
      },
    ],
  },
]

export function PlantFinderQuiz() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<QuizAnswers>({
    placement: 'bright-indirect',
    experience: 'beginner',
    safety: 'air-purifying',
    goal: 'clean-air',
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({})

  const { addToCart, openDrawer } = useCart()

  const currentQuestion = QUESTIONS[currentStep - 1]
  const currentKey =
    currentStep === 1
      ? 'placement'
      : currentStep === 2
      ? 'experience'
      : currentStep === 3
      ? 'safety'
      : 'goal'

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentKey]: optionId,
    }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleRestart = () => {
    setCurrentStep(1)
    setIsCompleted(false)
  }

  const handleAddToCart = async (plant: PlantRecommendation) => {
    if (addingId) return
    setAddingId(plant.id)
    try {
      const ok = await addToCart(plant.variantId, 1)
      if (ok) {
        setAddedIds((prev) => ({ ...prev, [plant.id]: true }))
        openDrawer()
        setTimeout(() => {
          setAddedIds((prev) => ({ ...prev, [plant.id]: false }))
        }, 2200)
      }
    } catch (e) {
      console.error('Failed to add matched plant to cart:', e)
    } finally {
      setAddingId(null)
    }
  }

  // Intelligent Recommendation matching logic based on user inputs
  const getRecommendations = (): PlantRecommendation[] => {
    const { placement, experience, goal } = answers

    // If user loves sowing seeds or edible harvest
    if (experience === 'seed-sower' || goal === 'kitchen-edible') {
      return [
        {
          id: 'prod_tulsi_seeds',
          title: 'Desi Krishna Tulsi Seeds',
          handle: 'desi-krishna-tulsi-seeds',
          category: 'Medicinal Herb Seeds (0% GST)',
          matchPercentage: 99,
          pricePaise: 14900,
          variantId: 'var_tulsi_01',
          image: '/ugaoo-assets/cat-seeds.webp',
          sunlight: 'Bright / Direct Sun',
          watering: 'Moderate (Every 2-3 Days)',
          reason:
            'Matches your desire for an authentic Ayurvedic kitchen garden. High germination heirloom batch tested in Pune.',
        },
        {
          id: 'prod_peace_lily',
          title: 'Peace Lily Plant',
          handle: 'peace-lily-plant',
          category: 'Live Flowering Plant',
          matchPercentage: 94,
          pricePaise: 49900,
          variantId: 'var_lily_01',
          image: '/ugaoo-assets/cat-plants.webp',
          sunlight: 'Bright Indirect',
          watering: 'Weekly (Finger Test)',
          reason:
            'Provides tranquil companion greenery with moisture-shield delivery straight from our Pune nursery.',
        },
        {
          id: 'prod_jade_plant',
          title: 'Crassula Green Jade Plant',
          handle: 'crassula-green-jade-plant',
          category: 'Resilient Succulent',
          matchPercentage: 91,
          pricePaise: 39900,
          variantId: 'var_jade_01',
          image: '/ugaoo-assets/farm-1.webp',
          sunlight: 'Partial Sun',
          watering: 'Low (Every 8-10 Days)',
          reason:
            'A symbol of prosperity that thrives effortlessly on sunny window sills with minimal maintenance.',
        },
      ]
    }

    // If low light or office desk
    if (placement === 'low-light' || placement === 'office-desk') {
      return [
        {
          id: 'prod_snake_plant',
          title: 'Sansevieria Golden Hahnii (Snake Plant)',
          handle: 'sansevieria-golden-hahnii-snake-plant',
          category: 'Indoor Air-Purifying Plant',
          matchPercentage: 98,
          pricePaise: 44900,
          variantId: 'var_snake_01',
          image: '/ugaoo-assets/cat-plants.webp',
          sunlight: 'Low to Ambient Light',
          watering: 'Every 10-14 Days',
          reason:
            'Indestructible foliage that releases oxygen at night and thrives under fluorescent workstation lights.',
        },
        {
          id: 'prod_money_plant',
          title: 'Golden Pothos Money Plant',
          handle: 'golden-pothos-money-plant',
          category: 'Trailing Foliage',
          matchPercentage: 95,
          pricePaise: 34900,
          variantId: 'var_pothos_01',
          image: '/ugaoo-assets/space-living.webp',
          sunlight: 'Low to Medium Light',
          watering: 'Weekly',
          reason:
            'Grows lush cascading emerald vines even in ambient light with minimal attention.',
        },
        {
          id: 'prod_peace_lily',
          title: 'Peace Lily Plant',
          handle: 'peace-lily-plant',
          category: 'NASA Air-Purifier',
          matchPercentage: 91,
          pricePaise: 49900,
          variantId: 'var_lily_01',
          image: '/ugaoo-assets/cat-plants.webp',
          sunlight: 'Filtered Light',
          watering: 'When Topsoil Dries',
          reason:
            'White sculptural blooms that actively filter airborne impurities and indicate clearly when thirsty.',
        },
      ]
    }

    // Default: Bright Indirect / Tropical Home
    return [
      {
        id: 'prod_peace_lily',
        title: 'Peace Lily Plant',
        handle: 'peace-lily-plant',
        category: 'Live Indoor Botanical',
        matchPercentage: 98,
        pricePaise: 49900,
        variantId: 'var_lily_01',
        image: '/ugaoo-assets/cat-plants.webp',
        sunlight: 'Bright Indirect Light',
        watering: 'When Topsoil Dries',
        reason:
          'Perfect match for bright living spaces. NASA certified air cleaner with elegant perennial white bracts.',
      },
      {
        id: 'prod_snake_plant',
        title: 'Sansevieria Green Futura',
        handle: 'sansevieria-green-futura',
        category: 'Zero-Maintenance Botanical',
        matchPercentage: 95,
        pricePaise: 49900,
        variantId: 'var_snake_01',
        image: '/ugaoo-assets/space-bedroom.webp',
        sunlight: 'Any Light Condition',
        watering: 'Every 12 Days',
        reason:
          'Architectural upright sword leaves that filter carbon monoxide and require virtually zero attention.',
      },
      {
        id: 'prod_tulsi_seeds',
        title: 'Desi Krishna Tulsi Seeds',
        handle: 'desi-krishna-tulsi-seeds',
        category: 'Sacred Heirloom Seeds',
        matchPercentage: 92,
        pricePaise: 14900,
        variantId: 'var_tulsi_01',
        image: '/ugaoo-assets/cat-seeds.webp',
        sunlight: 'Bright Sun / Morning Light',
        watering: 'Regular Hydration',
        reason:
          'Infuse your home with natural aromatic vitality and therapeutic desi herb vitality.',
      },
    ]
  }

  // --- RESULTS VIEW ---
  if (isCompleted) {
    const recommendations = getRecommendations()

    return (
      <div role="region" aria-label="Botanical Match Results">
        <div className={styles.resultsHeader}>
          <div className={styles.matchPill}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Tailored Horticultural Match</span>
          </div>
          <h2 className={styles.resultsTitle}>Your Ideal Botanical Companions</h2>
          <p className={styles.resultsSubtitle}>
            Based on your living space, lighting profile, and care preferences, our Pune nursery horticulturists have curated the top 3 botanical specimens guaranteed to thrive in your home.
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className={styles.restartBtn}
            aria-label="Retake the plant finder quiz"
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>Retake Plant Finder Quiz</span>
          </button>
        </div>

        <div className={styles.matchesGrid}>
          {recommendations.map((plant) => {
            const isAdding = addingId === plant.id
            const isAdded = !!addedIds[plant.id]

            return (
              <div key={plant.id} className={styles.matchCard}>
                <span className={styles.matchPercentageBadge}>
                  {plant.matchPercentage}% Match
                </span>

                <div className={styles.matchImageWrap}>
                  <Image
                    src={plant.image}
                    alt={plant.title}
                    fill
                    sizes="(max-width: 680px) 100vw, (max-width: 960px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className={styles.matchCardBody}>
                  <span className={styles.matchCategory}>{plant.category}</span>
                  <Link href={`/products/${plant.handle}`} className={styles.matchTitle}>
                    {plant.title}
                  </Link>

                  <p className={styles.matchReason}>{plant.reason}</p>

                  <div className={styles.matchSpecsRow}>
                    <span className={styles.specChip}>
                      <Sun size={12} aria-hidden="true" />
                      <span>{plant.sunlight}</span>
                    </span>
                    <span className={styles.specChip}>
                      <Droplets size={12} aria-hidden="true" />
                      <span>{plant.watering}</span>
                    </span>
                  </div>

                  <div className={styles.matchPriceRow}>
                    <span className={styles.matchPrice}>{formatINR(plant.pricePaise)}</span>
                    <span className={styles.taxIncluded}>Inclusive of all taxes</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(plant)}
                      disabled={isAdding || isAdded}
                      className={`${styles.matchCtaBtn} ${isAdded ? styles.matchAddedNotice : ''}`}
                      aria-label={`Add matched ${plant.title} to cart`}
                      style={{ flex: 1 }}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          <span>Adding...</span>
                        </>
                      ) : isAdded ? (
                        <>
                          <Check size={16} aria-hidden="true" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} aria-hidden="true" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // --- QUIZ QUESTIONS STEPPER VIEW ---
  const selectedValue = answers[currentKey]
  const progressPercent = Math.round((currentStep / 4) * 100)

  return (
    <div className={styles.quizCard} role="region" aria-label="Plant Finder Question Step">
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressLabelRow}>
          <span>Question {currentStep} of 4</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className={styles.progressBarBg}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Details */}
      <div className={styles.questionArea}>
        <h2 className={styles.questionTitle}>{currentQuestion.title}</h2>
        <p className={styles.questionDescription}>{currentQuestion.description}</p>

        {/* Options */}
        <div className={styles.optionsGrid} role="radiogroup" aria-label={currentQuestion.title}>
          {currentQuestion.options.map((opt) => {
            const Icon = opt.icon
            const isSelected = selectedValue === opt.id

            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelectOption(opt.id)}
                className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
              >
                <div className={styles.optionIconWrap}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div className={styles.optionTextWrap}>
                  <p className={styles.optionLabel}>{opt.label}</p>
                  <p className={styles.optionSubtext}>{opt.subtext}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.buttonRow}>
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className={styles.backBtn}
            aria-label="Previous question"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          className={styles.nextBtn}
          aria-label={currentStep === 4 ? 'See My Botanical Matches' : 'Next Question'}
        >
          <span>{currentStep === 4 ? 'See My Botanical Matches' : 'Next Question'}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
