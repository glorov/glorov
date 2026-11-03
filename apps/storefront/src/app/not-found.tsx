import React from 'react'
import Link from 'next/link'
import { PageContainer } from '../components/layout/PageContainer'
import { EmptyState } from '../components/feedback/EmptyState'
import { Button } from '../components/ui/Button'

/**
 * Global 404 Not Found page for non-existent routes.
 */
export default function NotFound() {
  return (
    <PageContainer className="flex-1 flex flex-col items-center justify-center min-h-[50vh] py-16">
      <EmptyState
        title="404 — Botanical Path Not Found"
        description="The plant variety, seed collection, or page you were exploring cannot be located in our nursery garden."
        icon={
          <svg
            className="w-8 h-8 text-forest-deep"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        action={
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" fullWidth>
              Return to Nursery Storefront
            </Button>
          </Link>
        }
      />
    </PageContainer>
  )
}
