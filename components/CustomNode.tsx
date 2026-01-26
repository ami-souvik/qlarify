import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Server, User, Globe, Laptop, Box, Trash2, Edit2, Plus, Lock, Unlock } from 'lucide-react';
import { useDiagram } from '@/lib/diagram-context';

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

export default memo(({ id, data }: { id: string, data: { label: string, role: string, locked?: boolean } }) => {
    const { onNodeUpdate, onDeleteNode, onAddNode, onRequestEdit, theme } = useDiagram();
    const Icon = icons[data.role] || Server;
    const [hovered, setHovered] = useState(false);

    // Color themes based on role and active theme
    const getColors = (role: string) => {
        if (theme === 'dark') {
            switch (role) {
                case 'user': return 'bg-slate-800 border-blue-500 text-blue-100';
                case 'database': return 'bg-slate-800 border-amber-500 text-amber-100';
                case 'client': return 'bg-slate-800 border-purple-500 text-purple-100';
                default: return 'bg-slate-900 border-slate-600 text-slate-200';
            }
        }
        if (theme === 'neutral') {
            return 'bg-white border-slate-400 text-slate-900';
        }
        // Light (Default)
        switch (role) {
            case 'user': return 'bg-blue-50 border-blue-400 text-blue-700';
            case 'database': return 'bg-amber-50 border-amber-400 text-amber-900';
            case 'client': return 'bg-purple-50 border-purple-400 text-purple-900';
            case 'external': return 'bg-gray-50 border-gray-400 text-gray-700';
            default: return 'bg-white border-slate-300 text-slate-800';
        }
    }

    const colors = getColors(data.role);
    const lockedStyle = data.locked ? 'ring-2 ring-red-400 ring-offset-1' : '';

    return (
        <div
            className={`relative group px-4 py-3 shadow-md rounded-lg border-2 min-w-[150px] flex items-center gap-3 transition-transform hover:scale-105 ${colors} ${lockedStyle}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Toolbar */}
            <div className={`absolute -top-12 right-0 bg-white shadow-lg rounded-lg p-1.5 flex gap-1 border border-slate-100 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-50`}>
                <button
                    onClick={(e) => { e.stopPropagation(); onNodeUpdate(id, { locked: !data.locked }); }}
                    className={`p-1.5 rounded transition-colors ${data.locked ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-slate-600'}`}
                    title={data.locked ? "Unlock Position" : "Lock Position"}
                >
                    {data.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>

                {!data.locked && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddNode(id); }}
                            className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Add Node"
                        >
                            <Plus size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRequestEdit(id, data.label, data.role); }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded"
                            title="Edit"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});
