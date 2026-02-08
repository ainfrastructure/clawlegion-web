'use client'

import { useMobile } from '@/hooks/useMobile'
import { ChatContainer, MobileChatContainer } from '@/components/chat-v2'

export default function ChatPage() {
  const isMobile = useMobile()
  
  if (isMobile) {
    return <MobileChatContainer />
  }
  
  // ChatContainer manages its own sidebar and state
  return <ChatContainer />
}
