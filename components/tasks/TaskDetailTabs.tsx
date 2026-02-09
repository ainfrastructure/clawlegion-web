'use client'

import { useState } from 'react'
import { MessageCircle, Activity, GitBranch } from 'lucide-react'
import { TaskDiscussionThread } from './TaskDiscussionThread'
import { TaskActivityLog } from './TaskActivityLog'
import { TaskHandoffTimeline } from './TaskHandoffTimeline'

type TabKey = 'discussion' | 'activity' | 'handoffs'

type Comment = {
  id: string
  content: string
  author: string
  authorType: string
  mentions: string[]
  timestamp: string
}

type TaskDetailTabsProps = {
  taskId: string
  // Discussion
  comments: Comment[] | undefined
  isLoadingComments: boolean
  commentText: string
  onCommentTextChange: (text: string) => void
  onPostComment: () => void
  isPostingComment: boolean
  // Activity
  activities: Array<{
    id: string
    taskId: string
    eventType: string
    actor: string
    actorType: string
    details: Record<string, unknown> | null
    timestamp: string
  }> | undefined
  isLoadingActivities: boolean
}

const TABS: { key: TabKey; label: string; icon: typeof MessageCircle }[] = [
  { key: 'discussion', label: 'Discussion', icon: MessageCircle },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'handoffs', label: 'Handoffs', icon: GitBranch },
]

export function TaskDetailTabs({
  taskId,
  comments,
  isLoadingComments,
  commentText,
  onCommentTextChange,
  onPostComment,
  isPostingComment,
  activities,
  isLoadingActivities,
}: TaskDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('discussion')

  const commentCount = comments?.length || 0
  const activityCount = activities?.length || 0

  function getBadge(key: TabKey): number | null {
    if (key === 'discussion' && commentCount > 0) return commentCount
    if (key === 'activity' && activityCount > 0) return activityCount
    return null
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex-shrink-0 flex items-center gap-0 bg-blue-950/40 border-b border-blue-500/[0.08] px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          const badge = getBadge(tab.key)

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative
                ${isActive
                  ? 'text-blue-300 border-b-2 border-blue-400'
                  : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {badge !== null && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'discussion' && (
          <TaskDiscussionThread
            comments={comments}
            isLoading={isLoadingComments}
            commentText={commentText}
            onCommentTextChange={onCommentTextChange}
            onPostComment={onPostComment}
            isPosting={isPostingComment}
          />
        )}
        {activeTab === 'activity' && (
          <div className="flex-1 overflow-y-auto p-4">
            <TaskActivityLog
              activities={activities || []}
              isLoading={isLoadingActivities}
            />
          </div>
        )}
        {activeTab === 'handoffs' && (
          <div className="flex-1 overflow-y-auto p-4">
            <TaskHandoffTimeline taskId={taskId} />
          </div>
        )}
      </div>
    </div>
  )
}
