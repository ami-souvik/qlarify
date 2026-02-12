import { NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const email = session.user.email;

        const command = new GetCommand({
            TableName: "QlarifyCore",
            Key: {
                PK: `USER#${email}`,
                SK: `SYSTEM#${id}`
            }
        });

        const response = await docClient.send(command);

        if (!response.Item) {
            return NextResponse.json({ error: "System not found" }, { status: 404 });
        }

        return NextResponse.json({ system: response.Item });

    } catch (error: any) {
        console.error("Get System Error:", error);
        return NextResponse.json({ error: "Failed to fetch system" }, { status: 500 });
    }
}
