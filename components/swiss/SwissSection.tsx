/**
 * SwissSection — Section wrapper
 *
 * Specs:
 *   Heading text (18px/600) + thin divider line + children
 *   Optional "View all →" link
 *   Minimum 24px between sections
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export interface SwissSectionProps {
  children: ReactNode
  /** Section title (18px/600 heading) */
  title?: string
  /** Optional "View all" link */
  viewAllHref?: string
  /** View all click handler (alternative to href) */
  onViewAll?: () => void
  /** Custom className */
  className?: string
}

export function SwissSection({
  children,
  title,
  viewAllHref,
  onViewAll,
  className,
}: SwissSectionProps) {
  const showViewAll = viewAllHref || onViewAll

  return (
    <section className={clsx('font-swiss', className)}>
      {title && (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between mb-swiss-sm">
            <h3 className="text-swiss-heading text-swiss-text-primary">
              {title}
            </h3>
            {showViewAll && (
              viewAllHref ? (
                <a
                  href={viewAllHref}
                  className="text-swiss-caption text-swiss-accent hover:underline"
                >
                  View all →
                </a>
              ) : (
                <button
                  onClick={onViewAll}
                  className="text-swiss-caption text-swiss-accent hover:underline"
                >
                  View all →
                </button>
              )
            )}
          </div>

          {/* Thin divider */}
          <div className="swiss-divider mb-swiss-md" />
        </>
      )}

      {children}
    </section>
  )
}
