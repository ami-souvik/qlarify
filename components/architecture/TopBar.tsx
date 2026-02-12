"use client";

import React from 'react';
import { useArchitecture } from '@/context/ArchitectureContext';
import { Save, Share2, Users, GitBranch, Layout, Box } from 'lucide-react';

export function TopBar({ onSave }: { onSave: () => void }) {
    const { state } = useArchitecture();

    return (
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 z-20 shrink-0">
            {/* Left: Project Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                        <Box size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {state.root?.name || "Untitled Project"}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-tighter">
                                <GitBranch size={10} /> v2.0.4-beta
                            </span>
                            <span>•</span>
                            <span>Last saved 2m ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: Collaboration Status */}
            <div className="hidden md:flex items-center gap-6">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">SD</div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">AI</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Collaboration
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                    <Share2 size={14} /> Share
                </button>
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-sm active:scale-95"
                >
                    <Save size={14} /> Commit Changes
                </button>
            </div>
        </header>
    );
}
