"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowRight, Layout, Database, Layers, Clock, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useArchitecture } from "@/context/ArchitectureContext";

import { useRouter } from "next/navigation";
import QlarifyLogo from "@/components/QlarifyLogo";
import LoggedInBadge from "@/components/LoggedInBadge";

function FeatureIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-3 bg-ivory px-4 py-2 rounded-2xl border border-[#EEE9E2] text-slate-500 hover:border-terracotta/30 transition-all cursor-default flex-shrink-0">
            <div className="text-terracotta">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}

export default function ArchitecturePage() {
    const router = useRouter();
    const { resetProject } = useArchitecture();
    const [isGenerating, setIsGenerating] = useState(false);
    const [projectIdea, setProjectIdea] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [systems, setSystems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleCreateProject = async () => {
        if (!projectIdea.trim() || isGenerating) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/systems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    overview: projectIdea,
                    title: projectIdea.substring(0, 30) + (projectIdea.length > 30 ? "..." : "")
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

    useEffect(() => {
        resetProject();
        const fetchSystems = async () => {
            try {
                const res = await axios.get('/api/systems');
                setSystems(res.data.systems || []);
            } catch (e) {
                console.error("Failed to fetch recent systems", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSystems();
    }, []);

    return (
        <div className="h-full w-full overflow-y-auto bg-ivory flex flex-col relative">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] bg-dot-grid"></div>

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-ivory/80 backdrop-blur-md border-b border-[#EEE9E2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <QlarifyLogo />
                    <LoggedInBadge />
                </div>
            </nav>
            {/* Main Architecture Tool (becomes the bottom section when no project is loaded) */}
            <div className="flex-1 min-h-[600px] pt-16 z-10">
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
            </div>

            {/* Systems Section */}
            {!isLoading && systems.length > 0 && (
                <div className="absolute bottom-0 left-[50%] translate-x-[-50%] max-w-4xl mx-auto w-full px-4 z-20">
                    <div
                        className="group flex flex-col border border-b-0 border-[#EEE9E2] rounded-tl-xl rounded-tr-xl p-4 bg-white hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-900/5 transition-all cursor-pointer shadow-xl"
                        onClick={() => setIsExpanded(prev => !prev)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400 group-hover:text-terracotta transition-colors" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-charcoal transition-colors">Recent Systems</h2>
                            </div>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <ChevronDown size={16} className="text-slate-300" />
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                                        {systems.map((system, idx) => (
                                            <motion.div
                                                key={system.SK || idx}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/app/${system.id}`);
                                                }}
                                                className="w-43 p-4 rounded-xl border border-[#EEE9E2] bg-white hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-900/5 transition-all cursor-pointer flex flex-col gap-3 min-w-[200px]"
                                            >
                                                <div>
                                                    <h3 className="text-sm font-black text-charcoal hover:text-terracotta transition-colors line-clamp-2 tracking-tight">
                                                        {system.title || "Untitled System"}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">
                                                        {new Date(system.updatedAt || Date.now()).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
