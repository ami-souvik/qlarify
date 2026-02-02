"use client";

import { Minus, Plus } from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback } from 'react';

// Since I cannot assume new packages, I will use native React events for drag/zoom if needed, 
// strictly creating a lightweight version.

interface Node {
    id: string;
    position: { x: number; y: number };
    data: any;
    type?: string;
    [key: string]: any;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    label?: string;
    [key: string]: any;
}

interface QlarifyFlowProps {
    nodes: Node[];
    edges: Edge[];
    nodeTypes?: Record<string, React.ComponentType<any>>;
    edgeTypes?: Record<string, React.ComponentType<any>>;
    onNodeClick?: (event: React.MouseEvent, node: Node) => void;
    onNodeDragStop?: (event: React.MouseEvent, node: Node) => void;
    fitView?: boolean;
    className?: string;
}

export default function QlarifyFlow({
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    onNodeClick,
    onNodeDragStop,
    fitView,
    className
}: QlarifyFlowProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Simple Pan Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setTransform(prev => ({
                ...prev,
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            }));
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // Zoom Logic
    const handleWheel = (e: React.WheelEvent) => {
        const zoomIntensity = 0.001;
        const newK = Math.min(Math.max(0.1, transform.k + e.deltaY * -zoomIntensity), 4);

        // Improve: Zoom towards cursor (simplified here to center or current position)
        setTransform(prev => ({ ...prev, k: newK }));
    };

    // Edge Path Calculation (Simple Bezier)
    const getPath = (source: Node, target: Node) => {
        if (!source || !target) return "";
        const sx = source.position.x + 150; // Approximating width center if width ~300
        const sy = source.position.y + 26;  // Approximating height center
        const tx = target.position.x;
        const ty = target.position.y + 26;

        // Cubic Bezier
        return `M${sx},${sy} C${sx + 50},${sy} ${tx - 50},${ty} ${tx},${ty}`;
    };

    // Fit View Logic
    const handleFitView = useCallback(() => {
        if (nodes.length === 0) {
            setTransform({ x: 0, y: 0, k: 1 });
            return;
        }

        // Calculate bounding box
        // Assuming approx node dimensions if not provided (w: 200, h: 100)
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            maxX = Math.max(maxX, node.position.x + 180);
            minY = Math.min(minY, node.position.y);
            maxY = Math.max(maxY, node.position.y + 80);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;

        // Padding
        const padding = 50;
        const availableWidth = clientWidth - padding * 2;
        const availableHeight = clientHeight - padding * 2;

        const scale = Math.min(
            availableWidth / contentWidth,
            availableHeight / contentHeight,
            1 // Don't zoom in past 100%
        );

        // Center logic
        const x = (clientWidth - contentWidth * scale) / 2 - minX * scale;
        const y = (clientHeight - contentHeight * scale) / 2 - minY * scale;

        setTransform({ x, y, k: scale });
    }, [nodes]);

    // Internal auto-fit on load if prop is true (optional, but good UX)
    useEffect(() => {
        if (fitView && nodes.length > 0) {
            handleFitView();
        }
    }, [fitView, nodes.length, handleFitView]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden relative bg-slate-50 cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ${className}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            <div
                id="qlarify-flow-content"
                className="absolute transform-origin-tl transition-transform duration-300 ease-out"
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
            >
                {/* Background Grid */}
                <div className="absolute -top-[5000px] -left-[5000px] w-[10000px] h-[10000px] pointer-events-none opacity-20 canvas-bg"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Edges Layer */}
                <svg className="absolute overflow-visible top-0 left-0 pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
                    {edges.map(edge => {
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        const targetNode = nodes.find(n => n.id === edge.target);
                        if (!sourceNode || !targetNode) return null;

                        const EdgeComponent = edgeTypes && edge.type && edgeTypes[edge.type];
                        const sourceX = sourceNode.position.x + 150;
                        const sourceY = sourceNode.position.y + 26;
                        const targetX = targetNode.position.x;
                        const targetY = targetNode.position.y + 26;

                        if (EdgeComponent) {
                            return (
                                <EdgeComponent
                                    key={edge.id}
                                    id={edge.id}
                                    sourceX={sourceX}
                                    sourceY={sourceY}
                                    targetX={targetX}
                                    targetY={targetY}
                                    label={edge.label}
                                    data={edge.data || {}}
                                    markerEnd="url(#arrowhead)"
                                    style={edge.style}
                                />
                            );
                        }

                        return (
                            <g key={edge.id}>
                                <path
                                    d={getPath(sourceNode, targetNode)}
                                    stroke="#94a3b8"
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                />
                                {/* Label & Actions via ForeignObject for HTML content in SVG */}
                                <foreignObject
                                    x={(sourceX + targetX) / 2 - 50}
                                    y={(sourceY + targetY) / 2 - 14}
                                    width="80"
                                    height="40"
                                    className="overflow-visible"
                                >
                                    {edge.label && (
                                        <text
                                            textAnchor="middle"
                                            style={{
                                                backgroundColor: "white",
                                                backdropFilter: "blur(10px)",
                                                padding: "2px 4px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                borderColor: "#94a3b8",
                                                borderWidth: "1px",
                                                borderStyle: "solid",
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {edge.label}
                                        </text>
                                    )}
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                {nodes.map(node => {
                    const NodeType = (nodeTypes && node.type && nodeTypes[node.type]) || DefaultNode;
                    return (
                        <div
                            key={node.id}
                            className="absolute"
                            style={{ left: node.position.x, top: node.position.y }}
                            onClick={(e) => onNodeClick?.(e, node)}
                        >
                            <NodeType {...({ data: node.data, id: node.id } as any)} />
                        </div>
                    );
                })}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <button onClick={() => setTransform(t => ({ ...t, k: t.k + 0.1 }))} className="p-2 bg-white rounded shadow text-slate-600 hover:bg-slate-50"><Plus /></button>
                <button onClick={() => setTransform(t => ({ ...t, k: t.k - 0.1 }))} className="p-2 bg-white rounded shadow text-slate-600 hover:bg-slate-50"><Minus /></button>
                <button onClick={handleFitView} className="p-2 bg-white rounded shadow text-slate-600 hover:bg-slate-50 text-xs font-semibold px-3">Fit</button>
            </div>
        </div>
    );
}

const DefaultNode = ({ data }: { data: any }) => (
    <div className="bg-white border text-slate-900 border-slate-300 p-4 rounded-lg shadow min-w-[150px] text-center">
        <div className="font-bold text-sm">{data.label || "Node"}</div>
        {data.role && <div className="text-xs text-slate-500 mt-1 capitalize">{data.role}</div>}
    </div>
);
