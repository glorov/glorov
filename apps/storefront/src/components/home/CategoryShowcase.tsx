import React from 'react'
import Link from 'next/link'
import {
  Sprout,
  Flower2,
  Leaf,
  Container,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = [
  {
    title: 'Desi Vegetable Seeds',
    handle: 'vegetable-seeds',
    fallbackHref: '/categories/seeds',
    description: 'Indigenous high-yield heirloom tomato, chilli, and seasonal vegetable varieties.',
    icon: Sprout,
    badge: 'Seasonal Sowing',
    badgeVariant: 'botanical' as const,
  },
  {
    title: 'Festive Flower Seeds',
    handle: 'flower-seeds',
    fallbackHref: '/categories/seeds',
    description: 'Vibrant marigold and pollinator-friendly garden blooms.',
    icon: Flower2,
    badge: 'Companion Flora',
    badgeVariant: 'warning' as const,
  },
  {
    title: 'Medicinal & Herb Seeds',
    handle: 'herb-seeds',
    fallbackHref: '/categories/seeds',
    description: 'Krishna Tulsi, aromatic coriander, and culinary herb seeds.',
    icon: Sparkles,
    badge: 'Herb Garden',
    badgeVariant: 'botanical' as const,
  },
  {
    title: 'Live Indoor Plants',
    handle: 'indoor-plants',
    fallbackHref: '/categories/live-plants',
    description: 'Sansevieria and resilient potted foliage plants adapted for domestic spaces.',
    icon: Leaf,
    badge: 'Indoor Foliage',
    badgeVariant: 'earth' as const,
  },
  {
    title: 'Pots & Planters',
    handle: 'planters-pots',
    fallbackHref: '/categories/planters-pots',
    description: 'Ceramic planters, terracotta pots, and durable nursery containers.',
    icon: Container,
    badge: 'Drainage Calibrated',
    badgeVariant: 'earth' as const,
  },
  {
    title: 'All Garden Seeds',
    handle: 'seeds',
    fallbackHref: '/categories/seeds',
    description: 'Explore the complete seed bank of vegetable, flower, and medicinal varieties.',
    icon: ShieldCheck,
    badge: 'Complete Seed Bank',
    badgeVariant: 'botanical' as const,
  },
]

export function CategoryShowcase() {
  return (
    <section className="py-16 bg-earth-50/60 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="botanical" className="text-xs">
                Botanical Taxonomy
              </Badge>
              <span className="text-xs text-muted-foreground">Pan-India Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-botanical-950">
              Browse by Botanical Category
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              From indigenous Desi seeds to climate-hardened live houseplants, explore our specialized nursery collections.
            </p>
          </div>

          <Link
            href="/store"
            className="text-xs sm:text-sm font-bold text-botanical-700 hover:text-botanical-800 inline-flex items-center gap-1.5 self-start md:self-auto group"
          >
            <span>Explore All Collections</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.handle}
                href={`/categories/${cat.handle}`}
                className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 rounded-xl"
              >
                <Card className="p-5 h-full flex flex-col justify-between hover:shadow-md hover:border-botanical-400 transition-all bg-card border-border/70 group-hover:bg-earth-50/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-botanical-100 flex items-center justify-center text-botanical-700 shadow-inner group-hover:bg-botanical-700 group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <Badge variant={cat.badgeVariant} className="text-[10px] py-0.5 px-2">
                        {cat.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-botanical-950 group-hover:text-botanical-700 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-botanical-700 group-hover:text-botanical-900">
                    <span>Shop Varieties</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
