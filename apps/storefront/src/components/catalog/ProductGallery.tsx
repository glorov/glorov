'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Sprout, ImageIcon } from 'lucide-react'
import styles from './ProductGallery.module.css'

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
    <div className={styles.galleryContainer}>
      {/* Main Image Viewport with Fixed Aspect Ratio */}
      <div
        className={styles.mainViewport}
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
              onError={() => setLoadError(true)}
              className={styles.mainImage}
            />
            {/* Verified Badge */}
            <div className={styles.verifiedBadge}>
              <span className={styles.greenDot} aria-hidden="true" />
              <span>Verified Botanical Specimen</span>
            </div>
            {allImages.length > 1 && (
              <div className={styles.counterBadge}>
                {activeIndex + 1} / {allImages.length}
              </div>
            )}
          </>
        ) : (
          <div className={styles.placeholderWrap}>
            <div className={styles.placeholderIcon}>
              <Sprout size={32} aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ugaoo-text-dark)', margin: 0 }}>GLOROV Botanical Specimen</p>
              <p style={{ fontSize: '12px', color: 'var(--ugaoo-text-muted)', margin: '4px 0 0 0' }}>Authentic Indian nursery seed packet</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--ugaoo-text-muted)', marginTop: '4px' }}>
              <ImageIcon size={14} aria-hidden="true" />
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
          className={styles.thumbnailStrip}
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
                  if (e.key === 'ArrowRight') {
                    const next = (idx + 1) % allImages.length
                    setActiveIndex(next)
                    setLoadError(false)
                  } else if (e.key === 'ArrowLeft') {
                    const prev = (idx - 1 + allImages.length) % allImages.length
                    setActiveIndex(prev)
                    setLoadError(false)
                  }
                }}
                className={`${styles.thumbnailBtn} ${isSelected ? styles.thumbnailActive : ''}`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="68px"
                  className={styles.thumbImage}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
