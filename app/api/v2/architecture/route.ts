
import { getToken } from "next-auth/jwt";
import OpenAI from "openai";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from '@/lib/db';
import { randomUUID } from "crypto";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json();
    const { intent, level, user_input, context_node_id, current_architecture_context } = body;

    // Validate inputs
    if (!user_input) {
         return new Response(JSON.stringify({ error: "User input is required" }), { status: 400 });
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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: specificPrompt }
                    ],
                    // We need JSON object here, but standard stream yields partial JSON strings.
                    // For architecture generation, it is safer to let the model stream tokens, 
                    // and we accumulate on client or wrapper.
                    // However, we forced response_format: { type: "json_object" }.
                    // OpenAI stream with json_object still streams tokens, but ensures valid JSON at end.
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    stream: true
                });

                let fullContent = "";

                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    fullContent += content;
                    if (content) {
                        sendEvent({ type: "content", text: content });
                    }
                }

                // After streaming completes, parse and save to DB
                let jsonResponse: any = {};
                try {
                    jsonResponse = JSON.parse(fullContent);
                } catch (e) {
                    console.error("Invalid JSON generated", e);
                    sendEvent({ error: "Failed to parse generated architecture" });
                }

                if (token?.email && jsonResponse.architecture_node) {
                    try {
                        const email = token.email;
                        const systemId = randomUUID();
                        const timestamp = new Date().toISOString();
                        const root = jsonResponse.architecture_node;
            
                        // Extract Strategic Metadata
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
                            status: 'strategic',
                            title: root.name || "System Architecture",
                            description: root.explanation || "",
                            strategic_summary: strategicSummary,
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
            
                        // Send the system ID event
                        sendEvent({ type: "saved", system_id: systemId });
                        
                    } catch (dbError) {
                        console.error("Failed to save architecture to DynamoDB:", dbError);
                        sendEvent({ error: "Failed to save system" });
                    }
                } else if (!token?.email) {
                    console.log("No user session, skipping save");
                }

                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
            } catch (error: any) {
                console.error("Stream error", error);
                sendEvent({ error: error.message });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });

  } catch (error: any) {
    console.error("Architecture Gen Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate architecture" }), { status: 500 });
  }
}
