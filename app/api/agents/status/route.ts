import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const AGENTS_FILE = join(process.cwd(), '..', '..', '..', 'agent-registry.json');

interface Agent {
  id: string;
  name: string;
  emoji: string;
  avatar?: string;
  role: 'lead' | 'secondary' | 'worker' | 'orchestrator' | 'planner' | 'builder' | 'verifier' | 'researcher';
  status: 'online' | 'busy' | 'idle' | 'offline';
  lastSeen: string;
  currentTask?: string;
  tasksCompleted: number;
  avgResponseTime: number; // seconds
  title?: string;
  description?: string;
  color?: string;
  healthEndpoint?: string;
  reportsTo?: string;
  capabilities?: string[];
}

interface AgentRegistry {
  agents: Agent[];
  lastUpdated: string;
}

// Default agents - source of truth comes from OpenClaw config API
// This is fallback data when API is not available
const DEFAULT_AGENTS: Omit<Agent, 'status' | 'lastSeen' | 'tasksCompleted' | 'avgResponseTime'>[] = [
  {
    id: 'sven',
    name: 'Sven',
    emoji: '👑',
    role: 'lead',
    title: 'CEO',
    description: 'Founder and CEO of socialChef',
    color: 'gold',
    avatar: '/agents/sven-ceo.png',
    capabilities: ['leadership', 'strategy', 'vision'],
  },
  {
    id: 'jarvis',
    name: 'Jarvis',
    emoji: '🎯',
    role: 'orchestrator',
    title: 'Orchestrator',
    description: 'Receives tasks, coordinates workflow, routes to specialists',
    color: 'blue',
    avatar: '/agents/jarvis-lobster.png',
    healthEndpoint: 'http://localhost:3030/health',
    capabilities: ['orchestration', 'planning', 'code-review', 'task-management'],
  },
  {
    id: 'archie',
    name: 'Archie',
    emoji: '🏛️',
    role: 'planner',
    title: 'Planner',
    description: 'Creates implementation plans with steps, files, and risks',
    color: 'purple',
    avatar: '/agents/archie-planner.png',
    capabilities: ['planning', 'architecture', 'documentation'],
  },
  {
    id: 'mason',
    name: 'Mason',
    emoji: '🔨',
    role: 'builder',
    title: 'Builder',
    description: 'Implements approved plans, writes code, commits changes',
    color: 'amber',
    avatar: '/agents/mason-builder.png',
    capabilities: ['coding', 'implementation', 'testing'],
  },
  {
    id: 'vex',
    name: 'Vex',
    emoji: '🧪',
    role: 'verifier',
    title: 'Verifier',
    description: 'Tests implementations with runtime evidence and screenshots',
    color: 'green',
    avatar: '/agents/vex-verifier.png',
    capabilities: ['testing', 'verification', 'screenshots'],
  },
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🔭',
    role: 'researcher',
    title: 'Researcher',
    description: 'Investigates, gathers intel, researches options',
    color: 'cyan',
    avatar: '/agents/scout-researcher.png',
    capabilities: ['research', 'investigation', 'analysis'],
  },
  {
    id: 'ralph',
    name: 'Ralph',
    emoji: '🔄',
    role: 'orchestrator',
    title: 'Loop Orchestrator',
    description: 'Manages the dashboard and orchestrates agent loops',
    color: 'pink',
    avatar: '/agents/ralph.svg',
    capabilities: ['orchestration', 'coordination', 'monitoring'],
  },
];

function getDefaultAgents(): Agent[] {
  return DEFAULT_AGENTS.map((member) => ({
    ...member,
    status: 'offline' as const,
    lastSeen: new Date().toISOString(),
    currentTask: undefined,
    tasksCompleted: 0,
    avgResponseTime: 0,
  }));
}

function getRegistry(): AgentRegistry {
  if (existsSync(AGENTS_FILE)) {
    const stored = JSON.parse(readFileSync(AGENTS_FILE, 'utf-8'));
    // Merge stored data with defaults to ensure all agents are present
    const storedMap = new Map<string, Agent>(stored.agents.map((a: Agent) => [a.id, a]));
    const merged = getDefaultAgents().map(defaultAgent => {
      const storedAgent = storedMap.get(defaultAgent.id);
      if (storedAgent) {
        // Merge: stored runtime data + default static data
        return {
          ...defaultAgent,
          ...storedAgent,
          // Keep default fields that shouldn't be overwritten
          emoji: storedAgent.emoji || defaultAgent.emoji,
          title: storedAgent.title || defaultAgent.title,
          description: storedAgent.description || defaultAgent.description,
          color: storedAgent.color || defaultAgent.color,
          healthEndpoint: storedAgent.healthEndpoint || defaultAgent.healthEndpoint,
          capabilities: storedAgent.capabilities?.length ? storedAgent.capabilities : defaultAgent.capabilities,
        };
      }
      return defaultAgent;
    });
    // Add any non-default agents from storage
    stored.agents.forEach((a: Agent) => {
      if (!DEFAULT_AGENTS.find((m) => m.id === a.id)) {
        merged.push(a);
      }
    });
    return { agents: merged, lastUpdated: stored.lastUpdated };
  }
  // Default registry
  return {
    agents: getDefaultAgents(),
    lastUpdated: new Date().toISOString()
  };
}

function saveRegistry(registry: AgentRegistry) {
  writeFileSync(AGENTS_FILE, JSON.stringify(registry, null, 2));
}

// GET: Get all agents or specific agent
export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId');
  const registry = getRegistry();
  
  if (agentId) {
    const agent = registry.agents.find(a => a.id === agentId);
    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }
    return Response.json({ agent });
  }
  
  return Response.json({
    agents: registry.agents,
    summary: {
      total: registry.agents.length,
      online: registry.agents.filter(a => a.status === 'online').length,
      busy: registry.agents.filter(a => a.status === 'busy').length,
      idle: registry.agents.filter(a => a.status === 'idle').length,
      offline: registry.agents.filter(a => a.status === 'offline').length
    },
    lastUpdated: registry.lastUpdated
  });
}

// POST: Register or update agent
export async function POST(request: NextRequest) {
  const { agentId, name, emoji, role, status, currentTask } = await request.json();
  
  if (!agentId) {
    return Response.json({ error: 'agentId required' }, { status: 400 });
  }
  
  const registry = getRegistry();
  let agent = registry.agents.find(a => a.id === agentId);
  
  if (agent) {
    // Update existing agent
    if (name) agent.name = name;
    if (emoji) agent.emoji = emoji;
    if (role) agent.role = role;
    if (status) agent.status = status;
    agent.currentTask = currentTask;
    agent.lastSeen = new Date().toISOString();
  } else {
    // Register new agent
    agent = {
      id: agentId,
      name: name || agentId,
      emoji: emoji || '🤖',
      role: role || 'worker',
      status: status || 'online',
      lastSeen: new Date().toISOString(),
      currentTask,
      tasksCompleted: 0,
      avgResponseTime: 0
    };
    registry.agents.push(agent);
  }
  
  registry.lastUpdated = new Date().toISOString();
  saveRegistry(registry);
  
  return Response.json({ success: true, agent });
}

// PATCH: Update agent status (heartbeat)
export async function PATCH(request: NextRequest) {
  const { agentId, status, currentTask, taskCompleted, activity } = await request.json();
  
  if (!agentId) {
    return Response.json({ error: 'agentId required' }, { status: 400 });
  }
  
  const registry = getRegistry();
  let agent = registry.agents.find(a => a.id === agentId);
  
  // Auto-register unknown agents
  if (!agent) {
    agent = {
      id: agentId,
      name: agentId,
      emoji: '🤖',
      role: 'worker',
      status: 'online',
      lastSeen: new Date().toISOString(),
      tasksCompleted: 0,
      avgResponseTime: 0
    };
    registry.agents.push(agent);
  }
  
  agent.lastSeen = new Date().toISOString();
  
  // Activity-based status updates
  if (activity) {
    switch (activity) {
      case 'task_claimed':
      case 'task_started':
        agent.status = 'busy';
        break;
      case 'task_completed':
        agent.status = 'online';
        agent.tasksCompleted++;
        break;
      case 'idle':
        agent.status = 'idle';
        break;
      case 'heartbeat':
        // Only set online if not busy
        if (agent.status === 'offline' || agent.status === 'idle') {
          agent.status = 'online';
        }
        break;
    }
  }
  
  if (status) agent.status = status;
  if (currentTask !== undefined) agent.currentTask = currentTask;
  if (taskCompleted) agent.tasksCompleted++;
  
  // Auto-detect stale agents (no activity in 5 min)
  registry.agents.forEach(a => {
    const lastSeen = new Date(a.lastSeen).getTime();
    const now = Date.now();
    if (now - lastSeen > 5 * 60 * 1000 && a.status !== 'offline') {
      a.status = 'offline';
    }
  });
  
  registry.lastUpdated = new Date().toISOString();
  saveRegistry(registry);
  
  return Response.json({ success: true, agent });
}
