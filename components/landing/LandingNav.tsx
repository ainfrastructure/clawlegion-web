'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { MascotIcon } from './MascotIcon'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

const PIPELINE_DOTS = [
  { label: 'Jarvis', color: '#DC2626' },
  { label: 'Archie', color: '#3B82F6' },
  { label: 'Scout', color: '#06B6D4' },
  { label: 'Mason', color: '#F59E0B' },
  { label: 'Vex', color: '#8B5CF6' },
]

function MiniAgentFlow() {
  return (
    <div className="hidden md:flex items-center gap-0.5 ml-4 group" title="Agent pipeline">
      {PIPELINE_DOTS.map((dot, i) => (
        <div key={dot.label} className="flex items-center">
          <div
            className="w-[7px] h-[7px] rounded-full"
            style={{
              background: dot.color,
              boxShadow: `0 0 4px ${dot.color}60`,
              animation: `pipeline-pulse 2s ease-in-out infinite`,
              animationDelay: `${i * 300}ms`,
            }}
            title={dot.label}
          />
          {i < PIPELINE_DOTS.length - 1 && (
            <div className="w-2.5 h-px" style={{ background: `${PIPELINE_DOTS[i + 1].color}40` }} />
          )}
        </div>
      ))}
    </div>
  )
}

type LandingNavProps = {
  bannerVisible?: boolean
  onContactClick?: () => void
}

export function LandingNav({ bannerVisible = false, onContactClick }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#demo', label: 'Demo' },
    { label: 'Contact', action: 'contact' as const },
  ]

  return (
    <nav
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        bannerVisible ? 'top-[41px]' : 'top-0'
      } ${
        scrolled
          ? 'glass-2 border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo + mini pipeline */}
          <div className="flex items-center">
            <a href="#" className="flex items-center gap-2">
              <MascotIcon size={28} />
              <span className="font-bold text-lg text-white">ClawLegion</span>
            </a>
            <MiniAgentFlow />
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              'action' in link ? (
                <button
                  key={link.label}
                  onClick={onContactClick}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href="#pricing"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/25 shimmer-btn"
            >
              {LAUNCH_CONFIG.navCtaText}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden glass-2 rounded-xl mt-2 mb-4 p-4 space-y-3">
            {navLinks.map((link) =>
              'action' in link ? (
                <button
                  key={link.label}
                  onClick={() => { setMenuOpen(false); onContactClick?.() }}
                  className="block text-sm text-slate-400 hover:text-white transition-colors py-2 w-full text-left"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-slate-400 hover:text-white transition-colors py-2"
                >
                  {link.label}
                </a>
              )
            )}
            <a
              href="#pricing"
              onClick={() => setMenuOpen(false)}
              className="block text-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shimmer-btn"
            >
              {LAUNCH_CONFIG.navCtaText}
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
