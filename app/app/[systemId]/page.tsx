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
    const { loadProject } = useArchitecture();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSystem = async () => {
            if (!systemId) return;

            setIsLoading(true);
            try {
                const res = await axios.get(`/api/systems/${systemId}`);
                if (res.data.system && res.data.system.nodes?.length > 0) {
                    loadProject(res.data.system.nodes[0]);
                } else {
                    setError("System data is incomplete or missing.");
                }
            } catch (err: any) {
                console.error("Error fetching system:", err);
                setError(err.response?.data?.error || "Failed to load system architecture.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSystem();
    }, [systemId, loadProject]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-slate-500 font-medium">Loading Architecture...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white p-8">
                <div className="max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading System</h2>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/app')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all"
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
