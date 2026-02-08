'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Loader2 
        className={cn(
          'animate-spin text-purple-500',
          sizeClasses[size],
          className
        )} 
      />
      {label && (
        <span className="text-sm text-slate-400">{label}</span>
      )}
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <Spinner size="xl" label={label} />
    </div>
  )
}

export default Spinner
