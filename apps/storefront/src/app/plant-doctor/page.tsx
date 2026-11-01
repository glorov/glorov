import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Stethoscope,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Award,
  MessageSquare,
  Droplets,
  Sun,
  Bug,
  Thermometer,
  Zap,
} from 'lucide-react'
import { PlantDoctorDiagnosticWizard } from './PlantDoctorDiagnosticWizard'
import { ConsultationBookingForm } from './ConsultationBookingForm'
import styles from './PlantDoctorPage.module.css'

export const metadata: Metadata = {
  title: 'GLOROV Plant Doctor | Free Botanical & Agronomist Consultation',
  description:
    'Free virtual plant clinic powered by certified Pune nursery horticulturists. Interactive symptom checker, WhatsApp diagnosis, and 1-on-1 virtual plant consultations.',
  openGraph: {
    title: 'GLOROV Plant Doctor | Certified Botanical Clinic',
    description:
      'Diagnose yellow leaves, pest outbreaks, and root rot. Book free 15-min agronomist consultations with Pune nursery experts.',
  },
}

interface CommonAilment {
  id: string
  title: string
  tag: string
  icon: React.ElementType
  symptoms: string
  remedy: string
}

const COMMON_AILMENTS: CommonAilment[] = [
  {
    id: 'over-vs-under',
    title: 'Overwatering vs. Underwatering',
    tag: 'Moisture Balance',
    icon: Droplets,
    symptoms:
      'Overwatered leaves turn translucent, limp and soft with damp soil. Underwatered foliage looks crisp, papery, and curls downward with bone-dry soil.',
    remedy:
      'Overwatered: Withhold moisture until top 2 inches dry out. Underwatered: Perform a 20-min bottom soak in a shallow water bath.',
  },
  {
    id: 'spider-mites',
    title: 'Spider Mites & Mealybugs',
    tag: 'Organic Pest Control',
    icon: Bug,
    symptoms:
      'Fine silky webbing on leaf undersides, tiny yellow pinprick stippling, or white cottony sticky cushions at stem joints.',
    remedy:
      'Isolate specimen. Wipe foliage with lukewarm shower spray, followed by 5ml/L cold-pressed organic neem oil emulsion every 4 days.',
  },
  {
    id: 'sun-scorch',
    title: 'Solar Scorch vs. Light Starvation',
    tag: 'Photonic Balance',
    icon: Sun,
    symptoms:
      'Sun-scorched foliage exhibits bleached dry bleached patches. Light-starved plants grow weak, leggy internodes with small pale leaves.',
    remedy:
      'Filter southern direct sun with sheer linen curtains. Move low-light plants 3 feet closer to an unshaded east-facing window.',
  },
  {
    id: 'humidity-burn',
    title: 'Dry Air & Tap Fluoride Burn',
    tag: 'Foliage Margin Health',
    icon: Thermometer,
    symptoms:
      'Dry crispy brown tips on Calatheas, Palms, and Peace Lilies despite consistently moist potting soil.',
    remedy:
      'Water with rested tap water (left in open jar 24 hrs to evaporate chlorine). Place on a pebble humidity tray.',
  },
  {
    id: 'damping-off',
    title: 'Seedling Damping-Off Fungus',
    tag: 'Seed Germination',
    icon: Zap,
    symptoms:
      'Young delicate sprouts pinch at the soil surface and collapse overnight due to high humidity and stagnant air.',
    remedy:
      'Improve cross-ventilation immediately. Dust seed flat with natural Ceylon cinnamon powder and bottom-water only.',
  },
  {
    id: 'salt-buildup',
    title: 'Root Zone Salt Accumulation',
    tag: 'Soil Chemistry',
    icon: ShieldCheck,
    symptoms:
      'White chalky crust forming on top of soil or along rim of pot, causing sluggish vegetative growth.',
    remedy:
      'Flush root zone gently with 2 volumes of filtered water to leach out accumulated minerals; top dress with fresh vermicompost.',
  },
]

export default function PlantDoctorPage() {
  return (
    <main className={styles.pageContainer}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator} aria-hidden="true">
            /
          </li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            Plant Doctor
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Stethoscope size={16} />
          Certified Pune Nursery Horticultural Clinic
        </div>

        <h1 className={styles.heroTitle}>GLOROV Plant Doctor</h1>

        <p className={styles.heroSubtitle}>
          Yellow leaves, drooping foliage, or mystery spots? Get instant automated botanical diagnosis or book a free 1-on-1 virtual consultation with our senior Pune nursery agronomists.
        </p>

        {/* Trust Stats Bar */}
        <div className={styles.trustGrid}>
          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <HeartPulse size={22} />
            </div>
            <div className={styles.trustValue}>50,000+</div>
            <div className={styles.trustLabel}>Plants Successfully Revived Across India</div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <Award size={22} />
            </div>
            <div className={styles.trustValue}>15-Min Free</div>
            <div className={styles.trustLabel}>Virtual Consultation with Certified Agronomists</div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <Sparkles size={22} />
            </div>
            <div className={styles.trustValue}>100% Organic</div>
            <div className={styles.trustLabel}>Pure Chemical-Free Herbal &amp; Sunlight Protocols</div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <MessageSquare size={22} />
            </div>
            <div className={styles.trustValue}>&lt; 30 Mins</div>
            <div className={styles.trustLabel}>Average WhatsApp Doctor Response Time</div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Symptom Diagnostic Wizard */}
      <section className={styles.sectionWrapper} aria-labelledby="diagnostic-wizard-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Interactive Diagnostic Tool</span>
          <h2 id="diagnostic-wizard-heading" className={styles.sectionTitle}>
            Automated Botanical Symptom Checker
          </h2>
          <p className={styles.sectionSubtitle}>
            Select your plant type and symptoms below to receive an instant root-cause analysis and natural recovery prescription developed by our Pune nursery botanists.
          </p>
        </div>

        <PlantDoctorDiagnosticWizard />
      </section>

      {/* 4. Common Botanical Ailments Visual Library */}
      <section className={styles.sectionWrapper} aria-labelledby="common-ailments-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Horticultural Knowledgebase</span>
          <h2 id="common-ailments-heading" className={styles.sectionTitle}>
            Common Plant Ailments &amp; Quick Remedies
          </h2>
          <p className={styles.sectionSubtitle}>
            Learn to recognize the early warning signs of botanical distress before they impact your plant&apos;s root system.
          </p>
        </div>

        <div className={styles.ailmentsGrid}>
          {COMMON_AILMENTS.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.id} className={styles.ailmentCard}>
                <div className={styles.ailmentHeader}>
                  <span className={styles.ailmentTag}>{item.tag}</span>
                  <div className={styles.trustIconWrapper} style={{ width: 36, height: 36 }}>
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className={styles.ailmentTitle}>{item.title}</h3>
                <p className={styles.ailmentSymptoms}>{item.symptoms}</p>

                <div className={styles.ailmentRemedyBox}>
                  <div className={styles.ailmentRemedyTitle}>Natural Recovery Plan:</div>
                  <p className={styles.ailmentRemedyText}>{item.remedy}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 5. Consultation Booking Section */}
      <section className={styles.sectionWrapper} aria-labelledby="consultation-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>1-on-1 Agronomist Support</span>
          <h2 id="consultation-heading" className={styles.sectionTitle}>
            Book a Free Plant Doctor Consultation
          </h2>
          <p className={styles.sectionSubtitle}>
            Need personal guidance? Schedule a dedicated session with Dr. Ramesh Patil and our Hadapsar mother nursery horticultural team.
          </p>
        </div>

        <ConsultationBookingForm />
      </section>

      {/* 6. Emergency WhatsApp Helpdesk Reassurance Banner */}
      <section className={styles.sectionWrapper}>
        <div className={styles.emergencyBanner}>
          <div className={styles.emergencyBannerText}>
            <h3 className={styles.emergencyTitle}>Need Urgent Plant Emergency Care?</h3>
            <p className={styles.emergencySubtitle}>
              Our Pune mother nursery WhatsApp helpline is active 9:00 AM to 7:00 PM IST Monday through Saturday. Send a quick leaf photo for instant agronomist triage.
            </p>
          </div>

          <a
            href="https://wa.me/918000456789?text=Hi%20Plant%20Doctor%2C%20I%20have%20an%20urgent%20plant%20emergency."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.emergencyBtn}
            aria-label="Contact Emergency Plant Doctor on WhatsApp"
          >
            <MessageSquare size={20} />
            Connect on WhatsApp Now
          </a>
        </div>
      </section>
    </main>
  )
}
