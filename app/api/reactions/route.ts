import path from 'path'
import { NextResponse } from "next/server"
import { promises as fs } from "fs"

const REACTIONS_FILE = path.join(process.cwd(), "message-reactions.json")

interface Reaction {
  messageId: string
  emoji: string
  user: string
  timestamp: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    
    let reactions: Reaction[] = []
    try {
      const content = await fs.readFile(REACTIONS_FILE, "utf-8")
      reactions = JSON.parse(content)
    } catch { }
    
    if (messageId) {
      reactions = reactions.filter(r => r.messageId === messageId)
    }
    
    return NextResponse.json({ reactions })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get reactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { messageId, emoji, user } = await request.json()
    
    let reactions: Reaction[] = []
    try {
      const content = await fs.readFile(REACTIONS_FILE, "utf-8")
      reactions = JSON.parse(content)
    } catch { }
    
    reactions.push({
      messageId,
      emoji,
      user,
      timestamp: new Date().toISOString()
    })
    
    await fs.writeFile(REACTIONS_FILE, JSON.stringify(reactions, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 })
  }
}
