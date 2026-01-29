"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, useNodesState, useEdgesState, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';

import { useArchitecture } from '@/context/ArchitectureContext';
import { Loader2, Plus } from 'lucide-react';
import { CustomArchitectureNode } from './CustomArchitectureNode';

const nodeTypes = {
    default: CustomArchitectureNode, // Override default for consistent look
    custom: CustomArchitectureNode
};

export function ArchitectureCanvas() {
    const { state, updateActiveDiagram, zoomInto, addChildNode, findNode } = useArchitecture();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Sync Canvas with Context State when activeNode changes
    useEffect(() => {
        if (state.activeNodeId && state.root) {
            const activeNode = findNode(state.activeNodeId);
            if (activeNode && activeNode.diagram) {
                setNodes(activeNode.diagram.nodes || []);
                setEdges(activeNode.diagram.edges || []);
            } else if (activeNode && !activeNode.diagram) {
                // If no diagram exists, we should probably generate one?
                // For now, clear canvas.
                setNodes([]);
                setEdges([]);
            }
        }
    }, [state.activeNodeId, state.root, findNode, setNodes, setEdges]);

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
                            user_input: node.label, // "Auth Service"
                            context_node_id: childId, // "auth_service"
                            current_architecture_context: contextPayload
                        })
                    });

                    const data = await res.json();
                    if (data.architecture_node) {
                        addChildNode(state.activeNodeId!, data.architecture_node);
                        zoomInto(data.architecture_node.id);
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

            {/* Absolute overlay for "Action" on current view? e.g. "Auto-Layout" or "Add Item" */}
        </div>
    );
}
