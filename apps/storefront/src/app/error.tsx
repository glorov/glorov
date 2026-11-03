'use client'

import React, { useEffect } from 'react'
import { PageContainer } from '../components/layout/PageContainer'
import { Button } from '../components/ui/Button'

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root error boundary for catching unhandled exceptions in App Router.
 */
export default function ErrorBoundary({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to observability collector safely
    console.error('Storefront Root Error Boundary caught:', error)
  }, [error])

  return (
    <PageContainer className="flex-1 flex flex-col items-center justify-center min-h-[50vh] py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-error-surface text-brand-error flex items-center justify-center mb-4">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 className="font-serif text-display-sm text-text-primary mb-2">
        Something unexpected sprouted
      </h1>

      <p className="font-sans text-body-md text-text-muted max-w-md mb-6">
        We encountered a temporary disruption while rendering this botanical page.
        Please try again or return to our homepage.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button variant="primary" size="md" onClick={() => reset()} fullWidth>
          Try Again
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => {
            window.location.href = '/'
          }}
          fullWidth
        >
          Return to Storefront
        </Button>
      </div>
    </PageContainer>
  )
}
