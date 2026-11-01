import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Gift,
  Sparkles,
  Heart,
  Truck,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Leaf,
  Sprout,
} from 'lucide-react'
import { GiftingInquiryForm } from './GiftingInquiryForm'
import styles from './GiftingPage.module.css'

export const metadata: Metadata = {
  title: 'Corporate & Green Botanical Gifting | GLOROV Botanicals',
  description:
    'Sustainable living plant gifts and desi heirloom seed hampers for corporate milestones, employee onboarding, weddings, and eco-initiatives. Dispatched with moisture-shield packaging across India.',
  keywords: [
    'corporate plant gifting',
    'green gifts India',
    'living plants corporate gifts',
    'eco friendly corporate gifts Pune',
    'desi seed gift kit',
    'air purifying plant gifts',
  ],
}

interface GiftPackage {
  id: string
  title: string
  items: string
  price: string
  originalPrice: string
  minQty: string
  badge: string
  image: string
}

const GIFT_PACKAGES: GiftPackage[] = [
  {
    id: 'air-purifier-trio',
    title: 'Executive Air-Purifier Trio',
    items: 'Peace Lily, Sansevieria Snake Plant & Golden Pothos in Grower Pots',
    price: '₹1,199',
    originalPrice: '₹1,599',
    minQty: 'Min 10 units',
    badge: 'Best Seller',
    image: '/ugaoo-assets/cat-plants.webp',
  },
  {
    id: 'prosperity-wellness-duo',
    title: 'Prosperity & Wellness Duo',
    items: 'Aromatic Krishna Tulsi & Lucky Crassula Jade Plant',
    price: '₹799',
    originalPrice: '₹999',
    minQty: 'Min 15 units',
    badge: 'Popular',
    image: '/ugaoo-assets/farm-1.webp',
  },
  {
    id: 'desi-kitchen-garden-kit',
    title: 'Organic Kitchen Garden Hamper',
    items: '5 Desi Heirloom Seeds (Palak, Tomato, Methi, Coriander, Chilli) + Jute Planters',
    price: '₹549',
    originalPrice: '₹749',
    minQty: 'Min 20 units',
    badge: '0% GST',
    image: '/ugaoo-assets/cat-seeds.webp',
  },
  {
    id: 'desktop-succulent-harmony',
    title: 'Desktop Succulent Harmony',
    items: 'Low-Maintenance Zebra Haworthia & Jade in Jute Nursery Wrap',
    price: '₹649',
    originalPrice: '₹849',
    minQty: 'Min 15 units',
    badge: 'Easy Care',
    image: '/ugaoo-assets/farm-2.webp',
  },
]

export default function GiftingPage() {
  return (
    <div className={styles.container}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>Green Botanical Gifting</span>
      </nav>

      {/* 2. Hero Banner */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Sustainable Living Gifts</span>
          </div>
          <h1 className={styles.heroTitle}>
            Gift a Life that <span className={styles.heroHighlight}>Grows &amp; Thrives</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Replace fleeting sweets and plastic mementos with living green companions. Climate-conditioned
            botanicals and certified desi seeds dispatched directly from our Pune nursery to desks across India.
          </p>
          <div className={styles.heroCtaRow}>
            <a href="#inquiry-form" className={styles.primaryCta}>
              <Gift size={16} aria-hidden="true" />
              <span>Request Corporate Quotation</span>
            </a>
            <a
              href="https://wa.me/918087087224?text=Hi%20GLOROV%20Botanicals%2C%20I%20would%20like%20to%20inquire%20about%20corporate%20green%20gifting"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappCta}
            >
              <Phone size={15} aria-hidden="true" />
              <span>WhatsApp Gifting Specialist</span>
            </a>
          </div>
        </div>

        {/* Hero Stats */}
        <div className={styles.heroStatsGrid}>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNumber}>100%</span>
            <span className={styles.heroStatLabel}>Living Botanicals &amp; Heirloom Seeds</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNumber}>19k+</span>
            <span className={styles.heroStatLabel}>PIN Codes Served Across India</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNumber}>48-Hr</span>
            <span className={styles.heroStatLabel}>Live Plant Safe Arrival Guarantee</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatNumber}>Zero</span>
            <span className={styles.heroStatLabel}>Plastic Pots or Synthetic Soil</span>
          </div>
        </div>
      </header>

      {/* 3. Why Plants Over Traditional Gifts */}
      <section aria-labelledby="why-gift-plants" style={{ marginBottom: '3.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSupertitle}>Horticultural Gifting Advantage</span>
          <h2 id="why-gift-plants" className={styles.sectionTitle}>
            Why Forward-Thinking Brands Choose Living Botanicals
          </h2>
          <p className={styles.sectionDescription}>
            Plants are emotional, lasting anchors that purify indoor workspace air and remind your recipients
            of your enduring partnership with every unfurling leaf.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <Heart size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.pillarTitle}>Enduring Daily Presence</h3>
            <p className={styles.pillarText}>
              Unlike perishable confections or discarded novelty gadgets, a living plant thrives on your recipient’s desk for years.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <Leaf size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.pillarTitle}>Indoor Air Purification</h3>
            <p className={styles.pillarText}>
              Every specimen in our corporate collection is vetted for active filtration of volatile organic compounds and CO2.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <Sprout size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.pillarTitle}>Authentic ESG Impact</h3>
            <p className={styles.pillarText}>
              Tangibly demonstrate your corporate sustainability commitment with zero-plastic packaging and native Indian seeds.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrap}>
              <Truck size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.pillarTitle}>Multi-Destination Delivery</h3>
            <p className={styles.pillarText}>
              Send individual packages straight to 500+ remote employee home addresses or a single consolidation to headquarters.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Curated Botanical Gift Packages */}
      <section aria-labelledby="curated-packages" style={{ marginBottom: '3.5rem' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSupertitle}>Curated Selections</span>
          <h2 id="curated-packages" className={styles.sectionTitle}>
            Signature Botanical Gift Collections
          </h2>
          <p className={styles.sectionDescription}>
            Pre-assembled horticultural sets conditioned for stress-free unboxing and effortless indoor maintenance.
          </p>
        </div>

        <div className={styles.packagesGrid}>
          {GIFT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className={styles.packageCard}>
              <div className={styles.packageImageWrap}>
                <span className={styles.packageBadge}>{pkg.badge}</span>
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.packageDetails}>
                <h3 className={styles.packageTitle}>{pkg.title}</h3>
                <p className={styles.packageItems}>{pkg.items}</p>
                <div className={styles.packagePriceRow}>
                  <span className={styles.packagePrice}>{pkg.price}</span>
                  <span className={styles.packageOriginalPrice}>{pkg.originalPrice}</span>
                  <span className={styles.packageMinQty}>{pkg.minQty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Customization Options */}
      <section className={styles.customizationSection} aria-labelledby="customization-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSupertitle}>Bespoke Branding</span>
          <h2 id="customization-title" className={styles.sectionTitle}>
            Customization to Match Your Corporate Identity
          </h2>
          <p className={styles.sectionDescription}>
            Every parcel can be personalized to carry your organization’s message, brand ethos, and care guidelines.
          </p>
        </div>

        <div className={styles.customizationGrid}>
          <div className={styles.customItem}>
            <div className={styles.customIconCircle}>
              <Building2 size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className={styles.customItemTitle}>Custom Branded Pot Sleeves</h3>
              <p className={styles.customItemText}>
                Eco-friendly kraft paper or natural burlap sleeves printed with your company logo, vision, or event hashtag.
              </p>
            </div>
          </div>

          <div className={styles.customItem}>
            <div className={styles.customIconCircle}>
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className={styles.customItemTitle}>Personalized Care Notecards</h3>
              <p className={styles.customItemText}>
                Foil-stamped welcome cards featuring a warm message from leadership alongside plant care instructions.
              </p>
            </div>
          </div>

          <div className={styles.customItem}>
            <div className={styles.customIconCircle}>
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className={styles.customItemTitle}>Moisture-Shield Crating</h3>
              <p className={styles.customItemText}>
                Breathable, drop-tested protective crating that guarantees the recipient receives a clean, fresh, hydrated specimen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Inquiry Form & Direct Concierge Details */}
      <section id="inquiry-form" className={styles.inquirySplit} aria-labelledby="inquiry-title">
        <div className={styles.formCol}>
          <h2 id="inquiry-title" className={styles.formTitle}>
            Request a Custom Bulk Quotation
          </h2>
          <p className={styles.formSubtitle}>
            Share your requirements below. Our Pune horticultural gifting team will respond with a tailored proposal and volume pricing within 24 hours.
          </p>
          <GiftingInquiryForm />
        </div>

        <div className={styles.infoCol}>
          <h3 className={styles.infoTitle}>Corporate Plant Concierge</h3>
          <p style={{ fontSize: '13px', color: 'var(--ugaoo-text-muted)', lineHeight: 1.5, margin: 0 }}>
            Have an urgent requirement or need assistance planning Diwali or corporate annual gifting? Speak directly with our horticultural gifting lead.
          </p>

          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <div className={styles.contactIconCircle}>
                <Phone size={18} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.contactLabel}>Corporate Helpline &amp; WhatsApp</p>
                <p className={styles.contactValue}>+91 80870 87224</p>
                <p className={styles.contactSubtext}>Mon–Sat: 9:00 AM – 7:00 PM IST</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIconCircle}>
                <Mail size={18} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.contactLabel}>Corporate Accounts Email</p>
                <p className={styles.contactValue}>corporate@glorov.in</p>
                <p className={styles.contactSubtext}>Inquiries replied within 4 business hours</p>
              </div>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIconCircle}>
                <Building2 size={18} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.contactLabel}>Dispatch Nursery &amp; Propagation Center</p>
                <p className={styles.contactValue}>Pune Botanical Facility</p>
                <p className={styles.contactSubtext}>Pune, Maharashtra — 411001</p>
              </div>
            </div>
          </div>

          <div className={styles.corporateTrustList}>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} style={{ color: 'var(--ugaoo-green)' }} aria-hidden="true" />
              <span>Statutory GST Invoicing with Input Tax Credit</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} style={{ color: 'var(--ugaoo-green)' }} aria-hidden="true" />
              <span>48-Hour Live Plant Arrival Guarantee on all bulk shipments</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle2 size={16} style={{ color: 'var(--ugaoo-green)' }} aria-hidden="true" />
              <span>Zero chemical preservatives or synthetic enhancers used</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Corporate Gifting FAQs */}
      <section className={styles.faqSection} aria-labelledby="gifting-faq-title">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSupertitle}>Frequently Asked Questions</span>
          <h2 id="gifting-faq-title" className={styles.sectionTitle}>
            Corporate Botanical Gifting FAQ
          </h2>
        </div>

        <div className={styles.faqGrid}>
          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>What is the minimum order quantity for corporate gifting?</h3>
            <p className={styles.faqAnswer}>
              Our standard minimum order quantity is 10 units for curated plant sets and 20 units for organic desi seed kits. For custom bespoke pot sleeves and branding, MOQ is 25 units.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>Can you dispatch directly to individual employee addresses?</h3>
            <p className={styles.faqAnswer}>
              Yes! We specialize in Pan-India multi-destination dispatch. You simply provide a spreadsheet of addresses, and our Pune logistics team coordinates express air delivery with real-time tracking across 19,000+ PIN codes.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>How do you ensure live plants survive long-distance transit?</h3>
            <p className={styles.faqAnswer}>
              Every botanical specimen is hardened in our Pune shadehouses and packed with our patented moisture-shield coco-wrap and ventilated corrugated crating that withstands up to 6 days in transit while maintaining optimal root aeration.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3 className={styles.faqQuestion}>What are the applicable GST tax rates on corporate gifting?</h3>
            <p className={styles.faqAnswer}>
              Agricultural and heirloom seeds are 100% exempt from GST (0% under statutory HSN Code 1209). Living plants attract 5% GST (HSN 0602). Full B2B tax invoices with your corporate GSTIN are provided for ITC claims.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
