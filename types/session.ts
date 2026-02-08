/**
 * Session-related types shared across pages
 */

export interface Session {
  id: string
  name: string
  goal?: string
  status: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  processId?: number
  exitCode?: number
  backlogCount?: number
  repository: {
    id: string
    name: string
    githubUrl?: string
  }
  logs?: Log[]
  executions?: Execution[]
  config?: SessionConfig
  taskStats?: {
    completed: number
    total: number
  }
}

export interface SessionConfig {
  assignee?: string
  sourceTaskId?: string
  [key: string]: unknown
}

export interface Log {
  id: string
  message: string
  level: string
  timestamp: string
  source?: string
  sessionId?: string
}

export type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

export interface Execution {
  id: string
  taskId: string
  taskName: string
  status: string
  startedAt: string
  completedAt?: string
  duration?: number
  commitSha?: string
}

export interface SessionAnalytics {
  session: {
    id: string
    name: string
    status: string
    startedAt?: string
    completedAt?: string
    duration?: number
  }
  taskStats: {
    total: number
    completed: number
    failed: number
    running: number
    pending: number
    successRate: number
  }
  timeline: Execution[]
}
