'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log unexpected runtime errors to monitoring service in production
    console.error('Storefront Root Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-bold text-foreground">
          Temporary Foliage Disruption
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We encountered an unexpected error while loading this botanical page. Please try refreshing or return to the home sanctuary.
        </p>
        {error.digest && (
          <p className="text-[11px] text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded inline-block">
            Support Reference: <span className="text-foreground">{error.digest}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={() => reset()} variant="botanical" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  )
}
