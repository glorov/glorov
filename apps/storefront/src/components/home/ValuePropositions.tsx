import React from 'react'
import { Shield, Sparkles, MapPin, ThermometerSnowflake } from 'lucide-react'

const VALUES = [
  {
    icon: ThermometerSnowflake,
    title: 'Climate-Hardened Nursery Plants',
    description:
      'Our live plants undergo outdoor hardening in Indian temperature cycles before transit, reducing shock upon arrival.',
  },
  {
    icon: Sparkles,
    title: 'High-Viability Desi Seeds',
    description:
      'Carefully harvested and stored Indian heirloom seeds calibrated for domestic home gardening across seasons.',
  },
  {
    icon: MapPin,
    title: 'Pan-India Direct Delivery',
    description:
      'Direct dispatch from our central Pune nursery with standard ground and express air transit options.',
  },
  {
    icon: Shield,
    title: 'Protective Botanical Packaging',
    description:
      'Ventilated crates and moisture-retaining coco-peat root wraps ensure live foliage arrives healthy and hydrated.',
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
