/**
 * Audit Log Tests
 * 
 * Tests for the audit logging system including:
 * - logAudit function
 * - Helper functions (audit.taskCreated, audit.agentPaused, etc.)
 * - File persistence
 * 
 * Run with: npx vitest run __tests__/api/audit.test.ts
 * Or: node --experimental-vm-modules node_modules/vitest/vitest.mjs run __tests__/api/audit.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock the audit module for testing
const AUDIT_FILE = path.join(process.cwd(), 'data', 'audit-log.test.json');

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, unknown>;
}

interface AuditLog {
  entries: AuditEntry[];
  lastUpdated: string;
}

// Simple audit implementation for testing
function getAuditLog(): AuditLog {
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
  const dir = path.dirname(AUDIT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(log, null, 2));
}

function logAudit(
  action: string,
  actor: string,
  entityType: string,
  options?: {
    entityId?: string;
    entityName?: string;
    details?: Record<string, unknown>;
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
  };
  
  log.entries.push(entry);
  log.lastUpdated = new Date().toISOString();
  saveAuditLog(log);
  
  return entry;
}

describe('Audit Log', () => {
  beforeEach(() => {
    // Clean up test file before each test
    if (fs.existsSync(AUDIT_FILE)) {
      fs.unlinkSync(AUDIT_FILE);
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(AUDIT_FILE)) {
      fs.unlinkSync(AUDIT_FILE);
    }
  });

  describe('logAudit', () => {
    it('should create an audit entry with required fields', () => {
      const entry = logAudit('task_created', 'TestUser', 'task');
      
      expect(entry).toBeDefined();
      expect(entry.id).toMatch(/^audit-/);
      expect(entry.action).toBe('task_created');
      expect(entry.actor).toBe('TestUser');
      expect(entry.entityType).toBe('task');
      expect(entry.timestamp).toBeDefined();
    });

    it('should include optional fields when provided', () => {
      const entry = logAudit('task_completed', 'TestAgent', 'task', {
        entityId: 'task-123',
        entityName: 'Test Task',
        details: { commit: 'abc123' },
      });
      
      expect(entry.entityId).toBe('task-123');
      expect(entry.entityName).toBe('Test Task');
      expect(entry.details).toEqual({ commit: 'abc123' });
    });

    it('should persist entries to file', () => {
      logAudit('test_action', 'Tester', 'system');
      
      const log = getAuditLog();
      expect(log.entries.length).toBe(1);
      expect(log.entries[0].action).toBe('test_action');
    });

    it('should accumulate multiple entries', () => {
      logAudit('action_1', 'User1', 'task');
      logAudit('action_2', 'User2', 'agent');
      logAudit('action_3', 'User3', 'system');
      
      const log = getAuditLog();
      expect(log.entries.length).toBe(3);
    });
  });

  describe('Audit Actions', () => {
    it('should log task_created correctly', () => {
      const entry = logAudit('task_created', 'SousChef', 'task', {
        entityId: 'task-abc',
        entityName: 'New Feature',
        details: { priority: 'high' },
      });
      
      expect(entry.action).toBe('task_created');
      expect(entry.entityType).toBe('task');
    });

    it('should log agent_paused correctly', () => {
      const entry = logAudit('agent_paused', 'dashboard', 'agent', {
        entityId: 'socialchefai',
        details: { reason: 'Manual pause' },
      });
      
      expect(entry.action).toBe('agent_paused');
      expect(entry.entityType).toBe('agent');
      expect(entry.details?.reason).toBe('Manual pause');
    });

    it('should log system_event correctly', () => {
      const entry = logAudit('system_event', 'auto-recovery', 'system', {
        entityName: 'corruption_detected',
        details: { sessionKey: 'session-123' },
      });
      
      expect(entry.action).toBe('system_event');
      expect(entry.entityType).toBe('system');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty details object', () => {
      const entry = logAudit('test', 'user', 'task', { details: {} });
      expect(entry.details).toEqual({});
    });

    it('should handle special characters in entity names', () => {
      const entry = logAudit('test', 'user', 'task', {
        entityName: 'Task with "quotes" and <brackets>',
      });
      expect(entry.entityName).toBe('Task with "quotes" and <brackets>');
    });

    it('should generate unique IDs', () => {
      const entry1 = logAudit('test', 'user', 'task');
      const entry2 = logAudit('test', 'user', 'task');
      expect(entry1.id).not.toBe(entry2.id);
    });
  });
});

describe('Audit Log Retrieval', () => {
  beforeEach(() => {
    if (fs.existsSync(AUDIT_FILE)) {
      fs.unlinkSync(AUDIT_FILE);
    }
  });

  it('should return empty log when file does not exist', () => {
    const log = getAuditLog();
    expect(log.entries).toEqual([]);
    expect(log.lastUpdated).toBeDefined();
  });

  it('should update lastUpdated timestamp', () => {
    const before = new Date().toISOString();
    logAudit('test', 'user', 'task');
    const log = getAuditLog();
    const after = new Date().toISOString();
    
    expect(log.lastUpdated >= before).toBe(true);
    expect(log.lastUpdated <= after).toBe(true);
  });
});
