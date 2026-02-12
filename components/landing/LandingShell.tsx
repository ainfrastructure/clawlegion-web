'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { CountdownProvider } from './CountdownContext'
import { LandingNav } from './LandingNav'
import { LandingFooter } from './LandingFooter'
import { FeaturesGrid } from './FeaturesGrid'

const HowItWorks = dynamic(() => import('./HowItWorks').then(m => ({ default: m.HowItWorks })))
const ShowcaseSlideshow = dynamic(() => import('./ShowcaseSlideshow').then(m => ({ default: m.ShowcaseSlideshow })))
const ModelsSection = dynamic(() => import('./ModelsSection').then(m => ({ default: m.ModelsSection })))
const IntegrationsSection = dynamic(() => import('./IntegrationsSection').then(m => ({ default: m.IntegrationsSection })))
const PricingSection = dynamic(() => import('./PricingSection').then(m => ({ default: m.PricingSection })))
const EarlyAccessForm = dynamic(() => import('./EarlyAccessForm').then(m => ({ default: m.EarlyAccessForm })))
const StickyCtaBar = dynamic(() => import('./StickyCtaBar').then(m => ({ default: m.StickyCtaBar })))
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
