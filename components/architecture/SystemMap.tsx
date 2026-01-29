"use client";

import { useArchitecture } from "@/context/ArchitectureContext";
import { ArchitectureNode } from "@/types/architecture";
import { ChevronRight, ChevronDown, Box, Layers, Server, Database, Activity, Cpu } from "lucide-react";
import { useState } from "react";

// Helper to pick icons
const getIcon = (type: string) => {
    switch (type) {
        case 'product': return <Box className="h-4 w-4" />;
        case 'domain': return <Layers className="h-4 w-4" />;
        case 'service': return <Server className="h-4 w-4" />;
        case 'database': return <Database className="h-4 w-4" />;
        case 'api': return <Activity className="h-4 w-4" />;
        default: return <Cpu className="h-4 w-4" />;
    }
}

function TreeNode({ node, depth = 0 }: { node: ArchitectureNode; depth?: number }) {
    const { state, zoomInto } = useArchitecture();
    const [expanded, setExpanded] = useState(true);

    const isActive = state.activeNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        zoomInto(node.id);
    };

    return (
        <div style={{ marginLeft: `${depth * 8}px` }}>
            <div
                className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-slate-50 text-slate-600"
                    }`}
                onClick={handleClick}
            >
                <div
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                >
                    {hasChildren ? (
                        expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                    ) : <span className="w-3 block" />}
                </div>

                <span className="opacity-70">{getIcon(node.type)}</span>
                <span className="text-sm truncate">{node.name}</span>
            </div>

            {expanded && hasChildren && (
                <div className="border-l border-slate-100 ml-3">
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function SystemMap() {
    const { state } = useArchitecture();

    if (!state.root) {
        return (
            <div className="p-4 text-xs text-slate-400 italic text-center">
                Empty System
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 p-2 overflow-y-auto max-h-full">
            <TreeNode node={state.root} />
        </div>
    );
}
