'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  MessageCircle,
  Send,
} from 'lucide-react'
import styles from './GardenServicesPage.module.css'

export function GardenServiceBookingForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Pune',
    serviceType: 'balcony_makeover',
    spaceSize: 'compact',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    notes: '',
  })

  const [bookingTicket, setBookingTicket] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phone) {
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const ticketNum = 'GLR-SRV-' + Math.floor(100000 + Math.random() * 900000)
      setBookingTicket(ticketNum)
      setIsSubmitting(false)
    }, 600)
  }

  const handleReset = () => {
    setBookingTicket(null)
    setFormData({
      fullName: '',
      phone: '',
      city: 'Pune',
      serviceType: 'balcony_makeover',
      spaceSize: 'compact',
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: '',
    })
  }

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'balcony_makeover':
        return 'Balcony Garden Makeover'
      case 'terrace_kitchen':
        return 'Terrace Edible Kitchen Garden'
      case 'indoor_biophilic':
        return 'Indoor Biophilic & Office Styling'
      case 'periodic_maintenance':
        return 'Periodic Horticultural Maintenance'
      default:
        return 'Botanical Garden Consultation'
    }
  }

  return (
    <div className={styles.bookingCard} id="booking-form" role="region" aria-label="Book Garden Consultation Form">
      {!bookingTicket ? (
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--ugaoo-green, #0a4c36)', margin: '0 0 0.5rem' }}>
              Schedule Your In-Person Site Assessment
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(4, 32, 24, 0.7)', margin: 0 }}>
              Our senior Pune agronomist visits your location to analyze sunlight exposure, wind patterns, and water drainage.
            </p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="service-name" className={styles.formLabel}>
                Full Name *
              </label>
              <input
                type="text"
                id="service-name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Radhika Deshpande"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service-phone" className={styles.formLabel}>
                Mobile Number (+91) *
              </label>
              <input
                type="tel"
                id="service-phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9823012345"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service-city" className={styles.formLabel}>
                City / Region *
              </label>
              <select
                id="service-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={styles.formSelect}
              >
                <option value="Pune">Pune &amp; PCMC Flagship</option>
                <option value="Mumbai">Mumbai &amp; Thane</option>
                <option value="Bengaluru">Bengaluru Urban</option>
                <option value="Delhi NCR">Delhi NCR &amp; Gurugram</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service-type" className={styles.formLabel}>
                Service Interest *
              </label>
              <select
                id="service-type"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className={styles.formSelect}
              >
                <option value="balcony_makeover">Balcony Garden Makeover</option>
                <option value="terrace_kitchen">Terrace Edible Kitchen Garden</option>
                <option value="indoor_biophilic">Indoor Biophilic &amp; Office Styling</option>
                <option value="periodic_maintenance">Periodic Horticultural Maintenance</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service-size" className={styles.formLabel}>
                Approximate Area Size *
              </label>
              <select
                id="service-size"
                value={formData.spaceSize}
                onChange={(e) => setFormData({ ...formData, spaceSize: e.target.value })}
                className={styles.formSelect}
              >
                <option value="compact">Compact Balcony (&lt; 100 sq ft)</option>
                <option value="medium">Medium Terrace / Verandah (100 – 300 sq ft)</option>
                <option value="large">Large Rooftop / Villa Yard (300+ sq ft)</option>
                <option value="commercial">Commercial Campus / Office Atrium</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service-date" className={styles.formLabel}>
                Preferred Visit Date *
              </label>
              <input
                type="date"
                id="service-date"
                required
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroupFull}>
              <label htmlFor="service-notes" className={styles.formLabel}>
                Special Vision or Plant Preferences (Optional)
              </label>
              <textarea
                id="service-notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. South-facing balcony with strong afternoon sun, want edible herbs and fragrant jasmine..."
                className={styles.formTextarea}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            <Send size={18} />
            <span>{isSubmitting ? 'Reserving Agronomist...' : 'Book In-Person Site Assessment'}</span>
          </button>
        </form>
      ) : (
        <div className={styles.receiptCard}>
          <CheckCircle2 size={54} color="var(--ugaoo-green, #0a4c36)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--ugaoo-green, #0a4c36)', margin: 0 }}>
            Site Assessment Booked Successfully!
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(4, 32, 24, 0.75)', margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
            Thank you, <strong>{formData.fullName}</strong>. Our horticulture lead for <strong>{formData.city}</strong> will contact you within 2 hours to confirm your site assessment for <strong>{getServiceLabel(formData.serviceType)}</strong> on <strong>{formData.preferredDate}</strong>.
          </p>

          <div className={styles.receiptTicket}>{bookingTicket}</div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href={`https://wa.me/918087087224?text=Hi+Glorov+Team!+I+just+booked+site+assessment+ticket+${bookingTicket}+for+${encodeURIComponent(formData.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroWhatsAppBtn}
            >
              <MessageCircle size={18} />
              <span>Fast-Track on WhatsApp Concierge</span>
            </a>

            <button type="button" onClick={handleReset} className={styles.heroPrimaryBtn}>
              <span>Book Another Assessment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
