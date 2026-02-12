/**
 * SwissButton — Two variants: primary + ghost
 *
 * Specs:
 *   Height: 40px
 *   Horizontal padding: 16px
 *   Primary: accent bg, white text
 *   Ghost: transparent bg, secondary text
 */
'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'

export type SwissButtonVariant = 'primary' | 'ghost'

export interface SwissButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SwissButtonVariant
  /** Icon before text */
  icon?: ReactNode
  /** Full width */
  fullWidth?: boolean
  /** Loading spinner */
  loading?: boolean
}

export const SwissButton = forwardRef<HTMLButtonElement, SwissButtonProps>(
  function SwissButton(
    {
      children,
      variant = 'primary',
      icon,
      fullWidth = false,
      loading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const isPrimary = variant === 'primary'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Base: 40px height, 16px horizontal padding
          'inline-flex items-center justify-center gap-2',
          'h-10 px-swiss-md',
          'font-swiss text-swiss-body font-medium',
          'rounded-swiss transition-all duration-150 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swiss-accent',
          // Primary variant
          isPrimary && [
            'bg-swiss-accent text-white',
            'hover:bg-[#2563EB]',
            'active:bg-[#1D4ED8]',
          ],
          // Ghost variant
          !isPrimary && [
            'bg-transparent text-swiss-text-secondary',
            'hover:bg-swiss-elevated hover:text-swiss-text-primary',
            'active:bg-swiss-border',
          ],
          // Disabled
          (disabled || loading) && 'opacity-40 cursor-not-allowed',
          // Full width
          fullWidth && 'w-full',
          // Loading
          loading && 'relative text-transparent',
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {icon && <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
        {children}
      </button>
    )
  }
)
