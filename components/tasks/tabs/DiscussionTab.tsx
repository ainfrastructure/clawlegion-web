'use client'

import { TaskDiscussionThread } from '../TaskDiscussionThread'

type Comment = {
  id: string
  content: string
  author: string
  authorType: string
  mentions: string[]
  timestamp: string
}

type DiscussionTabProps = {
  comments: Comment[] | undefined
  isLoading: boolean
  commentText: string
  onCommentTextChange: (text: string) => void
  onPostComment: () => void
  isPosting: boolean
}

export function DiscussionTab(props: DiscussionTabProps) {
  return <TaskDiscussionThread {...props} />
}
