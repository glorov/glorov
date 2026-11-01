'use client'

import React, { useState } from 'react'
import {
  Check,
  Leaf,
  Sprout,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './SubscriptionsPage.module.css'

interface PlanDefinition {
  id: string
  name: string
  tagline: string
  baseMonthlyPrice: number
  popular: boolean
  icon: React.ElementType
  features: string[]
}

const SUBSCRIPTION_PLANS: PlanDefinition[] = [
  {
    id: 'indoor_sanctuary',
    name: 'The Indoor Sanctuary Box',
    tagline: 'Curated low-light nursery foliage conditioned for urban living.',
    baseMonthlyPrice: 799,
    popular: true,
    icon: Leaf,
    features: [
      '1 Live Air-Purifying Plant (Potted in organic coco-peat)',
      '2 Packets of Heirloom Botanical Seeds (Flower/Herb)',
      'Monthly Pune Mother Nursery Horticultural Care Guide',
      'VIP WhatsApp Plant Doctor Access',
      '48-Hour Live Plant Arrival Guarantee',
    ],
  },
  {
    id: 'kitchen_garden',
    name: 'Desi Kitchen Sowing Club',
    tagline: 'Farm-to-table organic edibles & seasonal heirloom vegetable seeds.',
    baseMonthlyPrice: 549,
    popular: false,
    icon: Sprout,
    features: [
      '4 Packets of Desi Heirloom Seeds (Tomato, Palak, Mirchi, Methi)',
      '4 Compressed Organic Coir Germination Disks',
      'Wooden Plant Markers & Sowing Schedule',
      '0% GST Certified Organic Seeds (HSN 1209)',
      'Germination Replacement Guarantee',
    ],
  },
  {
    id: 'rare_araceae',
    name: 'Exotic & Rare Collector Box',
    tagline: 'Coveted botanical specimens for passionate urban plant collectors.',
    baseMonthlyPrice: 1299,
    popular: false,
    icon: Sparkles,
    features: [
      '1 Rare Potted Nursery Specimen (Philodendron, Syngonium, Monstera)',
      'Numbered Mother Nursery Botanical Passport & Origin Log',
      'Handcrafted Organic Nutrient Medium',
      '1-on-1 Agronomist Video Guidance',
      'Free Express Botanical Air Dispatch',
    ],
  },
]

export function SubscriptionPlanPicker() {
  const [durationMonths, setDurationMonths] = useState<number>(3)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('indoor_sanctuary')
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [subscribedMessage, setSubscribedMessage] = useState<string | null>(null)
  const { addToCart, openDrawer } = useCart()

  // Discount matrix: 1 mo = 0%, 3 mo = 10% off, 6 mo = 20% off
  const discountRate = durationMonths === 6 ? 0.2 : durationMonths === 3 ? 0.1 : 0
  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0]

  const calculateMonthlyPrice = (basePrice: number) => {
    return Math.round(basePrice * (1 - discountRate))
  }

  const selectedMonthlyPrice = calculateMonthlyPrice(selectedPlan.baseMonthlyPrice)
  const totalCommitment = selectedMonthlyPrice * durationMonths

  const handleSubscribe = async () => {
    setIsAdding(true)
    setSubscribedMessage(null)

    try {
      if (addToCart) {
        // Add to cart with simulated subscription variant ID
        const variantId = `variant_sub_${selectedPlan.id}_${durationMonths}m`
        await addToCart(variantId, 1)
        if (openDrawer) {
          openDrawer()
        }
      }

      setSubscribedMessage(
        `Added ${selectedPlan.name} (${durationMonths}-Month Plan at ₹${selectedMonthlyPrice}/mo) to your cart!`
      )
    } catch {
      setSubscribedMessage(`Added ${selectedPlan.name} to cart.`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className={styles.planPickerCard} id="plan-selection">
      {/* Duration Switcher Tabs */}
      <div className={styles.durationSwitcher} role="tablist" aria-label="Subscription Duration Selection">
        <button
          type="button"
          role="tab"
          aria-selected={durationMonths === 1}
          className={`${styles.durationBtn} ${durationMonths === 1 ? styles.durationBtnActive : ''}`}
          onClick={() => setDurationMonths(1)}
        >
          <span>1 Month (Monthly Billed)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={durationMonths === 3}
          className={`${styles.durationBtn} ${durationMonths === 3 ? styles.durationBtnActive : ''}`}
          onClick={() => setDurationMonths(3)}
        >
          <span>3 Months Pre-Paid</span>
          <span className={styles.durationDiscountBadge}>SAVE 10%</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={durationMonths === 6}
          className={`${styles.durationBtn} ${durationMonths === 6 ? styles.durationBtnActive : ''}`}
          onClick={() => setDurationMonths(6)}
        >
          <span>6 Months Pre-Paid</span>
          <span className={styles.durationDiscountBadge}>SAVE 20%</span>
        </button>
      </div>

      {/* Plans Comparison Grid */}
      <div className={styles.plansGrid} role="radiogroup" aria-label="Available Subscription Plans">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id
          const Icon = plan.icon
          const monthlyPrice = calculateMonthlyPrice(plan.baseMonthlyPrice)
          const hasDiscount = discountRate > 0

          return (
            <div
              key={plan.id}
              className={`${styles.planCard} ${isSelected ? styles.planCardActive : ''}`}
              onClick={() => setSelectedPlanId(plan.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  setSelectedPlanId(plan.id)
                }
              }}
            >
              {plan.popular && <span className={styles.popularBadge}>Most Loved</span>}

              <div className={styles.planHeader}>
                <div className={styles.planIconWrapper}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planTagline}>{plan.tagline}</p>
              </div>

              <div className={styles.planPriceBox}>
                <span className={styles.planPriceCurrency}>₹</span>
                <span className={styles.planPriceAmount}>{monthlyPrice}</span>
                <span className={styles.planPricePeriod}>/mo</span>
                {hasDiscount && (
                  <span className={styles.planOriginalPrice}>₹{plan.baseMonthlyPrice}</span>
                )}
              </div>

              <ul className={styles.planFeaturesList}>
                {plan.features.map((feat, idx) => (
                  <li key={idx} className={styles.planFeatureItem}>
                    <Check size={16} className={styles.featureCheckIcon} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`${styles.planSelectBtn} ${
                  isSelected ? styles.planSelectBtnActive : styles.planSelectBtnInactive
                }`}
                aria-label={`Select ${plan.name}`}
              >
                {isSelected ? (
                  <>
                    <Check size={18} />
                    Selected Plan
                  </>
                ) : (
                  'Choose Plan'
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Subscription Summary & Action Bar */}
      <div className={styles.subscriptionActionBar}>
        <div className={styles.summaryDetails}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Calendar size={18} color="var(--ugaoo-green)" />
            <h4 className={styles.summaryTitle}>
              {selectedPlan.name} • {durationMonths}-Month Ritual
            </h4>
          </div>
          <p className={styles.summarySubtitle}>
            Total: <strong>₹{totalCommitment}</strong> (billed upfront) • Dispatched fresh on the 1st of every month from Pune Mother Nursery.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubscribe}
          disabled={isAdding}
          className={styles.subscribeNowBtn}
          aria-label={`Subscribe to ${selectedPlan.name} for ${durationMonths} months`}
        >
          <ShoppingBag size={20} />
          {isAdding ? 'Adding Ritual...' : 'Subscribe & Add to Cart'}
        </button>
      </div>

      {/* Success Notification Feedback */}
      {subscribedMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: '#def7ec',
            color: '#03543f',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={18} />
          <span>{subscribedMessage}</span>
        </div>
      )}
    </div>
  )
}
