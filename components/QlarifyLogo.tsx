import Link from "next/link";
import { Box } from "lucide-react";

export default function QlarifyLogo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <Box size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Qlarify</span>
        </Link>
    );
}