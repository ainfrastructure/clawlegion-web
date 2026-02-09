/** @type {import('next').NextConfig} */
const backendPort = process.env.BACKEND_PORT || '5001'
const backendUrl = `http://localhost:${backendPort}`
const clawdbotUrl = process.env.CLAWDBOT_URL || 'http://localhost:18789'

const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  async redirects() {
    return []
  },
  env: {
    NEXT_PUBLIC_API_URL: '', // Use relative URLs, proxy through Next.js
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || backendUrl,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_COMMIT_SHA: process.env.COMMIT_SHA || 'dev',
    NEXT_PUBLIC_BRANCH: process.env.BRANCH || 'main',
    NEXT_PUBLIC_COMMIT_MSG: process.env.COMMIT_MSG || '',
  },
  async rewrites() {
    return {
      // beforeFiles runs before Next.js checks for files/pages
      // Empty - let Next.js API routes handle /api/auth/*
      beforeFiles: [],
      
      // afterFiles runs after static files but before pages
      afterFiles: [],
      
      // fallback runs if no page/file matches - proxy to backend
      // /api/auth/* will be handled by Next.js API routes before this
      fallback: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/socket.io/:path*',
          destination: `${backendUrl}/socket.io/:path*`,
        },
        {
          source: '/clawdbot',
          destination: `${clawdbotUrl}/`,
        },
        {
          source: '/clawdbot/:path*',
          destination: `${clawdbotUrl}/:path*`,
        },
        {
          source: '/assets/:path*',
          destination: `${clawdbotUrl}/assets/:path*`,
        },
        {
          source: '/favicon.ico',
          destination: `${clawdbotUrl}/favicon.ico`,
        },
      ],
    }
  },
}

module.exports = nextConfig
