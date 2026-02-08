'use client'

import { 
  Inbox, Search, ListTodo, Users, MessageSquare, 
  Bell, FileText, FolderOpen, Zap
} from 'lucide-react'

type EmptyStateType = 
  | 'no-data' 
  | 'no-results' 
  | 'no-tasks' 
  | 'no-agents' 
  | 'no-messages' 
  | 'no-notifications'
  | 'no-files'
  | 'empty-folder'
  | 'no-activity'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  compact?: boolean
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  'no-data': {
    icon: <Inbox className="w-12 h-12" />,
    title: 'No data yet',
    description: 'Data will appear here once available.'
  },
  'no-results': {
    icon: <Search className="w-12 h-12" />,
    title: 'No results found',
    description: 'Try adjusting your search or filters.'
  },
  'no-tasks': {
    icon: <ListTodo className="w-12 h-12" />,
    title: 'No tasks in queue',
    description: 'Create a task to get started.'
  },
  'no-agents': {
    icon: <Users className="w-12 h-12" />,
    title: 'No agents online',
    description: 'Agents will appear here when they come online.'
  },
  'no-messages': {
    icon: <MessageSquare className="w-12 h-12" />,
    title: 'No messages yet',
    description: 'Start a conversation to see messages here.'
  },
  'no-notifications': {
    icon: <Bell className="w-12 h-12" />,
    title: 'All caught up!',
    description: 'No new notifications.'
  },
  'no-files': {
    icon: <FileText className="w-12 h-12" />,
    title: 'No files',
    description: 'Upload files to see them here.'
  },
  'empty-folder': {
    icon: <FolderOpen className="w-12 h-12" />,
    title: 'Empty folder',
    description: 'This folder has no contents.'
  },
  'no-activity': {
    icon: <Zap className="w-12 h-12" />,
    title: 'No recent activity',
    description: 'Activity will appear here as things happen.'
  }
}

export function EmptyState({ 
  type = 'no-data',
  title,
  description,
  action,
  icon,
  compact = false
}: EmptyStateProps) {
  const content = defaultContent[type]
  
  const displayIcon = icon || content.icon
  const displayTitle = title || content.title
  const displayDescription = description || content.description

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-500">
        <div className="opacity-50 mb-2">{displayIcon}</div>
        <p className="text-sm">{displayTitle}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-slate-600 mb-4">{displayIcon}</div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">{displayTitle}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{displayDescription}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
