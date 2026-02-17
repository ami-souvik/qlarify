"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import ArchitectureTool from "@/components/ArchitectureTool";
import { useArchitecture } from "@/context/ArchitectureContext";

export default function SystemDetailPage() {
    const { systemId } = useParams();
    const router = useRouter();
    const { hydrateProject } = useArchitecture();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSystem = async () => {
            if (!systemId) return;

            setIsLoading(true);
            try {
                const res = await axios.get(`/api/systems/${systemId}`);
                const { system } = res.data;

                if (system) {
                    const rootNode = system.nodes && system.nodes.length > 0 ? system.nodes[0] : null;
                    const productClarity = system.productClarity || null;

                    hydrateProject(rootNode, productClarity);
                } else {
                    setError("System not found.");
                }
            } catch (err: any) {
                console.error("Error fetching system:", err);
                setError(err.response?.data?.error || "Failed to load system architecture.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSystem();
    }, [systemId, hydrateProject]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-ivory">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-12 w-12 animate-spin text-terracotta" />
                    <p className="text-charcoal font-black tracking-tighter text-xl">Loading Architecture...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-ivory p-8">
                <div className="max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-orange-50 text-terracotta mb-8 shadow-xl shadow-orange-900/5">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-charcoal mb-4 tracking-tighter">Error Loading System</h2>
                    <p className="text-slate-500 mb-10 font-medium leading-relaxed">{error}</p>
                    <button
                        onClick={() => router.push('/app')}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-charcoal text-white font-black hover:bg-terracotta transition-all shadow-2xl shadow-orange-900/10 active:scale-95"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden">
            <ArchitectureTool />
        </div>
    );
}
