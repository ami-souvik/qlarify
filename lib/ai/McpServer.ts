
import { z } from "zod";

// Define a standardized tool interface matching OpenAI's expectations
export interface Tool {
  name: string;
  description: string;
  parameters: any; // JSON Schema
  execute: (args: any) => Promise<any>;
}

export class McpServer {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.registerTool({
      name: "save_artifact",
      description: "Generates an artifact (code, report, etc.). In Edge mode, this returns the content for client-side handling.",
      parameters: {
        type: "object",
        properties: {
          filename: { 
            type: "string", 
            description: "Suggested filename for the artifact." 
          },
          content: { 
            type: "string", 
            description: "The content of the file." 
          },
          type: {
             type: "string", 
             enum: ["code", "report", "data"],
             description: "Type of artifact."
          }
        },
        required: ["filename", "content", "type"]
      },
      execute: async ({ filename, content, type }) => {
        // In Edge Runtime, we cannot write to disk.
        // We return the content so the client (or the API response handler) can decide what to do.
        console.log(`[MCP] Generated artifact: ${filename} (${type})`);
        
        return { 
            success: true, 
            message: "Artifact generated successfully. Client should save this content.",
            artifact: {
                filename,
                content,
                type
            }
        };
      }
    });

    // Add specific tool for product clarity logic used in prompts
    this.registerTool({
        name: "propose_clarity_update",
        description: "Propose a structured update to the Product Clarity Model.",
        parameters: {
            type: "object",
            properties: {
                section: { type: "string" },
                changes: { 
                    type: "object",
                    properties: {
                        add: { type: "array", items: { type: "string" } },
                        update: { type: "array", items: { type: "string" } },
                        remove: { type: "array", items: { type: "string" } }
                    }
                },
                confidence: { type: "string", enum: ["low", "medium", "high"] },
                reasoning_summary: { type: "string" }
            },
            required: ["section", "changes", "reasoning_summary"]
        },
        execute: async (args) => {
             // Return the proposal so it can be streamed to client
             return {
                 status: "proposal_created",
                 proposal: args
             };
        }
    });
  }

  public registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  public getOpenAiTools() {
    return Array.from(this.tools.values()).map(tool => ({
        type: "function" as const,
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }
    }));
  }

  public async executeTool(name: string, args: any) {
    const tool = this.tools.get(name);
    if (!tool) {
        throw new Error(`Tool ${name} not found.`);
    }
    try {
        console.log(`[MCP] Executing tool: ${name} with args:`, JSON.stringify(args).slice(0, 100) + "...");
        return await tool.execute(args);
    } catch (error: any) {
        console.error(`Tool execution failed: ${name}`, error);
        return { error: error.message };
    }
  }
}
