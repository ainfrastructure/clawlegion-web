/**
 * SwissHeader — Page/section header component
 *
 * Swiss Design principles:
 * - Asymmetrical typography with clear hierarchy
 * - Title + optional subtitle + optional actions
 * - Strong contrast between heading and body
 * - Flush left alignment
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export type SwissHeaderSize = 'page' | 'section' | 'subsection'

export interface SwissHeaderProps {
  /** Main heading text */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Actions area (right-aligned) */
  actions?: ReactNode
  /** Header size variant */
  size?: SwissHeaderSize
  /** Optional breadcrumb or label above title */
  eyebrow?: string
  /** Custom className */
  className?: string
}

const sizeConfig = {
  page: {
    title: 'text-swiss-2xl font-semibold',
    subtitle: 'text-swiss-base mt-swiss-1',
    eyebrow: 'text-swiss-xs mb-swiss-2',
    spacing: 'mb-swiss-8',
  },
  section: {
    title: 'text-swiss-lg font-semibold',
    subtitle: 'text-swiss-sm mt-swiss-1',
    eyebrow: 'text-swiss-xs mb-swiss-1',
    spacing: 'mb-swiss-6',
  },
  subsection: {
    title: 'text-swiss-base font-medium',
    subtitle: 'text-swiss-sm mt-swiss-1',
    eyebrow: 'text-swiss-xs mb-swiss-1',
    spacing: 'mb-swiss-4',
  },
}

export function SwissHeader({
  title,
  subtitle,
  actions,
  size = 'section',
  eyebrow,
  className,
}: SwissHeaderProps) {
  const config = sizeConfig[size]

  return (
    <div className={clsx('flex items-start justify-between gap-swiss-4', config.spacing, className)}>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className={clsx('swiss-label', config.eyebrow)}>{eyebrow}</p>
        )}
        <h2 className={clsx(config.title, 'text-[var(--swiss-text-primary)] tracking-tight')}>
          {title}
        </h2>
        {subtitle && (
          <p className={clsx(config.subtitle, 'text-[var(--swiss-text-tertiary)]')}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-swiss-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
