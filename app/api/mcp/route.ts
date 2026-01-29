import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Qlarify MCP Server",
    description: "MCP server for Qlarify system architecture designer",
    version: "1.0.0",
    tools_endpoint: "/api/mcp/tools"
  });
}
