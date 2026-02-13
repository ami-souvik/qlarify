"use client";

import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { Box, Layers, User, Globe, Server, Database, Activity, Zap, Maximize2, Plus, Minus, Move } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { ArchitectureNode } from '@/types/architecture';

const COLORS: Record<string, { bg: string, border: string, text: string, shadow: string }> = {
    product: { bg: '#eef2ff', border: '#6366f1', text: '#1e1b4b', shadow: 'rgba(99, 102, 241, 0.1)' },
    domain: { bg: '#eff6ff', border: '#3b82f6', text: '#172554', shadow: 'rgba(59, 130, 246, 0.1)' },
    user: { bg: '#f0fdfa', border: '#14b8a6', text: '#042f2e', shadow: 'rgba(20, 184, 166, 0.1)' },
    external: { bg: '#f8fafc', border: '#94a3b8', text: '#334155', shadow: 'rgba(148, 163, 184, 0.1)' },
    root: { bg: '#4f46e5', border: '#4338ca', text: '#ffffff', shadow: 'rgba(79, 70, 229, 0.3)' }
};

const ICON_MAP: Record<string, string> = {
    product: '📦',
    domain: '📑',
    user: '👤',
    external: '🌐',
    service: '🖥️',
    database: '🗄️',
    api: '📈',
    infra: '⚡'
};

interface StrategicMindmapProps {
    onNodeClick: (nodeId: string) => void;
}

export function StrategicMindmap({ onNodeClick }: StrategicMindmapProps) {
    const { state, findNode } = useArchitecture();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

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

    const nodeWidth = 160;
    const nodeHeight = 60;
    const layoutScale = 1.5;

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and match high DPI
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // 0. Draw Background Grid
        const gridSize = 40;
        const dotSize = 1;
        ctx.fillStyle = '#f1f5f9';

        // Calculate grid start points based on transform
        const startX = ((-transform.x / transform.scale) % gridSize) - gridSize;
        const startY = ((-transform.y / transform.scale) % gridSize) - gridSize;
        const endX = (dimensions.width / transform.scale) + gridSize;
        const endY = (dimensions.height / transform.scale) + gridSize;

        ctx.save();
        ctx.translate(dimensions.width / 2 + transform.x, dimensions.height / 2 + transform.y);
        ctx.scale(transform.scale, transform.scale);

        // We actually want a fixed-position grid that feels like a floor
        // So we undo the scale for the dot size but keep it for spacing
        ctx.restore();

        // Simpler approach: Screen-space grid that shifts
        const offsetX = (transform.x % (gridSize * transform.scale));
        const offsetY = (transform.y % (gridSize * transform.scale));

        ctx.beginPath();
        for (let x = offsetX; x < dimensions.width; x += gridSize * transform.scale) {
            for (let y = offsetY; y < dimensions.height; y += gridSize * transform.scale) {
                ctx.rect(x, y, dotSize, dotSize);
            }
        }
        ctx.fill();

        ctx.save();

        // Translate to center + transform
        ctx.translate(dimensions.width / 2 + transform.x, dimensions.height / 2 + transform.y);
        ctx.scale(transform.scale, transform.scale);

        // 1. Draw Edges
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;

        edges.forEach(edge => {
            const startNode = nodes.find(n => n.id === edge.source);
            const endNode = nodes.find(n => n.id === edge.target);
            if (!startNode || !endNode) return;

            const x1 = (startNode.position?.x || 0) * layoutScale;
            const y1 = (startNode.position?.y || 0) * layoutScale;
            const x2 = (endNode.position?.x || 0) * layoutScale;
            const y2 = (endNode.position?.y || 0) * layoutScale;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Draw Edge Label
            if (edge.label) {
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;

                ctx.save();
                ctx.globalAlpha = 1;
                ctx.font = 'bold 8px Inter, sans-serif';
                const labelText = String(edge.label).toUpperCase();
                const metrics = ctx.measureText(labelText);
                const padding = 4;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(mx - metrics.width / 2 - padding, my - 6 - padding / 2, metrics.width + padding * 2, 12 + padding);
                ctx.strokeStyle = '#f1f5f9';
                ctx.setLineDash([]);
                ctx.strokeRect(mx - metrics.width / 2 - padding, my - 6 - padding / 2, metrics.width + padding * 2, 12 + padding);

                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText(labelText, mx, my + 3);
                ctx.restore();
            }
        });

        // 2. Draw Nodes
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        nodes.forEach(node => {
            const x = (node.position?.x || 0) * layoutScale;
            const y = (node.position?.y || 0) * layoutScale;
            const role = node.data?.role || 'domain';
            const isRoot = role === 'product';
            const style = isRoot ? COLORS.root : (COLORS[role] || COLORS.domain);

            // Draw shadow
            ctx.shadowColor = style.shadow;
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;

            // Draw node background
            ctx.fillStyle = style.bg;
            ctx.strokeStyle = style.border;
            ctx.lineWidth = 2;

            ctx.beginPath();
            const r = 16;
            const w = nodeWidth;
            const h = nodeHeight;
            ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
            ctx.fill();
            ctx.stroke();

            ctx.shadowColor = 'transparent';

            // Draw Icon area
            const iconSize = 24;
            ctx.fillStyle = isRoot ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.roundRect(x - w / 2 + 10, y - iconSize / 2, iconSize, iconSize, 8);
            ctx.fill();

            // Draw Icon (Emoji as placeholder for premium look)
            ctx.font = '14px serif';
            ctx.textAlign = 'center';
            ctx.fillText(ICON_MAP[role] || '🖥️', x - w / 2 + 10 + iconSize / 2, y + 5);

            // Draw Text
            ctx.fillStyle = style.text;
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(node.data?.label || '', x - w / 2 + 45, y + 0);

            if (node.data?.architecture_node_id && !isRoot) {
                ctx.fillStyle = style.text;
                ctx.font = 'bold 7px Inter, sans-serif';
                ctx.globalAlpha = 0.6;
                ctx.fillText('🔍 EXPLORE', x - w / 2 + 45, y + 12);
                ctx.globalAlpha = 1;
            } else if (isRoot) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 7px Inter, sans-serif';
                ctx.globalAlpha = 0.8;
                ctx.fillText('CORE SYSTEM', x - w / 2 + 45, y + 12);
                ctx.globalAlpha = 1;
            }
        });

        ctx.restore();
    }, [nodes, edges, transform, dimensions]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { offsetWidth: w, offsetHeight: h } = containerRef.current;
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = w * dpr;
                canvasRef.current.height = h * dpr;
                canvasRef.current.style.width = `${w}px`;
                canvasRef.current.style.height = `${h}px`;
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);
                setDimensions({ width: w, height: h });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        draw();
    }, [draw]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(transform.scale + delta, 0.2), 4);
        setTransform(prev => ({ ...prev, scale: newScale }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check for node clicks
        const worldX = (mouseX - dimensions.width / 2 - transform.x) / transform.scale;
        const worldY = (mouseY - dimensions.height / 2 - transform.y) / transform.scale;

        const clickedNode = [...nodes].reverse().find(node => {
            const nx = (node.position?.x || 0) * layoutScale;
            const ny = (node.position?.y || 0) * layoutScale;
            return (
                worldX >= nx - nodeWidth / 2 &&
                worldX <= nx + nodeWidth / 2 &&
                worldY >= ny - nodeHeight / 2 &&
                worldY <= ny + nodeHeight / 2
            );
        });

        if (clickedNode && clickedNode.data?.architecture_node_id && clickedNode.data?.role !== 'product') {
            onNodeClick(clickedNode.data.architecture_node_id);
            return;
        }

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

    const fitView = useCallback(() => {
        if (nodes.length === 0 || dimensions.width === 0) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(n => {
            const x = (n.position?.x || 0) * layoutScale;
            const y = (n.position?.y || 0) * layoutScale;
            minX = Math.min(minX, x - nodeWidth / 2);
            maxX = Math.max(maxX, x + nodeWidth / 2);
            minY = Math.min(minY, y - nodeHeight / 2);
            maxY = Math.max(maxY, y + nodeHeight / 2);
        });

        const padding = 100;
        const contentWidth = maxX - minX + padding;
        const contentHeight = maxY - minY + padding;

        const scaleX = dimensions.width / contentWidth;
        const scaleY = dimensions.height / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1.2);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setTransform({
            x: -centerX * newScale,
            y: -centerY * newScale,
            scale: newScale
        });
    }, [nodes, dimensions, layoutScale]);

    // Auto-fit on mount or when nodes change
    useEffect(() => {
        if (nodes.length > 0 && dimensions.width > 0) {
            fitView();
        }
    }, [nodes, dimensions.width, fitView]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white select-none">
            <canvas
                ref={canvasRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-50">
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 p-1.5 flex flex-col gap-1">
                    <button
                        onClick={() => setTransform(p => ({ ...p, scale: Math.min(p.scale + 0.2, 4) }))}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        title="Zoom In"
                    >
                        <Plus size={18} />
                    </button>
                    <div className="h-px bg-slate-100 mx-1" />
                    <button
                        onClick={() => setTransform(p => ({ ...p, scale: Math.max(p.scale - 0.2, 0.2) }))}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        title="Zoom Out"
                    >
                        <Minus size={18} />
                    </button>
                    <div className="h-px bg-slate-100 mx-1" />
                    <button
                        onClick={fitView}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        title="Fit View"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
