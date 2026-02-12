'use client'

import { useState, useMemo } from 'react'
import { Download, FileJson, FileSpreadsheet, ChevronDown, Settings2, Check, X } from 'lucide-react'
import { exportData, flattenForExport, ExportFormat } from '@/lib/export'

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[]
  filename: string
  columns?: string[]
  flattenKeys?: string[]
  className?: string
  disabled?: boolean
  /** Enable column selection UI */
  allowColumnSelection?: boolean
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  columns,
  flattenKeys,
  className = '',
  disabled = false,
  allowColumnSelection = false,
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set(columns ?? []))

  // Get all available columns from data
  const availableColumns = useMemo(() => {
    if (data.length === 0) return []
    const exportableData = flattenKeys 
      ? flattenForExport(data, flattenKeys)
      : data
    return Object.keys(exportableData[0] ?? {})
  }, [data, flattenKeys])

  // Initialize selected columns when available columns change
  useMemo(() => {
    if (selectedColumns.size === 0 && availableColumns.length > 0) {
      setSelectedColumns(new Set(columns ?? availableColumns))
    }
  }, [availableColumns, columns, selectedColumns.size])

  const handleExport = (format: ExportFormat) => {
    const exportableData = flattenKeys 
      ? flattenForExport(data, flattenKeys)
      : data
    const exportColumns = allowColumnSelection && selectedColumns.size > 0 
      ? Array.from(selectedColumns)
      : columns
    exportData(exportableData as Record<string, unknown>[], filename, format, exportColumns)
    setIsOpen(false)
    setShowColumnPicker(false)
  }

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => {
      const next = new Set(prev)
      if (next.has(col)) {
        next.delete(col)
      } else {
        next.add(col)
      }
      return next
    })
  }

  const selectAllColumns = () => {
    setSelectedColumns(new Set(availableColumns))
  }

  const clearAllColumns = () => {
    setSelectedColumns(new Set())
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || data.length === 0}
        className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors ${className}`}
      >
        <Download size={18} />
        Export
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => { setIsOpen(false); setShowColumnPicker(false) }} 
          />
          
          {/* Dropdown */}
          <div className={`absolute right-0 mt-2 bg-slate-800 border border-white/[0.06] rounded-lg shadow-xl z-50 overflow-hidden ${showColumnPicker ? 'w-72' : 'w-48'}`}>
            {!showColumnPicker ? (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-center gap-3 text-slate-200 transition-colors"
                >
                  <FileSpreadsheet size={18} className="text-green-400" />
                  <div>
                    <div className="font-medium">Export CSV</div>
                    <div className="text-xs text-slate-400">Spreadsheet format</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-center gap-3 text-slate-200 transition-colors border-t border-white/[0.06]"
                >
                  <FileJson size={18} className="text-blue-400" />
                  <div>
                    <div className="font-medium">Export JSON</div>
                    <div className="text-xs text-slate-400">Raw data format</div>
                  </div>
                </button>
                
                {allowColumnSelection && availableColumns.length > 0 && (
                  <button
                    onClick={() => setShowColumnPicker(true)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-center gap-3 text-slate-200 transition-colors border-t border-white/[0.06]"
                  >
                    <Settings2 size={18} className="text-purple-400" />
                    <div>
                      <div className="font-medium">Select Columns</div>
                      <div className="text-xs text-slate-400">{selectedColumns.size} of {availableColumns.length} selected</div>
                    </div>
                  </button>
                )}
                
                {data.length > 0 && (
                  <div className="px-4 py-2 bg-slate-900/50 text-xs text-slate-500 border-t border-white/[0.06]">
                    {data.length} record{data.length !== 1 ? 's' : ''} to export
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Column Picker Header */}
                <div className="px-4 py-3 bg-slate-900/50 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="font-medium text-slate-200">Select Columns</span>
                  <button 
                    onClick={() => setShowColumnPicker(false)}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
                
                {/* Select All / Clear */}
                <div className="px-4 py-2 border-b border-white/[0.06] flex gap-2">
                  <button 
                    onClick={selectAllColumns}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={clearAllColumns}
                    className="text-xs text-slate-400 hover:text-slate-300"
                  >
                    Clear All
                  </button>
                </div>
                
                {/* Column List */}
                <div className="max-h-64 overflow-y-auto">
                  {availableColumns.map(col => (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3 text-slate-200 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedColumns.has(col) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-slate-500'
                      }`}>
                        {selectedColumns.has(col) && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm font-mono truncate">{col}</span>
                    </button>
                  ))}
                </div>
                
                {/* Export Actions */}
                <div className="px-4 py-3 bg-slate-900/50 border-t border-white/[0.06] flex gap-2">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={selectedColumns.size === 0}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet size={14} /> CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={selectedColumns.size === 0}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm flex items-center justify-center gap-2"
                  >
                    <FileJson size={14} /> JSON
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
