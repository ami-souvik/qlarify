
"use client";

import { useSession } from "next-auth/react";
import { Layout, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoggedInBadge from "@/components/LoggedInBadge";
import QlarifyLogo from "@/components/QlarifyLogo";

// Reuse the Diagram tool logic? Or just show a placeholder?
// The user asked for "simple logged in page which will have the tool".
// I should probably extract the "Tool" from app/page.tsx into a component to reuse it, OR just import it if it's already a component.
// It seems the tool logic is embedded in app/page.tsx (big file).
// For now, I will create a new page that looks like the dashboard, but I can't easily duplicate the 800-line logic without refactoring.
// STRATEGY: Refactor the tool part of app/page.tsx into `components/DiagramEditor.tsx`.
// But first, let's create the shell.

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Top Navigation */}
            <nav className="sticky top-0 w-full z-40 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <QlarifyLogo />
                    <LoggedInBadge />
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <Layout size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to your Dashboard</h2>
                        <p className="text-slate-500 mb-8">
                            You are now logged in. The full diagram editor functionalities will be moved here securely.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                            Go to Diagram Editor (Public) <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
