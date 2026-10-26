'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Sprout } from 'lucide-react'

interface ProductGalleryProps {
  title: string
  thumbnail: string | null
  images?: { id: string; url: string }[]
}

export function ProductGallery({ title, thumbnail, images = [] }: ProductGalleryProps) {
  // Build clean list of unique image URLs
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (thumbnail) list.push(thumbnail)
    for (const img of images) {
      if (img.url && !list.includes(img.url)) {
        list.push(img.url)
      }
    }
    return list
  }, [thumbnail, images])

  const [activeIndex, setActiveIndex] = useState(0)
  const [loadError, setLoadError] = useState(false)

  const activeImage = allImages[activeIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Frame */}
      <div className="relative aspect-square w-full rounded-2xl border border-border/80 bg-earth-50 overflow-hidden flex items-center justify-center shadow-xs">
        {activeImage && !loadError ? (
          <Image
            src={activeImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            unoptimized
            onError={() => setLoadError(true)}
            className="object-cover object-center transition-all duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-botanical-700 space-y-3">
            <div className="h-16 w-16 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shadow-inner">
              <Sprout className="h-9 w-9" />
            </div>
            <div>
              <p className="font-bold text-sm text-botanical-950">GLOROV Botanical Specimen</p>
              <p className="text-xs text-muted-foreground mt-0.5">Authentic Indian nursery seed packet</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Bar (if multiple images) */}
      {allImages.length > 1 && (
        <div
          role="tablist"
          aria-label="Product Images"
          className="flex gap-3 overflow-x-auto pb-2"
        >
          {allImages.map((img, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === activeIndex}
              onClick={() => {
                setActiveIndex(idx)
                setLoadError(false)
              }}
              className={`relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 ${
                idx === activeIndex
                  ? 'border-botanical-700 ring-2 ring-botanical-600/30 shadow-xs'
                  : 'border-border/60 hover:border-botanical-400 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${title} view ${idx + 1}`}
                fill
                sizes="80px"
                unoptimized
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
