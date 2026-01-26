# Qlarify v2 Implementation Plan

## Phase 1: Foundations & State Management
**Goal**: Decouple rendering from logic and establish the "Editor" context.

- [ ] **Refactor `DiagramRenderer.tsx`**:
    - Remove internal state (`useNodesState`, `useEdgesState` local usage).
    - Accept `nodes`, `edges`, `onNodesChange`, `onEdgesChange` as props.
    - Expose `onNodeUpdate` callback for label/role changes.
- [ ] **Create `useDiagramStore` (or reducer)**:
    - Manage `currentVersion` (nodes/edges).
    - Manage `history` (undo/redo).
    - Manage `viewMode` ('dev' | 'client').

## Phase 2: Core V2 Features (Locking & Views)
**Goal**: Enable trust and audience-specific views.

- [ ] **Update Node Schema**:
    - Add `locked`, variable `hidden` (based on view), `style` properties.
- [ ] **Implement Locking**:
    - Add "Lock/Unlock" button to the Node Toolbar.
    - When `locked` is true, prevent Dragging (via ReactFlow `draggable: false`).
- [ ] **Implement View Modes**:
    - Add Global Toggle: "Client View" vs "Dev View".
    - Logic: In "Client View", hide nodes with `role: 'queue' | 'database'` (or specific flags).
    - Animate transitions (framer-motion).

## Phase 3: Iteration & Visual Controls
**Goal**: Allow user to refine without the LLM.

- [ ] **Enhanced Visual Panel**:
    - Sidebar or Floating Panel with:
        - Theme Selector (Light/Dark/Neutral).
        - Edge Style (Straight/Step/Curved).
        - Node Sizing presets.
- [ ] **Manual Node Management**:
    - "Add Node" button (manual).
    - "Connect" mode (draw edges manually).
- [ ] **Styling Implementation**:
    - Pass style props down to `CustomNode`.

## Phase 4: Versioning
**Goal**: Save points.

- [ ] **Version History UI**:
    - "Save Version" button.
    - List of saved versions.
    - "Restore" function.
- [ ] **Diff View** (Stretch):
    - Simple side-by-side or just instantaneous switching.

## Phase 5: Export & Sharing
**Goal**: High-quality exports.

- [ ] **SVG Export**:
    - Implement `toSvg` alongside PNG.
- [ ] **Share URLs**:
    - Implement `lz-string` or similar to encode the *entire* graph state (nodes/edges) into the URL, not just the prompt. This allows sharing *edits*.

## Execution Order
1.  **Frontend State Refactor** (Critical path).
2.  **Node/Edge Type Updates**.
3.  **UI Components** (Toolbar, Sidebar).
4.  **Export/Share Utilities**.
