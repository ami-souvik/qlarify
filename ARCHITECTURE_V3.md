# Qlarify V3 Architecture: System Architecture Designer

## 1. Core Philosophy Shift
Qlarify evolves from a simple diagram generator into a **guided system design workspace**.

This capability is **not an extension of the existing dashboard diagram component**.  
Instead, it is implemented as a **new, dedicated, authenticated experience**, available only to logged-in users.

The system model is no longer a flat list of nodes; it is a **hierarchical architecture tree**.
Users start with a high-level concept and **zoom in** to explore domains, services, databases, and APIs.

**Key Principles:**
1. **Architecture is a Tree**: A system is composed of Product -> Domains -> Components -> Internals.
2. **Scopes, Not Canvases**: Diagrams are generated per architecture node, not globally.
3. **Deterministic Explanations**: Every node has purpose, scope, and children  
4. **Preservation**: Refining deeper scopes never mutates higher-level context  
5. **Authenticated Ownership**: Architecture trees belong to a logged-in user  

---

## 2. Component Separation (New)

### 2.1 Existing Component (Unchanged)

**Component:** `DiagramRenderer`

This component remains **unchanged** and continues to serve quick, one-off diagram generation.

---

### 2.2 New Component: Architecture Designer (V3)

**Component:** `ArchitectureDesigner`

- Available **only after login**
- Stateful and user-owned
- Manages a persistent Architecture Tree
- Supports scoped refinement and exploration
- Acts as the **source of truth** for a system’s design

This component is a **separate route, state store, and UI surface**, not a mode switch of the existing dashboard.

**Example routes:**
/app/architecture
/app/architecture/:projectId

## 3. Architecture Tree Data Model (New)

The central data structure is the **Architecture Tree**.

```typescript
type ArchitectureLevel = 'product' | 'domain' | 'service' | 'database' | 'api' | 'infra';

interface ArchitectureNode {
  // Identity
  id: string;              // Unique slug (e.g., "quotation_service")
  name: string;            // Human-readable (e.g., "Quotation Service")
  type: ArchitectureLevel;
  
  // Context
  explanation: string;     // Why this exists
  parent_id?: string;      // null for root

  // Visualization (The "Diagram" for this specific node)
  // When looking AT this node, what do we see?
  // e.g. For 'Product', we see the Domain Diagram.
  diagram?: {
    type: 'system_overview' | 'domain_architecture' | 'service_architecture' | 'database_schema' | 'api_structure';
    nodes: VisualNode[];
    edges: VisualEdge[];
  };

  // Hierarchy
  children: ArchitectureNode[]; // Sub-components (e.g., Tables inside a DB, Endpoints inside a Service)
}

// ReactFlow specific visual data (subset of our existing V2 model)
interface VisualNode {
  id: string;
  label: string;
  data: {
    // We link back to the architecture tree if this node represents a child we can zoom into
    architecture_node_id?: string; 
    role?: string;
    description?: string;
  };
}
```

---

## 4. Workflow & UX

### 4.1 The Navigation Path
Users navigate through the tree. The UI must always show a **Breadcrumb**:
`Interior Studio (Product)` -> `Quotation System (Domain)` -> `Postgres DB (Database)`

### 4.2 Zooming Behavior
1.  User clicks a node in the "Domain View" (e.g., "Quotation Service").
2.  User selects "Explain / Zoom In".
3.  **Frontend** checks if `children` already exist.
    *   If **Yes**: Load the child diagram immediately.
    *   If **No**: Call `POST /api/v2/architecture` with `context_node_id` to generate them.
4.  **UI Switch**: The Canvas clears and renders the *new scoped diagram*.
5.  **History**: The previous view is pushed to stack (Architecture Explorer logic).

---

## 5. API Contract

**Endpoint:** `POST /api/v2/architecture`

### Request
```json
{
  "intent": "generate" | "zoom",
  "level": "product" | "domain" | "service" | "database" | "api",
  "user_input": "I need a CRM for..." (for root) OR "Explain the auth service" (for zoom),
  "context_node_id": "optional_parent_id_if_zooming",
  "current_architecture_context": {
      // Summary of the tree so far to ensure consistency
      "root_summary": "Interior Design Platform...",
      "parent_path": ["root", "quotation_domain"]
  }
}
```

### Response
```json
{
  "architecture_node": {
    "id": "quotation_service",
    "name": "Quotation Service",
    "type": "service",
    "explanation": "Handles pricing logic and PDF generation...",
    "children": [ ... ], // If generated recursively (optional)
    "diagram": {
        "diagram_type": "service_architecture",
        "nodes": [
            { "id": "db", "label": "Quotation DB", "data": { "architecture_node_id": "quotation_db" } },
            { "id": "api", "label": "REST API" }
        ],
        "edges": [ ... ]
    }
  }
}
```

---

## 6. Backend LLM Responsibilities

The LLM is now a **Structured Architect**. It does NOT draw. It defines structure.

### Prompting Strategy (Top-Down)
1.  **Product Level**: Identify Domains. (e.g., "Sales", "Inventory").
2.  **Domain Level**: Identify Services + Shared Infra. (e.g., "API Gateway", "Auth Service", "Product DB").
3.  **Service Level**: Identify Internals. (e.g., "Worker", "API", "Cache").
4.  **Database Level**: Identify Tables.
5.  **API Level**: Identify Endpoint Groups.

**Constraint**: The LLM must receive the *Path to Root* to avoid hallucinations. It must know "I am inside the Quotation Domain" so it doesn't re-invent the User Service.

---

## 7. Frontend: Architecture Explorer

We introduce a side-panel or overlay: **The System Map**.

-   **Tree View**: Collapsible tree of the system.
-   **Canvas**: Renders the *current active node's* diagram.
-   **State**:
    -   `activeNodeId`: string
    -   `tree`: ArchitectureNode (Root)

### V2 Compatibility
We retain V2 features within the *Canvas*:
-   **Locking**: Users can lock positions of the *current* diagram.
-   **Styling**: Applies to the *current* diagram.
-   **Versions**: Functionality remains, but scoped to the *entire tree* state (snapshotting the whole project).

---

## 8. Scope & Boundaries (V3 vs V2)

| Feature | V2 (Current) | V3 (New) |
| :--- | :--- | :--- |
| **Model** | Flat Graph | Hierarchical Tree |
| **Generation** | "Regenerate all" | "Zoom and Expand" |
| **Context** | Single Prompt | Parent Context Awareness |
| **Navigation** | Pan/Zoom Canvas | Breadcrumbs + Tree Drill-down |
| **Persistence** | LocalStorage (Flat) | LocalStorage (Tree) |

**What we are NOT building yet:**
-   Code generation for the architecture.
-   Terraform export.
-   Real-time multi-user collaboration.

---

## 9. Implementation Plan

1.  Introduce ArchitectureDesigner route and authenticated layout.
2.  **Data Model**: Create `ArchitectureNode` types.
3.  **State**: Create `ArchitectureProvider` to hold the tree.
4.  **UI**: Add Breadcrumb navigation bar above Canvas.
5.  **Backend**: Implement the recursive/scoped generation prompts.
6.  **Integration**: Connect "Zoom" click action to API call.
