import { LandingShell } from '@/components/landing/LandingShell'
import { HeroSection } from '@/components/landing/HeroSection'
import { EasyVsPower } from '@/components/landing/EasyVsPower'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Temp test banner — remove after confirming deploy */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'red', color: 'white', textAlign: 'center', padding: '4px', fontSize: '12px', fontWeight: 'bold' }}>
        TEST BUILD f53ed54 — NO DYNAMIC IMPORTS
      </div>
      <LandingShell>
        <HeroSection />
        <EasyVsPower />
      </LandingShell>
    </div>
  )
}
