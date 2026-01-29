import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    protocol: "mcp",
    version: "1.0",
    tools: [
      {
        name: "ping",
        description: "Health check tool",
        input_schema: {
          type: "object",
          properties: {}
        }
      }
    ]
  });
}
