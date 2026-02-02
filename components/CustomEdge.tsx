import React, { useState } from 'react';
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
    data
}: any) {
    const [isHovered, setIsHovered] = useState(false);
    const pathType = data?.pathType || 'default';
    const { onRequestEdgeEdit } = useDiagram();

    // Local Path Logic
    const getPath = () => {
        if (pathType === 'straight') {
            return `M${sourceX},${sourceY} L${targetX},${targetY}`;
        }
        // Simple Bezier for default
        const cx = (sourceX + targetX) / 2;
        const cy = (sourceY + targetY) / 2;
        // Adjust control points based on distance
        return `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
    };

    const edgePath = getPath();
    const labelX = (sourceX + targetX) / 2;
    const labelY = (sourceY + targetY) / 2;

    const onEdgeClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (data?.onDelete) data.onDelete(id);
    };

    const onEditClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (onRequestEdgeEdit) {
            onRequestEdgeEdit(id, label || data?.label || "");
        } else if (data?.onLabelChange) {
            const newLabel = window.prompt("Enter new label:", label || data.label || "");
            if (newLabel) data.onLabelChange(id, newLabel);
        }
    };

    return (
        <g
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group"
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
        >
            <path
                d={edgePath}
                stroke="#94a3b8"
                strokeWidth="2"
                fill="none"
                markerEnd={markerEnd}
                style={style}
                className="hover:stroke-indigo-400 hover:stroke-[3px] transition-all"
            />

            {/* Label & Actions via ForeignObject for HTML content in SVG */}
            <foreignObject
                x={labelX - 40}
                y={labelY - 20}
                width="80"
                height="40"
                className="overflow-visible"
            >
                <div className="flex flex-col items-center justify-center h-full w-full">
                    {label && (
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-slate-200 text-xs font-medium text-slate-600 whitespace-nowrap">
                            {label}
                        </div>
                    )}

                    {!data?.readOnly && isHovered && (
                        <div className="flex gap-1 mt-1 bg-white p-1 rounded-md shadow border border-slate-100 absolute top-full">
                            <button onClick={onEditClick} className="p-1 hover:text-indigo-600"><Edit2 size={10} /></button>
                            <button onClick={onEdgeClick} className="p-1 hover:text-red-600"><Trash2 size={10} /></button>
                        </div>
                    )}
                </div>
            </foreignObject>
        </g>
    );
}
