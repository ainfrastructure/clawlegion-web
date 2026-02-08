import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString()
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'RUNNING':
      return 'bg-blue-500'
    case 'COMPLETED':
      return 'bg-green-500'
    case 'FAILED':
      return 'bg-red-500'
    case 'PENDING':
      return 'bg-yellow-500'
    case 'STOPPED':
      return 'bg-gray-500'
    case 'PAUSED':
      return 'bg-yellow-600'
    default:
      return 'bg-gray-400'
  }
}
