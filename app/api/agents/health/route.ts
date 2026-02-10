import { NextRequest, NextResponse } from 'next/server'

interface AgentConfig {
  id: string
  name: string
  healthEndpoint?: string
}

interface HealthResult {
  id: string
  name: string
  reachable: boolean
  latencyMs?: number
  lastCheck: string
  healthEndpoint?: string
  error?: string
  busy?: boolean
  activeTask?: string
}

interface HealthCheckResponse {
  agents: HealthResult[]
  summary: {
    total: number
    reachable: number
    unreachable: number
    noEndpoint: number
  }
  cachedAt: string
}

// Agent roles that correspond to workflow steps
const WORKFLOW_STEP_AGENTS: Record<string, string> = {
  research: 'scout',
  plan: 'athena', 
  build: 'vulcan',
  verify: 'vex'
}

// Default agents configuration
const DEFAULT_AGENTS: AgentConfig[] = [
  { id: 'caesar', name: 'Caesar' },
  { id: 'scout', name: 'Scout' },
  { id: 'athena', name: 'Athena' },
  { id: 'vulcan', name: 'Vulcan' },
  { id: 'vex', name: 'Vex' },
  { id: 'echo', name: 'Echo' },
  { id: 'forge', name: 'Forge' },
  { id: 'pixel', name: 'Pixel' },
  { id: 'quill', name: 'Quill' },
  { id: 'sage', name: 'Sage' },
]

// Simple in-memory cache with 30s TTL
let healthCache: HealthCheckResponse | null = null
let cacheTime: number = 0
const CACHE_TTL_MS = 30 * 1000 // 30 seconds

async function fetchActiveTasks(): Promise<any[]> {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${baseUrl}/api/task-tracking/tasks?status=building,verifying,researching,planning`, {
      cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : (data.tasks || [])
    }
  } catch (err) {
    console.warn('Could not fetch active tasks:', err)
  }
  return []
}

async function fetchAgentDetails(agentId: string): Promise<any> {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${baseUrl}/api/agents/${agentId}`, {
      cache: 'no-store',
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    console.warn(`Could not fetch agent details for ${agentId}:`, err)
  }
  return null
}

async function fetchAgentsFromConfig(): Promise<AgentConfig[]> {
  try {
    // Try to fetch from OpenClaw config API
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${baseUrl}/api/agent-config`, {
      cache: 'no-store',
    })
    if (response.ok) {
      const data = await response.json()
      const configAgents: AgentConfig[] = (data.agents || []).map((a: any) => ({
        id: a.id,
        name: a.identity?.name || a.name,
        healthEndpoint: a.healthEndpoint,
      }))
      
      if (configAgents.length > 0) {
        return configAgents
      }
    }
  } catch (err) {
    console.warn('Could not fetch agents from config API, using defaults')
  }
  return DEFAULT_AGENTS
}

function isAgentActiveForTask(agentId: string, task: any): boolean {
  // Check if agent is directly assigned to task
  if (task.assignee && task.assignee.toLowerCase() === agentId.toLowerCase()) {
    return true
  }
  
  // Check if task's workflow step maps to this agent
  const stepAgent = WORKFLOW_STEP_AGENTS[task.currentWorkflowStep]
  if (stepAgent && stepAgent.toLowerCase() === agentId.toLowerCase()) {
    return true
  }
  
  return false
}

async function checkAgentStatus(agentId: string, activeTasks: any[]): Promise<{ reachable: boolean; busy?: boolean; activeTask?: string; lastActiveAt?: string }> {
  // Caesar is always reachable (he's the gateway itself)
  if (agentId.toLowerCase() === 'caesar') {
    const hasActiveTasks = activeTasks.length > 0
    return { 
      reachable: true, 
      busy: hasActiveTasks,
      activeTask: hasActiveTasks ? `Orchestrating ${activeTasks.length} tasks` : undefined
    }
  }
  
  // Check if agent has active tasks
  const agentTasks = activeTasks.filter(task => isAgentActiveForTask(agentId, task))
  if (agentTasks.length > 0) {
    return { 
      reachable: true, 
      busy: true,
      activeTask: agentTasks[0].title || agentTasks[0].id
    }
  }
  
  // Check agent details for currentTaskId
  const agentDetails = await fetchAgentDetails(agentId)
  if (agentDetails?.currentTaskId) {
    return { 
      reachable: true, 
      busy: true,
      activeTask: agentDetails.currentTaskId
    }
  }
  
  // Check lastActiveAt for recent activity (within 5 minutes = idle)
  if (agentDetails?.lastActiveAt) {
    const lastActive = new Date(agentDetails.lastActiveAt)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    if (lastActive > fiveMinutesAgo) {
      return { 
        reachable: true, 
        busy: false,
        lastActiveAt: agentDetails.lastActiveAt
      }
    }
  }
  
  // Otherwise, agent is offline
  return { reachable: false }
}

async function performHealthChecks(): Promise<HealthCheckResponse> {
  const now = new Date().toISOString()
  const results: HealthResult[] = []
  
  const agents = await fetchAgentsFromConfig()
  const activeTasks = await fetchActiveTasks()
  
  // Check status for all agents
  const checks = agents.map(async (agent) => {
    const status = await checkAgentStatus(agent.id, activeTasks)
    
    const result: HealthResult = {
      id: agent.id,
      name: agent.name,
      reachable: status.reachable,
      lastCheck: now,
      healthEndpoint: agent.healthEndpoint,
      busy: status.busy,
      activeTask: status.activeTask,
    }
    
    if (!status.reachable) {
      result.error = status.lastActiveAt ? 'Inactive' : 'Offline'
    }
    
    return result
  })
  
  const checkResults = await Promise.all(checks)
  results.push(...checkResults)
  
  // Compute summary
  const summary = {
    total: results.length,
    reachable: results.filter(r => r.reachable).length,
    unreachable: results.filter(r => !r.reachable).length,
    noEndpoint: results.filter(r => !r.healthEndpoint).length,
  }
  
  return {
    agents: results,
    summary,
    cachedAt: now,
  }
}

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true'
  const agentId = request.nextUrl.searchParams.get('agentId')
  
  // Check cache
  const now = Date.now()
  if (!forceRefresh && healthCache && (now - cacheTime) < CACHE_TTL_MS) {
    if (agentId) {
      const agent = healthCache.agents.find(a => a.id === agentId)
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      return NextResponse.json({ agent, cachedAt: healthCache.cachedAt })
    }
    return NextResponse.json(healthCache)
  }
  
  // Perform fresh health checks
  const result = await performHealthChecks()
  
  // Update cache
  healthCache = result
  cacheTime = now
  
  if (agentId) {
    const agent = result.agents.find(a => a.id === agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    return NextResponse.json({ agent, cachedAt: result.cachedAt })
  }
  
  return NextResponse.json(result)
}

// POST: Trigger a single agent health check (kept for backward compatibility)
export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json()
    
    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
    }
    
    const activeTasks = await fetchActiveTasks()
    const status = await checkAgentStatus(agentId, activeTasks)
    
    return NextResponse.json({
      agentId,
      reachable: status.reachable,
      busy: status.busy,
      activeTask: status.activeTask,
      checkedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}