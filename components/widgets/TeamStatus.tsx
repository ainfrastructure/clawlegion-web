'use client'

import { Users, Circle, MessageSquare, Clock, Zap } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  status: 'online' | 'busy' | 'away' | 'offline'
  currentTask?: string
  lastActive?: string
}

interface TeamStatusProps {
  members: TeamMember[]
  showTasks?: boolean
  className?: string
}

const statusConfig = {
  online: { color: 'bg-green-500', label: 'Online' },
  busy: { color: 'bg-yellow-500', label: 'Busy' },
  away: { color: 'bg-slate-400', label: 'Away' },
  offline: { color: 'bg-slate-600', label: 'Offline' },
}

const roleEmoji: Record<string, string> = {
  'Lead': '🍳',
  'Secondary': '🥄',
  'Human': '👤',
  'AI': '🤖',
}

export function TeamStatus({
  members,
  showTasks = true,
  className = ''
}: TeamStatusProps) {
  const onlineCount = members.filter(m => m.status === 'online').length
  const busyCount = members.filter(m => m.status === 'busy').length

  return (
    <div className={`bg-slate-800/50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Team Status
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-400">
            <Circle className="w-2 h-2 fill-current" />
            {onlineCount} online
          </span>
          {busyCount > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-3 h-3" />
              {busyCount} busy
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {members.map((member) => {
          const config = statusConfig[member.status]
          const emoji = roleEmoji[member.role] || '👤'
          
          return (
            <div
              key={member.id}
              className="flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                  {member.avatar ? (
                    <img // eslint-disable-line @next/next/no-img-element 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    emoji
                  )}
                </div>
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${config.color}`}
                  title={config.label}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">
                    {member.role}
                  </span>
                </div>
                
                {showTasks && member.currentTask && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="truncate">{member.currentTask}</span>
                  </div>
                )}
                
                {member.lastActive && member.status !== 'online' && (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Last seen {member.lastActive}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <button 
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Send message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      {members.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No team members</p>
        </div>
      )}
    </div>
  )
}
