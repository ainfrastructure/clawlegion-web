import { LandingShell } from '@/components/landing/LandingShell'
import { HeroSection } from '@/components/landing/HeroSection'
import { EasyVsPower } from '@/components/landing/EasyVsPower'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-center py-1.5 px-4 text-[13px] font-semibold tracking-wide">
        🚀 Limited Spots — Claim Yours Before Price Increases
      </div>
      <LandingShell>
        <HeroSection />
        <EasyVsPower />
      </LandingShell>
    </div>
  )
}
