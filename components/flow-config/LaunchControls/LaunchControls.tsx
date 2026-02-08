'use client'

import { Eye, Save, Rocket, Loader2 } from 'lucide-react'
import type { LaunchControlsProps } from '../types'

export function LaunchControls({
  onPreview,
  onSaveTemplate,
  onLaunch,
  isWizardMode = false,
  isDirty = false,
  isLaunching = false,
}: LaunchControlsProps & { isLaunching?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-slate-800/50 border-t border-white/[0.06]">
      {/* Left side - Secondary actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium
            bg-slate-700 hover:bg-slate-600 text-slate-200
            border border-slate-600 rounded-lg transition-colors duration-150"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>

        <button
          type="button"
          onClick={onSaveTemplate}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            border rounded-lg transition-colors duration-150
            ${isDirty 
              ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/40' 
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'}
          `}
        >
          <Save className="w-4 h-4" />
          Save Template
        </button>
      </div>

      {/* Right side - Primary action */}
      {!isWizardMode && (
        <button
          type="button"
          onClick={onLaunch}
          disabled={isLaunching}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold
            bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
            text-white rounded-lg shadow-lg shadow-blue-500/20
            transition-all duration-150 hover:shadow-blue-500/30
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Launch Session
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default LaunchControls
