'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { CountdownProvider } from './CountdownContext'
import { LandingNav } from './LandingNav'
import { UrgencyBanner } from './UrgencyBanner'
import { HeroSection } from './HeroSection'
import { EasyVsPower } from './EasyVsPower'
import { LandingFooter } from './LandingFooter'

const HowItWorks = dynamic(() => import('./HowItWorks').then(m => ({ default: m.HowItWorks })), { ssr: false })
const ShowcaseSlideshow = dynamic(() => import('./ShowcaseSlideshow').then(m => ({ default: m.ShowcaseSlideshow })), { ssr: false })
const ModelsSection = dynamic(() => import('./ModelsSection').then(m => ({ default: m.ModelsSection })), { ssr: false })
const IntegrationsSection = dynamic(() => import('./IntegrationsSection').then(m => ({ default: m.IntegrationsSection })), { ssr: false })
const PricingSection = dynamic(() => import('./PricingSection').then(m => ({ default: m.PricingSection })), { ssr: false })
const EarlyAccessForm = dynamic(() => import('./EarlyAccessForm').then(m => ({ default: m.EarlyAccessForm })), { ssr: false })
const StickyCtaBar = dynamic(() => import('./StickyCtaBar').then(m => ({ default: m.StickyCtaBar })), { ssr: false })
const ContactModal = dynamic(() => import('./ContactModal').then(m => ({ default: m.ContactModal })), { ssr: false })

export function LandingPageClient({ children }: { children?: React.ReactNode }) {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <CountdownProvider>
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="fixed top-0 left-0 right-0 z-[60]">
          <UrgencyBanner />
        </div>
        <LandingNav bannerVisible onContactClick={() => setContactOpen(true)} />
        <div className="pt-[41px]">
          <HeroSection />
          <EasyVsPower />
          <HowItWorks />
          <ShowcaseSlideshow />
          {children}
          <ModelsSection />
          <IntegrationsSection />
          <PricingSection />
          <EarlyAccessForm />
          <LandingFooter onContactClick={() => setContactOpen(true)} />
          <StickyCtaBar />
        </div>
        {contactOpen && (
          <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        )}
      </div>
    </CountdownProvider>
  )
}
