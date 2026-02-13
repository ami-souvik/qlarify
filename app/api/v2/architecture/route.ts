import { NextResponse } from "next/server";
import { ArchitectureNode, ArchitectureLevel } from "@/types/architecture";
import OpenAI from "openai";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize the DynamoDB Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { intent, level, user_input, context_node_id, current_architecture_context } = body;

    // Validate inputs
    if (!user_input) {
         return NextResponse.json({ error: "User input is required" }, { status: 400 });
    }

    const systemPrompt = `
      You are a System Architect.
      Your goal is to define a hierarchical system architecture for a software product.
      
      Output MUST be strictly valid JSON matching the 'ArchitectureNode' structure wrapped in a root object: { "architecture_node": ... }.
    `;

    // Construct Contextual Prompt based on Level
    let specificPrompt = "";

    if (level === 'product' && intent === 'generate') {
         specificPrompt = `
            Task: Create the ROOT Product Architecture for: "${user_input}".
            
            1. Identify the core Domains (Bounded Contexts).
            2. Identify key Personas / Actors (Users, Admins, etc.).
            3. Identify critical External Systems.
            4. The 'diagram' should be a High-Level Strategic Mindmap.
               - Nodes: Include Product, Domains, Personas, and External Systems.
               - Edges: JOIN THEM MEANINGFULLY. 
                 - Show how Personas interact with specific Domains.
                 - Show how Domains depend on each other.
                 - Show how Domains interface with External Systems.
                 - DO NOT just connect everything to the center. Create a web of interactions.
            5. The 'children' array MUST contain:
               - ArchitectureNode definitions for each Domain (type: "domain").
               - ArchitectureNode definitions for each Persona (type: "user").
               - ArchitectureNode definitions for each External System (type: "external").
            
            JSON Structure Example:
            {
               "architecture_node": {
                  "id": "product_id",
                  "name": "Project Name",
                  "type": "product",
                  "explanation": "...",
                  "children": [...],
                  "diagram": {
                     "type": "system_overview",
                     "nodes": [
                        { "id": "p_user", "type": "custom", "data": { "label": "Customer", "role": "user", "architecture_node_id": "..." }, "position": { "x": -200, "y": 0 } },
                        { "id": "d_core", "type": "custom", "data": { "label": "Core Engine", "role": "domain", "architecture_node_id": "..." }, "position": { "x": 0, "y": 0 } },
                        { "id": "e_stripe", "type": "custom", "data": { "label": "Stripe", "role": "external", "architecture_node_id": "..." }, "position": { "x": 200, "y": 0 } }
                     ],
                     "edges": [
                        { "id": "e1", "source": "p_user", "target": "d_core", "label": "uses" },
                        { "id": "e2", "source": "d_core", "target": "e_stripe", "label": "pays via" }
                     ]
                  }
               }
            }
         `;
    } else if (intent === 'zoom') {
        const parentSummary = current_architecture_context?.root_summary || "";
        const parentPath = current_architecture_context?.parent_path || [];
        
        specificPrompt = `
            Task: Zoom into the "${level}" node: "${user_input}".
            Parent Context: ${parentSummary}
            Path: ${parentPath.join(' -> ')}
            
            1. Decompose this ${level} into its components.
            2. Create the 'diagram' for THIS node.
            3. Populate 'children' with logical next-level nodes.
            
            Return the *single* target node as the root of "architecture_node".
        `;
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Stronger reasoning for architecture
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: specificPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Deterministic
    });

    const content = completion.choices[0].message.content;
    const jsonResponse = JSON.parse(content || "{}");

    // Save to DynamoDB if session exists and architecture was generated
    if (session?.user?.email && jsonResponse.architecture_node) {
        try {
            const email = session.user.email;
            const systemId = randomUUID();
            const timestamp = new Date().toISOString();
            const root = jsonResponse.architecture_node;

            // Extract Strategic Metadata for optimized indexing/quick views
            const strategicSummary = {
                domains: root.children
                    .filter((c: any) => c.type === 'domain')
                    .map((c: any) => ({ id: c.id, name: c.name })),
                personas: root.diagram?.nodes
                    ?.filter((n: any) => n.data?.role === 'user')
                    .map((n: any) => n.data.label) || [],
                externalSystems: root.diagram?.nodes
                    ?.filter((n: any) => n.data?.role === 'external')
                    .map((n: any) => n.data.label) || []
            };
            
            const item = {
                PK: `USER#${email}`,
                SK: `SYSTEM#${systemId}`,
                id: systemId,
                type: 'system',
                status: 'strategic', // Mark as strategic level mindmap
                title: root.name || "System Architecture",
                description: root.explanation || "",
                strategic_summary: strategicSummary, // Optimized structure for high-level view
                nodes: [root],
                metadata: {
                    intent: intent,
                    initialLevel: level,
                    originalPrompt: user_input,
                    nodeCount: root.children?.length || 0
                },
                createdAt: timestamp,
                updatedAt: timestamp
            };

            await docClient.send(new PutCommand({
                TableName: "QlarifyCore",
                Item: item
            }));

            // Add the saved ID to the response
            jsonResponse.system_id = systemId;
        } catch (dbError) {
            console.error("Failed to save architecture to DynamoDB:", dbError);
        }
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Architecture Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate architecture" }, { status: 500 });
  }
}
