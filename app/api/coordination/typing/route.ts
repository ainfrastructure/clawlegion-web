import { NextRequest, NextResponse } from 'next/server'

// Typing state: roomId -> agentName -> timestamp
interface TypingEntry {
  agent: string
  startedAt: number
  expiresAt: number
}

const globalForTyping = globalThis as unknown as {
  typingState: Map<string, Map<string, TypingEntry>>
  typingClients: Map<string, Set<ReadableStreamDefaultController>>
}

if (!globalForTyping.typingState) {
  globalForTyping.typingState = new Map()
}

if (!globalForTyping.typingClients) {
  globalForTyping.typingClients = new Map()
}

const typingState = globalForTyping.typingState
const typingClients = globalForTyping.typingClients

const TYPING_TIMEOUT_MS = 30000 // 30 seconds

// Clean up expired typing indicators
function cleanExpired() {
  const now = Date.now()
  let changed = false
  
  typingState.forEach((agents, roomId) => {
    const expired: string[] = []
    agents.forEach((entry, agentName) => {
      if (now > entry.expiresAt) {
        expired.push(agentName)
        changed = true
      }
    })
    
    expired.forEach(agent => {
      agents.delete(agent)
      // Broadcast stop typing
      broadcastTyping(roomId, agent, false)
    })
    
    if (agents.size === 0) {
      typingState.delete(roomId)
    }
  })
}

// Broadcast typing event to all clients subscribed to a room
function broadcastTyping(roomId: string, agent: string, isTyping: boolean) {
  const clients = typingClients.get(roomId)
  if (!clients) return
  
  const event = {
    roomId,
    agent,
    isTyping,
    timestamp: new Date().toISOString()
  }
  
  const message = `event: typing\ndata: ${JSON.stringify(event)}\n\n`
  const encoded = new TextEncoder().encode(message)
  
  clients.forEach(controller => {
    try {
      controller.enqueue(encoded)
    } catch {
      // Client disconnected, will be cleaned up
    }
  })
  
  // Also try to broadcast via the main chat SSE
  broadcastToChat(roomId, event)
}

// Broadcast to the chat SSE endpoint (no-op: SSE chat route was removed)
async function broadcastToChat(_roomId: string, _data: any) {
  // Previously called /api/sse/chat which has been removed
}

// GET: SSE subscription for typing events
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId')
  
  // If no roomId, return current typing state (non-SSE)
  if (!roomId) {
    cleanExpired()
    const all: Record<string, string[]> = {}
    typingState.forEach((agents, room) => {
      all[room] = Array.from(agents.keys())
    })
    return NextResponse.json({ typing: all })
  }
  
  // Check for non-SSE request (just wants current state)
  const accept = request.headers.get('accept') || ''
  if (!accept.includes('text/event-stream')) {
    cleanExpired()
    const agents = typingState.get(roomId)
    return NextResponse.json({
      roomId,
      typing: agents ? Array.from(agents.values()).map(e => ({
        agent: e.agent,
        startedAt: new Date(e.startedAt).toISOString()
      })) : []
    })
  }
  
  // SSE subscription
  const stream = new ReadableStream({
    start(controller) {
      // Register client
      if (!typingClients.has(roomId)) {
        typingClients.set(roomId, new Set())
      }
      typingClients.get(roomId)!.add(controller)
      
      // Send initial state
      cleanExpired()
      const agents = typingState.get(roomId)
      const initial = {
        type: 'init',
        roomId,
        typing: agents ? Array.from(agents.values()).map(e => ({
          agent: e.agent,
          startedAt: new Date(e.startedAt).toISOString()
        })) : []
      }
      
      try {
        controller.enqueue(
          new TextEncoder().encode(`event: init\ndata: ${JSON.stringify(initial)}\n\n`)
        )
      } catch {}
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`)
          )
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)
      
      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        typingClients.get(roomId)?.delete(controller)
        if (typingClients.get(roomId)?.size === 0) {
          typingClients.delete(roomId)
        }
      })
    },
    
    cancel() {
      typingClients.get(roomId)?.delete(this as any)
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}

// POST: Set typing state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, agent, isTyping } = body
    
    if (!roomId || !agent) {
      return NextResponse.json(
        { error: 'roomId and agent are required' },
        { status: 400 }
      )
    }
    
    cleanExpired()
    
    if (!typingState.has(roomId)) {
      typingState.set(roomId, new Map())
    }
    
    const roomTyping = typingState.get(roomId)!
    
    if (isTyping) {
      const now = Date.now()
      roomTyping.set(agent, {
        agent,
        startedAt: now,
        expiresAt: now + TYPING_TIMEOUT_MS
      })
    } else {
      roomTyping.delete(agent)
    }
    
    // Broadcast to all subscribers
    broadcastTyping(roomId, agent, !!isTyping)
    
    return NextResponse.json({
      success: true,
      roomId,
      agent,
      isTyping: !!isTyping,
      typing: Array.from(roomTyping.values()).map(e => e.agent)
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// DELETE: Clear typing state (when agent finishes)
export async function DELETE(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId')
  const agent = request.nextUrl.searchParams.get('agent')
  
  if (!roomId || !agent) {
    return NextResponse.json(
      { error: 'roomId and agent query params required' },
      { status: 400 }
    )
  }
  
  const roomTyping = typingState.get(roomId)
  if (roomTyping) {
    roomTyping.delete(agent)
    broadcastTyping(roomId, agent, false)
  }
  
  return NextResponse.json({ success: true })
}
