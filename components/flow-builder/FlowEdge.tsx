'use client'

import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'

export type FlowEdgeData = {
  sourceColor?: string
}

export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const edgeData = data as FlowEdgeData | undefined
  const color = edgeData?.sourceColor || '#64748b'

  return (
    <>
      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeOpacity={0.1}
        filter="blur(4px)"
      />
      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: color,
          strokeOpacity: 0.6,
        }}
        className="flow-edge-animated"
      />
    </>
  )
}
