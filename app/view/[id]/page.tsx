"use client";

import { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    Node,
    Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { useParams } from 'next/navigation';
import CustomNode from '@/components/CustomNode';
import CustomEdge from '@/components/CustomEdge';
import { DiagramProvider } from '@/lib/diagram-context';
import QlarifySvg from '@/components/QlarifySvg';
import QlarifyFlow from '@/components/canvas/QlarifyFlow';

export default function ViewDiagram() {
    const params = useParams();
    const id = params?.id as string;

    // In a real app, we would fetch the diagram by ID.
    // Since we don't have a real DB persistence layer for "saved" diagrams in this demo,
    // we will simulate by reading from localStorage or just using mock data.
    // BUT the user interaction flow likely implies we are *viewing* the current state.
    // However, usually "sharing" implies a persistent snapshot.
    // For this demo, let's try to load from localStorage with key `diagram-${id}` if you implemented save,
    // OR just show a static example if data is missing.
    //
    // WAIT: The prompt says "create a page... for clients to view".
    // I will build the page structure. 
    // Since I cannot modify the backend to save/load right now efficiently without user direction,
    // I will make it read from `localStorage` effectively or just receive data via props if this was a component.
    // But as a page, it needs to fetch.
    //
    // Let's assume for now the user will manually put data or we just show "No Data" if not found.
    // OR, better: `localStorage` "latestDiagram".

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDiagram = async () => {
            try {
                // In production, use standard fetch or axios
                const res = await axios.get(`/api/diagram?id=${id}`);
                if (res.status !== 200) throw new Error('Failed to fetch');
                const data = await res.data;

                setNodes(data.nodes || []);
                setEdges(data.edges || []);
            } catch (e) {
                console.error("Failed to load diagram", e);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDiagram();
        } else {
            setLoading(false);
        }
    }, [id]);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
    const edgeTypes = useMemo(() => ({ 'custom-edge': CustomEdge }), []);

    // Read-only handlers (empty)
    const noOp = () => { };

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Loading...</div>;

    // Transform nodes to be non-draggable and non-connectable for view mode
    const viewNodes = nodes.map(n => ({
        ...n,
        draggable: false,
        connectable: false,
        data: {
            ...n.data,
            // Hide toolbar if it relies on this, or we rely on CSS to hide actions
            // The CustomNode component likely checks for `selected` or hover. 
            // We can pass a flag `readOnly: true` in data if we modify CustomNode, 
            // OR just rely on the fact that `onNodeUpdate` will be a no-op so they can't do anything.
            // Better: context based read-only.
        }
    }));

    const viewEdges = edges.map((e, idx) => ({
        ...e,
        id: `${e.source}-${e.target}-${idx}`, // Ensure unique ID for view
        animated: true, // Keep animation if desired
        data: {
            ...e.data,
            // Remove delete handler or pass no-op
            onDelete: undefined,
            onLabelChange: undefined,
            readOnly: true // Flag to disable hover actions
        }
    }));

    return (
        <div className="w-screen h-screen bg-slate-50">

            <DiagramProvider
                onNodeUpdate={noOp}
                onDeleteNode={noOp}
                onAddNode={noOp}
                onRequestEdit={noOp}
                onRequestEdgeEdit={noOp}
                theme="light"
            >
                <QlarifyFlow
                    nodes={nodes.map(n => ({ ...n, position: n.position, data: n.data, id: n.id, type: n.type }))}
                    edges={edges as any[]}
                    nodeTypes={nodeTypes}
                    className="bg-slate-50"
                />
            </DiagramProvider>
            {/* Read-Only Badge */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-semibold text-slate-500 z-10 pointer-events-none">
                View Only
            </div>

            {/* Company Logo */}
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md border border-slate-200/50 px-2 py-1 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
                        <QlarifySvg bgColor="indigo-600" className="w-6 h-6 p-0.5 rounded-lg text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900">Qlarify</span>
                </div>
            </div>
        </div>
    );
}
