/**
 * Task-related types shared across pages
 */

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'researching'
  | 'planning'
  | 'building'
  | 'in_progress'
  | 'verifying'
  | 'done'
  | 'queued'
  | 'assigned'
  | 'completed'
  | 'failed'

export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'high' | 'medium' | 'low'

export interface TaskAttachment {
  type: string
  name: string
  url: string
}

export interface SubtaskSummary {
  id: string
  title: string
  shortId?: string | null
  status: TaskStatus
  priority: Priority
  assignee?: string | null
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  createdBy?: string
  createdAt: string
  updatedAt?: string
  assignedTo?: string
  assignee?: string
  tags?: string[]
  successCriteria?: string
  repository?: {
    id: string
    name: string
    fullName: string
    type?: string
    icon?: string | null
  }
  domain?: string  // workspace type: code, research, content, etc.
  attemptCount?: number
  verificationAttempts?: number
  lastVerificationNote?: string | null
  verifiedBy?: string | null
  verifiedAt?: string | null
  startedAt?: string | null
  submittedAt?: string | null
  shortId?: string
  specs?: string
  approach?: string
  attachments?: TaskAttachment[] | null
  sessionId?: string | null
  approvedAt?: string | null
  approvedBy?: string | null
  sprintId?: string | null
  sprint?: {
    id: string
    name: string
    status: string
  } | null
  parentId?: string | null
  parent?: { id: string; title: string; shortId?: string } | null
  subtasks?: SubtaskSummary[]
}

export interface Sprint {
  id: string
  name: string
  goal: string | null
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
  taskCount: number
  completedCount: number
  progress: number
  tasks?: Task[]
}

export interface TaskActivity {
  id: string
  taskId: string
  eventType: string
  actor: string
  actorType: 'human' | 'agent' | 'system'
  details?: Record<string, unknown>
  timestamp: string
}

export interface TaskComment {
  id: string
  content: string
  author: string
  authorType: 'human' | 'agent' | 'system'
  mentions?: string[]
  timestamp: string
}
