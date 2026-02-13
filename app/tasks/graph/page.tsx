'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Check, GitBranch } from 'lucide-react';
import dynamic from 'next/dynamic';
import { graphStatusColors as statusColors } from '@/components/tasks/config/status';

// Dynamically import the heavy TaskGraphView component (contains React Flow ~200KB)
// This reduces initial bundle for users who don't visit this page
const TaskGraphView = dynamic(
  () => import('@/components/TaskGraphView').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading graph visualization...</p>
        </div>
      </div>
    )
  }
);
import { DecomposeModal } from '@/components/tasks/DecomposeModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterChips } from '@/components/ui/FilterChips';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'verifying', label: 'Verifying' },
  { value: 'done', label: 'Done' },
];

export default function TaskGraphPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDecompose, setShowDecompose] = useState(false);

  const handleNodeClick = useCallback(async (taskId: string) => {
    setSelectedTask(taskId);
    setTaskDetails(null);
    try {
      const res = await fetch(`/api/task-tracking/tasks/${taskId}?includeActivities=false`);
      const data = await res.json();
      setTaskDetails(data.task);
    } catch (err) {
      console.error('Failed to fetch task details:', err);
    }
  }, []);

  const closeSidebar = useCallback(() => {
    setSelectedTask(null);
    setTaskDetails(null);
  }, []);

  return (
    <div className="flex h-full bg-slate-950">
      {/* Main graph area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-2.5">
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tasks</span>
            </Link>
            <div className="w-px h-4 bg-slate-700" />
            <h1 className="text-lg font-semibold text-slate-100">Task Graph</h1>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Visual hierarchy &middot; click a node for details
            </span>
          </div>

          {/* Filter toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
              className="w-52"
              debounceMs={200}
            />
            <FilterChips
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1 min-h-0">
          <TaskGraphView
            onNodeClick={handleNodeClick}
            refreshInterval={5000}
            showMiniMap
            showControls
            statusFilter={statusFilter.length > 0 ? statusFilter : undefined}
            searchQuery={searchQuery || undefined}
          />
        </div>
      </div>

      {/* Animated sidebar */}
      <div
        className={`${
          selectedTask ? 'w-[360px]' : 'w-0'
        } transition-all duration-300 ease-in-out border-l border-slate-800 bg-slate-900 overflow-hidden shrink-0`}
      >
        <div className="min-w-[360px] h-full overflow-y-auto">
          <div className="p-4">
            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100">Task Details</h2>
              <button
                onClick={closeSidebar}
                className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar content */}
            {!taskDetails ? (
              <SidebarSkeleton />
            ) : (
              <TaskDetailsContent
                task={taskDetails}
                selectedTask={selectedTask!}
                onSubtaskClick={handleNodeClick}
                onComplete={async () => {
                  await fetch('/api/tasks/graph', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId: selectedTask, status: 'done' }),
                  });
                  handleNodeClick(selectedTask!);
                }}
                onDecompose={() => setShowDecompose(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Decompose Modal */}
      {showDecompose && selectedTask && taskDetails && (
        <DecomposeModal
          parentId={selectedTask}
          parentTitle={taskDetails.title}
          parentPriority={taskDetails.priority}
          isOpen={showDecompose}
          onClose={() => setShowDecompose(false)}
        />
      )}
    </div>
  );
}

// Skeleton loading state for sidebar
function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton width="40%" height={14} />
      <Skeleton width="90%" height={18} />
      <Skeleton variant="text" lines={2} className="mt-3" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Skeleton height={32} variant="rectangular" />
        <Skeleton height={32} variant="rectangular" />
      </div>
      <Skeleton width="60%" height={12} className="mt-4" />
      <div className="space-y-2 mt-2">
        <Skeleton height={24} variant="rectangular" />
        <Skeleton height={24} variant="rectangular" />
        <Skeleton height={24} variant="rectangular" />
      </div>
    </div>
  );
}

// Task details sidebar content
function TaskDetailsContent({
  task,
  selectedTask,
  onSubtaskClick,
  onComplete,
  onDecompose,
}: {
  task: any;
  selectedTask: string;
  onSubtaskClick: (id: string) => void;
  onComplete: () => void;
  onDecompose: () => void;
}) {
  const colors = statusColors[task.status] || statusColors.backlog;

  return (
    <div className="text-sm text-slate-300 space-y-3">
      {/* Parent breadcrumb */}
      {task.parent && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 rounded-md text-[11px] text-slate-400">
          <span className="font-mono text-[10px] px-1 py-px rounded bg-purple-500/15 text-purple-400">
            {task.parent.shortId || task.parent.id?.slice(0, 8)}
          </span>
          <span className="truncate">{task.parent.title}</span>
          <span className="text-slate-600">&rarr;</span>
          <span className="text-indigo-400">subtask</span>
        </div>
      )}

      {/* ShortId + Title */}
      <div>
        {task.shortId && (
          <span className="inline-block mb-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
            {task.shortId}
          </span>
        )}
        <div className="font-semibold text-slate-100 text-[14px] leading-snug">
          {task.title}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div>
          <label className="text-slate-500 text-[10px] uppercase tracking-wider">
            Description
          </label>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            {task.description.length > 200
              ? task.description.slice(0, 200) + '...'
              : task.description}
          </p>
        </div>
      )}

      {/* Status / Priority */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-slate-500 text-[10px] uppercase tracking-wider">
            Status
          </label>
          <div className="mt-1">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[11px] uppercase font-medium"
              style={{
                backgroundColor: colors.border + '30',
                color: colors.border,
              }}
            >
              {task.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div>
          <label className="text-slate-500 text-[10px] uppercase tracking-wider">
            Priority
          </label>
          <div className="mt-1 font-semibold text-slate-200">{task.priority}</div>
        </div>
      </div>

      {/* Assignee */}
      {(task.assignee || task.assignedTo) && (
        <div>
          <label className="text-slate-500 text-[10px] uppercase tracking-wider">
            Assigned To
          </label>
          <div className="mt-1 text-slate-300">@{task.assignee || task.assignedTo}</div>
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div>
          <label className="text-slate-500 text-[10px] uppercase tracking-wider">
            Subtasks ({task.subtasks.filter((s: any) => s.status === 'done' || s.status === 'completed').length}/{task.subtasks.length})
          </label>
          <div className="mt-1.5 space-y-px">
            {task.subtasks.map((sub: any) => {
              const isDone = sub.status === 'done' || sub.status === 'completed';
              const subColors = statusColors[sub.status] || statusColors.backlog;
              return (
                <div
                  key={sub.id}
                  onClick={() => onSubtaskClick(sub.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs hover:bg-slate-800 transition-colors ${
                    isDone ? 'opacity-50' : ''
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: subColors.dot }}
                  />
                  <span
                    className={`flex-1 truncate ${isDone ? 'line-through' : ''}`}
                  >
                    {sub.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-3">
        <button
          onClick={onComplete}
          disabled={task.status === 'done' || task.status === 'completed'}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Complete
        </button>
        <button
          onClick={onDecompose}
          disabled={!!task.parentId}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          Decompose
        </button>
      </div>
      {task.parentId && (
        <p className="text-[10px] text-slate-600">
          Subtasks cannot be further decomposed (single level only).
        </p>
      )}
    </div>
  );
}
