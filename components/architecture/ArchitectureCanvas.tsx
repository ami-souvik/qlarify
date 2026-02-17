"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, useNodesState, useEdgesState, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';

import { useArchitecture } from '@/context/ArchitectureContext';
import { InfoIcon, Loader2, Plus } from 'lucide-react';
import { CustomArchitectureNode } from './CustomArchitectureNode';
import { StrategicMindmap } from './StrategicMindmap';

const nodeTypes = {
    default: CustomArchitectureNode, // Override default for consistent look
    custom: CustomArchitectureNode
};

function LegendItem({ dot, label }: { dot: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
            <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{label}</span>
        </div>
    );
}

export function ArchitectureCanvas() {
    const { state, updateActiveDiagram, zoomInto, addChildNode, findNode } = useArchitecture();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const legendRef = useRef<HTMLDivElement>(null);
    const infoButtonRef = useRef<HTMLDivElement>(null);

    // Handle Click Outside Legend
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                legendRef.current &&
                !legendRef.current.contains(event.target as any) &&
                infoButtonRef.current &&
                !infoButtonRef.current.contains(event.target as any)
            ) {
                setShowLegend(false);
            }
        }

        if (showLegend) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showLegend]);

    // Sync Canvas with Context State when activeNode changes
    useEffect(() => {
        if (state.activeNodeId && state.root) {
            const activeNode = findNode(state.activeNodeId);
            if (activeNode && activeNode.diagram) {
                let filteredNodes = activeNode.diagram.nodes || [];
                let filteredEdges = activeNode.diagram.edges || [];

                // "Strategic mindmap (High Level)" filtering
                // Only show: Product, Domains, Personas (user), External Systems
                // Hide: services, APIs, DBs
                // This applies to the top level (breadcrumbs.length === 1) or when explicitly in a high-level view
                if (state.breadcrumbs.length === 1) {
                    const allowedRoles = ['product', 'domain', 'user', 'external'];
                    filteredNodes = filteredNodes.filter(node => {
                        const role = node.data?.role || 'service';
                        return allowedRoles.includes(role);
                    });

                    // Only keep edges where BOTH source and target are visible
                    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
                    filteredEdges = filteredEdges.filter(edge =>
                        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
                    );
                }

                setNodes(filteredNodes);
                setEdges(filteredEdges);
            } else if (activeNode && !activeNode.diagram) {
                // If no diagram exists, we should probably generate one?
                // For now, clear canvas.
                setNodes([]);
                setEdges([]);
            }
        }
    }, [state.activeNodeId, state.root, state.breadcrumbs.length, findNode, setNodes, setEdges]);

    // Save changes back to context whenever nodes/edges change (handled carefully to avoid loops)
    // Actually, we should probably only save on explicit actions or debounced.
    // For V1 of V3, let's keep it read-only mostly from the canvas side unless dragged.
    const onNodeDragStop = useCallback((event: any, node: Node) => {
        // Update the context with new position
        if (state.activeNodeId) {
            const updatedNodes = nodes.map(n => n.id === node.id ? node : n);
            updateActiveDiagram(updatedNodes, edges);
        }
    }, [nodes, edges, state.activeNodeId, updateActiveDiagram]);


    // Handle Node Click -> "Zoom In" Request
    const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
        // If this node represents a child component (domain, service, etc), we can zoom
        if (node.data && node.data.architecture_node_id) {
            const childId = node.data.architecture_node_id;
            // Check if this child already exists in tree
            const existingChild = findNode(childId);

            if (existingChild) {
                zoomInto(childId);
            } else {
                // Component exists in diagram but NOT in tree?
                // This implies we need to generate it.
                setIsLoading(true);
                try {
                    const activeNode = findNode(state.activeNodeId!);

                    // Helper: Generate Context
                    const contextPayload = {
                        root_summary: state.root?.explanation || "",
                        parent_path: state.breadcrumbs.map(b => b.name)
                    };

                    const res = await fetch('/api/v2/architecture', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            intent: 'zoom',
                            level: node.data.role || 'service', // guess level?
                            user_input: node.data.name, // "Auth Service"
                            context_node_id: childId, // "auth_service"
                            current_architecture_context: contextPayload
                        })
                    });

                    if (!res.ok || !res.body) throw new Error(res.statusText);

                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let accumulatedJson = "";
                    let buffer = "";

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n\n');
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.replace('data: ', '').trim();
                                if (dataStr === '[DONE]') break;

                                try {
                                    const data = JSON.parse(dataStr);
                                    if (data.type === 'content') {
                                        accumulatedJson += data.text || "";
                                    }
                                    if (data.error) {
                                        throw new Error(data.error);
                                    }
                                } catch (e) {
                                    console.error("Error parsing SSE data", e);
                                }
                            }
                        }
                    }

                    if (accumulatedJson) {
                        const data = JSON.parse(accumulatedJson);
                        if (data.architecture_node) {
                            addChildNode(state.activeNodeId!, data.architecture_node);
                            zoomInto(data.architecture_node.id);
                        }
                    }
                } catch (err) {
                    console.error("Zoom Gen Failed", err);
                } finally {
                    setIsLoading(false);
                }
            }
        }
    }, [state.activeNodeId, state.breadcrumbs, state.root, findNode, addChildNode, zoomInto]);

    if (!state.activeNodeId) {
        return (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
                Select a node to view architecture.
            </div>
        );
    }

    const isStrategicView = state.breadcrumbs.length === 1;

    return (
        <div className="h-full w-full relative">
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="text-sm font-medium text-slate-600">Architecting...</span>
                    </div>
                </div>
            )}

            {isStrategicView ? (
                <StrategicMindmap onNodeClick={(id) => zoomInto(id)} />
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDragStop={onNodeDragStop}
                    onNodeClick={onNodeClick}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    className="bg-slate-50"
                >
                    <Background color="#cbd5e1" gap={20} />
                    <Controls />
                </ReactFlow>
            )}

            {/* Perspective Overlay */}
            {state.breadcrumbs.length === 1 && (
                <>
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Strategic Mindmap <span className="text-slate-300 ml-1 font-medium">High Level</span>
                            </span>
                            <div
                                ref={infoButtonRef}
                                className={`p-1 rounded-full transition-colors cursor-pointer ${showLegend ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                                onClick={() => setShowLegend(!showLegend)}
                            >
                                <InfoIcon className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    {showLegend && (
                        <div
                            ref={legendRef}
                            className="absolute top-16 left-4 z-10 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-3 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[180px]">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 pb-1 border-b border-slate-100">
                                    Ecosystem Legend
                                </span>
                                <LegendItem dot="#6366f1" label="Product Core" />
                                <LegendItem dot="#3b82f6" label="System Domains" />
                                <LegendItem dot="#14b8a6" label="User Personas" />
                                <LegendItem dot="#94a3b8" label="External Systems" />
                                <div className="mt-1 pt-2 border-t border-slate-50">
                                    <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                                        This view shows high-level strategic relationships between core actors and domains.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
