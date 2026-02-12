# Qlarify - Collaborative System Architecture Design & Reasoning Platform

## 1. Product Re-Definition
*   **Mission**: A high-fidelity modeling platform where the diagram is a visual projection of a structured, verifiable system specification.
*   **Target**: Principal Architects and Lead Engineers.
*   **Value Prop**: Bridge the gap between "drawing a box" and "defining a service boundary" with AI-driven sanity checks and team-wide structural consistency.

## 2. New Domain Architecture
### Modeling Domain (Core)
*   **Graph Engine Service**: Validates structural invariants (e.g., circular dependencies, boundary violations).
*   **Schema Registry**: Manages architectural primitives (Services, Databases, Gateways).
### Temporal Domain
*   **Timeline Service**: Manages immutable snapshots and branching.
*   **Diff Engine**: Calculates structural delta between two system states.
### Reasoning Domain (AI)
*   **Context Orchestrator**: Hydrates LLM prompts with relevant graph sub-sections and historical decisions.
*   **Advisory Service**: Generates non-binding "Structural Suggestions" based on patterns (Microservices, Event-Driven, etc.).
### Collaboration Domain
*   **Presence Service**: Tracking user cursors and active focus nodes.
*   **Synchronization Service**: Handling concurrent edits to the graph using CRDTs.

## 3. Canonical Architecture Model
### Node Types
*   `Entity`: System, Container, Component, Actor.
*   `Boundary`: Logical grouping (Cloud Provider, VPC, Subnet, Domain).
*   `Infrastructure`: Specific managed services (RDS, S3, Kafka).
### Relationship Types
*   `Synchronous`: REST, gRPC, GraphQL.
*   `Asynchronous`: Pub/Sub, Event, Batch.
*   `Composition`: Contains/Belongs-To.
### Invariants
*   Every `Component` must reside within exactly one `Container`.
*   Circular dependencies between `Systems` trigger warnings.
*   Cross-boundary communication must go through defined `Gateways`.

## 4. LLM Orchestration Design
*   **Session Model**: Stateless requests with a "Contextual Window" of the current graph view.
*   **Context Builder**: Extracts active viewport nodes, related upstream/downstream dependencies, and current "Architecture Principles".
*   **Suggestion Pipeline**: AI output is typed as `DraftProposal` (JSON). Rendered as a "Ghost Layer". Requires explicit promotion to canonical state.
*   **Determinism**: Strict Schema parser rejects malformed AI outputs.

## 5. Real-Time Collaboration Design
*   **Sync Model**: **CRDT** for graph structure.
*   **Conflict Resolution**: Last-Writer-Wins for aesthetics; Semantic merging for structure.
*   **Event Broadcasting**: WebSockets for sub-100ms latency.

## 6. Versioning & Diff Engine
*   **Snapshot Model**: Every "Commit" is a full immutable state.
*   **Diff Types**: `Structural` (Nodes/Edges), `Metadata` (Tech/SLOs), `Visual` (Layout).
*   **Evolution Tracking**: Milestone tagging.

## 7. Infrastructure Layer
*   **Persistence**: DynamoDB (Ledger style: `PK: WORKSPACE#id`, `SK: EVENT#timestamp`).
*   **API Gateway**: GraphQL/AppSync for efficient graph queries.
*   **Real-time Layer**: WebSockets for live state sync.

## 8. Migration Strategy

### Components to Delete
*   `app/api/diagram/route.ts`: Blob-based persistence is obsolete.
*   `app/app/flowchart`: Product focus is strictly architecture.
*   `components/canvas/QlarifyFlow.tsx`: Lightweight SVG renderer lacks enterprise features.

### Reusable Infrastructure
*   **Authentication**: NextAuth configuration.
*   **Layout Shell**: Sidebar/Shell skeleton.
*   **DynamoDB Client**: Connection logic and error handling.

### Refactor Phases
1.  **Phase 1 (Data Model)**: Implement Structured Graph Schema in DynamoDB.
2.  **Phase 2 (Graph Engine)**: Build modeling canvas with strict node types.
3.  **Phase 4 (Reasoning)**: Introduce AI Ghost Layer.

## 9. Risks & Architectural Pitfalls
*   **Graph Complexity**: DOM performance at scale. (Mitigation: Virtualization).
*   **AI Hallucinations**: Invalid connections. (Mitigation: Graph Engine validation).
*   **Sync Drift**: Concurrent edit collisions. (Mitigation: Server-authoritative validation).
