import path from 'path'
import { NextRequest } from 'next/server';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { audit } from '@/lib/audit';

const BUS_INBOX = join(process.cwd(), '..', '..', '..', 'bus', 'inbox');

interface TunnelStatus {
  up: boolean;
  latency?: number;
  lastCheck: string;
}

// Check if agent's tunnel is up
async function checkTunnel(agent: string): Promise<TunnelStatus> {
  const ports: Record<string, number> = {
    souschef: 9901,
    SousChef: 9901,
  };
  
  const port = ports[agent.toLowerCase()] || 9901;
  
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    const latency = Date.now() - start;
    
    return {
      up: response.ok,
      latency,
      lastCheck: new Date().toISOString()
    };
  } catch {
    return {
      up: false,
      lastCheck: new Date().toISOString()
    };
  }
}

// Send task via tunnel
async function sendViaTunnel(agent: string, task: object): Promise<boolean> {
  const ports: Record<string, number> = {
    souschef: 9901,
    SousChef: 9901,
  };
  
  const port = ports[agent.toLowerCase()] || 9901;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`http://localhost:${port}/bus/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'task-assignment',
        timestamp: new Date().toISOString(),
        from: 'dashboard',
        payload: task
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    return response.ok;
  } catch {
    return false;
  }
}

// Fallback: write to inbox
function writeToInbox(agent: string, task: object): string {
  const agentInbox = join(BUS_INBOX, agent);
  if (!existsSync(agentInbox)) {
    mkdirSync(agentInbox, { recursive: true });
  }
  
  const filename = `${Date.now()}-task.json`;
  const filepath = join(agentInbox, filename);
  
  writeFileSync(filepath, JSON.stringify({
    type: 'task-assignment',
    timestamp: new Date().toISOString(),
    from: 'dashboard',
    payload: task
  }, null, 2));
  
  return filename;
}

// POST: Assign task to agent with tunnel verification
export async function POST(request: NextRequest) {
  const { taskId, agentId, task } = await request.json();
  
  if (!agentId) {
    return Response.json({ error: 'agentId required' }, { status: 400 });
  }
  
  // Step 1: Check tunnel status
  const tunnelStatus = await checkTunnel(agentId);
  
  // Step 2: Try instant delivery if tunnel is up
  let deliveryMethod = 'unknown';
  let delivered = false;
  
  if (tunnelStatus.up) {
    delivered = await sendViaTunnel(agentId, task || { taskId });
    if (delivered) {
      deliveryMethod = 'tunnel';
    }
  }
  
  // Step 3: Fallback to inbox if tunnel delivery failed
  let inboxFile = null;
  if (!delivered) {
    inboxFile = writeToInbox(agentId, task || { taskId });
    deliveryMethod = 'inbox';
    delivered = true;
  }
  
  // Audit log: task assigned
  const taskTitle = task?.title || taskId || 'Unknown task';
  audit.taskAssigned('dashboard', taskId || 'unknown', taskTitle, agentId);
  
  return Response.json({
    success: delivered,
    agentId,
    taskId,
    delivery: {
      method: deliveryMethod,
      tunnelStatus,
      inboxFile,
      instant: deliveryMethod === 'tunnel'
    },
    message: deliveryMethod === 'tunnel' 
      ? `Task delivered instantly to ${agentId}` 
      : `Task queued in inbox (tunnel down). ${agentId} will pick up on next poll.`
  });
}

// GET: Check agent tunnel status
export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId') || 'souschef';
  
  const tunnelStatus = await checkTunnel(agentId);
  
  return Response.json({
    agentId,
    tunnel: tunnelStatus,
    recommendation: tunnelStatus.up 
      ? 'ready' 
      : 'Agent tunnel is down. Tasks will be queued for polling.'
  });
}
