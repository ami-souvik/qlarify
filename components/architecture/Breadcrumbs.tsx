"use client";

import { useArchitecture } from "@/context/ArchitectureContext";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
    const { state, navigateBreadcrumb } = useArchitecture();
    const { breadcrumbs } = state;

    if (!breadcrumbs.length) return null;

    return (
        <nav className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap px-4 py-2 text-sm text-slate-600">
            <button
                onClick={() => state.root && navigateBreadcrumb(state.root.id)}
                className="flex items-center hover:text-indigo-600 transition-colors"
            >
                <Home className="h-4 w-4" />
            </button>

            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                    <div key={crumb.id} className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />
                        <button
                            onClick={() => navigateBreadcrumb(crumb.id)}
                            disabled={isLast}
                            className={`hover:text-indigo-600 transition-colors ${isLast ? "font-semibold text-indigo-700 pointer-events-none" : ""
                                }`}
                        >
                            {crumb.name}
                        </button>
                    </div>
                );
            })}
        </nav>
    );
}
