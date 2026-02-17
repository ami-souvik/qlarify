"use client";

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Check, X, RefreshCw, Send, BrainCircuit, History } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { ProductClarity } from '@/types/architecture';

export function AIReasoningPanel() {
    const { state, setProductClarity } = useArchitecture();
    const { systemId } = useParams();
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<'reasoning' | 'history'>('reasoning');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ message: string; tool?: string } | null>(null);

    // Suggestions can now include structural updates
    const [suggestions, setSuggestions] = useState([
        {
            id: 's1',
            phase: 'Persona Discovery',
            message: 'Based on your idea, I propose adding a "Kitchen Staff" persona who needs real-time order visibility.',
            type: 'clarity_update',
            status: 'pending',
            update: {
                personas: [
                    { id: 'kitchen', name: 'Kitchen Staff', role: 'Order Fulfillment', goals: ['View active orders', 'Mark items as ready', 'Manage inventory levels'] }
                ]
            }
        }
    ]);

    const handleAccept = (id: string) => {
        const suggestion = suggestions.find(s => s.id === id);
        if (suggestion && suggestion.type === 'clarity_update' && state.productClarity) {
            // Merge update into current clarity
            const updatedClarity = { ...state.productClarity };
            if (suggestion.update.personas) {
                updatedClarity.personas = [...updatedClarity.personas, ...suggestion.update.personas];
            }
            // ... handle other update types
            setProductClarity(updatedClarity);
        }
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
    };

    const handleIgnore = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        setIsSending(true);

        try {
            // Phase 1: Context Retrieval
            setStatus({ message: "Reading Canvas Context...", tool: "get_canvas_context" });
            await new Promise(r => setTimeout(r, 800));

            // Phase 2: Reasoning
            setStatus({ message: "Reasoning about product vision...", tool: undefined });
            await new Promise(r => setTimeout(r, 1200));

            // Phase 3: Structural Update
            setStatus({ message: "Proposing clarity updates...", tool: "propose_clarity_update" });
            await new Promise(r => setTimeout(r, 1000));

            // Mock populating data and todos based on user input
            if (state.productClarity) {
                // Use a proper deep type casting or copy
                const updated = JSON.parse(JSON.stringify(state.productClarity));
                if (!updated.todos) updated.todos = {};

                const lowerInput = input.toLowerCase();

                if (lowerInput.includes("persona") || lowerInput.includes("user")) {
                    // Simulate adding persona and removing todo
                    updated.personas.push({
                        id: 'p' + Date.now(),
                        name: 'System Admin',
                        role: 'Infrastructure Management',
                        goals: ['Monitor system health', 'Provision resources']
                    });
                    // Clear persona todos
                    updated.todos.personas = [];
                } else {
                    // Initial project context or other updates
                    updated.overview = input;
                    updated.todos.personas = ["Identify the primary target audience and their roles"];
                    updated.todos.problems = ["Define the exact pain points this system solves"];
                    updated.todos.capabilities = ["List the top 3 core features", "Define the data security requirements"];
                }

                setProductClarity(updated);
            }

            setInput("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
            setStatus(null);
        }
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
                        {suggestions.filter(s => s.status === 'pending').map((suggestion) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl border border-[#EEE9E2] shadow-2xl shadow-orange-900/5 overflow-hidden"
                            >
                                <div className="px-4 py-2 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-terracotta uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles size={10} /> {suggestion.phase}
                                    </span>
                                </div>
                                <div className="p-4">
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
                        {suggestions.filter(s => s.status === 'pending').length === 0 && (
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

            {/* Status Indicator */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 py-3 bg-charcoal border-t border-white/10 overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                                    {status.tool ? <RefreshCw size={12} className="text-terracotta animate-spin" /> : <BrainCircuit size={12} className="text-terracotta" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{status.message}</p>
                                    {status.tool && (
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-green-500" /> MCP: {status.tool}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-2 border-t border-[#EEE9E2] bg-white text-charcoal">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask AI to refine or expand..."
                        className="w-full h-20 rounded-xl border-2 border-[#EEE9E2]/50 bg-ivory/50 p-2 text-sm font-medium focus:border-terracotta/30 focus:bg-white focus:ring-0 transition-all resize-none pr-12 placeholder:text-slate-300"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        className="absolute bottom-3 right-2 p-2 bg-charcoal text-white rounded-lg hover:bg-terracotta transition-all shadow-lg shadow-orange-900/10 active:scale-95 leading-none disabled:opacity-30"
                    >
                        {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
