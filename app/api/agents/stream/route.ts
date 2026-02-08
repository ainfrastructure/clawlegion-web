import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface AgentStatus {
  id: string
  name: string
  status: 'active' | 'idle' | 'busy' | 'offline'
  currentTask?: {
    id: string
    title: string
    startedAt: string
  }
  lastActivity: string
  messageCount: number
  tasksCompleted: number
}

async function getAgentStatuses(): Promise<AgentStatus[]> {
  const agents: Record<string, AgentStatus> = {}
  const now = Date.now()
  const activeThreshold = 5 * 60 * 1000
  const idleThreshold = 30 * 60 * 1000

  // Get task data from Express
  try {
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      for (const task of data.tasks || []) {
        if (task.assignee) {
          const id = task.assignee.toLowerCase().replace(/[^a-z0-9]/g, '')

          if (!agents[id]) {
            agents[id] = {
              id,
              name: task.assignee,
              status: 'offline',
              lastActivity: task.updatedAt || task.createdAt,
              messageCount: 0,
              tasksCompleted: 0,
            }
          }

          if (task.status === 'done') {
            agents[id].tasksCompleted++
          } else if (task.status === 'building' || task.status === 'verifying' || task.status === 'researching') {
            agents[id].currentTask = {
              id: task.id,
              title: task.title,
              startedAt: task.approvedAt || task.updatedAt,
            }
          }

          const taskTime = task.updatedAt || task.createdAt
          if (taskTime && new Date(taskTime) > new Date(agents[id].lastActivity)) {
            agents[id].lastActivity = taskTime
          }
        }
      }
    }
  } catch {}

  // Get chat activity from Express
  try {
    const res = await fetch(`${API_URL}/api/coordination/rooms`, { cache: 'no-store' })
    if (res.ok) {
      const rooms = await res.json()
      // Count messages per agent from room metadata if available
      for (const room of (Array.isArray(rooms) ? rooms : rooms.rooms || [])) {
        if (room.lastMessage?.authorType === 'ai' && room.lastMessage?.author) {
          const name = room.lastMessage.author
          const id = name.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (!agents[id]) {
            agents[id] = {
              id,
              name,
              status: 'offline',
              lastActivity: room.lastMessage.timestamp || new Date().toISOString(),
              messageCount: 0,
              tasksCompleted: 0,
            }
          }
          agents[id].messageCount++
          if (room.lastMessage.timestamp && new Date(room.lastMessage.timestamp) > new Date(agents[id].lastActivity)) {
            agents[id].lastActivity = room.lastMessage.timestamp
          }
        }
      }
    }
  } catch {}

  // Determine status based on last activity
  for (const agent of Object.values(agents)) {
    const lastActivityMs = new Date(agent.lastActivity).getTime()
    const timeSinceActivity = now - lastActivityMs

    if (timeSinceActivity < activeThreshold) {
      agent.status = agent.currentTask ? 'busy' : 'active'
    } else if (timeSinceActivity < idleThreshold) {
      agent.status = 'idle'
    } else {
      agent.status = 'offline'
    }
  }

  return Object.values(agents).sort((a, b) =>
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')

  // Non-streaming JSON response
  if (format !== 'sse') {
    const agents = await getAgentStatuses()
    return NextResponse.json({
      agents,
      timestamp: new Date().toISOString(),
    })
  }

  // SSE streaming response
  const encoder = new TextEncoder()
  let isActive = true

  const stream = new ReadableStream({
    async start(controller) {
      const agents = await getAgentStatuses()
      const initialData = JSON.stringify({
        type: 'init',
        agents,
        timestamp: new Date().toISOString(),
      })
      controller.enqueue(encoder.encode('data: ' + initialData + '\n\n'))
      let lastData = initialData

      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval)
          return
        }

        try {
          const agents = await getAgentStatuses()
          const currentData = JSON.stringify({
            type: 'update',
            agents,
            timestamp: new Date().toISOString(),
          })

          if (currentData !== lastData) {
            controller.enqueue(encoder.encode('data: ' + currentData + '\n\n'))
            lastData = currentData
          } else {
            controller.enqueue(encoder.encode(': heartbeat\n\n'))
          }
        } catch (e) {
          console.error('SSE error:', e)
        }
      }, 3000)

      setTimeout(() => {
        isActive = false
        clearInterval(pollInterval)
        try {
          controller.enqueue(encoder.encode('data: {"type":"close","reason":"timeout"}\n\n'))
          controller.close()
        } catch {}
      }, 5 * 60 * 1000)
    },

    cancel() {
      isActive = false
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
