import React from 'react'
import {
  Calendar,
  Layers,
  Droplets,
  Sun,
  Compass,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SEASONS = [
  {
    name: 'Kharif Sowing',
    timeline: 'June – October (Monsoon)',
    tag: 'Monsoon Cycle',
    crops: 'Tomato, Chilli, Brinjal, Okra, Cluster Beans',
    tip: 'Elevate containers and ensure unobstructed drainage holes to prevent root rot during torrential showers.',
  },
  {
    name: 'Rabi Sowing',
    timeline: 'October – March (Winter)',
    tag: 'Cool Weather',
    crops: 'Coriander, Spinach, Radish, Fenugreek, Marigold',
    tip: 'Cool nights and mild sun create ideal conditions for lush culinary herbs and high-viability brassicas.',
  },
  {
    name: 'Zaid Sowing',
    timeline: 'March – June (Summer)',
    tag: 'Warm Cycle',
    crops: 'Cucumber, Bitter Gourd, Watermelon, Sunflower',
    tip: 'Mulch container soil surfaces with coco-peat to retain precious moisture against afternoon tropical heat.',
  },
]

const RULES = [
  {
    icon: Layers,
    title: 'The 2× Depth Rule',
    description:
      'Sow seeds at a depth approximately 2 to 3 times their diameter. Fine seeds like Tulsi require light and should only be pressed gently onto moist topsoil.',
  },
  {
    icon: Droplets,
    title: 'Fine Mist Hydration',
    description:
      'Always mist newly sown seeds with a fine spray nozzle. A direct high-pressure hose displaces embryonic roots and buries seeds too deep.',
  },
  {
    icon: Sun,
    title: 'Filtered to Direct Sun',
    description:
      'Keep seed trays in warm, bright indirect light until true leaves develop. Transition gradually over 3–5 days to full outdoor sunlight.',
  },
]

export function GardeningGuide() {
  return (
    <section id="sowing-calendar" className="py-16 bg-earth-50/70 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="botanical" className="text-xs mb-2">
            Horticultural Knowledge
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-botanical-950 tracking-tight">
            Indian Sowing &amp; Cultivation Calendar
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            Cultivate with confidence using seasonal guidelines calibrated specifically for Indian regional weather patterns and container gardening.
          </p>
        </div>

        {/* 3 Indian Agricultural Seasons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {SEASONS.map((season) => (
            <Card
              key={season.name}
              className="bg-card border-border/70 hover:border-botanical-300 transition-colors shadow-2xs"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="earth" className="text-[10px] font-semibold">
                    {season.tag}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-botanical-700" />
                    {season.timeline}
                  </span>
                </div>
                <h3 className="text-base font-bold text-botanical-950">{season.name}</h3>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-botanical-900 block mb-0.5">
                    Recommended Seeds:
                  </span>
                  <p className="text-muted-foreground">{season.crops}</p>
                </div>
                <div className="p-3 rounded-lg bg-earth-100/60 border border-border/40 text-botanical-950/80 leading-relaxed">
                  <span className="font-bold text-botanical-800">Cultivation Note: </span>
                  {season.tip}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3 Golden Germination Rules */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-botanical-900 to-botanical-950 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-botanical-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="h-4 w-4" />
                <span>Nursery Best Practices</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Fundamental Guidelines for High Seed Germination
              </h3>
            </div>
            <p className="text-xs text-botanical-200/80 max-w-sm">
              Tested principles practiced at our Pune propagation facility for optimal emergence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RULES.map((rule) => {
              const Icon = rule.icon
              return (
                <div key={rule.title} className="space-y-2">
                  <div className="h-9 w-9 rounded-lg bg-botanical-800/80 border border-botanical-700/60 flex items-center justify-center text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">{rule.title}</h4>
                  <p className="text-xs text-botanical-200/80 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
