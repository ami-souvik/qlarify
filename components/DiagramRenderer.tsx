"use client";

import { useEffect } from 'react';
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

const nodeTypes = {
    custom: CustomNode,
};

interface DiagramData {
    nodes: { id: string, label: string, role: string }[];
    edges: { from: string, to: string, label?: string }[];
    layoutHints?: { direction: string };
}

export default function DiagramRenderer({ data }: { data: DiagramData | null }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!data) return;

        const initialNodes: Node[] = data.nodes.map(n => ({
            id: n.id,
            type: 'custom',
            data: { label: n.label, role: n.role },
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
    }, [data, setNodes, setEdges]);

    // If no data, show empty state or placeholder? 
    // Actually, we'll just render empty flow.

    return (
        <div className="w-full h-full min-h-[500px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls showInteractive={false} />
                <Background color="#cbd5e1" gap={16} />
            </ReactFlow>
        </div>
    );
}
