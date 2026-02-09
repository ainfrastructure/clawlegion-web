import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')
  
  if (!path) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 })
  }

  try {
    // Proxy to the backend API
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${apiUrl}/api/files/serve?path=${encodeURIComponent(path)}`)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('File proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}
