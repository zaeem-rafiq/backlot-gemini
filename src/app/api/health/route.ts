import { NextResponse } from "next/server";
import { GeminiStudioClient } from "@/lib/ai/gemini-client";
import { ParallelSearchClient } from "@/lib/parallel/client";
import { ModelFallbackManager } from "@/lib/ai/fallback-chain";
import { AgentRuntimeMarqueeClient } from "@/lib/agents/agent-runtime-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const geminiClient = new GeminiStudioClient();
  const parallelClient = new ParallelSearchClient();
  const fallbackManager = new ModelFallbackManager();
  const runtimeClient = new AgentRuntimeMarqueeClient();
  const backendInfo = geminiClient.getBackendInfo();

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    aiRuntime: {
      platform: backendInfo.backend,
      endpoint: backendInfo.endpoint,
      auth: backendInfo.authMechanism,
      project: backendInfo.project || "N/A",
      location: backendInfo.location || "N/A",
      imageGenerationAvailable: backendInfo.imageGenerationAvailable,
      activeModelChains: {
        reasoning: fallbackManager.getCandidateModels("reasoning"),
        fast: fallbackManager.getCandidateModels("fast"),
        image: fallbackManager.getCandidateModels("image"),
      },
    },
    agentRuntime: {
      managedStage: "Marquee (Market Research & Pitch Kit Packaging)",
      isConfigured: runtimeClient.isConfigured(),
      endpoint: runtimeClient.getEndpoint() || "Self-Hosted Agent Runtime Container (/api/reasoning_engine)",
      contract: "Vertex AI Reasoning Engine BYOC Unary Route (/api/reasoning_engine)",
    },
    partnerIntegration: {
      provider: "Parallel Search API (v1beta/search)",
      isConfigured: parallelClient.isConfigured(),
      runtimeMode: "REST Client (Zero 3rd-party AI frameworks)",
    },
  });
}
