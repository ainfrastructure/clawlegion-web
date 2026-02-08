'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
}

const sizePx = {
  sm: 32,
  md: 40,
  lg: 48
}

const colors = [
  'bg-purple-600',
  'bg-blue-600',
  'bg-green-600',
  'bg-orange-600',
  'bg-pink-600',
  'bg-indigo-600'
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getColorFromName(name: string): string {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const displayName = alt || name || 'User'
  const initials = getInitials(displayName)
  const bgColor = getColorFromName(displayName)
  const dimension = sizePx[size]
  
  if (src) {
    return (
      <Image
        src={src}
        alt={displayName}
        width={dimension}
        height={dimension}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
        unoptimized // Allow external URLs without domain config
      />
    )
  }
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizeClasses[size],
        bgColor,
        className
      )}
      title={displayName}
    >
      {initials}
    </div>
  )
}

export default Avatar
