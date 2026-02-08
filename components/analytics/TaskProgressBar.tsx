'use client'

interface Props {
  completed: number
  failed: number
  running: number
  pending: number
  total: number
}

export default function TaskProgressBar({ completed, failed, running, pending, total }: Props) {
  if (total === 0) {
    return (
      <div className="w-full bg-gray-200 rounded-full h-6 flex items-center justify-center">
        <span className="text-xs text-gray-500">No tasks</span>
      </div>
    )
  }

  const completedPercent = (completed / total) * 100
  const failedPercent = (failed / total) * 100
  const runningPercent = (running / total) * 100
  const pendingPercent = (pending / total) * 100

  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
        {completed > 0 && (
          <div
            className="bg-green-500 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${completedPercent}%` }}
          >
            {completedPercent > 10 && `${completed}`}
          </div>
        )}
        {running > 0 && (
          <div
            className="bg-blue-500 flex items-center justify-center text-xs font-semibold text-white animate-pulse"
            style={{ width: `${runningPercent}%` }}
          >
            {runningPercent > 10 && `${running}`}
          </div>
        )}
        {failed > 0 && (
          <div
            className="bg-red-500 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${failedPercent}%` }}
          >
            {failedPercent > 10 && `${failed}`}
          </div>
        )}
        {pending > 0 && (
          <div
            className="bg-gray-400 flex items-center justify-center text-xs font-semibold text-white"
            style={{ width: `${pendingPercent}%` }}
          >
            {pendingPercent > 10 && `${pending}`}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Completed ({completed})</span>
          </div>
          {running > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded animate-pulse"></div>
              <span className="text-gray-600">Running ({running})</span>
            </div>
          )}
          {failed > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Failed ({failed})</span>
            </div>
          )}
          {pending > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span className="text-gray-600">Pending ({pending})</span>
            </div>
          )}
        </div>
        <div className="font-semibold text-gray-700">
          {completed}/{total} ({Math.round((completed / total) * 100)}%)
        </div>
      </div>
    </div>
  )
}
