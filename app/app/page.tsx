"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ArchitectureTool from "@/components/ArchitectureTool";
import { useArchitecture } from "@/context/ArchitectureContext";

import { useRouter } from "next/navigation";
import QlarifyLogo from "@/components/QlarifyLogo";
import LoggedInBadge from "@/components/LoggedInBadge";

export default function ArchitecturePage() {
    const router = useRouter();
    const { resetProject } = useArchitecture();
    const [isExpanded, setIsExpanded] = useState(false);
    const [systems, setSystems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    console.log('systems', systems);

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
                <ArchitectureTool />
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
