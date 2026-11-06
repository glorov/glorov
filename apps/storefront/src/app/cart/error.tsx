'use client'

import React, { useEffect } from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import { Button } from '../../components/ui/Button'

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * GLOROV-ERR-005: Nested error boundary for the cart and bag management page.
 * Isolates cart-specific runtime exceptions so the rest of the application remains intact.
 */
export default function CartErrorBoundary({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Cart Error Boundary caught:', error)
  }, [error])

  return (
    <PageContainer className="flex-1 flex flex-col items-center justify-center min-h-[50vh] py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-2">
        Cart Encountered an Interruption
      </h1>

      <p className="font-sans text-sm md:text-base text-stone-600 max-w-md mb-6 leading-relaxed">
        Your selected plants and seeds are preserved in your local cart. We encountered an issue updating line items or promotional vouchers.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button variant="primary" size="md" onClick={() => reset()} fullWidth>
          Reload Cart
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/search'
            }
          }}
          fullWidth
        >
          Continue Shopping
        </Button>
      </div>
    </PageContainer>
  )
}
