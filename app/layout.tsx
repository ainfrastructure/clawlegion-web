import Script from 'next/script'
import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
// AgentChat moved to AuthenticatedLayout
import { CommandPalette } from '@/components/ui/CommandPalette'
import { ToastProvider } from '@/components/ui/Toast'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { GlobalKeyboardShortcuts } from '@/components/ui/GlobalKeyboardShortcuts'
import { AuthenticatedLayout } from '@/components/layout'
import { SessionProvider } from '@/components/auth'
import { BuildInfo } from '@/components/BuildInfo'
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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
              <AuthenticatedLayout>
                {children}
              </AuthenticatedLayout>
              <CommandPalette />
              <KeyboardShortcutsHelp />
              <GlobalKeyboardShortcuts />
              <BuildInfo />
            </ToastProvider>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
