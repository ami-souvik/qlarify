"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Layout,
    Layers,
    Loader2,
    LogOut,
    Map,
    GitCommit,
    Box,
    Menu,
    X
} from "lucide-react";
import QlarifyLogo from "@/components/QlarifyLogo";
import LoggedInBadge from "@/components/LoggedInBadge";

const NAV_ITEMS = [
    { name: "Flowchart Gen", href: "/app/flowchart", icon: Layout, description: "Text to Diagram" },
    { name: "System Architect", href: "/app/architecture", icon: Box, description: "Hierarchical Design" },
    { name: "Mindmap", href: "/app/mindmap", icon: Map, description: "Brainstorming", disabled: true },
    { name: "Sequence Diagram", href: "/app/sequence", icon: GitCommit, description: "Interaction Flows", disabled: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-16'} 
                bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-50 fixed h-full md:relative`}
            >
                <div className="h-12 flex items-center justify-between px-3 bg-white">
                    {isSidebarOpen && <QlarifyLogo />}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hidden md:block"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href; // Strict match? Or startsWith?
                        // Simple active check
                        const active = pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.disabled ? '#' : item.href}
                                className={`flex items-center gap-3 p-2 rounded transition-colors relative group
                                    ${active
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : item.disabled
                                            ? 'opacity-50 cursor-not-allowed text-slate-400'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <item.icon size={20} className={active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />

                                {isSidebarOpen && (
                                    <div className="flex-1">
                                        <div className="text-sm">{item.name}</div>
                                        <div className="text-[10px] text-slate-400 font-normal">{item.description}</div>
                                    </div>
                                )}

                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="px-4 py-2 border-t border-slate-200">
                    {isSidebarOpen ? (
                        <div className="flex items-center justify-between">
                            <LoggedInBadge />
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                {session.user?.name?.[0] || 'U'}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 relative">
                {/* Mobile Header Toggle */}
                <div className="md:hidden h-14 flex items-center px-4 border-b border-slate-200 bg-white">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-600">
                        <Menu size={20} />
                    </button>
                    <span className="ml-2 font-semibold text-slate-800">Qlarify</span>
                </div>

                {children}
            </main>
        </div>
    );
}
