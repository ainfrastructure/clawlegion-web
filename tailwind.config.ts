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
        // Swiss Design: Inter + JetBrains Mono
        swiss: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'swiss-mono': ['JetBrains Mono', 'var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // ─── Swiss 4px/8px Grid Spacing ───
      spacing: {
        'swiss-xs': '4px',
        'swiss-sm': '8px',
        'swiss-md': '16px',
        'swiss-lg': '24px',
        'swiss-xl': '32px',
        'swiss-2xl': '48px',
        'swiss-3xl': '64px',
      },
      // ─── Swiss Typography Scale ───
      fontSize: {
        // Page title: 28px/700
        'swiss-title': ['28px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.02em' }],
        // Section heading: 18px/600
        'swiss-heading': ['18px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.01em' }],
        // Body: 14px/400
        'swiss-body': ['14px', { lineHeight: '22px', fontWeight: '400', letterSpacing: '0' }],
        // Caption: 12px/400
        'swiss-caption': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0.01em' }],
        // Mono/data: 13px/400 (JetBrains Mono)
        'swiss-mono': ['13px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '-0.01em' }],
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
        // ─── Swiss Design Color Tokens ───
        'swiss-bg': '#0A0D14',
        'swiss-surface': '#111520',
        'swiss-elevated': '#161B28',
        'swiss-border': '#1E2436',
        'swiss-text': {
          primary: '#F0F2F5',
          secondary: '#8B92A5',
          tertiary: '#555D73',
        },
        'swiss-accent': '#3B82F6',
        // Semantic Swiss colors
        'swiss-success': '#22C55E',
        'swiss-warning': '#F59E0B',
        'swiss-error': '#EF4444',
        'swiss-info': '#3B82F6',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Swiss: 12px card radius
        'swiss': '12px',
      },
      boxShadow: {
        'glass': '0 4px 24px -1px rgb(0 0 0 / 0.3), 0 2px 8px -2px rgb(0 0 0 / 0.2)',
        'glass-lg': '0 8px 40px -4px rgb(0 0 0 / 0.4), 0 4px 16px -4px rgb(0 0 0 / 0.3)',
        'glow-blue': '0 0 20px -4px rgb(59 130 246 / 0.3)',
        'glow-purple': '0 0 20px -4px rgb(139 92 246 / 0.3)',
        'glow-emerald': '0 0 20px -4px rgb(16 185 129 / 0.3)',
        'inner-light': 'inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
        // Swiss shadows
        'swiss-sm': '0 1px 2px 0 rgb(0 0 0 / 0.1)',
        'swiss-md': '0 2px 8px -2px rgb(0 0 0 / 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'node-appear': 'node-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        // Swiss animations
        'swiss-fade-in': 'swiss-fade-in 150ms ease-out forwards',
        'swiss-slide-up': 'swiss-slide-up 200ms ease-out forwards',
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
        'swiss-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'swiss-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
