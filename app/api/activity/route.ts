import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface Activity {
  id: string
  action: string
  agent: { name: string }
  task?: { id: string; title: string }
  createdAt: string
}

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ activities: [] })
    }

    const data = await res.json()
    const tasks: any[] = data.tasks || []
    const activities: Activity[] = []

    // Generate activities from task data
    for (const task of tasks.slice(-100)) {
      if (task.createdAt) {
        activities.push({
          id: `${task.id}-created`,
          action: 'task_created',
          agent: { name: task.createdBy || 'System' },
          task: { id: task.id, title: task.title },
          createdAt: task.createdAt,
        })
      }

      if (task.approvedAt && task.assignee) {
        activities.push({
          id: `${task.id}-started`,
          action: 'task_started',
          agent: { name: task.assignee },
          task: { id: task.id, title: task.title },
          createdAt: task.approvedAt,
        })
      }

      if (task.status === 'done' && task.updatedAt) {
        activities.push({
          id: `${task.id}-completed`,
          action: 'task_completed',
          agent: { name: task.assignee || task.createdBy || 'System' },
          task: { id: task.id, title: task.title },
          createdAt: task.updatedAt,
        })
      }

      if ((task.status === 'blocked' || task.status === 'cancelled') && task.updatedAt) {
        activities.push({
          id: `${task.id}-failed`,
          action: 'task_failed',
          agent: { name: task.assignee || task.createdBy || 'System' },
          task: { id: task.id, title: task.title },
          createdAt: task.updatedAt,
        })
      }
    }

    // Sort by time descending and limit
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ activities: activities.slice(0, 50) })
  } catch (error) {
    console.error('[activity] Proxy error:', error)
    return NextResponse.json({ activities: [] })
  }
}
