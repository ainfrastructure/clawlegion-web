import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import {
  notifyMentionedAgents,
  ChatMessage,
} from '../chat-utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// GET /api/coordination/room-messages?roomId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 })
    }

    const res = await fetch(`${API_URL}/api/coordination/room-messages?roomId=${roomId}`)
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/coordination/room-messages
export async function POST(request: Request) {
  try {
    const { roomId, author, authorType, content, page } = await request.json()

    if (!roomId || !content?.trim()) {
      return NextResponse.json({ error: 'roomId and content required' }, { status: 400 })
    }

    const message: ChatMessage = {
      id: randomUUID(),
      roomId,
      author: author || 'human',
      authorType: authorType || 'human',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      page,
      conversationId: undefined,
      turnCount: 1
    }

    // Save via Express backend (Prisma) - it broadcasts via WebSocket automatically
    const saveRes = await fetch(`${API_URL}/api/coordination/room-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!saveRes.ok) {
      const err = await saveRes.text()
      return NextResponse.json({ error: err }, { status: saveRes.status })
    }

    // Notify @mentioned agents via OpenClaw webhook
    await notifyMentionedAgents(message, {
      conversationId: message.id,
      turnCount: 1
    })

    return NextResponse.json({ message })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/coordination/room-messages?roomId=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 })
    }

    const res = await fetch(`${API_URL}/api/coordination/room-messages?roomId=${roomId}`, {
      method: 'DELETE',
    })
    const data = await res.json()

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
