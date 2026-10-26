import { NextRequest, NextResponse } from 'next/server'
import {
  searchStorefrontProducts,
  getProductLowestPriceINR,
  getProductStockSummary,
} from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')?.trim() || ''
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '5', 10) || 5))

    if (!q) {
      return NextResponse.json({
        success: true,
        count: 0,
        products: [],
      })
    }

    const products = await searchStorefrontProducts(q, limit)

    const items = products.map((p) => {
      const price = getProductLowestPriceINR(p)
      const stock = getProductStockSummary(p)
      const meta = (p.metadata || {}) as Record<string, unknown>

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail,
        commonName: typeof meta.common_name === 'string' ? meta.common_name : null,
        variety: typeof meta.variety === 'string' ? meta.variety : null,
        categoryName: p.categories?.[0]?.name || null,
        categoryHandle: p.categories?.[0]?.handle || null,
        priceFormatted: price.formatted,
        hasStock: stock.hasStock,
        status: stock.status,
      }
    })

    return NextResponse.json(
      {
        success: true,
        count: items.length,
        products: items,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search error'
    return NextResponse.json(
      {
        success: false,
        error: message,
        products: [],
      },
      { status: 500 }
    )
  }
}
