import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * HTML tag to render as root container.
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main'
  /**
   * Whether to remove default horizontal padding.
   * Useful when an inner element requires edge-to-edge bleed on small viewports.
   * @default false
   */
  disablePadding?: boolean
}

/**
 * @component PageContainer
 *
 * @description
 * Standard content constraining container for GLOROV storefront.
 * Enforces the approved 1280px maximum content width while guaranteeing strict
 * horizontal safety on small mobile viewports (350px-first).
 *
 * @padding_breakdown
 * - Mobile (350px - 640px): 16px horizontal padding (px-4)
 * - Tablet (641px - 1024px): 24px horizontal padding (px-6)
 * - Desktop (>=1025px): 32px horizontal padding (px-8)
 *
 * @example
 * ```tsx
 * <PageContainer as="main">
 *   <ProductGrid products={products} />
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  as: Component = 'div',
  disablePadding = false,
  className,
  ...restProps
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        'w-full max-w-content mx-auto',
        !disablePadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...restProps}
    >
      {children}
    </Component>
  )
}
