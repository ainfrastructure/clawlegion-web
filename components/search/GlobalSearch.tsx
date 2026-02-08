'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Search, X, ListTodo, Bot, FolderKanban, GitBranch, ArrowRight } from 'lucide-react'

interface SearchResult {
  type: 'task' | 'agent' | 'session' | 'repository'
  id: string
  title: string
  subtitle?: string
  href: string
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { data: tasks } = useQuery({
    queryKey: ['tasks-search'],
    queryFn: () => api.get('/tasks/queue').then(r => r.data?.tasks ?? []),
    enabled: isOpen,
  })

  const { data: agents } = useQuery({
    queryKey: ['agents-search'],
    queryFn: () => api.get('/agents').then(r => r.data?.agents ?? r.data ?? []),
    enabled: isOpen,
  })

  const { data: sessions } = useQuery({
    queryKey: ['sessions-search'],
    queryFn: () => api.get('/sessions').then(r => r.data?.sessions ?? r.data ?? []),
    enabled: isOpen,
  })

  const { data: repos } = useQuery({
    queryKey: ['repos-search'],
    queryFn: () => api.get('/repositories').then(r => r.data ?? []),
    enabled: isOpen,
  })

  const results: SearchResult[] = query.length >= 2 ? [
    ...(tasks ?? []).filter((t: any) => t.title?.toLowerCase().includes(query.toLowerCase())).slice(0, 5).map((t: any) => ({ type: 'task' as const, id: t.id, title: t.title, subtitle: t.status, href: '/tasks' })),
    ...(agents ?? []).filter((a: any) => a.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((a: any) => ({ type: 'agent' as const, id: a.id, title: a.name, subtitle: a.status, href: '/agents' })),
    ...(sessions ?? []).filter((s: any) => s.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((s: any) => ({ type: 'session' as const, id: s.id, title: s.name, subtitle: s.status, href: '/sessions/' + s.id })),
    ...(repos ?? []).filter((r: any) => r.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((r: any) => ({ type: 'repository' as const, id: r.id, title: r.name, subtitle: r.fullName, href: '/repositories' })),
  ] : []

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(true) }
      if (e.key === 'Escape' && isOpen) { setIsOpen(false); setQuery('') }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus() }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && results[selectedIndex]) { router.push(results[selectedIndex].href); setIsOpen(false); setQuery('') }
  }

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      task: <ListTodo size={16} className="text-amber-400" />,
      agent: <Bot size={16} className="text-blue-400" />,
      session: <FolderKanban size={16} className="text-purple-400" />,
      repository: <GitBranch size={16} className="text-green-400" />,
    }
    return icons[type] ?? <Search size={16} />
  }

  if (!isOpen) return (
    <button
      onClick={() => setIsOpen(true)}
      className="w-full flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm border border-white/[0.04] hover:border-white/[0.08] rounded-lg text-slate-400 text-sm transition-all"
    >
      <Search size={14} />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="px-1.5 py-0.5 bg-white/[0.06] text-[10px] font-mono rounded">⌘K</kbd>
    </button>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => { setIsOpen(false); setQuery('') }} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
        <div className="glass-3 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <Search className="text-slate-400" size={20} />
            <input ref={inputRef} type="text" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }} onKeyDown={handleKeyDown} placeholder="Search tasks, agents, sessions..." className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none" />
            <button onClick={() => { setIsOpen(false); setQuery('') }}><X className="text-slate-400 hover:text-white" size={20} /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {query.length < 2 ? <div className="p-4 text-center text-slate-500 text-sm">Type at least 2 characters</div> :
             results.length === 0 ? <div className="p-4 text-center text-slate-500 text-sm">No results for &quot;{query}&quot;</div> :
             <div className="py-2">{results.map((result, index) => (
               <button key={result.type + result.id} onClick={() => { router.push(result.href); setIsOpen(false); setQuery('') }} className={"w-full flex items-center gap-3 px-4 py-3 transition-colors " + (index === selectedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]')}>
                 {getIcon(result.type)}
                 <div className="flex-1 text-left"><div className="text-white text-sm">{result.title}</div>{result.subtitle && <div className="text-xs text-slate-500">{result.subtitle}</div>}</div>
                 <span className="text-xs text-slate-500 capitalize">{result.type}</span><ArrowRight size={14} className="text-slate-500" />
               </button>
             ))}</div>}
          </div>
          <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-4 text-[11px] text-slate-500/70">
            <span><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded font-mono">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded font-mono">esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default GlobalSearch
