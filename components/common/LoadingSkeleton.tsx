// Re-export from canonical source: @/components/ui/LoadingSkeleton
export { Skeleton, CardSkeleton, ListSkeleton } from '@/components/ui/LoadingSkeleton'
export { Skeleton as default } from '@/components/ui/LoadingSkeleton'

// Backward-compat exports not in ui/ version
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-3 border-b border-white/[0.06]">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white/[0.06] rounded h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="animate-pulse bg-white/[0.06] rounded h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-2 rounded-xl p-4">
          <div className="animate-pulse bg-white/[0.06] rounded h-3 w-16 mb-2" />
          <div className="animate-pulse bg-white/[0.06] rounded h-8 w-20" />
        </div>
      ))}
    </div>
  )
}
