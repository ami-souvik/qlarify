import Link from "next/link";
import { Box } from "lucide-react";

export default function QlarifyLogo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-[#D97757] p-1.5 rounded-xl text-white shadow-lg shadow-orange-900/10">
                <Box size={22} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-[#1A1A1A]">Qlarify</span>
        </Link>
    );
}