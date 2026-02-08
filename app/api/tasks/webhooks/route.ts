import path from 'path'
import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

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

interface Webhook {
  id: string;
  url: string;
  events: EventType[];
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  failCount?: number;
  description?: string;
}

interface WebhookConfig {
  webhooks: Webhook[];
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
  return `wh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// GET: List all webhooks
export async function GET() {
  const config = getWebhooks();
  
  return Response.json({
    webhooks: config.webhooks,
    total: config.webhooks.length,
  });
}

// POST: Create a new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events, description } = body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return Response.json(
        { error: 'url and events (array) are required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return Response.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const validTypes: EventType[] = [
      'task_created', 'task_assigned', 'task_started', 'task_completed',
      'task_failed', 'task_reassigned', 'task_verified', 'task_rejected'
    ];
    
    for (const event of events) {
      if (!validTypes.includes(event)) {
        return Response.json(
          { error: `Invalid event type: ${event}. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const webhook: Webhook = {
      id: generateId(),
      url,
      events,
      enabled: true,
      createdAt: new Date().toISOString(),
      failCount: 0,
      description,
    };

    const config = getWebhooks();
    config.webhooks.push(webhook);
    saveWebhooks(config);

    return Response.json({
      success: true,
      webhook,
    }, { status: 201 });
  } catch (error) {
    console.error('Webhook creation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a webhook
export async function DELETE(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const webhookId = params.get('id');

    if (!webhookId) {
      return Response.json(
        { error: 'Webhook id is required' },
        { status: 400 }
      );
    }

    const config = getWebhooks();
    const index = config.webhooks.findIndex(w => w.id === webhookId);

    if (index === -1) {
      return Response.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    const removed = config.webhooks.splice(index, 1)[0];
    saveWebhooks(config);

    return Response.json({
      success: true,
      removed,
    });
  } catch (error) {
    console.error('Webhook deletion error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update webhook (enable/disable, update events)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled, events, url, description } = body;

    if (!id) {
      return Response.json(
        { error: 'Webhook id is required' },
        { status: 400 }
      );
    }

    const config = getWebhooks();
    const webhook = config.webhooks.find(w => w.id === id);

    if (!webhook) {
      return Response.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    if (typeof enabled === 'boolean') {
      webhook.enabled = enabled;
    }
    if (events && Array.isArray(events)) {
      webhook.events = events;
    }
    if (url) {
      webhook.url = url;
    }
    if (description !== undefined) {
      webhook.description = description;
    }

    saveWebhooks(config);

    return Response.json({
      success: true,
      webhook,
    });
  } catch (error) {
    console.error('Webhook update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
