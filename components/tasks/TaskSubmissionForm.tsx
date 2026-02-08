'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  Send, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Plus,
  Trash2,
  Loader2
} from 'lucide-react'
import { ConfidenceSlider } from './ConfidenceSlider'
import { CriteriaChecklist, CriterionCheck } from './CriteriaChecklist'
import { Modal } from '@/components/ui/Modal'

export interface TaskSubmission {
  taskId: string
  builder: string
  submittedAt: string
  confidence: number
  criteriaChecks: CriterionCheck[]
  overallEvidence: string
  knownIssues: string[]
  filesChanged: string[]
  testCommands: string[]
}

interface Task {
  id: string
  title: string
  description?: string
  successCriteria?: string[]
  status: string
  assignedTo?: string
}

interface TaskSubmissionFormProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onSubmit: (submission: TaskSubmission) => Promise<void>
  builder?: string
  autoDetectedFiles?: string[]
}

function parseSuccessCriteria(task: Task): string[] {
  // Handle various formats of success criteria
  if (task.successCriteria && Array.isArray(task.successCriteria)) {
    return task.successCriteria
  }
  
  // Try to extract from description if formatted with checkboxes
  if (task.description) {
    const lines = task.description.split('\n')
    const criteria: string[] = []
    for (const line of lines) {
      const match = line.match(/^[\s]*[-*]\s*\[[\sx]\]\s*(.+)$/i)
      if (match) {
        criteria.push(match[1].trim())
      }
    }
    if (criteria.length > 0) return criteria
  }
  
  // Default fallback
  return ['Task completed as specified', 'Code compiles without errors', 'Manual testing passed']
}

export function TaskSubmissionForm({ 
  task, 
  isOpen, 
  onClose, 
  onSubmit,
  builder = 'anonymous',
  autoDetectedFiles = []
}: TaskSubmissionFormProps) {
  const successCriteria = useMemo(() => parseSuccessCriteria(task), [task])
  
  // Form state
  const [confidence, setConfidence] = useState(7)
  const [criteriaChecks, setCriteriaChecks] = useState<CriterionCheck[]>(
    successCriteria.map(c => ({
      criterion: c,
      checked: false,
      evidence: '',
      notes: undefined
    }))
  )
  const [overallEvidence, setOverallEvidence] = useState('')
  const [knownIssues, setKnownIssues] = useState('')
  const [filesChanged, setFilesChanged] = useState<string[]>(autoDetectedFiles)
  const [newFile, setNewFile] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validation
  const allCriteriaChecked = criteriaChecks.every(c => c.checked)
  const hasEvidence = criteriaChecks.every(c => !c.checked || c.evidence.trim())
  const isValid = allCriteriaChecked && hasEvidence

  // Handlers
  const handleAddFile = useCallback(() => {
    if (newFile.trim() && !filesChanged.includes(newFile.trim())) {
      setFilesChanged([...filesChanged, newFile.trim()])
      setNewFile('')
    }
  }, [newFile, filesChanged])

  const handleRemoveFile = useCallback((file: string) => {
    setFilesChanged(filesChanged.filter(f => f !== file))
  }, [filesChanged])

  const handleSubmit = useCallback(async () => {
    if (!isValid) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const submission: TaskSubmission = {
        taskId: task.id,
        builder,
        submittedAt: new Date().toISOString(),
        confidence,
        criteriaChecks,
        overallEvidence,
        knownIssues: knownIssues.split('\n').filter(l => l.trim()),
        filesChanged,
        testCommands: []
      }
      
      await onSubmit(submission)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }, [isValid, task.id, builder, confidence, criteriaChecks, overallEvidence, knownIssues, filesChanged, onSubmit, onClose])

  // Reset form when task changes
  const handleClose = useCallback(() => {
    setConfidence(7)
    setCriteriaChecks(successCriteria.map(c => ({
      criterion: c,
      checked: false,
      evidence: '',
      notes: undefined
    })))
    setOverallEvidence('')
    setKnownIssues('')
    setFilesChanged(autoDetectedFiles)
    setError(null)
    onClose()
  }, [successCriteria, autoDetectedFiles, onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" title="">
      <div className="max-h-[80vh] overflow-y-auto -mx-4 px-4">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white mb-1">
            Submit for Review
          </h2>
          <p className="text-sm text-slate-400">
            {task.title}
          </p>
        </div>

        <div className="space-y-6">
          {/* Confidence Slider */}
          <section>
            <ConfidenceSlider 
              value={confidence} 
              onChange={setConfidence} 
              disabled={isSubmitting}
            />
          </section>

          {/* Criteria Checklist */}
          <section>
            <CriteriaChecklist
              criteria={successCriteria}
              checks={criteriaChecks}
              onChange={setCriteriaChecks}
              disabled={isSubmitting}
            />
          </section>

          {/* Known Issues */}
          <section>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <AlertTriangle className="w-4 h-4 inline-block mr-1.5 text-amber-400" />
              Known Issues / Not Tested
            </label>
            <textarea
              value={knownIssues}
              onChange={(e) => setKnownIssues(e.target.value)}
              disabled={isSubmitting}
              placeholder="List any known issues, edge cases not tested, or limitations (one per line)"
              className="w-full px-3 py-2 glass-2 rounded-lg text-sm
                text-white placeholder-slate-500 focus:outline-none focus:border-amber-500
                focus:ring-1 focus:ring-amber-500/30 resize-none disabled:opacity-50"
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-1">
              Being honest about gaps helps the verifier focus their review
            </p>
          </section>

          {/* Files Changed */}
          <section>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileCode className="w-4 h-4 inline-block mr-1.5 text-blue-400" />
              Files Changed
            </label>
            
            {filesChanged.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {filesChanged.map((file) => (
                  <div 
                    key={file}
                    className="flex items-center justify-between px-3 py-2 glass-2 rounded-lg group"
                  >
                    <span className="text-sm text-slate-300 font-mono truncate">
                      {file}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(file)}
                      disabled={isSubmitting}
                      className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 
                        transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newFile}
                onChange={(e) => setNewFile(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
                disabled={isSubmitting}
                placeholder="Add file path..."
                className="flex-1 px-3 py-2 glass-2 rounded-lg text-sm
                  text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                  focus:ring-1 focus:ring-blue-500/30 font-mono disabled:opacity-50"
              />
              <button
                onClick={handleAddFile}
                disabled={isSubmitting || !newFile.trim()}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 
                  disabled:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Overall Evidence (optional) */}
          <section>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Overall Evidence <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={overallEvidence}
              onChange={(e) => setOverallEvidence(e.target.value)}
              disabled={isSubmitting}
              placeholder="Any additional context, test commands run, or general notes..."
              className="w-full px-3 py-2 glass-2 rounded-lg text-sm
                text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                focus:ring-1 focus:ring-blue-500/30 resize-none disabled:opacity-50"
              rows={2}
            />
          </section>

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 
              rounded-lg text-sm text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Validation message */}
          {!isValid && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 
              rounded-lg text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {!allCriteriaChecked 
                ? 'Check all success criteria before submitting'
                : 'Add evidence for all checked criteria'
              }
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 
              rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 
              disabled:hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Review
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskSubmissionForm
