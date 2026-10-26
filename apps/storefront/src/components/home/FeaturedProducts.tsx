import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { getStoreCatalogProducts } from '@/lib/catalog'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export async function FeaturedProducts() {
  const response = await getStoreCatalogProducts({ limit: 4 })
  const products = response.success ? response.products : []

  return (
    <section id="catalog" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="botanical" className="text-xs gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Featured Collection</span>
              </Badge>
              <span className="text-xs text-muted-foreground">Pune Nursery Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-botanical-950">
              Featured Seeds &amp; Botanicals
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Authentic Indian varieties with active variant pricing, multi-tier packet sizes, and real-time Pune nursery inventory.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="self-start md:self-auto gap-2 text-xs">
            <Link href="/store">
              <span>View Full Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          emptyMessage="Connect your Medusa backend to populate live botanical catalog products."
          resetHref="/store"
        />
      </div>
    </section>
  )
}
