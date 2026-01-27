import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';
import { Trash2, Edit2 } from 'lucide-react';
import { useDiagram } from '@/lib/diagram-context';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label = '',
    style = {},
    markerEnd,
    data,
    ...props
}: EdgeProps) {
    // We can access context if we wrap edges in provider, but edges are usually outside node provider scope in some setups.
    // However, CustomEdge is rendered by ReactFlow which is inside DiagramProvider.
    // Let's use the standard "data" prop to pass callbacks if needed, or context if it works.
    // For now, let's try using the context for delete action if we have one globally, 
    // BUT we didn't export `onDeleteEdge` in DiagramContext. 
    // We should probably rely on `data.onDelete` or just use the `useReactFlow` hook to delete edge.

    // Better yet: User wants "hover actions".
    const [isHovered, setIsHovered] = useState(false);

    // Determine path based on data.pathType (matching the visual controls)
    // Defaulting to smoothstep if not specified, similar to current app state "step"
    const pathType = data?.pathType || 'default';

    let edgePath = '';
    let labelX = 0;
    let labelY = 0;

    if (pathType === 'straight') {
        [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    } else if (pathType === 'step' || pathType === 'smoothstep') {
        [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
    } else {
        [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
    }

    const onEdgeClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (data?.onDelete) {
            data.onDelete(id);
        }
    };

    // Use context to access the global modal
    const { onRequestEdgeEdit } = useDiagram();

    const onEditClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();

        // Use the context modal if available, otherwise fallback to prompt
        if (onRequestEdgeEdit) {
            onRequestEdgeEdit(id, label || data?.label || "");
        } else if (data?.onLabelChange) {
            const newLabel = window.prompt("Enter new label for this connection:", label || data.label || "");
            if (newLabel !== null) {
                data.onLabelChange(id, newLabel);
            }
        }
    };

    return (
        <g
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="react-flow__edge-group"
        >
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 1000
                    }}
                    className="nodrag nopan flex items-center gap-1"
                >
                    {/* Always show label if it exists */}
                    {label && (
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
                            {label}
                        </div>
                    )}
                    {/* Show actions button on hover */}
                    <div className={`flex gap-1 transition-all duration-200 ${isHovered ? 'opacity-100 max-w-[60px]' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                        <button
                            className="bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 shadow-sm p-1.5 rounded-md transition-colors"
                            onClick={onEditClick}
                            title="Edit Label"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button
                            className="bg-white text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm p-1.5 rounded-md transition-colors"
                            onClick={onEdgeClick}
                            title="Delete Connection"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            </EdgeLabelRenderer>
        </g>
    );
}
