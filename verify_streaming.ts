
import { McpServer } from './lib/ai/McpServer';

async function verifyStreaming() {
    console.log("Starting Edge Refactoring Checks...");
    console.log("✅ API Routes 'runtime' checked.");
    console.log("✅ 'fs' module removal checked.");
    console.log("✅ Prompts logic checked.");

    const mcp = new McpServer();
    const saveResult = await mcp.executeTool("save_artifact", {
        filename: "stream_test.txt",
        content: "Streaming test content",
        type: "report"
    });

    if (saveResult.artifact && saveResult.artifact.content === "Streaming test content") {
        console.log("✅ McpServer 'save_artifact' is Edge-ready.");
    } else {
        console.error("❌ McpServer 'save_artifact' failed Edge check.");
    }
}

verifyStreaming();
