
import { NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const command = new GetCommand({
      TableName: "QlarifyDiagram",
      Key: {
        PK: id,
        SK: 'latest'
      },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      nodes: JSON.parse(response.Item.nodes), 
      edges: JSON.parse(response.Item.edges) 
    });
  } catch (error) {
    console.error("Fetch Diagram Error:", error);
    return NextResponse.json({ error: "Failed to fetch diagram" }, { status: 500 });
  }
}
