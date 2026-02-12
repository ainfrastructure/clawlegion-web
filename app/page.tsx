import { LandingPageClient } from '@/components/landing/LandingPageClient'
import { HeroSection } from '@/components/landing/HeroSection'
import { EasyVsPower } from '@/components/landing/EasyVsPower'

export default function LandingPage() {
  return (
    <LandingPageClient>
      <HeroSection />
      <EasyVsPower />
    </LandingPageClient>
  )
}
