import { CLOUDINARY_CLOUD_NAME } from '../constants'

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'scale' | 'fit' | 'thumb'
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg'
  blur?: number
}

/**
 * Checks whether the given image URL is hosted on Cloudinary.
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('res.cloudinary.com')
}

/**
 * Optimises a Cloudinary URL or fallback image with desired width, height, and format.
 *
 * @param url - Original image URL.
 * @param options - Transformation settings.
 * @returns Optimised image URL.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url) {
    return '/logo/glorov-logo.svg'
  }

  // If not a Cloudinary image, return original
  if (!isCloudinaryUrl(url)) {
    return url
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    blur,
  } = options

  const transforms: string[] = [`f_${format}`, `q_${quality}`]
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (width || height) transforms.push(`c_${crop}`)
  if (blur) transforms.push(`e_blur:${blur}`)

  const transformString = transforms.join(',')

  // Replace /upload/ with /upload/<transforms>/
  return url.replace('/upload/', `/upload/${transformString}/`)
}

/**
 * Builds a direct Cloudinary URL from a public ID within the glorov folder.
 *
 * @param publicId - Asset public identifier.
 * @param options - Transformation parameters.
 * @returns Full Cloudinary delivery URL.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const cleanId = publicId.startsWith('glorov/') ? publicId : `glorov/${publicId}`
  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`
  return getOptimizedImageUrl(`${base}${cleanId}`, options)
}

/**
 * Generates an ultra-low-bandwidth, tiny thumbnail preview (LQIP) URL.
 * Reduces bandwidth requirements from ~200KB-1MB down to ~600 bytes.
 * This loads almost instantaneously so the page renders visual content immediately,
 * before the full high-definition image finishes loading and cross-fades into view.
 *
 * @param url - Original high-resolution image URL.
 * @param options - Optional custom width/quality overrides.
 * @returns Micro-size low quality thumbnail URL.
 */
export function getLowQualityImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number; blur?: number } = {}
): string {
  if (!url || typeof url !== 'string') return ''

  // SVGs are vector and scalable, no need for raster downsampling
  if (url.endsWith('.svg')) return url

  // Special handling for local hero image
  if (url.includes('/images/monstera_deliciosa_hero.jpg')) {
    return '/images/monstera_deliciosa_hero_thumb.jpg'
  }

  // If Cloudinary URL, request a tiny 40px micro-thumbnail with low quality and auto format
  if (isCloudinaryUrl(url)) {
    const width = options.width ?? 40
    const quality = options.quality ?? 20
    const blur = options.blur ?? 50
    return getOptimizedImageUrl(url, {
      width,
      quality,
      blur,
      format: 'auto',
    })
  }

  return url
}

/**
 * Returns a lightweight inline SVG shimmer blurDataURL in GLOROV botanical colors.
 * Used for zero-latency, zero-bandwidth inline placeholders.
 */
export function getBotanicalBlurDataUrl(
  primaryColor: string = '#E9EFE8',
  accentColor: string = '#D8E2D6'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><rect width="8" height="5" fill="${primaryColor}"/><rect width="8" height="5" fill="${accentColor}" opacity="0.3"/></svg>`
  if (typeof window === 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  }
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

