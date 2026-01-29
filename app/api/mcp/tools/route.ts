import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    tools: [
      {
        name: "generate_architecture",
        description: "Generate a high-level system architecture from a product idea",
        input_schema: {
          type: "object",
          properties: {
            product_idea: { type: "string" }
          },
          required: ["product_idea"]
        }
      },
      {
        name: "refine_architecture_node",
        description: "Refine a specific architecture node (domain, service, database, or API)",
        input_schema: {
          type: "object",
          properties: {
            node_id: { type: "string" },
            question: { type: "string" }
          },
          required: ["node_id", "question"]
        }
      }
    ]
  });
}
