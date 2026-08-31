/**
 * SwissModal — Clean modal dialog
 *
 * Specs:
 *   No decoration, dark overlay
 *   Max-width container
 *   Close X button
 *   Consistent 24px padding
 */
'use client'

import { ReactNode, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

export interface SwissModalProps {
  /** Modal visibility */
  open: boolean
  /** Close callback */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal content */
  children: ReactNode
  /** Max width (default: max-w-lg) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  /** Custom className for the modal container */
  className?: string
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function SwissModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  className,
}: SwissModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-swiss-fade-in">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Modal dialog'}
        className={clsx(
          'relative w-full',
          maxWidthMap[maxWidth],
          'mx-swiss-md',
          'bg-swiss-surface border border-swiss-border',
          'rounded-swiss shadow-swiss-md',
          'p-swiss-lg',
          'animate-swiss-slide-up',
          'font-swiss',
          className
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-swiss-md">
          {title ? (
            <h2 className="text-swiss-heading text-swiss-text-primary">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-swiss-text-tertiary hover:text-swiss-text-primary',
              'hover:bg-swiss-elevated transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swiss-accent'
            )}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
