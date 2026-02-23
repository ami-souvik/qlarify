"use client";

import { useArchitecture } from "@/context/ArchitectureContext";
import { SystemMap } from "@/components/architecture/SystemMap";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { AIReasoningPanel } from "@/components/architecture/AIReasoningPanel";
import { TopBar } from "@/components/architecture/TopBar";

import { useRouter, useParams } from "next/navigation";
import axios from "axios";

import { ProductClarityCanvas } from "@/components/architecture/ProductClarityCanvas";

function ArchitectureWorkspace() {
    const { state, resetProject } = useArchitecture();
    const router = useRouter();
    const params = useParams();
    const systemId = params?.systemId as string;

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

    return (
        <div className="flex flex-col h-screen w-full bg-ivory overflow-hidden">
            <TopBar onSave={handleSave} onDelete={handleDelete} />

            <div className={`flex flex-1 overflow-hidden flex-row`}>
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
                    {
                        state.mode === 'ARCHITECTURE' ?
                            <ArchitectureCanvas /> :
                            <ProductClarityCanvas />
                    }
                </main>

                {/* AI Reasoning Side Panel */}
                <AIReasoningPanel />
            </div>
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
