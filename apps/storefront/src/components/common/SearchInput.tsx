'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2, Sprout, ArrowRight } from 'lucide-react'

export interface SearchPreviewItem {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  commonName: string | null
  variety: string | null
  categoryName: string | null
  categoryHandle: string | null
  priceFormatted: string
  hasStock: boolean
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface SearchInputProps {
  initialQuery?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  onSearchSubmitted?: () => void
  autoFocus?: boolean
  id?: string
  showLiveDropdown?: boolean
}

function SearchInputInner({
  initialQuery,
  placeholder = 'Search seeds, plants, pots...',
  className = '',
  inputClassName = '',
  onSearchSubmitted,
  autoFocus = false,
  id = 'storefront-search',
  showLiveDropdown = true,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery ?? urlQuery)
  const [suggestions, setSuggestions] = useState<SearchPreviewItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Sync state if URL query parameter changes
  useEffect(() => {
    if (initialQuery === undefined) {
      setQuery(urlQuery)
    }
  }, [urlQuery, initialQuery])

  // Click or focus outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleFocusOutside(event: FocusEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('focusin', handleFocusOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('focusin', handleFocusOutside)
    }
  }, [])

  // Live debounced search suggestions
  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || !showLiveDropdown) {
      setSuggestions([])
      setIsLoading(false)
      setIsOpen(false)
      return
    }

    // Cancel prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}&limit=5`, {
        signal: abortControllerRef.current.signal,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.products)) {
          setSuggestions(data.products)
          setIsOpen(true)
          setSelectedIndex(-1)
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Request aborted due to new keystroke; ignore
        return
      }
      // Fail gracefully on search errors without disrupting the UI
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [showLiveDropdown])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 250)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query, fetchSuggestions])

  // Form submission: redirect to /store?q=...
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)

    // If an item in dropdown was highlighted via arrow keys, navigate to that product
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const item = suggestions[selectedIndex]
      router.push(`/products/${item.handle}`)
      onSearchSubmitted?.()
      return
    }

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
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form role="search" onSubmit={handleSubmit} className="relative flex items-center">
        <label htmlFor={id} className="sr-only">
          Search seeds, plants, and botanical supplies
        </label>
        <Search
          className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id={id}
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 && query.trim()) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={isOpen ? `${id}-suggestions` : undefined}
          aria-expanded={isOpen}
          aria-activedescendant={
            selectedIndex >= 0 && suggestions[selectedIndex]
              ? `${id}-option-${selectedIndex}`
              : undefined
          }
          className={`w-full h-9 rounded-full border border-border bg-earth-50/80 pl-9 pr-14 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-botanical-600 focus:bg-background transition-all ${inputClassName}`}
        />

        {/* Screen Reader Live Region for Search Results */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isOpen && suggestions.length > 0
            ? `${suggestions.length} botanical suggestions found. Use arrow keys to navigate.`
            : ''}
        </div>

        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading && (
            <Loader2
              className="h-3.5 w-3.5 animate-spin text-botanical-600"
              aria-label="Searching catalog..."
            />
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-earth-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600"
              aria-label="Clear search query"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {/* Live Search Suggestions Dropdown */}
      {showLiveDropdown && isOpen && query.trim() && (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-background border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 max-h-[80vh] sm:max-h-96 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 bg-earth-50/70 border-b border-border/60 text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                <span>Botanical Suggestions</span>
                <span className="text-[10px] text-botanical-700 font-normal">
                  {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <ul className="divide-y divide-border/40">
                {suggestions.map((item, index) => {
                  const isSelected = selectedIndex === index
                  return (
                    <li
                      key={item.id}
                      id={`${id}-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`transition-colors ${
                        isSelected ? 'bg-botanical-50' : 'hover:bg-earth-50/80'
                      }`}
                    >
                      <Link
                        href={`/products/${item.handle}`}
                        onClick={() => {
                          setIsOpen(false)
                          onSearchSubmitted?.()
                        }}
                        className="flex items-center gap-3 p-3 text-xs group"
                      >
                        {/* Thumbnail or Botanical Icon */}
                        <div className="h-10 w-10 rounded-lg bg-earth-100 border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Sprout className="h-5 w-5 text-botanical-600" />
                          )}
                        </div>

                        {/* Title and Botanical Variety Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate group-hover:text-botanical-800 transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                            {item.variety && <span>{item.variety}</span>}
                            {item.variety && item.categoryName && <span>•</span>}
                            {item.categoryName && <span>{item.categoryName}</span>}
                          </div>
                        </div>

                        {/* Price & Stock status */}
                        <div className="text-right shrink-0">
                          <span className="font-bold text-botanical-900 block text-xs">
                            {item.priceFormatted}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              item.hasStock ? 'text-botanical-700' : 'text-amber-700'
                            }`}
                          >
                            {item.hasStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* View All Results CTA Footer */}
              <div className="p-2.5 bg-earth-50 border-t border-border">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-botanical-800 text-white hover:bg-botanical-900 text-xs font-semibold transition-colors shadow-xs"
                >
                  <span>View all results for &ldquo;{query.trim()}&rdquo;</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="p-6 text-center space-y-2">
              <div className="h-9 w-9 rounded-full bg-earth-100 flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No botanical varieties matching &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Try searching for general terms like &ldquo;tomato&rdquo;, &ldquo;marigold&rdquo;, or &ldquo;tulsi&rdquo;.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-botanical-700 hover:text-botanical-900"
                >
                  <span>Search full catalog</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function SearchInput(props: SearchInputProps) {
  return (
    <React.Suspense
      fallback={
        <div className={`relative flex items-center ${props.className || ''}`}>
          <div className="w-full h-9 rounded-full border border-border bg-earth-50/80" />
        </div>
      }
    >
      <SearchInputInner {...props} />
    </React.Suspense>
  )
}

