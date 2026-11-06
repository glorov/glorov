import React from 'react'
import Link from 'next/link'
import { GlorovImage } from '../ui/GlorovImage'
import { PageContainer } from '../layout/PageContainer'
import { cn } from '../../lib/utils/cn'

export function BotanicalEditorialShowcase({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-[#081C15] text-white py-12 sm:py-20 relative overflow-hidden', className)}>
      {/* Background Decorative Floral Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1B4332]/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#52B788]/20 blur-3xl pointer-events-none" />

      <PageContainer className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#52B788] text-[#081C15] font-extrabold text-[10px] sm:text-xs tracking-wider uppercase">
              CERTIFIED 100% ORGANIC NURSERY
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              Nurture Nature in Every Corner of Your Home
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal max-w-xl">
              Cultivate lush tranquility with cold-chain dispatched live houseplants, indigenous desi heirloom seeds, and nutrient-dense organic soil mixes delivered safely to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/categories/seeds"
                className="px-6 py-3 rounded-full bg-[#52B788] hover:bg-[#74C69D] text-[#081C15] font-bold text-xs sm:text-sm uppercase tracking-wider active:scale-95 transition-all text-center justify-center"
              >
                Explore Desi Seeds
              </Link>
              <Link
                href="/categories/live-plants"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 active:scale-95 transition-all text-center justify-center"
              >
                View Live Houseplants
              </Link>
            </div>

            {/* 3 Trust Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 sm:pt-6 border-t border-white/15">
              <div>
                <span className="font-serif text-xl sm:text-2xl font-black text-[#52B788] block">
                  98%+
                </span>
                <span className="text-[10.5px] sm:text-xs text-white/70 block mt-0.5">
                  Germination Vigor
                </span>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-black text-[#52B788] block">
                  100%
                </span>
                <span className="text-[10.5px] sm:text-xs text-white/70 block mt-0.5">
                  Transit Protected
                </span>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-black text-[#52B788] block">
                  50k+
                </span>
                <span className="text-[10.5px] sm:text-xs text-white/70 block mt-0.5">
                  Gardens Planted
                </span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Column with Floating Badges (5 cols on desktop) */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[460px] rounded-2xl overflow-hidden border border-white/20 bg-[#1B4332]">
              <GlorovImage
                src="/images/monstera_deliciosa_hero.jpg"
                alt="Monstera Deliciosa Botanical Specimen"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 40vw"
                className="object-cover object-center"
                containerClassName="w-full h-full"
                fallbackTitle="Monstera Deliciosa"
              />

              {/* Gentle gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Floating Badge 1: Rating */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 sm:p-2.5 rounded-xl bg-white text-[#0F172A] border border-stone-200 flex items-center gap-2 z-10 transition-transform hover:scale-105">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#16A34A] text-white shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
                <div>
                  <span className="font-extrabold text-[11px] sm:text-xs block leading-tight text-[#0F172A]">4.9 / 5.0 Rating</span>
                  <span className="text-[9.5px] sm:text-[10px] text-[#64748B] block mt-0.5 leading-none">Verified Plant Parents</span>
                </div>
              </div>

              {/* Floating Badge 2: Air Purifying */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2 sm:p-2.5 rounded-xl bg-[#081C15] text-white border border-white/20 flex items-center gap-2 z-10 transition-transform hover:scale-105">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#52B788] text-[#081C15] shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </span>
                <div>
                  <span className="font-bold text-[11px] sm:text-xs block leading-tight text-[#52B788]">Air-Purifying Certified</span>
                  <span className="text-[9.5px] sm:text-[10px] text-white/70 block mt-0.5 leading-none">Naturally Absorbs Toxins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
