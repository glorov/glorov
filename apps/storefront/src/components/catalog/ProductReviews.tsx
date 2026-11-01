'use client'

import React, { useState } from 'react'
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  CheckCircle2,
  PenLine,
} from 'lucide-react'
import styles from './ProductReviews.module.css'

export interface ReviewItem {
  id: string
  author: string
  location: string
  rating: number
  date: string
  title: string
  comment: string
  helpfulCount: number
  verified: boolean
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Ananya Deshmukh',
    location: 'Pune, Maharashtra',
    rating: 5,
    date: '3 days ago',
    title: 'Arrived healthy and thriving with moisture-shield wrap!',
    comment:
      'I was worried about transit stress, but the plant arrived with moist root coco-peat and zero broken leaves. Within 48 hours of placing it in bright indirect light, new foliage began unfurling. Truly impressed with the Pune nursery quality!',
    helpfulCount: 24,
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Rajiv Sharma',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    date: '1 week ago',
    title: 'Exceptional root health, authentic specimen',
    comment:
      'Unlike local nursery plants that come packed in heavy red clay, GLOROV uses a lightweight aerated substrate. The plant is bushy, glossy, and clearly acclimatized to domestic conditions. Worth every rupee.',
    helpfulCount: 19,
    verified: true,
  },
  {
    id: 'rev-3',
    author: 'Sunita Menon',
    location: 'Kochi, Kerala',
    rating: 4,
    date: '2 weeks ago',
    title: 'Super fast delivery and careful packaging',
    comment:
      'Delivered in 3 days via Air Express. The corrugated box had ventilation windows so the leaves stayed crisp and green. The WhatsApp plant care helpline was very helpful with my watering questions.',
    helpfulCount: 11,
    verified: true,
  },
]

interface ProductReviewsProps {
  productTitle: string
}

export function ProductReviews({ productTitle }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({})

  // Form state
  const [formData, setFormData] = useState({
    author: '',
    location: '',
    rating: 5,
    title: '',
    comment: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleHelpful = (id: string) => {
    if (helpfulMap[id]) return

    setHelpfulMap((prev) => ({ ...prev, [id]: true }))
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.author || !formData.title || !formData.comment) return

    const newReview: ReviewItem = {
      id: `rev-custom-${Date.now()}`,
      author: formData.author,
      location: formData.location || 'India',
      rating: formData.rating,
      date: 'Just now',
      title: formData.title,
      comment: formData.comment,
      helpfulCount: 0,
      verified: true,
    }

    setReviews([newReview, ...reviews])
    setSubmitted(true)
    setTimeout(() => {
      setIsFormOpen(false)
      setSubmitted(false)
      setFormData({ author: '', location: '', rating: 5, title: '', comment: '' })
    }, 1800)
  }

  return (
    <section className={styles.reviewSection} aria-label="Customer Reviews">
      {/* 1. Header */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.headerTitle}>Customer Reviews &amp; Experiences</h2>
          <p className={styles.headerSubtitle}>
            Verified feedback from plant parents who received specimens from our Pune nursery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={styles.writeReviewBtn}
        >
          <PenLine size={16} aria-hidden="true" />
          <span>Write a Botanical Review</span>
        </button>
      </div>

      {/* 2. Rating Overview & Breakdown Grid */}
      <div className={styles.overviewGrid}>
        {/* Score Card */}
        <div className={styles.scoreCard}>
          <span className={styles.scoreNumber}>4.8</span>
          <div className={styles.scoreStars} aria-label="4.8 out of 5 stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} style={{ fill: '#ffd029', color: '#ffd029' }} aria-hidden="true" />
            ))}
          </div>
          <span className={styles.scoreLabel}>
            Based on {reviews.length + 145} verified customer ratings
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className={styles.breakdownList} aria-label="Rating breakdown">
          <div className={styles.breakdownRow}>
            <span>5 Stars</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '86%' }} />
            </div>
            <span className={styles.percentageLabel}>86%</span>
          </div>

          <div className={styles.breakdownRow}>
            <span>4 Stars</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '11%' }} />
            </div>
            <span className={styles.percentageLabel}>11%</span>
          </div>

          <div className={styles.breakdownRow}>
            <span>3 Stars</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '2%' }} />
            </div>
            <span className={styles.percentageLabel}>2%</span>
          </div>

          <div className={styles.breakdownRow}>
            <span>2 Stars</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '1%' }} />
            </div>
            <span className={styles.percentageLabel}>1%</span>
          </div>

          <div className={styles.breakdownRow}>
            <span>1 Star</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: '0%' }} />
            </div>
            <span className={styles.percentageLabel}>0%</span>
          </div>
        </div>
      </div>

      {/* 3. Review Submission Form */}
      {isFormOpen && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Reviewing: {productTitle}</h3>

          {submitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0a4c36', fontWeight: 700 }}>
              <CheckCircle2 size={24} />
              <span>Thank you! Your botanical review has been published.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Overall Rating *</label>
                <div className={styles.starPicker} role="radiogroup" aria-label="Select star rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: s }))}
                      className={styles.starBtn}
                      aria-label={`${s} Stars`}
                    >
                      <Star
                        size={24}
                        style={{
                          fill: s <= formData.rating ? '#ffd029' : 'none',
                          color: s <= formData.rating ? '#ffd029' : '#d4d1c9',
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="rev-author" className={styles.fieldLabel}>
                    Your Name *
                  </label>
                  <input
                    id="rev-author"
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="rev-location" className={styles.fieldLabel}>
                    Location (City, State)
                  </label>
                  <input
                    id="rev-location"
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="rev-title" className={styles.fieldLabel}>
                  Review Headline *
                </label>
                <input
                  id="rev-title"
                  type="text"
                  required
                  placeholder="e.g. Arrived vibrant and carefully packed!"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={styles.input}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="rev-comment" className={styles.fieldLabel}>
                  Your Experience &amp; Plant Condition *
                </label>
                <textarea
                  id="rev-comment"
                  required
                  placeholder="How was the soil moisture, foliage health, transit packaging, or seed germination?"
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Submit Review
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. Reviews List */}
      <div className={styles.reviewsList}>
        {reviews.map((rev) => (
          <article key={rev.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.authorRow}>
                <span className={styles.authorName}>{rev.author}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(4, 32, 24, 0.5)' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(4, 32, 24, 0.65)' }}>{rev.location}</span>
                {rev.verified && (
                  <span className={styles.verifiedBadge}>
                    <ShieldCheck size={13} aria-hidden="true" />
                    <span>Verified Plant Parent</span>
                  </span>
                )}
              </div>
              <span className={styles.reviewDate}>{rev.date}</span>
            </div>

            <div className={styles.reviewStars} aria-label={`${rev.rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  style={{
                    fill: i < rev.rating ? '#ffd029' : 'none',
                    color: i < rev.rating ? '#ffd029' : '#d4d1c9',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>

            <h3 className={styles.reviewTitle}>{rev.title}</h3>
            <p className={styles.reviewBody}>{rev.comment}</p>

            <button
              type="button"
              onClick={() => handleHelpful(rev.id)}
              className={styles.helpfulBtn}
              aria-label={`Mark review by ${rev.author} as helpful. Currently ${rev.helpfulCount} helpful votes.`}
            >
              <ThumbsUp size={13} aria-hidden="true" />
              <span>Helpful ({rev.helpfulCount})</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
