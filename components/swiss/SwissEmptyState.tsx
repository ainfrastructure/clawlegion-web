/**
 * SwissEmptyState — Clean empty/zero state component
 *
 * Swiss Design principles:
 * - Centered, objective communication
 * - Geometric icon container
 * - Clear action hierarchy
 * - Restrained use of space
 */
'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { SwissButton, type SwissButtonProps } from './SwissButton'

export interface SwissEmptyStateProps {
  /** Icon (displayed in geometric container) */
  icon?: ReactNode
  /** Primary message */
  title: string
  /** Secondary descriptive text */
  description?: string
  /** Primary action */
  action?: {
    label: string
    onClick: () => void
    variant?: SwissButtonProps['variant']
  }
  /** Secondary action */
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

export function SwissEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: SwissEmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center text-center',
        size === 'sm' ? 'py-swiss-6' : size === 'lg' ? 'py-swiss-16' : 'py-swiss-10',
        className
      )}
    >
      {icon && (
        <div
          className={clsx(
            'flex items-center justify-center rounded-swiss-md mb-swiss-4',
            'bg-[var(--swiss-surface-raised)] border border-[var(--swiss-border-subtle)]',
            'text-[var(--swiss-text-muted)]',
            size === 'sm' ? 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5' : 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6'
          )}
        >
          {icon}
        </div>
      )}

      <h3
        className={clsx(
          'font-medium text-[var(--swiss-text-primary)]',
          size === 'sm' ? 'text-swiss-sm' : 'text-swiss-base'
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={clsx(
            'mt-swiss-2 text-[var(--swiss-text-tertiary)] max-w-sm',
            size === 'sm' ? 'text-swiss-xs' : 'text-swiss-sm'
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-swiss-3 mt-swiss-6">
          {action && (
            <SwissButton
              variant={action.variant ?? 'primary'}
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={action.onClick}
            >
              {action.label}
            </SwissButton>
          )}
          {secondaryAction && (
            <SwissButton
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </SwissButton>
          )}
        </div>
      )}
    </div>
  )
}
