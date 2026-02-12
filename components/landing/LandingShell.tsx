'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { CountdownProvider } from './CountdownContext'
import { LandingNav } from './LandingNav'
import { LandingFooter } from './LandingFooter'
import { FeaturesGrid } from './FeaturesGrid'
import { HowItWorks } from './HowItWorks'
import { ShowcaseSlideshow } from './ShowcaseSlideshow'
import { ModelsSection } from './ModelsSection'
import { IntegrationsSection } from './IntegrationsSection'
import { PricingSection } from './PricingSection'
import { EarlyAccessForm } from './EarlyAccessForm'
import { StickyCtaBar } from './StickyCtaBar'

// Only keep dynamic for ContactModal since it's a modal (ssr: false, truly lazy)
const ContactModal = dynamic(() => import('./ContactModal').then(m => ({ default: m.ContactModal })), { ssr: false })

export function LandingShell({ children }: { children?: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <CountdownProvider>
      <LandingNav onContactClick={() => setContactOpen(true)} />
      {/* children = server-rendered hero + static content, passed through */}
      {children}
      <HowItWorks />
      <ShowcaseSlideshow />
      <FeaturesGrid />
      <ModelsSection />
      <IntegrationsSection />
      <PricingSection />
      <EarlyAccessForm />
      <LandingFooter onContactClick={() => setContactOpen(true)} />
      <StickyCtaBar />
      {contactOpen && (
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      )}
    </CountdownProvider>
  )
}
