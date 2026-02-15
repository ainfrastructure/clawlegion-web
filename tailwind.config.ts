import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // Swiss Design: clean grotesque typefaces
        swiss: ['var(--font-swiss)', 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      // ─── Swiss 4px/8px Grid System ───
      spacing: {
        'swiss-1': '4px',
        'swiss-2': '8px',
        'swiss-3': '12px',
        'swiss-4': '16px',
        'swiss-5': '20px',
        'swiss-6': '24px',
        'swiss-8': '32px',
        'swiss-10': '40px',
        'swiss-12': '48px',
        'swiss-16': '64px',
        'swiss-20': '80px',
        'swiss-24': '96px',
        'swiss-32': '128px',
      },
      // ─── Swiss Typography Scale ───
      fontSize: {
        'swiss-xs': ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'swiss-sm': ['13px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'swiss-base': ['15px', { lineHeight: '24px', letterSpacing: '0' }],
        'swiss-lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'swiss-xl': ['22px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        'swiss-2xl': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        'swiss-3xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.03em' }],
        'swiss-4xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.03em' }],
        'swiss-display': ['64px', { lineHeight: '72px', letterSpacing: '-0.04em' }],
      },
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        // ─── Swiss Design Palette ───
        // Monochromatic with strategic accent
        swiss: {
          // Neutrals — high contrast
          black: '#0A0A0A',
          white: '#FAFAFA',
          50: '#F7F7F8',
          100: '#EBEBED',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#27272A',
          800: '#18181B',
          900: '#0F0F12',
          950: '#09090B',
          // Strategic accent — Alpine blue (single accent color)
          accent: '#2563EB',
          'accent-light': '#3B82F6',
          'accent-dark': '#1D4ED8',
          'accent-muted': '#1E3A5F',
          // Semantic — minimal, purposeful
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          info: '#2563EB',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Swiss: geometric, clean corners
        'swiss-none': '0px',
        'swiss-sm': '2px',
        'swiss-md': '4px',
        'swiss-lg': '6px',
      },
      boxShadow: {
        'glass': '0 4px 24px -1px rgb(0 0 0 / 0.3), 0 2px 8px -2px rgb(0 0 0 / 0.2)',
        'glass-lg': '0 8px 40px -4px rgb(0 0 0 / 0.4), 0 4px 16px -4px rgb(0 0 0 / 0.3)',
        'glow-blue': '0 0 20px -4px rgb(220 38 38 / 0.3)',
        'glow-purple': '0 0 20px -4px rgb(139 92 246 / 0.3)',
        'glow-emerald': '0 0 20px -4px rgb(16 185 129 / 0.3)',
        'glow-crimson': '0 0 20px -4px rgb(220 38 38 / 0.3)',
        'inner-light': 'inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
        // Swiss: subtle, architectural shadows
        'swiss-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'swiss-md': '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'swiss-lg': '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'swiss-border': 'inset 0 0 0 1px rgb(var(--border) / 0.5)',
      },
      // Swiss: controlled, purposeful transitions
      transitionDuration: {
        'swiss': '150ms',
        'swiss-slow': '300ms',
      },
      transitionTimingFunction: {
        'swiss': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'node-appear': 'node-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        // Swiss: clean, functional animations
        'swiss-fade-in': 'swiss-fade-in 0.15s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'swiss-slide-up': 'swiss-slide-up 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'swiss-scale-in': 'swiss-scale-in 0.15s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'node-appear': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Swiss keyframes — minimal, functional
        'swiss-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'swiss-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'swiss-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
