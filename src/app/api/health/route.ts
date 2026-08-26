import { NextResponse } from "next/server";
import { GeminiStudioClient } from "@/lib/ai/gemini-client";
import { ParallelSearchClient } from "@/lib/parallel/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const geminiClient = new GeminiStudioClient();
  const parallelClient = new ParallelSearchClient();
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
      models: {
        reasoning: "gemini-2.5-flash -> gemini-2.5-pro -> gemini-2.5-flash-lite",
        fast: "gemini-2.5-flash-lite -> gemini-2.5-flash",
      },
    },
    partnerIntegration: {
      provider: "Parallel Search API (v1beta/search)",
      isConfigured: parallelClient.isConfigured(),
      runtimeMode: "REST Client (Zero 3rd-party AI frameworks)",
    },
  });
}
