
import { PromptManager } from "@/lib/ai/PromptManager";
import { McpServer } from "@/lib/ai/McpServer";
import OpenAI from "openai";

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const promptManager = new PromptManager();

export async function POST(req: Request) {
    try {
        const { promptName, userRequest, context } = await req.json();

        if (!promptName || !userRequest) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 1. Load System Prompt
        const variables = {
            USER_REQUEST: userRequest,
            PROJECT_CONTEXT: JSON.stringify(context || {}),
        };
        const systemPrompt = await promptManager.loadPrompt(promptName, variables); // Removed .txt assumption in PromptManager logic check

        // 2. Initialize MCP
        const mcpServer = new McpServer();
        const tools = mcpServer.getOpenAiTools();

        const encoder = new TextEncoder();

        // 3. Create Stream
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (data: any) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                };

                try {
                    // Initial stream
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: "Begin analysis." }
                        ],
                        tools: tools,
                        tool_choice: "auto",
                        stream: true,
                    });

                    let finalToolCalls: any = {};

                    for await (const chunk of response) {
                        const delta = chunk.choices[0]?.delta;

                        // Case 1: Text Content
                        if (delta?.content) {
                            sendEvent({ type: "content", text: delta.content });
                        }

                        // Case 2: Tool Calls (Accumulate them)
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

                    // 4. Handle Tool Execution
                    const toolCallsArray = Object.values(finalToolCalls);
                    if (toolCallsArray.length > 0) {
                        sendEvent({ type: "tool_start", count: toolCallsArray.length });
                        
                        for (const toolCall of toolCallsArray as any[]) {
                            const name = toolCall.function.name;
                            const args = JSON.parse(toolCall.function.arguments);
                            
                            sendEvent({ type: "tool_log", name, args });

                            const result = await mcpServer.executeTool(name, args);
                            
                            sendEvent({ type: "tool_result", name, result });
                        }
                    }

                    // End stream
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();

                } catch (error: any) {
                    console.error("Stream Error:", error);
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
        console.error("Agent Run Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
