import { NextRequest } from 'next/server';
import { ALL_AGENTS } from '@/components/chat-v2/agentConfig';

export const dynamic = 'force-dynamic';

async function checkAgentHealth(port: number, timeoutMs: number = 2000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    clearTimeout(timeout);

    // Fallback: try root endpoint
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), timeoutMs);

    try {
      const response = await fetch(`http://localhost:${port}/`, {
        signal: controller2.signal,
        method: 'HEAD'
      });
      clearTimeout(timeout2);
      return response.status < 500;
    } catch {
      clearTimeout(timeout2);
      return false;
    }
  }
}

async function getAgentStates() {
  const now = new Date().toISOString();

  // Filter to agents that have a port configured
  const agentsWithPorts = ALL_AGENTS.filter(a => a.port);

  const agents = await Promise.all(
    agentsWithPorts.map(async (agent) => {
      const isOnline = agent.port ? await checkAgentHealth(agent.port) : false;
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: isOnline ? 'online' : 'offline',
        port: agent.port,
        lastChecked: now,
        metrics: {
          tasksCompleted: 0,
          avgCompletionTime: 0,
          successRate: 0
        }
      };
    })
  );

  return agents;
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

      // Fetch current agent states
      try {
        const agents = await getAgentStates();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agents-list', agents })}\n\n`));
      } catch (e) {
        console.error('Error fetching agents:', e);
      }

      // Keep connection alive with heartbeats
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 15000);

      // Poll for updates every 5 seconds
      const pollInterval = setInterval(async () => {
        try {
          const agents = await getAgentStates();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agents-list', agents })}\n\n`));
        } catch (e) {
          console.error('Error polling agents:', e);
        }
      }, 5000);

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clearInterval(pollInterval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
