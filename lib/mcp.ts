
import { docClient } from "@/lib/db";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const mcpManifest = {
  protocol: "mcp",
  version: "1.0",
  tools: [
    {
      name: "get_canvas_context",
      description: "Gets the current structured product clarity and architecture graph context.",
      input_schema: {
        type: "object",
        properties: {
          systemId: { type: "string", description: "The ID of the system to fetch context for" }
        },
        required: ["systemId"]
      }
    },
    {
      name: "propose_clarity_update",
      description: "Proposes updates to the product clarity model (Phase 1).",
      input_schema: {
        type: "object",
        properties: {
          systemId: { type: "string" },
          requiresConfirmation: { 
            type: "boolean", 
            description: "Set to true if this is a suggestion or new idea that needs user approval. Set to false if this is a direct response to a user's explicit instruction." 
          },
          reasoning: { type: "string", description: "Brief explanation of why this update is being made." },
          clarityUpdates: {
            type: "object",
            properties: {
              overview: { type: "string" },
              personas: { type: "array", items: { type: "object" } },
              problems: { type: "array", items: { type: "string" } },
              capabilities: { type: "array", items: { type: "string" } },
              dataInputs: { type: "array", items: { type: "string" } },
              dataOutputs: { type: "array", items: { type: "string" } },
              externalSystems: { type: "array", items: { type: "string" } },
              constraints: { type: "array", items: { type: "string" } },
              nonFunctionalRequirements: { type: "array", items: { type: "string" } },
              todos: { type: "object" }
            }
          }
        },
        required: ["systemId", "clarityUpdates", "requiresConfirmation"]
      }
    }
  ]
};

export async function executeTool(name: string, args: any, email: string) {
  switch (name) {
    case "get_canvas_context": {
      const { systemId } = args;
      const res = await docClient.send(new GetCommand({
        TableName: "QlarifyCore",
        Key: { PK: `USER#${email}`, SK: `SYSTEM#${systemId}` }
      }));

      if (!res.Item) throw new Error("System not found");

      return {
        productClarity: res.Item.productClarity,
        architectureRoot: res.Item.nodes?.[0] || null,
        status: res.Item.status
      };
    }

    case "propose_clarity_update": {
      const { systemId, clarityUpdates, requiresConfirmation } = args;
      
      // If confirmation is required, we do NOT update the DB. 
      // We return the proposal so the calling layer can handle it (e.g. send to frontend).
      if (requiresConfirmation) {
        return {
          status: "proposal_created",
          proposal: clarityUpdates,
          message: "Proposal created, pending user confirmation."
        };
      }

      // If no confirmation required, we update the DB immediately (Auto-apply)
      // 1. Fetch current state to merge
      const getRes = await docClient.send(new GetCommand({
        TableName: "QlarifyCore",
        Key: { PK: `USER#${email}`, SK: `SYSTEM#${systemId}` }
      }));

      const existingClarity = getRes.Item?.productClarity || {};
      
      // 2. Merge updates
      const mergedClarity = { ...existingClarity, ...clarityUpdates };
      
      // Ensure arrays are merged or appended based on logic (simple spread merges properties, specific sections need array concatenation?)
      // For simplicity, we assume the LLM sends the *complete* list for a section if it updates it, or we can just replace the section.
      // Replacing the section (e.g. personas) is usually safer than blind concatenation which might duplicate.
      // So { ...existing, ...updates } is correct if updates contains the full new state of that section.
      
      await docClient.send(new UpdateCommand({
        TableName: "QlarifyCore",
        Key: { PK: `USER#${email}`, SK: `SYSTEM#${systemId}` },
        UpdateExpression: "SET productClarity = :pc, updatedAt = :ua",
        ExpressionAttributeValues: {
          ":pc": mergedClarity,
          ":ua": new Date().toISOString()
        }
      }));

      return { status: "success", message: "Clarity model updated successfully." };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
