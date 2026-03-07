
import OpenAI from "openai";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/db";
import { IDEA_AGENT_PROMPT } from '@/prompts';
import { NextRequest } from "next/server";

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ systemId: string }> }
) {
    try {
        const userEmail = req.headers.get("x-user-email");
        if(!userEmail) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { systemId } = await params;
        if(!systemId) {
            return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400 });
        }

        // Save User Message synchronously before streaming
        const lastUserMessage = { role: 'user' as const, content: await req.text() };
        const updateResult = await docClient.send(new UpdateCommand({
            TableName: "QlarifyCore",
            Key: { PK: `USER#${userEmail}`, SK: `SYSTEM#${systemId}` },
            UpdateExpression: "SET messages = list_append(if_not_exists(messages, :empty_list), :msg)",
            ExpressionAttributeValues: {
                ":msg": [{ ...lastUserMessage, timestamp: Date.now() }],
                ":empty_list": []
            },
            ReturnValues: "ALL_NEW"
        }));

        const messages = updateResult.Attributes?.messages || [{ ...lastUserMessage }];
        const formattedInput = messages.map((m: any) => ({
            role: m.role,
            content: m.content
        }));

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (data: any) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                };
                
                let accumulatedAiResponse = "";

                try {
                    const responseStream = openai.responses.stream({
                        model: "gpt-4o",
                        instructions: `
                            ${IDEA_AGENT_PROMPT}
                            System Id: ${systemId}
                        `,
                        input: formattedInput,
                        tools: [
                            {
                                type: "mcp",
                                server_label: "qlarify-mcp",
                                server_url: process.env.MCP_SERVER_URL || "",
                                require_approval: "never",
                                headers: {
                                    "Authorization": `Bearer ${process.env.MCP_SERVER_TOKEN}`,
                                    "x-user-email": userEmail
                                }
                            }
                        ]
                    });
                    
                    responseStream.on('response.output_item.added', (event) => {
                        const item = event.item;

                        if (item.type === "mcp_call" || item.type === "function_call") {
                            console.log("🔧 Tool Selected:", item.name);
                            console.log("Arguments:", item.arguments);
                        }
                    });

                    // 🔹 When tool execution is completed
                    responseStream.on('response.output_item.done', (event) => {
                        const item = event.item;

                        if (item.type === "mcp_call" || item.type === "function_call") {
                            console.log("✅ Tool Finished:", item.name);
                            console.log("Arguments:", item.arguments);
                            console.log("Result:", (item as any).output);
                        }
                    });

                    responseStream.on('response.output_text.delta', (event) => {
                        accumulatedAiResponse += event.delta;
                        sendEvent({ type: "reasoning", text: event.delta });
                    });

                    const finalResponse = await responseStream.finalResponse();
                    // console.log('Final Response: ', finalResponse);
                    // Save Assistant Message
                    if (accumulatedAiResponse) {
                        await docClient.send(new UpdateCommand({
                            TableName: "QlarifyCore",
                            Key: { PK: `USER#${userEmail}`, SK: `SYSTEM#${systemId}` },
                            UpdateExpression: "SET messages = list_append(if_not_exists(messages, :empty_list), :msg)",
                            ExpressionAttributeValues: {
                                ":msg": [{ role: 'assistant', content: accumulatedAiResponse, timestamp: Date.now() }],
                                ":empty_list": []
                            }
                        }));
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
