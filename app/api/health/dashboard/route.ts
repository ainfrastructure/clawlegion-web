import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:5001'
const startTime = Date.now()

type ServiceStatus = 'healthy' | 'degraded' | 'down'

interface ServiceHealth {
  name: string
  status: ServiceStatus
  latencyMs?: number
  details?: Record<string, unknown>
}

async function checkWebServer(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(3000),
    })
    return {
      name: 'web-server',
      status: res.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
    }
  } catch {
    return { name: 'web-server', status: 'down', latencyMs: Date.now() - start }
  }
}

async function checkApiServer(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    })
    return {
      name: 'api-server',
      status: res.ok ? 'healthy' : 'degraded',
      latencyMs: Date.now() - start,
    }
  } catch {
    return { name: 'api-server', status: 'down', latencyMs: Date.now() - start }
  }
}

async function checkTaskQueue(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch(`${API_URL}/api/task-tracking/tasks`, {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    })
    if (!res.ok) {
      return { name: 'task-queue', status: 'degraded', latencyMs: Date.now() - start }
    }
    const data = await res.json()
    const tasks = data.tasks || []
    const queued = tasks.filter((t: any) => t.status === 'queued' || t.status === 'todo').length
    const building = tasks.filter((t: any) => t.status === 'building' || t.status === 'in_progress').length
    const done = tasks.filter((t: any) => t.status === 'done' || t.status === 'completed').length
    const failed = tasks.filter((t: any) => t.status === 'failed').length
    return {
      name: 'task-queue',
      status: 'healthy',
      latencyMs: Date.now() - start,
      details: {
        total: tasks.length,
        queued,
        building,
        done,
        failed,
      },
    }
  } catch (e: any) {
    return { name: 'task-queue', status: 'down', latencyMs: Date.now() - start, details: { error: e.message } }
  }
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch(`${API_URL}/api/health/status`, {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    })
    const latency = Date.now() - start
    if (!res.ok) {
      return { name: 'database', status: 'degraded', latencyMs: latency }
    }
    const data = await res.json()
    const dbCheck = data.checks?.find((c: any) => c.name === 'database')
    return {
      name: 'database',
      status: dbCheck?.status === 'healthy' ? 'healthy' : 'degraded',
      latencyMs: dbCheck?.latencyMs ?? latency,
      details: dbCheck?.details,
    }
  } catch {
    return { name: 'database', status: 'down', latencyMs: Date.now() - start }
  }
}

async function fetchBackendHealth(): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${API_URL}/api/health/status`, {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    })
    if (res.ok) return res.json()
  } catch {
    // ignore
  }
  return null
}

export async function GET(request: NextRequest) {
  const now = Date.now()
  const uptime = Math.floor((now - startTime) / 1000)

  const [webServer, apiServer, taskQueue, database, backendHealth] = await Promise.all([
    checkWebServer(),
    checkApiServer(),
    checkTaskQueue(),
    checkDatabase(),
    fetchBackendHealth(),
  ])

  const services = [webServer, apiServer, database, taskQueue]

  const hasDown = services.some(s => s.status === 'down')
  const hasDegraded = services.some(s => s.status === 'degraded')
  const overallStatus: ServiceStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'healthy'

  const memoryUsage = process.memoryUsage()

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: uptime + 's',
    uptimeFormatted: formatUptime(uptime),
    services,
    summary: {
      healthy: services.filter(s => s.status === 'healthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      down: services.filter(s => s.status === 'down').length,
    },
    memory: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      uptime: Math.round(process.uptime()),
    },
    backend: backendHealth,
    version: '1.1.0',
  })
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) return hours + 'h ' + minutes + 'm ' + secs + 's'
  if (minutes > 0) return minutes + 'm ' + secs + 's'
  return secs + 's'
}
