import Link from "next/link";
import QlarifySvg from "./QlarifySvg";

export default function QlarifyLogo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <QlarifySvg bgColor="indigo-600" className="w-8 h-8 p-0.5 rounded-lg text-white" />
            <span className="font-bold text-xl tracking-tight text-slate-900">Qlarify</span>
        </Link>
    );
}