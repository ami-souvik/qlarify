
import { getToken } from "next-auth/jwt";
import OpenAI from "openai";
import { SystemRepository } from "@/lib/modeling/repository";
import { PromptManager } from "@/lib/ai/PromptManager";

import { NextRequest } from "next/server";

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const body = await req.json();
    const { intent, level, user_input, context_node_id, current_architecture_context } = body;

    // Validate inputs
    if (!user_input) {
         return new Response(JSON.stringify({ error: "User input is required" }), { status: 400 });
    }

    const promptManager = new PromptManager();
    const systemPrompt = await promptManager.loadPrompt('architecture-system');

    // Construct Contextual Prompt based on Level
    let specificPrompt = "";

    if (level === 'product' && intent === 'generate') {
         specificPrompt = await promptManager.loadPrompt('architecture-generate', {
             USER_INPUT: user_input
         });
    } else if (intent === 'zoom') {
        const parentSummary = current_architecture_context?.root_summary || "";
        const parentPath = current_architecture_context?.parent_path || [];
        
        specificPrompt = await promptManager.loadPrompt('architecture-zoom', {
             LEVEL: level,
             USER_INPUT: user_input,
             PARENT_SUMMARY: parentSummary,
             PARENT_PATH: parentPath.join(' -> ')
        });
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
                        const systemId = crypto.randomUUID();
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
            
                        const repo = new SystemRepository(email);
                        await repo.saveSystem(item);
            
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
