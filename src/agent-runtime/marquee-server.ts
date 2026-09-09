import http from "node:http";
import { MarqueeAgent } from "../lib/agents/marquee";
import {
  parseAgentRuntimeRequest,
  AgentRuntimeRequestValidationError,
  SUPPORTED_CLASS_METHODS,
} from "./schema";

const PORT = parseInt(process.env.AIP_HTTP_PORT || process.env.PORT || "8080", 10);
const HEALTH_ROUTE = process.env.AIP_HEALTH_ROUTE || "/health";
const PREDICT_ROUTE = process.env.AIP_PREDICT_ROUTE || "/predict";

export const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  const method = req.method || "GET";

  // Health check routes (AIP_HEALTH_ROUTE, /health, /livez, /)
  if (method === "GET" && (url === HEALTH_ROUTE || url === "/health" || url === "/livez" || url === "/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "backlot-marquee-agent-runtime",
        contract: "Vertex AI Agent Runtime (BYOC)",
        supportedMethods: Array.from(SUPPORTED_CLASS_METHODS),
        port: PORT,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Reasoning Engine Unary / Predict / Query Routes
  const isExecutionRoute =
    method === "POST" &&
    (url === "/api/reasoning_engine" ||
      url === PREDICT_ROUTE ||
      url === "/predict" ||
      url === "/query" ||
      url === "/");

  if (!isExecutionRoute) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Not found: ${method} ${url}` }));
    return;
  }

  const startTime = Date.now();
  const headerRunId = (req.headers["x-backlot-run-id"] as string) || "";
  let activeRunId = headerRunId;

  try {
    let bodyText = "";
    for await (const chunk of req) {
      bodyText += chunk;
    }

    let rawBody: unknown = {};
    if (bodyText.trim()) {
      try {
        rawBody = JSON.parse(bodyText);
      } catch (jsonErr) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: {
              code: "INVALID_ARGUMENT",
              message: `Malformed JSON request body: ${String(jsonErr)}`,
              runId: headerRunId,
            },
          })
        );
        return;
      }
    }

    // Strict schema validation and method check
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

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        output: {
          runId: activeRunId,
          pitchKit: result.pitchKit,
          modelUsed: result.modelUsed,
          durationMs,
          observedMetadata,
          logs,
        },
      })
    );
  } catch (err) {
    const durationMs = Date.now() - startTime;

    if (err instanceof AgentRuntimeRequestValidationError) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: {
            code: err.code,
            message: err.message,
            runId: err.runId || activeRunId,
            details: err.details,
          },
        })
      );
      return;
    }

    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[AgentRuntime:${activeRunId}] Fatal error:`, errorMessage);

    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: {
          code: "AGENT_RUNTIME_EXECUTION_FAILED",
          message: errorMessage,
          runId: activeRunId,
          durationMs,
        },
      })
    );
  }
});

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Backlot Agent Runtime] Server listening on 0.0.0.0:${PORT} (Health: ${HEALTH_ROUTE}, Predict: ${PREDICT_ROUTE}, Unary: /api/reasoning_engine)`
    );
  });
}
