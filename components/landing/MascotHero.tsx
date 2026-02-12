export function MascotHero() {
  return (
    <div className="mascot-hero-wrapper">
      <div className="council-hero-container">
        <div className="council-hero-glow" />
        {/* Pre-optimized WebP — no /_next/image transcoding */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/optimized/agents/council-hero-group-828w.webp"
          srcSet="/optimized/agents/council-hero-group-640w.webp 640w, /optimized/agents/council-hero-group-828w.webp 828w, /optimized/agents/council-hero-group-1200w.webp 1200w"
          sizes="(max-width: 480px) 95vw, (max-width: 768px) 85vw, 800px"
          alt="The ClawLegion — Autonomous AI Workforce"
          className="council-hero-image object-contain object-bottom"
          fetchPriority="high"
          decoding="async"
          style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }}
        />
      </div>
    </div>
  )
}
