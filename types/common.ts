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
