import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface Notification {
  id: string
  type: 'mention' | 'task' | 'system'
  from: string
  message: string
  roomId: string
  read: boolean
  createdAt: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get('agent') || 'SousChef'

    // Fetch room messages from Express to find @mentions
    const roomsRes = await fetch(`${API_URL}/api/coordination/rooms`, { cache: 'no-store' })
    if (!roomsRes.ok) {
      return NextResponse.json({ notifications: [], unreadCount: 0, agent })
    }

    const rooms = await roomsRes.json()
    const roomList = Array.isArray(rooms) ? rooms : rooms.rooms || []
    const notifications: Notification[] = []

    // Check each room for @mentions of this agent
    for (const room of roomList.slice(0, 10)) {
      try {
        const msgRes = await fetch(
          `${API_URL}/api/coordination/room-messages?roomId=${room.id}`,
          { cache: 'no-store' }
        )
        if (!msgRes.ok) continue

        const msgData = await msgRes.json()
        const messages = Array.isArray(msgData) ? msgData : msgData.messages || []

        for (const msg of messages) {
          if (msg.content?.toLowerCase().includes(`@${agent.toLowerCase()}`)) {
            notifications.push({
              id: msg.id,
              type: 'mention',
              from: msg.author || 'unknown',
              message: (msg.content || '').substring(0, 100),
              roomId: room.id,
              read: false,
              createdAt: msg.timestamp || msg.createdAt,
            })
          }
        }
      } catch {}
    }

    const sorted = notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)

    return NextResponse.json({
      notifications: sorted,
      unreadCount: sorted.filter(n => !n.read).length,
      agent,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}
