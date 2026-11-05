'use client'

import React, { useState, useEffect, useContext } from 'react'
import { Modal } from '../ui/Modal'
import { CustomerAuthContext } from '@/context/CustomerAuthContext'
import { StorefrontContext } from '@/context/StorefrontContext'
import { CustomerReviewItem } from '@/types/storefront'

export interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  productTitle: string
  onSubmitReview: (review: CustomerReviewItem) => void
}

const RATING_LABELS: Record<number, string> = {
  5: '🌿 Outstanding — Exceeded Botanical Expectations',
  4: '🌱 Very Good — Healthy, Vibrant & Strong',
  3: '🌾 Average — Met Standard Expectations',
  2: '🍂 Fair — Room for Improvement',
  1: '🥀 Poor — Unsatisfactory Experience',
}

const BOTANICAL_TAG_SUGGESTIONS = [
  '🌱 High Germination',
  '🌿 Healthy Foliage',
  '📦 Eco Safe Packaging',
  '💧 Rapid Sprouting',
  '🌸 True to Variety',
  '☀️ Resilient Growth',
]

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  onSubmitReview,
}) => {
  const authContext = useContext(CustomerAuthContext)
  const customer = authContext?.customer
  const storefrontContext = useContext(StorefrontContext)
  const showToast = storefrontContext?.showToast || (() => {})

  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [authorName, setAuthorName] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Initialize author name from customer if logged in
  useEffect(() => {
    if (customer) {
      const full = [customer.firstName, customer.lastName].filter(Boolean).join(' ')
      if (full) {
        setAuthorName(full)
        return
      }
    }
    setAuthorName('Botanical Patron')
  }, [customer, isOpen])

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      showToast('warning', 'Please provide both a review headline and detailed thoughts.', {
        title: 'Missing Details',
      })
      return
    }

    setIsSubmitting(true)

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const newReview: CustomerReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName.trim() || 'Verified Gardener',
      rating,
      date: dateStr,
      title: title.trim(),
      content: selectedTags.length > 0
        ? `${selectedTags.join(' • ')}\n\n${content.trim()}`
        : content.trim(),
      isVerified: true,
    }

    // Dispatch to parent
    onSubmitReview(newReview)
    showToast('success', `Thank you! Your verified botanical review for "${productTitle}" is now live.`, {
      title: 'Review Published',
    })

    // Reset and close
    setIsSubmitting(false)
    setTitle('')
    setContent('')
    setSelectedTags([])
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Write a Botanical Review"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Product Context Banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 font-bold">
            🌿
          </div>
          <div>
            <p className="font-semibold text-emerald-950 line-clamp-1">{productTitle}</p>
            <p className="text-[11px] text-emerald-800/80">
              Share your growing notes, seedling vigor, and care tips with our gardening community.
            </p>
          </div>
        </div>

        {/* Rating Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Overall Botanical Rating <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-lg hover:bg-stone-100 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={`${star} Stars`}
                >
                  <svg
                    className={`w-7 h-7 transition-colors ${
                      active ? 'text-amber-400 fill-amber-400' : 'text-stone-300 fill-stone-100'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              )
            })}
            <span className="ml-3 text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
              {RATING_LABELS[hoverRating || rating]}
            </span>
          </div>
        </div>

        {/* Botanical Highlights / Tags */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Key Botanical Highlights <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BOTANICAL_TAG_SUGGESTIONS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="review-title" className="block text-xs font-bold text-stone-700 mb-1">
            Review Headline <span className="text-rose-500">*</span>
          </label>
          <input
            id="review-title"
            type="text"
            required
            placeholder="e.g. Sprouted in 4 days! Thriving in balcony planters"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
        </div>

        {/* Review Textarea */}
        <div>
          <label htmlFor="review-content" className="block text-xs font-bold text-stone-700 mb-1">
            Detailed Botanical Experience <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="review-content"
            required
            rows={4}
            placeholder="Describe soil preparation, sunlight conditions, watering frequency, seedling vigor, and how the plant responded to your home garden..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition resize-none leading-relaxed"
          />
        </div>

        {/* Author Name */}
        <div>
          <label htmlFor="review-author" className="block text-xs font-bold text-stone-700 mb-1">
            Your Display Name
          </label>
          <input
            id="review-author"
            type="text"
            placeholder="Your Name (e.g. Priya M.)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
          <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Reviews are marked with a Verified Buyer badge upon verification.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>Publish Review</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
