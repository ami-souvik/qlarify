import { NextResponse } from 'next/server';
import { GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { docClient } from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
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

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const email = session.user.email;

        const command = new DeleteCommand({
            TableName: "QlarifyCore",
            Key: {
                PK: `USER#${email}`,
                SK: `SYSTEM#${id}`
            }
        });

        await docClient.send(command);

        return NextResponse.json({ success: true, message: "System deleted successfully" });

    } catch (error: any) {
        console.error("Delete System Error:", error);
        return NextResponse.json({ error: "Failed to delete system" }, { status: 500 });
    }
}
