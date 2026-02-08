/**
 * Shared types for the dashboard
 * 
 * Import from '@/types' in pages and components:
 * import { Session, Task, Agent } from '@/types'
 */

// Session types
export type {
  Session,
  SessionConfig,
  Log,
  LogLevel,
  Execution,
  SessionAnalytics,
} from './session'

// Task types
export type {
  Task,
  TaskStatus,
  Priority,
  TaskActivity,
  TaskComment,
  TaskAttachment,
  Sprint,
} from './task'

// Agent types
export type {
  Agent,
  AgentStatus,
  AgentStats,
  HealthResult,
  HealthData,
} from './agent'

// Common types
export type {
  Pagination,
  ApiResponse,
  PaginatedResponse,
  ApprovalRequest,
  GitHubIssue,
  Repository,
} from './common'
