'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

type IconButtonSize = 'sm' | 'md' | 'lg'
type IconButtonVariant = 'default' | 'ghost' | 'danger'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  size?: IconButtonSize
  variant?: IconButtonVariant
  label?: string // For accessibility
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
}

const variantClasses: Record<IconButtonVariant, string> = {
  default: 'bg-slate-700 hover:bg-slate-600 text-slate-300',
  ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-white',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'default', label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
