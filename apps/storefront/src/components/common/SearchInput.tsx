'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2, Sprout, ArrowRight } from 'lucide-react'
import styles from './SearchInput.module.css'

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
  placeholder = 'Search live plants, organic seeds, varieties...',
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

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsLoading(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}&limit=6`, {
        signal: abortControllerRef.current.signal,
      })

      if (!res.ok) {
        throw new Error('Search failed')
      }

      const data = await res.json()
      if (data.success && Array.isArray(data.products)) {
        setSuggestions(data.products)
        setIsOpen(true)
        setSelectedIndex(-1)
      } else {
        setSuggestions([])
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setSuggestions([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [showLiveDropdown])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(trimmed)
    }, 250)

    return () => clearTimeout(timer)
  }, [query, fetchSuggestions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)

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
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <form role="search" onSubmit={handleSubmit} className={styles.searchForm}>
        <label htmlFor={id} className={styles.srOnly}>
          Search seeds, plants, and botanical supplies
        </label>
        <Search className={styles.searchIcon} aria-hidden="true" />

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
          aria-label="Search seeds, plants, and botanical supplies"
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
          className={`${styles.searchInput} ${inputClassName}`}
        />

        <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
          {isOpen && suggestions.length > 0
            ? `${suggestions.length} botanical suggestions found. Use arrow keys to navigate.`
            : ''}
        </div>

        <div className={styles.actionsRight}>
          {isLoading && (
            <Loader2
              size={14}
              className={styles.spinner}
              style={{ color: 'var(--ugaoo-green)' }}
              aria-label="Searching catalog..."
            />
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearBtn}
              aria-label="Clear search query"
            >
              <X size={12} />
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
          className={styles.dropdown}
        >
          {suggestions.length > 0 ? (
            <div>
              <div className={styles.dropdownHeader}>
                <span>Botanical Suggestions</span>
                <span style={{ color: 'var(--ugaoo-maroon)', fontWeight: 600 }}>
                  {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <ul className={styles.suggestionsList}>
                {suggestions.map((item, index) => {
                  const isSelected = selectedIndex === index
                  return (
                    <li
                      key={item.id}
                      id={`${id}-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`${styles.suggestionItem} ${isSelected ? styles.suggestionSelected : ''}`}
                    >
                      <Link
                        href={`/products/${item.handle}`}
                        onClick={() => {
                          setIsOpen(false)
                          onSearchSubmitted?.()
                        }}
                        className={styles.suggestionLink}
                      >
                        <div className={styles.thumbWrap}>
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={40}
                              height={40}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Sprout size={20} style={{ color: 'var(--ugaoo-green)' }} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={styles.itemTitle}>{item.title}</p>
                          <div className={styles.itemMeta}>
                            {item.variety && <span>{item.variety}</span>}
                            {item.variety && item.categoryName && <span>•</span>}
                            {item.categoryName && <span>{item.categoryName}</span>}
                          </div>
                        </div>

                        <div className={styles.priceBlock}>
                          <span className={styles.priceText}>{item.priceFormatted}</span>
                          <span className={`${styles.stockStatus} ${item.hasStock ? styles.inStock : styles.outOfStock}`}>
                            {item.hasStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className={styles.viewAllFooter}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.viewAllBtn}
                >
                  <span>View all results for &ldquo;{query.trim()}&rdquo;</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--ugaoo-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ugaoo-green)' }}>
                <Search size={16} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ugaoo-text-dark)', margin: 0 }}>
                No botanical varieties matching &ldquo;{query.trim()}&rdquo;
              </p>
              <p style={{ fontSize: '11px', color: 'var(--ugaoo-text-muted)', margin: 0 }}>
                Try searching for general terms like &ldquo;tomato&rdquo;, &ldquo;marigold&rdquo;, or &ldquo;tulsi&rdquo;.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function SearchInput(props: SearchInputProps) {
  return (
    <React.Suspense fallback={<div className={styles.fallbackInput} />}>
      <SearchInputInner {...props} />
    </React.Suspense>
  )
}
