'use client'

import React, { useState } from 'react'
import { CustomerReviewItem, ProductReviewSummary } from '@/types/storefront'
import { RatingStars } from './RatingStars'
import { WriteReviewModal } from './WriteReviewModal'

export interface ProductReviewsSectionProps {
  summary?: ProductReviewSummary
  reviews?: CustomerReviewItem[]
  productTitle: string
}

/**
 * GLOROV ProductReviewsSection
 * Complete customer review module with star distribution bars,
 * AI verified feedback summary card, verified buyer testimonials,
 * and interactive themed review submission modal.
 */
export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  summary,
  reviews = [],
  productTitle,
}) => {
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false)
  const [reviewList, setReviewList] = useState<CustomerReviewItem[]>(reviews)
  const [starCounts, setStarCounts] = useState<Record<number, number>>(
    summary?.starCounts ?? { 5: 32, 4: 4, 3: 2, 2: 0, 1: 0 }
  )

  const handleReviewSubmit = (newRev: CustomerReviewItem) => {
    setReviewList((prev) => [newRev, ...prev])
    setStarCounts((prev) => ({
      ...prev,
      [newRev.rating]: (prev[newRev.rating] || 0) + 1,
    }))
  }

  const totalReviews = reviewList.length > 0 ? reviewList.length : (summary?.totalReviews ?? 1)
  const averageRating = summary?.averageRating ?? 4.8

  return (
    <section id="reviews" className="w-full my-8 p-6 rounded-2xl bg-white border border-stone-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-stone-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real feedback from verified GLOROV plant enthusiasts & gardeners
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsWriteReviewOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 hover:border-brand-primary text-stone-700 hover:text-brand-primary transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Aggregate Rating & Star Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-stone-100">
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-stone-50/80 border border-stone-200/60 text-center">
          <span className="text-4xl font-black text-stone-900 tracking-tight">
            {averageRating.toFixed(1)}
          </span>
          <div className="my-2">
            <RatingStars rating={averageRating} size="md" />
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Based on {totalReviews} verified purchases
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <svg width={14} height={14} className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            98% Recommendation Rate
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-8 flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] ?? 0
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-medium text-stone-600 flex items-center gap-1">
                  {star} <span className="text-amber-500">★</span>
                </span>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-stone-400 font-mono text-[11px]">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Botanical Summary Card */}
      {summary?.aiSummaryText && (
        <div className="my-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-primary text-white">
              AI Summary
            </span>
            <span className="text-xs font-semibold text-emerald-950">
              {summary.aiSummaryTitle || `Key takeaways for ${productTitle}`}
            </span>
          </div>
          <p className="text-xs text-emerald-900/90 leading-relaxed">
            {summary.aiSummaryText}
          </p>
        </div>
      )}

      {/* Review List */}
      <div className="mt-6 flex flex-col divide-y divide-stone-100">
        {reviewList.map((rev) => (
          <article key={rev.id} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-stone-900">{rev.author}</span>
                {rev.isVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                    Verified Buyer
                  </span>
                )}
              </div>
              <time className="text-[11px] text-stone-400 font-mono">{rev.date}</time>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <RatingStars rating={rev.rating} size="sm" />
              <h3 className="font-bold text-xs text-stone-900">{rev.title}</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">{rev.content}</p>
          </article>
        ))}
      </div>

      {/* Themed Review Submission Modal */}
      {isWriteReviewOpen && (
        <WriteReviewModal
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          productTitle={productTitle}
          onSubmitReview={handleReviewSubmit}
        />
      )}
    </section>
  )
}
