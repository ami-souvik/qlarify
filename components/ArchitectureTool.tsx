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
        <div className="flex flex-col h-screen w-full bg-ivory dark:bg-charcoal overflow-hidden">
            <TopBar onDelete={handleDelete} />

            <div className={`flex flex-1 overflow-hidden flex-row`}>
                {/* Main Content Area */}
                <main className="flex flex-1 flex-col relative overflow-hidden">
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
