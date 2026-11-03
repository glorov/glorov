import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../constants'
import { MOCK_BANNERS } from '../mock-data'
import type { BannerSlideItem } from '../../types/storefront'

interface MedusaBannerRaw {
  id: string
  title: string
  subtitle?: string | null
  tag?: string | null
  desktop_image_url?: string | null
  mobile_image_url?: string | null
  cta_text?: string | null
  cta_route?: string | null
  display_order?: number
  is_active?: boolean
  bg_color?: string | null
}

/**
 * Fetches promotional hero banners from Medusa backend /store/banners
 * with ISR caching and fallback to curated MOCK_BANNERS.
 */
export async function getStoreBanners(): Promise<BannerSlideItem[]> {
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/banners`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.banners) && data.banners.length > 0) {
        const activeBanners = data.banners
          .filter((b: MedusaBannerRaw) => b.is_active !== false)
          .sort((a: MedusaBannerRaw, b: MedusaBannerRaw) => (a.display_order ?? 0) - (b.display_order ?? 0))

        if (activeBanners.length > 0) {
          return activeBanners.map((b: MedusaBannerRaw) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle || '',
            tag: b.tag || undefined,
            desktopImageUrl: b.desktop_image_url || '/og-image.jpg',
            mobileImageUrl: b.mobile_image_url || b.desktop_image_url || '/og-image.jpg',
            ctaText: b.cta_text || 'Explore Nursery',
            ctaRoute: b.cta_route || '/categories/seeds',
            bgColor: b.bg_color || undefined,
          }))
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch banners from Medusa backend:', error)
  }

  return MOCK_BANNERS
}
