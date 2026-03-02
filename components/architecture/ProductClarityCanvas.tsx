"use client";

import { useArchitecture } from '@/context/ArchitectureContext';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Zap,
    Database,
    ShieldAlert,
    FileText,
    Users,
    Globe,
    Maximize2
} from 'lucide-react';
import { ProductClarityTodos } from '@/types/architecture';
import ReactMarkdown from 'react-markdown';
import { ClarityDomainService } from '@/lib/modeling/engine';

export function ProductClarityCanvas() {
    const { state, setMode } = useArchitecture();
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

    const sections = [
        {
            id: 'overview',
            title: "Product Overview",
            icon: <FileText size={18} />,
            content: productClarity.overview,
            todoIds: ['overview']
        },
        {
            id: 'targetPersonas',
            title: "Target Personas",
            icon: <Users size={18} />,
            content: productClarity.targetPersonas || '',
            todoIds: ['targetPersonas']
        },
        {
            id: 'problemStatements',
            title: "Problem Statements",
            icon: <AlertCircle size={18} />,
            content: productClarity.problemStatements || '',
            todoIds: ['problemStatements']
        },
        {
            id: 'coreCapabilities',
            title: "Core Capabilities",
            icon: <Zap size={18} />,
            content: productClarity.coreCapabilities || '',
            todoIds: ['coreCapabilities']
        },
        {
            id: 'dataInputsOutputs',
            title: "Data Inputs & Outputs",
            icon: <Database size={18} />,
            content: productClarity.dataInputsOutputs || '',
            todoIds: ['dataInputsOutputs']
        },
        {
            id: 'externalSystems',
            title: "External Systems",
            icon: <Globe size={18} />,
            content: productClarity.externalSystems || '',
            todoIds: ['externalSystems']
        },
        {
            id: 'constraints',
            title: "Constraints & NFRs",
            icon: <ShieldAlert size={18} />,
            content: productClarity.constraints || '',
            todoIds: ['constraints']
        }
    ];

    const { isThresholdReached, missingRequirements } = ClarityDomainService.getClarityScore(productClarity);
    const handleGenerateArchitecture = async () => {
        setMode('ARCHITECTURE');
    };

    return (
        <>
            <div className="w-full px-6 py-1 border-b border-[#EEE9E2] flex items-center justify-between bg-ivory/50">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Foundational Product Strategy & Constraints</h2>
                <button
                    onClick={handleGenerateArchitecture}
                    disabled={!isThresholdReached}
                    className={`px-6 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all ${isThresholdReached ? 'bg-charcoal text-white hover:bg-terracotta shadow-xl shadow-orange-900/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-50'}`}
                >
                    <Zap size={14} className={isThresholdReached ? "animate-pulse" : ""} />
                    Generate Architecture Draft
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-ivory/20 scrollbar-hide">
                <div className="max-w-6xl mx-auto">
                    {!isThresholdReached && (
                        <div className="mb-4 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-sm text-terracotta">
                                <Zap size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-terracotta mb-0.5">Threshold Requirements</p>
                                <p className="text-xs text-orange-900/60 font-medium">Missing: {missingRequirements.join(', ')}.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white rounded-xl border border-[#EEE9E2] shadow-lg shadow-orange-900/5 overflow-hidden flex flex-col ${section.title === "Product Overview" ? "lg:col-span-2" : ""}`}
                            >
                                <div className="px-4 flex justify-between items-center border-b border-[#EEE9E2] gap-3">
                                    <div className="py-2 flex items-center gap-3 bg-ivory/30">
                                        <div className="text-terracotta">{section.icon}</div>
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal">{section.title}</h2>
                                    </div>
                                    <button className="p-1 text-slate-2f00 hover:text-orange-500 hover:bg-orange-50 rounded-lg cursor-pointer transition-all">
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                                <div className="px-4 py-3 flex-1 flex flex-col gap-4">
                                    <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-charcoal prose-p:text-slate-600">
                                        <ReactMarkdown>{section.content}</ReactMarkdown>
                                    </div>

                                    {/* Render Todos */}
                                    <div className="space-y-2 mt-auto">
                                        {section.todoIds.flatMap(todoId => productClarity.todos?.[todoId as keyof ProductClarityTodos] || []).map((todo, i) => (
                                            <div key={i} className="flex gap-3 items-center p-2.5 bg-orange-50/30 rounded-xl border border-dashed border-orange-200/50">
                                                <div className="w-4 h-4 rounded border-2 border-orange-200 shrink-0" />
                                                <span className="text-[11px] text-slate-400 font-bold italic tracking-tight">{todo}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
