"use client";

import { useState } from "react";
import { Plus, ArrowRight, Layout, Database, Layers, Sparkles } from "lucide-react";
import { useArchitecture } from "@/context/ArchitectureContext";
import { Breadcrumbs } from "@/components/architecture/Breadcrumbs";
import { SystemMap } from "@/components/architecture/SystemMap";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { AIReasoningPanel } from "@/components/architecture/AIReasoningPanel";
import { TopBar } from "@/components/architecture/TopBar";

import { useRouter, useParams } from "next/navigation";
import axios from "axios";

import { ProductClarityCanvas } from "@/components/architecture/ProductClarityCanvas";

function ArchitectureWorkspace() {
    const { state, loadProject, resetProject, setMode, setProductClarity } = useArchitecture();
    const router = useRouter();
    const params = useParams();
    const systemId = params?.systemId as string;
    const [isGenerating, setIsGenerating] = useState(false);
    const [projectIdea, setProjectIdea] = useState("");

    const handleCreateProject = async () => {
        if (!projectIdea.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/systems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    overview: projectIdea,
                    title: projectIdea.substring(0, 30) + (projectIdea.length > 30 ? "..." : ""),
                    messages: [
                        {
                            content: projectIdea,
                            role: "user",
                            timestamp: Date.now()
                        }
                    ]
                })
            });

            const data = await res.json();

            if (data.systemId) {
                router.push(`/app/${data.systemId}`);
            } else {
                console.error("Failed to create system: No ID returned");
            }
        } catch (error) {
            console.error("Creation Error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!state.root) return;
        try {
            const res = await fetch('/api/diagram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: state.root.name || "System Architecture",
                    nodes: [state.root],
                    edges: [],
                    type: 'architecture'
                })
            });
            if (res.ok) alert('Architecture committed to ledger successfully!');
        } catch (error) {
            console.error("Save Error", error);
            alert('Failed to save architecture.');
        }
    };

    const handleDelete = async () => {
        if (!systemId) return;
        try {
            const res = await axios.delete(`/api/systems/${systemId}`);
            if (res.status === 200) {
                resetProject();
                router.push('/app');
            }
        } catch (error) {
            console.error("Delete Error", error);
            alert('Failed to delete project.');
        }
    };

    if (!state.root && !state.productClarity) {
        return (
            <div className="flex flex-1 w-full items-center justify-center bg-ivory p-8 overflow-hidden relative min-h-[600px]">
                <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-orange-100 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-slate-100 rounded-full blur-3xl"></div>
                </div>

                {isGenerating ? (
                    <div className="flex flex-col items-center gap-8 p-16 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl scale-110">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-terracotta animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-terracotta animate-pulse" size={32} />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-3xl font-black text-charcoal tracking-tighter">Initializing Clarity</h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Analyzing problem space and constraints...</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl w-full relative z-10">
                        <div className="text-center mb-6">
                            <div className="flex items-end justify-center gap-2 mb-4">
                                <h2 className="text-6xl font-black text-charcoal tracking-tighter">Qlarify</h2>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-100 text-terracotta text-[10px] font-black uppercase tracking-widest mb-1 shadow-lg shadow-orange-900/5">
                                    v3.0
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-lg font-medium">Design with precision. From Clarity to Structured Architecture.</p>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-orange-900/10 border border-[#EEE9E2]">
                            <div className="mt-2 mb-4 flex gap-4 px-4 overflow-x-auto scrollbar-hide">
                                <FeatureIcon icon={<Layout size={14} />} label="Product Canvas" />
                                <FeatureIcon icon={<Layers size={14} />} label="Graph Modeling" />
                                <FeatureIcon icon={<Database size={14} />} label="Versioned Evolution" />
                            </div>

                            <div className="relative">
                                <textarea
                                    value={projectIdea}
                                    onChange={(e) => setProjectIdea(e.target.value)}
                                    placeholder="Describe your idea or problem space..."
                                    className="w-full h-72 rounded-[2rem] border-2 border-[#EEE9E2]/50 bg-ivory/50 p-4 text-lg font-medium focus:border-terracotta/30 focus:bg-white focus:ring-0 transition-all resize-none placeholder:text-slate-300"
                                />
                                <button
                                    onClick={handleCreateProject}
                                    disabled={!projectIdea.trim()}
                                    className="absolute bottom-6 right-6 bg-charcoal hover:bg-terracotta text-white rounded-2xl px-8 py-4 font-black flex items-center gap-3 transition-all transform active:scale-95 hover:shadow-2xl hover:shadow-orange-900/20 disabled:opacity-30 disabled:hover:bg-charcoal"
                                >
                                    Start Reasoning <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }
            </div >
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-ivory overflow-hidden">
            <TopBar onSave={handleSave} onDelete={handleDelete} />

            <div className={`flex flex-1 overflow-hidden ${state.mode === 'PRODUCT_CLARITY' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Side Panel: Explorer or Reasoning depending on mode */}
                {state.mode === 'ARCHITECTURE' && (
                    <aside className="w-80 border-r border-[#EEE9E2] bg-white flex flex-col z-10 shadow-xl shadow-orange-900/5">
                        <div className="px-6 py-4 border-b border-[#EEE9E2] flex items-center justify-between bg-ivory/50">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Explorer</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                            <SystemMap />
                        </div>
                    </aside>
                )}

                {/* Main Content Area */}
                <main className="flex flex-1 flex-col relative overflow-hidden bg-white/20">
                    {state.mode === 'ARCHITECTURE' ? (
                        <>
                            <div className="flex h-12 items-center justify-between border-b border-[#EEE9E2] bg-white/80 backdrop-blur-md px-4 z-10">
                                <Breadcrumbs />
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setMode('PRODUCT_CLARITY')}
                                        className="text-[10px] font-black text-slate-400 hover:text-terracotta uppercase tracking-widest transition-colors"
                                    >
                                        Back to Clarity
                                    </button>
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Perspective: Default</div>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <ArchitectureCanvas />
                            </div>
                        </>
                    ) : (
                        <ProductClarityCanvas />
                    )}
                </main>

                {/* AI Reasoning Side Panel */}
                <AIReasoningPanel />
            </div>
        </div>
    );
}

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-3 bg-ivory px-4 py-2 rounded-2xl border border-[#EEE9E2] text-slate-500 hover:border-terracotta/30 transition-all cursor-default flex-shrink-0">
            <div className="text-terracotta">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function ArchitectureTool() {
    return (
        <div className="flex h-full w-full flex-col bg-ivory">
            <ArchitectureWorkspace />
        </div>
    );
}
