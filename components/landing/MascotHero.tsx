import Image from 'next/image'

export function MascotHero() {
  return (
    <div className="mascot-hero-wrapper">
      <div className="council-hero-container">
        <div className="council-hero-glow" />
        <Image
          src="/agents/council-hero.png"
          alt="Caesar, Athena and Vulcan — The AI Council"
          fill
          quality={95}
          className="council-hero-image object-contain"
          priority
          sizes="(max-width: 480px) 90vw, (max-width: 768px) 70vw, 620px"
        />
      </div>
    </div>
  )
}
