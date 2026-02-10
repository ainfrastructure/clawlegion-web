'use client'

import { DeliverableViewer } from '@/components/deliverables/DeliverableViewer'

type DeliverablesTabProps = {
  taskId: string
}

export function DeliverablesTab({ taskId }: DeliverablesTabProps) {
  return (
    <div className="px-4 sm:px-6 py-5">
      <DeliverableViewer taskId={taskId} />
    </div>
  )
}
