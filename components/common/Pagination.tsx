'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPageNumbers?: boolean
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true 
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  
  // Show max 5 page numbers
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages
    
    if (currentPage <= 3) return pages.slice(0, 5)
    if (currentPage >= totalPages - 2) return pages.slice(-5)
    
    return pages.slice(currentPage - 3, currentPage + 2)
  }
  
  const visiblePages = getVisiblePages()
  
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
          'text-slate-400 hover:text-white'
        )}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {visiblePages[0] > 1 && (
            <>
              <PageButton page={1} current={currentPage} onClick={onPageChange} />
              {visiblePages[0] > 2 && <span className="px-2 text-slate-500">...</span>}
            </>
          )}
          
          {visiblePages.map(page => (
            <PageButton key={page} page={page} current={currentPage} onClick={onPageChange} />
          ))}
          
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 text-slate-500">...</span>
              )}
              <PageButton page={totalPages} current={currentPage} onClick={onPageChange} />
            </>
          )}
        </div>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
          'text-slate-400 hover:text-white'
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

function PageButton({ page, current, onClick }: { page: number; current: number; onClick: (p: number) => void }) {
  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
        page === current
          ? 'bg-purple-600 text-white'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      )}
    >
      {page}
    </button>
  )
}

export default Pagination
