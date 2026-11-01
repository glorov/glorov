'use client'

import React, { useState } from 'react'
import {
  Clock,
  Camera,
  CheckCircle,
  MessageSquare,
  Award,
  Video,
  Send,
} from 'lucide-react'
import styles from './PlantDoctorPage.module.css'

export function ConsultationBookingForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    plantSpecies: '',
    symptoms: '',
    consultationMode: 'whatsapp' as 'whatsapp' | 'video',
    preferredSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  })

  const [fileName, setFileName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate optimistic appointment booking
    setTimeout(() => {
      const generatedTicket = `PLANT-DOC-${Math.floor(100000 + Math.random() * 900000)}`
      setTicketId(generatedTicket)
      setIsSubmitting(false)
    }, 400)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Dr. Patil, I just booked a Plant Doctor consultation (${ticketId || 'New Inquiry'}). My plant is ${formData.plantSpecies || 'a indoor plant'} and is suffering from: ${formData.symptoms || 'leaf symptoms'}.`
  )
  const whatsappUrl = `https://wa.me/918000456789?text=${whatsappMessage}`

  return (
    <div className={styles.bookingContainer} id="consultation-booking">
      {/* Left Column: Doctor Profile Card */}
      <div className={styles.doctorCard}>
        <div className={styles.doctorAvatarWrapper}>
          <div className={styles.doctorAvatar} aria-label="Dr. Ramesh Patil Avatar">
            RP
          </div>
          <div className={styles.doctorDetails}>
            <h3 className={styles.doctorName}>Dr. Ramesh Patil</h3>
            <span className={styles.doctorRole}>Chief Agronomist &amp; Plant Doctor</span>
          </div>
        </div>

        <div className={styles.doctorStats}>
          <div className={styles.doctorStatItem}>
            <Award size={18} className={styles.statIcon} />
            <span>M.Sc. Horticulture, MPKV Rahuri (22+ Yrs)</span>
          </div>
          <div className={styles.doctorStatItem}>
            <CheckCircle size={18} className={styles.statIcon} />
            <span>50,000+ Urban Plant Diagnostics</span>
          </div>
          <div className={styles.doctorStatItem}>
            <Clock size={18} className={styles.statIcon} />
            <span>Avg Response: &lt; 30 Mins (Mon-Sat)</span>
          </div>
        </div>

        <p className={styles.doctorNote}>
          &ldquo;Every plant tells a story through its foliage and roots. Our mission at GLOROV is to empower Indian plant parents with 100% organic, chemical-free care regimens.&rdquo;
        </p>
      </div>

      {/* Right Column: Interactive Form or Receipt */}
      <div>
        {ticketId ? (
          <div className={styles.confirmationCard}>
            <div className={styles.successIconWrapper}>
              <CheckCircle size={32} />
            </div>

            <h3 className={styles.confirmationTitle}>Consultation Confirmed!</h3>
            <span className={styles.ticketBadge}>{ticketId}</span>

            <p className={styles.confirmationText}>
              Thank you, <strong>{formData.fullName}</strong>. Your consultation request for{' '}
              <strong>{formData.plantSpecies || 'your botanical specimen'}</strong> has been scheduled with Dr. Ramesh Patil for{' '}
              <strong>{formData.preferredDate}</strong> ({formData.preferredSlot} slot).
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappActionBtn}
              aria-label="Connect with Plant Doctor on WhatsApp"
            >
              <MessageSquare size={20} />
              Open WhatsApp Chat Now
            </a>

            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setTicketId(null)}
                className={styles.resetBtn}
                style={{ margin: '0 auto' }}
              >
                Book Another Consultation
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} aria-label="Book Plant Doctor Consultation">
            <div className={styles.formGrid}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label htmlFor="doc-fullName" className={styles.formLabel}>
                  Full Name <span className={styles.formRequired}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="doc-fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className={styles.formGroup}>
                <label htmlFor="doc-phone" className={styles.formLabel}>
                  WhatsApp Number <span className={styles.formRequired}>*</span>
                </label>
                <input
                  type="tel"
                  id="doc-phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={styles.formInput}
                />
              </div>

              {/* Email Address */}
              <div className={styles.formGroup}>
                <label htmlFor="doc-email" className={styles.formLabel}>
                  Email Address <span className={styles.formRequired}>*</span>
                </label>
                <input
                  type="email"
                  id="doc-email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="priya@example.com"
                  className={styles.formInput}
                />
              </div>

              {/* Plant Variety */}
              <div className={styles.formGroup}>
                <label htmlFor="doc-species" className={styles.formLabel}>
                  Plant or Seed Name
                </label>
                <input
                  type="text"
                  id="doc-species"
                  value={formData.plantSpecies}
                  onChange={(e) => setFormData({ ...formData, plantSpecies: e.target.value })}
                  placeholder="e.g. Monstera Deliciosa, Snake Plant"
                  className={styles.formInput}
                />
              </div>

              {/* Consultation Mode */}
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>
                  Preferred Consultation Mode <span className={styles.formRequired}>*</span>
                </label>
                <div className={styles.radioCardGroup} role="radiogroup" aria-label="Preferred Consultation Mode">
                  <label
                    className={`${styles.radioCardLabel} ${formData.consultationMode === 'whatsapp' ? styles.radioCardActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="consultationMode"
                      value="whatsapp"
                      checked={formData.consultationMode === 'whatsapp'}
                      onChange={() => setFormData({ ...formData, consultationMode: 'whatsapp' })}
                      className={styles.radioInput}
                    />
                    <MessageSquare size={18} color="#25d366" />
                    <span>WhatsApp Chat &amp; Voice Notes</span>
                  </label>

                  <label
                    className={`${styles.radioCardLabel} ${formData.consultationMode === 'video' ? styles.radioCardActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="consultationMode"
                      value="video"
                      checked={formData.consultationMode === 'video'}
                      onChange={() => setFormData({ ...formData, consultationMode: 'video' })}
                      className={styles.radioInput}
                    />
                    <Video size={18} color="var(--ugaoo-maroon)" />
                    <span>15-Minute Live Video Call</span>
                  </label>
                </div>
              </div>

              {/* Symptoms Description */}
              <div className={styles.formGroupFull}>
                <label htmlFor="doc-symptoms" className={styles.formLabel}>
                  Symptoms &amp; Observations <span className={styles.formRequired}>*</span>
                </label>
                <textarea
                  id="doc-symptoms"
                  required
                  rows={3}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe leaf discoloration, watering routine, sunlight exposure, and how long the plant has looked distressed..."
                  className={styles.formTextarea}
                />
              </div>

              {/* Preferred Date */}
              <div className={styles.formGroup}>
                <label htmlFor="doc-date" className={styles.formLabel}>
                  Consultation Date <span className={styles.formRequired}>*</span>
                </label>
                <input
                  type="date"
                  id="doc-date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              {/* Photo Upload Simulator */}
              <div className={styles.formGroup}>
                <label htmlFor="doc-photo" className={styles.formLabel}>
                  Attach Leaf / Plant Photo (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    id="doc-photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="doc-photo"
                    className={styles.formInput}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      color: fileName ? 'var(--ugaoo-green)' : 'var(--ugaoo-text-muted)',
                    }}
                  >
                    <Camera size={18} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fileName || 'Upload photo for accurate diagnosis'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Preferred Time Slot */}
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>
                  Select Time Slot <span className={styles.formRequired}>*</span>
                </label>
                <div className={styles.slotGrid} role="radiogroup" aria-label="Select Time Slot">
                  <button
                    type="button"
                    className={`${styles.slotButton} ${formData.preferredSlot === 'morning' ? styles.slotButtonActive : ''}`}
                    onClick={() => setFormData({ ...formData, preferredSlot: 'morning' })}
                    aria-label="Morning Slot 10 AM to 12 PM"
                  >
                    <span className={styles.slotPeriod}>Morning</span>
                    <span className={styles.slotTime}>10:00 AM – 12:00 PM</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.slotButton} ${formData.preferredSlot === 'afternoon' ? styles.slotButtonActive : ''}`}
                    onClick={() => setFormData({ ...formData, preferredSlot: 'afternoon' })}
                    aria-label="Afternoon Slot 2 PM to 4 PM"
                  >
                    <span className={styles.slotPeriod}>Afternoon</span>
                    <span className={styles.slotTime}>2:00 PM – 4:00 PM</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.slotButton} ${formData.preferredSlot === 'evening' ? styles.slotButtonActive : ''}`}
                    onClick={() => setFormData({ ...formData, preferredSlot: 'evening' })}
                    aria-label="Evening Slot 5 PM to 7 PM"
                  >
                    <span className={styles.slotPeriod}>Evening</span>
                    <span className={styles.slotTime}>5:00 PM – 7:00 PM</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
              aria-label="Submit Plant Doctor Consultation Booking"
            >
              <Send size={18} />
              {isSubmitting ? 'Scheduling Appointment...' : 'Book Free Horticultural Consultation'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
