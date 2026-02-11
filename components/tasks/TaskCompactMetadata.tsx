'use client'

import {
  Calendar, Clock, CheckCircle, Shield, GitBranch, Link2, ExternalLink, RotateCcw, Tag,
} from 'lucide-react'
import { AgentAvatar } from '@/components/agents'
import { formatTimeAgo } from '@/components/common/TimeAgo'
import type { Task } from './types'

const domainConfig: Record<string, { color: string; bg: string; label: string }> = {
  dev: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Development' },
  research: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Research' },
  marketing: { color: 'text-pink-400', bg: 'bg-pink-500/20', label: 'Marketing' },
  ops: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Operations' },
  design: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Design' },
}

type TaskCompactMetadataProps = {
  task: Partial<Task> | undefined
}

export function TaskCompactMetadata({ task }: TaskCompactMetadataProps) {
  if (!task) return null

  return (
    <div className="space-y-2">
      {/* Agent chips row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {task.assignee && (
          <AgentChip label="Assigned" agentId={task.assignee} />
        )}
        {task.createdBy && (
          <AgentChip label="Created by" agentId={task.createdBy} />
        )}
        {task.approvedBy && (
          <AgentChip label="Approved by" agentId={task.approvedBy} />
        )}
        {task.verifiedBy && (
          <AgentChip label="Verified by" agentId={task.verifiedBy} />
        )}
        {!task.assignee && !task.createdBy && (
          <span className="text-slate-500 text-xs italic">Unassigned</span>
        )}
      </div>

      {/* Info row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {task.createdAt && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {formatTimeAgo(new Date(task.createdAt))}
          </span>
        )}
        {task.updatedAt && (
          <>
            <Dot />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {formatTimeAgo(new Date(task.updatedAt))}
            </span>
          </>
        )}
        {task.approvedAt && (
          <>
            <Dot />
            <span className="flex items-center gap-1 text-emerald-400/60">
              <CheckCircle className="w-3 h-3" />
              Approved {formatTimeAgo(new Date(task.approvedAt))}
            </span>
          </>
        )}
        {task.verifiedAt && (
          <>
            <Dot />
            <span className="flex items-center gap-1 text-cyan-400/60">
              <Shield className="w-3 h-3" />
              Verified {formatTimeAgo(new Date(task.verifiedAt))}
            </span>
          </>
        )}
        {task.repositories && task.repositories.length > 0 ? (
          <>
            <Dot />
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {task.repositories.map((r) => r.name).join(', ')}
            </span>
          </>
        ) : task.repository ? (
          <>
            <Dot />
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {task.repository.name}
            </span>
          </>
        ) : null}
        {task.domain && (
          <>
            <Dot />
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${domainConfig[task.domain]?.bg || 'bg-slate-800'} ${domainConfig[task.domain]?.color || 'text-slate-400'}`}>
                {domainConfig[task.domain]?.label || task.domain}
              </span>
            </span>
          </>
        )}
        {task.sessionId && (
          <>
            <Dot />
            <a
              href={`/sessions/${task.sessionId}`}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Link2 className="w-3 h-3" />
              View Logs <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </>
        )}
        {task.verificationAttempts !== undefined && task.verificationAttempts > 0 && (
          <>
            <Dot />
            <span className="flex items-center gap-1 text-red-400/70">
              <RotateCcw className="w-3 h-3" />
              {task.verificationAttempts}/3 retries
            </span>
          </>
        )}
        {task.attemptCount !== undefined && task.attemptCount > 0 && (
          <>
            <Dot />
            <span className="flex items-center gap-1 text-blue-400/70">
              <RotateCcw className="w-3 h-3" />
              {task.attemptCount} attempts
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function AgentChip({ label, agentId }: { label: string; agentId: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-400">
      <AgentAvatar agentId={agentId} size="sm" />
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-300 font-medium capitalize">{agentId}</span>
    </span>
  )
}

function Dot() {
  return <span className="text-slate-600">&middot;</span>
}
