import { NextResponse } from 'next/server';
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { docClient } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, overview } = body;

        if (!overview) {
            return NextResponse.json({ error: "Overview is required" }, { status: 400 });
        }

        const email = session.user.email;
        const systemId = randomUUID();
        const timestamp = new Date().toISOString();

        const productClarity = {
            overview: overview,
            personas: [],
            problems: [],
            capabilities: [],
            dataInputs: [],
            dataOutputs: [],
            externalSystems: [],
            constraints: [],
            nonFunctionalRequirements: []
        };

        const item = {
            PK: `USER#${email}`,
            SK: `SYSTEM#${systemId}`,
            id: systemId,
            type: 'system',
            status: 'clarification',
            title: title || (overview.substring(0, 30) + (overview.length > 30 ? "..." : "")),
            description: overview,
            productClarity: productClarity,
            nodes: [],
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await docClient.send(new PutCommand({
            TableName: "QlarifyCore",
            Item: item
        }));

        return NextResponse.json({ systemId });

    } catch (error: any) {
        console.error("Create System Error:", error);
        return NextResponse.json({ error: "Failed to create system" }, { status: 500 });
    }
}

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
