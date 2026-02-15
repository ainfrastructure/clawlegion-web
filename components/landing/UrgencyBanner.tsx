'use client'

import { Zap } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { LAUNCH_CONFIG } from '@/lib/launch-config'

export function UrgencyBanner() {
  return (
    <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-red-600 text-white shadow-lg shadow-red-500/10">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 sm:gap-4 text-sm">
        <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0 hidden sm:block" />
        <span className="font-medium hidden sm:inline">Early Bird: 50% off</span>
        <span className="font-bold text-white">
          ${LAUNCH_CONFIG.earlyBirdPrice}
          <span className="ml-1.5 line-through opacity-50 font-normal text-xs">
            ${LAUNCH_CONFIG.originalPrice}
          </span>
        </span>
        <span className="text-white/40 hidden sm:inline">|</span>
        <span className="hidden sm:inline text-white/80 text-xs">Ends in</span>
        <CountdownTimer variant="compact" />
        <a
          href="#pricing"
          className="ml-1 sm:ml-2 px-3.5 py-1 bg-white text-red-700 hover:bg-red-50 rounded-full text-xs font-bold transition-colors shadow-sm"
        >
          Claim Now
        </a>
      </div>
    </div>
  )
}
