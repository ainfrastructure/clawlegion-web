'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  RefreshCw, TrendingUp, Activity, Eye, Loader2
} from 'lucide-react'

interface VerificationCheck {
  checkName: string
  timestamp: string
  passed: boolean
  apiResult: any
  frontendResult: any
  mismatchDetails?: string
}

interface VerificationReport {
  summary: { passed: number; failed: number; bugs_created: number }
  reports: VerificationCheck[]
}

interface TaskConfidence {
  id: string
  title: string
  confidence: number
  tested: boolean
  status: string
}

export function VerificationDashboard() {
  const [report, setReport] = useState<VerificationReport | null>(null)
  const [tasks, setTasks] = useState<TaskConfidence[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const tasksRes = await fetch('/api/tasks/queue')
      if (tasksRes.ok) {
        const data = await tasksRes.json()
        const withConfidence = (data.tasks || [])
          .filter((t: any) => t.confidence !== undefined || t.tested)
          .map((t: any) => ({
            id: t.id, title: t.title,
            confidence: t.confidence || 0,
            tested: t.tested || false, status: t.status
          }))
        setTasks(withConfidence)
      }
    } catch (err) { console.error('Failed to fetch:', err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const runVerification = async () => {
    setRunning(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const res = await fetch(`${apiUrl}/api/frontend-verifier/run`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setReport(data)
        setLastRun(new Date().toISOString())
      }
    } catch (err) { console.error('Failed to run:', err) }
    finally { setRunning(false) }
  }

  const avgConfidence = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, t) => sum + t.confidence, 0) / tasks.length) : 0
  const testedCount = tasks.filter(t => t.tested).length
  const lowConfidenceCount = tasks.filter(t => t.confidence < 60 && t.confidence > 0).length

  const getCheckClass = (passed: boolean) => passed 
    ? 'bg-green-500/10 border border-green-500/30' 
    : 'bg-red-500/10 border border-red-500/30'
  
  const getStatusClass = (status: string) => {
    if (status === 'completed') return 'text-green-400'
    if (status === 'in-progress') return 'text-yellow-400'
    return 'text-slate-500'
  }

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-green-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Verification Dashboard</h2>
            <p className="text-xs text-slate-400">Monitor task confidence and data integrity</p>
          </div>
        </div>
        <button onClick={runVerification} disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Run Checks
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4" /><span className="text-xs">Avg Confidence</span>
          </div>
          <div className="text-2xl font-bold text-white">{avgConfidence}%</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4" /><span className="text-xs">Tested Tasks</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{testedCount}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <AlertTriangle className="w-4 h-4" /><span className="text-xs">Low Confidence</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{lowConfidenceCount}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Activity className="w-4 h-4" /><span className="text-xs">Last Check</span>
          </div>
          <div className="text-sm font-medium text-slate-300">
            {lastRun ? new Date(lastRun).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {report && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Latest Verification Run</h3>
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-4 h-4" /> {report.summary.passed} passed
            </span>
            {report.summary.failed > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <XCircle className="w-4 h-4" /> {report.summary.failed} failed
              </span>
            )}
          </div>
          <div className="space-y-2">
            {report.reports.map((check, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${getCheckClass(check.passed)}`}>
                <div className="flex items-center gap-3">
                  {check.passed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-slate-200">{check.checkName}</span>
                </div>
                <span className="text-xs text-slate-400">{check.apiResult}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Task Confidence Scores</h3>
        {loading ? (
          <div className="text-center py-4 text-slate-500">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No confidence data yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tasks.sort((a, b) => a.confidence - b.confidence).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">{task.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${getStatusClass(task.status)}`}>{task.status}</span>
                    {task.tested && <span className="text-xs text-green-400">✓ tested</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getConfidenceClass(task.confidence)}`} style={{ width: `${task.confidence}%` }} />
                  </div>
                  <span className="text-sm text-slate-400 w-10 text-right">{task.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationDashboard
