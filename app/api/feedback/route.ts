
import { NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

// Initialize the DynamoDB Client
// The SDK will automatically pick up credentials from process.env if set
// (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
  try {
    const { rating, comment } = await req.json();

    const timestamp = new Date().toISOString();
    const feedbackId = randomUUID();

    // Table Schema:
    // PK: "FEEDBACK#QLARIFY" (Static partition key to group all feedback)
    // SK: <Timestamp>#<UUID> (Sort key to order by time)
    const command = new PutCommand({
      TableName: "UserFeedback",
      Item: {
        PK: "FEEDBACK#QLARIFY",
        SK: `${timestamp}#${feedbackId}`,
        rating: Number(rating),
        comment: comment,
        createdAt: timestamp,
      },
    });

    await docClient.send(command);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Feedback Error:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
