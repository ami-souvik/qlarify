
import { PromptManager } from './lib/ai/PromptManager';
import { McpServer } from './lib/ai/McpServer';

async function verify() {
    console.log("Starting Edge Refactoring Verification...");

    // 1. Verify Prompt Manager (Now uses constants, no FS)
    console.log("\n[1] Testing PromptManager (Edge Mode)...");
    try {
        const pm = new PromptManager();
        const variables = {
            USER_REQUEST: "Analyze this project security.",
            PROJECT_CONTEXT: "{ \"type\": \"Next.js\" }"
        };
        // Note: The key is now without .txt in our constants map, but PromptManager handles fallback
        const prompt = await pm.loadPrompt('analyze-project', variables);
        
        if (prompt.includes("Analyze this project security") && prompt.includes("Next.js") && prompt.includes("<security>")) {
            console.log("✅ Prompt loaded from constants, variables interpolated, and includes resolved.");
        } else {
            console.error("❌ Prompt verification failed. Content snippet:", prompt.slice(0, 100));
        }
    } catch (e) {
        console.error("❌ PromptManager Error:", e);
    }

    // 2. Verify MCP Server (No FS write)
    console.log("\n[2] Testing McpServer (Edge Mode)...");
    try {
        const mcp = new McpServer();
        // Test save_artifact
        const result = await mcp.executeTool('save_artifact', {
            filename: 'test_artifact.txt',
            content: 'Hello World from Edge Verification',
            type: 'report'
        });
        
        // Expecting a structured return, NOT a file write
        if (result.success && result.artifact && result.artifact.content === 'Hello World from Edge Verification') {
            console.log("✅ Tool 'save_artifact' returned content correctly (Edge safe).");
        } else {
            console.error("❌ Tool execution failed. Expected content return, got:", result);
        }

        // Test Propose Clarity Update (Logic check)
        const proposalResult = await mcp.executeTool('propose_clarity_update', {
            section: "personas",
            changes: { add: ["Admin"] },
            confidence: "high",
            reasoning_summary: "Adding admin persona"
        });

        if (proposalResult.status === "proposal_created" && proposalResult.proposal.section === "personas") {
             console.log("✅ Tool 'propose_clarity_update' logic verified.");
        } else {
             console.error("❌ Tool 'propose_clarity_update' failed:", proposalResult);
        }

    } catch (e) {
        console.error("❌ McpServer Error:", e);
    }
}

verify();
