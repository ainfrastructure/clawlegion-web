import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  notifyMentionedAgents,
  ChatMessage,
  AGENT_NAMES
} from '../chat-utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Simple token auth for agents - set DASHBOARD_AGENT_TOKEN in environment
const AGENT_TOKEN = process.env.DASHBOARD_AGENT_TOKEN || ''

// POST /api/coordination/agent-message
// For agents (Jarvis, Lux) to post messages to the dashboard chat
// Now supports triggering webhooks for @mentioned agents!
export async function POST(request: Request) {
  try {
    // Check auth
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== AGENT_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      roomId,
      author,
      content,
      replyTo,
      conversationId: incomingConversationId,
      turnCount: incomingTurnCount
    } = await request.json()

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ error: 'roomId and content required' }, { status: 400 })
    }

    const messageId = randomUUID()
    const conversationId = incomingConversationId || messageId
    const turnCount = incomingTurnCount || 1

    const message: ChatMessage = {
      id: messageId,
      roomId,
      author: author || 'Agent',
      authorType: 'agent',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      conversationId,
      turnCount
    }

    // Save via Express backend (Prisma) - it broadcasts via WebSocket automatically
    await fetch(`${API_URL}/api/coordination/room-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    console.log(`[Agent] ${author} posted to #${roomId} (turn ${turnCount}): ${content.slice(0, 50)}...`)

    // Check for @mentions and trigger webhooks to other agents
    const authorLower = (author || 'agent').toLowerCase()
    const canonicalAuthor = AGENT_NAMES[authorLower] || authorLower

    await notifyMentionedAgents(message, {
      conversationId,
      turnCount,
      fromAgent: canonicalAuthor
    })

    return NextResponse.json({
      ok: true,
      message,
      conversationId,
      turnCount,
      note: 'Message posted to dashboard chat. @mentions will trigger webhooks to other agents.'
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[Agent] Error posting message:', error)
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}

// GET /api/coordination/agent-message?roomId=xxx&since=timestamp
// For agents to poll for new messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const since = searchParams.get('since')

    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 })
    }

    // Proxy to Express backend
    const params = new URLSearchParams({ roomId })
    if (since) params.set('since', since)

    const res = await fetch(`${API_URL}/api/coordination/room-messages?${params}`)
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
