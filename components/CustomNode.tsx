import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Server, User, Globe, Laptop, Box, Trash2, Edit2, Plus } from 'lucide-react';

const icons: Record<string, any> = {
    database: Database,
    service: Server,
    user: User,
    client: Laptop,
    external: Globe,
    queue: Box,
    ui: Laptop,
    api: Server
};

export default memo(({ id, data }: { id: string, data: { label: string, role: string, onEdit?: (id: string, label: string, role: string) => void, onDelete?: (id: string) => void, onAdd?: (id: string) => void } }) => {
    const Icon = icons[data.role] || Server;
    const [hovered, setHovered] = useState(false);

    // Color themes based on role
    const getColors = (role: string) => {
        switch (role) {
            case 'user': return 'bg-blue-50 border-blue-400 text-blue-700';
            case 'database': return 'bg-amber-50 border-amber-400 text-amber-900';
            case 'client': return 'bg-purple-50 border-purple-400 text-purple-900';
            case 'external': return 'bg-gray-50 border-gray-400 text-gray-700';
            default: return 'bg-white border-slate-300 text-slate-800';
        }
    }

    const colors = getColors(data.role);

    return (
        <div
            className={`relative group px-4 py-3 shadow-md rounded-lg border-2 min-w-[150px] flex items-center gap-3 transition-transform hover:scale-105 ${colors}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Toolbar */}
            <div className={`absolute -top-10 right-0 bg-white shadow-lg rounded-lg p-1.5 flex gap-1 border border-slate-100 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); data.onAdd?.(id); }}
                    className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Add Node"
                >
                    <Plus size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); data.onEdit?.(id, data.label, data.role); }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded"
                    title="Edit"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); data.onDelete?.(id); }}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3" />
            <div className="p-2 bg-white/50 rounded-full">
                <Icon size={16} />
            </div>
            <div className="font-semibold text-sm">{data.label}</div>
            <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-3 !h-3" />
        </div>
    );
});
