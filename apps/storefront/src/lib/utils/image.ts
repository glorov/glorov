import { CLOUDINARY_CLOUD_NAME } from '../constants'

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'scale' | 'fit' | 'thumb'
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg'
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
  if (!url.includes('res.cloudinary.com')) {
    return url
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options

  const transforms: string[] = [`f_${format}`, `q_${quality}`]
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (width || height) transforms.push(`c_${crop}`)

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
