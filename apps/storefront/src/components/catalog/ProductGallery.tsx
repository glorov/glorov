'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Sprout, ImageIcon } from 'lucide-react'

interface ProductGalleryProps {
  title: string
  thumbnail: string | null
  images?: { id: string; url: string }[]
}

export function ProductGallery({ title, thumbnail, images = [] }: ProductGalleryProps) {
  // Build clean list of unique image URLs
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (thumbnail && thumbnail.trim()) {
      list.push(thumbnail.trim())
    }
    for (const img of images) {
      if (img.url && img.url.trim() && !list.includes(img.url.trim())) {
        list.push(img.url.trim())
      }
    }
    return list
  }, [thumbnail, images])

  const [activeIndex, setActiveIndex] = useState(0)
  const [loadError, setLoadError] = useState(false)

  const activeImage = allImages[activeIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Viewport with Fixed Aspect Ratio to Prevent Cumulative Layout Shifts (CLS) */}
      <div
        className="relative aspect-square w-full rounded-2xl border border-border/80 bg-earth-50 overflow-hidden flex items-center justify-center shadow-xs group"
        aria-label={`${title} image gallery viewport`}
      >
        {activeImage && !loadError ? (
          <>
            <Image
              src={activeImage}
              alt={`${title} - Photograph ${activeIndex + 1}`}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              unoptimized
              onError={() => setLoadError(true)}
              className="object-cover object-center transition-all duration-300 group-hover:scale-102"
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full pointer-events-none">
                {activeIndex + 1} / {allImages.length}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-botanical-700 space-y-3">
            <div className="h-16 w-16 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shadow-inner">
              <Sprout className="h-9 w-9" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-sm text-botanical-950">GLOROV Botanical Specimen</p>
              <p className="text-xs text-muted-foreground mt-0.5">Authentic Indian nursery seed packet</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/75 pt-1">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Photograph verification pending</span>
            </div>
          </div>
        )}
      </div>

      {/* Accessible Responsive Thumbnails Strip */}
      {allImages.length > 1 && (
        <div
          role="tablist"
          aria-label="Product Image Thumbnails"
          className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none"
        >
          {allImages.map((img, idx) => {
            const isSelected = idx === activeIndex
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-label={`View photo ${idx + 1} of ${allImages.length} for ${title}`}
                onClick={() => {
                  setActiveIndex(idx)
                  setLoadError(false)
                }}
                onKeyDown={(e) => {
                  let nextIdx = idx
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    nextIdx = (idx + 1) % allImages.length
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    nextIdx = (idx - 1 + allImages.length) % allImages.length
                  }
                  if (nextIdx !== idx) {
                    setActiveIndex(nextIdx)
                    setLoadError(false)
                    const parent = e.currentTarget.parentElement
                    const tabs = parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                    tabs?.[nextIdx]?.focus()
                  }
                }}
                className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 cursor-pointer ${
                  isSelected
                    ? 'border-botanical-700 ring-2 ring-botanical-600/30 shadow-xs scale-102'
                    : 'border-border/60 hover:border-botanical-400 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-cover object-center"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
