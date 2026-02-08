import { NextResponse } from "next/server"
import { AGENTS, checkAgentHealth, AgentPresence } from "@/lib/agents"

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Check all agents in parallel
    const healthChecks = await Promise.all(
      AGENTS.map(async (agent) => {
        const isOnline = await checkAgentHealth(agent.port);
        return {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          status: isOnline ? "online" : "offline",
          port: agent.port,
          lastChecked: now
        } as AgentPresence;
      })
    );
    
    return NextResponse.json({ 
      agents: healthChecks, 
      timestamp: now 
    });
  } catch (error) {
    console.error('Presence check error:', error);
    return NextResponse.json({ error: "Failed to get presence" }, { status: 500 })
  }
}
