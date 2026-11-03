import { MetadataRoute } from 'next'
import { MOCK_PRODUCTS, CATEGORY_NAV_ITEMS } from '../lib/mock-data'
import { BASE_URL } from '../lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/offers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/policies/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/policies/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/policies/shipping`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_NAV_ITEMS.map((cat) => ({
    url: `${BASE_URL}${cat.route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // Product routes (PDPs)
  const productRoutes: MetadataRoute.Sitemap = MOCK_PRODUCTS.map((prod) => ({
    url: `${BASE_URL}/products/${prod.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.95,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
