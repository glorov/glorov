import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── GLOROV Brand Colours ─────────────────────────────────────────────
      // Source: flutter/lib/theme/glorov/glorov_colors.dart
      colors: {
        // Primary brand greens
        'forest-deep':   '#1B4332',
        'forest-medium': '#2D6A4F',
        'forest-dark':   '#081C15',
        'brand-primary': '#1B4332',
        'brand-primary-hover': '#163829',
        'brand-primary-light': '#2D6A4F',
        'brand-primary-dark': '#081C15',
        'brand-primary-surface': '#E8F5E9',

        // Secondary greens
        'sage':          '#52B788',
        'sage-light':    '#74C69D',
        'mint':          '#B7E4C7',
        'mint-surface':  '#E8F5E9',
        'mint-badge':    '#D8F3DC',

        // Earth & warm accents
        'earth-gold':    '#DDA15E',
        'terracotta':    '#BC6C25',
        'earth-warm':    '#606C38',
        'sun-amber':     '#F4A261',

        // Surfaces
        'surface-pure':   '#FFFFFF',
        'surface-cream':  '#F9FAF8',
        'surface-muted':  '#F3F4F1',

        // Tags / announcement bar
        'tag-dark-blue':  '#0C2340',

        // Borders
        'border-subtle':  '#E5E7EB',
        'border-medium':  '#D1D5DB',
        'border-light':   '#F3F4F6',

        // Typography
        'text-primary':   '#111827',
        'text-secondary': '#374151',
        'text-muted':     '#6B7280',
        'text-disabled':  '#9CA3AF',

        // Semantic
        'brand-error':          '#EF4444',
        'brand-error-surface':  '#FEF2F2',
        'brand-success':        '#10B981',
        'brand-success-surface':'#ECFDF5',
        'brand-warning':        '#F59E0B',
        'brand-warning-surface':'#FFFBEB',
        'brand-info':           '#3B82F6',
      },

      // ─── GLOROV Typography ───────────────────────────────────────────────
      // Source: flutter/lib/theme/glorov/glorov_typography.dart & pubspec.yaml
      fontFamily: {
        sans:    ['"Plus Jakarta Display"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif:   ['Fraunces', 'ui-serif', 'serif'],
        display: ['Fraunces', 'ui-serif', 'serif'],
        brand:   ['"Grandis Extended"', 'ui-sans-serif', 'sans-serif'],
      },

      // ─── GLOROV Spacing Scale ────────────────────────────────────────────
      // Source: flutter/lib/theme/glorov/glorov_spacing.dart
      spacing: {
        '4.5':  '1.125rem', // 18px
        'xxs':  '4px',
        'xs':   '8px',
        'sm':   '12px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '32px',
        'xxl':  '48px',
        'hero': '64px',
      },

      // ─── GLOROV Border Radii ─────────────────────────────────────────────
      // Source: flutter/lib/theme/glorov/glorov_radii.dart
      borderRadius: {
        'none': '0px',
        'xs':   '4px',
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '24px',
        'full': '999px',
      },

      // ─── GLOROV Content Width ────────────────────────────────────────────
      // Source: flutter/lib/theme/glorov/glorov_breakpoints.dart
      maxWidth: {
        'content': '1280px',
      },

      // ─── GLOROV Breakpoints ───────────────────────────────────────────────
      // Source: flutter/lib/theme/glorov/glorov_breakpoints.dart
      // tablet: 641px, desktop: 1025px
      // Note: Tailwind defaults (sm:640, md:768, lg:1024, xl:1280) are kept.
      // We add glorov-specific named breakpoints alongside defaults.
      screens: {
        // Glorov-specific aliases for explicit naming in components
        'mobile-max':  { 'max': '640px' },
        'tablet':      '641px',
        'cat-desktop': '641px', // Tablet (>= 641px) & Desktop grid cards threshold
        'desktop':     '1025px',
      },

      // ─── Typography Scale ─────────────────────────────────────────────────
      fontSize: {
        'label-sm':  ['10px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-md':  ['12px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-lg':  ['14px', { lineHeight: '1.25', letterSpacing: '0.01em', fontWeight: '600' }],
        'body-sm':   ['12px', { lineHeight: '1.5' }],
        'body-md':   ['14px', { lineHeight: '1.5' }],
        'body-lg':   ['15px', { lineHeight: '1.5' }],
        'title-sm':  ['13px', { lineHeight: '1.45', fontWeight: '500' }],
        'title-md':  ['14px', { lineHeight: '1.45', fontWeight: '600' }],
        'title-lg':  ['16px', { lineHeight: '1.45', fontWeight: '600' }],
        'head-sm':   ['18px', { lineHeight: '1.4',  fontWeight: '600' }],
        'head-md':   ['20px', { lineHeight: '1.35', fontWeight: '600' }],
        'display-sm': ['24px', { lineHeight: '1.3',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['28px', { lineHeight: '1.25', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['36px', { lineHeight: '1.2',  letterSpacing: '-0.05em', fontWeight: '700' }],
      },

      // ─── Box Shadows ──────────────────────────────────────────────────────
      boxShadow: {
        'header': '0 1px 4px rgba(0,0,0,0.08)',
        'card':   '0 1px 3px rgba(0,0,0,0.04)',
        'modal':  '0 8px 32px rgba(0,0,0,0.16)',
        'float':  '0 4px 12px rgba(0,0,0,0.12)',
      },

      // ─── Transition Durations ─────────────────────────────────────────────
      transitionDuration: {
        'fast':   '100ms',
        'normal': '200ms',
        'slow':   '300ms',
      },

      // ─── Z-Index Scale ───────────────────────────────────────────────────
      zIndex: {
        'header':  '50',
        'drawer':  '60',
        'modal':   '70',
        'toast':   '80',
        'tooltip': '90',
      },

      // ─── Animations & Keyframes ──────────────────────────────────────────
      keyframes: {
        slideLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        hintSlideIn: {
          '0%': { transform: 'translateY(75%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        hintSlideOut: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(-75%)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'slide-left':  'slideLeft 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':    'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'marquee':     'marquee 32s linear infinite',
        'hint-in':     'hintSlideIn 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'hint-out':    'hintSlideOut 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':     'shimmer 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
