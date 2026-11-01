'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Leaf,
} from 'lucide-react'
import styles from './ContactPage.module.css'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Plant Care Advice',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setSubmitted(true)
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Contact Us</span>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Leaf size={14} aria-hidden="true" />
            <span>Botanical Support Desk</span>
          </div>
          <h1 className={styles.heroTitle}>Get in Touch with our Plant Experts</h1>
          <p className={styles.heroSubtitle}>
            Whether you need species selection advice, unboxing guidance, or order assistance, our Pune nursery team is here to help.
          </p>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <main className={styles.mainContent}>
        {/* 3 Quick Contact Cards */}
        <div className={styles.cardsGrid}>
          <article className={styles.contactCard}>
            <div className={styles.iconWrap}>
              <MessageCircle size={24} aria-hidden="true" />
            </div>
            <h2 className={styles.cardTitle}>WhatsApp Helpline</h2>
            <p className={styles.cardDesc}>
              Chat with our certified plant experts for real-time potting, watering, and transit guidance.
            </p>
            <a
              href="https://wa.me/918087087224?text=Hi!+I+need+botanical+assistance+from+GLOROV"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
            >
              <span>+91 80870 87224</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </article>

          <article className={styles.contactCard}>
            <div className={styles.iconWrap}>
              <Mail size={24} aria-hidden="true" />
            </div>
            <h2 className={styles.cardTitle}>Email Inquiries</h2>
            <p className={styles.cardDesc}>
              For order status, corporate botanical gifting, or transit claims, write to our helpdesk.
            </p>
            <a href="mailto:support@glorov.in" className={styles.cardLink}>
              <span>support@glorov.in</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </article>

          <article className={styles.contactCard}>
            <div className={styles.iconWrap}>
              <MapPin size={24} aria-hidden="true" />
            </div>
            <h2 className={styles.cardTitle}>Propagation Nursery</h2>
            <p className={styles.cardDesc}>
              Central botanical nursery hub, climate-conditioned propagation facility in Pune.
            </p>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#042018' }}>
              Pune, Maharashtra — 411001
            </span>
          </article>
        </div>

        {/* Form + Nursery Info Section */}
        <div className={styles.formSectionGrid}>
          {/* Inquiry Form */}
          <section className={styles.formCard} aria-label="Customer Inquiry Form">
            <h2 className={styles.formTitle}>Send a Message</h2>
            <p className={styles.formSubtitle}>
              Fill out the form below and our botanists will respond within 2 to 4 business hours.
            </p>

            {submitted ? (
              <div className={styles.successCard} role="status">
                <CheckCircle2 size={40} color="#0a4c36" />
                <h3 className={styles.successTitle}>Inquiry Received!</h3>
                <p className={styles.successText}>
                  Thank you, <strong>{formData.name}</strong>. A GLOROV botanical specialist has received your message regarding &quot;{formData.topic}&quot; and will reach out to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{
                    marginTop: '1rem',
                    background: 'none',
                    border: '1px solid #0a4c36',
                    color: '#0a4c36',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. priya@example.com"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      Phone / WhatsApp Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="topic" className={styles.label}>
                      Inquiry Topic
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      <option value="Plant Care Advice">Plant Care &amp; Watering Advice</option>
                      <option value="Order & Tracking Inquiry">Order Status &amp; Tracking</option>
                      <option value="Seed Germination Support">Seed Germination &amp; Soil Query</option>
                      <option value="Transit Guarantee Claim">Transit Damage / 48-Hour Guarantee</option>
                      <option value="Corporate Botanical Gifting">Corporate Botanical Gifting</option>
                      <option value="General Question">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your plant care question, order reference, or inquiry in detail..."
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <Send size={18} aria-hidden="true" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </section>

          {/* Right Column: Nursery Information */}
          <aside className={styles.nurseryCard} aria-label="Nursery Operational Details">
            <div>
              <h3 className={styles.nurseryTitle}>Pune Propagation Hub</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(4, 32, 24, 0.65)', margin: 0, lineHeight: 1.5 }}>
                Our botanical parcels are packaged with root moisture protection directly at our central nursery in Maharashtra.
              </p>
            </div>

            <ul className={styles.nurseryList}>
              <li className={styles.nurseryItem}>
                <div className={styles.nurseryItemIcon}>
                  <Clock size={20} aria-hidden="true" />
                </div>
                <div className={styles.nurseryItemContent}>
                  <h4 className={styles.nurseryItemHeading}>Operating Hours</h4>
                  <p className={styles.nurseryItemText}>
                    Monday – Saturday: 9:30 AM – 6:30 PM IST<br />
                    Sunday: Closed (Plants resting &amp; conditioning)
                  </p>
                </div>
              </li>

              <li className={styles.nurseryItem}>
                <div className={styles.nurseryItemIcon}>
                  <MapPin size={20} aria-hidden="true" />
                </div>
                <div className={styles.nurseryItemContent}>
                  <h4 className={styles.nurseryItemHeading}>Registered Nursery Address</h4>
                  <p className={styles.nurseryItemText}>
                    GLOROV Botanicals Private Limited<br />
                    Pune Central Propagation Hub<br />
                    Maharashtra, India — 411001
                  </p>
                </div>
              </li>

              <li className={styles.nurseryItem}>
                <div className={styles.nurseryItemIcon}>
                  <ShieldCheck size={20} aria-hidden="true" />
                </div>
                <div className={styles.nurseryItemContent}>
                  <h4 className={styles.nurseryItemHeading}>Statutory Information</h4>
                  <p className={styles.nurseryItemText}>
                    HSN 1209 (Agricultural Seeds - 0% GST)<br />
                    HSN 0602 (Living Botanicals &amp; Plants)
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}
