import React from 'react'
import { Shield, Sparkles, MapPin, ThermometerSnowflake } from 'lucide-react'

const VALUES = [
  {
    icon: ThermometerSnowflake,
    title: 'Climate-Hardened Nursery Plants',
    description:
      'Our live plants undergo outdoor hardening in Indian temperature cycles before transit, reducing thermal shock upon arrival.',
  },
  {
    icon: Sparkles,
    title: '90%+ Seed Germination Tested',
    description:
      'Every seed lot is batch-tested for germination viability under ambient tropical humidity conditions. No expired or dead seed packets.',
  },
  {
    icon: MapPin,
    title: '24,000+ PIN Code Direct Routing',
    description:
      'Integrated multi-courier express dispatch ensuring sensitive botanical parcels avoid multi-day transit hub bottlenecks.',
  },
  {
    icon: Shield,
    title: 'Zero-Risk Transit Guarantee',
    description:
      'If any botanical arrives wilted or damaged in transit, share a photo within 24 hours for an immediate free replacement or refund.',
  },
]

export function ValuePropositions() {
  return (
    <section className="py-16 bg-earth-100/50 border-t border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-botanical-700 font-bold mb-2">
            The GLOROV Standard
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
            Engineered Specifically For Live Botanical E-commerce
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((val) => {
            const Icon = val.icon
            return (
              <div
                key={val.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-background border shadow-xs hover:border-botanical-300 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-botanical-100 flex items-center justify-center text-botanical-700 mb-4 shadow-inner">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-botanical-900 mb-2">
                  {val.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {val.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
