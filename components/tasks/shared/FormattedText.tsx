'use client'

import React from 'react'

type FormattedTextProps = {
  text: string
  className?: string
}

function renderInline(str: string): React.ReactNode {
  // Split on **bold**, `code`, and [link](url)
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-white/[0.06] text-blue-300 text-[12px] font-mono">{part.slice(1, -1)}</code>
    }
    // [link text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
        >
          {linkMatch[1]}
        </a>
      )
    }
    return part
  })
}

export function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let bulletList: string[] = []
  let numberedList: string[] = []
  let codeBlock: string[] | null = null
  let codeBlockLang = ''
  let key = 0

  function flushBulletList() {
    if (bulletList.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-outside pl-5 space-y-1 text-slate-300 text-sm">
          {bulletList.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </ul>
      )
      bulletList = []
    }
  }

  function flushNumberedList() {
    if (numberedList.length > 0) {
      elements.push(
        <ol key={key++} className="list-decimal list-outside pl-5 space-y-1 text-slate-300 text-sm">
          {numberedList.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </ol>
      )
      numberedList = []
    }
  }

  function flushLists() {
    flushBulletList()
    flushNumberedList()
  }

  function flushCodeBlock() {
    if (codeBlock !== null) {
      const code = codeBlock.join('\n')
      elements.push(
        <div key={key++} className="rounded-lg overflow-hidden border border-white/[0.04] my-1">
          {codeBlockLang && (
            <div className="px-3 py-1 bg-white/[0.03] border-b border-white/[0.04] text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              {codeBlockLang}
            </div>
          )}
          <pre className="px-3 py-2.5 overflow-x-auto bg-[#060e1c]/80 custom-scrollbar">
            <code className="text-[12px] leading-relaxed font-mono text-slate-300">{code}</code>
          </pre>
        </div>
      )
      codeBlock = null
      codeBlockLang = ''
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Fenced code block toggle
    if (trimmed.startsWith('```')) {
      if (codeBlock === null) {
        // Opening fence
        flushLists()
        codeBlock = []
        codeBlockLang = trimmed.slice(3).trim()
      } else {
        // Closing fence
        flushCodeBlock()
      }
      continue
    }

    // Inside code block — preserve original line (not trimmed)
    if (codeBlock !== null) {
      codeBlock.push(line)
      continue
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushNumberedList()
      bulletList.push(trimmed.slice(2))
      continue
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      flushBulletList()
      numberedList.push(numberedMatch[1])
      continue
    }

    flushLists()

    // Empty line
    if (trimmed === '') {
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <hr key={key++} className="border-t border-white/[0.06] my-2" />
      )
      continue
    }

    // Headings (h4 ####, h3 ###, h2 ##, h1 #)
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h6 key={key++} className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-3 mb-1">
          {renderInline(trimmed.slice(5))}
        </h6>
      )
      continue
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h5 key={key++} className="text-sm font-semibold text-slate-200 mt-3 mb-0.5">
          {renderInline(trimmed.slice(4))}
        </h5>
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h4 key={key++} className="text-[15px] font-bold text-white mt-4 mb-0.5">
          {renderInline(trimmed.slice(3))}
        </h4>
      )
      continue
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={key++} className="text-base font-bold text-white mt-4 mb-1">
          {renderInline(trimmed.slice(2))}
        </h3>
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="border-l-2 border-blue-500/30 pl-3 text-sm text-slate-400 italic">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      )
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={key++} className="text-slate-300 text-sm leading-relaxed">
        {renderInline(trimmed)}
      </p>
    )
  }
  flushLists()
  flushCodeBlock() // Close unclosed code blocks

  return <div className={className ?? 'space-y-1.5'}>{elements}</div>
}
