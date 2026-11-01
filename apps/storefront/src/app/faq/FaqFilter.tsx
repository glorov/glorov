'use client'

import React, { useState, useMemo } from 'react'
import { Search, ChevronDown, Sparkles, Sprout, Leaf, Package, RefreshCw, X } from 'lucide-react'
import styles from './FaqPage.module.css'

export interface FaqItemData {
  id: string
  question: string
  answer: string
  category: 'transit-health' | 'watering-light' | 'packaging' | 'seeds' | 'guarantee-returns'
  categoryLabel: string
}

export const FAQ_DATA: FaqItemData[] = [
  {
    id: 'transit-first-steps',
    category: 'transit-health',
    categoryLabel: 'Plant Health & Transit',
    question: 'What should I do immediately when my live plant parcel arrives?',
    answer:
      'Unbox the plant gently in a shaded area. Carefully remove the protective corrugated sleeve and the breathable coco-wrap around the pot. Do not place the plant in direct harsh sunlight immediately. Give it a gentle drink of water if the topsoil feels dry, and allow it to rest in bright, indirect light for 48 hours to recover from transit shock.',
  },
  {
    id: 'yellow-leaves-transit',
    category: 'transit-health',
    categoryLabel: 'Plant Health & Transit',
    question: 'Why are 1-2 lower leaves yellow or shedding after unboxing?',
    answer:
      'It is completely natural for plants to shed 1 or 2 older, lower leaves during interstate transit as they conserve moisture in the dark box. As long as the central stem and root system are firm and new shoots remain green, your plant is healthy and will sprout fresh leaves within 10 to 14 days once acclimated to your home.',
  },
  {
    id: 'watering-finger-test',
    category: 'watering-light',
    categoryLabel: 'Watering & Light',
    question: 'How do I know when it is the exact right time to water my plant?',
    answer:
      'Always follow the "finger test" rather than a rigid calendar schedule. Insert your index finger about 1.5 to 2 inches into the potting mix. If the soil clings to your skin cool and damp, delay watering by another day or two. If it feels crumbly and dry, hydrate thoroughly until water drains from the bottom drainage holes.',
  },
  {
    id: 'indoor-sunlight-guidance',
    category: 'watering-light',
    categoryLabel: 'Watering & Light',
    question: 'Can indoor plants survive in rooms without windows or direct sun?',
    answer:
      'Yes, varieties like Sansevieria (Snake Plant), ZZ Plant, and Aglaonema thrive exceptionally well under ambient indoor lighting and standard fluorescent or LED office lights. For flowering plants like Peace Lilies, place them within 4–6 feet of an east- or north-facing window for optimal blooming.',
  },
  {
    id: 'moisture-shield-technology',
    category: 'packaging',
    categoryLabel: 'Moisture-Shield Packaging',
    question: 'How do live plants survive up to 5 days of transit inside a closed carton?',
    answer:
      'Our Pune nursery developed an aerated coco-peat root encasing that locks in optimal moisture without waterlogging roots. The outer crating features laser-cut ventilation ports that ensure continuous oxygen exchange while preventing internal movement or soil spillage even if the box is tilted during courier handling.',
  },
  {
    id: 'dispatch-days-schedule',
    category: 'packaging',
    categoryLabel: 'Moisture-Shield Packaging',
    question: 'Why are live botanical parcels dispatched only Monday through Thursday?',
    answer:
      'To ensure your living plant never gets stranded in a courier transit hub over the weekend. Non-perishable organic seeds and gardening accessories are dispatched Monday through Saturday, while living botanicals follow our express transit schedule.',
  },
  {
    id: 'seeds-gst-exemption',
    category: 'seeds',
    categoryLabel: 'Heirloom Seeds & 0% GST',
    question: 'Why is there 0% GST on all GLOROV agricultural and flower seeds?',
    answer:
      'Under statutory Indian tax law (Notification No. 02/2017-Central Tax, HSN Code 1209), agricultural seeds for sowing—including desi vegetable, flower, and medicinal herb varieties—are strictly exempt from GST (0%). Live potted ornamental plants attract 5% GST (HSN 0602), which is transparently itemized.',
  },
  {
    id: 'seed-germination-guarantee',
    category: 'seeds',
    categoryLabel: 'Heirloom Seeds & 0% GST',
    question: 'Are GLOROV seeds non-GMO and tested for Indian climate viability?',
    answer:
      'Every seed batch is 100% open-pollinated, non-GMO, and tested for minimum 85%+ germination rate in our Pune trial gardens. Packets include specific sowing cycle guidance across Kharif (Monsoon), Rabi (Winter), and Zaid (Summer) seasons suited for Indian soil.',
  },
  {
    id: 'live-plant-guarantee-claim',
    category: 'guarantee-returns',
    categoryLabel: 'Guarantee & Claims',
    question: 'What is the 48-Hour Live Plant Arrival Guarantee and how do I file a claim?',
    answer:
      'If your plant arrives with severe root damage, a snapped main stem, or irreversible transit distress, simply take 2 unboxing photos or a 10-second video and share it with our support team within 48 hours of delivery (via WhatsApp at +91 80870 87224 or support@glorov.in). We dispatch a free nursery replacement with no return shipping required.',
  },
  {
    id: 'perishable-return-policy',
    category: 'guarantee-returns',
    categoryLabel: 'Guarantee & Claims',
    question: 'Why are living plants not subject to traditional reverse courier pickup?',
    answer:
      'Subjecting a fragile living botanical to a second round-trip return journey in a closed box would be fatal to the specimen. Therefore, approved transit damage claims are resolved via free fresh plant replacement or store credit, allowing you to compost or nurse the damaged specimen without hassle.',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: Sparkles },
  { id: 'transit-health', label: 'Transit & Plant Health', icon: Leaf },
  { id: 'watering-light', label: 'Watering & Light', icon: Sprout },
  { id: 'packaging', label: 'Moisture-Shield Packaging', icon: Package },
  { id: 'seeds', label: 'Seeds & 0% GST', icon: Sprout },
  { id: 'guarantee-returns', label: '48-Hr Guarantee & Claims', icon: RefreshCw },
]

export function FaqFilter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'transit-first-steps': true,
    'moisture-shield-technology': true,
  })

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [searchQuery, selectedCategory])

  return (
    <div>
      {/* Search Input */}
      <div className={styles.searchWrap}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, e.g. watering, yellow leaves, 48-hr guarantee, seeds..."
          className={styles.searchInput}
          aria-label="Search frequently asked plant care questions"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ugaoo-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
            aria-label="Clear search query"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className={styles.categoryPills} role="tablist" aria-label="FAQ categories">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ''}`}
            >
              <Icon size={14} aria-hidden="true" />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Accordion List */}
      {filteredFaqs.length > 0 ? (
        <div className={styles.accordionList} role="region" aria-label="FAQ Accordion">
          {filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id]
            return (
              <div
                key={faq.id}
                className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className={styles.faqSummary}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.faqChevron} ${isOpen ? styles.faqChevronRotated : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className={styles.faqContent}
                    role="region"
                  >
                    <span className={styles.faqCategoryTag}>{faq.categoryLabel}</span>
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--ugaoo-text-dark)' }}>
            No questions matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p style={{ margin: 0 }}>
            Try searching for another keyword, or chat with our Pune plant specialists directly via WhatsApp.
          </p>
        </div>
      )}
    </div>
  )
}
