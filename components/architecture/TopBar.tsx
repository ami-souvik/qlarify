"use client";

import React from 'react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { Save, Share2, Users, GitBranch, Layout, Box, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export function TopBar({ onSave, onDelete }: { onSave: () => void, onDelete?: () => void }) {
    const { state } = useArchitecture();
    const params = useParams();
    const systemId = params?.systemId;

    return (
        <header className="h-16 border-b border-[#EEE9E2] bg-white flex items-center justify-between px-6 z-20 shrink-0">
            {/* Left: Project Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-terracotta p-2 rounded-xl text-white shadow-lg shadow-orange-900/10">
                        <Box size={20} />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-charcoal flex items-center gap-2 tracking-tight">
                            {state.root?.name || "Untitled Project"}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 bg-ivory border border-[#EEE9E2] px-2 py-0.5 rounded text-slate-400">
                                <GitBranch size={10} className="text-terracotta" /> v2.0.4-beta
                            </span>
                            <span className="opacity-30">•</span>
                            <span>Last saved 2m ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: Collaboration Status */}
            <div className="hidden md:flex items-center gap-8">
                <div className="flex -space-x-3">
                    <div className="w-9 h-9 rounded-2xl border-2 border-white bg-orange-50 flex items-center justify-center text-[10px] font-black text-terracotta shadow-sm">SD</div>
                    <div className="w-9 h-9 rounded-2xl border-2 border-white bg-charcoal flex items-center justify-center text-[10px] font-black text-white shadow-sm">AI</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-terracotta uppercase tracking-[0.2em] bg-orange-50/50 px-3 py-1.5 rounded-xl border border-orange-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" /> Live Collaboration
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {systemId && onDelete && (
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                                onDelete();
                            }
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Project"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-charcoal hover:bg-ivory rounded-xl transition-all">
                    <Share2 size={16} /> Share
                </button>
                <button
                    onClick={onSave}
                    className="flex items-center gap-3 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-charcoal hover:bg-terracotta rounded-xl transition-all shadow-xl shadow-orange-900/10 active:scale-95"
                >
                    <Save size={16} /> Commit Changes
                </button>
            </div>
        </header>
    );
}
