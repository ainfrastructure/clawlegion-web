import Script from 'next/script'
import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
// AgentChat, CommandPalette, KeyboardShortcutsHelp, GlobalKeyboardShortcuts moved to AuthenticatedLayout
import { ToastProvider } from '@/components/ui/Toast'
import { AuthenticatedLayout } from '@/components/layout'
import { SessionProvider } from '@/components/auth'
import { BuildInfo } from '@/components/BuildInfo'
import { PathnameToastGate } from '@/components/ui/PathnameToastGate'
// HealthStatusBanner removed - info now on /health page

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ClawLegion',
  description: 'Command your AI fleet — the control plane for autonomous AI agents.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Critical inline CSS: prevent white flash on mobile before stylesheets load */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { background-color: #020617; color: #e2e8f0; }
        `}} />
        {/* 
          Mark JS-ready AFTER first paint so CSS scroll-reveal animations don't hide SSR content.
          Double-rAF ensures the class is added after the browser has painted the initial HTML.
        */}
        <script dangerouslySetInnerHTML={{ __html: `requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('js-ready')})})` }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LBGN5QEL3D"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LBGN5QEL3D');
          `}
        </Script>
      </head>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans ambient-bg`}>
        <SessionProvider>
          <Providers>
            <ToastProvider>
              <PathnameToastGate />
              <AuthenticatedLayout>
                {children}
              </AuthenticatedLayout>
              <BuildInfo />
            </ToastProvider>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
