import path from 'path'
import { NextResponse } from "next/server"
import { promises as fs } from "fs"

const READ_FILE = path.join(process.cwd(), "notifications-read.json")

export async function POST(request: Request) {
  try {
    const { notificationId, agent } = await request.json()
    
    let readData: Record<string, string[]> = {}
    try {
      const content = await fs.readFile(READ_FILE, "utf-8")
      readData = JSON.parse(content)
    } catch { }
    
    if (!readData[agent]) readData[agent] = []
    if (!readData[agent].includes(notificationId)) {
      readData[agent].push(notificationId)
    }
    
    await fs.writeFile(READ_FILE, JSON.stringify(readData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 })
  }
}
