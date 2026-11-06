'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { cn } from '../../lib/utils/cn'

export interface ScrollRevealSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  yOffset?: number
}

/**
 * ScrollRevealSection
 * Ultra-smooth, 60/120 FPS hardware-accelerated scroll reveal component.
 * Uses GPU-composited transform and opacity to guarantee zero layout thrashing
 * and zero scroll jank/lag.
 * Disconnects intersection listeners after trigger (`once: true`) for peak runtime efficiency.
 * Honors `prefers-reduced-motion` for accessibility.
 */
export function ScrollRevealSection({
  children,
  className,
  delay = 0,
  duration = 0.6,
  yOffset = 28,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  // Trigger once when element enters within 60px of the viewport
  const isInView = useInView(ref, {
    once: true,
    margin: '0px 0px -60px 0px',
  })

  // If user requests reduced motion, deliver immediate instant presentation
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Smooth exponential cubic-bezier
      }}
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  )
}
