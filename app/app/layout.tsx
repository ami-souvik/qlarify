"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    Loader2,
} from "lucide-react";

import { ArchitectureProvider } from "@/context/ArchitectureContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-ivory">
                <Loader2 className="h-8 w-8 animate-spin text-terracotta/40" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <ArchitectureProvider>
            <div className="flex h-screen bg-ivory">
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-ivory relative">
                    {children}
                </main>
            </div>
        </ArchitectureProvider>
    );
}
