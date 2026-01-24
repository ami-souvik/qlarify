
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.log("No OpenAI API key found. Returning mock data.");
      return NextResponse.json(MOCK_RESPONSE);
    }

    const client = new OpenAI({ apiKey });
    const modelName = process.env.MODEL_NAME || "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Description: ${description}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = completion.choices[0].message.content;
    const data = JSON.parse(content || '{}');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error("LLM Error:", error);
    return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 });
  }
}
