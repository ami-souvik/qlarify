"use client";

import { useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { X, Check } from 'lucide-react';
import { DiagramProvider } from '@/lib/diagram-context';

const nodeTypes = {
    custom: CustomNode,
};

// Simple internal modal component
const EditNodeModal = ({
    isOpen,
    onClose,
    onSave,
    initialLabel,
    initialRole,
    mode
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (label: string, role: string) => void;
    initialLabel: string;
    initialRole: string;
    mode: 'edit' | 'add';
}) => {
    const [label, setLabel] = useState(initialLabel);
    const [role, setRole] = useState(initialRole);

    // Update local state when initial values change (modal opens)
    if (isOpen && label !== initialLabel && initialLabel !== '' && label === '') {
        setLabel(initialLabel);
        setRole(initialRole);
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white rounded-xl shadow-2xl w-80 p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900">{mode === 'edit' ? 'Edit Node' : 'Add Child Node'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            autoFocus
                            placeholder={mode === 'add' ? "New Service..." : "Node Label"}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Icon / Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {['user', 'client', 'service', 'database', 'external', 'queue', 'api'].map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={onClose} className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">
                            Cancel
                        </button>
                        <button onClick={() => onSave(label, role)} className="flex-1 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium flex justify-center items-center gap-2">
                            <Check size={14} /> {mode === 'edit' ? 'Save' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DiagramRendererProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onNodeUpdate: (id: string, data: { label?: string, role?: string, locked?: boolean, [key: string]: any }) => void;
    onNodeAdd: (parentId: string, label: string, role: string) => void;
    onNodeDelete: (id: string) => void;
    onInit?: (instance: any) => void;
    theme?: 'light' | 'dark' | 'neutral';
}

export default function DiagramRenderer({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeUpdate,
    onNodeAdd,
    onNodeDelete,
    onInit,
    theme = 'light'
}: DiagramRendererProps) {

    // Edit Modal State
    const [editModal, setEditModal] = useState<{ isOpen: boolean, nodeId: string, label: string, role: string, mode: 'edit' | 'add' }>({
        isOpen: false, nodeId: '', label: '', role: '', mode: 'edit'
    });

    const handleRequestEdit = useCallback((id: string, label: string, role: string) => {
        setEditModal({ isOpen: true, nodeId: id, label, role, mode: 'edit' });
    }, []);

    const handleAddNodeRequest = useCallback((parentId: string) => {
        setEditModal({ isOpen: true, nodeId: parentId, label: 'New Node', role: 'service', mode: 'add' });
    }, []);

    const handleModalSave = (newLabel: string, newRole: string) => {
        if (editModal.mode === 'edit') {
            onNodeUpdate(editModal.nodeId, { label: newLabel, role: newRole });
        } else {
            onNodeAdd(editModal.nodeId, newLabel, newRole);
        }
        setEditModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <DiagramProvider
            onNodeUpdate={onNodeUpdate}
            onDeleteNode={onNodeDelete}
            onAddNode={handleAddNodeRequest}
            onRequestEdit={handleRequestEdit}
            theme={theme}
        >
            <div className="relative w-full h-full min-h-[500px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onInit={onInit}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Controls showInteractive={false} />
                    <Background color="#cbd5e1" gap={16} />
                </ReactFlow>

                {editModal.isOpen && (
                    <EditNodeModal
                        isOpen={editModal.isOpen}
                        onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                        onSave={handleModalSave}
                        initialLabel={editModal.label}
                        initialRole={editModal.role}
                        mode={editModal.mode}
                    />
                )}
            </div>
        </DiagramProvider>
    );
}
