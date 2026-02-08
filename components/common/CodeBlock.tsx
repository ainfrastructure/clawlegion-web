'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({ code, language, showLineNumbers = false, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const lines = code.split('\n')
  
  return (
    <div className={cn('relative group rounded-lg overflow-hidden', className)}>
      {/* Header */}
      {language && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-700 text-xs text-slate-400">
          <span>{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Code */}
      <div className="bg-slate-900 p-4 overflow-x-auto">
        <pre className="text-sm text-slate-300 font-mono">
          {showLineNumbers ? (
            <table className="w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-slate-600 select-none text-right w-8">
                      {i + 1}
                    </td>
                    <td>{line || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
