"use client";

import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { FileText } from "lucide-react";

import { useArchitecture } from "@/context/ArchitectureContext";
import { SystemMap } from "@/components/architecture/SystemMap";
import { ArchitectureCanvas } from "@/components/architecture/ArchitectureCanvas";
import { AIReasoningPanel } from "@/components/architecture/AIReasoningPanel";
import { TopBar } from "@/components/architecture/TopBar";
import { ProductClarityCanvas } from "@/components/architecture/ProductClarityCanvas";

function ArchitectureWorkspace() {
    const { state, resetProject } = useArchitecture();
    const { productClarity } = state;

    if (!productClarity) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="text-terracotta" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-charcoal mb-2">Initialize Product Clarity</h3>
                    <p className="text-slate-500 text-sm">Use the AI Chat on the right to start defining your product vision and constraints.</p>
                </div>
            </div>
        );
    }

    const router = useRouter();
    const params = useParams();
    const systemId = params?.systemId as string;

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
            <TopBar onDelete={handleDelete} />

            <div className={`flex flex-1 overflow-hidden flex-row`}>
                {/* Side Panel: Explorer or Reasoning depending on mode */}
                {
                    state.mode === 'ARCHITECTURE' && (
                        <aside className="w-80 border-r border-[#EEE9E2] bg-white flex flex-col z-10 shadow-xl shadow-orange-900/5">
                            <div className="px-6 py-2.5 border-b border-[#EEE9E2] flex items-center justify-between bg-ivory/50">
                                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">System Explorer</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                                <SystemMap />
                            </div>
                        </aside>
                    )
                }

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
