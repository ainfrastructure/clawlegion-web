export interface TaskStatusUpdateEvent {
  taskId: string
  title: string
  status: string
  previousStatus?: string
  assignee?: string
  actor: string
  actorType: 'human' | 'agent'
  updatedAt: string
}

export interface TaskCompletedEvent {
  taskId: string
  title: string
  assignee?: string
  completedAt: string
}

export interface TaskStartedEvent {
  taskId: string
  title: string
  assignee?: string
  startedAt: string
}

export interface TaskVerifyingEvent {
  taskId: string
  title: string
  assignee?: string
  submittedAt: string
}

export interface TaskVerificationPassedEvent {
  taskId: string
  title: string
  verifiedAt: string
}

export interface TaskVerificationFailedEvent {
  taskId: string
  title: string
  reason?: string
  failedAt: string
}

export interface TaskUpdatedEvent {
  taskId: string
  title: string
  status: string
  previousStatus?: string
  assignee?: string
  updatedAt: string
  changes: Record<string, { from: any; to: any }>
}

export type TaskSocketEvents = {
  'task:status-updated': TaskStatusUpdateEvent
  'task:completed': TaskCompletedEvent
  'task:started': TaskStartedEvent
  'task:verifying': TaskVerifyingEvent
  'task:verification-passed': TaskVerificationPassedEvent
  'task:verification-failed': TaskVerificationFailedEvent
  'task:updated': TaskUpdatedEvent
}