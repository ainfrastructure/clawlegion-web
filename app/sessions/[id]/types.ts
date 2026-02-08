/**
 * Re-export shared types for this page
 * Extended with page-specific requirements
 */
export type {
  Log,
  LogLevel,
  Execution,
  SessionAnalytics,
  ApprovalRequest,
  GitHubIssue,
} from '@/types'

// Session type extended for this page (logs and executions are required)
import type { Session as BaseSession, Log, Execution } from '@/types'

export interface Session extends Omit<BaseSession, 'logs' | 'executions'> {
  goal: string
  logs: Log[]
  executions: Execution[]
}
