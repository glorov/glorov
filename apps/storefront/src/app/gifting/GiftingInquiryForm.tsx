'use client'

import React, { useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import styles from './GiftingPage.module.css'

export function GiftingInquiryForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    workEmail: '',
    phone: '',
    quantityTier: '25-50',
    targetDate: '',
    occasion: 'employee-appreciation',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 800))

    const ref = `GLR-GIFT-${Math.floor(100000 + Math.random() * 900000)}`
    setReferenceId(ref)
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.successBox} role="alert" aria-live="polite">
        <h3 className={styles.successTitle}>
          <CheckCircle2 size={20} aria-hidden="true" />
          <span>Gifting Quotation Request Received</span>
        </h3>
        <p className={styles.successMessage}>
          Thank you, <strong>{formData.fullName}</strong>. Your corporate gifting request for{' '}
          <strong>{formData.organization}</strong> has been logged under reference{' '}
          <strong>{referenceId}</strong>.
        </p>
        <p className={styles.successMessage}>
          Our Pune horticultural gifting specialist will contact you at{' '}
          <strong>{formData.workEmail}</strong> within 4 business hours with custom catalog pricing and delivery schedules.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setFormData({
              fullName: '',
              organization: '',
              workEmail: '',
              phone: '',
              quantityTier: '25-50',
              targetDate: '',
              occasion: 'employee-appreciation',
              message: '',
            })
          }}
          className={styles.submitBtn}
          style={{ alignSelf: 'flex-start', marginTop: '0.75rem' }}
        >
          Submit Another Inquiry
        </button>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="fullName" className={styles.label}>
            Your Full Name *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="e.g. Rohini Iyer"
            value={formData.fullName}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="organization" className={styles.label}>
            Company / Organization *
          </label>
          <input
            id="organization"
            name="organization"
            type="text"
            required
            placeholder="e.g. Infosys Ltd."
            value={formData.organization}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="workEmail" className={styles.label}>
            Work Email Address *
          </label>
          <input
            id="workEmail"
            name="workEmail"
            type="email"
            required
            placeholder="e.g. rohini@company.com"
            value={formData.workEmail}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Mobile / WhatsApp Number *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="quantityTier" className={styles.label}>
            Estimated Quantity Tier *
          </label>
          <select
            id="quantityTier"
            name="quantityTier"
            value={formData.quantityTier}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="10-25">10 – 25 units</option>
            <option value="25-50">25 – 50 units (5% Vol. Disc)</option>
            <option value="50-100">50 – 100 units (10% Vol. Disc)</option>
            <option value="100-500">100 – 500 units (15% Vol. Disc)</option>
            <option value="500+">500+ units (Custom Nursery Batch)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="occasion" className={styles.label}>
            Gifting Occasion / Purpose *
          </label>
          <select
            id="occasion"
            name="occasion"
            value={formData.occasion}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="employee-appreciation">Employee Appreciation / Onboarding</option>
            <option value="corporate-diwali">Festive &amp; Diwali Green Gifting</option>
            <option value="client-relationship">Executive Client Relationship</option>
            <option value="esg-initiative">Corporate ESG &amp; Sustainability Drive</option>
            <option value="event-conference">Conference &amp; Annual Summit Favours</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="targetDate" className={styles.label}>
          Target Delivery Date (Optional)
        </label>
        <input
          id="targetDate"
          name="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>
          Specific Preferences or Requirements (Optional)
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Mention specific plant preferences (e.g. low-maintenance air purifiers, desi seeds), custom branding needs, or multi-address delivery requirements..."
          value={formData.message}
          onChange={handleChange}
          className={styles.textarea}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitBtn}
        aria-label="Submit Corporate Gifting Inquiry"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span>Submitting Inquiry...</span>
          </>
        ) : (
          <>
            <Send size={15} aria-hidden="true" />
            <span>Send Quotation Request</span>
          </>
        )}
      </button>
    </form>
  )
}
