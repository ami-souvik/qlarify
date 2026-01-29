"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Layout,
    Box,
    Menu,
    X,
    Home,
    Plus,
    Loader2,
    Search,
    Settings,
    ChevronDown,
    ChevronRight,
    FileText
} from "lucide-react";
import QlarifyLogo from "@/components/QlarifyLogo";
import LoggedInBadge from "@/components/LoggedInBadge";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isViewOpen, setIsViewOpen] = useState(true);

    const FAVORITES = [
        { name: "Auth Flow V2", href: "/app/flowchart", icon: Layout },
        { name: "System Architecture", href: "/app/architecture", icon: Box },
    ];

    const PAGES = [
        { name: "Payment Microservice", href: "/app/flowchart", icon: Layout },
        { name: "User Graph DB", href: "/app/architecture", icon: Box },
        { name: "Notification Worker", href: "/app/flowchart", icon: Layout },
        { name: "Legacy Migration", href: "/app/architecture", icon: Box },
    ];

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
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-0'} 
                bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300 z-50 fixed h-full md:relative overflow-hidden group`}
            >
                {/* Sidebar Header (User Profile / Switcher) */}
                <div className="h-12 flex items-center px-4 hover:bg-slate-100 transition-colors cursor-pointer shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {session.user?.name?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate">{session.user?.name}</span>
                        <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-3 py-2 space-y-0.5 shrink-0">
                    <div className="flex items-center gap-2 px-2 py-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer text-sm">
                        <Search size={16} />
                        <span className="truncate">Search</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer text-sm">
                        <Settings size={16} />
                        <span className="truncate">Settings</span>
                    </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
                    {/* Favorites */}
                    <div>
                        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">Favorites</h3>
                        <div className="space-y-0.5">
                            {FAVORITES.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-slate-100 text-slate-600 truncate group/item`}
                                >
                                    <item.icon size={16} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Diagrams */}
                    <div>
                        <div
                            className="group/header flex items-center justify-between px-2 py-1 mb-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer select-none"
                            onClick={() => setIsViewOpen(!isViewOpen)}
                        >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                {isViewOpen ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">Private</h3>
                            </div>
                            <button
                                className="opacity-0 group-hover/header:opacity-100 p-0.5 hover:bg-slate-200 rounded text-slate-500 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push('/app');
                                }}
                                title="Add new diagram"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {isViewOpen && (
                            <div className="space-y-0.5">
                                <Link href="/app" className={`flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-slate-100 text-slate-600 truncate ${pathname === '/app' ? 'bg-slate-100 font-medium text-slate-900' : ''}`}>
                                    <Home size={16} className="text-slate-400 shrink-0" />
                                    <span className="truncate">Home</span>
                                </Link>

                                {PAGES.map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-slate-100 text-slate-600 truncate`}
                                    >
                                        <FileText size={16} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {!isSidebarOpen && (
                <div className="fixed top-4 left-4 z-50 md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                        <Menu size={20} />
                    </button>
                </div>
            )}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
                {/* Desktop Toggle (Notion style: Hover area or button) */}
                {/* We can reproduce Notion's top bar toggle logic if needed, but for now lets keep it simple. */}
                {/* Notion usually puts the sidebar toggle in the top-left of the main content when sidebar is closed. */}
                <div className="h-0 relative z-50">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className={`absolute top-3 left-3 p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-opacity duration-200 ${isSidebarOpen ? 'opacity-0 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100' : 'opacity-100'}`}
                        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? <div className="sr-only">Close</div> : <Menu size={20} />}
                    </button>
                </div>

                {children}
            </main>
        </div>
    );
}
