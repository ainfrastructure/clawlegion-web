import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Compute subtask progress for a parent task
function computeProgress(subtasks: any[]): number {
  if (!subtasks || subtasks.length === 0) return 0
  const done = subtasks.filter((s: any) => s.status === 'done' || s.status === 'completed').length
  return Math.round((done / subtasks.length) * 100)
}

// Build graph nodes and edges from real task data with subtask hierarchy
function buildGraph(tasks: any[]) {
  const nodes = tasks.map((t: any) => {
    const subtasks = t.subtasks || []
    const subtasksDone = subtasks.filter((s: any) => s.status === 'done' || s.status === 'completed').length
    return {
      id: t.id,
      title: t.title,
      shortId: t.shortId || null,
      status: t.status,
      priority: t.priority || 'P2',
      progress: computeProgress(subtasks),
      assignedTo: t.assignee,
      parentId: t.parentId || null,
      isLeaf: subtasks.length === 0 && !t.parentId,
      canStart: true,
      subtaskCount: subtasks.length,
      subtasksDone,
      subtasks: subtasks.map((s: any) => ({
        id: s.id,
        title: s.title,
        shortId: s.shortId,
        status: s.status,
        priority: s.priority,
        assignee: s.assignee,
      })),
      level: t.parentId ? 1 : 0,
    }
  })

  const edges: { from: string; to: string; type: 'dependency' | 'parent-child' | 'soft' }[] = []

  for (const task of tasks) {
    // Dependency edges (from metadata if present)
    if (task.dependencies && Array.isArray(task.dependencies)) {
      for (const dep of task.dependencies) {
        const depId = typeof dep === 'string' ? dep : dep.taskId
        edges.push({
          from: depId,
          to: task.id,
          type: dep.type === 'soft' ? 'soft' : 'dependency',
        })
      }
    }
    // Parent-child edges
    if (task.parentId) {
      edges.push({
        from: task.parentId,
        to: task.id,
        type: 'parent-child',
      })
    }
  }

  return { nodes, edges }
}

// GET: Get task graph — fetch ALL tasks (rootOnly=false) for complete graph
export async function GET(request: NextRequest) {
  try {
    // Fetch with rootOnly=false so we get all tasks including subtasks
    const res = await fetch(`${API_URL}/api/task-tracking/tasks?rootOnly=false`, { cache: 'no-store' })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const tasks = data.tasks || []

    const graph = buildGraph(tasks)

    // Compute status breakdown
    const rootTasks = tasks.filter((t: any) => !t.parentId)
    const subtaskList = tasks.filter((t: any) => t.parentId)

    return NextResponse.json({
      nodes: graph.nodes,
      edges: graph.edges,
      summary: {
        total: tasks.length,
        roots: rootTasks.length,
        leaves: tasks.filter((t: any) => (!t.subtasks || t.subtasks.length === 0) && !t.parentId).length,
        subtasks: subtaskList.length,
        byStatus: {
          backlog: tasks.filter((t: any) => t.status === 'backlog').length,
          todo: tasks.filter((t: any) => t.status === 'todo').length,
          in_progress: tasks.filter((t: any) => t.status === 'in_progress' || t.status === 'building' || t.status === 'researching' || t.status === 'planning').length,
          verifying: tasks.filter((t: any) => t.status === 'verifying').length,
          done: tasks.filter((t: any) => t.status === 'done').length,
        },
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[tasks/graph] Proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create task with subtasks — proxy to Express
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      task: data.task || data,
      totalCreated: 1,
    })
  } catch (error: any) {
    console.error('[tasks/graph] POST proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: Update task — proxy to Express
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, ...updates } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 })
    }

    const res = await fetch(`${API_URL}/api/task-tracking/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ success: true, task: data.task || data })
  } catch (error: any) {
    console.error('[tasks/graph] PATCH proxy error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
