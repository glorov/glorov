import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1360px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'var(--font-plus-jakarta)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'var(--font-fraunces)',
          'Georgia',
          'Cambria',
          'serif',
        ],
        serif: ['var(--font-fraunces)', 'Georgia', 'Cambria', 'serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
          surface: 'var(--color-brand-surface)',
          accent: 'var(--color-brand-accent)',
          maroon: '#93113a',
          coral: '#ff8962',
          butter: '#fff3d9',
          peach: '#fbd9cd',
        },
        forest: {
          deep: '#07532a',
          rich: '#0a4c36',
          mid: '#255e3a',
          surface: '#f2f8f4',
        },
        ugaoo: {
          maroon: '#93113a',
          coral: '#ff8962',
          butter: '#fff3d9',
          peach: '#fbd9cd',
          green: '#0a4c36',
          yellow: '#ffd51f',
          dark: '#042018',
        },
        price: {
          regular: 'var(--color-price-regular)',
          sale: 'var(--color-price-sale)',
          original: 'var(--color-price-original)',
        },
        botanical: {
          50: '#f2f8f4',
          100: '#e1f0e6',
          200: '#c3e2cd',
          300: '#96cca8',
          400: '#64af7e',
          500: '#3e935c',
          600: '#2d7647',
          700: '#255e3a',
          800: '#204b30',
          900: '#1b3f29',
          950: '#0e2316',
        },
        earth: {
          sand: 'var(--color-earth-sand)',
          cream: 'var(--color-earth-cream)',
          muted: 'var(--color-earth-muted)',
          50: '#fdfbf7',
          100: '#f9f6ed',
          200: '#f3ebd9',
          300: '#e8dabf',
          400: '#d7c19b',
          500: '#c5a777',
          600: '#b18d5d',
          700: '#94724b',
          800: '#795d40',
          900: '#634d37',
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
        badge: 'var(--radius-badge)',
        input: 'var(--radius-input)',
        drawer: 'var(--radius-drawer)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        botanical: 'var(--shadow-botanical)',
        'botanical-lg': 'var(--shadow-botanical-lg)',
        card: 'var(--shadow-card)',
        drawer: 'var(--shadow-drawer)',
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
