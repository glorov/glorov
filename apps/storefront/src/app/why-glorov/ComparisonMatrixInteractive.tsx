'use client'

import React, { useState } from 'react'
import {
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import styles from './WhyGlorovPage.module.css'

interface ComparisonRow {
  id: string
  feature: string
  subtitle: string
  glorov: string
  localNurseries: string
  onlineMarketplaces: string
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    id: 'health',
    feature: 'Plant Health & Vigour',
    subtitle: 'Conditioned foliage quality',
    glorov: '3-Step horticultural health check; bushy, deep-rooted acclimatized specimens.',
    localNurseries: 'Inconsistent health, often root-bound with hidden root stress.',
    onlineMarketplaces: 'Drop-shipped from unknown third-party nurseries; frequent shock.',
  },
  {
    id: 'pests',
    feature: 'Pest & Pathogen Control',
    subtitle: 'Mealybug & mite prevention',
    glorov: '100% Prophylactically treated with organic cold-pressed neem; guaranteed pest-free.',
    localNurseries: 'Frequent pest presence (scale, fungus gnats, mealybugs) in outdoor beds.',
    onlineMarketplaces: 'High contamination risk during unventilated transit and dark storage.',
  },
  {
    id: 'soil',
    feature: 'Potting Medium & Drainage',
    subtitle: 'Root aeration chemistry',
    glorov: 'Pre-mixed aerated coco-peat, biochar, perlite, and aged vermicompost.',
    localNurseries: 'Heavy red clay or compacted garden soil with poor root drainage.',
    onlineMarketplaces: 'Dry compressed peat plugs that repel water and choke root hairs.',
  },
  {
    id: 'repotting',
    feature: 'Immediate Repotting Needed?',
    subtitle: 'Post-delivery convenience',
    glorov: 'No repotting required; conditioned in breathable grower nursery pots.',
    localNurseries: 'Immediate repotting mandatory (often sold in flimsy black poly-bags).',
    onlineMarketplaces: 'Varies; pots frequently arrive cracked or damaged in transit.',
  },
  {
    id: 'origin',
    feature: 'Growing Origin & Traceability',
    subtitle: 'Nursery agronomist backing',
    glorov: 'Propagated by expert agronomists at our 25-acre Pune Mother Nursery.',
    localNurseries: 'Outsourced from unverified roadside wholesale aggregators.',
    onlineMarketplaces: 'Middlemen and marketplace sellers with zero agricultural facilities.',
  },
  {
    id: 'transit',
    feature: 'Transit Guarantee & Packaging',
    subtitle: 'Interstate courier protection',
    glorov: '48-Hour Live Plant Guarantee with moisture-lock root wrap and crush-proof crates.',
    localNurseries: 'Transported on two-wheelers or open vehicles exposed to exhaust fumes.',
    onlineMarketplaces: 'Generic taped boxes; no live plant replacement guarantee.',
  },
  {
    id: 'gst',
    feature: 'Statutory 0% GST Invoicing',
    subtitle: 'Pure seed transparency',
    glorov: 'Statutory 0% GST (HSN 1209) on organic seeds with purity certificates.',
    localNurseries: 'Unregistered cash receipts with uncertified seed germination rates.',
    onlineMarketplaces: 'Opaque pricing with arbitrary GST markups.',
  },
  {
    id: 'support',
    feature: 'Post-Purchase Plant Care',
    subtitle: 'After-sale horticultural advice',
    glorov: 'Dedicated Plant Doctor teleconsultation, watering companion, and WhatsApp triage.',
    localNurseries: 'Zero after-sale support or guidance.',
    onlineMarketplaces: 'Automated generic chatbots with no horticultural expertise.',
  },
]

export function ComparisonMatrixInteractive() {
  const [mobileCompetitor, setMobileCompetitor] = useState<'local' | 'online'>('local')

  return (
    <div className={styles.matrixCard} role="region" aria-label="Glorov vs Competitor Comparison Matrix">
      {/* Mobile Toggle Row */}
      <div className={styles.mobileToggleRow} role="group" aria-label="Compare GLOROV with">
        <button
          type="button"
          className={`${styles.toggleBtn} ${mobileCompetitor === 'local' ? styles.toggleBtnActive : ''}`}
          onClick={() => setMobileCompetitor('local')}
          aria-pressed={mobileCompetitor === 'local'}
        >
          <span>vs Local Nurseries</span>
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${mobileCompetitor === 'online' ? styles.toggleBtnActive : ''}`}
          onClick={() => setMobileCompetitor('online')}
          aria-pressed={mobileCompetitor === 'online'}
        >
          <span>vs Generic Online</span>
        </button>
      </div>

      <table className={styles.comparisonTable}>
        <thead>
          <tr>
            <th className={styles.thFeature}>Botanical Standard</th>
            <th className={styles.thGlorov}>
              <div className={styles.glorovHeaderPill}>
                <Sparkles size={14} />
                <span>GLOROV Botanicals</span>
              </div>
            </th>
            <th
              className={`${styles.thCompetitor} ${
                mobileCompetitor === 'local' ? styles.thCompetitorActive : ''
              }`}
            >
              <span>Local Roadside Nurseries</span>
            </th>
            <th
              className={`${styles.thCompetitor} ${
                mobileCompetitor === 'online' ? styles.thCompetitorActive : ''
              }`}
            >
              <span>Generic Online Marketplaces</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_DATA.map((row) => (
            <tr key={row.id}>
              <td>
                <p className={styles.featureName}>{row.feature}</p>
                <p className={styles.featureSub}>{row.subtitle}</p>
              </td>

              {/* GLOROV */}
              <td className={styles.tdGlorov}>
                <div className={styles.benefitPoint}>
                  <Check size={16} className={styles.benefitPointCheck} />
                  <span>{row.glorov}</span>
                </div>
              </td>

              {/* Local Nurseries */}
              <td
                className={`${styles.tdCompetitor} ${
                  mobileCompetitor === 'local' ? styles.tdCompetitorActive : ''
                }`}
              >
                <div className={styles.competitorPoint}>
                  <X size={16} className={styles.competitorX} />
                  <span>{row.localNurseries}</span>
                </div>
              </td>

              {/* Online Marketplaces */}
              <td
                className={`${styles.tdCompetitor} ${
                  mobileCompetitor === 'online' ? styles.tdCompetitorActive : ''
                }`}
              >
                <div className={styles.competitorPoint}>
                  <X size={16} className={styles.competitorX} />
                  <span>{row.onlineMarketplaces}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
