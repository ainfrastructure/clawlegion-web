/**
 * Shared types for task modals and components
 */

/**
 * Attachment on a task
 */
export interface Attachment {
  type: string
  name: string
  url: string
}

/**
 * Subtask summary for inline display
 */
export interface SubtaskSummary {
  id: string
  title: string
  shortId?: string | null
  status: string
  priority: string
  assignee?: string | null
}

/**
 * Repository with optional Linear project mapping
 */
export interface Repository {
  id: string
  name: string
  fullName: string
  type?: string             // workspace type: code, research, content, operations, custom
  icon?: string | null      // emoji or icon name
  linearProject: {
    linearId: string
    name: string
  } | null
}

/**
 * Workspace (extended repository)
 */
export interface Workspace {
  id: string
  name: string
  fullName?: string
  type: 'code' | 'research' | 'content' | 'operations' | 'custom'
  description?: string | null
  icon?: string | null
  settings?: Record<string, unknown>
  linearProject?: {
    linearId: string
    name: string
  } | null
}

/**
 * Unified Task interface - superset of all task representations
 * All fields except core identifiers are optional to support partial data
 */
export interface Task {
  // Core identifiers (required)
  id: string
  title: string
  createdAt: string

  // Display
  shortId?: string | null
  description?: string

  // Classification
  priority?: string
  status?: string
  domain?: string
  attemptCount?: number
  tags?: string[]

  // Repository
  repositoryId?: string
  repository?: {
    id: string
    name: string
    fullName: string
  }

  // Planning
  specs?: string | null
  approach?: string | null
  successCriteria?: string | null

  // Attachments
  attachments?: Attachment[] | null

  // Workflow
  approvedAt?: string | null
  approvedBy?: string | null
  sessionId?: string | null

  // Assignment
  assignedTo?: string | null
  assignee?: string | null
  createdBy?: string | null

  // Timestamps
  updatedAt?: string

  // Verification (for tasks with verification flow)
  verificationAttempts?: number
  lastVerificationNote?: string | null
  verifiedBy?: string | null
  verifiedAt?: string | null

  // Sub-task hierarchy
  parentId?: string | null
  parent?: { id: string; title: string; shortId?: string | null } | null
  subtasks?: SubtaskSummary[]
}

/**
 * Props for TaskModal (edit/view existing task)
 */
export interface TaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

/**
 * Props for TaskDetailModal (view-only with activities)
 */
export interface TaskDetailModalProps {
  taskId: string
  task?: Partial<Task>
  isOpen: boolean
  onClose: () => void
}

/**
 * Props for task creation modals (NewTaskModal, EnhancedTaskModal)
 */
export interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
  repositories: Repository[]
}

/**
 * Props for QuickTaskModal (simplified creation)
 */
export interface QuickTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (task: Task) => void
}
