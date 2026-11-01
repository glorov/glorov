'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import styles from './Error.module.css'

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
    <div className={styles.container}>
      <div className={styles.iconWrapper} aria-hidden="true">
        <AlertCircle size={32} />
      </div>
      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>
          Temporary Foliage Disruption
        </h2>
        <p className={styles.description}>
          We encountered an unexpected error while loading this botanical page. Please try refreshing or return to the home sanctuary.
        </p>
        {error.digest && (
          <p className={styles.digestTag}>
            Support Reference: <span className={styles.digestValue}>{error.digest}</span>
          </p>
        )}
      </div>
      <div className={styles.actionWrapper}>
        <button
          type="button"
          onClick={() => reset()}
          className={styles.resetButton}
        >
          <RefreshCw size={16} aria-hidden="true" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  )
}
