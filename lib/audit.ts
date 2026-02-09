const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export type AuditAction = 
  | 'task_created' 
  | 'task_updated' 
  | 'task_completed' 
  | 'task_failed'
  | 'task_assigned'
  | 'task_deleted'
  | 'task_requeued'
  | 'agent_started'
  | 'agent_stopped'
  | 'agent_paused'
  | 'agent_resumed'
  | 'agent_rate_limited'
  | 'settings_changed'
  | 'export_requested'
  | 'verification_run'
  | 'system_event'
  | 'task_started';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  entityType: 'task' | 'agent' | 'settings' | 'system';
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

/**
 * Log an audit event by POSTing to the backend
 */
export function logAudit(
  action: AuditAction,
  actor: string,
  entityType: 'task' | 'agent' | 'settings' | 'system',
  options?: {
    entityId?: string;
    entityName?: string;
    details?: Record<string, unknown>;
    metadata?: {
      ip?: string;
      userAgent?: string;
      sessionId?: string;
    };
  }
): void {
  // Fire-and-forget POST to backend audit endpoint
  fetch(`${BACKEND_URL}/api/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      actor,
      entityType,
      entityId: options?.entityId,
      entityName: options?.entityName,
      details: options?.details,
      metadata: options?.metadata,
    }),
  }).catch(err => {
    console.error('Failed to send audit event to backend:', err.message);
  });
}

/**
 * Helper functions for common audit events
 */
export const audit = {
  taskCreated: (actor: string, taskId: string, taskTitle: string, details?: Record<string, unknown>) =>
    logAudit('task_created', actor, 'task', { entityId: taskId, entityName: taskTitle, details }),
  
  taskUpdated: (actor: string, taskId: string, taskTitle: string, details?: Record<string, unknown>) =>
    logAudit('task_updated', actor, 'task', { entityId: taskId, entityName: taskTitle, details }),
  
  taskCompleted: (actor: string, taskId: string, taskTitle: string, details?: Record<string, unknown>) =>
    logAudit('task_completed', actor, 'task', { entityId: taskId, entityName: taskTitle, details }),
  
  taskFailed: (actor: string, taskId: string, taskTitle: string, details?: Record<string, unknown>) =>
    logAudit('task_failed', actor, 'task', { entityId: taskId, entityName: taskTitle, details }),
  
  taskAssigned: (actor: string, taskId: string, taskTitle: string, assignedTo: string) =>
    logAudit('task_assigned', actor, 'task', { entityId: taskId, entityName: taskTitle, details: { assignedTo } }),
  
  taskDeleted: (actor: string, taskId: string, taskTitle: string) =>
    logAudit('task_deleted', actor, 'task', { entityId: taskId, entityName: taskTitle }),
  
  taskRequeued: (actor: string, taskId: string, taskTitle: string, details?: Record<string, unknown>) =>
    logAudit('task_requeued', actor, 'task', { entityId: taskId, entityName: taskTitle, details }),
  
  agentStarted: (agentId: string, details?: Record<string, unknown>) =>
    logAudit('agent_started', 'system', 'agent', { entityId: agentId, entityName: agentId, details }),
  
  agentStopped: (agentId: string, actor: string, details?: Record<string, unknown>) =>
    logAudit('agent_stopped', actor, 'agent', { entityId: agentId, entityName: agentId, details }),
  
  agentPaused: (agentId: string, actor: string, details?: Record<string, unknown>) =>
    logAudit('agent_paused', actor, 'agent', { entityId: agentId, entityName: agentId, details }),
  
  agentResumed: (agentId: string, actor: string, details?: Record<string, unknown>) =>
    logAudit('agent_resumed', actor, 'agent', { entityId: agentId, entityName: agentId, details }),
  
  verificationRun: (actor: string, details?: Record<string, unknown>) =>
    logAudit('verification_run', actor, 'system', { details }),
  
  systemEvent: (actor: string, eventName: string, details?: Record<string, unknown>) =>
    logAudit('system_event', actor, 'system', { entityName: eventName, details }),
};

export default audit;
