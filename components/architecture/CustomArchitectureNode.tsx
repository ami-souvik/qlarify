import React, { memo, useState } from 'react';
import { Database, Server, User, Globe, Laptop, Box, Layers, Activity, Lock, Unlock, Zap, Maximize } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';

const icons: Record<string, any> = {
    product: Box,
    domain: Layers,
    service: Server,
    database: Database,
    api: Activity,
    user: User,
    client: Laptop,
    external: Globe,
    queue: Box,
    infra: Zap
};

// Architecture V3 Custom Node
export const CustomArchitectureNode = memo(({ id, data }: { id: string, data: { label: string, role?: string, architecture_node_id?: string, locked?: boolean } }) => {
    // We could bring in architecture context if we need actions like "Zoom In" here.
    // For now, the Canvas handles click, but we can add specific buttons.
    const { zoomInto } = useArchitecture();
    const [hovered, setHovered] = useState(false);

    // Determine Role/Type either from data.role (standard) or infer from data (if we have architecture_node_id, it is drillable)
    const role = data.role || 'service';
    const Icon = icons[role] || Server;
    const canZoom = !!data.architecture_node_id;

    // Styling logic similar to V2 CustomNode
    const getColors = (role: string) => {
        switch (role) {
            case 'product': return 'bg-indigo-50 border-indigo-500 text-indigo-900';
            case 'domain': return 'bg-blue-50 border-blue-500 text-blue-900';
            case 'user': return 'bg-teal-50 border-teal-500 text-teal-800';
            case 'database': return 'bg-amber-50 border-amber-500 text-amber-900';
            case 'client': return 'bg-purple-50 border-purple-500 text-purple-900';
            case 'external': return 'bg-gray-50 border-gray-400 text-gray-700';
            default: return 'bg-white border-slate-300 text-slate-800';
        }
    }

    const colors = getColors(role);
    const lockedStyle = data.locked ? 'ring-2 ring-red-400 ring-offset-1' : '';

    return (
        <div
            className={`relative group px-4 py-3 shadow-lg rounded-xl border-2 min-w-[160px] flex items-center gap-3 transition-all hover:scale-105 hover:shadow-xl ${colors} ${lockedStyle}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Toolbar Overlay */}
            <div className={`absolute -top-10 right-0 bg-white shadow-lg rounded-lg p-1.5 flex gap-1 border border-slate-100 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-50`}>
                {canZoom && (
                    <button
                        onClick={(e) => { e.stopPropagation(); zoomInto(data.architecture_node_id!); }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 text-xs font-medium"
                        title="Zoom Into Component"
                    >
                        <Maximize size={12} /> Zoom
                    </button>
                )}
                {/* 
                  Future: Add Edit / Lock buttons here similar to V2. 
                  Currently V3 is largely generative/readonly for MVP.
                */}
            </div>

            {/* Mock Handles */}
            <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white" />
            <div className="absolute left-1/2 -top-[7px] -translate-x-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white" />

            {/* Content */}
            <div className="p-2 bg-white/60 rounded-lg backdrop-blur-sm">
                <Icon size={20} className="opacity-80" />
            </div>
            <div className="flex flex-col">
                <div className="font-bold text-sm leading-tight">{data.label}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">{role}</div>
            </div>

            {/* Outputs */}
            <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white" />
            <div className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-3 h-3 bg-slate-400 rounded-full border-2 border-white" />
        </div>
    );
});
