/**
 * SwissSection — Content section wrapper
 *
 * Swiss Design principles:
 * - Modular composition — systematic repeating patterns
 * - White space as a design element (generous margins)
 * - Optional divider between sections
 * - Clean containment without decoration
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export interface SwissSectionProps {
  children: ReactNode
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Show top divider */
  divider?: boolean
  /** Spacing variant */
  spacing?: 'compact' | 'default' | 'spacious'
  /** Custom className */
  className?: string
}

const spacingStyles = {
  compact: 'py-swiss-4',
  default: 'py-swiss-6',
  spacious: 'py-swiss-10',
}

export function SwissSection({
  children,
  title,
  description,
  divider = false,
  spacing = 'default',
  className,
}: SwissSectionProps) {
  return (
    <section
      className={clsx(
        spacingStyles[spacing],
        divider && 'border-t border-[var(--swiss-border)]',
        className
      )}
    >
      {(title || description) && (
        <div className="mb-swiss-4">
          {title && (
            <h3 className="text-swiss-lg font-semibold text-[var(--swiss-text-primary)] tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-swiss-sm text-[var(--swiss-text-tertiary)] mt-swiss-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
