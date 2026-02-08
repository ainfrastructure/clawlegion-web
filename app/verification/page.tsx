'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { PageContainer } from '@/components/layout'
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

// ============================================
// REDESIGNED VERIFICATION PAGE - Mobile Responsive
// ============================================

interface VerificationReport {
  checkName: string
  timestamp: string
  passed: boolean
  apiResult: any
  frontendResult: any
  mismatchDetails?: string
}

export default function VerificationPage() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['verification'],
    queryFn: () => api.get('/frontend-verifier/status').then(r => r.data).catch(() => ({ reports: [], summary: { passed: 0, failed: 0, total: 0 } })),
  })

  const runMutation = useMutation({
    mutationFn: () => api.post('/frontend-verifier/run'),
    onSuccess: () => refetch(),
  })

  const reports: VerificationReport[] = data?.reports ?? []
  const summary = data?.summary ?? { passed: 0, failed: 0, total: 0 }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Shield className="text-cyan-400" /> Verification
            </h1>
            <p className="text-sm sm:text-base text-slate-400">API and frontend consistency checks</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => refetch()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg">
              <RefreshCw size={18} className="text-slate-400" />
            </button>
            <button 
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
            >
              <Play size={18} /> Run Verification
            </button>
          </div>
        </div>

        {/* Stats - 1 col mobile, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard 
            icon={<CheckCircle2 className="text-green-400" />}
            label="Passed" 
            value={summary.passed} 
            color="green" 
          />
          <StatCard 
            icon={<XCircle className="text-red-400" />}
            label="Failed" 
            value={summary.failed} 
            color="red" 
          />
          <StatCard 
            icon={<Shield className="text-cyan-400" />}
            label="Total Checks" 
            value={summary.total} 
            color="cyan" 
          />
        </div>
      </div>

      {/* Reports */}
      <div className="glass-2 rounded-xl">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06]">
          <h2 className="text-base sm:text-lg font-semibold text-white">Verification Reports</h2>
        </div>
        
        {isLoading ? (
          <div className="p-6 sm:p-8 text-center text-slate-400">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <Shield className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-sm sm:text-base text-slate-400">No verification reports yet</p>
            <button 
              onClick={() => runMutation.mutate()}
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm"
            >
              Run First Verification
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {reports.map((report, i) => (
              <ReportRow 
                key={report.checkName + i}
                report={report}
                isExpanded={expandedReport === report.checkName}
                onToggle={() => setExpandedReport(expandedReport === report.checkName ? null : report.checkName)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'border-l-green-500',
    red: 'border-l-red-500',
    cyan: 'border-l-cyan-500',
  }
  
  return (
    <div className={`glass-2 rounded-lg border-l-4 ${colors[color]} p-3 sm:p-4 flex items-center gap-3`}>
      {icon}
      <div>
        <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
        <div className="text-xs sm:text-sm text-slate-400">{label}</div>
      </div>
    </div>
  )
}

function ReportRow({ report, isExpanded, onToggle }: { report: VerificationReport; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div>
      <div 
        onClick={onToggle}
        className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {report.passed ? (
            <CheckCircle2 className="text-green-400 flex-shrink-0" size={18} />
          ) : (
            <XCircle className="text-red-400 flex-shrink-0" size={18} />
          )}
          <div className="min-w-0">
            <div className="font-medium text-white text-sm sm:text-base truncate">{report.checkName}</div>
            <div className="text-xs sm:text-sm text-slate-500">{new Date(report.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className={`px-2 py-1 rounded text-xs ${report.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {report.passed ? 'PASSED' : 'FAILED'}
          </span>
          {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 bg-slate-900/30">
          {report.mismatchDetails && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-xs sm:text-sm text-red-400">{report.mismatchDetails}</div>
            </div>
          )}
          {/* Stack on mobile, side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">API Result</div>
              <pre className="text-xs text-slate-300 bg-slate-900 p-2 rounded overflow-auto max-h-32 sm:max-h-40">
                {JSON.stringify(report.apiResult, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Frontend Result</div>
              <pre className="text-xs text-slate-300 bg-slate-900 p-2 rounded overflow-auto max-h-32 sm:max-h-40">
                {JSON.stringify(report.frontendResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
