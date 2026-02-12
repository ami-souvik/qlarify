import { NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        // Query QlarifyCore for USER#<email> and SK starts with SYSTEM#
        const architectureQuery = docClient.send(new QueryCommand({
            TableName: "QlarifyCore",
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": `USER#${email}`,
                ":sk": "SYSTEM#"
            }
        }));

        const [archRes] = await Promise.all([architectureQuery]);

        const mergedItems = [
            ...(archRes.Items || [])
        ].sort((a: any, b: any) => {
            // Sort by updatedAt descending
            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json({ 
            systems: mergedItems
        });

    } catch (error: any) {
        console.error("List Systems Error:", error);
        if (error.name === 'AccessDeniedException') {
            return NextResponse.json({ error: "Database permissions missing (Query denied)." }, { status: 403 });
        }
        return NextResponse.json({ error: "Failed to list systems" }, { status: 500 });
    }
}
