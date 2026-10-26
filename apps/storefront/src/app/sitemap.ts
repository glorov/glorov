import type { MetadataRoute } from 'next'
import { getStoreCatalogProducts, getStoreCatalogCategories } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://glorov.in'

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Add active catalog categories
  try {
    const categoriesRes = await getStoreCatalogCategories()
    if (categoriesRes.success && categoriesRes.categories) {
      for (const cat of categoriesRes.categories) {
        if (cat.handle) {
          const updatedAt = (cat as unknown as Record<string, unknown>).updated_at
          routes.push({
            url: `${baseUrl}/categories/${cat.handle}`,
            lastModified: typeof updatedAt === 'string' ? new Date(updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
          })
        }
      }
    }
  } catch {
    // Graceful fallback if backend is unreachable
  }

  // Add published catalog products (Medusa Store API only returns published items)
  try {
    const productsRes = await getStoreCatalogProducts({
      limit: 100,
      fields: 'id,handle,updated_at',
    })
    if (productsRes.success && productsRes.products) {
      for (const prod of productsRes.products) {
        if (prod.handle) {
          const updatedAt = (prod as unknown as Record<string, unknown>).updated_at
          routes.push({
            url: `${baseUrl}/products/${prod.handle}`,
            lastModified: typeof updatedAt === 'string' ? new Date(updatedAt) : new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
          })
        }
      }
    }
  } catch {
    // Graceful fallback if backend is unreachable
  }

  return routes
}
