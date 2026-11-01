'use client'

import React, { useState } from 'react'
import {
  Coins,
  Copy,
  Check,
  Gift,
  Share2,
  Sparkles,
} from 'lucide-react'
import styles from './PlantParentClubPage.module.css'

interface CoinVoucherTier {
  coins: number
  discount: number
  code: string
}

const REWARD_TIERS: CoinVoucherTier[] = [
  { coins: 250, discount: 50, code: 'SEED-REWARD-50' },
  { coins: 500, discount: 100, code: 'SEED-REWARD-100' },
  { coins: 1000, discount: 250, code: 'SEED-REWARD-250' },
  { coins: 2000, discount: 600, code: 'SEED-REWARD-600' },
]

export function RewardsClubInteractive() {
  const [selectedCoins, setSelectedCoins] = useState<number>(500)
  const [copiedVoucher, setCopiedVoucher] = useState<boolean>(false)
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false)

  // Calculate voucher based on closest tier
  const activeTier =
    REWARD_TIERS.find((t) => t.coins === selectedCoins) || {
      coins: selectedCoins,
      discount: Math.floor(selectedCoins * 0.25),
      code: `SEED-REWARD-${Math.floor(selectedCoins * 0.25)}`,
    }

  const handleCopyVoucher = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(activeTier.code)
    }
    setCopiedVoucher(true)
    setTimeout(() => setCopiedVoucher(false), 3000)
  }

  const handleCopyReferral = () => {
    const referralText = 'https://glorov.in/?ref=GREENFRIEND'
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(referralText)
    }
    setCopiedReferral(true)
    setTimeout(() => setCopiedReferral(false), 3000)
  }

  return (
    <div className={styles.calcCard} role="region" aria-label="Interactive Coin Redemption Calculator">
      <div className={styles.calcGrid}>
        {/* Left Side: Preset Controls & Slider */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Coins size={22} color="var(--ugaoo-green, #0a4c36)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--ugaoo-green, #0a4c36)' }}>
              Green Coins Redemption Calculator
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'rgba(4, 32, 24, 0.7)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Select your available Green Coins to see the equivalent discount voucher ready to apply on living plants and heirloom seeds.
          </p>

          <div className={styles.calcPresetRow} role="group" aria-label="Coin Presets">
            {REWARD_TIERS.map((tier) => {
              const isActive = selectedCoins === tier.coins
              return (
                <button
                  key={tier.coins}
                  type="button"
                  className={`${styles.presetBtn} ${isActive ? styles.presetBtnActive : ''}`}
                  onClick={() => setSelectedCoins(tier.coins)}
                  aria-pressed={isActive}
                >
                  <span>{tier.coins} Coins</span>
                </button>
              )
            })}
          </div>

          <div className={styles.sliderRow}>
            <label htmlFor="coin-slider" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Adjust Coins Balance: <strong>{selectedCoins} Coins</strong>
            </label>
            <input
              type="range"
              id="coin-slider"
              min="100"
              max="3000"
              step="50"
              value={selectedCoins}
              onChange={(e) => setSelectedCoins(Number(e.target.value))}
              className={styles.sliderInput}
              aria-valuemin={100}
              aria-valuemax={3000}
              aria-valuenow={selectedCoins}
            />
            <div className={styles.sliderLabels}>
              <span>100 Coins (₹25)</span>
              <span>1,500 Coins (₹375)</span>
              <span>3,000 Coins (₹750)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Live Voucher Card */}
        <div>
          <div className={styles.voucherBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} color="var(--ugaoo-maroon, #93113a)" />
              <p className={styles.voucherLabel}>Redeemable Voucher Value</p>
            </div>

            <div className={styles.voucherDiscount}>₹{activeTier.discount} OFF</div>

            <p style={{ fontSize: '0.8125rem', color: 'rgba(4, 32, 24, 0.7)', margin: 0 }}>
              Valid on all nursery specimens &amp; 0% GST organic seeds.
            </p>

            <div className={styles.voucherCodeTag} aria-label={`Voucher Code ${activeTier.code}`}>
              {activeTier.code}
            </div>

            <button
              type="button"
              className={styles.redeemBtn}
              onClick={handleCopyVoucher}
              aria-label={`Copy voucher code ${activeTier.code}`}
            >
              {copiedVoucher ? (
                <>
                  <Check size={16} />
                  <span>Code Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Voucher Code</span>
                </>
              )}
            </button>

            {copiedVoucher && (
              <p className={styles.redeemedSuccess}>
                ✓ Paste this code at checkout to claim your ₹{activeTier.discount} discount!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Referral Program Row */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className={styles.referralCard}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Gift size={20} color="var(--ugaoo-yellow-badge, #ffd029)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ugaoo-yellow-badge, #ffd029)' }}>
                Plant Parent Referral Club
              </span>
            </div>
            <h3 className={styles.referralTitle}>Give ₹150, Get 200 Green Coins</h3>
            <p className={styles.referralSubtitle}>
              Invite your friends and neighbors to green their homes. They get ₹150 off their first botanical order, and you earn 200 Green Coins once delivered!
            </p>
          </div>

          <div className={styles.referralActionBox}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', textTransform: 'uppercase', fontWeight: 600 }}>
              Your Referral Code
            </span>
            <div className={styles.referralCodeDisplay}>GREENFRIEND</div>
            <button
              type="button"
              className={styles.copyReferralBtn}
              onClick={handleCopyReferral}
              aria-label="Copy Referral Link"
            >
              {copiedReferral ? (
                <>
                  <Check size={16} />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
