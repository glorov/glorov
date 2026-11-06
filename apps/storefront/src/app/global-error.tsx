'use client'

import React, { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('GLOROV Global Application Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-stone-600 mb-6">
            An unexpected error occurred. Please try again or return to the GLOROV storefront.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 bg-[#1B4332] text-white rounded-xl font-medium hover:bg-[#0F281E] transition"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/'
              }}
              className="w-full py-2.5 px-4 border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
