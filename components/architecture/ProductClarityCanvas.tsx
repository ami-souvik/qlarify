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
        <div className="flex-1 overflow-y-auto p-4 bg-ivory/20 dark:bg-charcoal scrollbar-hide">
            <div className="max-w-6xl mx-auto">
                {!isThresholdReached && (
                    <div className="mb-4 px-4 py-2 bg-white dark:bg-zinc-900 border border-terracotta dark:border-terracotta/20 rounded-xl flex items-center gap-4">
                        <div className="bg-white dark:bg-charcoal p-2 rounded-xl shadow-sm text-terracotta">
                            <Zap size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-terracotta mb-0.5">Threshold Requirements</p>
                            <p className="text-xs text-terracotta dark:text-terracotta/60 font-medium">Missing: {missingRequirements.join(', ')}.</p>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden bg-white dark:bg-charcoal">
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-sm prose-headings:font-bold prose-headings:text-charcoal dark:prose-headings:text-ivory prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-hr:my-6">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{canvas}</ReactMarkdown>
                    </div>
                </div>

                {state.knowledgeGraph && (
                    <div className="overflow-hidden bg-white dark:bg-charcoal mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
                        <h2 className="text-xl font-black text-charcoal dark:text-ivory mb-6 tracking-tight flex items-center gap-2">
                            Knowledge Graph
                        </h2>
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-sm prose-headings:font-bold prose-headings:text-charcoal dark:prose-headings:text-ivory prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-hr:my-6">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.knowledgeGraph}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
