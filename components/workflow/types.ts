// Original workflow types
export interface WorkflowStep {
  id: string
  index: number
  timestamp: string
  type: 'thinking' | 'tool_call' | 'tool_result' | 'text' | 'decision' | 'system'
  content: string
  metadata?: {
    tool?: string
    arguments?: Record<string, unknown>
    duration?: number
    exitCode?: number
    model?: string
    provider?: string
    usage?: {
      input?: number
      output?: number
      total?: number
      cost?: number
    }
  }
}

export interface WorkflowSummary {
  sessionId: string
  totalSteps: number
  toolCalls: number
  thinkingBlocks: number
  duration?: number
  model?: string
  provider?: string
  startTime?: string
  endTime?: string
}

export interface ParsedWorkflow {
  summary: WorkflowSummary
  steps: WorkflowStep[]
  rawLines: string[]
}

export type TabType = 'workflow' | 'thinking' | 'tools' | 'raw'

// Pipeline view types
export type AgentStatus = 'pending' | 'in-progress' | 'success' | 'failed' | 'skipped';

export interface AgentStep {
  id: string;
  name: string;
  role: string;
  avatar: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface AgentNodeData {
  agent: string;
  role: string;
  avatar: string;
  status: AgentStatus;
  primaryColor: string;
  secondaryColor: string;
  [key: string]: unknown;
}
