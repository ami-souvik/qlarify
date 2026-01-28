import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LoggedInBadge() {
    const { data: session } = useSession();
    if (!session) return <>
        <Link href="/login" className="text-slate-900 hover:text-indigo-600 font-medium transition-colors">
            Log in
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
            Sign up
        </Link>
    </>;
    return (
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 pr-1 truncate max-w-[150px]">
                    {session.user?.email}
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