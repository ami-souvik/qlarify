"use client";

import { useState } from "react";
import { Plus, ArrowRight, Layout, Database, Layers, Sparkles } from "lucide-react";
import { useArchitecture } from "@/context/ArchitectureContext";
import { Breadcrumbs } from "@/components/architecture/Breadcrumbs";
import { SystemMap } from "@/components/architecture/SystemMap";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { AIReasoningPanel } from "@/components/architecture/AIReasoningPanel";
import { TopBar } from "@/components/architecture/TopBar";

import { useRouter } from "next/navigation";

function ArchitectureWorkspace() {
    const { state, loadProject } = useArchitecture();
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [projectIdea, setProjectIdea] = useState("");

    const handleCreateProject = async () => {
        if (!projectIdea.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/v2/architecture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: 'generate',
                    level: 'product',
                    user_input: projectIdea
                })
            });
            const data = await res.json();
            if (data.system_id) {
                router.push(`/app/${data.system_id}`);
            } else if (data.architecture_node) {
                // Fallback for immediate load if ID matching fails
                loadProject(data.architecture_node);
            }
        } catch (error) {
            console.error(error);
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

    if (!state.root) {
        return (
            <div className="flex flex-1 w-full items-center justify-center bg-white p-8 overflow-hidden relative min-h-[600px]">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
                </div>

                {isGenerating ? (
                    <div className="flex flex-col items-center gap-6 p-12 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-2xl scale-110">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="text-indigo-600 animate-pulse" size={24} />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-800">Architecting Solution</h3>
                            <p className="text-slate-500 font-medium">Decomposing domains and establishing service boundaries...</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl w-full">
                        <div className="text-center mb-6">
                            <div className="flex items-end justify-center gap-2 mb-2">
                                <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">Qlarify.</h2>
                                <div className="inline-flex items-center gap-2 px-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                                    Beta
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Describe your vision. AI handles the structural scaffolding.</p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-2xl p-2">
                            <div className="my-4 flex gap-4">
                                <FeatureIcon icon={<Layout size={12} />} label="DDD Domains" />
                                <FeatureIcon icon={<Layers size={12} />} label="Service Map" />
                                <FeatureIcon icon={<Database size={12} />} label="Canonical Model" />
                            </div>

                            <div className="relative">
                                <textarea
                                    value={projectIdea}
                                    onChange={(e) => setProjectIdea(e.target.value)}
                                    placeholder="e.g., A multi-tenant SaaS for restaurant management with real-time ordering and inventory..."
                                    className="w-full h-60 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-2 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all resize-none shadow-inner"
                                />
                                <button
                                    onClick={handleCreateProject}
                                    disabled={!projectIdea.trim()}
                                    className="absolute bottom-6 right-6 bg-slate-900 hover:bg-slate-800 text-sm text-white rounded-xl px-3 py-1 font-bold flex items-center gap-2 transition-all transform active:scale-95 hover:shadow-xl disabled:opacity-50"
                                >
                                    Qlarify Now <ArrowRight size={12} />
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
        <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
            {/* Top Bar Navigation */}
            <TopBar onSave={handleSave} />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Structured Tree View */}
                <aside className="w-72 border-r border-slate-200 bg-white flex flex-col z-10">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Explorer</h2>
                        <Plus size={14} className="text-slate-400 hover:text-indigo-600 cursor-pointer" />
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                        <SystemMap />
                    </div>
                </aside>

                {/* Main Content Area: Breadcrumbs + Canvas */}
                <main className="flex flex-1 flex-col relative overflow-hidden bg-slate-50/50">
                    {/* Perspective / Breadcrumb Bar */}
                    <div className="flex h-10 items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-2 z-10">
                        <Breadcrumbs />
                        <div className="flex items-center gap-2 px-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">View: Default</div>
                        </div>
                    </div>

                    {/* Interactive Canvas Rendering Model Graph */}
                    <div className="flex-1 relative">
                        <ArchitectureCanvas />
                    </div>
                </main>

                {/* Right Panel: AI Reasoning & Suggestions */}
                <AIReasoningPanel />
            </div>
        </div>
    );
}

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-600">
            <div className="text-indigo-600">{icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </div>
    );
}

export default function ArchitectureTool() {
    return (
        <div className="flex h-full w-full flex-col bg-white">
            <ArchitectureWorkspace />
        </div>
    );
}
