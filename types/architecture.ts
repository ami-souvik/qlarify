import { Node, Edge } from 'reactflow';

export type ArchitectureLevel = 'product' | 'domain' | 'service' | 'database' | 'datastore' | 'api' | 'event' | 'infra' | 'user' | 'external' | 'persona';

export type DiagramType = 'system_overview' | 'domain_architecture' | 'service_architecture' | 'database_schema' | 'api_structure';

export type AppMode = 'PRODUCT_CLARITY' | 'ARCHITECTURE';

export interface Persona {
  id: string;
  name: string;
  role: string;
  goals: string[];
}

export interface ProductClarityTodos {
  overview?: string[];
  personas?: string[];
  problems?: string[];
  capabilities?: string[];
  dataInputs?: string[];
  dataOutputs?: string[];
  externalSystems?: string[];
  constraints?: string[];
  nonFunctionalRequirements?: string[];
  [key: string]: string[] | undefined;
}

export interface ProductClarity {
  overview: string;
  personas: Persona[];
  problems: string[];
  capabilities: string[];
  dataInputs: string[];
  dataOutputs: string[];
  externalSystems: string[];
  constraints: string[];
  nonFunctionalRequirements: string[];
  todos?: ProductClarityTodos;
}

export interface VisualNodeData {
  architecture_node_id?: string;
  role?: string;
  description?: string;
  [key: string]: any;
}

// Re-using ReactFlow types but strict where we need it
export type VisualNode = Node<VisualNodeData>;

export type RelationshipType = 
  | 'CONTAINS' 
  | 'CALLS' 
  | 'PUBLISHES' 
  | 'SUBSCRIBES' 
  | 'DEPENDS_ON' 
  | 'INTERACTS_WITH';

export type VisualEdge = Edge & {
  type?: string;
  data?: {
    relationship?: RelationshipType;
  };
};

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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SystemLog {
  id: string;
  message: string;
  timestamp: number;
}

// The root store state
export interface ArchitectureState {
  mode: AppMode;
  productClarity: ProductClarity | null;
  root: ArchitectureNode | null;
  activeNodeId: string | null;
  breadcrumbs: { id: string; name: string }[];
  messages: ChatMessage[];
  logs: SystemLog[];
}
