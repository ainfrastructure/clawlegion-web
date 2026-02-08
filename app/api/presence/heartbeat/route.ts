import path from 'path'
import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"

const HEARTBEAT_FILE = path.join(process.cwd(), "agent-heartbeats.json")

interface AgentHeartbeat {
  agentId: string
  name: string
  status: "online" | "busy" | "away" | "offline"
  currentTask?: string
  lastHeartbeat: string
  workingOn?: string
  location?: string
}

async function loadHeartbeats(): Promise<Record<string, AgentHeartbeat>> {
  try {
    const content = await fs.readFile(HEARTBEAT_FILE, "utf-8")
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function saveHeartbeats(heartbeats: Record<string, AgentHeartbeat>) {
  await fs.writeFile(HEARTBEAT_FILE, JSON.stringify(heartbeats, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, name, status, currentTask, workingOn, location } = body

    if (!agentId) {
      return NextResponse.json({ error: "agentId required" }, { status: 400 })
    }

    const heartbeats = await loadHeartbeats()
    heartbeats[agentId] = {
      agentId,
      name: name || agentId,
      status: status || "online",
      currentTask,
      workingOn,
      location,
      lastHeartbeat: new Date().toISOString()
    }

    await saveHeartbeats(heartbeats)
    return NextResponse.json({ success: true, agent: heartbeats[agentId] })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const heartbeats = await loadHeartbeats()
    const now = Date.now()
    const TWO_MIN = 2 * 60 * 1000
    const FIVE_MIN = 5 * 60 * 1000

    const agents = Object.values(heartbeats).map(agent => {
      const lastBeat = new Date(agent.lastHeartbeat).getTime()
      const age = now - lastBeat

      let effectiveStatus = agent.status
      if (age > FIVE_MIN) effectiveStatus = "offline"
      else if (age > TWO_MIN) effectiveStatus = "away"

      return {
        ...agent,
        effectiveStatus,
        lastHeartbeatAge: Math.floor(age / 1000) + "s ago"
      }
    })

    return NextResponse.json({ agents, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ agents: [], error: String(error) })
  }
}
