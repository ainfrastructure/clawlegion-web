import Image from 'next/image'
import { MascotTrioIcon } from './MascotTrioIcon'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'Contact', href: '#' },
  ],
}

type LandingFooterProps = {
  onContactClick?: () => void
}

export function LandingFooter({ onContactClick }: LandingFooterProps) {
  return (
    <footer className="px-4 sm:px-6 pt-16 pb-8 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <MascotTrioIcon size={24} />
              <span className="font-bold text-lg tracking-wide text-white" style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}>
                Claw<span className="text-red-500">Legion</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              The command center for autonomous AI legions.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.label === 'Contact' && onContactClick ? (
                      <button
                        onClick={onContactClick}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} ClawLegion. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'GitHub', 'Discord'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
