import { NextResponse } from "next/server";
import { GeminiStudioClient } from "@/lib/ai/gemini-client";
import { ParallelSearchClient } from "@/lib/parallel/client";
import { ModelFallbackManager } from "@/lib/ai/fallback-chain";

export const dynamic = "force-dynamic";

export async function GET() {
  const geminiClient = new GeminiStudioClient();
  const parallelClient = new ParallelSearchClient();
  const fallbackManager = new ModelFallbackManager();
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
    partnerIntegration: {
      provider: "Parallel Search API (v1beta/search)",
      isConfigured: parallelClient.isConfigured(),
      runtimeMode: "REST Client (Zero 3rd-party AI frameworks)",
    },
  });
}
