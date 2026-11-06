'use client'

import React, { useEffect } from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import { Button } from '../../components/ui/Button'

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * GLOROV-ERR-005: Nested error boundary for the checkout flow.
 * Isolates checkout-specific runtime exceptions so the rest of the application remains intact.
 */
export default function CheckoutErrorBoundary({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Checkout Error Boundary caught:', error)
  }, [error])

  return (
    <PageContainer className="flex-1 flex flex-col items-center justify-center min-h-[50vh] py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-2">
        Checkout Encountered an Interruption
      </h1>

      <p className="font-sans text-sm md:text-base text-stone-600 max-w-md mb-6 leading-relaxed">
        Your botanical cart selections are saved safely. A temporary disruption occurred while initializing your payment or delivery session.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button variant="primary" size="md" onClick={() => reset()} fullWidth>
          Retry Checkout
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/cart'
            }
          }}
          fullWidth
        >
          Return to Cart
        </Button>
      </div>
    </PageContainer>
  )
}
