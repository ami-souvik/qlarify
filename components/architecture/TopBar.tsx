"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Share2, Box, Trash2 } from 'lucide-react';
import { useArchitecture } from '@/context/ArchitectureContext';

export function TopBar({ onDelete }: { onDelete?: () => void }) {
    const { state, setMode } = useArchitecture();
    const params = useParams();
    const systemId = params?.systemId;

    return (
        <header className="h-12 border-b border-[#EEE9E2] bg-white grid grid-cols-3 items-center px-6 z-20 shrink-0">
            {/* Left: Project Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-terracotta p-1.5 rounded-xl text-white shadow-lg shadow-orange-900/10">
                            <Box size={18} />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-charcoal flex items-center gap-2 tracking-tight">
                            {state.root?.name || (state.productClarity?.overview ? (state.productClarity.overview.substring(0, 60) + (state.productClarity.overview.length > 60 ? "..." : "")) : "Untitled Project")}
                        </h1>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                            <span>Last saved 2m ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle: Mode Toggle */}
            <div className="flex justify-center items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200">
                {(['PRODUCT_CLARITY', 'ARCHITECTURE'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setMode(mode)}
                        className={`
                            px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                            ${state.mode === mode
                                ? 'bg-white text-terracotta shadow-sm ring-1 ring-gray-200'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }
                        `}
                    >
                        {mode.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex justify-end items-center gap-3">
                <button className="flex items-center gap-2 p-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-charcoal hover:bg-ivory rounded-xl transition-all">
                    <Share2 size={16} /> Share
                </button>
                {systemId && onDelete && (
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                                onDelete();
                            }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Project"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </header>
    );
}
