'use client'

import { useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Loader2, Send } from 'lucide-react'
import { AgentAvatar } from '@/components/agents'
import { FormattedText } from './shared/FormattedText'
import { formatTimeAgo } from '@/components/common/TimeAgo'
import { getAgentByName, getAgentById } from '@/components/chat-v2/agentConfig'

type Comment = {
  id: string
  content: string
  author: string
  authorType: string
  mentions: string[]
  timestamp: string
}

type TaskDiscussionThreadProps = {
  comments: Comment[] | undefined
  isLoading: boolean
  commentText: string
  onCommentTextChange: (text: string) => void
  onPostComment: () => void
  isPosting: boolean
}

function getAgentColor(author: string): string | null {
  const agent = getAgentById(author.toLowerCase()) || getAgentByName(author)
  return agent?.color ?? null
}

function CommentBubble({ comment }: { comment: Comment }) {
  const isAgent = comment.authorType === 'agent'
  const isSystem = comment.authorType === 'system'
  const agentColor = isAgent ? getAgentColor(comment.author) : null

  return (
    <div className="flex gap-3 group animate-fade-in-entry">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isAgent ? (
          <AgentAvatar agentId={comment.author} size="sm" />
        ) : (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isSystem
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
          }`}>
            {comment.author.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Author line */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-semibold capitalize"
            style={agentColor ? { color: agentColor } : undefined}
          >
            {isAgent ? (getAgentById(comment.author.toLowerCase()) || getAgentByName(comment.author))?.name ?? comment.author : comment.author}
          </span>
          {isAgent && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium"
              style={agentColor ? {
                backgroundColor: `${agentColor}15`,
                color: agentColor,
              } : undefined}
            >
              {(getAgentById(comment.author.toLowerCase()) || getAgentByName(comment.author))?.role ?? 'agent'}
            </span>
          )}
          <span className="text-[10px] text-slate-600">
            {formatTimeAgo(new Date(comment.timestamp))}
          </span>
        </div>

        {/* Content with colored left border for agents */}
        <div
          className="rounded-lg overflow-hidden"
          style={agentColor ? {
            borderLeft: `2px solid ${agentColor}40`,
          } : undefined}
        >
          <div className={`${agentColor ? 'pl-3' : ''}`}>
            <FormattedText text={comment.content} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaskDiscussionThread({
  comments,
  isLoading,
  commentText,
  onCommentTextChange,
  onPostComment,
  isPosting,
}: TaskDiscussionThreadProps) {
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (comments && comments.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [comments, scrollToBottom])

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentBubble key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">No discussion yet</p>
            <p className="text-xs text-slate-600 mt-1">Start the conversation below</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input — pinned at bottom */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-blue-500/[0.08] bg-blue-950/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-900/50 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                e.preventDefault()
                onPostComment()
              }
            }}
          />
          <button
            onClick={onPostComment}
            disabled={!commentText.trim() || isPosting}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
