"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw, BrainCircuit, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useArchitecture } from '@/context/ArchitectureContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStream } from '@/hooks/useChatStream';

export function AIReasoningPanel() {
    const { state, hydrateProject } = useArchitecture();
    const { systemId } = useParams();
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<{ message: string; tool?: string } | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);

    const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(2, 9)}`);
    const message = useChatStream(sessionId, async () => {
        setIsGenerating(false);
        setStatus(null);
        if (systemId) {
            try {
                const res = await fetch(`/api/systems/${systemId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.system) {
                        hydrateProject(
                            data.system.title || null,
                            data.system.canvas || null,
                            data.system.messages || [],
                            data.system.logs || [],
                            data.system.knowledge_graph || null
                        );
                    }
                }
            } catch (err) {
                console.error("Failed to refresh system context:", err);
            }
        }
    });
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
    }, [messages, isGenerating, message]); // Scroll when sending too (optimistic update)

    const publishReasoningEvent = async (messageBody: string) => {
        try {
            await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    event: "idea.submitted",
                    payload: {
                        content: messageBody
                    },
                    system_id: systemId as string,
                    session_id: sessionId
                })
            });
        } catch (error) {
            console.error("Failed to publish event:", error);
        }
    }

    const initialized = useRef(false);

    // Auto-trigger initial reasoning for new projects
    useEffect(() => {
        if (!initialized.current && !state.canvas && state.messages.length === 0 && !isGenerating) {
            initialized.current = true;
            // Add optimistic message
            setIsGenerating(true);
            setStatus({ message: "Initializing analysis...", tool: "reasoning" });

            const messageContent = state.title;
            setMessages(prev => [...prev, { role: 'user', content: messageContent }]);

            publishReasoningEvent(messageContent);
        }
    }, [state.canvas, state.messages.length, state.title, isGenerating]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;
        setIsGenerating(true);
        setStatus({ message: "Thinking...", tool: "reasoning" });

        // Optimistic UI updates
        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput("");

        await publishReasoningEvent(userMessage);
    };

    return (
        <aside className="w-80 border-l border-[#EEE9E2] dark:border-white/10 bg-white dark:bg-charcoal flex flex-col shadow-2xl shadow-orange-900/5 z-10 overflow-hidden shrink-0">

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-ivory/30 dark:bg-charcoal/30">
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
                                <div className={`px-4 py-2 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-charcoal dark:bg-terracotta text-white dark:text-charcoal rounded-br-none'
                                    : 'bg-white dark:bg-[#252525] border border-[#EEE9E2] dark:border-white/10 text-charcoal dark:text-ivory rounded-bl-none shadow-sm'
                                    }`}>
                                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert text-white dark:text-charcoal' : 'dark:prose-invert'}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-start"
                            >
                                <div className="px-4 py-2 rounded-xl text-sm leading-relaxed bg-white dark:bg-[#252525] border border-[#EEE9E2] dark:border-white/10 text-charcoal dark:text-ivory rounded-bl-none shadow-sm">
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />

                        {messages.length === 0 && (
                            <div className="text-center py-16 opacity-30">
                                <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-500 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Waiting for analysis...</p>
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
                        className="px-6 py-2 bg-charcoal dark:bg-[#252525] border-t border-white/10 overflow-hidden flex-shrink-0"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
                                    {status.tool ? <RefreshCw size={10} className="text-terracotta animate-spin" /> : <BrainCircuit size={10} className="text-terracotta" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white dark:text-ivory uppercase tracking-widest leading-none mb-0.5">{status.message}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-[#EEE9E2] dark:border-white/10 bg-white dark:bg-charcoal text-charcoal flex-shrink-0 relative z-30">
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
                        className="w-full h-20 bg-ivory/50 dark:bg-charcoal/50 p-2 text-sm font-medium focus:border-terracotta/30 focus:bg-white dark:focus:bg-[#252525] focus:ring-0 dark:text-ivory transition-all resize-none pr-12 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isGenerating}
                        className="absolute bottom-2 right-2 p-2 bg-charcoal dark:bg-ivory text-white dark:text-charcoal rounded-lg hover:bg-terracotta dark:hover:bg-terracotta dark:hover:text-white transition-all shadow-lg shadow-orange-900/10 dark:shadow-none active:scale-95 leading-none disabled:opacity-30"
                    >
                        {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </aside>
    );
}
