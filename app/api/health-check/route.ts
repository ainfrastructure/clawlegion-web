import { NextRequest, NextResponse } from 'next/server'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latencyMs?: number
  error?: string
}

async function checkService(name: string, url: string): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const res = await fetch(url, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    const latencyMs = Date.now() - start
    
    if (res.ok) {
      return { name, status: 'healthy', latencyMs }
    } else {
      return { name, status: 'degraded', latencyMs, error: `HTTP ${res.status}` }
    }
  } catch (err: any) {
    return { 
      name, 
      status: 'unhealthy', 
      latencyMs: Date.now() - start,
      error: err.message 
    }
  }
}

// GET: Combined health check
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const apiUrl = process.env.API_URL || 'http://localhost:5001'
  
  const checks = await Promise.all([
    checkService('web-server', `${baseUrl}/api/health`),
    checkService('task-queue', `${baseUrl}/api/tasks/queue`),
    checkService('coordination', `${baseUrl}/api/coordination/rooms`),
    checkService('notifications', `${baseUrl}/api/notifications?agent=health-check`),
    checkService('api-server', `${apiUrl}/api/health`),
  ])
  
  const healthy = checks.filter(c => c.status === 'healthy').length
  const degraded = checks.filter(c => c.status === 'degraded').length
  const unhealthy = checks.filter(c => c.status === 'unhealthy').length
  
  const overallStatus = unhealthy > 0 ? 'unhealthy' : 
                        degraded > 0 ? 'degraded' : 'healthy'
  
  const avgLatency = checks
    .filter(c => c.latencyMs)
    .reduce((sum, c) => sum + (c.latencyMs || 0), 0) / checks.length
  
  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    summary: {
      healthy,
      degraded,
      unhealthy,
      total: checks.length,
      avgLatencyMs: Math.round(avgLatency)
    },
    services: checks
  })
}
