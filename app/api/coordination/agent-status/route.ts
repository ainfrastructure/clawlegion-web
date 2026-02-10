import { NextRequest, NextResponse } from 'next/server'
import { getAllAgentIds } from '@/components/chat-v2/agentConfig'

// In-memory agent status store
interface AgentStatusEntry {
  status: 'online' | 'thinking' | 'typing' | 'offline'
  lastSeen: string
  lastActivity?: string
}

// Use global to persist across hot reloads in dev
const globalForStatus = globalThis as unknown as {
  agentStatuses: Map<string, AgentStatusEntry>
}

if (!globalForStatus.agentStatuses) {
  globalForStatus.agentStatuses = new Map()
  // Initialize with default online status for all agents (derived from agentConfig)
  for (const agentId of getAllAgentIds()) {
    globalForStatus.agentStatuses.set(agentId, {
      status: 'online',
      lastSeen: new Date().toISOString(),
    })
  }
}

const agentStatuses = globalForStatus.agentStatuses

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  
  if (agentId) {
    const status = agentStatuses.get(agentId)
    if (status) {
      return NextResponse.json(status)
    }
    return NextResponse.json({ status: 'offline', lastSeen: null })
  }
  
  // Return all agent statuses
  const all: Record<string, AgentStatusEntry> = {}
  agentStatuses.forEach((v, k) => {
    all[k] = v
  })
  
  return NextResponse.json({ agents: all })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentId, status, activity, action } = body
    
    // Handle heartbeat action
    if (action === 'heartbeat') {
      if (!agentId) {
        return NextResponse.json({ error: 'agentId required' }, { status: 400 })
      }
      
      const entry = agentStatuses.get(agentId) || {
        status: 'online' as const,
        lastSeen: new Date().toISOString(),
      }
      
      entry.status = status || 'online'
      entry.lastSeen = new Date().toISOString()
      agentStatuses.set(agentId, entry)
      
      return NextResponse.json({ success: true, agentId, status: entry.status })
    }
    
    // Handle "seen" action
    if (action === 'seen') {
      if (!agentId) {
        return NextResponse.json({ error: 'agentId required' }, { status: 400 })
      }
      
      const entry = agentStatuses.get(agentId) || {
        status: 'online' as const,
        lastSeen: new Date().toISOString(),
      }
      
      entry.lastSeen = new Date().toISOString()
      agentStatuses.set(agentId, entry)
      
      return NextResponse.json({ success: true, agentId, lastSeen: entry.lastSeen })
    }
    
    // Default: update status
    if (!agentId || !status) {
      return NextResponse.json({ error: 'agentId and status required' }, { status: 400 })
    }
    
    const validStatuses = ['online', 'thinking', 'typing', 'offline']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }
    
    agentStatuses.set(agentId, {
      status,
      lastSeen: new Date().toISOString(),
      lastActivity: activity,
    })
    
    return NextResponse.json({
      success: true,
      agentId,
      status,
      lastSeen: agentStatuses.get(agentId)?.lastSeen
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
