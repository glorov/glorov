import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sprout, Sparkles, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeroProps {
  backendOnline?: boolean
}

export function Hero({ backendOnline }: HeroProps = {}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-earth-100/60 via-background to-background py-16 md:py-24 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2">
              <Badge variant="botanical" className="gap-1.5 py-1 px-3 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Monsoon &amp; Winter Sowing Season Open</span>
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-botanical-950 leading-[1.15]">
              Cultivate Vitality.{' '}
              <span className="text-botanical-700 block mt-1">
                Living Botanicals &amp; Pure Seeds.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Premium high-viability garden seeds and climate-hardened indoor live plants, shipped in breathable, shock-absorbing transit crates directly to your doorstep across India.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button asChild size="lg" variant="botanical" className="w-full sm:w-auto shadow-md">
                <Link href="/categories/seeds" className="gap-2">
                  <span>Explore Seeds Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="earth" className="w-full sm:w-auto">
                <Link href="/categories/live-plants" className="gap-2">
                  <Sprout className="h-4 w-4 text-botanical-700" />
                  <span>Shop Indoor Plants</span>
                </Link>
              </Button>
            </div>

            {/* Key Assurance Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-bold text-botanical-900">Desi</p>
                <p className="text-xs text-muted-foreground font-medium">Heirloom Varieties</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-botanical-900">Pune Hub</p>
                <p className="text-xs text-muted-foreground font-medium">Pan-India Dispatch</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-botanical-900">Express</p>
                <p className="text-xs text-muted-foreground font-medium">Air Route Available</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual / Highlight Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-botanical-50 to-earth-100 border border-botanical-200/80 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="warning" className="text-xs">
                    Root-Safe Packing
                  </Badge>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${backendOnline !== false ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
                    Pune Propagation Hub
                  </span>
                </div>

                <div className="h-56 rounded-xl bg-botanical-900/5 border border-dashed border-botanical-300 flex flex-col items-center justify-center p-6 text-center text-botanical-900 space-y-3">
                  <div className="h-14 w-14 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shadow-inner">
                    <Sprout className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-botanical-900">Botanical Transit Packaging</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Moisture-retaining root coco-peat wraps and ventilated crates protect foliage vitality during transit.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-botanical-600 shrink-0" />
                  <span>Protective transit packaging designed for interstate travel across India.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
