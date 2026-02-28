import { getToken } from "next-auth/jwt";
import { executeTool, mcpManifest } from "@/lib/mcp";
import OpenAI from "openai";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/db";
import { PRODUCT_CLARITY_ORCHESTRATOR_PROMPT } from '@/prompts';
import { NextRequest } from "next/server";

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        
        const systemId = req.nextUrl.searchParams.get("systemId");
        if(!systemId) {
            return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400 });
        }

        // Save User Message synchronously before streaming
        const lastUserMessage = { role: 'user' as const, content: await req.text() };
        await docClient.send(new UpdateCommand({
            TableName: "QlarifyCore",
            Key: { PK: `USER#${token.email}`, SK: `SYSTEM#${systemId}` },
            UpdateExpression: "SET messages = list_append(if_not_exists(messages, :empty_list), :msg)",
            ExpressionAttributeValues: {
                ":msg": [{ ...lastUserMessage, timestamp: Date.now() }],
                ":empty_list": []
            }
        }));

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
                
                let accumulatedAiResponse = "";

                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: PRODUCT_CLARITY_ORCHESTRATOR_PROMPT },
                            lastUserMessage
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
                            accumulatedAiResponse += delta.content;
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
                    
                    // Save Assistant Message
                    if (accumulatedAiResponse) {
                        await docClient.send(new UpdateCommand({
                            TableName: "QlarifyCore",
                            Key: { PK: `USER#${token.email}`, SK: `SYSTEM#${systemId}` },
                            UpdateExpression: "SET messages = list_append(if_not_exists(messages, :empty_list), :msg)",
                            ExpressionAttributeValues: {
                                ":msg": [{ role: 'assistant', content: accumulatedAiResponse, timestamp: Date.now() }],
                                ":empty_list": []
                            }
                        }));
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
