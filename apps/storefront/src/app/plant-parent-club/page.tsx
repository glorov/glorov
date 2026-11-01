import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Gift,
  Camera,
  Users,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { RewardsClubInteractive } from './RewardsClubInteractive'
import styles from './PlantParentClubPage.module.css'

export const metadata: Metadata = {
  title: 'Plant Parent Rewards Club™ | GLOROV Botanicals',
  description:
    'Earn Green Coins on every botanical order, redeem instant discount vouchers, access VIP repotting kits, and celebrate green milestones with the Glorov Plant Parent Club.',
}

export default function PlantParentClubPage() {
  return (
    <main className={styles.pageContainer}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator} aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            Plant Parent Club
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          <span>Exclusive Botanical Membership</span>
        </div>

        <h1 className={styles.heroTitle}>Glorov Plant Parent Club™</h1>

        <p className={styles.heroSubtitle}>
          Turn your love for greenery into delightful rewards. Earn Green Coins every time you shop, refer fellow plant parents, or celebrate botanical milestones, and redeem them for instant checkout discounts.
        </p>

        <div className={styles.heroCtaRow}>
          <Link href="/account/register" className={styles.heroPrimaryBtn}>
            <span>Join the Club — Get 200 Free Coins</span>
            <ArrowRight size={18} />
          </Link>
          <Link href="/account/login" className={styles.heroSecondaryBtn}>
            <span>Sign In to Check Balance</span>
          </Link>
        </div>
      </section>

      {/* Section 1: Ways to Earn */}
      <section className={styles.sectionWrapper} aria-label="Ways to Earn Green Coins">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>Growing Together</p>
          <h2 className={styles.sectionTitle}>Four Ways to Earn Green Coins</h2>
          <p className={styles.sectionSubtitle}>
            Every action nurtures your garden and boosts your reward balance.
          </p>
        </div>

        <div className={styles.earnGrid}>
          <div className={styles.earnCard}>
            <div className={styles.earnIconWrapper}>
              <ShoppingBag size={26} />
            </div>
            <p className={styles.earnCoins}>5 Coins / ₹100</p>
            <h3 className={styles.earnTitle}>Shop Plants &amp; Seeds</h3>
            <p className={styles.earnDesc}>
              Earn automatic coins on every living specimen and 0% GST heirloom seed packet you order.
            </p>
          </div>

          <div className={styles.earnCard}>
            <div className={styles.earnIconWrapper}>
              <Gift size={26} />
            </div>
            <p className={styles.earnCoins}>150 Coins</p>
            <h3 className={styles.earnTitle}>Plant Birthday Gift</h3>
            <p className={styles.earnDesc}>
              Celebrate your green anniversary every year with a surprise bonus delivered straight to your account.
            </p>
          </div>

          <div className={styles.earnCard}>
            <div className={styles.earnIconWrapper}>
              <Camera size={26} />
            </div>
            <p className={styles.earnCoins}>100 Coins</p>
            <h3 className={styles.earnTitle}>Review with Photo</h3>
            <p className={styles.earnDesc}>
              Share a review and photograph of your plant thriving in your home to help other growers.
            </p>
          </div>

          <div className={styles.earnCard}>
            <div className={styles.earnIconWrapper}>
              <Users size={26} />
            </div>
            <p className={styles.earnCoins}>200 Coins</p>
            <h3 className={styles.earnTitle}>Refer Garden Friends</h3>
            <p className={styles.earnDesc}>
              Gift a friend ₹150 off their first order and pocket 200 bonus coins when their plants arrive safely.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Membership Tiers */}
      <section className={styles.sectionWrapper} aria-label="Membership Tiers and Privileges">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>Exclusive Status</p>
          <h2 className={styles.sectionTitle}>Plant Parent Membership Tiers</h2>
          <p className={styles.sectionSubtitle}>
            Unlock higher earning multipliers and privileged horticultural care as your urban jungle flourishes.
          </p>
        </div>

        <div className={styles.tiersGrid}>
          {/* Tier 1 */}
          <div className={styles.tierCard}>
            <div className={styles.tierHeader}>
              <span className={styles.tierEmoji} role="img" aria-label="Sprout">
                🌱
              </span>
              <h3 className={styles.tierName}>Sprout Parent</h3>
              <p className={styles.tierSpend}>Entry Level (0 – 999 Coins)</p>
            </div>
            <ul className={styles.tierBenefitsList}>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Earn 5 Coins per ₹100 spent</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Annual ₹100 birthday voucher</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Standard interstate express transit</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Access to monthly sowing guide</span>
              </li>
            </ul>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div className={`${styles.tierCard} ${styles.tierCardActive}`}>
            <span className={styles.tierPill}>Most Popular</span>
            <div className={styles.tierHeader}>
              <span className={styles.tierEmoji} role="img" aria-label="Sapling">
                🌿
              </span>
              <h3 className={styles.tierName}>Sapling Steward</h3>
              <p className={styles.tierSpend}>1,000 – 2,499 Coins</p>
            </div>
            <ul className={styles.tierBenefitsList}>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span><strong>Earn 7.5 Coins</strong> per ₹100 spent</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span><strong>Free Air Courier</strong> on all live plants</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>10% off Green Routine Subscriptions</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Quarterly rare heirloom seed gift</span>
              </li>
            </ul>
          </div>

          {/* Tier 3 */}
          <div className={styles.tierCard}>
            <div className={styles.tierHeader}>
              <span className={styles.tierEmoji} role="img" aria-label="Banyan Tree">
                🌳
              </span>
              <h3 className={styles.tierName}>Banyan Elder</h3>
              <p className={styles.tierSpend}>2,500+ Lifetime Coins</p>
            </div>
            <ul className={styles.tierBenefitsList}>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span><strong>Earn 10 Coins</strong> per ₹100 spent</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>VIP WhatsApp teleconsult with Dr. Ramesh Patil</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Free annual organic repotting at any studio</span>
              </li>
              <li className={styles.tierBenefitItem}>
                <CheckCircle2 size={16} className={styles.benefitCheck} />
                <span>Priority access to rare botanical drops</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Interactive Calculator & Referral */}
      <section className={styles.sectionWrapper} aria-label="Calculate and Redeem Rewards">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>Instant Redemption</p>
          <h2 className={styles.sectionTitle}>Calculate &amp; Claim Your Vouchers</h2>
          <p className={styles.sectionSubtitle}>
            Convert your earned coins into discount codes and copy with a single tap.
          </p>
        </div>

        <RewardsClubInteractive />
      </section>

      {/* Section 4: FAQ Accordion */}
      <section className={styles.sectionWrapper} aria-label="Frequently Asked Questions">
        <div className={styles.sectionHeader}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ugaoo-maroon, #93113a)', marginBottom: '0.5rem' }}>
            <HelpCircle size={16} />
            <span className={styles.sectionPreheading} style={{ margin: 0 }}>Got Questions?</span>
          </div>
          <h2 className={styles.sectionTitle}>Plant Parent Club FAQ</h2>
        </div>

        <div className={styles.faqList}>
          <details className={styles.faqItem} open>
            <summary className={styles.faqSummary}>
              <span>How do I start earning Green Coins?</span>
            </summary>
            <div className={styles.faqBody}>
              Joining is 100% free! Simply create an account on GLOROV, and you will instantly receive 200 welcome Green Coins. From then on, every purchase automatically deposits coins into your wallet.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>
              <span>Do my Green Coins ever expire?</span>
            </summary>
            <div className={styles.faqBody}>
              Green Coins remain active for 12 months from the date of issuance. Earning or redeeming any coins automatically resets the expiry clock for your entire balance!
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>
              <span>Can I combine coin vouchers with other discounts?</span>
            </summary>
            <div className={styles.faqBody}>
              Yes! Green Coin discount vouchers can be applied during checkout alongside our statutory 0% GST benefits on organic seeds and standard free delivery thresholds.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>
              <span>How do I check my current coin balance?</span>
            </summary>
            <div className={styles.faqBody}>
              Log into your GLOROV account dashboard at any time to view your total coins, current tier status, and transaction history.
            </div>
          </details>
        </div>
      </section>
    </main>
  )
}
