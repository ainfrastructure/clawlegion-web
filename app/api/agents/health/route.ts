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

// Default agents with health endpoints (OpenClaw ports)
// Configure via AGENT_HEALTH_<NAME> environment variables (e.g. AGENT_HEALTH_JARVIS=http://localhost:18789/health)
const DEFAULT_AGENTS: AgentConfig[] = [
  { id: 'sven', name: 'Sven', healthEndpoint: process.env.AGENT_HEALTH_SVEN || 'http://localhost:18795/health' },
  { id: 'jarvis', name: 'Jarvis', healthEndpoint: process.env.AGENT_HEALTH_JARVIS || 'http://localhost:18789/health' },
  { id: 'lux', name: 'Lux', healthEndpoint: process.env.AGENT_HEALTH_LUX || 'http://localhost:18796/health' },
  { id: 'archie', name: 'Archie', healthEndpoint: process.env.AGENT_HEALTH_ARCHIE || 'http://localhost:18790/health' },
  { id: 'mason', name: 'Mason', healthEndpoint: process.env.AGENT_HEALTH_MASON || 'http://localhost:18791/health' },
  { id: 'vex', name: 'Vex', healthEndpoint: process.env.AGENT_HEALTH_VEX || 'http://localhost:18792/health' },
  { id: 'scout', name: 'Scout', healthEndpoint: process.env.AGENT_HEALTH_SCOUT || 'http://localhost:18793/health' },
  { id: 'ralph', name: 'Ralph', healthEndpoint: process.env.AGENT_HEALTH_RALPH || 'http://localhost:18794/health' },
]

// Simple in-memory cache with 30s TTL
let healthCache: HealthCheckResponse | null = null
let cacheTime: number = 0
const CACHE_TTL_MS = 30 * 1000 // 30 seconds

async function checkHealth(endpoint: string, timeoutMs = 5000): Promise<{ reachable: boolean; latencyMs?: number; error?: string }> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)
    
    const latencyMs = Date.now() - startTime
    
    if (response.ok) {
      return { reachable: true, latencyMs }
    } else {
      return { reachable: false, latencyMs, error: `HTTP ${response.status}` }
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    const latencyMs = Date.now() - startTime
    
    if (err.name === 'AbortError') {
      return { reachable: false, latencyMs, error: 'Timeout' }
    }
    return { reachable: false, latencyMs, error: err.message || 'Connection failed' }
  }
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
      // Only use config agents if they have health endpoints; otherwise merge with defaults
      const hasEndpoints = configAgents.some(a => a.healthEndpoint)
      if (hasEndpoints) {
        return configAgents
      }
      // Config agents lack health endpoints — use defaults (which have them)
    }
  } catch (err) {
    console.warn('Could not fetch agents from config API, using defaults')
  }
  return DEFAULT_AGENTS
}

async function performHealthChecks(): Promise<HealthCheckResponse> {
  const now = new Date().toISOString()
  const results: HealthResult[] = []
  
  const agents = await fetchAgentsFromConfig()
  
  // Check health for all agents with health endpoints
  const checks = agents.map(async (agent) => {
    const result: HealthResult = {
      id: agent.id,
      name: agent.name,
      reachable: false,
      lastCheck: now,
      healthEndpoint: agent.healthEndpoint,
    }
    
    if (agent.healthEndpoint) {
      const health = await checkHealth(agent.healthEndpoint)
      result.reachable = health.reachable
      result.latencyMs = health.latencyMs
      if (health.error) {
        result.error = health.error
      }
    }
    
    return result
  })
  
  const checkResults = await Promise.all(checks)
  results.push(...checkResults)
  
  // Compute summary
  const withEndpoint = results.filter(r => r.healthEndpoint)
  const summary = {
    total: results.length,
    reachable: results.filter(r => r.reachable).length,
    unreachable: withEndpoint.filter(r => !r.reachable).length,
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

// POST: Trigger a single agent health check
export async function POST(request: NextRequest) {
  try {
    const { agentId, endpoint } = await request.json()
    
    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 })
    }
    
    const health = await checkHealth(endpoint)
    
    return NextResponse.json({
      agentId,
      endpoint,
      ...health,
      checkedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
