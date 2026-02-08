'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'

export interface CriterionCheck {
  criterion: string
  checked: boolean
  evidence: string
  notes?: string
}

interface CriteriaChecklistProps {
  criteria: string[]
  checks: CriterionCheck[]
  onChange: (checks: CriterionCheck[]) => void
  disabled?: boolean
}

interface CriterionItemProps {
  criterion: string
  check: CriterionCheck
  onChange: (check: CriterionCheck) => void
  index: number
  disabled?: boolean
}

function CriterionItem({ criterion, check, onChange, index, disabled }: CriterionItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = useCallback(() => {
    onChange({
      ...check,
      checked: !check.checked,
    })
  }, [check, onChange])

  const handleEvidenceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...check,
      evidence: e.target.value,
    })
  }, [check, onChange])

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...check,
      notes: e.target.value,
    })
  }, [check, onChange])

  const needsEvidence = check.checked && !check.evidence.trim()

  return (
    <div 
      className={`border rounded-lg transition-colors ${
        check.checked 
          ? 'border-green-500/30 bg-green-500/5' 
          : 'border-white/[0.06] bg-slate-800/30'
      }`}
    >
      {/* Criterion header */}
      <div className="p-3 flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          }`}
        >
          {check.checked ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-sm ${
              check.checked ? 'text-green-300' : 'text-slate-300'
            }`}>
              {criterion}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

          {/* Evidence warning */}
          {needsEvidence && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>Add evidence to support your check</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded evidence section */}
      {isExpanded && (
        <div className="px-3 pb-3 ml-8 space-y-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Evidence <span className="text-slate-600">(how did you verify this?)</span>
            </label>
            <textarea
              value={check.evidence}
              onChange={handleEvidenceChange}
              disabled={disabled}
              placeholder="e.g., Manual test in browser, ran unit tests, etc."
              className={`w-full px-3 py-2 bg-slate-900/50 border rounded-lg text-sm text-white 
                placeholder-slate-500 focus:outline-none focus:ring-1 resize-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${needsEvidence 
                  ? 'border-amber-500/50 focus:border-amber-400 focus:ring-amber-400/30' 
                  : 'border-white/[0.06] focus:border-blue-500 focus:ring-blue-500/30'
                }`}
              rows={2}
            />
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="text"
              value={check.notes || ''}
              onChange={handleNotesChange}
              disabled={disabled}
              placeholder="Any additional observations..."
              className="w-full px-3 py-2 bg-slate-900/50 border border-white/[0.06] rounded-lg text-sm
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function CriteriaChecklist({ criteria, checks, onChange, disabled }: CriteriaChecklistProps) {
  const handleCheckChange = useCallback((index: number, check: CriterionCheck) => {
    const newChecks = [...checks]
    newChecks[index] = check
    onChange(newChecks)
  }, [checks, onChange])

  const checkedCount = checks.filter(c => c.checked).length
  const allChecked = checkedCount === criteria.length
  const hasEvidence = checks.every(c => !c.checked || c.evidence.trim())

  const handleCheckAll = useCallback(() => {
    const newChecked = !allChecked
    const newChecks = checks.map(check => ({
      ...check,
      checked: newChecked,
    }))
    onChange(newChecks)
  }, [allChecked, checks, onChange])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-300">Success Criteria Self-Check</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify each criterion and provide evidence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${
            allChecked ? 'text-green-400' : 'text-slate-400'
          }`}>
            {checkedCount}/{criteria.length} checked
          </span>
          <button
            onClick={handleCheckAll}
            disabled={disabled}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {allChecked ? 'Uncheck all' : 'Check all'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            allChecked && hasEvidence ? 'bg-green-500' : 
            allChecked ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${(checkedCount / criteria.length) * 100}%` }}
        />
      </div>

      {/* Criteria list */}
      <div className="space-y-3">
        {criteria.map((criterion, index) => (
          <CriterionItem
            key={index}
            criterion={criterion}
            check={checks[index]}
            onChange={(check) => handleCheckChange(index, check)}
            index={index}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Summary */}
      {!hasEvidence && checkedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Some checked criteria are missing evidence</span>
        </div>
      )}
    </div>
  )
}

export default CriteriaChecklist
