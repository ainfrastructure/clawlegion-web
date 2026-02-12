import { LandingShell } from '@/components/landing/LandingShell'
import { HeroSection } from '@/components/landing/HeroSection'
import { EasyVsPower } from '@/components/landing/EasyVsPower'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', color: 'white', textAlign: 'center', padding: '6px 16px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px' }}>
        🚀 Limited Spots — Claim Yours Before Price Increases
      </div>
      <LandingShell>
        <HeroSection />
        <EasyVsPower />
      </LandingShell>
    </div>
  )
}
