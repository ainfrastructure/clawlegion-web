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
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <LandingNav />
      <HeroSection />
      <ProductShowcase />
      <LogoBar />
      <FeaturesGrid />
      <HowItWorks />
      <DemoSection />
      <EarlyAccessForm />
      <LandingFooter />
    </div>
  )
}
