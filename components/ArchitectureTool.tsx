"use client";

import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { ArchitectureProvider, useArchitecture } from "@/context/ArchitectureContext";
import { Breadcrumbs } from "@/components/architecture/Breadcrumbs";
import { SystemMap } from "@/components/architecture/SystemMap";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";

function ArchitectureWorkspace() {
    const { state, loadProject } = useArchitecture();
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
            if (data.architecture_node) {
                loadProject(data.architecture_node);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!state.root) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 p-8">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700">Architecting your solution...</h3>
                        <p className="text-slate-500">Analysing domains and boundaries</p>
                    </div>
                ) : (
                    <div className="max-w-xl w-full text-center">
                        <div className="mb-8 flex justify-center">
                            <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Plus className="h-8 w-8" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Start a New Architecture</h2>
                        <p className="text-slate-500 mb-8 text-lg">Describe your system idea, and Qlarify Agent will fetch the domains, services, and boundaries for you.</p>

                        <div className="relative">
                            <textarea
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                placeholder="E.g., A ride-sharing platform like Uber with real-time tracking..."
                                className="w-full h-32 rounded-xl border-2 border-slate-200 p-4 text-lg focus:border-indigo-600 focus:ring-0 transition-colors resize-none shadow-sm"
                            />
                            <button
                                onClick={handleCreateProject}
                                disabled={!projectIdea.trim()}
                                className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2 font-medium flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Sidebar: System Map */}
            <aside className="w-72 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">System Map</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <SystemMap />
                </div>
            </aside>

            {/* Main Content: Breadcrumbs + Canvas */}
            <main className="flex flex-1 flex-col bg-slate-50 relative">
                {/* Breadcrumb Bar */}
                <div className="flex h-12 items-center border-b border-slate-200 bg-white px-4 shadow-sm z-10 sticky top-0">
                    <Breadcrumbs />
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden">
                    <ArchitectureCanvas />
                </div>
            </main>
        </div>
    );
}

export default function ArchitectureTool() {
    return (
        <ArchitectureProvider>
            <div className="flex h-full w-full flex-col bg-slate-50">
                <ArchitectureWorkspace />
            </div>
        </ArchitectureProvider>
    );
}
