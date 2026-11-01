import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ChevronRight,
  Sprout,
  CheckCircle2,
  MessageCircle,
  MapPin,
  ShieldCheck,
  TreeDeciduous,
  Leaf,
  Flower2,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { GardenServiceBookingForm } from './GardenServiceBookingForm'
import styles from './GardenServicesPage.module.css'

export const metadata: Metadata = {
  title: 'End-to-End Garden Services & Maintenance | GLOROV Botanicals',
  description:
    'Turnkey balcony garden makeovers, edible organic terrace farms, indoor biophilic styling, and periodic horticultural maintenance by certified Pune agronomists.',
}

export default function GardenServicesPage() {
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
            Garden Services
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Sprout size={14} />
          <span>End-to-End Horticultural Care</span>
        </div>

        <h1 className={styles.heroTitle}>
          End-to-End Garden Services &amp; Botanical Maintenance
        </h1>

        <p className={styles.heroSubtitle}>
          From compact urban balcony makeovers to edible terrace farms and quarterly agronomist maintenance visits, our team delivers living green sanctuaries with 100% organic potting mediums and certified nursery specimens.
        </p>

        <div className={styles.heroCtaRow}>
          <a href="#booking-form" className={styles.heroPrimaryBtn}>
            <span>Book Site Assessment</span>
            <ArrowRight size={18} />
          </a>
          <a
            href="https://wa.me/918087087224?text=Hi+Glorov!+I+want+to+inquire+about+end-to-end+garden+services."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.heroWhatsAppBtn}
          >
            <MessageCircle size={18} />
            <span>Chat With Agronomist</span>
          </a>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <TreeDeciduous size={24} color="var(--ugaoo-green, #0a4c36)" />
          <p className={styles.statValue}>5,000+</p>
          <p className={styles.statLabel}>Urban Sanctuaries Landscaped</p>
        </div>

        <div className={styles.statCard}>
          <ShieldCheck size={24} color="var(--ugaoo-green, #0a4c36)" />
          <p className={styles.statValue}>98.2%</p>
          <p className={styles.statLabel}>Botanical Survival Guarantee</p>
        </div>

        <div className={styles.statCard}>
          <Sprout size={24} color="var(--ugaoo-green, #0a4c36)" />
          <p className={styles.statValue}>100%</p>
          <p className={styles.statLabel}>Organic Coco-Peat &amp; Biochar Mediums</p>
        </div>

        <div className={styles.statCard}>
          <Sparkles size={24} color="var(--ugaoo-green, #0a4c36)" />
          <p className={styles.statValue}>Certified</p>
          <p className={styles.statLabel}>In-House Horticultural Specialists</p>
        </div>
      </div>

      {/* Core Services Section */}
      <section className={styles.sectionWrapper} aria-label="Our Core Botanical Services">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>Turnkey Solutions</p>
          <h2 className={styles.sectionTitle}>Four Tailored Botanical Service Packages</h2>
          <p className={styles.sectionSubtitle}>
            Every home and terrace has unique light, wind, and space conditions. Choose the package that matches your dream green retreat.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {/* Service 1 */}
          <article className={styles.serviceCard}>
            <div className={styles.serviceCardHeader}>
              <div className={styles.serviceIconWrap}>
                <Leaf size={26} />
              </div>
              <span className={styles.servicePricingTag}>From ₹4,999</span>
            </div>
            <h3 className={styles.serviceTitle}>Balcony Garden Makeover</h3>
            <p className={styles.serviceDesc}>
              Transform exposed apartment balconies into private tropical oases using wind-tolerant foliage and living privacy screens.
            </p>
            <ul className={styles.serviceFeaturesList}>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>On-site solar trajectory &amp; wind tunnel analysis</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Selection of hardy plants (Areca, Bougainvillea, Sansevieria)</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Nutrient-dense organic soil medium setup</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>30-Day post-installation nursery warranty</span>
              </li>
            </ul>
            <a href="#booking-form" className={styles.serviceActionBtn}>
              <span>Book Balcony Makeover</span>
            </a>
          </article>

          {/* Service 2 */}
          <article className={styles.serviceCard}>
            <div className={styles.serviceCardHeader}>
              <div className={styles.serviceIconWrap}>
                <Sprout size={26} />
              </div>
              <span className={styles.servicePricingTag}>From ₹8,999 • 0% GST</span>
            </div>
            <h3 className={styles.serviceTitle}>Terrace Edible Kitchen Farm</h3>
            <p className={styles.serviceDesc}>
              Grow seasonal fresh vegetables, culinary greens, and medicinal herbs on your rooftop with certified non-hybrid organic seeds.
            </p>
            <ul className={styles.serviceFeaturesList}>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Kharif &amp; Rabi sowing plan across 10+ heirloom crops</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Raised bed planting with vermicompost top-dressing</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Statutory 0% GST (HSN 1209) certified seed packets</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Drip hydration system installation guidance</span>
              </li>
            </ul>
            <a href="#booking-form" className={styles.serviceActionBtn}>
              <span>Book Edible Kitchen Farm</span>
            </a>
          </article>

          {/* Service 3 */}
          <article className={styles.serviceCard}>
            <div className={styles.serviceCardHeader}>
              <div className={styles.serviceIconWrap}>
                <Flower2 size={26} />
              </div>
              <span className={styles.servicePricingTag}>From ₹6,499</span>
            </div>
            <h3 className={styles.serviceTitle}>Indoor Biophilic &amp; Office Styling</h3>
            <p className={styles.serviceDesc}>
              Bespoke living air-purifiers and low-light focal specimens styled for modern living rooms, corridors, and creative studios.
            </p>
            <ul className={styles.serviceFeaturesList}>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>NASA air-purifying plant species selection</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Low-maintenance specimens (Peace Lily, ZZ, Monstera)</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Floor-protection saucers &amp; grower nursery pots</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Digital watering calculator &amp; schedule calendar sync</span>
              </li>
            </ul>
            <a href="#booking-form" className={styles.serviceActionBtn}>
              <span>Book Indoor Biophilic Styling</span>
            </a>
          </article>

          {/* Service 4 */}
          <article className={styles.serviceCard}>
            <div className={styles.serviceCardHeader}>
              <div className={styles.serviceIconWrap}>
                <Sparkles size={26} />
              </div>
              <span className={styles.servicePricingTag}>From ₹1,499 / Visit</span>
            </div>
            <h3 className={styles.serviceTitle}>Periodic Horticultural Maintenance</h3>
            <p className={styles.serviceDesc}>
              Certified agronomist doorstep visit for comprehensive soil aeration, prophylactic neem spray, organic feeding, and pruning.
            </p>
            <ul className={styles.serviceFeaturesList}>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Complete plant health check &amp; pest diagnosis</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Aeration of root balls &amp; fresh biochar replenishment</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Aged vermicompost &amp; seaweed organic feeding</span>
              </li>
              <li className={styles.serviceFeatureItem}>
                <CheckCircle2 size={16} className={styles.featureCheck} />
                <span>Aesthetic pruning, deadheading &amp; staking</span>
              </li>
            </ul>
            <a href="#booking-form" className={styles.serviceActionBtn}>
              <span>Book Agronomist Visit</span>
            </a>
          </article>
        </div>
      </section>

      {/* Real Transformations Section */}
      <section className={styles.sectionWrapper} aria-label="Real Urban Transformations">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionPreheading}>Before &amp; After</p>
          <h2 className={styles.sectionTitle}>Real Urban Botanical Transformations</h2>
          <p className={styles.sectionSubtitle}>
            See how our horticultural architects turned bare concrete spaces into thriving natural retreats.
          </p>
        </div>

        <div className={styles.transformationsGrid}>
          <div className={styles.transformationCard}>
            <div className={styles.transformationBody}>
              <span className={styles.transformationTag}>Balcony Makeover</span>
              <h3 className={styles.transformationTitle}>Koramangala 4th Block Balcony Oasis</h3>
              <p className={styles.transformationDesc}>
                A windy 120 sq ft high-rise balcony converted into a lush privacy haven with Monstera Deliciosa, Krishna Tulsi, and climbing jasmine trellises.
              </p>
              <div className={styles.transformationLocation}>
                <MapPin size={14} color="var(--ugaoo-green, #0a4c36)" />
                <span>Bengaluru, Karnataka</span>
              </div>
            </div>
          </div>

          <div className={styles.transformationCard}>
            <div className={styles.transformationBody}>
              <span className={styles.transformationTag}>Terrace Farm</span>
              <h3 className={styles.transformationTitle}>Baner Rooftop Edible Farm</h3>
              <p className={styles.transformationDesc}>
                A 350 sq ft sun-drenched rooftop terrace equipped with 8 raised organic planters producing desi tomatoes, palak, methi, and green chillies year-round.
              </p>
              <div className={styles.transformationLocation}>
                <MapPin size={14} color="var(--ugaoo-green, #0a4c36)" />
                <span>Pune, Maharashtra</span>
              </div>
            </div>
          </div>

          <div className={styles.transformationCard}>
            <div className={styles.transformationBody}>
              <span className={styles.transformationTag}>Indoor Biophilic</span>
              <h3 className={styles.transformationTitle}>Bandra Minimalist Living Sanctuary</h3>
              <p className={styles.transformationDesc}>
                Styled an open-plan apartment with tall Fiddle Leaf Figs, cascading Golden Pothos, and air-purifying Peace Lilies in low-maintenance self-watering mediums.
              </p>
              <div className={styles.transformationLocation}>
                <MapPin size={14} color="var(--ugaoo-green, #0a4c36)" />
                <span>Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className={styles.sectionWrapper}>
        <GardenServiceBookingForm />
      </section>

      {/* FAQ Section */}
      <section className={styles.sectionWrapper} aria-label="Garden Services FAQ">
        <div className={styles.sectionHeader}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ugaoo-maroon, #93113a)', marginBottom: '0.5rem' }}>
            <HelpCircle size={16} />
            <span className={styles.sectionPreheading} style={{ margin: 0 }}>Frequently Asked Questions</span>
          </div>
          <h2 className={styles.sectionTitle}>Everything You Need to Know</h2>
        </div>

        <div className={styles.faqList}>
          <details className={styles.faqItem} open>
            <summary className={styles.faqSummary}>
              <span>What is included in the in-person site assessment?</span>
            </summary>
            <div className={styles.faqBody}>
              Our certified agronomist evaluates your balcony or terrace for sunlight hours, wind speed, water drainage, and load-bearing capacity. You receive a personalized 3D botanical layout plan and custom species selection within 48 hours.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>
              <span>Do you provide living plants and organic soil mediums?</span>
            </summary>
            <div className={styles.faqBody}>
              Yes, 100%! All plants are dispatched directly from our Pune propagation mother nursery and conditioned for your local microclimate. We use pre-mixed aerated coco-peat, biochar, and aged organic vermicompost.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>
              <span>Which Indian cities do your garden service teams operate in?</span>
            </summary>
            <div className={styles.faqBody}>
              We currently operate full in-person garden styling and maintenance teams in Pune &amp; PCMC, Mumbai &amp; Thane, Bengaluru Urban, Delhi NCR &amp; Gurugram, Hyderabad, and Chennai.
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqSummary}>
              <span>What is your plant survival guarantee after installation?</span>
            </summary>
            <div className={styles.faqBody}>
              We back every turnkey garden makeover with our 30-Day Botanical Thriving Guarantee. If any living specimen fails to adapt, our agronomist replaces it free of charge.
            </div>
          </details>
        </div>
      </section>
    </main>
  )
}
