// Chat V2 Components

// Main containers
export { ChatContainer } from './ChatContainer'
export type { ChatContainerProps } from './ChatContainer'
export { MobileChatContainer } from './MobileChatContainer'
export { ChatSidebar } from './ChatSidebar'
export type { ChatTarget } from './ChatSidebar'

// DM/Room mode components
export { ChatModeToggle } from './ChatModeToggle'
export type { ChatMode } from './ChatModeToggle'
export { DMList } from './DMList'

// Hierarchy sections
export { CouncilSection } from './CouncilSection'
export { BotArmySection } from './BotArmySection'

// Core components
export { ChatInput } from './ChatInput'
export type { ChatInputProps } from './ChatInput'
export { ChatThread } from './ChatThread'
export { ChatMessage } from './ChatMessage'
export type { ChatAttachment, ChatMessageData } from './ChatMessage'
export { TypingIndicator } from './TypingIndicator'

// Image upload components
export { ImagePreview } from './ImagePreview'
export type { PendingImage, ImagePreviewProps } from './ImagePreview'
export { ImageLightbox } from './ImageLightbox'
export type { ImageLightboxProps } from './ImageLightbox'

// Media recording components
export { VoiceRecorder } from './VoiceRecorder'
export { ScreenRecorder } from './ScreenRecorder'
export { AudioPreview } from './AudioPreview'
export { VideoPreview } from './VideoPreview'
export { RecordingIndicator } from './RecordingIndicator'

// Configuration
export * from './agentConfig'

// Legacy (for backwards compatibility)
export { BotArmyStickers } from './BotArmyStickers'
export { AgentSelector } from './AgentSelector'

// Hooks
export { useChatMessages } from './hooks/useChatMessages'
export { useDmMessages } from './hooks/useDmMessages'
export { useChatAgents } from './hooks/useChatAgents'
export { useMediaRecorder, checkMediaRecorderSupport, getSupportedMimeType } from './hooks/useMediaRecorder'
export type { RecordingType, RecordingState } from './hooks/useMediaRecorder'
