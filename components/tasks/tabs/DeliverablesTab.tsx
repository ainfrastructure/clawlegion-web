'use client'

import { DeliverableViewer } from '@/components/deliverables/DeliverableViewer'

type DeliverablesTabProps = {
  taskId: string
}

export function DeliverablesTab({ taskId }: DeliverablesTabProps) {
  return (
    <div className="p-4">
      <DeliverableViewer taskId={taskId} />
    </div>
  )
}
