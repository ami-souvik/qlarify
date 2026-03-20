import { NextResponse } from "next/server";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/db";
import { publishEvent } from "@/lib/publishEvent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;
        
        if (!userEmail) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const body = await req.json();
        const { event, payload, system_id, session_id } = body;

        if (!system_id) {
            return new Response(JSON.stringify({ error: "System ID is required" }), { status: 400 });
        }

        // Save User Message synchronously before streaming
        const lastUserMessage = { role: 'user' as const, content: payload.content };
        await docClient.send(new UpdateCommand({
            TableName: "QlarifyCore",
            Key: { PK: `USER#${userEmail}`, SK: `SYSTEM#${system_id}` },
            UpdateExpression: "SET messages = list_append(if_not_exists(messages, :empty_list), :msg)",
            ExpressionAttributeValues: {
                ":msg": [{ ...lastUserMessage, timestamp: Date.now() }],
                ":empty_list": []
            },
            ReturnValues: "ALL_NEW"
        }));

        await publishEvent({
            event,
            payload,
            system_id,
            user_id: userEmail,
            session_id
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to publish event:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
