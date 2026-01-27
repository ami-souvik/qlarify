
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

// Initialize DynamoDB Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Mock response for standalone testing without API keys
const MOCK_RESPONSE = {
  diagram_type: "flow",
  layout: "left-to-right",
  nodes: [
    { id: "user", label: "User", role: "user" },
    { id: "frontend", label: "Frontend App", role: "client" },
    { id: "api", label: "Backend API", role: "service" },
    { id: "db", label: "Database", role: "database" }
  ],
  edges: [
    { from: "user", to: "frontend", label: "clicks button" },
    { from: "frontend", to: "api", label: "POST /data" },
    { from: "api", to: "db", label: "INSERT" },
    { from: "db", to: "api", label: "confirm" },
    { from: "api", to: "frontend", label: "200 OK" }
  ]
};

const SYSTEM_PROMPT = `
You are a diagram generator. Output strictly valid JSON.
Extract nodes (id, label, role) and edges (from, to, label) from the description.
Roles: user, client, service, database, queue, external.
Layout: left-to-right or top-down.
`;

async function logRequestToDB(prompt: string, response: any, llmData: any) {
    try {
        const timestamp = new Date().toISOString();
        const requestId = randomUUID();
        
        const command = new PutCommand({
            TableName: "UserRequest",
            Item: {
                PK: "REQUEST#QLARIFY",
                SK: `${timestamp}#${requestId}`,
                prompt: prompt,
                response: response,
                llmData: llmData,
                createdAt: timestamp,
            },
        });

        await docClient.send(command);
    } catch (error) {
        console.error("Failed to log request to DynamoDB:", error);
    }
}

export async function POST(req: Request) {
  try {
    const { description, history, lockedNodes, currentNodes } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    let responseData;
    let llmData;

    // Construct the Context-Aware Prompt on the Server
    let fullPrompt = `Task: Update or Generate Diagram.\n\n`;

    // Add History Context
    if (history && Array.isArray(history) && history.length > 0) {
      fullPrompt += `--- History ---\n`;
      history.forEach((item: any) => {
        if (item.type === 'user') fullPrompt += `User: ${item.content}\n`;
      });
      fullPrompt += `\n`;
    }

    // Add Current Graph Context
    if (currentNodes && Array.isArray(currentNodes) && currentNodes.length > 0) {
        fullPrompt += `--- CURRENT DIAGRAM STATE ---\n`;
        fullPrompt += `The following nodes already exist:\n`;
        currentNodes.forEach((n: any) => {
            fullPrompt += `- ID: ${n.id} (Label: "${n.data.label}", Role: ${n.data.role}, Locked: ${n.data.locked || false})\n`;
        });
        fullPrompt += `\nINSTRUCTIONS FOR UPDATE:\n`;
        fullPrompt += `1. **Preserve Existing Nodes**: Unless the user EXPLICITLY asks to remove them, keep existing nodes.\n`;
        fullPrompt += `2. **Uses Existing IDs**: If you are referring to an existing node, MUST use its exact ID.\n`;
        fullPrompt += `3. **Add New Nodes**: Only add new nodes if they are necessary for the request.\n`;
        fullPrompt += `4. **Remove Nodes**: Only if explicitly requested.\n\n`;
    }

    // Add Locked Nodes Context (Reinforcement)
    if (lockedNodes && Array.isArray(lockedNodes) && lockedNodes.length > 0) {
      const lockedNodeDesc = lockedNodes.map((n: any) => `ID: ${n.id}, Label: ${n.data.label}`).join('\n');
      fullPrompt += `--- CRITICAL: LOCKED NODES ---\nThese nodes are LOCKED by the user. You MUST include them in your response with the EXACT same IDs. Do not rename or remove:\n${lockedNodeDesc}\n\n`;
    }

    fullPrompt += `--- New Request ---\nUser: ${description}`;

    if (!apiKey) {
      console.log("No OpenAI API key found. Returning mock data.");
      responseData = MOCK_RESPONSE;
    } else {
      const client = new OpenAI({ apiKey });
      const modelName = process.env.MODEL_NAME || "gpt-4o-mini";

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: fullPrompt } // Use the constructed prompt
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      });

      const content = completion.choices[0].message.content;
      responseData = JSON.parse(content || '{}');
      llmData = {
        id: completion.id,
        object: completion.object,
        model: completion.model,
        usage: completion.usage
      }
    }
    
    // Log to DynamoDB (fire and forget or await? Safe to await to ensure auditing)
    await logRequestToDB(description, responseData, llmData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("LLM Error:", error);
    return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 });
  }
}

