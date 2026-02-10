'use client'

type Platform = {
  name: string
  hex: string
  glowGradient?: string
  icon: React.ReactNode
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.49a8.24 8.24 0 004.82 1.54V7.58a4.84 4.84 0 01-1.06-.89z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

const platforms: Platform[] = [
  {
    name: 'Instagram',
    hex: '#E1306C',
    glowGradient: 'linear-gradient(135deg, #833AB4, #E1306C, #F77737)',
    icon: <InstagramIcon className="w-5 h-5" />,
  },
  {
    name: 'Facebook',
    hex: '#1877F2',
    icon: <FacebookIcon className="w-5 h-5" />,
  },
  {
    name: 'TikTok',
    hex: '#00F2EA',
    icon: <TikTokIcon className="w-5 h-5" />,
  },
  {
    name: 'X',
    hex: '#A8B3C0',
    icon: <XIcon className="w-5 h-5" />,
  },
  {
    name: 'LinkedIn',
    hex: '#0A66C2',
    icon: <LinkedInIcon className="w-5 h-5" />,
  },
  {
    name: 'Telegram',
    hex: '#26A5E4',
    icon: <TelegramIcon className="w-5 h-5" />,
  },
]

function PlatformCard({ platform }: { platform: Platform }) {
  const glowColor = platform.glowGradient || platform.hex

  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Ambient glow — colored light bleeding from below */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-14 rounded-full blur-2xl opacity-15 group-hover:opacity-40 transition-opacity duration-500"
        style={{ background: glowColor }}
      />

      {/* Top edge highlight — reveals on hover */}
      <div
        className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-10"
        style={{ background: `linear-gradient(to right, transparent, ${platform.hex}, transparent)` }}
      />

      {/* Glass card */}
      <div className="relative backdrop-blur-md bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12] group-hover:bg-white/[0.06] rounded-2xl p-6 transition-all duration-300">
        {/* Inner refraction glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${platform.hex}0A 0%, transparent 70%)`,
          }}
        />

        <div className="relative flex flex-col items-center text-center gap-3.5">
          {/* Icon with glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-45 transition-opacity duration-300 scale-125"
              style={{ background: glowColor }}
            />
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-white/[0.08] group-hover:ring-white/[0.15] transition-all duration-300"
              style={{
                background: platform.glowGradient
                  ? platform.glowGradient
                  : `linear-gradient(135deg, ${platform.hex}35, ${platform.hex}15)`,
              }}
            >
              <span
                className="transition-transform duration-300 group-hover:scale-110"
                style={{ color: platform.glowGradient ? '#fff' : platform.hex }}
              >
                {platform.icon}
              </span>
            </div>
          </div>

          {/* Name */}
          <h3 className="text-[13px] font-semibold text-slate-200 tracking-tight">
            {platform.name}
          </h3>
        </div>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 inset-x-0 h-[2px] opacity-30 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to right, transparent, ${platform.hex}, transparent)`,
          }}
        />
      </div>
    </div>
  )
}

export function IntegrationsSection() {
  return (
    <section className="px-4 sm:px-6 pt-8 pb-24 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              6 Platforms
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Connect Everything
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Your AI workforce lives where you already work.
          </p>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {platforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </div>
      </div>
    </section>
  )
}
