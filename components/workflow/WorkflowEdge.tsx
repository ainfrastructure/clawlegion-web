'use client';

import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  animated,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        strokeWidth: 2,
        stroke: animated ? '#3B82F6' : '#94A3B8',
        ...style,
      }}
      className={animated ? 'animated-edge' : ''}
    />
  );
}
