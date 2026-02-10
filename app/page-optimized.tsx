'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { LandingNav, HeroSection, UrgencyBanner } from '@/components/landing'

// Dynamically import heavy landing components
const ProductShowcase = dynamic(
  () => import('@/components/landing/ProductShowcase'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading showcase...</div>,
    ssr: false, // Skip SSR for performance
  }
)

const FeaturesGrid = dynamic(
  () => import('@/components/landing/FeaturesGrid'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading features...</div>,
    ssr: false,
  }
)

const HowItWorks = dynamic(
  () => import('@/components/landing/HowItWorks'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading workflow...</div>,
    ssr: false,
  }
)

const DemoSection = dynamic(
  () => import('@/components/landing/DemoSection'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading demo...</div>,
    ssr: false,
  }
)

const PricingSection = dynamic(
  () => import('@/components/landing/PricingSection'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading pricing...</div>,
    ssr: false,
  }
)

const TestimonialsSection = dynamic(
  () => import('@/components/landing/TestimonialsSection'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading testimonials...</div>,
    ssr: false,
  }
)

const EarlyAccessForm = dynamic(
  () => import('@/components/landing/EarlyAccessForm'),
  {
    loading: () => <div className="py-24 text-center text-slate-400">Loading form...</div>,
    ssr: false,
  }
)

const LandingFooter = dynamic(
  () => import('@/components/landing/LandingFooter'),
  {
    loading: () => <div className="py-12 text-center text-slate-400">Loading footer...</div>,
    ssr: false,
  }
)

const StickyCtaBar = dynamic(
  () => import('@/components/landing/StickyCtaBar'),
  {
    ssr: false,
  }
)

const ContactModal = dynamic(
  () => import('@/components/landing/ContactModal'),
  {
    ssr: false,
  }
)

export default function OptimizedLandingPage() {
  const [contactOpen, setContactOpen] = useState(false)
  const { data: session } = useSession()

  // If user is authenticated, redirect to dashboard
  // This prevents loading heavy landing components for logged-in users
  if (session) {
    // We could redirect here, but for now just show a lighter version
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome back!</h1>
          <p className="text-slate-400 mb-6">Redirecting to your dashboard...</p>
          <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg">
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <UrgencyBanner />
      </div>
      <LandingNav bannerVisible onContactClick={() => setContactOpen(true)} />
      <div className="pt-[41px]">
        <HeroSection />
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Loading content...</div>}>
          <HowItWorks />
          <ProductShowcase />
          <FeaturesGrid />
          <PricingSection />
          <DemoSection />
          <TestimonialsSection />
          <EarlyAccessForm />
          <LandingFooter onContactClick={() => setContactOpen(true)} />
          <StickyCtaBar />
        </Suspense>
      </div>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}