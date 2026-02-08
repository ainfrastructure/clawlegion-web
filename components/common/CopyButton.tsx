'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md'
}

export function CopyButton({ text, className, size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  
  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'text-slate-400 hover:text-white hover:bg-slate-700',
        size === 'sm' ? 'p-1.5' : 'p-2',
        className
      )}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className={cn(iconSize, 'text-green-400')} />
      ) : (
        <Copy className={iconSize} />
      )}
    </button>
  )
}

export default CopyButton
