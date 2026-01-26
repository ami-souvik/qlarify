"use client";

import { createContext, useContext, ReactNode } from 'react';

export interface NodeData {
    label: string;
    role: string;
    locked?: boolean;
    visibleInViews?: string[];
    description?: string;
    [key: string]: any;
}

interface DiagramContextType {
    onNodeUpdate: (id: string, data: Partial<NodeData>) => void;
    onDeleteNode: (id: string) => void;
    onAddNode: (parentId: string) => void;
    onRequestEdit: (id: string, label: string, role: string) => void;
    theme: 'light' | 'dark' | 'neutral';
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export function DiagramProvider({
    children,
    onNodeUpdate,
    onDeleteNode,
    onAddNode,
    onRequestEdit,
    theme = 'light'
}: DiagramContextType & { children: ReactNode }) {
    return (
        <DiagramContext.Provider value={{ onNodeUpdate, onDeleteNode, onAddNode, onRequestEdit, theme }}>
            {children}
        </DiagramContext.Provider>
    );
}

export function useDiagram() {
    const context = useContext(DiagramContext);
    if (context === undefined) {
        throw new Error('useDiagram must be used within a DiagramProvider');
    }
    return context;
}
