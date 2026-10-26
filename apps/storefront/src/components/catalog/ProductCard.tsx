'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sprout, Leaf, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import type { StoreCatalogProduct } from '@glorov/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getProductLowestPriceINR,
  getProductStockSummary,
} from '@/lib/catalog'

interface ProductCardProps {
  product: StoreCatalogProduct
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const priceInfo = getProductLowestPriceINR(product)
  const stockSummary = getProductStockSummary(product)

  // Botanical metadata
  const metadata = (product.metadata || {}) as Record<string, unknown>
  const botanicalName = typeof metadata.botanical_name === 'string' ? metadata.botanical_name : undefined
  const isPerishable = Boolean(metadata.is_perishable)
  const season = typeof metadata.season === 'string' ? metadata.season : undefined
  const sunlight = typeof metadata.sunlight === 'string' ? metadata.sunlight : undefined

  // Determine category badge
  const categoryHandle = product.categories?.[0]?.handle || ''
  const isSeed = categoryHandle.includes('seed') || (!isPerishable && !categoryHandle.includes('plant'))

  return (
    <Card className="flex flex-col justify-between hover:shadow-md hover:border-botanical-300 transition-all duration-200 group overflow-hidden bg-card border-border/80">
      <CardHeader className="p-4 pb-2 space-y-2.5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isSeed ? 'botanical' : 'earth'}
            className="text-[11px] font-medium py-0.5 px-2"
          >
            {isSeed ? (
              <Sprout className="h-3 w-3 mr-1" aria-hidden="true" />
            ) : (
              <Leaf className="h-3 w-3 mr-1" aria-hidden="true" />
            )}
            <span>{isSeed ? 'Seed Variety' : 'Live Botanical'}</span>
          </Badge>

          {isPerishable ? (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Express Air
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Safe Transit
            </span>
          )}
        </div>

        {/* Thumbnail Container */}
        <Link
          href={`/products/${product.handle}`}
          className="relative aspect-square w-full rounded-lg bg-earth-50 border border-border/60 overflow-hidden flex items-center justify-center group-hover:bg-earth-100/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600"
          aria-label={`View ${product.title}`}
        >
          {product.thumbnail && !imageError ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              unoptimized
              onError={() => setImageError(true)}
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center text-botanical-600">
              <div className="h-12 w-12 rounded-full bg-botanical-100 flex items-center justify-center mb-2">
                {isSeed ? (
                  <Sprout className="h-6 w-6 text-botanical-700" />
                ) : (
                  <Leaf className="h-6 w-6 text-botanical-700" />
                )}
              </div>
              <span className="text-xs font-semibold text-botanical-900">GLOROV Nursery</span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!stockSummary.hasStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2.5 py-1 rounded border border-destructive/30">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {/* Title & Botanical Name */}
        <div>
          {botanicalName && (
            <p className="text-xs italic text-muted-foreground font-serif truncate">
              {botanicalName}
            </p>
          )}
          <h3 className="font-bold text-sm sm:text-base text-botanical-950 group-hover:text-botanical-700 transition-colors line-clamp-1 mt-0.5">
            <Link
              href={`/products/${product.handle}`}
              className="focus-visible:outline-none focus-visible:underline"
            >
              {product.title}
            </Link>
          </h3>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 pb-3 space-y-2">
        {/* Quick Tag Row */}
        {(season || sunlight) && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            {season && (
              <span className="capitalize font-medium text-botanical-800">
                Season: {season}
              </span>
            )}
            {season && sunlight && <span>•</span>}
            {sunlight && (
              <span className="capitalize text-muted-foreground">
                {sunlight.replace('_', ' ')}
              </span>
            )}
          </div>
        )}

        {/* Price & Stock Indicator */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-base sm:text-lg font-black text-botanical-950">
              {priceInfo.formatted}
            </span>
            <span className="text-[10px] text-muted-foreground ml-1">
              (incl. taxes)
            </span>
          </div>

          <div>
            {stockSummary.status === 'out_of_stock' ? (
              <span className="text-[10px] font-semibold text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Sold Out</span>
              </span>
            ) : stockSummary.status === 'low_stock' ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Only {stockSummary.totalStock} left
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>In Stock</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          variant="botanical"
          size="sm"
          className="w-full text-xs font-semibold gap-1.5 justify-center"
        >
          <Link href={`/products/${product.handle}`}>
            <span>Select Options</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
