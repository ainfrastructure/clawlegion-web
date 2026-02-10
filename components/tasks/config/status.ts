import {
  Archive,
  ListTodo,
  Search,
  PenTool,
  Hammer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export type TaskStatusKey =
  | 'backlog'
  | 'todo'
  | 'researching'
  | 'planning'
  | 'in_progress'
  | 'building'
  | 'verifying'
  | 'done'

export interface StatusConfig {
  key: TaskStatusKey
  label: string
  color: string
  icon: typeof Archive
  agent?: string
}

export const STATUS_CONFIG: Record<TaskStatusKey, StatusConfig> = {
  backlog: {
    key: 'backlog',
    label: 'Backlog',
    color: 'slate',
    icon: Archive,
  },
  todo: {
    key: 'todo',
    label: 'Todo',
    color: 'blue',
    icon: ListTodo,
  },
  researching: {
    key: 'researching',
    label: 'Researching',
    color: 'indigo',
    icon: Search,
    agent: 'minerva',
  },
  planning: {
    key: 'planning',
    label: 'Planning',
    color: 'violet',
    icon: PenTool,
    agent: 'athena',
  },
  in_progress: {
    key: 'in_progress',
    label: 'Building',
    color: 'amber',
    icon: Hammer,
    agent: 'vulcan',
  },
  building: {
    key: 'building',
    label: 'Building',
    color: 'amber',
    icon: Hammer,
    agent: 'vulcan',
  },
  verifying: {
    key: 'verifying',
    label: 'Verifying',
    color: 'cyan',
    icon: ShieldCheck,
    agent: 'janus',
  },
  done: {
    key: 'done',
    label: 'Done',
    color: 'green',
    icon: CheckCircle2,
  },
}

export const STATUS_ORDER: TaskStatusKey[] = [
  'backlog',
  'todo',
  'researching',
  'planning',
  'building',
  'verifying',
  'done',
]

export function normalizeStatus(status: string): TaskStatusKey {
  switch (status) {
    case 'in_progress':
    case 'in-progress':
    case 'assigned':
      return 'building'
    case 'in_research':
    case 'researched':
      return 'researching'
    case 'queued':
      return 'todo'
    case 'completed':
      return 'done'
    case 'failed':
      return 'todo'
    default:
      return status as TaskStatusKey
  }
}

export function getStatusConfig(status: string): StatusConfig {
  const normalized = normalizeStatus(status)
  return STATUS_CONFIG[normalized] || STATUS_CONFIG.backlog
}

// ============================================
// Domain-specific workflow steps
// ============================================

export interface WorkflowStep {
  key: string
  label: string
  color: string
  agent?: string
}

const RESEARCH_WORKFLOW: WorkflowStep[] = [
  { key: 'backlog', label: 'Backlog', color: 'slate' },
  { key: 'todo', label: 'Todo', color: 'blue' },
  { key: 'scoping', label: 'Scoping', color: 'indigo', agent: 'analyst' },
  { key: 'gathering', label: 'Gathering', color: 'violet', agent: 'analyst' },
  { key: 'analyzing', label: 'Analyzing', color: 'purple', agent: 'analyst' },
  { key: 'drafting', label: 'Drafting', color: 'amber', agent: 'writer' },
  { key: 'reviewing', label: 'Reviewing', color: 'cyan', agent: 'reviewer' },
  { key: 'done', label: 'Done', color: 'green' },
]

const CONTENT_WORKFLOW: WorkflowStep[] = [
  { key: 'backlog', label: 'Backlog', color: 'slate' },
  { key: 'todo', label: 'Todo', color: 'blue' },
  { key: 'briefing', label: 'Briefing', color: 'indigo', agent: 'analyst' },
  { key: 'drafting', label: 'Drafting', color: 'amber', agent: 'writer' },
  { key: 'editing', label: 'Editing', color: 'violet', agent: 'editor' },
  { key: 'reviewing', label: 'Reviewing', color: 'cyan', agent: 'reviewer' },
  { key: 'done', label: 'Done', color: 'green' },
]

const OPERATIONS_WORKFLOW: WorkflowStep[] = [
  { key: 'backlog', label: 'Backlog', color: 'slate' },
  { key: 'todo', label: 'Todo', color: 'blue' },
  { key: 'analyzing', label: 'Analyzing', color: 'indigo', agent: 'analyst' },
  { key: 'executing', label: 'Executing', color: 'amber', agent: 'executor' },
  { key: 'verifying', label: 'Verifying', color: 'cyan', agent: 'reviewer' },
  { key: 'done', label: 'Done', color: 'green' },
]

const CODE_WORKFLOW: WorkflowStep[] = STATUS_ORDER.map(key => ({
  key,
  label: STATUS_CONFIG[key].label,
  color: STATUS_CONFIG[key].color,
  agent: STATUS_CONFIG[key].agent,
}))

const DOMAIN_WORKFLOWS: Record<string, WorkflowStep[]> = {
  code: CODE_WORKFLOW,
  research: RESEARCH_WORKFLOW,
  content: CONTENT_WORKFLOW,
  operations: OPERATIONS_WORKFLOW,
}

export function getWorkflowForDomain(domain?: string): WorkflowStep[] {
  if (!domain) return CODE_WORKFLOW
  return DOMAIN_WORKFLOWS[domain] || CODE_WORKFLOW
}

// Aliases for backward compatibility with config/index.ts consumers
export type TaskStatus = TaskStatusKey
export const statusConfig = STATUS_CONFIG
export const statusFlowOrder = STATUS_ORDER
