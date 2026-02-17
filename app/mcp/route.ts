import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const mcpManifest = {
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
              nonFunctionalRequirements: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["systemId", "clarityUpdates"]
      }
    },
    {
      name: "propose_architecture_change",
      description: "Proposes structural changes to the architecture graph (Phase 2).",
      input_schema: {
        type: "object",
        properties: {
          systemId: { type: "string" },
          nodesToAdd: { type: "array", items: { type: "object" } },
          edgesToAdd: { type: "array", items: { type: "object" } },
          nodesToRemove: { type: "array", items: { type: "string" } }
        },
        required: ["systemId"]
      }
    }
  ]
};

export async function GET() {
  return NextResponse.json(mcpManifest);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { method, params } = body;
    const email = session.user.email;

    if (method === "tools/call") {
      const { name, arguments: args } = params;

      switch (name) {
        case "get_canvas_context": {
          const { systemId } = args;
          const res = await docClient.send(new GetCommand({
            TableName: "QlarifyCore",
            Key: { PK: `USER#${email}`, SK: `SYSTEM#${systemId}` }
          }));

          if (!res.Item) return NextResponse.json({ error: "System not found" }, { status: 404 });

          return NextResponse.json({
            result: {
              productClarity: res.Item.productClarity,
              architectureRoot: res.Item.nodes?.[0] || null,
              status: res.Item.status
            }
          });
        }

        case "propose_clarity_update": {
          const { systemId, clarityUpdates } = args;
          // In a real MCP implementation, this might create a 'PROPOSAL' event
          // For now, we interact with the system record directly as a 'mutation engine'
          
          const updateExpression = [];
          const expressionAttributeValues: any = {};
          const expressionAttributeNames: any = {};

          if (clarityUpdates) {
             // We use a simplified update for the prototype
             // In production, we'd use a more granular JSON mapping
             await docClient.send(new UpdateCommand({
                TableName: "QlarifyCore",
                Key: { PK: `USER#${email}`, SK: `SYSTEM#${systemId}` },
                UpdateExpression: "SET productClarity = :pc, updatedAt = :ua",
                ExpressionAttributeValues: {
                    ":pc": clarityUpdates,
                    ":ua": new Date().toISOString()
                }
             }));
          }

          return NextResponse.json({ result: { success: true, message: "Clarity model updated" } });
        }

        default:
          return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  } catch (error: any) {
    console.error("MCP Tool Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
