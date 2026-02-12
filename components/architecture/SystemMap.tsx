"use client";

import { useArchitecture } from "@/context/ArchitectureContext";
import { ArchitectureNode } from "@/types/architecture";
import { ChevronRight, ChevronDown, Box, Layers, Server, Database, Activity, Cpu, Zap, Radio, Trash2, MousePointer2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// Helper to pick icons with colors
const getIcon = (type: string) => {
    switch (type) {
        case 'product': return <Box className="h-3.5 w-3.5 text-indigo-600" />;
        case 'domain': return <Layers className="h-3.5 w-3.5 text-blue-600" />;
        case 'service': return <Server className="h-3.5 w-3.5 text-emerald-600" />;
        case 'database':
        case 'datastore': return <Database className="h-3.5 w-3.5 text-amber-600" />;
        case 'api': return <Activity className="h-3.5 w-3.5 text-rose-600" />;
        case 'event': return <Radio className="h-3.5 w-3.5 text-purple-600 font-bold" />;
        case 'infra': return <Zap className="h-3.5 w-3.5 text-yellow-600" />;
        default: return <Cpu className="h-3.5 w-3.5 text-slate-400" />;
    }
}

function TreeNode({ node, depth = 0 }: { node: ArchitectureNode; depth?: number }) {
    const { state, zoomInto } = useArchitecture();
    const [expanded, setExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const isActive = state.activeNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    // Mock Diff State (Determined by node.id for demo)
    const isNew = node.id.includes('new');
    const isChanged = node.id.includes('updated');

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        zoomInto(node.id);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        // Future: Show actual context menu
        console.log("Right click on", node.name);
    };

    return (
        <div style={{ marginLeft: `${depth > 0 ? 12 : 0}px` }} className="relative">
            <div
                className={`group flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all border border-transparent mb-0.5 ${isActive ? "bg-indigo-50 border-indigo-100 text-indigo-900 shadow-sm" :
                        isHovered ? "bg-slate-50 text-slate-900" : "text-slate-600"
                    } ${isNew ? 'bg-emerald-50/50 border-emerald-100' : ''} ${isChanged ? 'bg-amber-50/50 border-amber-100' : ''}`}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Expand/Collapse */}
                <div
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-400 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                >
                    {hasChildren ? (
                        expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                    ) : <div className="w-3" />}
                </div>

                {/* Icon & Label */}
                <span className="shrink-0">{getIcon(node.type)}</span>
                <span className={`text-[13px] truncate flex-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {node.name}
                    {isNew && <span className="ml-1.5 text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded font-bold uppercase">New</span>}
                </span>

                {/* Version Badge (Mock) */}
                {isActive && (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        v2
                    </span>
                )}

                {/* Hover Action Indicator */}
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                    <MousePointer2 size={10} className="text-slate-300" />
                </div>
            </div>

            <AnimatePresence>
                {expanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-l border-slate-100 ml-3.5 pl-1 overflow-hidden"
                    >
                        {node.children.map(child => (
                            <TreeNode key={child.id} node={child} depth={depth + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function SystemMap() {
    const { state } = useArchitecture();

    if (!state.root) {
        return (
            <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Layers className="text-slate-200" size={24} />
                </div>
                <p className="text-xs text-slate-400 font-medium italic">Empty Deterministic Model</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5 px-3 py-2 select-none">
            <TreeNode node={state.root} />
        </div>
    );
}
