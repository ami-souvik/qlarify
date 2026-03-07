"use client";

import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw, BrainCircuit, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useArchitecture } from '@/context/ArchitectureContext';

export function AIReasoningPanel() {
    const { state, hydrateProject } = useArchitecture();
    const { systemId } = useParams();
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<{ message: string; tool?: string } | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync messages from context state when it loads
    useEffect(() => {
        if (state.messages && state.messages.length > 0) {
            const formattedMessages = state.messages.map(msg => {
                if (typeof msg === 'string') {
                    return { role: 'user', content: msg } as { role: 'user' | 'assistant', content: string };
                }
                return msg as { role: 'user' | 'assistant', content: string };
            });
            setMessages(formattedMessages);
        }
    }, [state.messages]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]); // Scroll when sending too (optimistic update)

    const performReasoningRequest = async (messageBody: string) => {
        try {
            const response = await fetch(`/api/reasoning/${systemId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: messageBody
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
                                    if (last?.role === 'assistant') {
                                        return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }];
                                    } else {
                                        return [...prev, { role: 'assistant', content: assistantMessage }];
                                    }
                                });
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
            setStatus({ message: "Updating canvas...", tool: "refresh" });
            const res = await axios.get(`/api/systems/${systemId}`);
            if (res.data.system) {
                hydrateProject(res.data.system.title, res.data.system.canvas, res.data.system.messages, res.data.system.logs);
            }
            setIsSending(false);
            setIsGenerating(false);
            setStatus(null);
        }
    };

    // Auto-trigger initial reasoning for new projects
    useEffect(() => {
        if (!state.canvas && state.messages.length === 0 && !isGenerating) {
            // Add optimistic message
            setIsGenerating(true);
            setStatus({ message: "Initializing analysis...", tool: "reasoning" });

            const messageContent = state.title;

            performReasoningRequest(messageContent);
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        setIsSending(true);
        setStatus({ message: "Thinking...", tool: "reasoning" });

        // Optimistic UI updates
        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput("");

        await performReasoningRequest(userMessage);
    };

    return (
        <aside className="w-80 border-l border-[#EEE9E2] bg-white flex flex-col shadow-2xl shadow-orange-900/5 z-10 overflow-hidden">

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-ivory/30">
                <div className="flex flex-col gap-6">
                    {/* Conversation History */}
                    <div className="space-y-4 pb-4">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
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
                        <div ref={messagesEndRef} />

                        {messages.length === 0 && (
                            <div className="text-center py-16 opacity-30">
                                <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for analysis...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Indicator */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 py-2 bg-charcoal border-t border-white/10 overflow-hidden flex-shrink-0"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
                                    {status.tool ? <RefreshCw size={10} className="text-terracotta animate-spin" /> : <BrainCircuit size={10} className="text-terracotta" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-0.5">{status.message}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-[#EEE9E2] bg-white text-charcoal flex-shrink-0 relative z-30">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask AI to refine or expand..."
                        className="w-full h-20 bg-ivory/50 p-2 text-sm font-medium focus:border-terracotta/30 focus:bg-white focus:ring-0 transition-all resize-none pr-12 placeholder:text-slate-300"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        className="absolute bottom-2 right-2 p-2 bg-charcoal text-white rounded-lg hover:bg-terracotta transition-all shadow-lg shadow-orange-900/10 active:scale-95 leading-none disabled:opacity-30"
                    >
                        {isSending ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
