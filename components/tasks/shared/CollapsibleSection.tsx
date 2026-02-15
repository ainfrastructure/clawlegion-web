'use client'

import { ChevronRight } from 'lucide-react'

type CollapsibleSectionProps = {
  title: string
  icon: React.ReactNode
  borderColor: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  icon,
  borderColor,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className={`bg-blue-950/30 border border-blue-500/[0.08] rounded-xl border-l-2 ${borderColor} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-red-500/[0.04] transition-colors"
      >
        <h3 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 -mt-1">
          {children}
        </div>
      )}
    </div>
  )
}
