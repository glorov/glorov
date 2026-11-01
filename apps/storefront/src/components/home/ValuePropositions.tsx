'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Sparkles, MapPin, ThermometerSnowflake } from 'lucide-react'
import { OfferBanner } from './OfferBanner'
import styles from './ValuePropositions.module.css'

// Built-in Custom Botanical Line-Art SVG Icons (Matching User Reference Image)
const OrganicShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const TransitTruckIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const SupportHandIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 15h6a3 3 0 0 1 3 3v2" />
    <path d="M7 14l2-4a2 2 0 0 1 2.5-1l2 .8a2 2 0 0 1 1.2 2.2L14 17" />
    <path d="M17 6c0-2.2 1.8-4 4-4 0 2.2-1.8 4-4 4z" />
    <path d="M17 6c0 2.2-1.8 4-4 4 0-2.2 1.8-4 4-4z" />
    <path d="M17 6v5" />
  </svg>
)

const EcoLeafIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
)

const FertilizedSoilIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10v6" />
    <path d="M9 13c0-2.5 3-4 3-4s3 1.5 3 4" />
    <path d="M12 12c-2-1.5-4 0-4 2" />
    <circle cx="12" cy="16" r="5" strokeDasharray="1.5 2" />
    <path d="M5 20c1.5-1 3.5-1 5 0 1.5-1 3.5-1 5 0 1.5-1 3.5-1 5 0" />
  </svg>
)

const PottedPlantIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 13h10l-1.2 8H8.2L7 13z" />
    <path d="M6 13h12" />
    <path d="M12 13V8" />
    <path d="M12 9c-2-3-6-2-6 1 2 1 5 0 6-1z" />
    <path d="M12 8c2-3 6-2 6 1-2 1-5 0-6-1z" />
  </svg>
)

const ReplacementArrowsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
)

const SupportChatIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M9.5 11.5c.5 1 1.5 2 2.5 2.5l1.2-1.2a1 1 0 0 1 1-.2c1 .4 2 .5 3 .5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1C11.5 17.1 6.9 12.5 6.9 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1c0 1 .1 2 .5 3a1 1 0 0 1-.2 1l-1.2 1.2z" />
  </svg>
)

const ICON_MAP: Record<string, React.ReactNode> = {
  'organic-shield': <OrganicShieldIcon />,
  'transit-truck': <TransitTruckIcon />,
  'support-hand': <SupportHandIcon />,
  'eco-leaf': <EcoLeafIcon />,
  'fertilized-soil': <FertilizedSoilIcon />,
  'potted-plant': <PottedPlantIcon />,
  'replacement-arrows': <ReplacementArrowsIcon />,
  'support-chat': <SupportChatIcon />,
}

interface TrustRibbonItem {
  id: string
  title: string
  subtitle?: string
  icon_key: string
  cta_route?: string
  custom_icon_svg?: string
}

interface TrustSettings {
  bg_color: string
  text_color: string
  icon_bg_color: string
  icon_color: string
  divider_color: string
  border_radius: number
  is_visible: boolean
}

const DEFAULT_RIBBON_ITEMS: TrustRibbonItem[] = [
  {
    id: 'organic',
    title: '100% Organic & Non-GMO',
    subtitle: 'Open-pollinated, chemical-free heirloom seeds tested for 98%+ germination vigor.',
    icon_key: 'organic-shield',
    cta_route: '/categories/seeds',
  },
  {
    id: 'transit',
    title: 'Safe Transit Guarantee',
    subtitle: 'Custom ventilated botanical packaging ensures live houseplants arrive lush and shock-free.',
    icon_key: 'transit-truck',
    cta_route: '/policies/shipping-policy',
  },
  {
    id: 'support',
    title: 'Lifetime Plant Support',
    subtitle: 'Our in-house botanists guide your potting, watering, and harvesting every step of the way.',
    icon_key: 'support-hand',
    cta_route: '/plant-doctor',
  },
  {
    id: 'eco',
    title: 'Eco-Friendly Philosophy',
    subtitle: 'Biodegradable seed sleeves, plastic-free shipping containers, and sustainable coco-coir.',
    icon_key: 'eco-leaf',
    cta_route: '/about',
  },
]

const DEFAULT_SETTINGS: TrustSettings = {
  bg_color: '#1B4332',
  text_color: '#FFFFFF',
  icon_bg_color: '#FFFFFF',
  icon_color: '#1B4332',
  divider_color: 'rgba(255, 255, 255, 0.22)',
  border_radius: 20,
  is_visible: true,
}

// 4 Quality Pillars (The GLOROV Standard)
const VALUES = [
  {
    icon: ThermometerSnowflake,
    title: 'Climate-Hardened Nursery Plants',
    description:
      'Our live plants undergo outdoor hardening in Indian temperature cycles before transit, reducing shock upon arrival.',
  },
  {
    icon: Sparkles,
    title: 'High-Viability Desi Seeds',
    description:
      'Carefully harvested and stored Indian heirloom seeds calibrated for domestic home gardening across seasons.',
  },
  {
    icon: MapPin,
    title: 'Pan-India Direct Delivery',
    description:
      'Direct dispatch from our central Pune nursery with standard ground and express air transit options.',
  },
  {
    icon: Shield,
    title: 'Protective Botanical Packaging',
    description:
      'Ventilated crates and moisture-retaining coco-peat root wraps ensure live foliage arrives healthy and hydrated.',
  },
]

export function ValuePropositions() {
  const [ribbonItems, setRibbonItems] = useState<TrustRibbonItem[]>(DEFAULT_RIBBON_ITEMS)
  const [settings, setSettings] = useState<TrustSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    let isMounted = true
    async function loadBackendData() {
      try {
        const res = await fetch('/api/store/trust-badges')
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            if (Array.isArray(data.badges) && data.badges.length > 0) {
              setRibbonItems(data.badges)
            }
            if (data.settings) {
              setSettings((prev) => ({ ...prev, ...data.settings }))
            }
          }
        }
      } catch {
        // Fall back gracefully to defaults
      }
    }
    loadBackendData()
    return () => {
      isMounted = false
    }
  }, [])

  const renderIcon = (item: TrustRibbonItem) => {
    if (item.custom_icon_svg) {
      return (
        <span
          dangerouslySetInnerHTML={{ __html: item.custom_icon_svg }}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )
    }
    return ICON_MAP[item.icon_key] || <FertilizedSoilIcon />
  }

  return (
    <section className={styles.section} aria-label="Botanical Guarantees and Standards">
      <div className={styles.container}>
        {/* Dynamic Admin-Controlled Welcome Offer Banner */}
        <OfferBanner />

        {/* 1. Unified Trust Ribbon Bar (Reference Image 2 Redesign) */}
        {settings.is_visible && ribbonItems.length > 0 && (
          <div
            className={styles.trustRibbon}
            style={{
              backgroundColor: settings.bg_color,
              borderRadius: `${settings.border_radius}px`,
              color: settings.text_color,
            }}
          >
            {ribbonItems.map((item, index) => {
              const Content = (
                <>
                  <div
                    className={styles.ribbonIconCircle}
                    style={{
                      backgroundColor: settings.icon_bg_color,
                      color: settings.icon_color,
                    }}
                  >
                    {renderIcon(item)}
                  </div>
                  <h3 className={styles.ribbonTitle}>
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <span className={styles.ribbonSubtitle}>
                      {item.subtitle}
                    </span>
                  )}
                </>
              )

              return (
                <React.Fragment key={item.id}>
                  {index > 0 && (
                    <div
                      className={styles.ribbonDivider}
                      style={{ backgroundColor: settings.divider_color }}
                    />
                  )}
                  {item.cta_route ? (
                    <Link
                      href={item.cta_route}
                      className={styles.ribbonItem}
                      aria-label={`${item.title}: learn more`}
                    >
                      {Content}
                    </Link>
                  ) : (
                    <div className={styles.ribbonItem}>
                      {Content}
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* 2. Narrative Quality Pillars: The GLOROV Standard */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            From Our Pune Nursery Farm to Your Home
          </p>
          <h2 className={styles.heading}>
            The GLOROV Standard
          </h2>
          <p className={styles.subtitle}>
            Every plant and heirloom seed packet is nurtured at our Pune farm, batch-tested, and packed to survive transit and thrive in your living space.
          </p>
        </div>

        <div className={styles.grid}>
          {VALUES.map((val) => {
            const Icon = val.icon
            return (
              <div key={val.title} className={styles.card}>
                <div className={styles.iconCircle}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3 className={styles.cardTitle}>
                  {val.title}
                </h3>
                <p className={styles.cardDesc}>
                  {val.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
