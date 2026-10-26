import React from 'react'
import Link from 'next/link'
import { Sprout, Leaf, ArrowRight, ShieldCheck, Sun, Droplets } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface ProductPreviewItem {
  id: string
  variantId?: string
  title: string
  botanicalName: string
  category: 'seeds' | 'plants' | 'planters' | 'care'
  categoryLabel: string
  pricePaise: number
  isPerishable: boolean
  sunlight: string
  sowingSeason?: string
  germination?: string
  description: string
}

const FEATURED_PRODUCTS: ProductPreviewItem[] = [
  {
    id: 'prod-001',
    variantId: 'variant_01M5TY5X6NG1JSFXP50NNKS3J8', // Tomato Seeds 20 Seeds
    title: 'Desi Pusa Ruby Tomato Seeds',
    botanicalName: 'Solanum lycopersicum',
    category: 'seeds',
    categoryLabel: 'Pure Seed Packet',
    pricePaise: 4900, // ₹49
    isPerishable: false,
    sunlight: 'Full Sun (6h+)',
    sowingSeason: 'All-Year Sowing',
    germination: '92% Viability',
    description: 'High-yield indigenous indeterminate tomato seeds suited for Indian home containers.',
  },
  {
    id: 'prod-002',
    variantId: 'variant_01M5TY5XJ5YBJ2G7K92KKH3S2E', // Snake plant 4-inch
    title: 'Golden Hahnii Sansevieria (Snake Plant)',
    botanicalName: 'Sansevieria trifasciata',
    category: 'plants',
    categoryLabel: 'Live Potted Plant',
    pricePaise: 19900, // ₹199
    isPerishable: true,
    sunlight: 'Low to Indirect Light',
    germination: 'Air Purifying',
    description: 'Hardy compact succulent potted in a 4-inch grower pot with root coco-peat transit shield.',
  },
  {
    id: 'prod-003',
    variantId: 'variant_01M5TY5XBZ34B05GGCQ2ZSDEES', // Marigold 50 Seeds
    title: 'African Marigold Giant Yellow Seeds',
    botanicalName: 'Tagetes erecta',
    category: 'seeds',
    categoryLabel: 'Flower Seeds',
    pricePaise: 3900, // ₹39
    isPerishable: false,
    sunlight: 'Direct Sunlight',
    sowingSeason: 'Monsoon / Winter',
    germination: '88% Viability',
    description: 'Vibrant pest-repellent floral seeds ideal for companion planting and festive blooms.',
  },
  {
    id: 'prod-004',
    variantId: 'variant_01M5TY5XFCFX45YG239PKMFPH6', // Krishna Tulsi 100 Seeds
    title: 'Krishna Tulsi Holy Basil Seeds',
    botanicalName: 'Ocimum tenuiflorum',
    category: 'seeds',
    categoryLabel: 'Pure Seed Packet',
    pricePaise: 4500, // ₹45
    isPerishable: false,
    sunlight: 'Full Sun to Partial',
    germination: 'High Germination',
    description: 'Sacred purple-tinged medicinal basil with potent anti-microbial aroma and high germination.',
  },
]

export function ProductPlaceholderGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="botanical" className="text-xs">
                Seasonal Selection
              </Badge>
              <span className="text-xs text-muted-foreground">Catalog Preview Foundation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-botanical-950">
              Curated Botanical &amp; Seed Varieties
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Preview of our certified seed batches and climate-acclimatized nursery plants ready for express pan-India dispatch.
            </p>
          </div>

          <Button asChild variant="outline" className="self-start md:self-auto gap-2">
            <Link href="/categories/seeds">
              <span>View Full Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className="flex flex-col justify-between hover:shadow-md hover:border-botanical-300 transition-all group overflow-hidden bg-card"
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                {/* Visual Category / Perishable Badges */}
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={product.category === 'seeds' ? 'botanical' : 'earth'}
                    className="text-[11px]"
                  >
                    {product.category === 'seeds' ? (
                      <Sprout className="h-3 w-3 mr-1" />
                    ) : (
                      <Leaf className="h-3 w-3 mr-1" />
                    )}
                    {product.categoryLabel}
                  </Badge>

                  {product.isPerishable ? (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Express Air
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      COD PAN-India
                    </span>
                  )}
                </div>

                {/* Botanical Visual Placeholder Container */}
                <div className="h-44 w-full rounded-lg bg-earth-50 border flex flex-col items-center justify-center p-4 text-center group-hover:bg-botanical-50/50 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center text-botanical-700 shadow-sm mb-2">
                    {product.category === 'seeds' ? (
                      <Sprout className="h-6 w-6" />
                    ) : (
                      <Leaf className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs italic text-muted-foreground font-serif">
                    {product.botanicalName}
                  </span>
                  <span className="text-[11px] text-botanical-700 font-medium mt-1">
                    {product.germination || product.sowingSeason}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-botanical-900 group-hover:text-botanical-700 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-1 pb-3">
                {/* Quick Care Attributes */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground py-2 border-t border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{product.sunlight}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">
                      {product.isPerishable ? 'Hydrated Wrap' : 'Dry Sealed'}
                    </span>
                  </div>
                </div>

                {/* Price Display in INR */}
                <div className="flex items-baseline justify-between mt-3">
                  <div>
                    <span className="text-lg font-bold text-botanical-950">
                      {formatINR(product.pricePaise)}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1">
                      (incl. taxes)
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    <span>In Stock</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                {product.variantId ? (
                  <AddToCartButton
                    variantId={product.variantId}
                    label="Add to Botanical Cart"
                    className="w-full"
                  />
                ) : (
                  <Button asChild variant="botanical" size="sm" className="w-full">
                    <Link href={`/products/${product.id}`}>
                      Select Variant / Size
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
