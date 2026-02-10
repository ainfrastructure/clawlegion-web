'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Loader2, Bot, RefreshCw, Sparkles, Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface AddAgentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const AGENT_TYPES = [
  { value: 'worker', label: 'Worker' },
  { value: 'orchestrator', label: 'Orchestrator' },
  { value: 'tester', label: 'Tester' },
  { value: 'security', label: 'Security' },
  { value: 'devops', label: 'DevOps' },
]

const PRESET_COLORS = [
  '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e',
  '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#f43f5e',
  '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#4338ca',
  '#64748b', '#78716c', '#CD7F32', '#D4AF37', '#C0C0C0', '#1e293b',
]

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function isValidHex(value: string): boolean {
  return HEX_REGEX.test(value)
}

/** Normalize 3-char hex to 6-char, ensure leading # */
function normalizeHex(raw: string): string {
  let v = raw.trim()
  if (!v.startsWith('#')) v = '#' + v
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]
  }
  return v.toLowerCase()
}

export function AddAgentModal({ open, onClose, onCreated }: AddAgentModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('worker')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [hexInput, setHexInput] = useState('#3b82f6')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const nativePickerRef = useRef<HTMLInputElement>(null)

  // Avatar generation state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  if (!open) return null

  const handleColorSelect = (hex: string) => {
    setColor(hex)
    setHexInput(hex)
  }

  const handleHexInputChange = (value: string) => {
    setHexInput(value)
    const normalized = normalizeHex(value)
    if (isValidHex(normalized)) {
      setColor(normalized)
    }
  }

  const handleHexInputBlur = () => {
    const normalized = normalizeHex(hexInput)
    if (isValidHex(normalized)) {
      setColor(normalized)
      setHexInput(normalized)
    } else {
      setHexInput(color)
    }
  }

  const handleNativePickerChange = (value: string) => {
    setColor(value)
    setHexInput(value)
  }

  const handleGenerateAvatar = async () => {
    if (!name.trim()) return
    setGenerating(true)
    setAvatarError('')

    try {
      const res = await fetch('/api/agents/generate-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          role: AGENT_TYPES.find(t => t.value === type)?.label || type,
          description: description.trim() || undefined,
          color,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAvatarError(data.error || 'Failed to generate avatar')
        return
      }

      setAvatarUrl(data.avatarUrl)
    } catch {
      setAvatarError('Network error — could not reach avatar service')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/agents', {
        name: name.trim(),
        type,
        avatar: avatarUrl || undefined,
        description: description.trim() || undefined,
        color,
      })
      // Reset form
      setName('')
      setType('worker')
      setDescription('')
      setColor('#3b82f6')
      setHexInput('#3b82f6')
      setAvatarUrl(null)
      setAvatarError('')
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create agent')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl animate-fade-in-up">
        {/* Gradient top border accent */}
        <div
          className="absolute -top-px left-8 right-8 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />

        <div className="bg-slate-900 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Create New Agent</h2>
                <p className="text-sm text-slate-400 mt-0.5">Deploy a new AI agent to your fleet</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-4 flex flex-col md:flex-row gap-6">
              {/* Left column — Avatar preview */}
              <div className="flex flex-col items-center gap-3 md:w-52 shrink-0">
                {/* Avatar circle */}
                <div className="relative">
                  {/* Glow ring */}
                  <div
                    className={cn(
                      'absolute -inset-2 rounded-full opacity-0 transition-opacity duration-500',
                      (avatarUrl || generating) && 'opacity-100',
                      generating && 'animate-glow-pulse'
                    )}
                    style={{
                      background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                      boxShadow: `0 0 40px 8px ${color}22`,
                    }}
                  />

                  <div
                    className={cn(
                      'relative w-40 h-40 rounded-full overflow-hidden border-2 transition-colors duration-300',
                      avatarUrl ? 'border-white/20' : 'border-white/[0.06]',
                      generating && 'border-white/10'
                    )}
                    style={avatarUrl ? { borderColor: `${color}44` } : undefined}
                  >
                    {generating ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <div
                          className="absolute inset-0 animate-shimmer"
                          style={{
                            backgroundImage: `linear-gradient(90deg, transparent 0%, ${color}11 50%, transparent 100%)`,
                            backgroundSize: '200% 100%',
                          }}
                        />
                        <Loader2 size={32} className="animate-spin text-slate-500" />
                      </div>
                    ) : avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={`${name} avatar`}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Bot size={48} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar error */}
                {avatarError && (
                  <p className="text-xs text-red-400 text-center max-w-[180px]">{avatarError}</p>
                )}

                {/* Generate / Regenerate button */}
                <button
                  type="button"
                  onClick={handleGenerateAvatar}
                  disabled={!name.trim() || generating}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    avatarUrl
                      ? 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20'
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : avatarUrl ? (
                    <>
                      <RefreshCw size={14} />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generate Avatar
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-[180px]">
                  AI-generated portrait based on the agent&apos;s name, role, description, and theme color
                </p>
              </div>

              {/* Right column — Form fields */}
              <div className="flex-1 space-y-4 min-w-0">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sentinel, Scout-2"
                    className="w-full px-3 py-2 bg-slate-800 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                    autoFocus
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/[0.08] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                  >
                    {AGENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What does this agent do?"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm resize-none"
                  />
                </div>

                {/* Theme Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Theme Color</label>

                  {/* Preset swatches */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {PRESET_COLORS.map(hex => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => handleColorSelect(hex)}
                        className={cn(
                          'w-6 h-6 rounded-full transition-all',
                          color === hex
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        )}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>

                  {/* Hex input + native picker */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => nativePickerRef.current?.click()}
                        className="w-9 h-9 rounded-lg border border-white/[0.08] cursor-pointer hover:border-white/20 transition-colors flex items-center justify-center"
                        style={{ backgroundColor: color }}
                        title="Open color picker"
                      >
                        <Pipette size={14} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                      </button>
                      <input
                        ref={nativePickerRef}
                        type="color"
                        value={color}
                        onChange={e => handleNativePickerChange(e.target.value)}
                        className="sr-only"
                        tabIndex={-1}
                      />
                    </div>

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono select-none">#</span>
                      <input
                        type="text"
                        value={hexInput.replace(/^#/, '')}
                        onChange={e => handleHexInputChange('#' + e.target.value)}
                        onBlur={handleHexInputBlur}
                        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                        placeholder="3b82f6"
                        maxLength={6}
                        className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-white/[0.08] rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 uppercase"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
