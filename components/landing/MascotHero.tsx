import Image from 'next/image'

export function MascotHero() {
  return (
    <div className="mascot-hero-wrapper">
      <div className="council-hero-container">
        <div className="council-hero-glow" />
        <Image
          src="/agents/council-hero-group.png"
          alt="The ClawLegion — Autonomous AI Workforce"
          fill
          quality={85}
          className="council-hero-image object-contain object-bottom"
          priority
          sizes="(max-width: 480px) 95vw, (max-width: 768px) 85vw, 800px"
        />
      </div>
    </div>
  )
}
