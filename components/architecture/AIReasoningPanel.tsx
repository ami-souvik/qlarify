"use client";

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Check, X, RefreshCw, Send, BrainCircuit, History, Users } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { ProductClarity } from '@/types/architecture';

interface Suggestion {
    id: string;
    phase: string;
    message: string;
    type: 'clarity_update' | 'architecture_update';
    status: 'pending' | 'accepted' | 'ignored';
    update: Partial<ProductClarity>;
}

export function AIReasoningPanel() {
    const { state, setProductClarity, hydrateProject } = useArchitecture();
    const { systemId } = useParams();
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<'reasoning' | 'history'>('reasoning');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ message: string; tool?: string } | null>(null);

    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);

    const handleAccept = async (id: string) => {
        const suggestion = suggestions.find(s => s.id === id);
        if (suggestion && suggestion.type === 'clarity_update') {
            try {
                if (state.productClarity) {
                    const updatedClarity = { ...state.productClarity };
                    // Merge updates
                    Object.keys(suggestion.update).forEach(key => {
                        const k = key as keyof ProductClarity;
                        if (Array.isArray(updatedClarity[k]) && Array.isArray(suggestion.update[k])) {
                            // @ts-ignore
                            updatedClarity[k] = [...updatedClarity[k], ...suggestion.update[k]];
                        } else {
                            // @ts-ignore
                            updatedClarity[k] = suggestion.update[k];
                        }
                    });
                    setProductClarity(updatedClarity);
                }

                setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
            } catch (err) {
                console.error("Failed to apply suggestion", err);
            }
        }
    };

    const handleIgnore = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    };

    // Auto-trigger initial reasoning for new projects
    React.useEffect(() => {
        const hasModels = (state.productClarity?.personas?.length || 0) > 0 || (state.productClarity?.capabilities?.length || 0) > 0;
        console.log("hasModels", hasModels);
        console.log("state.productClarity?.overview", state.productClarity?.overview);
        console.log("messages.length", messages.length);
        console.log("status", status);

        if (state.productClarity?.overview && !hasModels && messages.length === 0 && !status) {
            const initialPrompt = `I have a new idea: "${state.productClarity.overview}". Please analyze this and auto-populate the initial Personas, Problems, and Capabilities directly to the canvas.`;

            // Add optimistic message
            setMessages([{ role: 'user', content: state.productClarity.overview }]);
            setStatus({ message: "Initializing analysis...", tool: "reasoning" });

            const runInitialAnalysis = async () => {
                try {
                    const response = await fetch('/api/reasoning', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            systemId,
                            messages: [{ role: "user", content: initialPrompt }]
                        })
                    });

                    if (!response.ok || !response.body) throw new Error(response.statusText);

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let assistantMessage = "";
                    let buffer = "";

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n\n');
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.replace('data: ', '').trim();
                                if (dataStr === '[DONE]') break;

                                try {
                                    const data = JSON.parse(dataStr);

                                    if (data.type === 'reasoning' || data.type === 'content') {
                                        assistantMessage += data.text || "";
                                        setMessages(prev => {
                                            // Only update if it's the first message or appended
                                            if (prev.length === 0 || prev[prev.length - 1].role !== 'assistant') {
                                                return [...prev, { role: 'assistant', content: assistantMessage }];
                                            } else {
                                                const newPrev = [...prev];
                                                newPrev[newPrev.length - 1].content = assistantMessage;
                                                return newPrev;
                                            }
                                        });
                                    }

                                    if (data.type === 'refresh' || data.requiresRefresh) {
                                        setStatus({ message: "Populating canvas...", tool: "refresh" });
                                        const res = await fetch(`/api/systems/${systemId}`);
                                        const sysData = await res.json();
                                        if (sysData.system) {
                                            hydrateProject(sysData.system.nodes?.[0] || null, sysData.system.productClarity);
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing SSE data", e);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setStatus(null);
                }
            };

            runInitialAnalysis();
        }
    }, [state.productClarity?.overview, systemId]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        setIsSending(true);
        setStatus({ message: "Thinking...", tool: "reasoning" });

        // Optimistic UI updates
        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput("");

        try {
            const response = await fetch('/api/reasoning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemId,
                    messages: [...messages, { role: "user", content: userMessage }]
                })
            });

            if (!response.ok || !response.body) {
                throw new Error(response.statusText);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(dataStr);

                            if (data.type === 'reasoning' || data.type === 'content') {
                                assistantMessage += data.text || "";
                                setMessages(prev => {
                                    const last = prev[prev.length - 1];
                                    if (last.role === 'assistant') {
                                        return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }];
                                    } else {
                                        return [...prev, { role: 'assistant', content: assistantMessage }];
                                    }
                                });
                            }

                            if (data.type === 'proposal') {
                                setSuggestions(prev => [
                                    {
                                        id: 's' + Date.now(),
                                        phase: 'AI Suggestion',
                                        message: assistantMessage || "I have a suggestion for you.",
                                        type: 'clarity_update',
                                        status: 'pending',
                                        update: data.proposal
                                    },
                                    ...prev
                                ]);
                            }

                            if (data.type === 'refresh' || data.requiresRefresh) {
                                setStatus({ message: "Updating canvas...", tool: "refresh" });
                                const res = await fetch(`/api/systems/${systemId}`);
                                const sysData = await res.json();
                                if (sysData.system) {
                                    hydrateProject(sysData.system.nodes?.[0] || null, sysData.system.productClarity);
                                }
                            }

                            if (data.error) {
                                console.error("Stream Error:", data.error);
                                setStatus({ message: "Error: " + data.error, tool: "error" });
                            }

                        } catch (e) {
                            console.error("Error parsing SSE data", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error(error);
            setStatus({ message: "Error processing request", tool: "error" });
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
                    <div className="flex flex-col gap-6">
                        {/* Pending Suggestions */}
                        <AnimatePresence>
                            {suggestions.filter(s => s.status === 'pending').map((suggestion) => (
                                <motion.div
                                    key={suggestion.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-xl border border-[#EEE9E2] shadow-2xl shadow-orange-900/5 overflow-hidden flex-shrink-0"
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
                        </AnimatePresence>

                        {/* Conversation History */}
                        <div className="space-y-4 pb-4">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-xl text-xs font-medium leading-relaxed ${msg.role === 'user'
                                        ? 'bg-charcoal text-white rounded-br-none'
                                        : 'bg-white border border-[#EEE9E2] text-charcoal rounded-bl-none shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 px-1">
                                        {msg.role === 'user' ? 'You' : 'AI Architect'}
                                    </span>
                                </motion.div>
                            ))}
                            {messages.length === 0 && suggestions.filter(s => s.status === 'pending').length === 0 && (
                                <div className="text-center py-16 opacity-30">
                                    <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for analysis...</p>
                                </div>
                            )}
                        </div>
                    </div>
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
