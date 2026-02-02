"use client";

import React, { useCallback } from 'react';
import { ChevronRight, Database, Globe, Server, Layers, Box } from 'lucide-react';

interface ArchitectureNode {
    id: string;
    name: string;
    type: 'system' | 'domain' | 'service' | 'database' | 'api' | 'queue';
    children?: ArchitectureNode[];
    description?: string;
}

interface QlarifyArchitectProps {
    data: ArchitectureNode; // Root node
    activeNodeId?: string;
    onNodeClick?: (nodeId: string) => void;
    className?: string;
}

// Map types to icons
const getIcon = (type: string) => {
    switch (type) {
        case 'system': return Globe;
        case 'domain': return Layers;
        case 'service': return Server;
        case 'database': return Database;
        case 'api': return Box;
        default: return Box;
    }
};

const getColors = (type: string) => {
    switch (type) {
        case 'system': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
        case 'domain': return 'bg-purple-50 border-purple-200 text-purple-700';
        case 'service': return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'database': return 'bg-amber-50 border-amber-200 text-amber-700';
        default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
};

export default function QlarifyArchitect({
    data,
    activeNodeId,
    onNodeClick,
    className
}: QlarifyArchitectProps) {
    if (!data) return null;

    // Recursive Tree Renderer
    const renderTree = (node: ArchitectureNode, depth: number = 0) => {
        const Icon = getIcon(node.type);
        const colorClass = getColors(node.type);
        const isActive = activeNodeId === node.id;

        return (
            <div key={node.id} className="relative">
                {/* Connector Line if depth > 0 */}
                {depth > 0 && (
                    <div className="absolute -left-6 top-6 w-6 h-[1px] bg-slate-200 pointer-events-none" />
                )}
                {/* Vertical Line Connector from parent */}
                {/* This would be handled by the parent's container usually if using flex/grid properly or SVG lines.
                     For a simple vertical list implementation: */}

                <div
                    onClick={(e) => { e.stopPropagation(); onNodeClick?.(node.id); }}
                    className={`
                        relative flex items-center gap-3 p-3 rounded-lg border shadow-sm cursor-pointer transition-all
                        ${colorClass}
                        ${isActive ? 'ring-2 ring-offset-2 ring-indigo-500' : 'hover:shadow-md'}
                        w-full max-w-md
                    `}
                >
                    <div className="shrink-0 p-1.5 bg-white/50 rounded-md">
                        <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{node.name}</h4>
                        {node.description && <p className="text-[10px] opacity-80 truncate">{node.description}</p>}
                    </div>
                </div>

                {/* Children */}
                {node.children && node.children.length > 0 && (
                    <div className="ml-8 pl-6 border-l border-slate-200 mt-4 space-y-4 relative">
                        {node.children.map(child => renderTree(child, depth + 1))}
                    </div>
                )}

                {/* Visual Connector for children (add button or drop zone could go here) */}
            </div>
        );
    };

    return (
        <div className={`p-8 bg-white overflow-auto ${className}`}>
            <div className="max-w-3xl mx-auto">
                {/* Title / Legend */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">System Architecture View</h2>
                    <div className="flex gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Globe size={10} /> System</span>
                        <span className="flex items-center gap-1"><Server size={10} /> Service</span>
                        <span className="flex items-center gap-1"><Database size={10} /> Data</span>
                    </div>
                </div>

                {renderTree(data)}
            </div>
        </div>
    );
}
