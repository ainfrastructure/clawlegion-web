'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SubNavItem {
  href: string
  label: string
}

interface SubNavProps {
  items: SubNavItem[]
  basePath: string
}

export function SubNav({ items, basePath }: SubNavProps) {
  const pathname = usePathname()
  
  return (
    <div className="flex items-center gap-1 px-2 py-2 glass-2 border-b border-white/[0.06]">
      {items.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== basePath && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-red-500/20 text-red-400'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
