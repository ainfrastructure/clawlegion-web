'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-slate-700 rounded'
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={`${baseClass} ${variantStyles[variant]}`}
            style={{ 
              ...style, 
              width: i === lines - 1 ? '60%' : '100%' // Last line shorter
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className={`${baseClass} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeleton layouts
export function CardSkeleton() {
  return (
    <div className="glass-2 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} className="mt-2" />
        </div>
      </div>
      <Skeleton variant="text" lines={2} />
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-white/[0.06]">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === 0 ? '30%' : '20%'} 
          height={16} 
        />
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton width="70%" height={16} />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
