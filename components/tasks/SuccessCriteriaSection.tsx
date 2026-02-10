'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Code,
  Bug,
  Paintbrush,
  RefreshCw,
  FileText,
  Server,
  Search,
  Globe,
  Layout,
  Shield,
  ChevronDown,
} from 'lucide-react'

type SuccessCriterion = {
  id: string
  text: string
}

type CriteriaTemplate = {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  criteria: string[]
}

const CRITERIA_TEMPLATES: CriteriaTemplate[] = [
  {
    id: 'feature',
    name: 'Feature',
    icon: <Code className="w-3.5 h-3.5" />,
    color: '#06B6D4',
    criteria: [
      'Feature works as described in requirements',
      'All edge cases handled gracefully',
      'No regressions in existing functionality',
      'Tests written and passing',
      'Screenshot/recording proof captured',
    ],
  },
  {
    id: 'bugfix',
    name: 'Bug Fix',
    icon: <Bug className="w-3.5 h-3.5" />,
    color: '#EF4444',
    criteria: [
      'Bug successfully reproduced before fix',
      'Root cause identified and documented',
      'Fix applied and verified working',
      'No regressions introduced',
      'Test added to prevent recurrence',
    ],
  },
  {
    id: 'ui-design',
    name: 'UI / Design',
    icon: <Paintbrush className="w-3.5 h-3.5" />,
    color: '#D946EF',
    criteria: [
      'Visual output matches design spec or mockup',
      'Responsive across mobile, tablet, and desktop',
      'Animations and transitions feel smooth',
      'Dark mode / theme support verified',
      'Accessibility basics pass (contrast, focus, aria)',
    ],
  },
  {
    id: 'refactor',
    name: 'Refactor',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: '#10B981',
    criteria: [
      'Existing behavior preserved — no functional changes',
      'All tests still pass after refactor',
      'Code is cleaner, more readable, or better organized',
      'No new warnings or linting errors',
      'Performance is equal or better',
    ],
  },
  {
    id: 'api',
    name: 'API',
    icon: <Server className="w-3.5 h-3.5" />,
    color: '#EAB308',
    criteria: [
      'Endpoint responds correctly for all expected inputs',
      'Error responses follow consistent format with proper status codes',
      'Input validation rejects malformed or malicious data',
      'Authentication and authorization enforced',
      'API documentation updated',
    ],
  },
  {
    id: 'content',
    name: 'Content',
    icon: <FileText className="w-3.5 h-3.5" />,
    color: '#7C3AED',
    criteria: [
      'Content is factually accurate and up-to-date',
      'Tone and style match brand guidelines',
      'No spelling or grammar errors',
      'Links and references verified working',
      'SEO meta tags and structure applied',
    ],
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: <Shield className="w-3.5 h-3.5" />,
    color: '#8B5E3C',
    criteria: [
      'Deployment completes without errors',
      'Health checks and monitoring are green',
      'Rollback plan tested and documented',
      'Environment variables and secrets configured',
      'Logs accessible and errors are traceable',
    ],
  },
  {
    id: 'research',
    name: 'Research',
    icon: <Search className="w-3.5 h-3.5" />,
    color: '#4338CA',
    criteria: [
      'Research question clearly answered',
      'Findings are documented with sources',
      'Actionable recommendations provided',
      'Trade-offs and alternatives explored',
      'Summary formatted for stakeholder review',
    ],
  },
  {
    id: 'landing',
    name: 'Landing Page',
    icon: <Layout className="w-3.5 h-3.5" />,
    color: '#EC4899',
    criteria: [
      'Page loads under 3 seconds on mobile',
      'Hero section communicates value proposition clearly',
      'CTA buttons are prominent and functional',
      'Responsive across all breakpoints',
      'Open Graph / social preview tags set',
    ],
  },
  {
    id: 'integration',
    name: 'Integration',
    icon: <Globe className="w-3.5 h-3.5" />,
    color: '#C0C0C0',
    criteria: [
      'Third-party service connects successfully',
      'Data flows correctly in both directions',
      'Error handling covers timeouts and rate limits',
      'Credentials stored securely (not hardcoded)',
      'Webhook or callback endpoints verified',
    ],
  },
]

type SuccessCriteriaSectionProps = {
  criteria: SuccessCriterion[]
  onCriteriaChange: (criteria: SuccessCriterion[]) => void
}

export function SuccessCriteriaSection({
  criteria,
  onCriteriaChange,
}: SuccessCriteriaSectionProps) {
  const [newCriterion, setNewCriterion] = useState('')
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [showAllTemplates, setShowAllTemplates] = useState(false)

  const visibleTemplates = showAllTemplates
    ? CRITERIA_TEMPLATES
    : CRITERIA_TEMPLATES.slice(0, 5)

  const addCriterion = () => {
    if (newCriterion.trim()) {
      onCriteriaChange([
        ...criteria,
        { id: Date.now().toString(), text: newCriterion.trim() },
      ])
      setNewCriterion('')
    }
  }

  const removeCriterion = (id: string) => {
    onCriteriaChange(criteria.filter(c => c.id !== id))
  }

  const applyTemplate = (template: CriteriaTemplate) => {
    if (activeTemplateId === template.id) {
      // Clicking active template again — deselect but keep criteria
      setActiveTemplateId(null)
      return
    }

    setActiveTemplateId(template.id)
    const newCriteria = template.criteria.map((text, i) => ({
      id: `tpl-${template.id}-${i}`,
      text,
    }))
    onCriteriaChange(newCriteria)
  }

  const addFromTemplate = (template: CriteriaTemplate) => {
    // Add template criteria without replacing existing ones
    const existingTexts = new Set(criteria.map(c => c.text))
    const newItems = template.criteria
      .filter(text => !existingTexts.has(text))
      .map((text, i) => ({
        id: `tpl-${template.id}-${Date.now()}-${i}`,
        text,
      }))

    if (newItems.length > 0) {
      onCriteriaChange([...criteria, ...newItems])
      setActiveTemplateId(null) // Mark as custom mix
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-3">
        Success Criteria
      </label>

      {/* Template selector */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1.5">
          {visibleTemplates.map((template) => {
            const isActive = activeTemplateId === template.id
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  addFromTemplate(template)
                }}
                className={`
                  group/tpl relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                  text-[11px] font-medium transition-all duration-200 border
                  ${isActive
                    ? 'border-white/[0.15] bg-white/[0.08]'
                    : 'border-transparent bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.08]'
                  }
                `}
              >
                <span
                  className="transition-colors duration-200"
                  style={{ color: isActive ? template.color : undefined }}
                >
                  {template.icon}
                </span>
                <span
                  className={`transition-colors duration-200 ${isActive ? '' : 'text-slate-400 group-hover/tpl:text-slate-300'}`}
                  style={isActive ? { color: template.color } : undefined}
                >
                  {template.name}
                </span>
                {isActive && (
                  <div
                    className="absolute bottom-0 inset-x-2 h-px"
                    style={{ backgroundColor: `${template.color}60` }}
                  />
                )}
              </button>
            )
          })}

          {!showAllTemplates && CRITERIA_TEMPLATES.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllTemplates(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-400 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              +{CRITERIA_TEMPLATES.length - 5} more
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Criteria list */}
      <div className="bg-slate-900/50 rounded-xl border border-white/[0.06] p-4">
        <div className="space-y-2 mb-3">
          {criteria.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-2">
              Pick a template above or add your own criteria
            </p>
          ) : (
            criteria.map((criterion) => (
              <div
                key={criterion.id}
                className="group/item flex items-start gap-2 py-1"
              >
                <span className="text-green-400 mt-0.5 flex-shrink-0">&#10003;</span>
                <span className="flex-1 text-sm text-slate-300 leading-snug">
                  {criterion.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeCriterion(criterion.id)}
                  className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/item:opacity-100 transition-all flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add custom criterion */}
        <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
          <input
            type="text"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCriterion()
              }
            }}
            placeholder="Add custom criterion..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none"
          />
          <button
            type="button"
            onClick={addCriterion}
            disabled={!newCriterion.trim()}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-lg text-slate-300 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Count */}
        {criteria.length > 0 && (
          <p className="text-[10px] text-slate-600 mt-2 text-right">
            {criteria.length} criteri{criteria.length === 1 ? 'on' : 'a'}
          </p>
        )}
      </div>
    </div>
  )
}
