import fs from 'fs';
import path from 'path';

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
  | 'system_event';

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

interface AuditLog {
  entries: AuditEntry[];
  lastUpdated: string;
}

const AUDIT_FILE = path.join(process.cwd(), 'data', 'audit-log.json');
const MAX_ENTRIES = 10000;

function ensureDataDir() {
  const dir = path.dirname(AUDIT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAuditLog(): AuditLog {
  ensureDataDir();
  if (!fs.existsSync(AUDIT_FILE)) {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

function saveAuditLog(log: AuditLog) {
  ensureDataDir();
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(log, null, 2));
}

/**
 * Log an audit event
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
): AuditEntry {
  const log = getAuditLog();
  
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    entityType,
    entityId: options?.entityId,
    entityName: options?.entityName,
    details: options?.details,
    metadata: options?.metadata,
  };
  
  log.entries.push(entry);
  log.lastUpdated = new Date().toISOString();
  
  // Keep only last MAX_ENTRIES to prevent file bloat
  if (log.entries.length > MAX_ENTRIES) {
    log.entries = log.entries.slice(-MAX_ENTRIES);
  }
  
  saveAuditLog(log);
  
  return entry;
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
