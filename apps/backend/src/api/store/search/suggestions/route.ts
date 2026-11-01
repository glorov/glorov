import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { sendSanitizedError } from '../../../../utils/error-handler'

export const AUTHENTICATE = false

export interface SearchSuggestionItem {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  category?: string
  price?: number
}

export const DEFAULT_TRENDING_SEARCHES = [
  'Monstera Deliciosa',
  'Snake Plant',
  'Bonsai Tree',
  'Ceramic Pots',
  'Organic Neem Oil',
  'Cherry Tomato Seeds',
  'Basil Seeds',
  'Peace Lily',
  'Succulents',
  'Vegetable Seeds',
]

/**
 * GET /store/search/suggestions
 * Provides instant search suggestions, matching category pills,
 * top product visual previews, and trending searches.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const { q, limit } = (req.query || {}) as {
    q?: string
    limit?: string
  }

  const cleanQuery = typeof q === 'string' ? q.trim().toLowerCase() : ''
  const maxResults = Math.min(Math.max(parseInt(limit || '6', 10) || 6, 1), 20)

  try {
    const suggestionsSet = new Set<string>()
    const categorySet = new Set<string>()
    const productResults: SearchSuggestionItem[] = []

    if (cleanQuery.length > 0) {
      // Query Medusa database for matching products if container query is available
      try {
        const query = req.scope?.resolve?.(ContainerRegistrationKeys.QUERY)
        if (query?.graph) {
          const { data: products } = await query.graph({
            entity: 'product',
            fields: [
              'id',
              'title',
              'handle',
              'thumbnail',
              'categories.name',
              'variants.prices.amount',
            ],
            filters: {
              title: { $ilike: `%${cleanQuery}%` },
            },
            pagination: { take: maxResults },
          })

          if (Array.isArray(products)) {
            for (const p of products as any[]) {
              if (p.title) {
                suggestionsSet.add(p.title)
              }
              if (p.categories && Array.isArray(p.categories)) {
                for (const c of p.categories) {
                  if (c.name) categorySet.add(c.name)
                }
              }
              const firstPrice = p.variants?.[0]?.prices?.[0]?.amount
              productResults.push({
                id: p.id,
                title: p.title,
                handle: p.handle || p.id,
                thumbnail: p.thumbnail || null,
                category: p.categories?.[0]?.name,
                price: typeof firstPrice === 'number' ? firstPrice / 100 : undefined,
              })
            }
          }
        }
      } catch {
        // Fallback gracefully in testing or isolated runtime
      }

      // Match against botanical trending searches
      for (const t of DEFAULT_TRENDING_SEARCHES) {
        if (t.toLowerCase().includes(cleanQuery)) {
          suggestionsSet.add(t)
        }
      }
    }

    res.status(200).json({
      query: cleanQuery,
      suggestions: Array.from(suggestionsSet).slice(0, 8),
      categories: Array.from(categorySet).slice(0, 5),
      products: productResults.slice(0, 6),
      trending: DEFAULT_TRENDING_SEARCHES,
    })
  } catch (error: unknown) {
    sendSanitizedError(res, error, {
      req,
      operation: 'GET /store/search/suggestions',
    })
  }
}
