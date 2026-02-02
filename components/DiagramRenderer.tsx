"use client";

import { useState, useCallback } from 'react';
import {
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect
} from 'reactflow';
import QlarifyFlow from './canvas/QlarifyFlow';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { X, Check, Download, Image as ImageIcon, FileCode } from 'lucide-react';
import { DiagramProvider } from '@/lib/diagram-context';
import { toPng, toSvg } from 'html-to-image';

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    'custom-edge': CustomEdge,
};

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
    mode: 'edit' | 'add' | 'edit-edge';
}) => {
    const [label, setLabel] = useState(initialLabel);
    const [role, setRole] = useState(initialRole);

    if (isOpen && label !== initialLabel && initialLabel !== '' && label === '') {
        setLabel(initialLabel);
        setRole(initialRole);
    }

    const title = mode === 'edit' ? 'Edit Node' : mode === 'add' ? 'Add Child Node' : 'Edit Edge Label';
    const placeholder = mode === 'edit-edge' ? 'Edge Label' : (mode === 'add' ? "New Service..." : "Node Label");

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white rounded-xl shadow-2xl w-80 p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900">{title}</h3>
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
                            placeholder={placeholder}
                        />
                    </div>

                    {mode !== 'edit-edge' && (
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
                    )}

                    <div className="flex gap-2 pt-2">
                        <button onClick={onClose} className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">
                            Cancel
                        </button>
                        <button onClick={() => onSave(label, role)} className="flex-1 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium flex justify-center items-center gap-2">
                            <Check size={14} /> {mode === 'edit' || mode === 'edit-edge' ? 'Save' : 'Add'}
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
    onEdgeUpdate: (id: string, label: string) => void;
    onInit?: (instance: any) => void;
    onConnect: OnConnect;
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
    onEdgeUpdate,
    onInit,
    onConnect,
    theme = 'light'
}: DiagramRendererProps) {

    // Edit Modal State
    const [editModal, setEditModal] = useState<{ isOpen: boolean, nodeId: string, label: string, role: string, mode: 'edit' | 'add' | 'edit-edge' }>({
        isOpen: false, nodeId: '', label: '', role: '', mode: 'edit'
    });

    const handleRequestEdit = useCallback((id: string, label: string, role: string) => {
        setEditModal({ isOpen: true, nodeId: id, label, role, mode: 'edit' });
    }, []);

    const handleRequestEdgeEdit = useCallback((id: string, label: string) => {
        setEditModal({ isOpen: true, nodeId: id, label, role: 'default', mode: 'edit-edge' });
    }, []);

    const handleAddNodeRequest = useCallback((parentId: string) => {
        setEditModal({ isOpen: true, nodeId: parentId, label: 'New Node', role: 'service', mode: 'add' });
    }, []);

    const handleModalSave = (newLabel: string, newRole: string) => {
        if (editModal.mode === 'edit') {
            onNodeUpdate(editModal.nodeId, { label: newLabel, role: newRole });
        } else if (editModal.mode === 'add') {
            onNodeAdd(editModal.nodeId, newLabel, newRole);
        } else if (editModal.mode === 'edit-edge') {
            onEdgeUpdate(editModal.nodeId, newLabel);
        }
        setEditModal(prev => ({ ...prev, isOpen: false }));
    };

    const downloadImage = async (format: 'png' | 'svg') => {
        const element = document.getElementById('qlarify-flow-content');
        if (!element) return;

        try {
            const dataUrl = format === 'png'
                ? await toPng(element, { backgroundColor: '#f8fafc' })
                : await toSvg(element, { backgroundColor: '#f8fafc' });

            const link = document.createElement('a');
            link.download = `qlarify-diagram.${format}`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    return (
        <DiagramProvider
            onNodeUpdate={onNodeUpdate}
            onDeleteNode={onNodeDelete}
            onAddNode={handleAddNodeRequest}
            onRequestEdit={handleRequestEdit}
            onRequestEdgeEdit={handleRequestEdgeEdit}
            theme={theme}
        >
            <div className="relative w-full h-full min-h-[500px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
                {/* Download Controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => downloadImage('png')}
                        className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        title="Download PNG"
                    >
                        <ImageIcon size={18} />
                    </button>
                    <button
                        onClick={() => downloadImage('svg')}
                        className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        title="Download SVG"
                    >
                        <FileCode size={18} />
                    </button>
                </div>

                {/* Replaced ReactFlow with QlarifyFlow */}
                <QlarifyFlow
                    nodes={nodes.map(n => ({ ...n, position: n.position, data: n.data, id: n.id, type: n.type }))}
                    edges={edges as any[]}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    className="bg-slate-50"
                />

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
