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
    agent: 'scout',
  },
  planning: {
    key: 'planning',
    label: 'Planning',
    color: 'violet',
    icon: PenTool,
    agent: 'archie',
  },
  in_progress: {
    key: 'in_progress',
    label: 'Building',
    color: 'amber',
    icon: Hammer,
    agent: 'mason',
  },
  building: {
    key: 'building',
    label: 'Building',
    color: 'amber',
    icon: Hammer,
    agent: 'mason',
  },
  verifying: {
    key: 'verifying',
    label: 'Verifying',
    color: 'cyan',
    icon: ShieldCheck,
    agent: 'vex',
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

// Aliases for backward compatibility with config/index.ts consumers
export type TaskStatus = TaskStatusKey
export const statusConfig = STATUS_CONFIG
export const statusFlowOrder = STATUS_ORDER
