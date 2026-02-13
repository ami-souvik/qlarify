"use client";

import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Layers, User, Globe, Server, Database, Activity, Zap, Maximize2, Plus, Minus, Move } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { ArchitectureNode } from '@/types/architecture';

const icons: Record<string, any> = {
    product: Box,
    domain: Layers,
    user: User,
    external: Globe,
    service: Server,
    database: Database,
    api: Activity,
    infra: Zap
};

interface StrategicMindmapProps {
    onNodeClick: (nodeId: string) => void;
}

export function StrategicMindmap({ onNodeClick }: StrategicMindmapProps) {
    const { state, findNode } = useArchitecture();
    const containerRef = useRef<HTMLDivElement>(null);

    // Pan & Zoom State
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
    }, []);

    const activeNode = useMemo(() => {
        if (!state.activeNodeId) return null;
        return findNode(state.activeNodeId);
    }, [state.activeNodeId, findNode]);

    const { nodes, edges } = useMemo(() => {
        if (!activeNode || !activeNode.diagram) return { nodes: [], edges: [] };
        const allowedRoles = ['product', 'domain', 'user', 'external'];
        const filteredNodes = activeNode.diagram.nodes.filter(n =>
            allowedRoles.includes(n.data?.role || '')
        );
        const visibleIds = new Set(filteredNodes.map(n => n.id));
        const filteredEdges = activeNode.diagram.edges.filter(e =>
            visibleIds.has(e.source) && visibleIds.has(e.target)
        );
        return { nodes: filteredNodes, edges: filteredEdges };
    }, [activeNode]);

    const nodeWidth = 180;
    const nodeHeight = 70;
    const layoutScale = 1.6;

    const getNodePos = useCallback((node: any) => {
        const x = (node.position?.x || 0) * layoutScale;
        const y = (node.position?.y || 0) * layoutScale;
        return { x, y };
    }, [layoutScale]);

    const fitView = useCallback(() => {
        if (nodes.length === 0 || dimensions.width === 0) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            const { x, y } = getNodePos(n);
            minX = Math.min(minX, x - nodeWidth / 2);
            maxX = Math.max(maxX, x + nodeWidth / 2);
            minY = Math.min(minY, y - nodeHeight / 2);
            maxY = Math.max(maxY, y + nodeHeight / 2);
        });

        const padding = 150;
        const contentWidth = maxX - minX + padding;
        const contentHeight = maxY - minY + padding;

        const scaleX = dimensions.width / contentWidth;
        const scaleY = dimensions.height / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1.1);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setTransform({
            x: -centerX * newScale,
            y: -centerY * newScale,
            scale: newScale
        });
    }, [nodes, dimensions, getNodePos]);

    useEffect(() => {
        if (nodes.length > 0 && dimensions.width > 0) {
            fitView();
        }
    }, [nodes, dimensions.width, fitView]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(transform.scale + delta, 0.2), 3);
        setTransform(prev => ({ ...prev, scale: newScale }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.mindmap-node')) return;
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (!activeNode) return null;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full relative overflow-hidden bg-slate-50/20 cursor-${isDragging ? 'grabbing' : 'grab'}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* SVG Canvas */}
            <svg
                className="w-full h-full"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
                {/* Background Grid */}
                <defs>
                    <pattern id="grid" width={40 * transform.scale} height={40 * transform.scale} patternUnits="userSpaceOnUse">
                        <circle
                            cx={1 * transform.scale}
                            cy={1 * transform.scale}
                            r={1 * transform.scale}
                            fill="#cbd5e1"
                            opacity="0.3"
                        />
                    </pattern>
                </defs>
                <rect
                    x="0" y="0"
                    width="100%" height="100%"
                    fill="url(#grid)"
                    style={{
                        transform: `translate(${transform.x % (40 * transform.scale)}px, ${transform.y % (40 * transform.scale)}px)`
                    }}
                />

                {/* Main Transform Group */}
                <g style={{
                    transform: `translate(${dimensions.width / 2 + transform.x}px, ${dimensions.height / 2 + transform.y}px) scale(${transform.scale})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}>
                    {/* Edges Layer */}
                    <AnimatePresence>
                        {edges.map((edge) => {
                            const startNode = nodes.find(n => n.id === edge.source);
                            const endNode = nodes.find(n => n.id === edge.target);
                            if (!startNode || !endNode) return null;

                            const sPos = getNodePos(startNode);
                            const ePos = getNodePos(endNode);

                            return (
                                <g key={`edge-${edge.id}`}>
                                    <motion.path
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.4 }}
                                        d={`M ${sPos.x} ${sPos.y} L ${ePos.x} ${ePos.y}`}
                                        stroke="#94a3b8"
                                        strokeWidth="2"
                                        strokeDasharray="5 5"
                                        fill="none"
                                    />
                                    {edge.label && (
                                        <foreignObject
                                            x={(sPos.x + ePos.x) / 2 - 50}
                                            y={(sPos.y + ePos.y) / 2 - 12}
                                            width="100"
                                            height="24"
                                            className="pointer-events-none"
                                        >
                                            <div className="flex justify-center items-center h-full">
                                                <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 text-[8px] font-bold text-slate-500 uppercase tracking-tighter shadow-sm">
                                                    {String(edge.label)}
                                                </span>
                                            </div>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}
                    </AnimatePresence>

                    {/* Nodes Layer */}
                    {nodes.map((node) => {
                        const { x, y } = getNodePos(node);
                        const isRoot = node.data?.role === 'product';
                        const archNodeId = node.data?.architecture_node_id;

                        return (
                            <foreignObject
                                key={node.id}
                                x={x - nodeWidth / 2}
                                y={y - nodeHeight / 2}
                                width={nodeWidth}
                                height={nodeHeight}
                                className="mindmap-node"
                            >
                                <MindmapNodeJSX
                                    name={node.data?.label || 'Node'}
                                    type={node.data?.role || 'domain'}
                                    isCenter={isRoot}
                                    onClick={() => archNodeId && !isRoot && onNodeClick(archNodeId)}
                                    hasDetails={!!archNodeId}
                                />
                            </foreignObject>
                        );
                    })}
                </g>
            </svg>

            {/* Scale Indicator */}
            <div className="absolute top-4 right-4 pointer-events-none">
                <div className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[10px] font-bold text-slate-400">
                    Zoom: {(transform.scale * 100).toFixed(0)}%
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-1 z-50">
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 p-1 flex flex-col gap-1">
                    <button
                        onClick={() => setTransform(p => ({ ...p, scale: Math.min(p.scale + 0.2, 3) }))}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all active:scale-90"
                    >
                        <Plus size={18} />
                    </button>
                    <div className="h-px bg-slate-100 mx-2" />
                    <button
                        onClick={() => setTransform(p => ({ ...p, scale: Math.max(p.scale - 0.2, 0.2) }))}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all active:scale-90"
                    >
                        <Minus size={18} />
                    </button>
                    <div className="h-px bg-slate-100 mx-2" />
                    <button
                        onClick={fitView}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 transition-all active:scale-90"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function MindmapNodeJSX({ name, type, isCenter, onClick, hasDetails }: { name: string, type: string, isCenter: boolean, onClick: () => void, hasDetails: boolean }) {
    const Icon = icons[type] || Server;

    // Aesthetic role styles
    const getStyles = () => {
        if (isCenter) return 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-100';
        switch (type) {
            case 'product': return 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-indigo-50';
            case 'domain': return 'bg-blue-50 border-blue-200 text-blue-900 shadow-blue-50';
            case 'user': return 'bg-teal-50 border-teal-200 text-teal-800 shadow-teal-50';
            case 'external': return 'bg-slate-50 border-slate-200 text-slate-700 shadow-slate-50';
            default: return 'bg-white border-slate-200 text-slate-800 shadow-slate-50';
        }
    };

    return (
        <div
            onClick={onClick}
            className={`
                group h-full w-full flex items-center gap-3 px-4 py-3
                rounded-2xl border-2 shadow-sm transition-all duration-300
                cursor-pointer select-none overflow-hidden
                ${getStyles()}
            `}
        >
            <div className={`
                p-2 rounded-xl flex-shrink-0
                ${isCenter ? 'bg-white/20' : 'bg-white shadow-inner'}
            `}>
                <Icon size={18} className={isCenter ? 'text-white' : 'text-slate-600'} />
            </div>

            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate leading-tight">
                    {name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest opacity-60`}>
                        {type}
                    </span>
                    {hasDetails && !isCenter && (
                        <div className="flex items-center gap-0.5 text-[8px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={8} /> Explore
                        </div>
                    )}
                </div>
            </div>

            {/* Interactive Pulse for center */}
            {isCenter && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
        </div>
    );
}
