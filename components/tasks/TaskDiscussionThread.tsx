'use client'

import { useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Loader2, Send } from 'lucide-react'
import { formatTimeAgo } from '@/components/common/TimeAgo'

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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  comment.authorType === 'agent'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : comment.authorType === 'system'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {comment.author.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white capitalize">
                    {comment.author}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {formatTimeAgo(new Date(comment.timestamp))}
                  </span>
                  {comment.authorType === 'agent' && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/15 text-blue-400 rounded-full uppercase tracking-wider">
                      agent
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 mt-0.5 break-words whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No discussion yet. Start the conversation!</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input — pinned at bottom */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-blue-500/[0.08] bg-blue-950/40">
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
