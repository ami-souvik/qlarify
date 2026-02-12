import { NextResponse } from "next/server";
import { ArchitectureNode, ArchitectureLevel } from "@/types/architecture";
import OpenAI from "openai";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize the DynamoDB Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { intent, level, user_input, context_node_id, current_architecture_context } = body;

    // Validate inputs
    if (!user_input) {
         return NextResponse.json({ error: "User input is required" }, { status: 400 });
    }

    const systemPrompt = `
      You are a System Architect.
      Your goal is to define a hierarchical system architecture for a software product.
      
      Output MUST be strictly valid JSON matching the 'ArchitectureNode' structure wrapped in a root object: { "architecture_node": ... }.
    `;

    // Construct Contextual Prompt based on Level
    let specificPrompt = "";

    if (level === 'product' && intent === 'generate') {
         specificPrompt = `
            Task: Create the ROOT Product Architecture for: "${user_input}".
            
            1. Identify the core Domains (Bounded Contexts).
            2. Identify external actors (Users, Clients).
            3. The 'diagram' should be a High-Level System Overview.
               - Nodes: The Product itself, External Users, and the Key Domains as sub-systems.
               - Edges: High level interactions.
            4. The 'children' array MUST contain the ArchitectureNode definitions for each identified Domain.
            
            JSON Structure:
            {
               "architecture_node": {
                  "id": "slug_id",
                  "name": "Product Name",
                  "type": "product",
                  "explanation": "Brief summary...",
                  "children": [
                     { "id": "domain_sales", "name": "Sales Domain", "type": "domain", "explanation": "...", "children": [] }
                  ],
                  "diagram": {
                     "type": "system_overview",
                     "nodes": [
                        { "id": "user", "type": "custom", "data": { "label": "User", "role": "user" }, "position": { "x": 0, "y": 0 } },
                        { "id": "domain_sales", "type": "custom", "data": { "label": "Sales Domain", "role": "service", "architecture_node_id": "domain_sales" }, "position": { "x": 100, "y": 0 } }
                     ],
                     "edges": []
                  }
               }
            }
         `;
    } else if (intent === 'zoom') {
        const parentSummary = current_architecture_context?.root_summary || "";
        const parentPath = current_architecture_context?.parent_path || [];
        
        specificPrompt = `
            Task: Zoom into the "${level}" node: "${user_input}".
            Parent Context: ${parentSummary}
            Path: ${parentPath.join(' -> ')}
            
            1. Decompose this ${level} into its components.
            2. Create the 'diagram' for THIS node.
            3. Populate 'children' with logical next-level nodes.
            
            Return the *single* target node as the root of "architecture_node".
        `;
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Stronger reasoning for architecture
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: specificPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Deterministic
    });

    const content = completion.choices[0].message.content;
    const jsonResponse = JSON.parse(content || "{}");

    // Save to DynamoDB if session exists and architecture was generated
    if (session?.user?.email && jsonResponse.architecture_node) {
        try {
            const email = session.user.email;
            const systemId = randomUUID();
            const timestamp = new Date().toISOString();
            
            const item = {
                PK: `USER#${email}`,
                SK: `SYSTEM#${systemId}`,
                id: systemId,
                type: 'system',
                title: jsonResponse.architecture_node.name || "System Architecture",
                nodes: [jsonResponse.architecture_node],
                intent: intent,
                level: level,
                userInput: user_input,
                createdAt: timestamp,
                updatedAt: timestamp
            };

            await docClient.send(new PutCommand({
                TableName: "QlarifyCore",
                Item: item
            }));

            // Add the saved ID to the response
            jsonResponse.system_id = systemId;
        } catch (dbError) {
            console.error("Failed to save architecture to DynamoDB:", dbError);
            // We don't fail the whole request if saving fails, but we log it
        }
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Architecture Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate architecture" }, { status: 500 });
  }
}
