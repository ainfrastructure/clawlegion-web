/**
 * SwissButton — Clean, functional button component
 *
 * Swiss Design principles:
 * - No gradients, no glow — solid colors
 * - Geometric corners (2-4px radius)
 * - Clear states: default, hover, active, disabled
 * - Systematic sizing on 4px grid
 */
'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'

export type SwissButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type SwissButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface SwissButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SwissButtonVariant
  size?: SwissButtonSize
  /** Icon before text */
  icon?: ReactNode
  /** Icon after text */
  iconRight?: ReactNode
  /** Full width */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
}

const variantStyles: Record<SwissButtonVariant, string> = {
  primary: clsx(
    'bg-[var(--swiss-accent)] text-white',
    'hover:bg-[var(--swiss-accent-hover)]',
    'active:bg-[var(--swiss-accent-hover)]',
    'disabled:opacity-40 disabled:cursor-not-allowed'
  ),
  secondary: clsx(
    'bg-[var(--swiss-surface-raised)] text-[var(--swiss-text-primary)]',
    'border border-[var(--swiss-border)]',
    'hover:bg-[var(--swiss-surface-sunken)]',
    'active:bg-[var(--swiss-surface-sunken)]',
    'disabled:opacity-40 disabled:cursor-not-allowed'
  ),
  ghost: clsx(
    'bg-transparent text-[var(--swiss-text-secondary)]',
    'hover:bg-[var(--swiss-surface-raised)] hover:text-[var(--swiss-text-primary)]',
    'active:bg-[var(--swiss-surface-sunken)]',
    'disabled:opacity-40 disabled:cursor-not-allowed'
  ),
  danger: clsx(
    'bg-swiss-error text-white',
    'hover:bg-red-700 dark:hover:bg-red-500',
    'active:bg-red-800 dark:active:bg-red-600',
    'disabled:opacity-40 disabled:cursor-not-allowed'
  ),
  outline: clsx(
    'bg-transparent text-[var(--swiss-accent)]',
    'border border-[var(--swiss-accent)]',
    'hover:bg-[var(--swiss-accent)] hover:text-white',
    'active:bg-[var(--swiss-accent-hover)]',
    'disabled:opacity-40 disabled:cursor-not-allowed'
  ),
}

const sizeStyles: Record<SwissButtonSize, string> = {
  xs: 'h-6 px-swiss-2 text-swiss-xs gap-1',
  sm: 'h-8 px-swiss-3 text-swiss-sm gap-1.5',
  md: 'h-9 px-swiss-4 text-swiss-sm gap-2',
  lg: 'h-11 px-swiss-6 text-swiss-base gap-2',
}

export const SwissButton = forwardRef<HTMLButtonElement, SwissButtonProps>(
  function SwissButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      fullWidth = false,
      loading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Base
          'inline-flex items-center justify-center font-medium',
          'rounded-swiss-sm',
          'transition-all duration-swiss ease-swiss',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--swiss-accent)]',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
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
        {iconRight && <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{iconRight}</span>}
      </button>
    )
  }
)
