/**
 * SwissEmptyState — Centered minimal empty state
 *
 * Specs:
 *   Optional icon + action button
 *   Generous vertical padding
 *   Centered layout
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { SwissButton } from './SwissButton'

export interface SwissEmptyStateProps {
  /** Optional icon */
  icon?: ReactNode
  /** Primary message */
  message: string
  /** Secondary description */
  description?: string
  /** Action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Custom className */
  className?: string
}

export function SwissEmptyState({
  icon,
  message,
  description,
  action,
  className,
}: SwissEmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        'py-swiss-3xl font-swiss',
        className
      )}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-swiss bg-swiss-elevated border border-swiss-border mb-swiss-md text-swiss-text-tertiary [&>svg]:w-6 [&>svg]:h-6">
          {icon}
        </div>
      )}

      <h3 className="text-swiss-body font-medium text-swiss-text-primary">
        {message}
      </h3>

      {description && (
        <p className="text-swiss-caption text-swiss-text-tertiary mt-swiss-sm max-w-xs">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-swiss-lg">
          <SwissButton variant="primary" onClick={action.onClick}>
            {action.label}
          </SwissButton>
        </div>
      )}
    </div>
  )
}
