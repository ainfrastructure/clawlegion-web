import path from 'path'
import { NextRequest } from 'next/server';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const BUS_DIR = join(process.cwd(), '..', '..', '..', 'bus');

interface AgentStatus {
  agent: string;
  status: string;
  currentTask: string | null;
  workerCount: number;
  queueDepth: number;
  lastHeartbeat: string;
}

function readAgentStatus(agentName: string): AgentStatus | null {
  const statusFile = join(BUS_DIR, 'status', `${agentName}.json`);
  try {
    if (existsSync(statusFile)) {
      return JSON.parse(readFileSync(statusFile, 'utf-8'));
    }
  } catch {}
  return null;
}

function countMessages(queueDir: string): number {
  const queuePath = join(BUS_DIR, queueDir);
  try {
    if (existsSync(queuePath)) {
      const files = readdirSync(queuePath);
      return files.filter(f => f.endsWith('.json')).length;
    }
  } catch {}
  return 0;
}

function isOnline(lastHeartbeat: string | undefined, thresholdMs: number = 120000): boolean {
  if (!lastHeartbeat) return false;
  const heartbeatTime = new Date(lastHeartbeat).getTime();
  const now = Date.now();
  return (now - heartbeatTime) < thresholdMs;
}

export async function GET(request: NextRequest) {
  const chefStatus = readAgentStatus('SocialChefAI');
  const sousStatus = readAgentStatus('SousChef');
  
  const chefToSousCount = countMessages('chef-to-sous');
  const sousToChefCount = countMessages('sous-to-chef');
  
  return Response.json({
    timestamp: new Date().toISOString(),
    agents: {
      chef: {
        name: 'SocialChefAI',
        status: chefStatus?.status || 'unknown',
        online: isOnline(chefStatus?.lastHeartbeat),
        lastHeartbeat: chefStatus?.lastHeartbeat || null,
        currentTask: chefStatus?.currentTask || null,
        workerCount: chefStatus?.workerCount || 0,
      },
      sous: {
        name: 'SousChef',
        status: sousStatus?.status || 'unknown',
        online: isOnline(sousStatus?.lastHeartbeat),
        lastHeartbeat: sousStatus?.lastHeartbeat || null,
        currentTask: sousStatus?.currentTask || null,
        workerCount: sousStatus?.workerCount || 0,
      },
    },
    queues: {
      chefToSous: chefToSousCount,
      sousToChef: sousToChefCount,
      total: chefToSousCount + sousToChefCount,
    },
  });
}
