import { Node, Edge } from 'reactflow';

export type ArchitectureLevel = 'product' | 'domain' | 'service' | 'database' | 'api' | 'infra';

export type DiagramType = 'system_overview' | 'domain_architecture' | 'service_architecture' | 'database_schema' | 'api_structure';

export interface VisualNodeData {
  architecture_node_id?: string;
  role?: string;
  description?: string;
  [key: string]: any;
}

// Re-using ReactFlow types but strict where we need it
export type VisualNode = Node<VisualNodeData>;
export type VisualEdge = Edge;

export interface ArchitectureDiagram {
  type: DiagramType;
  nodes: VisualNode[];
  edges: VisualEdge[];
  timestamp: number;
}

export interface ArchitectureNode {
  // Identity
  id: string;              // Unique slug (e.g., "quotation_service")
  name: string;            // Human-readable (e.g., "Quotation Service")
  type: ArchitectureLevel;
  
  // Context
  explanation: string;     // Why this exists
  parent_id?: string | null;      // null for root

  // Visualization (The "Diagram" for this specific node)
  diagram?: ArchitectureDiagram;

  // Hierarchy
  children: ArchitectureNode[]; 
}

// The root store state
export interface ArchitectureState {
  root: ArchitectureNode | null;
  activeNodeId: string | null;
  breadcrumbs: { id: string; name: string }[];
}
