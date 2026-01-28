"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from "next-auth/react";
import { Asterisk, ArrowRight, X, Layout, Download, Share2, Loader2, Check, Zap, Share, Star } from 'lucide-react';
import DiagramRenderer from '@/components/DiagramRenderer';
import VisualControls from '@/components/VisualControls';
import BlogPreviewSection from '@/components/BlogPreviewSection';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng, toSvg } from 'html-to-image';
import { getRectOfNodes, getTransformForBounds, useNodesState, useEdgesState, Node, Edge, MarkerType, addEdge, Connection } from 'reactflow';
import { getLayoutedElements } from '@/lib/utils';
import LZString from 'lz-string';
import LoggedInBadge from '@/components/LoggedInBadge';
import QlarifyLogo from '@/components/QlarifyLogo';

const SAMPLE_INPUT = `User visits the landing page.
Frontend loads assets from CDN.
User submits email form.
API validates the email address.
Database saves the contact info.
System sends a welcome email via SMTP service.`;

export default function Home() {
  const { data: session } = useSession();
  const toolRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  // Activity History: { type, content, timestamp }
  const [activityHistory, setActivityHistory] = useState<Array<{ type: 'user' | 'system' | 'add' | 'action' | 'delete', content: string, timestamp: number }>>([]);

  // ReactFlow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState('LR');
  const [viewMode, setViewMode] = useState<'client' | 'dev'>('dev');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [pendingAction, setPendingAction] = useState<'download' | 'share' | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null); // State for ReactFlow instance
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for shared URL params
    const searchParams = new URLSearchParams(window.location.search);
    const sharedState = searchParams.get('state');
    const sharedDesc = searchParams.get('description');

    if (sharedState) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedState);
        if (decompressed) {
          const flow = JSON.parse(decompressed);
          if (flow.nodes && flow.edges) {
            setNodes(flow.nodes);
            setEdges(flow.edges);
            setGenerated(true);
            // Also restore input if available, or set generic
            if (sharedDesc) setInput(decodeURIComponent(sharedDesc));
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load shared state", e);
      }
    }

    if (sharedDesc) {
      setInput(decodeURIComponent(sharedDesc));
      // Auto-generate if shared? Maybe just fill input
      // setGenerated(true); // Let them click to see it, encourages engagement
    }
  }, []);

  // View configuration effect
  useEffect(() => {
    setNodes((nds) => nds.map((node) => {
      // Simple logic: In Client view, hide databases and queues
      // Ideally this should be data-driven, but hardcoded role check is fine for V2 MVP
      const isTechnical = ['database', 'queue', 'internal'].includes(node.data.role);
      const shouldHide = viewMode === 'client' && isTechnical;

      // Only update if changed to avoid unnecessary re-renders
      if (node.hidden !== shouldHide) {
        return { ...node, hidden: shouldHide };
      }
      return node;
    }));
  }, [viewMode, setNodes]);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Prepare Payload (Moved Prompt Logic to Backend)
      const lockedNodes = nodes.filter(n => n.data.locked);

      // 2. Call API
      const res = await axios.post('/api/generate', {
        description: input, // Send raw input
        history: activityHistory, // Send history context
        lockedNodes: lockedNodes, // Send locked nodes context
        currentNodes: nodes // Send ALL current nodes for context
      });
      const data = res.data;

      // 3. Merge Logic
      const newNodesRaw: any[] = data.nodes || [];
      const newEdgesRaw: any[] = data.edges || [];

      // Helper: Map API node to ReactFlow Node
      const mapToNode = (n: any, pos = { x: 0, y: 0 }) => ({
        id: n.id,
        type: 'custom',
        data: { label: n.label, role: n.role },
        position: pos
      });

      // Strategy: 
      // - Keep ALL existing nodes (User said "do not replace"). 
      // - Add NEW nodes from response only if ID doesn't exist.
      // - Edges: Re-calculate all edges provided by LLM? Or merge?
      //   User focus was on nodes. Let's merge edges: Add new ones, replace existing ones (edges are cheap).

      let mergedNodes = [...nodes];
      const existingIds = new Set(nodes.map(n => n.id));
      const addedNodes: Node[] = [];

      newNodesRaw.forEach(n => {
        if (!existingIds.has(n.id)) {
          // It's a new node
          addedNodes.push(mapToNode(n));
        }
        // If exists, do nothing (preserve client state)
      });

      // Prepare for Layout
      // We layout ALL nodes if it's the first run, otherwise we try to only layout new ones?
      // "Iteration without Re-Prompting" implies stability.
      // If we add nodes, we should probably run layout on the WHOLE graph but pin locked nodes?
      // Or just `getLayoutedElements` again? 
      // Current `getLayoutedElements` (dagre) resets positions.
      // User requirement: "Locked nodes must not move... during partial or full regeneration"
      // Our `mergedNodes` has existing positions.

      // Let's rely on `getLayoutedElements` BUT we need to pass current positions for locked nodes?
      // Dagre doesn't support "keep this here" natively without complex config.
      // HYBRID APPROACH:
      // 1. If generated=false (first run), run full layout.
      // 2. If generated=true (iteration), we have a problem: Dagre will move everything.
      //    Hack: We add new nodes at (0,0) or nearby? 
      //    Better: We run layout, but for existing nodes, we override the result with their old position?
      //    That might cause overlaps.
      //    Let's try: Run layout on everything. IF a node was locked, ignore the result for it.

      const combinedNodesForLayout = [...mergedNodes, ...addedNodes];

      // Map edges
      // Map edges with correct CustomEdge config
      const combinedEdges = newEdgesRaw.map((e: any, idx: number) => ({
        // Use index to ensure unique ID if multiple edges exist between same nodes
        id: `${e.from}-${e.to}-${idx}`,
        source: e.from,
        target: e.to,
        label: e.label,
        type: 'custom-edge', // Use CustomEdge
        data: {
          pathType: edgeStyle,
          onDelete: handleDeleteEdge,
          onLabelChange: handleEdgeLabelChange,
          label: e.label // Ensure label is in data for CustomEdge to read
        },
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 },
      }));

      let finalNodes: Node[] = [];
      let finalEdges: Edge[] = [];

      if (!generated) {
        // First run: Full Layout
        const layouted = getLayoutedElements(combinedNodesForLayout, combinedEdges, layoutDirection);
        finalNodes = layouted.nodes;
        finalEdges = layouted.edges;
      } else {
        // Iteration: Smart Layout
        // We run layout to see where Dagre WANTS to put them
        const layoutedProposal = getLayoutedElements(combinedNodesForLayout, combinedEdges, layoutDirection);

        finalNodes = layoutedProposal.nodes.map(proposedNode => {
          const existing = nodes.find(n => n.id === proposedNode.id);
          if (existing) {
            // Existing node: Logic says "do not replace it". 
            // We keep its position strict.
            return existing;
          }
          // New node: Take proposed position
          return proposedNode;
        });
        finalEdges = layoutedProposal.edges;
      }

      setNodes(finalNodes);
      setEdges(finalEdges);
      setGenerated(true);

      // Update Activity
      setActivityHistory(prev => [
        ...prev,
        { type: 'user', content: input, timestamp: Date.now() },
        { type: 'system', content: `Generated ${addedNodes.length} new nodes.`, timestamp: Date.now() + 1 }
      ]);
      setInput(''); // Clear Input

    } catch (err) {
      console.error(err);
      setError('Failed to generate diagram. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Node Handlers
  const handleNodeUpdate = (id: string, data: { label?: string; role?: string; locked?: boolean;[key: string]: any }) => {
    // Check for locking action explicitly outside of the state setter to avoid side-effects/double-execution
    if (data.locked !== undefined) {
      const targetNode = nodes.find(n => n.id === id);
      if (targetNode && targetNode.data.locked !== data.locked) {
        setActivityHistory(prev => [
          ...prev,
          {
            type: 'action',
            content: `${data.locked ? 'Locked' : 'Unlocked'} node "${targetNode.data.label}"`,
            timestamp: Date.now()
          }
        ]);
      }
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const newData = { ...node.data, ...data };
          // If locking state changes, update draggable property
          const draggable = data.locked !== undefined ? !data.locked : node.draggable;

          return {
            ...node,
            draggable,
            data: newData,
          };
        }
        return node;
      })
    );
  };

  const handleNodeDelete = (id: string) => {
    setActivityHistory(prev => [
      ...prev,
      {
        type: 'delete',
        content: `Deleted node`,
        timestamp: Date.now()
      },
      {
        type: 'delete',
        content: `Deleted edge connection`,
        timestamp: Date.now()
      }
    ]);
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const handleEdgeLabelChange = (id: string, newLabel: string) => {
    setEdges((eds) => eds.map(e => {
      if (e.id === id) {
        return { ...e, label: newLabel, data: { ...e.data } }; // Update data.label
      }
      return e;
    }));
    setActivityHistory(prev => [
      ...prev,
      {
        type: 'action',
        content: `Updated edge label to "${newLabel}"`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleDeleteEdge = (id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setActivityHistory(prev => [
      ...prev,
      {
        type: 'delete',
        content: `Deleted edge connection`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleConnect = (params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'custom-edge', // Use our CustomEdge
      data: {
        pathType: edgeStyle, // Pass current style preference
        onDelete: handleDeleteEdge, // Pass delete handler
        onLabelChange: handleEdgeLabelChange // Pass label edit handler
      },
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    }, eds));

    // Optional: Add to activity history
    setActivityHistory(prev => [
      ...prev,
      {
        type: 'action',
        content: `Manually connected nodes`,
        timestamp: Date.now()
      }
    ]);
  };

  const [themes, setThemes] = useState<'light' | 'dark' | 'neutral'>('light');
  const [edgeStyle, setEdgeStyle] = useState<'default' | 'straight' | 'step'>('step');

  // Edge Style Effect
  // Edge Style Effect - Updates all edges when style changes AND ensures they use CustomEdge
  useEffect(() => {
    setEdges((eds) => eds.map((e) => ({
      ...e,
      type: 'custom-edge',
      data: {
        ...e.data,
        pathType: edgeStyle,
        onDelete: handleDeleteEdge, // Ensure handler is attached/updated
        onLabelChange: handleEdgeLabelChange
      },
    })));
  }, [edgeStyle, setEdges]); // Note: Ideally we want to attach this even if just Edges change, but that causes loop.
  // We rely on creation points (handleConnect, handleGenerate) to attach it initially. 
  // This effect mainly handles *Style* updates.

  // Persist to Local Storage for View Page
  // useEffect(() => {
  //   const data = { nodes, edges };
  //   localStorage.setItem('qlarify-diagram-latest', JSON.stringify(data));
  // }, [nodes, edges]);

  const handleNodeAdd = (parentId: string, label: string, role: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    const parentPos = parentNode ? parentNode.position : { x: 0, y: 0 };

    // Simple collision avoidance or just offset?
    // Let's just offset to the right for now.
    const position = { x: parentPos.x + 300, y: parentPos.y + (Math.random() * 50 - 25) };

    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'custom',
      draggable: true, // Default to draggable
      data: { label, role },
      position: position
    };

    const newEdge: Edge = {
      id: `edge-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: edgeStyle === 'step' ? 'smoothstep' : edgeStyle,
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
      labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 12 },
    };
    setActivityHistory(prev => [
      ...prev,
      {
        type: 'add',
        content: `Added new node`,
        timestamp: Date.now()
      },
      {
        type: 'add',
        content: `Added new edge`,
        timestamp: Date.now()
      }
    ]);
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setEdges((prevEdges) => [...prevEdges, newEdge]);
  };

  const executeAction = async (action: 'download' | 'share' | 'download-svg', submitted: boolean) => {
    if (!feedbackSubmitted && !submitted) {
      // Cast action to strict type for state
      setPendingAction(action as any);
      setShowFeedbackModal(true);
      return;
    }

    if ((action === 'download' || action === 'download-svg') && rfInstance) {
      // Logic to download full flow
      const nodes = rfInstance.getNodes();
      const nodesBounds = getRectOfNodes(nodes);
      const imageWidth = nodesBounds.width + 100;
      const imageHeight = nodesBounds.height + 100;
      const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
      const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement;

      if (viewportEl) {
        try {
          // Configure options
          const options = {
            backgroundColor: '#f8fafc',
            width: imageWidth,
            height: imageHeight,
            style: {
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
          };

          let dataUrl = '';
          let downloadName = 'qlarify-diagram';

          if (action === 'download-svg') {
            dataUrl = await toSvg(viewportEl, options);
            downloadName += '.svg';
          } else {
            dataUrl = await toPng(viewportEl, options);
            downloadName += '.png';
          }

          const link = document.createElement('a');
          link.download = downloadName;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error('Download failed', err);
        }
      }
    }

    if (action === 'share') {
      // Stateful Share
      const res = await axios.post('/api/share', {
        nodes,
        edges
      });
      const url = `${window.location.origin}/view/${res.data.diagramId}`;
      setShareUrl(url);
      setShowShareModal(true);
    }
  };

  const submitFeedback = async () => {
    // Optimistically proceed to unblock the user immediately
    const actionToExecute = pendingAction; // Capture current pending action
    setFeedbackSubmitted(true);
    setShowFeedbackModal(false);
    setPendingAction(null); // Clear pending action state

    console.log('Action to execute', actionToExecute);
    // Execute the action immediately without waiting for feedback API
    if (actionToExecute) {
      executeAction(actionToExecute, true);
    }

    // Send feedback in background
    try {
      await axios.post('/api/feedback', {
        rating,
        comment
      });
    } catch (err) {
      console.error('Feedback failed', err);
      // Suppress alert to not annoy user after they already got their result
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 relative">

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            >
              <button onClick={() => setShowFeedbackModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={24} fill="currentColor" className="opacity-80" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">One quick question</h3>
                <p className="text-slate-500 text-sm mt-1">To {pendingAction === 'download' ? 'download' : 'share'} this diagram, please rate your experience. It helps me improve!</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
                  >
                    <Star
                      size={32}
                      fill={rating >= star ? "#F59E0B" : "none"}
                      className={rating >= star ? "text-amber-500" : "text-slate-200"}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any suggestions? (Optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-6"
                rows={3}
              />

              <button
                onClick={submitFeedback}
                disabled={rating === 0}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit & Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
            >
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 size={24} fill="currentColor" className="opacity-80" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Share Diagram</h3>
                <p className="text-slate-500 text-sm mt-1">Anyone with the link can view this diagram.</p>
              </div>

              <div className="space-y-4">
                {/* Share Link Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Public Link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check size={16} /> : <div className="flex items-center gap-2"><div className='w-4 h-4'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg></div> Copy</div>}
                    </button>
                  </div>
                </div>

                {/* Embed Code Section */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Embed Code</label>
                  <div className="relative group">
                    <textarea
                      readOnly
                      value={`<iframe src="${shareUrl}" width="100%" height="600px" style="border:0; border-radius: 8px; overflow:hidden;" allow="fullscreen"></iframe>`}
                      className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono outline-none resize-none"
                    />
                    <button
                      onClick={() => {
                        const code = `<iframe src="${shareUrl}" width="100%" height="600px" style="border:0; border-radius: 8px; overflow:hidden;" allow="fullscreen"></iframe>`;
                        navigator.clipboard.writeText(code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="absolute top-2 right-2 bg-slate-800 text-white p-1.5 rounded-md hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy Embed Code"
                    >
                      <div className='w-4 h-4'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg></div>
                    </button>
                  </div>
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <span className="text-[10px] text-slate-400 font-medium ml-2 uppercase tracking-wide">Preview</span>
                    </div>
                    <div className="aspect-video w-full bg-white flex items-center justify-center relative overflow-hidden">
                      {/* Fake UI for preview */}
                      {/* We can't actually iframe ourselves easily without recursive loading danger if not careful, but safely: */}
                      <iframe src={shareUrl} className="w-full h-full border-0 pointer-events-none opacity-50 origin-top-left w-[200%] h-[200%]" tabIndex={-1} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <QlarifyLogo />
          {/* Removed Links as requested */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              Blog
            </Link>
            <LoggedInBadge />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v1.1 Public Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Turn text into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">system architectures.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop dragging rectangles. Just describe your system in plain English, and let our AI generate a clean, professional diagram instantly.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button onClick={() => toolRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
              Try it Free <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Main Tool Interface */}
      <section ref={toolRef} className="min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20" id="tool">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

            {/* Input Panel */}
            <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Layout size={18} className="text-indigo-600" />
                  Input
                </h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Plain Text</span>
              </div>

              {/* Activity History */}
              {activityHistory.length > 0 && (
                <div className="flex-3 overflow-y-auto p-4 space-y-2 bg-slate-50 border-b border-slate-200 max-h-[300px]">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">History</div>
                  {activityHistory.map((item, idx) => (
                    <div key={idx} className={`text-sm rounded-lg border ${item.type === 'user' ? 'p-2 bg-white border-slate-200 text-slate-700' :
                      item.type === 'action' ? 'px-1 bg-amber-50 border-amber-100 text-amber-700 italic' :
                        item.type === 'add' ? 'px-1 bg-green-50 border-green-100 text-green-700 italic' :
                          item.type === 'delete' ? 'px-1 bg-red-50 border-red-100 text-red-700 italic' :
                            'p-2 bg-indigo-50 border-indigo-100 text-indigo-700'
                      }`}>
                      {
                        item.type === 'user' || item.type === 'system' ?
                          <>
                            <div className="flex justify-between opacity-50 text-[10px] mb-1">
                              <span>{item.type === 'user' ? 'You' : item.type === 'system' ? 'System' : 'Action'}</span>
                              <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                            {item.content}
                          </>
                          : <div className="flex justify-between opacity-50 text-[10px]">
                            <span className='text-xs'>{item.content}</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                      }
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-1 p-2">
                <textarea
                  className="w-full h-full min-h-[150px] resize-none bg-transparent border-0 focus:ring-0 text-slate-600 text-sm leading-relaxed p-0 placeholder:text-slate-300"
                  placeholder={generated ? "Describe updates (e.g., 'add a redis cache')..." : "e.g. User clicks login..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="p-4 border-t border-slate-200 bg-white">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Asterisk size={20} />}
                  {loading ? 'Generating...' : 'Generate System Flow'}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-8 bg-slate-100/50 relative flex flex-col">
              <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
                <button
                  onClick={() => executeAction('download', false)}
                  className="bg-white p-2 text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                  title="Download PNG"
                  disabled={!generated}
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => executeAction('download-svg', false)}
                  className="bg-white p-2 text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 font-bold text-xs"
                  title="Download SVG"
                  disabled={!generated}
                >
                  SVG
                </button>
                <button
                  onClick={() => executeAction('share', false)}
                  className="bg-white p-2 text-slate-600 rounded-lg shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                  title="Share"
                  disabled={!generated}
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden bg-slate-50" ref={diagramRef}>
                {generated ? (
                  <>
                    <DiagramRenderer
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onNodeUpdate={handleNodeUpdate}
                      onNodeAdd={handleNodeAdd}
                      onNodeDelete={handleNodeDelete}
                      onEdgeUpdate={handleEdgeLabelChange}
                      onInit={setRfInstance}
                      onConnect={handleConnect}
                      theme={themes}
                    />
                    <VisualControls
                      theme={themes}
                      edgeStyle={edgeStyle}
                      onThemeChange={setThemes}
                      onEdgeStyleChange={setEdgeStyle}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                    <div className="w-24 h-24 bg-slate-100 rounded-full mb-6 flex items-center justify-center animate-pulse">
                      <Asterisk size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Visualize</h3>
                    <p className="text-sm text-center max-w-xs">Describe your flow on the left and hit generate to see the magic happen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white border-t border-slate-100" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Designed for Speed</h2>
            <p className="mt-4 text-slate-500">Everything you need to communicate architecture, faster.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: 'Instant Generation', desc: 'No drag-and-drop. Just type and see results in milliseconds.' },
              { icon: Layout, title: 'Clean Defaults', desc: 'Opinionated, beautiful styles that look professional out of the box.' },
              { icon: Share, title: 'Easy Sharing', desc: 'Export to PNG/SVG or share a live URL with your team instantly.' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <BlogPreviewSection />

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
              <Asterisk size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-slate-900">Qlarify</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">Blog</Link>
            <p className="text-slate-400 text-sm">© 2026 Qurtesy Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
