"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ArchitectureNode, ArchitectureState, VisualNode, VisualEdge, ProductClarity, AppMode } from '@/types/architecture';

interface ArchitectureContextType {
    state: ArchitectureState;
    hydrateProject: (title: string, canvas: string | null, messages?: any[], logs?: any[], knowledgeGraph?: string | null) => void;
    setCanvas: (canvas: string) => void;
    setMode: (mode: AppMode) => void;
    zoomInto: (nodeId: string) => void;
    navigateBreadcrumb: (nodeId: string) => void;
    updateActiveDiagram: (nodes: VisualNode[], edges: VisualEdge[]) => void;
    addChildNode: (parentId: string, childNode: ArchitectureNode) => void;
    resetProject: () => void;
    // Helper to find a node by ID in the tree
    findNode: (id: string) => ArchitectureNode | null;
}

const ArchitectureContext = createContext<ArchitectureContextType | undefined>(undefined);

export function ArchitectureProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ArchitectureState>({
        mode: 'PRODUCT_CLARITY',
        title: 'Untitled System',
        canvas: null,
        knowledgeGraph: null,
        root: null,
        activeNodeId: null,
        breadcrumbs: [],
        messages: [],
        logs: []
    });

    // Helper: Recursive find
    const findNodeRecursive = (node: ArchitectureNode, id: string): ArchitectureNode | null => {
        if (node.id === id) return node;
        for (const child of node.children) {
            const found = findNodeRecursive(child, id);
            if (found) return found;
        }
        return null;
    };

    const findNode = useCallback((id: string) => {
        if (!state.root) return null;
        return findNodeRecursive(state.root, id);
    }, [state.root]);

    // Build breadcrumb path from root to target
    const searchPath = (node: ArchitectureNode, targetId: string, currentPath: { id: string, name: string }[]): { id: string, name: string }[] | null => {
        if (node.id === targetId) {
            return [...currentPath, { id: node.id, name: node.name }];
        }
        for (const child of node.children) {
            const result = searchPath(child, targetId, [...currentPath, { id: node.id, name: node.name }]);
            if (result) return result;
        }
        return null;
    };

    const hydrateProject = useCallback((title: string, canvas: string | null, messages: any[] = [], logs: any[] = [], knowledgeGraph: string | null = null) => {
        setState(prev => ({
            ...prev,
            title,
            canvas,
            knowledgeGraph,
            messages: messages || [],
            logs: logs || []
        }));
    }, []);

    const setCanvas = useCallback((canvas: string) => {
        setState(prev => ({
            ...prev,
            canvas,
            // Keep existing root/breadcrumbs if any
        }));
    }, []);

    const setMode = useCallback((mode: AppMode) => {
        setState(prev => ({ ...prev, mode }));
    }, []);

    const zoomInto = useCallback((nodeId: string) => {
        if (!state.root) return;
        const targetNode = findNodeRecursive(state.root, nodeId);

        if (targetNode) {
            const newBreadcrumbs = searchPath(state.root, nodeId, []) || [];
            setState(prev => ({
                ...prev,
                activeNodeId: nodeId,
                breadcrumbs: newBreadcrumbs
            }));
        }
    }, [state.root]);

    const navigateBreadcrumb = useCallback((nodeId: string) => {
        // Same logic as zoomInto essentially, but semantically "going up" usually
        zoomInto(nodeId);
    }, [zoomInto]);

    const updateActiveDiagram = useCallback((nodes: VisualNode[], edges: VisualEdge[]) => {
        setState(prev => {
            if (!prev.root || !prev.activeNodeId) return prev;

            // We need to clone the tree to mutate it immutably
            const cloneTree = JSON.parse(JSON.stringify(prev.root));
            const target = findNodeRecursive(cloneTree, prev.activeNodeId);

            if (target) {
                if (!target.diagram) {
                    target.diagram = { type: 'system_overview', nodes: [], edges: [], timestamp: Date.now() }; // Default
                }
                target.diagram.nodes = nodes;
                target.diagram.edges = edges;
                target.diagram.timestamp = Date.now();
            }

            return {
                ...prev,
                root: cloneTree
            };
        });
    }, []);

    const addChildNode = useCallback((parentId: string, childNode: ArchitectureNode) => {
        setState(prev => {
            if (!prev.root) return prev;
            const cloneTree = JSON.parse(JSON.stringify(prev.root));
            const parent = findNodeRecursive(cloneTree, parentId);

            if (parent) {
                // Check uniqueness?
                const exists = parent.children.find((c: ArchitectureNode) => c.id === childNode.id);
                if (!exists) {
                    parent.children.push(childNode);
                }
            }
            return { ...prev, root: cloneTree };
        });
    }, []);

    const resetProject = useCallback(() => {
        setState({
            mode: 'PRODUCT_CLARITY',
            title: 'Untitled System',
            canvas: null,
            knowledgeGraph: null,
            root: null,
            activeNodeId: null,
            breadcrumbs: [],
            messages: [],
            logs: []
        });
    }, []);

    return (
        <ArchitectureContext.Provider value={{
            state,
            hydrateProject,
            setCanvas,
            setMode,
            zoomInto,
            navigateBreadcrumb,
            updateActiveDiagram,
            addChildNode,
            resetProject,
            findNode
        }}>
            {children}
        </ArchitectureContext.Provider>
    );
}

export function useArchitecture() {
    const context = useContext(ArchitectureContext);
    if (context === undefined) {
        throw new Error('useArchitecture must be used within an ArchitectureProvider');
    }
    return context;
}
