"use client";

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { getLayoutedElements } from '@/lib/utils';
import { X, Check } from 'lucide-react';

const nodeTypes = {
    custom: CustomNode,
};

interface DiagramData {
    nodes: { id: string, label: string, role: string }[];
    edges: { from: string, to: string, label?: string }[];
    layoutHints?: { direction: string };
}

// Simple internal modal component to avoid complex UI library dependencies
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

    useEffect(() => {
        setLabel(initialLabel);
        setRole(initialRole);
    }, [initialLabel, initialRole, isOpen]);

    if (!isOpen) return null;

    const roles = ['user', 'client', 'server', 'database', 'external', 'queue', 'api'];

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
                            placeholder={mode === 'add' ? "New Service..." : ""}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Icon / Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {roles.map(r => (
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

export default function DiagramRenderer({ data, onInit }: { data: DiagramData | null, onInit?: (instance: any) => void }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Edit Modal State
    const [editModal, setEditModal] = useState<{ isOpen: boolean, nodeId: string, label: string, role: string, mode: 'edit' | 'add' }>({
        isOpen: false, nodeId: '', label: '', role: '', mode: 'edit'
    });

    const handleEditNode = useCallback((id: string, label: string, role: string) => {
        setEditModal({ isOpen: true, nodeId: id, label, role, mode: 'edit' });
    }, []);

    const handleAddNode = useCallback((parentId: string) => {
        setEditModal({ isOpen: true, nodeId: parentId, label: 'New Node', role: 'service', mode: 'add' });
    }, []);

    const handleDeleteNode = useCallback((id: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    }, [setNodes, setEdges]);

    const handleSaveNode = (newLabel: string, newRole: string) => {
        if (editModal.mode === 'edit') {
            setNodes((nds) => nds.map((n) => {
                if (n.id === editModal.nodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: newLabel,
                            role: newRole
                        }
                    };
                }
                return n;
            }));
        } else {
            // Add Mode
            const newId = `node-${Date.now()}`;
            const newNode: Node = {
                id: newId,
                type: 'custom',
                data: {
                    label: newLabel,
                    role: newRole,
                    onEdit: handleEditNode,
                    onDelete: handleDeleteNode,
                    onAdd: handleAddNode
                },
                position: { x: 0, y: 0 }
            };

            const newEdge: Edge = {
                id: `edge-${editModal.nodeId}-${newId}`,
                source: editModal.nodeId,
                target: newId,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                animated: true,
                style: { stroke: '#64748b', strokeWidth: 2 },
                labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 12 },
            };

            // Apply layout to new nodes
            // We use a timeout to let state update first or we can compute layout immediately on previous state + new node
            // Computing immediately is safer.
            setNodes((prevNodes) => {
                // We need edges too to compute layout.
                // This is tricky inside a setState callback if we don't have access to current edges.
                // We will just add the node and let a separate effect or the user arrange it?
                // Or we can assume 'edges' from the outer scope is relatively fresh or use a ref.
                // Let's just add it for now at 0,0 and see if we can trigger layout.
                return [...prevNodes, newNode];
            });

            setEdges((prevEdges) => {
                const updatedEdges = [...prevEdges, newEdge];
                // HACK: Trigger layout update after a brief delay to allow nodes to settle
                setTimeout(() => {
                    setNodes(nds => {
                        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(nds, updatedEdges, 'LR');
                        return lNodes;
                    });
                    setEdges(eds => updatedEdges);
                }, 50);
                return updatedEdges;
            });
        }
        setEditModal(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        if (!data) return;

        const initialNodes: Node[] = data.nodes.map(n => ({
            id: n.id,
            type: 'custom',
            data: {
                label: n.label,
                role: n.role,
                onEdit: handleEditNode,
                onDelete: handleDeleteNode,
                onAdd: handleAddNode
            },
            position: { x: 0, y: 0 }
        }));

        const initialEdges: Edge[] = data.edges.map(e => ({
            id: `${e.from}-${e.to}`,
            source: e.from,
            target: e.to,
            label: e.label,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
            labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 12 },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges,
            data.layoutHints?.direction || 'LR'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [data, setNodes, setEdges, handleEditNode, handleDeleteNode]);

    return (
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

            {/* Render Edit Modal inside the container so it's positioned relative to the flow area */}
            <EditNodeModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveNode}
                initialLabel={editModal.label}
                initialRole={editModal.role}
                mode={editModal.mode}
            />
        </div>
    );
}
