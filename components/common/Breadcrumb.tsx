'use client'

import { cn } from '@/lib/utils'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
}

export function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {showHome && (
          <>
            <li>
              <Link 
                href="/" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
            </li>
            {items.length > 0 && (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(
                  isLast ? 'text-white font-medium' : 'text-slate-400'
                )}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
