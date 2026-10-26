'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  initialQuery?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  onSearchSubmitted?: () => void
  autoFocus?: boolean
  id?: string
}

export function SearchInput({
  initialQuery = '',
  placeholder = 'Search seeds, plants, pots...',
  className = '',
  inputClassName = '',
  onSearchSubmitted,
  autoFocus = false,
  id = 'storefront-search',
}: SearchInputProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/store?q=${encodeURIComponent(trimmed)}`)
      onSearchSubmitted?.()
    } else {
      router.push('/store')
      onSearchSubmitted?.()
    }
  }

  const handleClear = () => {
    setQuery('')
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative flex items-center ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Search seeds, plants, and botanical supplies
      </label>
      <Search
        className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full h-9 rounded-full border border-border bg-earth-50/80 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-botanical-600 focus:bg-background transition-all ${inputClassName}`}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-earth-200 transition-colors"
          aria-label="Clear search query"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </form>
  )
}
