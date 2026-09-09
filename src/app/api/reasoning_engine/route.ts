import { NextRequest, NextResponse } from "next/server";
import { MarqueeAgent } from "@/lib/agents/marquee";
import {
  parseAgentRuntimeRequest,
  AgentRuntimeRequestValidationError,
  SUPPORTED_CLASS_METHODS,
} from "@/agent-runtime/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    engine: "Backlot Marquee Agent Runtime",
    contract: "Vertex AI Reasoning Engine BYOC Unary Route (/api/reasoning_engine)",
    supportedMethods: Array.from(SUPPORTED_CLASS_METHODS),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const headerRunId = req.headers.get("x-backlot-run-id") || "";
  let activeRunId = headerRunId;

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsedRequest = parseAgentRuntimeRequest(rawBody, headerRunId);
    activeRunId = parsedRequest.runId;

    const logs: Array<{ level: string; message: string; timestamp: string }> = [];
    const onLog = (level: "info" | "warn" | "error", message: string) => {
      logs.push({ level, message, timestamp: new Date().toISOString() });
      if (level === "error") {
        console.error(`[AgentRuntime:${activeRunId}] ${message}`);
      } else if (level === "warn") {
        console.warn(`[AgentRuntime:${activeRunId}] ${message}`);
      } else {
        console.log(`[AgentRuntime:${activeRunId}] ${message}`);
      }
    };

    onLog(
      "info",
      `Executing managed Marquee method "${parsedRequest.classMethod}" for "${parsedRequest.scriptParse.title}" (runId: ${activeRunId})...`
    );

    const marqueeAgent = new MarqueeAgent();
    const result = await marqueeAgent.generatePitchKit(
      parsedRequest.scriptParse,
      parsedRequest.coverage,
      parsedRequest.budget,
      parsedRequest.breakdown,
      {
        schedule: parsedRequest.schedule,
        onLog,
      }
    );

    const durationMs = Date.now() - startTime;
    const observedMetadata = {
      provider: "google-genai",
      modelConfigured: process.env.MODEL_FAST_OVERRIDE || "gemini-3.8-flash",
      modelObserved: result.modelUsed,
      durationMs,
      marketEvidenceCount: result.pitchKit.marketEvidence.length,
      hasProductionRecommendation: Boolean(result.pitchKit.productionRecommendation),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      output: {
        runId: activeRunId,
        pitchKit: result.pitchKit,
        modelUsed: result.modelUsed,
        durationMs,
        observedMetadata,
        logs,
      },
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;

    if (err instanceof AgentRuntimeRequestValidationError) {
      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
            runId: err.runId || activeRunId,
            details: err.details,
          },
        },
        { status: 400 }
      );
    }

    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[AgentRuntime:${activeRunId}] Fatal error:`, errorMessage);

    return NextResponse.json(
      {
        error: {
          code: "AGENT_RUNTIME_EXECUTION_FAILED",
          message: errorMessage,
          runId: activeRunId,
          durationMs,
        },
      },
      { status: 500 }
    );
  }
}
