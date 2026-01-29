"use client";

import { useSession } from "next-auth/react";
import Link from 'next/link';
import { ArrowRight, Layout, Box, Map, GitCommit } from "lucide-react";

export default function AppDashboard() {
    const { data: session } = useSession();

    const TOOLS = [
        {
            name: "Flowchart Generator",
            description: "Turn text descriptions into professional flowcharts instantly using AI.",
            href: "/app/flowchart",
            icon: Layout,
            color: "bg-indigo-100 text-indigo-600",
            status: "Active"
        },
        {
            name: "System Architect",
            description: "Design hierarchical system architectures with drill-down capabilities.",
            href: "/app/architecture",
            icon: Box,
            color: "bg-purple-100 text-purple-600",
            status: "Beta"
        },
        {
            name: "Mindmap (Coming Soon)",
            description: "Brainstorm ideas and organize thoughts visually.",
            href: "#",
            icon: Map,
            color: "bg-slate-100 text-slate-400",
            status: "Planned"
        },
        {
            name: "Sequence Diagrams (Coming Soon)",
            description: "Visualize interactions between services and components over time.",
            href: "#",
            icon: GitCommit,
            color: "bg-slate-100 text-slate-400",
            status: "Planned"
        }
    ];

    if (!session) return null;

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {session.user?.name?.split(' ')[0]}</h1>
                    <p className="text-slate-500 text-lg">What would you like to build today?</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                    {TOOLS.map((tool) => (
                        <Link
                            key={tool.name}
                            href={tool.href}
                            className={`group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all ${tool.status === 'Planned' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center`}>
                                    <tool.icon size={28} />
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tool.status === 'Beta' ? 'bg-green-100 text-green-700' : tool.status === 'Active' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {tool.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                                {tool.name}
                            </h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">
                                {tool.description}
                            </p>

                            <div className={`flex items-center font-medium ${tool.status === 'Planned' ? 'text-slate-400' : 'text-indigo-600'}`}>
                                {tool.status === 'Planned' ? 'Notify me' : 'Launch Tool'}
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
