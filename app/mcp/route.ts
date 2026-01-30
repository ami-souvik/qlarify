import { NextResponse } from "next/server";

const mcpManifest = {
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
};

export async function GET() {
  return NextResponse.json(mcpManifest);
}

// Scanner probes POST
export async function POST() {
  return NextResponse.json({ ok: true });
}

// Cloudflare / OpenAI sometimes send HEAD
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
