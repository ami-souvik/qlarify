import { getToken } from "next-auth/jwt";
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
                        ${PRODUCT_CLARITY_ORCHESTRATOR_PROMPT}
                        Here's some information:
                        User ID: ${token.email}
                        System ID: ${systemId}
                        `,
                        input: [
                            lastUserMessage
                        ],
                        tools: [
                            {
                                type: "mcp",
                                server_label: "qlarify-mcp",
                                server_url: process.env.MCP_SERVER_URL,
                                require_approval: "never",
                            }
                        ]
                    });
                    
                    responseStream.on('response.output_item.added', (event) => {
                        console.log('Output Item Added: ', event);
                        
                        const item = event.item;

                        if (item.type === "mcp_call" || item.type === "function_call") {
                            console.log("🔧 Tool Selected:", item.name);
                            console.log("Arguments:", item.arguments);
                        }
                    });

                    // 🔹 When tool execution is completed
                    responseStream.on('response.output_item.done', (event) => {
                        console.log('Output Item Done: ', event);

                        const item = event.item;

                        if (item.type === "mcp_call" || item.type === "function_call") {
                            console.log("✅ Tool Finished:", item.name);
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
                            Key: { PK: `USER#${token.email}`, SK: `SYSTEM#${systemId}` },
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
