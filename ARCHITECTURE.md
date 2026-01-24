# Qlarify - MVP Architecture & Design

## 1. High-Level Product Architecture

The system follows a simple client-server architecture designed for stateless, rapid diagram generation.

**Flow:**
1.  **User Client (Browser)**: Inputs text, requests diagram.
2.  **API Layer (FastAPI)**: Receives text, handles validation.
3.  **Intelligence Layer (LLM)**: Parses text, extracts entities/relationships, determines layout type.
4.  **Response**: API returns structured JSON (Nodes + Edges + Layout Metadata).
5.  **Rendering**: Client uses the JSON to render visual elements (Nodes/Edges) using a library like React Flow or custom SVG.

## 2. Backend API Design

**Endpoint:** `POST /api/v1/generate`

**Request Body:**
```json
{
  "description": "User clicks login. Frontend sends credentials to Auth Service. Auth Service verifies with Database.",
  "style_preference": "default" // optional (default, technical, simplified)
}
```

**Response Body:**
```json
{
  "diagram_id": "uuid-v4",
  "diagram_type": "sequence_flow", // or 'architecture', 'process'
  "nodes": [
    { "id": "n1", "label": "User", "role": "user", "icon": "user" },
    { "id": "n2", "label": "Frontend", "role": "client", "icon": "layout" },
    { "id": "n3", "label": "Auth Service", "role": "service", "icon": "server" },
    { "id": "n4", "label": "Database", "role": "database", "icon": "database" }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "clicks login" },
    { "id": "e2", "source": "n2", "target": "n3", "label": "sends credentials" },
    { "id": "e3", "source": "n3", "target": "n4", "label": "verifies" }
  ],
  "layout_hints": {
    "direction": "LR" // Left-to-Right or TD (Top-Down)
  }
}
```

## 3. Diagram Rendering Approach (Frontend)

We will use **React Flow** for the MVP. It handles the heavy lifting of node dragging, zooming, and edge connecting, allowing us to focus on the *layout* and *styling*.

*   **Auto-Layout**: We will use `dagre` or `elkjs` within the frontend to calculate node positions based on the `nodes` and `edges` received from the backend. The backend *can* provide hints, but the specific coordinates are best calculated on the client or via a layout library to fit the viewport.
*   **Styling**: Custom Node Components for specific roles (Database, User, Server) using Tailwind CSS.

## 4. LLM Prompt Strategy
(See `PROMPT_ENGINEERING.md`)
