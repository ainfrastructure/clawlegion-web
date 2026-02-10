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
  
  // Performance optimizations
  experimental: {
    // Enable CSS optimization
    optimizeCss: true,
    // Optimize package imports for better tree-shaking
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'date-fns',
      'zustand'
    ],
    // Enable static optimization
    staticWorkerRequestDeduping: true,
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },

  // Bundle optimization
  webpack: (config, { isServer }) => {
    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    // Optimize third-party packages
    config.resolve.alias = {
      ...config.resolve.alias,
      // Use ESM versions for better tree-shaking
      'date-fns': 'date-fns/esm',
    }

    // Split chunks optimization
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate chunk for large visualization libraries
          visualization: {
            test: /[\\/]node_modules[\\/](@xyflow|dagre|d3)[\\/]/,
            name: 'visualization',
            priority: 10,
            chunks: 'all',
          },
          // Separate chunk for authentication
          auth: {
            test: /[\\/]node_modules[\\/](next-auth|jose)[\\/]/,
            name: 'auth',
            priority: 8,
            chunks: 'all',
          },
          // Separate chunk for React Query
          query: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
            name: 'react-query',
            priority: 6,
            chunks: 'all',
          },
          // Separate chunk for icons
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            priority: 5,
            chunks: 'all',
          },
        },
      }
    }

    return config
  },

  // Output optimization
  compress: true,
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

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

  // Enable static export optimization for static pages
  trailingSlash: false,
  
  // Power optimizations
  poweredByHeader: false,
  
  // Optimize output
  output: 'standalone',
}

module.exports = nextConfig