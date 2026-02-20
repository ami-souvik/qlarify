"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Panel,
    NodeProps,
    Handle,
    Position,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, StickyNote as StickyNoteIcon, Type, Image as ImageIcon, FileText, GripHorizontal, Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// Tiptap Editor Header/Toolbar Component
const TiptapToolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex gap-1 mb-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded hover:bg-white transition-colors ${editor.isActive('bold') ? 'bg-white text-terracotta shadow-sm' : 'text-slate-500'}`}
                title="Bold"
            >
                <Bold size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded hover:bg-white transition-colors ${editor.isActive('italic') ? 'bg-white text-terracotta shadow-sm' : 'text-slate-500'}`}
                title="Italic"
            >
                <Italic size={14} />
            </button>
            <div className="w-px bg-gray-300 mx-1" />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded hover:bg-white transition-colors ${editor.isActive('bulletList') ? 'bg-white text-terracotta shadow-sm' : 'text-slate-500'}`}
                title="Bullet List"
            >
                <List size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1 rounded hover:bg-white transition-colors ${editor.isActive('orderedList') ? 'bg-white text-terracotta shadow-sm' : 'text-slate-500'}`}
                title="Numbered List"
            >
                <ListOrdered size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1 rounded hover:bg-white transition-colors ${editor.isActive('blockquote') ? 'bg-white text-terracotta shadow-sm' : 'text-slate-500'}`}
                title="Quote"
            >
                <Quote size={14} />
            </button>
        </div>
    );
};

// Tiptap Editor Component
const TiptapEditor = ({ content, onChange, isEditing }: { content: string, onChange: (html: string) => void, isEditing: boolean }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write something extraordinary…',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable: isEditing,
    });

    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [isEditing, editor]);

    if (!editor) return null;

    return (
        <div className="w-full">
            {isEditing && <TiptapToolbar editor={editor} />}
            <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none min-h-[150px] tiptap-editor" />
            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .tiptap focus {
                    outline: none;
                }
                .tiptap-editor .ProseMirror {
                    min-height: 150px;
                    outline: none;
                }
            `}</style>
        </div>
    );
};

// Custom Sticky Note Node
const StickyNoteNode = ({ data, selected }: NodeProps) => {
    return (
        <div
            className={`shadow-lg rounded-xl p-4 w-64 min-h-64 flex flex-col transition-all duration-200 group ${selected ? 'ring-2 ring-terracotta translate-y-[-2px]' : 'hover:shadow-xl'
                }`}
            style={{ backgroundColor: data.color || '#fff7ed' }}
        >
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <textarea
                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-charcoal font-medium text-lg placeholder:text-charcoal/30 leading-relaxed"
                placeholder="Write your idea..."
                defaultValue={data.label}
                onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking text area
            />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

// Tiptap Document Node
const MarkdownNode = ({ data, selected }: NodeProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(data.title || "Untitled Document");
    const [content, setContent] = useState(data.content || "");

    const handleContentChange = (html: string) => {
        setContent(html);
        // data.content = html;
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    return (
        <div
            className={`shadow-xl rounded-2xl bg-white border border-gray-200 w-[400px] min-h-[350px] flex flex-col overflow-hidden transition-all duration-300 ${selected ? 'ring-2 ring-terracotta shadow-2xl translate-y-[-2px]' : 'hover:shadow-2xl'
                }`}
            onDoubleClick={() => setIsEditing(true)}
        >
            <Handle type="target" position={Position.Top} className="opacity-0" />

            {/* Header / Drag Handle */}
            <div className="h-12 border-b border-gray-100 bg-gray-50/50 flex items-center px-4 gap-3 drag-handle cursor-grab active:cursor-grabbing">
                <FileText size={16} className="text-terracotta" />
                <input
                    className="bg-transparent border-none text-sm font-black text-charcoal flex-1 focus:ring-0 p-0 uppercase tracking-wider"
                    value={title}
                    onChange={handleTitleChange}
                    onMouseDown={(e) => e.stopPropagation()}
                />
                {isEditing && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                        className="text-[10px] font-black uppercase tracking-widest text-white bg-charcoal hover:bg-terracotta px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[600px] scrollbar-hide">
                <TiptapEditor
                    content={content}
                    onChange={handleContentChange}
                    isEditing={isEditing}
                />
            </div>

            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

const nodeTypes = {
    stickyNote: StickyNoteNode,
    markdownVal: MarkdownNode
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'stickyNote',
        position: { x: 100, y: 100 },
        data: { label: 'Brainstorming Session\n\n- Improved User Flow\n- Better Performance\n- New Features', color: '#fef3c7' },
    },
];

export function BrainstormingCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const addNote = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fee2e2', '#f3e8ff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newNode: Node = {
            id,
            type: 'stickyNote',
            position: {
                x: Math.random() * 400 + 100,
                y: Math.random() * 400 + 100,
            },
            data: { label: '', color: randomColor },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const addDocument = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNode: Node = {
            id,
            type: 'markdownVal',
            position: {
                x: Math.random() * 400 + 100,
                y: Math.random() * 400 + 100,
            },
            data: { title: 'New Document', content: '<h1>New Document</h1><p>Start typing here...</p>' },
            dragHandle: '.drag-handle', // Only draggable by header
        };
        setNodes((nds) => nds.concat(newNode));
    }

    return (
        <div className="w-full h-full bg-[#F8F9FA]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-dot-pattern"
                minZoom={0.1}
            >
                <Background color="#ccc" gap={20} size={1} />
                <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />

                <Panel position="top-center" className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border border-gray-100 flex gap-2">
                    <button
                        onClick={addNote}
                        className="p-3 hover:bg-orange-50 text-slate-600 hover:text-terracotta rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[4rem]"
                    >
                        <StickyNoteIcon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Note</span>
                    </button>
                    <div className="w-px bg-gray-200 my-2"></div>
                    <button
                        onClick={addDocument}
                        className="p-3 hover:bg-orange-50 text-slate-600 hover:text-terracotta rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[4rem]"
                    >
                        <FileText size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Doc</span>
                    </button>
                    <button className="p-3 hover:bg-orange-50 text-slate-600 hover:text-terracotta rounded-xl transition-colors flex flex-col items-center gap-1 min-w-[4rem]">
                        <ImageIcon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Image</span>
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
