'use client'

import { useState } from 'react'
import {
  LandingNav,
  HeroSection,
  FeaturesGrid,
  HowItWorks,
  DemoSection,
  EarlyAccessForm,
  LandingFooter,
  PricingSection,
  ContactModal,
  EasyVsPower,
} from '@/components/landing'

export default function LandingPage() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <LandingNav onContactClick={() => setContactOpen(true)} />
      <div>
        <HeroSection />
        <EasyVsPower />
        <HowItWorks />
        <DemoSection />
        <FeaturesGrid />
        <PricingSection />
        <EarlyAccessForm />
        <LandingFooter onContactClick={() => setContactOpen(true)} />
      </div>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
