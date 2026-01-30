"use client";

import { useSession } from "next-auth/react";
import Link from 'next/link';
import { ArrowRight, Layout, Box, Map, GitCommit, Clock, FileText } from "lucide-react";

export default function AppDashboard() {
    const { data: session } = useSession();

    // Mock Recent Diagrams
    const RECENT = [
        {
            id: 1,
            title: "Authentication Flow",
            type: "Flowchart",
            icon: Layout,
            updatedAt: "2 mins ago",
            href: "/app/flowchart" // Just linking to tool for now
        },
        {
            id: 2,
            title: "E-commerce Microservices",
            type: "Architecture",
            icon: Box,
            updatedAt: "2 hours ago",
            href: "/app/architecture"
        },
        {
            id: 3,
            title: "Payment Gateway",
            type: "Flowchart",
            icon: Layout,
            updatedAt: "Yesterday",
            href: "/app/flowchart"
        }
    ];

    const TOOLS = [
        {
            name: "Flowchart Generator",
            description: "Turn text descriptions into professional flowcharts instantly.",
            href: "/app/flowchart",
            icon: Layout,
            color: "text-indigo-600 bg-indigo-50",
            status: "Active"
        },
        {
            name: "System Architect",
            description: "Design hierarchical system architectures with drill-down.",
            href: "/app/architecture",
            icon: Box,
            color: "text-purple-600 bg-purple-50",
            status: "Beta"
        },
        {
            name: "Mindmap",
            description: "Brainstorm ideas and organize thoughts visually.",
            href: "#",
            icon: Map,
            color: "text-slate-400 bg-slate-50",
            status: "Planned"
        },
        {
            name: "Sequence Diagrams",
            description: "Visualize interactions between services over time.",
            href: "#",
            icon: GitCommit,
            color: "text-slate-400 bg-slate-50",
            status: "Planned"
        }
    ];

    if (!session) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-white p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Greeting */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {session.user?.name?.split(' ')[0]}</h1>
                    <p className="text-slate-500">Ready to visualize your ideas?</p>
                </div>

                {/* Recently Viewed */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Clock size={16} />
                        Recently Viewed
                    </h2>
                    <div className="w-full overflow-x-auto flex gap-2">
                        {RECENT.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="w-48 group flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${item.type === 'Flowchart' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                                        <item.icon size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{item.type}</span>
                                </div>
                                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-2">Edited {item.updatedAt}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Create New / Tools */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={16} />
                        Create New
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TOOLS.map((tool) => (
                            <Link
                                key={tool.name}
                                href={tool.href}
                                className={`flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors ${tool.status === 'Planned' ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-300'}`}
                            >
                                <div className={`p-3 rounded-xl ${tool.color}`}>
                                    <tool.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                        {tool.name}
                                        {tool.status === 'Beta' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Beta</span>}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                                </div>
                                {tool.status !== 'Planned' && <ArrowRight size={16} className="text-slate-300 mt-1" />}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
