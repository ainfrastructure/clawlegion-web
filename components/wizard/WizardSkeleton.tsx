'use client'

import { Skeleton } from '@/components/common/LoadingSkeleton'

// Repository Selection Skeleton
export function RepositorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 glass-2 rounded-xl">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Task Generation Skeleton (shows AI thinking)
export function TaskGenerationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/[0.06]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
          </div>
          <Skeleton className="h-5 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Task Review Skeleton
export function TaskReviewSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 glass-2 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Configuration Skeleton
export function ConfigurationSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Summary Skeleton
export function SummarySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 glass-2 rounded-lg">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>
      
      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Teams/Projects Selection Skeleton (for Linear sync)
export function SelectionSkeleton({ label = "Loading items..." }: { label?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700 dark:border-slate-600" />
          <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
        </div>
        <span className="text-sm text-gray-600 dark:text-slate-400">{label}</span>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

// Branch Selection Skeleton
export function BranchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700 dark:border-slate-600" />
          <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
        </div>
        <span className="text-sm text-gray-600 dark:text-slate-400">Loading branches...</span>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Template Loading Skeleton
export function TemplateSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-slate-700 dark:border-slate-600" />
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
          </div>
          <span className="text-sm text-gray-600 dark:text-slate-400">Loading templates...</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-slate-800/30 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
