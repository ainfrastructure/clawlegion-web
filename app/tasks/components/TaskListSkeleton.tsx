'use client'

import { Skeleton } from '@/components/ui/LoadingSkeleton'

// Custom skeleton with proper dark theme colors
function TaskSkeleton({ className = '', ...props }) {
  return (
    <div 
      className={`animate-pulse bg-white/[0.06] rounded ${className}`} 
      {...props}
    />
  )
}

// ============================================
// TASK LIST SKELETON - Loading placeholders
// ============================================

export function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Mobile View Skeleton */}
      <div className="block sm:hidden space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MobileTaskCardSkeleton key={i} />
        ))}
      </div>

      {/* Desktop View Skeleton */}
      <div className="hidden sm:block glass-2 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr className="text-left text-slate-400 text-sm">
              <th className="px-4 py-4">
                <TaskSkeleton style={{ width: '18px', height: '18px' }} />
              </th>
              <th className="px-4 py-4 font-medium">Task</th>
              <th className="px-4 py-4 font-medium">Priority</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Assigned</th>
              <th className="px-4 py-4 font-medium">Created</th>
              <th className="px-4 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {Array.from({ length: 8 }).map((_, i) => (
              <TaskRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function KanbanViewSkeleton() {
  return (
    <>
      {/* Mobile: Stacked columns skeleton */}
      <div className="block sm:hidden space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KanbanColumnMobileSkeleton key={i} />
        ))}
      </div>

      {/* Desktop: Grid layout skeleton */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 min-w-[640px] h-[calc(100vh-360px)] md:h-[calc(100vh-320px)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <KanbanColumnSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// Individual Skeleton Components
// ============================================

function MobileTaskCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-start gap-4">
        {/* Checkbox skeleton */}
        <div className="mt-1 flex-shrink-0">
          <TaskSkeleton className="rounded" style={{ width: '22px', height: '22px' }} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title skeleton */}
          <div className="space-y-2">
            <TaskSkeleton className="h-4" style={{ width: '90%' }} />
            <TaskSkeleton className="h-4" style={{ width: '60%' }} />
          </div>
          
          {/* Priority + Status badges skeleton */}
          <div className="flex flex-wrap gap-2">
            <TaskSkeleton className="rounded-lg" style={{ width: '60px', height: '32px' }} />
            <TaskSkeleton className="rounded-lg" style={{ width: '80px', height: '32px' }} />
            <TaskSkeleton className="rounded-md" style={{ width: '50px', height: '24px' }} />
          </div>
          
          {/* Agent + timestamp skeleton */}
          <div className="flex items-center gap-2">
            <TaskSkeleton className="rounded-full" style={{ width: '20px', height: '20px' }} />
            <TaskSkeleton className="h-3.5" style={{ width: '80px' }} />
            <TaskSkeleton className="h-3" style={{ width: '100px' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskRowSkeleton() {
  return (
    <tr className="hover:bg-slate-900/20 border-b border-white/[0.06]">
      <td className="px-4 py-4">
        <TaskSkeleton className="rounded" style={{ width: '18px', height: '18px' }} />
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <TaskSkeleton className="h-4" style={{ width: '80%' }} />
          <TaskSkeleton className="h-3" style={{ width: '60%' }} />
        </div>
      </td>
      <td className="px-4 py-4">
        <TaskSkeleton className="rounded-lg" style={{ width: '50px', height: '24px' }} />
      </td>
      <td className="px-4 py-4">
        <TaskSkeleton className="rounded-lg" style={{ width: '70px', height: '24px' }} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <TaskSkeleton className="rounded-full" style={{ width: '24px', height: '24px' }} />
          <TaskSkeleton className="h-3.5" style={{ width: '60px' }} />
        </div>
      </td>
      <td className="px-4 py-4">
        <TaskSkeleton className="h-3.5" style={{ width: '50px' }} />
      </td>
      <td className="px-4 py-4">
        <TaskSkeleton className="rounded" style={{ width: '24px', height: '24px' }} />
      </td>
    </tr>
  )
}

function KanbanColumnMobileSkeleton() {
  return (
    <div className="bg-slate-800/30 rounded-xl border border-white/[0.06]">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TaskSkeleton className="rounded" style={{ width: '16px', height: '16px' }} />
          <TaskSkeleton className="h-4" style={{ width: '60px' }} />
        </div>
        <TaskSkeleton className="rounded-md" style={{ width: '20px', height: '20px' }} />
      </div>
      <div className="p-3 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function KanbanColumnSkeleton() {
  return (
    <div className="bg-slate-800/30 rounded-xl border border-white/[0.06] flex flex-col min-w-[200px]">
      <div className="p-3 md:p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TaskSkeleton className="rounded" style={{ width: '16px', height: '16px' }} />
          <TaskSkeleton className="h-4" style={{ width: '50px' }} />
        </div>
        <TaskSkeleton className="rounded" style={{ width: '20px', height: '20px' }} />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function KanbanCardSkeleton() {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-white/[0.06]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <TaskSkeleton className="mt-0.5 flex-shrink-0 rounded" style={{ width: '16px', height: '16px' }} />
          <div className="space-y-2 flex-1">
            <TaskSkeleton className="h-3.5" style={{ width: '100%' }} />
            <TaskSkeleton className="h-3.5" style={{ width: '60%' }} />
          </div>
        </div>
        <TaskSkeleton className="mt-1 flex-shrink-0 rounded" style={{ width: '12px', height: '12px' }} />
      </div>
      
      {/* Optional progress bar skeleton - deterministic pattern */}
      <div className="flex items-center gap-2">
        <TaskSkeleton className="rounded-full" style={{ width: '80px', height: '20px' }} />
      </div>
    </div>
  )
}