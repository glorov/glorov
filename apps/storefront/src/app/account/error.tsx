'use client'

import React, { useEffect } from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import { Button } from '../../components/ui/Button'

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * GLOROV-ERR-005: Nested error boundary for customer account management routes.
 * Isolates account-specific runtime exceptions so the rest of the application remains intact.
 */
export default function AccountErrorBoundary({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Account Error Boundary caught:', error)
  }, [error])

  return (
    <PageContainer className="flex-1 flex flex-col items-center justify-center min-h-[50vh] py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-2">
        Unable to Load Account Details
      </h1>

      <p className="font-sans text-sm md:text-base text-stone-600 max-w-md mb-6 leading-relaxed">
        We encountered an issue synchronizing your customer profile, orders, or addresses. Please retry or refresh your session.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button variant="primary" size="md" onClick={() => reset()} fullWidth>
          Try Again
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/account'
            }
          }}
          fullWidth
        >
          Account Overview
        </Button>
      </div>
    </PageContainer>
  )
}
