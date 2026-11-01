'use client'

import React, { useState } from 'react'
import {
  Briefcase,
  MapPin,
  Clock,
  Send,
  X,
  CheckCircle2,
  Sparkles,
  Sprout,
  Truck,
  Code,
  Store,
} from 'lucide-react'
import styles from './CareersPage.module.css'

export interface JobRole {
  id: string
  title: string
  department: 'horticulture' | 'supply_chain' | 'technology' | 'studio'
  deptLabel: string
  location: string
  type: string
  description: string
  experience: string
}

export const OPEN_ROLES: JobRole[] = [
  {
    id: 'role-pathologist',
    title: 'Senior Plant Pathologist & Nursery Lead',
    department: 'horticulture',
    deptLabel: 'Horticulture & Agronomy',
    location: 'Hadapsar Mother Nursery, Pune',
    type: 'Full-Time • On-Site',
    description: 'Lead botanical pest prevention, organic bio-stimulant formulation, and propagation health protocols across our 25-acre facility under Dr. Ramesh Patil.',
    experience: '4+ Years in Horticulture / Agronomy',
  },
  {
    id: 'role-logistics',
    title: 'Botanical Packaging & Cold-Chain Specialist',
    department: 'supply_chain',
    deptLabel: 'Nursery Logistics',
    location: 'Pune Dispatch Hub, Maharashtra',
    type: 'Full-Time • On-Site',
    description: 'Optimize breathable moisture-lock packaging, evaluate interstate courier transit survival metrics, and design crush-proof crating for live specimens.',
    experience: '3+ Years in E-Commerce Logistics / Perishables',
  },
  {
    id: 'role-engineer',
    title: 'Senior Full-Stack E-Commerce Engineer',
    department: 'technology',
    deptLabel: 'Digital Engineering',
    location: 'Bengaluru Studio / Hybrid',
    type: 'Full-Time • Hybrid',
    description: 'Build fast, pure CSS, accessible storefront experiences on Next.js 15, Medusa v2 headless commerce, and customer botanical companion tools.',
    experience: '4+ Years in React, TypeScript & Node.js',
  },
  {
    id: 'role-studio-mgr',
    title: 'Experiential Studio Lead & Botanical Stylist',
    department: 'studio',
    deptLabel: 'Retail & Plant Styling',
    location: 'Bandra West Flagship, Mumbai',
    type: 'Full-Time • On-Site',
    description: 'Manage in-studio customer journeys, run weekend terrarium & bonsai workshops, and deliver in-person plant health diagnosis at our Repotting Bar.',
    experience: '2+ Years in Premium Retail or Biophilic Design',
  },
  {
    id: 'role-seed-agronomist',
    title: 'Heirloom Seed Cultivation Specialist',
    department: 'horticulture',
    deptLabel: 'Horticulture & Agronomy',
    location: 'Hadapsar Mother Nursery, Pune',
    type: 'Full-Time • On-Site',
    description: 'Supervise native non-hybrid seed harvest, 100% germination testing, and compliance with statutory 0% GST (HSN 1209) quality certifications.',
    experience: '3+ Years in Seed Agronomy / Seed Testing',
  },
]

const DEPT_TABS = [
  { id: 'all', label: 'All Openings (5)', icon: Briefcase },
  { id: 'horticulture', label: 'Horticulture', icon: Sprout },
  { id: 'supply_chain', label: 'Logistics', icon: Truck },
  { id: 'technology', label: 'Engineering', icon: Code },
  { id: 'studio', label: 'Studio Retail', icon: Store },
]

export function CareersInteractive() {
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [applyingRole, setApplyingRole] = useState<JobRole | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [applicationTicket, setApplicationTicket] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    note: '',
  })

  const filteredRoles =
    selectedDept === 'all'
      ? OPEN_ROLES
      : OPEN_ROLES.filter((role) => role.department === selectedDept)

  const handleOpenModal = (role: JobRole) => {
    setApplyingRole(role)
    setIsSubmitted(false)
    setApplicationTicket(null)
  }

  const handleCloseModal = () => {
    setApplyingRole(null)
    setIsSubmitted(false)
    setApplicationTicket(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      note: '',
    })
  }

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) return

    const ticketCode = 'GLR-CAREER-' + Math.floor(100000 + Math.random() * 900000)
    setApplicationTicket(ticketCode)
    setIsSubmitted(true)
  }

  return (
    <div>
      {/* Department Filter Tabs */}
      <div className={styles.filterTabsRow} role="tablist" aria-label="Filter Job Roles by Department">
        {DEPT_TABS.map((tab) => {
          const isActive = selectedDept === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
              onClick={() => setSelectedDept(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Roles List */}
      <div className={styles.rolesGrid} role="region" aria-label="Open Botanical Career Roles">
        {filteredRoles.map((role) => (
          <article key={role.id} className={styles.roleCard}>
            <div className={styles.roleInfo}>
              <div className={styles.roleBadgeRow}>
                <span className={styles.departmentBadge}>{role.deptLabel}</span>
                <span className={styles.typeBadge}>{role.type}</span>
              </div>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <p className={styles.roleDesc}>{role.description}</p>
              <div className={styles.roleMetaRow}>
                <div className={styles.roleMetaItem}>
                  <MapPin size={14} color="var(--ugaoo-green, #0a4c36)" />
                  <span>{role.location}</span>
                </div>
                <div className={styles.roleMetaItem}>
                  <Clock size={14} color="var(--ugaoo-green, #0a4c36)" />
                  <span>{role.experience}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.applyBtn}
              onClick={() => handleOpenModal(role)}
              aria-label={`Apply for ${role.title}`}
            >
              <span>Apply for Role</span>
            </button>
          </article>
        ))}
      </div>

      {/* Application Modal */}
      {applyingRole && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-career-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal()
          }}
        >
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={handleCloseModal}
              aria-label="Close Application Form"
            >
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleSubmitApplication}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ugaoo-maroon, #93113a)', marginBottom: '0.25rem' }}>
                  <Sparkles size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {applyingRole.deptLabel}
                  </span>
                </div>
                <h3 id="modal-career-title" className={styles.modalTitle}>
                  {applyingRole.title}
                </h3>
                <p className={styles.modalSubtitle}>
                  Location: <strong>{applyingRole.location}</strong> • Type: <strong>{applyingRole.type}</strong>
                </p>

                <div className={styles.formGroup}>
                  <label htmlFor="applicant-name" className={styles.formLabel}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="applicant-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Shruti Patil"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="applicant-email" className={styles.formLabel}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="applicant-email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. shruti@example.com"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="applicant-phone" className={styles.formLabel}>
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    id="applicant-phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9823012345"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="applicant-linkedin" className={styles.formLabel}>
                    LinkedIn or Portfolio URL
                  </label>
                  <input
                    type="url"
                    id="applicant-linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="applicant-note" className={styles.formLabel}>
                    Why GLOROV Botanicals? (Brief Cover Note)
                  </label>
                  <textarea
                    id="applicant-note"
                    rows={3}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Tell us about your passion for plants, horticulture, or building green customer experiences..."
                    className={styles.formTextarea}
                  />
                </div>

                <button type="submit" className={styles.modalSubmitBtn}>
                  <Send size={16} />
                  <span>Submit Application</span>
                </button>
              </form>
            ) : (
              <div className={styles.receiptCard}>
                <CheckCircle2 size={52} color="var(--ugaoo-green, #0a4c36)" />
                <h3 className={styles.modalTitle}>Application Received!</h3>
                <p className={styles.modalSubtitle}>
                  Thank you, <strong>{formData.name}</strong>. Your application for <strong>{applyingRole.title}</strong> has been logged with our Pune Nursery Talent Team.
                </p>

                <div className={styles.receiptCode}>{applicationTicket}</div>

                <p style={{ fontSize: '0.8125rem', color: 'rgba(4, 32, 24, 0.7)', margin: 0, lineHeight: 1.5 }}>
                  Our hiring team reviews every botanical application and will be in touch via email or phone within 3 business days.
                </p>

                <button
                  type="button"
                  className={styles.modalSubmitBtn}
                  onClick={handleCloseModal}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <span>Close Window</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
