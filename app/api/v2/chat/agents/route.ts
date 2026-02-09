import { NextResponse } from 'next/server'
import { ALL_AGENTS } from '@/components/chat-v2/agentConfig'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'

// GET /api/v2/chat/agents
export async function GET() {
  try {
    // Try to fetch from Express backend first
    const response = await fetch(`${API_URL}/api/v2/chat/agents`, {
      next: { revalidate: 30 },
    })
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend unavailable, fall through to local config
  }

  // Fallback: return agents from canonical config
  const agents = ALL_AGENTS.map(agent => ({
    id: agent.id,
    name: agent.name,
    color: agent.color,
    icon: agent.emoji,
    role: agent.role,
    isOnline: false, // Unknown without health check
    port: agent.port,
  }))

  return NextResponse.json(agents)
}
