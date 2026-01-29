import { NextRequest, NextResponse } from 'next/server';

// -----------------------------------------------------------------------------
// MOCK LOGIC for Next.js
// -----------------------------------------------------------------------------

function mockArchitectureGeneration(productIdea: string) {
    return {
        type: "architecture_node",
        content: {
            root_id: "system_root",
            name: productIdea,
            type: "system",
            children: [
                {
                    id: "frontend",
                    name: "Web/Mobile Client",
                    type: "interface",
                    description: "User facing application"
                },
                {
                    id: "api_gateway",
                    name: "API Gateway",
                    type: "service",
                    description: "Entry point for backend services"
                },
                {
                    id: "core_service",
                    "name": "Core Business Logic",
                    "type": "service",
                    "description": "Main application logic"
                },
                {
                    id: "database",
                    "name": "Primary Database",
                    "type": "database",
                    "description": "Persistent storage"
                }
            ],
            relationships: [
                { from: "frontend", to: "api_gateway" },
                { from: "api_gateway", to: "core_service" },
                { from: "core_service", to: "database" }
            ]
        }
    };
}

function mockArchitectureRefinement(nodeId: string, question: string) {
    return {
        type: "architecture_node_detail",
        content: {
            node_id: nodeId,
            refinement_prompt: question,
            details: {
                technology: nodeId.includes("database") ? "PostgreSQL" : "Node.js/Go",
                scalability: "Horizontal scaling configured",
                constraints: "High consistency required",
                schema_snippet: nodeId.includes("database") ? "CREATE TABLE users (id SERIAL PRIMARY KEY, ...)" : null
            }
        }
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tool, arguments: args } = body;

        if (!tool) {
            return NextResponse.json({ error: "Missing 'tool' parameter" }, { status: 400 });
        }

        let result;

        if (tool === "generate_architecture") {
            const productIdea = args?.product_idea;
            if (!productIdea) {
                return NextResponse.json({ error: "Missing 'product_idea' argument" }, { status: 400 });
            }
            result = mockArchitectureGeneration(productIdea);

        } else if (tool === "refine_architecture_node") {
            const nodeId = args?.node_id;
            const question = args?.question;
            if (!nodeId || !question) {
                return NextResponse.json({ error: "Missing 'node_id' or 'question' argument" }, { status: 400 });
            }
            result = mockArchitectureRefinement(nodeId, question);

        } else {
             return NextResponse.json({ error: `Tool '${tool}' not found` }, { status: 404 });
        }

        return NextResponse.json({ result });

    } catch (e) {
        console.error("MCP Call Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
