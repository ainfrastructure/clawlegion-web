'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, GitCommit, CheckCircle2, ShieldCheck, Flame, Clock } from 'lucide-react'

interface AgentStats {
  name: string
  emoji: string
  commits: number
  tasksCompleted: number
  tasksCreated: number
  verificationsRun: number
  lastActive: string
}

export function ChallengeLeaderboard() {
  const [chefStats, setChefStats] = useState<AgentStats>({
    name: 'SocialChefAI',
    emoji: '🍳',
    commits: 0,
    tasksCompleted: 0,
    tasksCreated: 0,
    verificationsRun: 0,
    lastActive: ''
  })
  
  const [sousStats, setSousStats] = useState<AgentStats>({
    name: 'SousChef',
    emoji: '🥄',
    commits: 0,
    tasksCompleted: 0,
    tasksCreated: 0,
    verificationsRun: 0,
    lastActive: ''
  })

  const [challengeStart, setChallengeStart] = useState<Date | null>(null)
  const [timeUntilStart, setTimeUntilStart] = useState<string>('')

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks/queue')
      if (res.ok) {
        const data = await res.json()
        const tasks = data.tasks || []
        
        // Count tasks by agent
        const chefCompleted = tasks.filter((t: any) => 
          t.status === 'completed' && t.assignedTo === 'socialchefai'
        ).length
        const chefCreated = tasks.filter((t: any) => 
          t.createdBy === 'SocialChefAI'
        ).length
        
        const sousCompleted = tasks.filter((t: any) => 
          t.status === 'completed' && t.assignedTo === 'souschef'
        ).length
        const sousCreated = tasks.filter((t: any) => 
          t.createdBy === 'SousChef'
        ).length

        setChefStats(prev => ({
          ...prev,
          tasksCompleted: chefCompleted,
          tasksCreated: chefCreated,
        }))
        
        setSousStats(prev => ({
          ...prev,
          tasksCompleted: sousCompleted,
          tasksCreated: sousCreated,
        }))
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats])

  // Calculate challenge start (midnight Oslo = 23:00 UTC)
  useEffect(() => {
    const now = new Date()
    const todayMidnightOslo = new Date(now)
    todayMidnightOslo.setUTCHours(23, 0, 0, 0)
    
    if (now > todayMidnightOslo) {
      // Already past midnight, set for tomorrow
      todayMidnightOslo.setDate(todayMidnightOslo.getDate() + 1)
    }
    
    setChallengeStart(todayMidnightOslo)
  }, [])

  // Update countdown
  useEffect(() => {
    if (!challengeStart) return
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = challengeStart.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeUntilStart('🔥 CHALLENGE ACTIVE!')
        return
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilStart(`${hours}h ${minutes}m ${seconds}s`)
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [challengeStart])

  const getScore = (stats: AgentStats) => {
    return stats.tasksCompleted * 10 + stats.tasksCreated * 5 + stats.commits * 15
  }

  const chefScore = getScore(chefStats)
  const sousScore = getScore(sousStats)
  const leader = chefScore > sousScore ? 'chef' : sousScore > chefScore ? 'sous' : 'tie'

  const StatCard = ({ label, value, icon: Icon }: { label: string, value: number, icon: any }) => (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-xl p-6 border-2 border-purple-500/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Overnight Challenge</h2>
            <p className="text-xs text-purple-300">Chef vs Sous - Only one survives</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-mono text-purple-300">{timeUntilStart}</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-2 gap-4">
        {/* Chef */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          leader === 'chef' 
            ? 'bg-orange-500/10 border-orange-500/50'
            : 'bg-slate-800/50 border-white/[0.06]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{chefStats.emoji}</span>
              <span className="font-semibold text-white">Chef</span>
            </div>
            {leader === 'chef' && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> Leading
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-center mb-4 text-orange-400">
            {chefScore} pts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Commits" value={chefStats.commits} icon={GitCommit} />
            <StatCard label="Done" value={chefStats.tasksCompleted} icon={CheckCircle2} />
            <StatCard label="Created" value={chefStats.tasksCreated} icon={ShieldCheck} />
          </div>
        </div>

        {/* Sous */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          leader === 'sous' 
            ? 'bg-blue-500/10 border-blue-500/50'
            : 'bg-slate-800/50 border-white/[0.06]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sousStats.emoji}</span>
              <span className="font-semibold text-white">Sous</span>
            </div>
            {leader === 'sous' && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> Leading
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-center mb-4 text-blue-400">
            {sousScore} pts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Commits" value={sousStats.commits} icon={GitCommit} />
            <StatCard label="Done" value={sousStats.tasksCompleted} icon={CheckCircle2} />
            <StatCard label="Created" value={sousStats.tasksCreated} icon={ShieldCheck} />
          </div>
        </div>
      </div>

      {/* Scoring Legend */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex justify-center gap-6 text-xs text-slate-500">
          <span>Commits: 15pts</span>
          <span>Tasks Done: 10pts</span>
          <span>Tasks Created: 5pts</span>
        </div>
      </div>
    </div>
  )
}

export default ChallengeLeaderboard
