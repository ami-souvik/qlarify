import Link from "next/link";
import { Asterisk } from "lucide-react";

export default function QlarifyLogo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
                <Asterisk size={24} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Qlarify</span>
        </Link>
    );
}