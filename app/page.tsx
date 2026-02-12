import { LandingShell } from '@/components/landing/LandingShell'
import { HeroSection } from '@/components/landing/HeroSection'
import { EasyVsPower } from '@/components/landing/EasyVsPower'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <LandingShell>
        <HeroSection />
        <EasyVsPower />
      </LandingShell>
    </div>
  )
}
