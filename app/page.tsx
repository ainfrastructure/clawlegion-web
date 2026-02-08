'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Bot, Terminal, Activity,
  ArrowRight, Zap, Users, CheckCircle,
  Clock, TrendingUp
} from 'lucide-react'

export default function Home() {
  // Fetch live stats for the landing page
  const { data: queueData } = useQuery({
    queryKey: ['landing-queue'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/queue')
      return res.json()
    },
    refetchInterval: 10000,
  })

  const { data: healthData } = useQuery({
    queryKey: ['landing-health'],
    queryFn: async () => {
      const res = await fetch('/api/health/dashboard')
      return res.json()
    },
    refetchInterval: 30000,
  })

  const stats = queueData?.summary || { queued: 0, completed: 0, assigned: 0 }
  const isHealthy = healthData?.status === 'healthy'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[70vh] px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full mb-6 sm:mb-8 ${
          isHealthy 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
          <span className="text-sm font-medium">
            {isHealthy ? 'All Systems Operational' : 'Checking Status...'}
          </span>
        </div>

        {/* Main Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            ClawLegion
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-2">
            Command Center for Autonomous AI Agents
          </p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 w-full max-w-3xl">
          <div className="glass-2 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white">{stats.completed}</p>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              Completed
            </p>
          </div>
          <div className="glass-2 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.assigned}</p>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              In Progress
            </p>
          </div>
          <div className="glass-2 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">{stats.queued}</p>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
              Queued
            </p>
          </div>
          <div className="glass-2 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-purple-400">{queueData?.count || 0}</p>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              Total Tasks
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link
            href="/dashboard"
            className="px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 text-sm sm:text-base"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            href="/command"
            className="px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/[0.06] text-sm sm:text-base"
          >
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            Command Center
          </Link>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-400 mb-4 sm:mb-6 text-center">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Link
            href="/agents/fleet"
            className="group bg-slate-800/30 hover:bg-slate-800/50 active:bg-slate-800/70 rounded-xl p-4 sm:p-6 border border-white/[0.06] hover:border-purple-500/50 transition-all min-h-[44px]"
          >
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Agent Fleet</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Monitor agent status, health, and current assignments</p>
            <span className="text-purple-400 text-xs sm:text-sm mt-3 sm:mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Fleet <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </span>
          </Link>

          <Link 
            href="/health"
            className="group bg-slate-800/30 hover:bg-slate-800/50 active:bg-slate-800/70 rounded-xl p-4 sm:p-6 border border-white/[0.06] hover:border-green-500/50 transition-all min-h-[44px]"
          >
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">System Health</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Monitor all system components in real-time</p>
            <span className="text-green-400 text-xs sm:text-sm mt-3 sm:mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
              Check Health <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </span>
          </Link>

          <Link 
            href="/tasks"
            className="group bg-slate-800/30 hover:bg-slate-800/50 active:bg-slate-800/70 rounded-xl p-4 sm:p-6 border border-white/[0.06] hover:border-blue-500/50 transition-all min-h-[44px]"
          >
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Task Queue</h3>
            <p className="text-slate-400 text-xs sm:text-sm">View and manage the task queue and priorities</p>
            <span className="text-blue-400 text-xs sm:text-sm mt-3 sm:mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Tasks <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-slate-500 text-sm">
        <p>Built for autonomous agent coordination</p>
      </div>
    </div>
  )
}
