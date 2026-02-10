import { NextResponse } from "next/server"
import { AGENTS, checkAgentHealth, AgentPresence } from "@/lib/agents"

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Check if Caesar (the orchestrator) is online — all agents are ephemeral sub-agents
    const caesarAgent = AGENTS.find(a => a.name === 'Caesar')
    const caesarOnline = caesarAgent ? await checkAgentHealth(caesarAgent.port) : false
    
    // If Caesar is online, all agents are available (they run as sub-agents)
    const healthChecks = AGENTS.map((agent) => {
      const isCaesar = agent.name === 'Caesar'
      const isOnline = caesarOnline // All agents are online if Caesar is
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: isOnline ? "online" : "offline",
        port: agent.port,
        lastChecked: now
      } as AgentPresence;
    });
    
    return NextResponse.json({ 
      agents: healthChecks, 
      timestamp: now 
    });
  } catch (error) {
    console.error('Presence check error:', error);
    return NextResponse.json({ error: "Failed to get presence" }, { status: 500 })
  }
}
