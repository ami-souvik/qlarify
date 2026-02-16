"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LoggedInBadge() {
    const { data: session } = useSession();
    if (!session) return <div className="text-sm md:text-base flex items-center gap-6 md:gap-8">
        <Link href="/login" className="text-[#1A1A1A] hover:text-[#D97757] font-bold tracking-tight transition-colors">
            Log in
        </Link>
        <Link href="/signup" className="px-6 py-2 bg-[#1A1A1A] text-white font-black tracking-tight rounded-xl hover:bg-[#D97757] transition-all transform active:scale-95 shadow-lg shadow-orange-900/10">
            Sign up
        </Link>
    </div>;
    return (
        <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center px-4 py-1.5 bg-white rounded-xl border border-[#EEE9E2] hover:border-orange-200 hover:shadow-sm transition-all">
                <span className="text-sm font-bold text-[#1A1A1A] truncate max-w-[150px]">
                    {session.user?.name}
                </span>
            </Link>

            <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                title="Sign out"
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}