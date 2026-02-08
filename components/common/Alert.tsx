'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  onClose?: () => void
}

const variantConfig = {
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-400',
    icon: Info
  },
  success: {
    bg: 'bg-green-500/10 border-green-500/30',
    text: 'text-green-400',
    icon: CheckCircle2
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    text: 'text-yellow-400',
    icon: AlertTriangle
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-400',
    icon: AlertCircle
  }
}

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  
  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', config.bg)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0', config.text)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('font-medium mb-1', config.text)}>{title}</h4>
        )}
        <div className="text-sm text-slate-300">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0">
          <X className="w-4 h-4 text-slate-400 hover:text-slate-300" />
        </button>
      )}
    </div>
  )
}

export default Alert
