"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LoggedInBadge() {
    const { data: session } = useSession();
    if (!session) return <div className="text-sm md:text-base flex items-center gap-3 md:gap-6">
        <Link href="/login" className="text-slate-900 hover:text-indigo-600 font-medium transition-colors">
            Log in
        </Link>
        <Link href="/signup" className="px-3 py-1 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors">
            Sign up
        </Link>
    </div>;
    return (
        <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center px-2 py-1 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors">
                <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">
                    {session.user?.name}
                </span>
            </Link>

            <button
                onClick={() => signOut()}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}