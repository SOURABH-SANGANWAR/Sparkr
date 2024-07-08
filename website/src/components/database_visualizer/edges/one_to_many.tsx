import React from 'react';
import { Dialog,
  

 } from '@/components/ui/dialog';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from 'reactflow';
import { calculatePath } from './paths/custom_offset_path';
import styles from './styles.module.css';

export default function OneToOneEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data: { label, offset },
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  // const [edgePath, labelX, labelY] = getSmoothStepPath({
  //   sourceX,
  //   sourceY,
  //   sourcePosition,
  //   targetX,
  //   targetY,
  //   targetPosition,
  // });
  const [edgePath, labelX, labelY] = calculatePath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    offset: offset || 100,
    initialRightOffset: 15,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath as string} markerEnd={markerEnd} style={style}  />
      <EdgeLabelRenderer>
        <div className= {`${styles.diamond} text-xs`}
          style={{
            position: 'absolute',
            transform: `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
        >
            {label}
            <Dialog></Dialog>
        </div>
        <div  className='text-xs'
        style = {{
          position: 'absolute',
          transform: `translate(${labelX}px,${labelY}px) translate(-50%, -50%) translate(-55px, 0%)`,
          pointerEvents: 'all',
          zIndex: 100,
        }}
        >
          1
        </div>
        <div className='text-xs'
        style = {{
          position: 'absolute',
          transform: `translate(${labelX}px,${labelY}px) translate(-50%, -50%) translate(55px, 0%)`,
          pointerEvents: 'all',
          zIndex: 100,
        }}
        >
          *
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
