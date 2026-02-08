import path from 'path'
import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const EVENTS_FILE = join(process.cwd(), '..', '..', '..', 'task-events.json');
const WEBHOOKS_FILE = join(process.cwd(), '..', '..', '..', 'task-webhooks.json');

type EventType = 
  | 'task_created'
  | 'task_assigned'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'task_reassigned'
  | 'task_verified'
  | 'task_rejected';

interface TaskEvent {
  id: string;
  type: EventType;
  taskId: string;
  taskTitle: string;
  agentId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface EventLog {
  events: TaskEvent[];
  lastUpdated: string;
}

interface Webhook {
  id: string;
  url: string;
  events: EventType[];
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  failCount?: number;
}

interface WebhookConfig {
  webhooks: Webhook[];
}

function getEventLog(): EventLog {
  if (existsSync(EVENTS_FILE)) {
    return JSON.parse(readFileSync(EVENTS_FILE, 'utf-8'));
  }
  return { events: [], lastUpdated: new Date().toISOString() };
}

function saveEventLog(log: EventLog) {
  log.lastUpdated = new Date().toISOString();
  // Keep only last 500 events
  log.events = log.events.slice(-500);
  writeFileSync(EVENTS_FILE, JSON.stringify(log, null, 2));
}

function getWebhooks(): WebhookConfig {
  if (existsSync(WEBHOOKS_FILE)) {
    return JSON.parse(readFileSync(WEBHOOKS_FILE, 'utf-8'));
  }
  return { webhooks: [] };
}

function saveWebhooks(config: WebhookConfig) {
  writeFileSync(WEBHOOKS_FILE, JSON.stringify(config, null, 2));
}

function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Trigger webhooks for an event
async function triggerWebhooks(event: TaskEvent) {
  const config = getWebhooks();
  
  for (const webhook of config.webhooks) {
    if (!webhook.enabled) continue;
    if (!webhook.events.includes(event.type)) continue;
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          source: 'clawlegion',
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        webhook.lastTriggered = new Date().toISOString();
        webhook.failCount = 0;
      } else {
        webhook.failCount = (webhook.failCount || 0) + 1;
      }
    } catch (error) {
      webhook.failCount = (webhook.failCount || 0) + 1;
      console.error(`Webhook ${webhook.id} failed:`, error);
    }
  }
  
  saveWebhooks(config);
}

// POST: Record a new task event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, taskId, taskTitle, agentId, metadata } = body;

    if (!type || !taskId || !taskTitle) {
      return Response.json(
        { error: 'type, taskId, and taskTitle are required' },
        { status: 400 }
      );
    }

    const validTypes: EventType[] = [
      'task_created', 'task_assigned', 'task_started', 'task_completed',
      'task_failed', 'task_reassigned', 'task_verified', 'task_rejected'
    ];
    
    if (!validTypes.includes(type)) {
      return Response.json(
        { error: `Invalid event type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const event: TaskEvent = {
      id: generateId(),
      type,
      taskId,
      taskTitle,
      agentId,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Save to event log
    const log = getEventLog();
    log.events.push(event);
    saveEventLog(log);

    // Trigger webhooks asynchronously
    triggerWebhooks(event).catch(console.error);

    return Response.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Event recording error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get recent events
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const log = getEventLog();
  
  let events = [...log.events];
  
  // Filter by type
  const type = params.get('type');
  if (type) {
    events = events.filter(e => e.type === type);
  }
  
  // Filter by taskId
  const taskId = params.get('taskId');
  if (taskId) {
    events = events.filter(e => e.taskId === taskId);
  }
  
  // Filter by agentId
  const agentId = params.get('agentId');
  if (agentId) {
    events = events.filter(e => e.agentId === agentId);
  }
  
  // Limit
  const limit = parseInt(params.get('limit') || '50');
  events = events.slice(-limit).reverse();
  
  return Response.json({
    events,
    total: events.length,
    lastUpdated: log.lastUpdated,
  });
}
