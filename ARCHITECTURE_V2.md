# Qlarify v2 Architecture

## 1. Core Philosophy
Qlarify v2 shifts from a "stateless generator" to a **stateful diagram editor**. The LLM is used strictly as a bootstrapper. Once the diagram exists, the client (browser) becomes the source of truth.

## 2. Data Model Extensions

### 2.1 Nodes
We extend the existing node interface to support locking, views, and styling.

```typescript
type NodeType = 'custom'; // Existing

interface NodeData {
  // --- Core Identity ---
  id: string;
  label: string;
  role: 'user' | 'client' | 'service' | 'database' | 'queue' | 'external';
  
  // --- Architecture V2 ---
  locked: boolean; // If true, layout algorithms must NOT move this node
  description?: string; // For technical view
  
  // --- Views Visibility ---
  // If undefined, visible in all. If present, only visible in listed views.
  visibleInViews?: ('client' | 'dev')[];
  
  // --- Visuals ---
  styleOverride?: {
    fontSize?: number;
    colorTheme?: string;
  };
}

interface QlarifyNode extends Node {
  data: NodeData;
  position: { x: number; y: number };
}
```

### 2.2 Edges
Edges also gain visibility/styling traits.

```typescript
interface EdgeData {
  label?: string;
  visibleInViews?: ('client' | 'dev')[];
  style?: 'default' | 'dashed' | 'thick';
}
```

### 2.3 versions
We will introduce a simple versioning model held in client state (and optionally persisted).

```typescript
interface DiagramVersion {
  id: string;
  name: string; // "v1 - Initial", "v2 - Added Caching"
  timestamp: number;
  nodes: QlarifyNode[];
  edges: Edge[];
  inputPrompt: string; // The prompt that generated this (if applicable)
}
```

## 3. State Management (Frontend)

We will lift state out of `DiagramRenderer` into a centralized **DiagramContext** (or use a lightweight store like Zustand if complexity grows).

**Store Scopes:**
1.  **Current Diagram**: The active nodes/edges being edited.
2.  **History Stack**: For Undo/Redo (essential for "trust").
3.  **Saved Versions**: List of snapshots the user has explicitly saved.
4.  **UI State**: Active View (Client/Dev), active styling presets.

## 4. Layout & Stability Strategy

### Problem: Dagre is Global
Dagre recalculates the entire graph every time. If a user moves a node manually, a re-layout resets it.

### Solution: Hybrid Layout Engine
1.  **Initial Generation**: Run Dagre to get baseline positions.
2.  **Manual Movements**: Update `position` in ReactFlow state. Mark diagram as "user-modified".
3.  **Partial Regeneration**:
    *   If user selects "Regenerate Layout", we re-run Dagre.
    *   **Locking**: If a node has `locked: true`, we must treat its position as an anchor.
    *   *Implementation Detail*: Dagre doesn't support "fixed" nodes easily.
    *   *Compromise*: "Locking" primarily prevents **LLM regeneration** from changing the node's existence/label. For layout, "Locking" will prevent auto-layout from moving it *if* we implement a custom force-directed layout, but for V2 MVP using Dagre, we might simply **disable auto-layout** once the user starts manually moving (or allow them to "Reset to Auto").
    *   **Revised Requirement**: "Locked nodes must not move... during partial or full regeneration".
    *   *Strategy*: When regenerating (LLM), we merge new nodes into the existing graph. Use existing positions for locked nodes.

## 5. View Logic (Client vs. Dev)
*   **Dev View**: Shows all nodes/edges.
*   **Client View**: Filters out nodes marked as `role: 'queue'`, `role: 'database'`, or specific technical metadata.
*   *Implementation*: A selector in the UI updates the `hidden` attribute of nodes in ReactFlow loop.

## 6. Backend Changes
*   **No Database Required yet**: We will stick to client-side persistence (Local Storage) for V2 MVP to ensure stability and speed.
*   **API**: `POST /api/generate` remains mostly the same but might accept an optional `existing_graph` JSON if we want "Iterative Refinement" (e.g., "Add a cache to the database node").
    *   *Optimization*: For V2, we focus on client-side edits. We only call API for the *first* pass.

## 7. Export Pipeline
*   **PNG**: Existing `html-to-image`.
*   **SVG**: Use `toSvg` from `html-to-image` or ReactFlow's export utilities.
*   **Share Link**: Encode essential state in URL (compressed) or just keep the current "prompt-based" sharing. For "Edit-based" sharing, we'd need a DB. We will stick to prompt-sharing for now OR save to a temp JSON file/blob storage if needed. *Constraint Check*: "View-only share links". We will implement URL compression (LZString) to share the *actual* graph state in the URL if it fits, otherwise fallback to prompt.

## 8. Summary of Work
1.  **Refactor**: `DiagramRenderer` becomes a "dumb" component. Logic moves to `page.tsx` or new `DiagramEditor`.
2.  **Enhance**: Add Toolbar for Locking, View Toggle, Version Save.
3.  **Style**: Add "Visual Controls" panel.
