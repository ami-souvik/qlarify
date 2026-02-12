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
        <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-sm z-10 overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button
                    onClick={() => setActiveTab('reasoning')}
                    className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'reasoning' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <BrainCircuit size={14} /> Reasoning
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <History size={14} /> Logs
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {activeTab === 'reasoning' ? (
                    <AnimatePresence>
                        {suggestions.map((suggestion) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                <div className="px-3 py-1.5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight flex items-center gap-1">
                                        <Sparkles size={10} /> {suggestion.phase}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                                        {suggestion.message}
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleAccept(suggestion.id)}
                                            className="w-full bg-slate-900 text-white text-xs font-semibold py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={14} /> Accept Suggestion
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 bg-white text-slate-700 border border-slate-200 text-xs font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={14} /> Refine
                                            </button>
                                            <button
                                                onClick={() => handleIgnore(suggestion.id)}
                                                className="flex-1 bg-white text-slate-400 border border-slate-200 text-xs font-semibold py-2 rounded-lg hover:text-red-500 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X size={14} /> Ignore
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {suggestions.length === 0 && (
                            <div className="text-center py-10">
                                <MessageSquare size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-sm text-slate-400">Waiting for architectural patterns to analyze...</p>
                            </div>
                        )}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-10">
                        <History size={32} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-sm text-slate-400">No architectural history yet.</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask AI to refine or expand..."
                        className="w-full h-24 rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-600 focus:ring-0 transition-colors resize-none pr-10"
                    />
                    <button className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-transform active:scale-95">
                        <Send size={16} />
                    </button>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <BrainCircuit size={10} /> AI operates on structured model snapshot
                </div>
            </div>
        </aside>
    );
}
