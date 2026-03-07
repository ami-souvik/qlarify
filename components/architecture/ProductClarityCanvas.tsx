"use client";

import { useArchitecture } from '@/context/ArchitectureContext';
import { motion } from 'framer-motion';
import {
    Zap,
    FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ClarityDomainService } from '@/lib/modeling/engine';
import { ProductClarity } from '@/types/architecture';

import remarkGfm from 'remark-gfm';

export function ProductClarityCanvas() {
    const { state, setMode } = useArchitecture();
    const { canvas } = state;

    if (!canvas) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="text-terracotta" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-charcoal mb-2">Initialize Canvas</h3>
                    <p className="text-slate-500 text-sm">Use the AI Chat on the right to start defining your product vision and constraints.</p>
                </div>
            </div>
        );
    }

    const { isThresholdReached, missingRequirements } = ClarityDomainService.getClarityScore({} as ProductClarity);
    const handleGenerateArchitecture = async () => {
        setMode('ARCHITECTURE');
    };

    return (
        <>
            <div className="w-full px-6 py-1 border-b border-[#EEE9E2] dark:border-white/10 flex items-center justify-between bg-ivory/50 dark:bg-charcoal">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Foundational Product Strategy & Constraints</h2>
                <button
                    onClick={handleGenerateArchitecture}
                    disabled={!isThresholdReached}
                    className={`px-6 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${isThresholdReached ? 'bg-charcoal dark:bg-ivory text-white dark:text-charcoal hover:bg-terracotta dark:hover:bg-terracotta dark:hover:text-white shadow-xl shadow-orange-900/20 dark:shadow-none' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-white/5 opacity-50'}`}
                >
                    <Zap size={14} className={isThresholdReached ? "animate-pulse" : ""} />
                    Generate Architecture Draft
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-ivory/20 dark:bg-charcoal scrollbar-hide">
                <div className="max-w-6xl mx-auto">
                    {!isThresholdReached && (
                        <div className="mb-4 px-4 py-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl flex items-center gap-4">
                            <div className="bg-white dark:bg-charcoal p-2 rounded-xl shadow-sm text-terracotta">
                                <Zap size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-terracotta mb-0.5">Threshold Requirements</p>
                                <p className="text-xs text-orange-900/60 dark:text-orange-900/80 font-medium">Missing: {missingRequirements.join(', ')}.</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white dark:bg-charcoal rounded-xl border border-[#EEE9E2] dark:border-white/10 shadow-lg shadow-orange-900/5 dark:shadow-none">
                        <div className="px-4 py-3">
                            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-sm prose-headings:font-bold prose-headings:text-charcoal dark:prose-headings:text-ivory prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-hr:my-6">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{canvas}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
