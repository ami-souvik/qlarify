
import { NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
  try {
    const { nodes, edges } = await req.json();

    const timestamp = new Date().toISOString();
    const diagramId = randomUUID();

    const command = new PutCommand({
      TableName: "QlarifyDiagram",
      Item: {
        PK: diagramId,
        SK: 'latest',
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        createdAt: timestamp,
      },
    });

    await docClient.send(command);

    return NextResponse.json({ diagramId, status: "success" });
  } catch (error: any) {
    // Enhanced logging for debugging
    console.error("Share Diagram Error Details:", {
        name: error.name,
        message: error.message,
        code: error.code, // AWS SDK error code
        requestId: error.$metadata?.requestId
    });
    return NextResponse.json({ 
        error: "Failed to share diagram", 
        details: error.message 
    }, { status: 500 });
  }
}

