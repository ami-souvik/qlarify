
import { getToken } from "next-auth/jwt";
import { executeTool, mcpManifest } from "@/lib/mcp";
import OpenAI from "openai";

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        
        const { messages, systemId } = await req.json();

        // 1. Fetch Context (DB call - should be Edge compatible if using fetch/AWS SDK v3 lightweight)
        // Ensure executeTool doesn't use incompatible Node APIs
        const context = await executeTool("get_canvas_context", { systemId }, token.email);
        
        const systemPrompt = `
You are an advanced software architect AI. You are helping a user design a software system.
Current Context:
${JSON.stringify(context.productClarity, null, 2)}

Your goal is to help the user refine their product clarity (Personas, Problems, Capabilities, Data, etc.).
When the user provides input, analyze it and use the available tools to update the canvas.

GUIDELINES:
1. If the user's request is explicit and clear (e.g., "Add a User persona"), use the 'propose_clarity_update' tool with 'requiresConfirmation: false'.
2. If you are inferring something new or suggesting a complex change that the user didn't explicitly ask for, use 'propose_clarity_update' with 'requiresConfirmation: true'.
3. Always provide a brief reasoning for your actions in the tool call or your response text.
4. Maintain the existing structure of the canvas. Do not remove existing items unless asked.
5. If creating a new persona, try to link it to potential problems or capabilities.
`;

        const encoder = new TextEncoder();
        const tools = mcpManifest.tools.map(t => ({
                type: "function" as const,
                function: {
                    name: t.name,
                    description: t.description,
                    parameters: t.input_schema
                }
        }));

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
                            ...messages
                        ],
                        tools: tools,
                        tool_choice: "auto",
                        stream: true
                    });

                    let finalToolCalls: any = {};

                    for await (const chunk of response) {
                        const delta = chunk.choices[0]?.delta;
                        
                        // Streaming Text Reasoning
                        if (delta?.content) {
                            sendEvent({ type: "reasoning", text: delta.content });
                        }
                        
                        // Accumulate Tool Calls
                        if (delta?.tool_calls) {
                             for (const toolCall of delta.tool_calls) {
                                const index = toolCall.index;
                                if (!finalToolCalls[index]) {
                                    finalToolCalls[index] = {
                                        id: toolCall.id,
                                        function: { name: toolCall.function?.name, arguments: "" }
                                    };
                                }
                                if (toolCall.function?.arguments) {
                                    finalToolCalls[index].function.arguments += toolCall.function.arguments;
                                }
                            }
                        }
                    }
                    
                    // Execute Tools
                    const toolCallsArray = Object.values(finalToolCalls);
                    if (toolCallsArray.length > 0) {
                         for (const toolCall of toolCallsArray as any[]) {
                            const functionName = toolCall.function.name;
                            const argsJson = toolCall.function.arguments;
                            let args: any = {};
                            try {
                                args = JSON.parse(argsJson);
                            } catch (e) {
                                console.error("Failed to parse tool args", e);
                                sendEvent({ error: "Failed to parse tool arguments" });
                                continue;
                            }

                            if (!args.systemId) args.systemId = systemId;

                            if (functionName === "propose_clarity_update") {
                                // Execute Tool
                                const result = await executeTool(functionName, args, token.email!);
                                
                                if (result.status === "proposal_created") {
                                    const proposal = result.proposal;
                                    if (args.reasoning) (proposal as any).reasoning = args.reasoning;
                                    sendEvent({ type: "proposal", proposal });
                                } else if (result.status === "success") {
                                    sendEvent({ type: "refresh", requiresRefresh: true });
                                }
                            }
                         }
                    }

                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error: any) {
                    console.error("Stream Error", error);
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
        console.error("Reasoning Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
