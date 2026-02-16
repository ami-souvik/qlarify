"use client";

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Check, X, RefreshCw, Send, BrainCircuit, History } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { motion, AnimatePresence } from 'framer-motion';

export function AIReasoningPanel() {
    const { state } = useArchitecture();
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<'reasoning' | 'history'>('reasoning');

    // Mock suggestions for visualization
    const [suggestions, setSuggestions] = useState([
        {
            id: 's1',
            phase: 'Service Refinement',
            message: 'I see Booking Service handles both booking creation and payments. Would you like to split Payment into a separate domain?',
            status: 'pending'
        }
    ]);

    const handleAccept = (id: string) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
    };

    const handleIgnore = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    return (
        <aside className="w-80 border-l border-[#EEE9E2] bg-white flex flex-col shadow-2xl shadow-orange-900/5 z-10 overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-[#EEE9E2] bg-ivory/50">
                <button
                    onClick={() => setActiveTab('reasoning')}
                    className={`flex-1 py-4 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'reasoning' ? 'text-terracotta bg-white border-b-2 border-terracotta' : 'text-slate-400 hover:text-charcoal'}`}
                >
                    <BrainCircuit size={14} /> Reasoning
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'history' ? 'text-terracotta bg-white border-b-2 border-terracotta' : 'text-slate-400 hover:text-charcoal'}`}
                >
                    <History size={14} /> Logs
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-ivory/30">
                {activeTab === 'reasoning' ? (
                    <AnimatePresence>
                        {suggestions.map((suggestion) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[2rem] border border-[#EEE9E2] shadow-2xl shadow-orange-900/5 overflow-hidden"
                            >
                                <div className="px-4 py-2 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-terracotta uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles size={10} /> {suggestion.phase}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-charcoal leading-relaxed mb-6 font-medium">
                                        {suggestion.message}
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => handleAccept(suggestion.id)}
                                            className="w-full bg-charcoal text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-terracotta transition-all shadow-lg shadow-orange-900/10 flex items-center justify-center gap-2"
                                        >
                                            <Check size={14} /> Accept Suggestion
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 bg-ivory text-charcoal border border-[#EEE9E2] text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-white hover:border-terracotta/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={14} /> Refine
                                            </button>
                                            <button
                                                onClick={() => handleIgnore(suggestion.id)}
                                                className="flex-1 bg-ivory text-slate-400 border border-[#EEE9E2] text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:text-charcoal hover:bg-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <X size={14} /> Ignore
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {suggestions.length === 0 && (
                            <div className="text-center py-16 opacity-30">
                                <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for analysis...</p>
                            </div>
                        )}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-16 opacity-30">
                        <History size={40} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No history yet</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-[#EEE9E2] bg-white">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask AI to refine or expand..."
                        className="w-full h-28 rounded-2xl border-2 border-[#EEE9E2]/50 bg-ivory/50 p-4 text-sm font-medium focus:border-terracotta/30 focus:bg-white focus:ring-0 transition-all resize-none pr-12 placeholder:text-slate-300"
                    />
                    <button className="absolute bottom-4 right-4 p-2 bg-charcoal text-white rounded-xl hover:bg-terracotta transition-all shadow-lg shadow-orange-900/10 active:scale-95 leading-none">
                        <Send size={16} />
                    </button>
                </div>
                <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <BrainCircuit size={12} className="text-terracotta/50" /> Structured reasoning active
                </div>
            </div>
        </aside>
    );
}
