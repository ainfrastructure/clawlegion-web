import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Audit log types
export type AuditAction = 
  | 'task_created' 
  | 'task_updated' 
  | 'task_completed' 
  | 'task_failed'
  | 'task_assigned'
  | 'task_deleted'
  | 'agent_started'
  | 'agent_stopped'
  | 'agent_rate_limited'
  | 'settings_changed'
  | 'export_requested'
  | 'verification_run'
  | 'system_event';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string; // who performed the action (agent, user, system)
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

// GET: Fetch audit logs with filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const actor = searchParams.get('actor');
  const action = searchParams.get('action');
  const entityType = searchParams.get('entityType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const log = getAuditLog();
  let entries = log.entries;
  
  // Apply filters
  if (actor) {
    entries = entries.filter(e => e.actor.toLowerCase().includes(actor.toLowerCase()));
  }
  if (action) {
    entries = entries.filter(e => e.action === action);
  }
  if (entityType) {
    entries = entries.filter(e => e.entityType === entityType);
  }
  if (startDate) {
    entries = entries.filter(e => new Date(e.timestamp) >= new Date(startDate));
  }
  if (endDate) {
    entries = entries.filter(e => new Date(e.timestamp) <= new Date(endDate));
  }
  
  // Sort by timestamp descending (most recent first)
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Pagination
  const total = entries.length;
  const paginatedEntries = entries.slice(offset, offset + limit);
  
  // Get unique actors and actions for filter dropdowns
  const actors = [...new Set(log.entries.map(e => e.actor))];
  const actions = [...new Set(log.entries.map(e => e.action))];
  
  return Response.json({
    entries: paginatedEntries,
    total,
    limit,
    offset,
    filters: {
      actors,
      actions,
      entityTypes: ['task', 'agent', 'settings', 'system']
    },
    lastUpdated: log.lastUpdated
  });
}

// POST: Add new audit entry
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const { action, actor, entityType, entityId, entityName, details } = body;
  
  if (!action || !actor || !entityType) {
    return Response.json(
      { error: 'action, actor, and entityType are required' },
      { status: 400 }
    );
  }
  
  const log = getAuditLog();
  
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    entityType,
    entityId,
    entityName,
    details,
  };
  
  log.entries.push(entry);
  log.lastUpdated = new Date().toISOString();
  
  // Keep only last 10000 entries to prevent file bloat
  if (log.entries.length > 10000) {
    log.entries = log.entries.slice(-10000);
  }
  
  saveAuditLog(log);
  
  return Response.json({ success: true, entry });
}

// DELETE: Clear old audit entries
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30');
  
  const log = getAuditLog();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const originalCount = log.entries.length;
  log.entries = log.entries.filter(e => new Date(e.timestamp) > cutoffDate);
  const deletedCount = originalCount - log.entries.length;
  
  log.lastUpdated = new Date().toISOString();
  saveAuditLog(log);
  
  return Response.json({
    success: true,
    deletedCount,
    remainingCount: log.entries.length
  });
}
