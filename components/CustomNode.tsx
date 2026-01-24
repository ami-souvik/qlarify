import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Server, User, Globe, Laptop, Box } from 'lucide-react';

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

export default memo(({ data }: { data: { label: string, role: string } }) => {
    const Icon = icons[data.role] || Server;

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
        <div className={`px-4 py-3 shadow-md rounded-lg border-2 min-w-[150px] flex items-center gap-3 transition-transform hover:scale-105 ${colors}`}>
            <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3" />
            <div className="p-2 bg-white/50 rounded-full">
                <Icon size={16} />
            </div>
            <div className="font-semibold text-sm">{data.label}</div>
            <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-3 !h-3" />
        </div>
    );
});
