/**
 * Common types shared across pages
 */

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

export interface ApprovalRequest {
  id: string
  type: string
  title: string
  description: string
  status: string
  createdAt: string
  respondedAt?: string
  respondedBy?: string
}

export interface GitHubIssue {
  id: string
  issueNumber: number
  issueUrl: string
  title: string
  status: string
  repository: {
    name: string
  }
  relatedFailures?: Array<{
    taskId: string
    taskName: string
    category: string
    createdAt: string
  }>
}

export interface Repository {
  id: string
  name: string
  fullName?: string
  githubUrl?: string
  localPath?: string
  linearProject?: {
    linearId: string
    name: string
  }
}

// ============================================
// Workspace (extends Repository)
// ============================================

export type WorkspaceType = 'code' | 'research' | 'content' | 'operations' | 'custom'

export interface Workspace {
  id: string
  name: string
  fullName?: string
  type: WorkspaceType
  description?: string | null
  icon?: string | null
  settings?: Record<string, unknown>
  githubUrl?: string | null
  localPath?: string | null
  isInitialized?: boolean
  linearProject?: {
    linearId: string
    name: string
  } | null
  createdAt?: string
  updatedAt?: string
}

// ============================================
// Deliverable
// ============================================

export type DeliverableType = 'document' | 'code_diff' | 'report' | 'blog_post' | 'artifact'
export type DeliverableStatus = 'draft' | 'submitted' | 'approved' | 'published'

export interface Deliverable {
  id: string
  taskId: string
  type: DeliverableType
  title: string
  content?: string | null
  contentUrl?: string | null
  metadata?: Record<string, unknown> | null
  score?: number | null
  status: DeliverableStatus
  createdAt: string
  updatedAt: string
}

// ============================================
// UI Mode
// ============================================

export type UIMode = 'easy' | 'power'

// ============================================
// Metrics
// ============================================

export interface DashboardMetrics {
  volume: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    tasksCompletedThisWeek: number
    tasksCompletedLastWeek: number
    weeklyThroughput: number[]
  }
  quality: {
    avgVerificationPassRate: number
    avgDeliverableScore: number | null
    reworkRate: number
    totalVerifications: number
  }
  efficiency: {
    avgTimeToCompleteHours: number | null
    agentUtilizationRate: number
    activeAgents: number
    totalAgents: number
  }
  roi: {
    tasksCompleted: number
    estimatedHoursSaved: number
    hourlyRate: number
    estimatedValueSaved: number
  }
  workspaces: {
    total: number
    byType: Record<string, number>
  }
}
