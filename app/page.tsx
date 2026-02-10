'use client'

import { useState } from 'react'
import {
  LandingNav,
  HeroSection,
  ProductShowcase,
  LogoBar,
  FeaturesGrid,
  HowItWorks,
  DemoSection,
  EarlyAccessForm,
  LandingFooter,
  UrgencyBanner,
  TestimonialsSection,
  PricingSection,
  StickyCtaBar,
  ContactModal,
} from '@/components/landing'

export default function LandingPage() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <UrgencyBanner />
      </div>
      <LandingNav bannerVisible onContactClick={() => setContactOpen(true)} />
      <div className="pt-[41px]">
        <HeroSection />
        <HowItWorks />
        <ProductShowcase />
        <FeaturesGrid />
        <PricingSection />
        <DemoSection />
        <EarlyAccessForm />
        <LandingFooter onContactClick={() => setContactOpen(true)} />
        <StickyCtaBar />
      </div>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
